/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import sinon from 'sinon';
import proxyquire from 'proxyquire';

const callWithRequestFactorySpy = sinon.fake(((method, params) => {
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
}));

const registerGetRoute = proxyquire('../register_get_route', {
  '../../../lib/call_with_request_factory': {
    callWithRequestFactory: () => callWithRequestFactorySpy
  }
}).registerGetRoute;

let routeHandler;
const mockServer = {
  route: options => {
    routeHandler = options.handler;
  }
};

describe('ilmFetchIndexTemplateRoute', () => {
  it('should fetch the template and format the result', async () => {
    registerGetRoute(mockServer);

    const reply = sinon.fake();

    await routeHandler({ params: { templateName: 'template2' } }, reply);

    sinon.assert.match(callWithRequestFactorySpy.callCount, 1);
    sinon.assert.calledWith(callWithRequestFactorySpy, 'transport.request', {
      method: 'GET',
      path: '/_template/template2',
      ignore: [ 404 ]
    });
    sinon.assert.calledWith(reply, {
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
