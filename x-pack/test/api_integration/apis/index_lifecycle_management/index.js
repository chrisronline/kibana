/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

// TODO: wait until ES portion is merged to master to flesh these out
export default function ({ loadTestFile }) {
  describe('index_lifecycle_management', () => {
    loadTestFile(require.resolve('./indices'));
    loadTestFile(require.resolve('./lifecycle'));
    loadTestFile(require.resolve('./nodes'));
    loadTestFile(require.resolve('./policies'));
    loadTestFile(require.resolve('./templates'));
  });
}
