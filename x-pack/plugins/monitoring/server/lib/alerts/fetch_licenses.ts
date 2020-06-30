/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */
import { get } from 'lodash';
import { AlertLicense, AlertCluster } from '../../alerts/types';

export async function fetchLicenses(
  callCluster: any,
  clusters: AlertCluster[],
  index: string,
  size: number
): Promise<AlertLicense[]> {
  const params = {
    index,
    filterPath: [
      'hits.hits._source.license.*',
      'hits.hits._source.cluster_uuid',
      'hits.hits._index',
    ],
    body: {
      size,
      sort: [{ timestamp: { order: 'desc' } }],
      query: {
        bool: {
          filter: [
            {
              terms: {
                cluster_uuid: clusters.map((cluster) => cluster.clusterUuid),
              },
            },
            {
              term: {
                type: 'cluster_stats',
              },
            },
            {
              range: {
                timestamp: {
                  gte: 'now-2m',
                },
              },
            },
          ],
        },
      },
      collapse: {
        field: 'cluster_uuid',
      },
    },
  };

  const response = await callCluster('search', params);
  return get<any>(response, 'hits.hits', []).map((hit: any) => {
    const rawLicense: any = get(hit, '_source.license', {});
    const license: AlertLicense = {
      status: rawLicense.status,
      type: rawLicense.type,
      expiryDateMS: rawLicense.expiry_date_in_millis,
      clusterUuid: get(hit, '_source.cluster_uuid'),
      ccs: get(hit, '_index'),
    };
    return license;
  });
}
