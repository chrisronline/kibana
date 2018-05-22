/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { general } from '../general';
import { setIndexName, setAliasName, setBootstrapEnabled } from '../../actions';

describe('general', () => {
  it('should handle the `setIndexName` action', () => {
    const result = general({}, setIndexName('my_index'));
    expect(result.indexName).toBe('my_index');
  });

  it('should handle the `setAliasName` action', () => {
    const result = general({}, setAliasName('my_alias'));
    expect(result.aliasName).toBe('my_alias');
  });

  it('should handle the `setBootstrapEnabled` action', () => {
    const result = general({}, setBootstrapEnabled(true));
    expect(result.bootstrapEnabled).toBe(true);
  });
});
