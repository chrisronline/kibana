/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */
import { get } from 'lodash';
import { LegacyAlert, AlertCluster } from '../../alerts/types';

export async function fetchLegacyAlerts(
  callCluster: any,
  clusters: AlertCluster[],
  index: string,
  watchName: string
): Promise<LegacyAlert[]> {
  const params = {
    index,
    filterPath: [
      'hits.hits._source.prefix',
      'hits.hits._source.message',
      'hits.hits._source.metadata.severity',
      'hits.hits._source.metadata.cluster_uuid',
    ],
    body: {
      size: 1,
      sort: [
        {
          timestamp: {
            order: 'desc',
          },
        },
      ],
      query: {
        bool: {
          minimum_should_match: 1,
          filter: [
            {
              terms: {
                'metadata.cluster_uuid': clusters.map((cluster) => cluster.clusterUuid),
              },
            },
            {
              term: {
                'metadata.watch': watchName,
              },
            },
          ],
          should: [
            {
              range: {
                timestamp: {
                  gte: 'now-2m',
                },
              },
            },
            {
              bool: {
                must_not: {
                  exists: {
                    field: 'resolved_timestamp',
                  },
                },
              },
            },
          ],
        },
      },
    },
  };

  const response = await callCluster('search', params);
  return get(response, 'hits.hits', []).map((hit: any) => {
    const legacyAlert: LegacyAlert = {
      prefix: get(hit, '_source.prefix'),
      message: get(hit, '_source.message'),
      metadata: get(hit, '_source.metadata'),
    };
    return legacyAlert;
  });
}
