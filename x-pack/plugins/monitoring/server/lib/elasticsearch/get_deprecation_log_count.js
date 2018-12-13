/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { get } from 'lodash';
import { createQuery } from '../create_query';
import moment from 'moment';

export async function getDeprecationLogCount(req, filebeatIndexPattern) {
  const start = moment.utc(req.payload.timeRange.min).valueOf();
  const end = moment.utc(req.payload.timeRange.max).valueOf();
  const metric = {
    timestampField: 'event.created'
  };

  const params = {
    index: filebeatIndexPattern,
    size: 0,
    ignoreUnavailable: true,
    body: {
      query: createQuery({
        start,
        end,
        metric,
        filters: [
          {
            bool: {
              must: [
                {
                  term: {
                    'event.dataset': {
                      value: 'deprecation'
                    }
                  }
                }
              ]
            }
          }
        ]
      }),
    }
  };

  const { callWithRequest } = req.server.plugins.elasticsearch.getCluster('monitoring');
  const response = await callWithRequest(req, 'search', params);
  return get(response, 'hits.total');
}
