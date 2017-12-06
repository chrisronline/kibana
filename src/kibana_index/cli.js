// import { resolve } from 'path';
import { Command } from 'commander';
import inquirer from 'inquirer';
import elasticsearch from 'elasticsearch';
import { version } from '../../package.json';
import { createToolingLog } from '../dev';
import { verifyTypeIsKeyword } from '../core_plugins/elasticsearch/lib/kibana_index_verifications/verify_type_is_keyword';
import {
  getRootType,
} from '../server/mappings';

const cmd = new Command('node scripts/update_kibana_index');
// const resolveConfigPath = v => resolve(process.cwd(), v);

cmd
  .option('--indexName [indexName]', 'Name of the .kibana index', '.kibana')
  .option('--esHost [esHost]', 'Host:port for the running ES instance containing the .kibana index', 'localhost:9200')
  .option('--auth [auth]', 'Authorization for the ES cluster', '')
  .option('--verbose', 'Log everything', false)
  .option('--quiet', 'Only log errors', false)
  .option('--silent', 'Log nothing', false)
  .option('--debug', 'Run in debug mode', false)
  .parse(process.argv);

let logLevel = 'info';
if (cmd.silent) logLevel = 'silent';
if (cmd.quiet) logLevel = 'error';
if (cmd.debug) logLevel = 'debug';
if (cmd.verbose) logLevel = 'verbose';

const log = createToolingLog(logLevel);
log.pipe(process.stdout);

const indexName = cmd.indexName;
const client = new elasticsearch.Client({
  host: cmd.esHost,
  log: logLevel,
  httpAuth: cmd.auth,
});


const verifications = [
  verifyTypeIsKeyword,
];

async function run() {
  try {
    client.ping();

    // Lock the index
    await client.indices.putSettings({
      index: indexName,
      body: {
        'index.blocks.write': true,
      },
    });

    const currentMappingsDsl = await getCurrentMappings(client, indexName);
    const rootEsType = getRootType(currentMappingsDsl);
    const context = {
      currentMappingsDsl,
      rootEsType,
    };

    let newMappingsDsl = { ...currentMappingsDsl };
    for (const verification of verifications) {
      try {
        await verification.verify(context);
      } catch (e) {
        // The error is still there, let's fix it
        newMappingsDsl  = await verification.changeMappings({
          rootEsType,
          newMappingsDsl,
        });
      }
    }

    // Create the new index name
    let newIndexName = `${indexName}-${version}`;

    // Verify it does not exist
    let exists = true;
    while (exists) {
      try {
        await client.indices.get({
          index: newIndexName,
        });

        const answer = await inquirer.prompt([{
          name: 'newIndexName',
          message: `The index ${newIndexName} already exists. Please input a new index name to use:`
        }]);

        newIndexName = answer.newIndexName;
      } catch (e) {
        exists = false;
      }
    }


    // Create the index, with the mappings
    await client.indices.create({
      index: newIndexName,
      body: {
        mappings: newMappingsDsl,
      },
    });

    // Reindex
    try {
      await client.reindex({
        body: {
          source: {
            index: indexName,
          },
          dest: {
            index: newIndexName,
          }
        }
      });
    }
    catch (e) {
      console.error('Reindex failed, rolling back', e);
      await client.indices.delete({ index: newIndexName });
    }

    // console.log(JSON.stringify(newMappingsDsl));
  } catch (err) {
    await teardown(err);
  } finally {
    await teardown();
  }
}

async function teardown(err) {
  if (err) {
    console.error(err);
    return;
  }
  console.log('Fin.');
}


process.on('unhandledRejection', err => teardown(err));
process.on('SIGTERM', () => teardown());
process.on('SIGINT', () => teardown());
run();


async function getCurrentMappings(client, indexName) {
  const response = await client.indices.get({
    index: indexName,
    feature: '_mappings',
    ignore: [404],
  });

  if (response.status === 404) {
    return undefined;
  }

  // could be different if aliases were resolved by `indices.get`
  const resolvedName = Object.keys(response)[0];
  return response[resolvedName].mappings;
}
