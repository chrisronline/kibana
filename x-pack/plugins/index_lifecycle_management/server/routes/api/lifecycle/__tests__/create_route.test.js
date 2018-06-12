/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import sinon from 'sinon';
import proxyquire from 'proxyquire';

const callWithRequestFactorySpy = sinon.fake(((method) => {
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
}));

const registerCreateRoute = proxyquire('../register_create_route', {
  '../../../lib/call_with_request_factory': {
    callWithRequestFactory: () => callWithRequestFactorySpy
  }
}).registerCreateRoute;

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
    } }, sinon.fake());

    sinon.assert.match(callWithRequestFactorySpy.callCount, 3);
    sinon.assert.calledWith(callWithRequestFactorySpy, 'transport.request', {
      method: 'PUT',
      path: `/_xpack/index_lifecycle/my_policy`,
      ignore: [ 404 ],
      body: {
        policy: {
          phases: undefined,
        }
      },
    });
    sinon.assert.calledWith(callWithRequestFactorySpy, 'indices.getTemplate', {
      name: 'foobar'
    });
    sinon.assert.calledWith(callWithRequestFactorySpy, 'transport.request', {
      method: 'PUT',
      path: `/_template/foobar`,
      ignore: [ 404 ],
      body: {
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
      }
    });
  });
});
