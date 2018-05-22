/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import {
  fetchIndexTemplates,
  fetchingIndexTemplates,
  fetchedIndexTemplates,
  fetchIndexTemplate
} from '../index_template';
import {
  setSelectedPrimaryShardCount,
  setSelectedReplicaCount,
  setSelectedNodeAttrs,
  setSelectedPolicyName,
  setIndexName,
  setAliasName,
  fetchedIndexTemplate
} from '..';

jest.mock('ui/notify', () => ({
  toastNotifications: {
    addDanger: jest.fn(),
  }
}));

jest.mock('../../../api', () => ({
  loadIndexTemplates: jest.fn(),
  loadIndexTemplate: jest.fn().mockImplementation(() => ({
    index_patterns: ['test*'],
    settings: {
      index: {
        number_of_shards: 1,
        number_of_replicas: 2,
        routing: {
          allocation: {
            include: {
              sattr_name: 'hot_node'
            }
          }
        },
        lifecycle: {
          name: 'my_policy',
        }
      }
    }
  }))
}));

const addDanger = require('ui/notify').toastNotifications.addDanger;
const loadIndexTemplates = require('../../../api').loadIndexTemplates;
const loadIndexTemplate = require('../../../api').loadIndexTemplate;

describe('indexTemplate actions', () => {
  beforeEach(() => {
    addDanger.mockClear();
    loadIndexTemplate.mockClear();
    loadIndexTemplates.mockClear();
  });

  describe('fetchIndexTemplates()', () => {
    it('should fetch index templates', async () => {
      const dispatch = jest.fn();
      const asyncAction = fetchIndexTemplates();
      await asyncAction(dispatch);
      expect(dispatch).toHaveBeenCalledWith({
        type: fetchingIndexTemplates().type
      });
      expect(dispatch).toHaveBeenCalledWith({
        type: fetchedIndexTemplates().type
      });
    });

    it('should show a toast error if an error is thrown', async () => {
      const dispatch = jest.fn();
      const asyncAction = fetchIndexTemplates();

      loadIndexTemplates.mockImplementation(() => {
        const err = new Error();
        err.data = {
          message: 'Test'
        };
        throw err;
      });
      await asyncAction(dispatch);
      expect(addDanger.mock.calls.length).toBe(1);
      expect(addDanger.mock.calls[0]).toEqual(['Test']);
    });
  });

  describe('fetchIndexTemplate()', () => {
    it('should fetch a single index template', async () => {
      const dispatch = jest.fn();
      const asyncAction = fetchIndexTemplate('foo');
      await asyncAction(dispatch);
      expect(dispatch.mock.calls[0]).toEqual([{
        type: setSelectedPrimaryShardCount().type,
        payload: 1
      }]);
      expect(dispatch.mock.calls[1]).toEqual([{
        type: setSelectedReplicaCount().type,
        payload: 2
      }]);
      expect(dispatch.mock.calls[2]).toEqual([{
        type: setSelectedNodeAttrs().type,
        payload: 'hot_node'
      }]);
      expect(dispatch.mock.calls[3]).toEqual([{
        type: setSelectedPolicyName().type,
        payload: 'my_policy'
      }]);
      expect(dispatch.mock.calls[4]).toEqual([{
        type: setIndexName().type,
        payload: 'test-00001'
      }]);
      expect(dispatch.mock.calls[5]).toEqual([{
        type: setAliasName().type,
        payload: 'test-alias'
      }]);
      expect(dispatch.mock.calls[6][0].type).toEqual(fetchedIndexTemplate().type);
    });

    it('should show a toast error if an error is thrown', async () => {
      const dispatch = jest.fn();
      const asyncAction = fetchIndexTemplate('foo');
      const addDanger = require('ui/notify').toastNotifications.addDanger;

      loadIndexTemplate.mockImplementation(() => {
        const err = new Error();
        err.data = {
          message: 'Test'
        };
        throw err;
      });
      await asyncAction(dispatch);
      expect(addDanger.mock.calls.length).toBe(1);
      expect(addDanger.mock.calls[0]).toEqual(['Test']);
    });
  });
});
