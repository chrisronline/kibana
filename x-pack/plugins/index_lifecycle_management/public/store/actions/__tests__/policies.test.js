/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { fetchPolicies, fetchedPolicies } from '../policies';

jest.mock('ui/notify', () => ({
  toastNotifications: {
    addDanger: jest.fn(),
    addSuccess: jest.fn(),
  }
}));

jest.mock('../../../api', () => ({
  loadPolicies: jest.fn(),
}));

const addDanger = require('ui/notify').toastNotifications.addDanger;
const addSuccess = require('ui/notify').toastNotifications.addSuccess;
const loadPolicies = require('../../../api').loadPolicies;

describe('nodes actions', () => {
  beforeEach(() => {
    addDanger.mockClear();
    addSuccess.mockClear();
    loadPolicies.mockClear();
  });

  describe('fetchNodes()', () => {
    it('should fetch the nodes', async () => {
      const dispatch = jest.fn();
      const asyncAction = fetchPolicies();
      await asyncAction(dispatch);
      expect(dispatch).toHaveBeenCalledWith({
        type: fetchedPolicies().type
      });
    });

    it('should show a toast error if an error is thrown', async () => {
      const dispatch = jest.fn();
      const asyncAction = fetchPolicies();

      loadPolicies.mockImplementation(() => {
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
