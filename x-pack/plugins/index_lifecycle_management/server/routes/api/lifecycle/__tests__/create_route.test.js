/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { registerCreateRoute } from '../register_create_route';

jest.mock('../../../../lib/call_with_request_factory', () => {
  const mock = jest.fn().mockImplementation((method) => {
    if (method === 'indices.getTemplate') {
      return {
        'foobar': {
          index_patterns: ['foobar*']
        },
        'barfoo': {
          index_patterns: ['barfoo*'],
          settings: {
            index: {
              lifecycle: {
                name: 'myPolicy'
              }
            }
          }
        }
      };
    }
  });
  return {
    callWithRequestFactory: () => mock,
  };
});

jest.mock('../../../../lib/is_es_error_factory', () => ({
  isEsErrorFactory: jest.fn().mockImplementation(() => jest.fn()),
}));

jest.mock('../../../../lib/license_pre_routing_factory', () => ({
  licensePreRoutingFactory: jest.fn().mockImplementation(() => jest.fn()),
}));

let routeHandler;
const mockServer = {
  route: options => {
    routeHandler = options.handler;
  }
};

describe('ilmCreateLifecycleRoute', () => {
  it('should update the index template and put the new lifecycle', async () => {
    registerCreateRoute(mockServer);


    await routeHandler({ payload: {
      lifecycle: {
        name: 'my_policy',
      },
      indexTemplatePatch: {
        indexTemplate: 'foobar',
        lifecycleName: 'my_policy',
        nodeAttrs: 'hot-node',
        primaryShardCount: 3,
        replicaCount: 2,
      }
    } }, jest.fn());

    const mock = require('../../../../lib/call_with_request_factory').callWithRequestFactory().mock;

    expect(mock.calls.length).toBe(3);
    expect(mock.calls[0][1].path).toBe(`/_xpack/index_lifecycle/my_policy`);
    expect(mock.calls[1]).toEqual([
      'indices.getTemplate',
      {
        name: 'foobar'
      }
    ]);
    expect(mock.calls[2][1].path).toBe(`/_template/foobar`);
    expect(mock.calls[2][1].body).toEqual({
      index_patterns: ['foobar*'],
      settings: {
        index: {
          lifecycle: {
            name: 'my_policy'
          },
          number_of_replicas: 2,
          number_of_shards: 3,
          routing: {
            allocation: {
              include: {
                'sattr_name': 'hot-node',
              }
            }
          }
        }
      }
    });
  });
});
