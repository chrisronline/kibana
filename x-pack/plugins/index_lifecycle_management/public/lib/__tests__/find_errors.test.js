/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { hasErrors } from '../find_errors';

describe('hasErrors', () => {
  it('should determine if there are errors in our custom error object', () => {
    const objectWithErrors = {
      foo: ['An error'],
      bar: {
        foobar: []
      }
    };

    const objectWithoutErrors = {
      foo: [],
      bar: {
        foobar: []
      }
    };

    expect(hasErrors(objectWithErrors)).toBe(true);
    expect(hasErrors(objectWithoutErrors)).toBe(false);
  });
});
