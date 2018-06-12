/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import sinon from 'sinon';
import proxyquire from 'proxyquire';

const callWithRequestFactorySpy = sinon.fake(((method, params) => {
  if (params.path === '/_xpack/index_lifecycle') {
    return {
      my_policy: {
        phases: {
          hot: {},
          warm: {},
          cold: {},
          delete: {}
        }
      },
      my_policy2: {
        phases: {
          hot: {},
          warm: {},
          cold: {},
          delete: {}
        }
      }
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

describe('ilmFetchPoliciesRoute', () => {
  it('should fetch all policies and format the results', async () => {
    registerFetchRoute(mockServer);

    const reply = sinon.fake();

    await routeHandler({}, reply);

    sinon.assert.match(callWithRequestFactorySpy.callCount, 1);
    sinon.assert.calledWith(callWithRequestFactorySpy, 'transport.request', {
      method: 'GET',
      path: '/_xpack/index_lifecycle',
      ignore: [ 404 ]
    });
  });
});
