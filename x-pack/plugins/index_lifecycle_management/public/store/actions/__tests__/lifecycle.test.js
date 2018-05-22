/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import {
  savedLifecycle,
  saveLifecycle
} from '../lifecycle';

jest.mock('ui/notify', () => ({
  toastNotifications: {
    addDanger: jest.fn(),
    addSuccess: jest.fn(),
  }
}));

jest.mock('../../../api', () => ({
  saveLifecycle: jest.fn()
}));

const addDanger = require('ui/notify').toastNotifications.addDanger;
const addSuccess = require('ui/notify').toastNotifications.addSuccess;
const apiSaveLifecycle = require('../../../api').saveLifecycle;

describe('lifecycle actions', () => {
  beforeEach(() => {
    addDanger.mockClear();
    addSuccess.mockClear();
    apiSaveLifecycle.mockClear();
  });

  describe('saveLifecycle()', () => {
    it('should save the lifecycle', async () => {
      const dispatch = jest.fn();
      const asyncAction = saveLifecycle({ name: 'foobar' });
      await asyncAction(dispatch);
      expect(dispatch).toHaveBeenCalledWith({
        type: savedLifecycle().type
      });
      expect(addSuccess.mock.calls.length).toBe(1);
      expect(addSuccess.mock.calls[0]).toEqual(['Successfully created lifecycle policy \'foobar\'']);
    });

    it('should show a toast error if an error is thrown', async () => {
      const dispatch = jest.fn();
      const asyncAction = saveLifecycle();

      apiSaveLifecycle.mockImplementation(() => {
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
