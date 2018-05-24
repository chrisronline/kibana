/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { getAliasName, getIndexName, getBootstrapEnabled } from '../general';

const state = {
  general: {
    bootstrapEnabled: true,
    indexName: 'index',
    aliasName: 'alias',
  }
};

describe('general', () => {
  it('should return if bootstrap is enabled', () => {
    expect(getBootstrapEnabled(state)).toBe(true);
  });

  it('should return the index name', () => {
    expect(getIndexName(state)).toBe('index');
  });

  it('should return the alias name', () => {
    expect(getAliasName(state)).toBe('alias');
  });
});
