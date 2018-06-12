/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import sinon from 'sinon';
import proxyquire from 'proxyquire';

const callWithRequestFactorySpy = sinon.fake(((method) => {
  if (method === 'nodes.stats') {
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
        4: {}
      }
    };
  }
}));

const registerDetailsRoute = proxyquire('../register_details_route', {
  '../../../lib/call_with_request_factory': {
    callWithRequestFactory: () => callWithRequestFactorySpy
  }
}).registerDetailsRoute;


let routeHandler;
const mockServer = {
  route: options => {
    routeHandler = options.handler;
  }
};

describe('ilmNodeDetailsRoute', () => {
  it('should call nodes.stats and format the results', async () => {
    registerDetailsRoute(mockServer);

    const reply = sinon.fake();

    await routeHandler({ params: {
      nodeAttrs: 'hot_node:true'
    } }, reply);

    sinon.assert.match(callWithRequestFactorySpy.callCount, 1);
    sinon.assert.calledWith(callWithRequestFactorySpy, 'nodes.stats', {
      format: 'json'
    });
    sinon.assert.calledWith(reply, [
      {
        nodeId: '1',
        stats: {
          attributes: {
            'hot_node': true
          }
        }
      },
      {
        nodeId: '2',
        stats: {
          attributes: {
            'hot_node': true
          }
        }
      }
    ]);
  });
});
