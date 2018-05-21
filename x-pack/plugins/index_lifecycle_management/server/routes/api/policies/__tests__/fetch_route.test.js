/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { registerFetchRoute } from '../register_fetch_route';

jest.mock('../../../../lib/call_with_request_factory', () => {
  const mock = jest.fn().mockImplementation((method, params) => {
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

describe('ilmFetchPoliciesRoute', () => {
  it('should fetch all policies and format the results', async () => {
    registerFetchRoute(mockServer);

    const reply = jest.fn();

    await routeHandler({}, reply);

    const mock = require('../../../../lib/call_with_request_factory').callWithRequestFactory().mock;

    expect(mock.calls.length).toBe(1);
    expect(mock.calls[0][1].path).toBe('/_xpack/index_lifecycle');
  });
});
