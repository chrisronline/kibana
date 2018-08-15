/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { checkParam } from '../error_missing_required';
import { get } from 'lodash';
import { BeatsClusterMetric } from '../metrics';
import { createApmQuery } from './create_apm_query';
import {
  apmAggFilterPath,
  apmUuidsAgg,
  apmAggResponseHandler,
} from './_apm_stats';

export function handleResponse(clusterUuid, response) {
  const { beatTotal, beatTypes, totalEvents, bytesSent } = apmAggResponseHandler(response);

  // combine stats
  const stats = {
    totalEvents,
    bytesSent,
    beats: {
      total: beatTotal,
      types: beatTypes,
    }
  };

  return {
    clusterUuid,
    stats,
  };
}

export function getApmsForClusters(req, apmIndexPattern, clusters) {
  checkParam(apmIndexPattern, 'apmIndexPattern in apm/getApmForClusters');

  const start = req.payload.timeRange.min;
  const end = req.payload.timeRange.max;
  const config = req.server.config();
  const maxBucketSize = config.get('xpack.monitoring.max_bucket_size');

  return Promise.all(clusters.map(async cluster => {
    const clusterUuid = cluster.cluster_uuid;
    const params = {
      index: apmIndexPattern,
      size: 0,
      ignoreUnavailable: true,
      filterPath: apmAggFilterPath,
      body: {
        query: createApmQuery({
          start,
          end,
          clusterUuid,
          metric: BeatsClusterMetric.getMetricFields() // override default of BeatMetric.getMetricFields
        }),
        aggs: apmUuidsAgg(maxBucketSize)
      }
    };

    // console.log('query', JSON.stringify(params.body));

    const { callWithRequest } = req.server.plugins.elasticsearch.getCluster('monitoring');
    const response = await callWithRequest(req, 'search', params);
    const formattedResponse = handleResponse(clusterUuid, response);

    // Fetch additional information
    const req2 = {
      index: apmIndexPattern,
      size: 0,
      ignoreUnavailable: true,
      // filterPath: apmAggFilterPath,
      body: {
        query: createApmQuery({
          start,
          end,
          clusterUuid,
          metric: BeatsClusterMetric.getMetricFields() // override default of BeatMetric.getMetricFields
        }),
        aggs: {
          acked_events: {
            filter: {
              range: {
                'beats_stats.metrics.libbeat.output.events.acked': {
                  gt: 0,
                }
              }
            },
            aggs: {
              max_timestamp: {
                max: {
                  field: 'timestamp'
                }
              }
            }
          }
        }
      }
    };

    const response2 = await callWithRequest(req, 'search', req2);

    return {
      ...formattedResponse,
      stats: {
        ...formattedResponse.stats,
        timeOfLastEvent: get(response2, 'aggregations.acked_events.max_timestamp.value')
      }
    };
  }));
}
