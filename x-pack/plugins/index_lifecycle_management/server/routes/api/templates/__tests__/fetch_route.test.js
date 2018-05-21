/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { registerFetchRoute } from '../register_fetch_route';

jest.mock('../../../../lib/call_with_request_factory', () => {
  const mock = jest.fn().mockImplementation((method, params) => {
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

describe('ilmFetchIndexTemplatesRoute', () => {
  it('should fetch all templates and format the results', async () => {
    registerFetchRoute(mockServer);

    const reply = jest.fn();

    await routeHandler({}, reply);

    const mock = require('../../../../lib/call_with_request_factory').callWithRequestFactory().mock;

    expect(mock.calls.length).toBe(4);
    expect(mock.calls[0][1].path).toBe('/_template');
    expect(mock.calls[1][1].path).toBe('/my_indices*/_stats');
    expect(mock.calls[2][1].path).toBe('/my_other_indices*/_stats');
    expect(mock.calls[3][1].path).toBe('/even_more_indices*/_stats');

    expect(reply).toHaveBeenCalledWith([{
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
