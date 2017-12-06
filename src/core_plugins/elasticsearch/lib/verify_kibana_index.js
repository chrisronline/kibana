import {
  getTypes,
  getRootType,
} from '../../../server/mappings';

import { verifyTypeIsKeyword } from './kibana_index_verifications/verify_type_is_keyword';

/**
 *  Checks for critical failures in the .kibana index
 *  and fails startup if they exist.
 *
 *  @param  {Object} options
 *  @property {Function} options.log
 *  @property {string} options.indexName
 *  @property {Function} options.callCluster
 *  @property {EsMappingsDsl} options.kibanaIndexMappingsDsl
 *  @return {Promise<undefined>}
 */
export async function verifyKibanaIndex(options) {
  const {
    // log,
    indexName,
    callCluster,
    kibanaIndexMappingsDsl
  } = options;

  const rootEsType = getRootType(kibanaIndexMappingsDsl);
  const currentMappingsDsl = await getCurrentMappings(callCluster, indexName, rootEsType);

  // patchKibanaIndex() should do nothing if there are no current mappings
  if (!currentMappingsDsl) {
    return;
  }

  const context = {
    ...options,
    currentMappingsDsl,
    rootEsType,
  };

  const verifications = [
    verifyTypeIsKeyword,
  ];

  for (const verification of verifications) {
    await verification.verify(context);
  }
}

/**
 *  Get the mappings dsl for the current Kibana index if it exists
 *  @param  {Function} callCluster
 *  @param  {string} indexName
 *  @param  {string} rootEsType
 *  @return {EsMappingsDsl|undefined}
 */
async function getCurrentMappings(callCluster, indexName, rootEsType) {
  const response = await callCluster('indices.get', {
    index: indexName,
    feature: '_mappings',
    ignore: [404],
  });

  if (response.status === 404) {
    return undefined;
  }

  // could be different if aliases were resolved by `indices.get`
  const resolvedName = Object.keys(response)[0];
  const currentMappingsDsl = response[resolvedName].mappings;
  const currentTypes = getTypes(currentMappingsDsl);

  const isV5Index = currentTypes.length > 1 || currentTypes[0] !== rootEsType;
  if (isV5Index) {
    throw new Error(
      'Your Kibana index is out of date, reset it or use the X-Pack upgrade assistant.'
    );
  }

  return currentMappingsDsl;
}
