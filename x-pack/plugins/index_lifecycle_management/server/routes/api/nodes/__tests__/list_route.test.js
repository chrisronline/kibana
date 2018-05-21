/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { registerListRoute } from '../register_list_route';

jest.mock('../../../../lib/call_with_request_factory', () => {
  const mock = jest.fn().mockImplementation((method) => {
    if (method === 'nodes.stats') {
      const ignorableNodes = ['ml.enabled', 'ml.machine_memory', 'ml.max_open_jobs'].reduce((accum, key, index) => ({
        ...accum,
        [index + 4]: {
          [key]: true,
        }
      }), {});
      return {
        nodes: {
          1: {
            attributes: {
              'hot_node': true,
            }
          },
          2: {
            attributes: {
              'hot_node': true,
            }
          },
          3: {
            attributes: {
              'warm_node': true,
            }
          },
          ...ignorableNodes,
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

describe('ilmListNodesRoute', () => {
  it('should call nodes.stats and format the results', async () => {
    registerListRoute(mockServer);

    const reply = jest.fn();

    await routeHandler({}, reply);

    const mock = require('../../../../lib/call_with_request_factory').callWithRequestFactory().mock;

    expect(mock.calls.length).toBe(1);
    expect(mock.calls[0]).toEqual([
      'nodes.stats',
      { format: 'json' }
    ]);
    expect(reply).toHaveBeenCalledWith({
      'hot_node:true': ['1', '2'],
      'warm_node:true': ['3']
    });
  });
});
