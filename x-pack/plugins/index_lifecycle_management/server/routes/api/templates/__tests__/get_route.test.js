/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { registerGetRoute } from '../register_get_route';

jest.mock('../../../../lib/call_with_request_factory', () => {
  const mock = jest.fn().mockImplementation((method, params) => {
    if (params.path.startsWith('/_template')) {
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

describe('ilmFetchIndexTemplateRoute', () => {
  it('should fetch the template and format the result', async () => {
    registerGetRoute(mockServer);

    const reply = jest.fn();

    await routeHandler({ params: { templateName: 'template2' } }, reply);

    const mock = require('../../../../lib/call_with_request_factory').callWithRequestFactory().mock;

    expect(mock.calls.length).toBe(1);
    expect(mock.calls[0][1].path).toBe('/_template/template2');

    expect(reply).toHaveBeenCalledWith({
      index_patterns: ['my_other_indices*'],
      settings: {
        index: {
          lifecycle: {
            name: 'my_policy2',
          },
        }
      }
    });
  });
});
