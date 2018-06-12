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

const registerGetAffectedRoute = proxyquire('../register_get_affected_route', {
  '../../../lib/call_with_request_factory': {
    callWithRequestFactory: () => callWithRequestFactorySpy
  }
}).registerGetAffectedRoute;

const routeHandlers = [];
const mockServer = {
  route: options => {
    routeHandlers.push(options.handler);
  }
};

describe('ilmGetAffectedRoute', () => {
  it('should call indices.create', async () => {
    registerGetAffectedRoute(mockServer);


    for (const routeHandler of routeHandlers) {
      await routeHandler({ params: {
        indexTemplateName: 'foobar',
        policyName: 'myPolicy'
      } }, sinon.fake());
    }

    sinon.assert.match(callWithRequestFactorySpy.callCount, 4);
    sinon.assert.calledWith(callWithRequestFactorySpy, 'indices.get', {
      index: ['foobar*']
    });
    sinon.assert.calledWith(callWithRequestFactorySpy, 'indices.get', {
      index: ['foobar*', 'barfoo*']
    });
  });
});
