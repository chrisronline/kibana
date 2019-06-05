/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import Promise from 'bluebird';
import { contains, get } from 'lodash';
import { checkParam } from '../error_missing_required';
import { createQuery } from '../create_query';
import { WATCHER_SUPPORTED_LICENSES } from '../../../common/constants';


function handleResponse(response) {
  const hits = get(response, 'hits.hits', []);
  return hits.map(hit => ({
    ...get(hit, '_source'),
    id: hit._id,
  }));
}

export function getStackAlerts(req) {
  const config = req.server.config();
  const maxBucketSize = config.get('xpack.monitoring.max_bucket_size');
  const clusterUuid = req.params.clusterUuid;
  const params = {
    index: '.watches',
    size: maxBucketSize,
    ignoreUnavailable: true,
    body: {
      query: {
        term: {
          'metadata.xpack.cluster_uuid.keyword': clusterUuid,
        }
      }
    }
  };

  const { callWithRequest } = req.server.plugins.elasticsearch.getCluster('monitoring');
  return callWithRequest(req, 'search', params)
    .then(handleResponse);
}

export async function getStackAlertsForCluster(req, cluster) {
  const config = req.server.config();
  const license = get(cluster, 'license', {});
  const maxBucketSize = config.get('xpack.monitoring.max_bucket_size');

  if (license.status === 'active' && contains(WATCHER_SUPPORTED_LICENSES, license.type)) {
    const clusterUuid = req.params.clusterUuid;
    const params = {
      index: '.watches',
      size: maxBucketSize,
      ignoreUnavailable: true,
      filterPath: [
        'hits.hits._source.status'
      ],
      body: {
        query: {
          term: {
            'metadata.xpack.cluster_uuid.keyword': clusterUuid,
          }
        }
      }
    };

    const { callWithRequest } = req.server.plugins.elasticsearch.getCluster('monitoring');
    const response = await callWithRequest(req, 'search', params);
    const alerts = get(response, 'hits.hits', []);

    const totalCount = alerts.length;
    const activeCount = alerts.filter(alert => get(alert, '_source.status.state.active') === true).length;

    return {
      totalCount,
      activeCount,
      inactiveCount: totalCount - activeCount,
    };
  }

  return Promise.resolve(null);
}

export async function deactivateStackAlert(req, alertId) {
  const { callWithRequest } = req.server.plugins.elasticsearch.getCluster('monitoring');
  await callWithRequest(req, 'transport.request', {
    method: 'PUT',
    path: `/_watcher/watch/${alertId}/_deactivate`,
  });
  return true;
}

export async function activateStackAlert(req, alertId) {
  const { callWithRequest } = req.server.plugins.elasticsearch.getCluster('monitoring');
  await callWithRequest(req, 'transport.request', {
    method: 'PUT',
    path: `/_watcher/watch/${alertId}/_activate`,
  });
  return true;
}

export async function throttleStackAlert(req, alertId, throttleSeconds) {
  const { callWithRequest } = req.server.plugins.elasticsearch.getCluster('monitoring');
  const watch = await callWithRequest(req, 'transport.request', {
    method: 'GET',
    path: `/_watcher/watch/${alertId}`
  });

  const updatedWatch = {
    ...watch.watch,
    throttle_period: throttleSeconds
  };

  await callWithRequest(req, 'transport.request', {
    method: 'PUT',
    path: `/_watcher/watch/${alertId}`,
    body: updatedWatch,
  });

  return true;
}
