/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import sinon from 'sinon';
import proxyquire from 'proxyquire';

const callWithRequestFactorySpy = sinon.fake(((method, params) => {
  if (params.path === '/_template') {
    return {
      template1: {
        index_patterns: ['my_indices*'],
        settings: {
          index: {
            lifecycle: {
              name: 'my_policy',
            },
            routing: {
              include: {},
              require: {},
            }
          }
        }
      },
      template2: {
        index_patterns: ['my_other_indices*'],
        settings: {
          index: {
            lifecycle: {
              name: 'my_policy2',
            },
          }
        }
      },
      template3: {
        index_patterns: ['even_more_indices*'],
        settings: {}
      }
    };
  }
  if (params.path === '/my_indices*/_stats') {
    return {
      my_indices1: {},
      my_indices2: {},
    };
  }
  if (params.path === '/my_other_indices*/_stats') {
    return {
      my_other_indices1: {},
      my_other_indices2: {},
    };
  }
  if (params.path === '/even_more_indices*/_stats') {
    return {
      even_more_indices1: {},
      even_more_indices2: {},
    };
  }
}));

const registerFetchRoute = proxyquire('../register_fetch_route', {
  '../../../lib/call_with_request_factory': {
    callWithRequestFactory: () => callWithRequestFactorySpy
  }
}).registerFetchRoute;

let routeHandler;
const mockServer = {
  route: options => {
    routeHandler = options.handler;
  }
};

describe('ilmFetchIndexTemplatesRoute', () => {
  it('should fetch all templates and format the results', async () => {
    registerFetchRoute(mockServer);

    const reply = sinon.fake();

    await routeHandler({}, reply);

    sinon.assert.match(callWithRequestFactorySpy.callCount, 4);
    sinon.assert.calledWith(callWithRequestFactorySpy, 'transport.request', {
      method: 'GET',
      path: '/_template',
      ignore: [ 404 ]
    });
    sinon.assert.calledWith(callWithRequestFactorySpy, 'transport.request', {
      method: 'GET',
      path: '/my_indices*/_stats',
      ignore: [ 404 ]
    });
    sinon.assert.calledWith(callWithRequestFactorySpy, 'transport.request', {
      method: 'GET',
      path: '/my_other_indices*/_stats',
      ignore: [ 404 ]
    });
    sinon.assert.calledWith(callWithRequestFactorySpy, 'transport.request', {
      method: 'GET',
      path: '/even_more_indices*/_stats',
      ignore: [ 404 ]
    });
    sinon.assert.calledWith(reply, [{
      allocation_rules: {
        include: {},
        require: {}
      },
      index_lifecycle_name: 'my_policy',
      index_patterns: ['my_indices*'],
      indices: [],
      name: 'template1'
    }, {
      allocation_rules: undefined,
      index_lifecycle_name: 'my_policy2',
      index_patterns: ['my_other_indices*'],
      indices: [],
      name: 'template2'
    }, {
      allocation_rules: undefined,
      index_lifecycle_name: undefined,
      index_patterns: ['even_more_indices*'],
      indices: [],
      name: 'template3'
    }]);
  });
});
