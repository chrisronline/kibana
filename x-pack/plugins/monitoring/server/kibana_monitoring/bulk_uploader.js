/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { uniq } from 'lodash';
import {
  SavedObjectsClient,
  SavedObjectsRepositoryProvider,
} from '../../../../../src/server/saved_objects';
import { callClusterFactory } from '../../../xpack_main';
import {
  LOGGING_TAG,
  KIBANA_MONITORING_LOGGING_TAG,
} from '../../common/constants';
import {
  sendBulkPayload,
  monitoringBulk,
} from './lib';

const LOGGING_TAGS = [LOGGING_TAG, KIBANA_MONITORING_LOGGING_TAG];

/*
 * Handles internal Kibana stats collection and uploading data to Monitoring
 * bulk endpoint.
 *
 * NOTE: internal collection will be removed in 7.0
 *
 * Depends on
 *   - 'xpack.monitoring.kibana.collection.enabled' config
 *   - monitoring enabled in ES (checked against xpack_main.info license info change)
 * The dependencies are handled upstream
 * - Ops Events - essentially Kibana's /api/status
 * - Usage Stats - essentially Kibana's /api/stats
 * - Kibana Settings - select uiSettings
 * @param {Object} server HapiJS server instance
 * @param {Object} xpackInfo server.plugins.xpack_main.info object
 */
export class BulkUploader {
  constructor(server, { interval }) {
    if (typeof interval !== 'number') {
      throw new Error('interval number of milliseconds is required');
    }

    this._timer =  null;
    this._interval = interval;
    this._log = {
      debug: message => server.log(['debug', ...LOGGING_TAGS], message),
      info: message => server.log(['info', ...LOGGING_TAGS], message),
      warn: message => server.log(['warning', ...LOGGING_TAGS], message)
    };

    this._client = server.plugins.elasticsearch.getCluster('admin').createClient({
      plugins: [monitoringBulk],
    });

    const callClusterInternal = callClusterFactory(server).getCallClusterInternal();
    this._callClusterInternal = callClusterInternal;

    const repositoryProvider = new SavedObjectsRepositoryProvider({
      index: server.config().get('kibana.index'),
      mappings: server.getKibanaIndexMappingsDsl(),
    });
    const repository = repositoryProvider.getRepository(callClusterInternal);
    this._savedObjectsClient = new SavedObjectsClient(repository);
  }

  /*
   * Start the interval timer
   * @param {CollectorSet} collectorSet object to use for initial the fetch/upload and fetch/uploading on interval
   * @return undefined
   */
  start(collectorSet) {
    this._log.info('Starting monitoring stats collection');

    // filter out API-only collectors
    const filterThem = _collectorSet => _collectorSet.getFilteredCollectorSet(c => c.internalIgnore !== true);
    this._fetchAndUpload(filterThem(collectorSet)); // initial fetch
    this._timer = setInterval(() => {
      this._fetchAndUpload(filterThem(collectorSet));
    }, this._interval);
  }

  /*
   * start() and stop() are lifecycle event handlers for
   * xpackMainPlugin license changes
   * @param {String} logPrefix help give context to the reason for stopping
   */
  stop(logPrefix) {
    clearInterval(this._timer);
    this._timer = null;

    const prefix = logPrefix ? logPrefix + ':' : '';
    this._log.info(prefix + 'Monitoring stats collection is stopped');
  }

  handleNotEnabled() {
    this.stop('Monitoring status upload endpoint is not enabled in Elasticsearch');
  }
  handleConnectionLost() {
    this.stop('Connection issue detected');
  }

  /*
   * @param {CollectorSet} collectorSet
   * @return {Promise} - resolves to undefined
   */
  async _fetchAndUpload(collectorSet) {
    const data = await collectorSet.bulkFetch({
      callCluster: this._callClusterInternal,
      savedObjectsClient: this._savedObjectsClient,
    });
    const payload = BulkUploader.getCollectedData(data, collectorSet);

    if (payload) {
      try {
        this._log.debug(`Uploading bulk stats payload to the local cluster`);
        this._onPayload(payload);
      } catch (err) {
        this._log.warn(err.stack);
        this._log.warn(`Unable to bulk upload the stats payload to the local cluster`);
      }
    } else {
      this._log.debug(`Skipping bulk uploading of an empty stats payload`);
    }
  }

  _onPayload(payload) {
    return sendBulkPayload(this._client, this._interval, payload);
  }

  /*
   * Bulk stats are transformed into a bulk upload format
   * Non-legacy transformation is done in CollectorSet.toApiStats
   */
  static getCollectedData(uploadData, collectorSet) {

    const fromCollector = collectorSet.bulkFormat(uploadData);
    const deepMergeAndGroup = fromCollector.reduce((accum, datas) => {
      for (const { type, payload } of datas) {
        accum[type] = accum[type] || {};
        for (const key in payload) {
          if (typeof accum[type][key] === 'object') {
            accum[type][key] = {
              ...accum[type][key],
              ...payload[key]
            };
          } else {
            accum[type][key] = payload[key];
          }
        }
      }
      return accum;
    }, {});

    const types = Object.keys(deepMergeAndGroup);
    if (types) {
      return types.reduce((accum, type) => {
        return [
          ...accum,
          { index: { _type: type } },
          deepMergeAndGroup[type],
        ];
      }, []);
    }
  }

  static checkPayloadTypesUnique(payload) {
    const ids = payload.map(item => item[0].index._type);
    const uniques = uniq(ids);
    if (ids.length !== uniques.length) {
      throw new Error('Duplicate collector type identifiers found in payload! ' + ids.join(','));
    }
  }

  static combineStatsLegacy() {
    throw new Error('This is deprecated');
  }
}
