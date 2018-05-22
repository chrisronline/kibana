/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import {
  fetchNodes,
  fetchedNodes,
  fetchNodeDetails,
  fetchedNodeDetails
} from '../nodes';

jest.mock('ui/notify', () => ({
  toastNotifications: {
    addDanger: jest.fn(),
    addSuccess: jest.fn(),
  }
}));

jest.mock('../../../api', () => ({
  loadNodes: jest.fn(),
  loadNodeDetails: jest.fn()
}));

const addDanger = require('ui/notify').toastNotifications.addDanger;
const addSuccess = require('ui/notify').toastNotifications.addSuccess;
const loadNodes = require('../../../api').loadNodes;
const apiLoadNodeDetails = require('../../../api').loadNodeDetails;

describe('nodes actions', () => {
  beforeEach(() => {
    addDanger.mockClear();
    addSuccess.mockClear();
    loadNodes.mockClear();
    apiLoadNodeDetails.mockClear();
  });

  describe('fetchNodes()', () => {
    it('should fetch the nodes', async () => {
      const dispatch = jest.fn();
      const asyncAction = fetchNodes();
      await asyncAction(dispatch);
      expect(dispatch).toHaveBeenCalledWith({
        type: fetchedNodes().type
      });
    });

    it('should show a toast error if an error is thrown', async () => {
      const dispatch = jest.fn();
      const asyncAction = fetchNodes();

      loadNodes.mockImplementation(() => {
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

  describe('fetchNodeDetails()', () => {
    it('should fetch the node details', async () => {
      const dispatch = jest.fn();
      const asyncAction = fetchNodeDetails('warm_node:true');
      await asyncAction(dispatch);
      expect(dispatch).toHaveBeenCalledWith({
        type: fetchedNodeDetails().type,
        payload: {
          selectedNodeAttrs: 'warm_node:true',
          details: undefined,
        }
      });
    });

    it('should show a toast error if an error is thrown', async () => {
      const dispatch = jest.fn();
      const asyncAction = fetchNodeDetails('warm_node:true');

      apiLoadNodeDetails.mockImplementation(() => {
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
