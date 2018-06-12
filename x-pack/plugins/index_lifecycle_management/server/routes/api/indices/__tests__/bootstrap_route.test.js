/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import sinon from 'sinon';
import proxyquire from 'proxyquire';

const callWithRequestFactorySpy = sinon.spy();
const registerBootstrapRoute = proxyquire('../register_bootstrap_route', {
  '../../../lib/call_with_request_factory': {
    callWithRequestFactory: () => callWithRequestFactorySpy
  }
}).registerBootstrapRoute;

let routeHandler;
const mockServer = {
  route: options => {
    routeHandler = options.handler;
  }
};

describe('ilmBootstrapRoute', () => {
  it('should call indices.create', async () => {
    registerBootstrapRoute(mockServer);

    await routeHandler({ payload: {
      indexName: 'myIndex',
      aliasName: 'myAlias',
    } }, sinon.fake());

    sinon.assert.match(callWithRequestFactorySpy.callCount, 1);
    sinon.assert.calledWith(callWithRequestFactorySpy, 'indices.create', {
      index: 'myIndex',
      aliases: {
        myAlias: {}
      },
      settings: {
        'index.lifecycle.rollover_alias': 'myAlias'
      }
    });
  });
});
