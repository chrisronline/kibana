/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import {
  setHttpClient,
  loadIndexTemplate,
  loadIndexTemplates,
  loadNodeDetails,
  loadNodes,
  loadPolicies,
  getAffectedIndices,
  saveLifecycle,
  bootstrap
} from '../index';

const get = jest.fn().mockImplementation(() => ({ data: [] }));
const post = jest.fn().mockImplementation(() => ({ data: [] }));
const client = {
  get,
  post
};

describe('ilmApi', () => {
  beforeEach(() => {
    setHttpClient(client);
    get.mockClear();
    post.mockClear();
  });

  it('should load nodes', async () => {
    await loadNodes();
    expect(get).toHaveBeenCalledWith('/api/index_lifecycle_management/nodes/list');
  });

  it('should load node details', async () => {
    await loadNodeDetails('foo');
    expect(get).toHaveBeenCalledWith('/api/index_lifecycle_management/nodes/foo/details');
  });

  it('should load index templates', async () => {
    await loadIndexTemplates();
    expect(get).toHaveBeenCalledWith('/api/index_lifecycle_management/templates');
  });

  it('should load an index template', async () => {
    await loadIndexTemplate('foo');
    expect(get).toHaveBeenCalledWith('/api/index_lifecycle_management/template/foo');
  });

  it('should load policies', async () => {
    await loadPolicies();
    expect(get).toHaveBeenCalledWith('/api/index_lifecycle_management/policies');
  });

  it('should save a lifecycle', async () => {
    const lifecycle = { name: 'policy' };
    const indexTemplatePatch = { indexTemplateName: 'my_template' };

    await saveLifecycle(lifecycle, indexTemplatePatch);
    expect(post).toHaveBeenCalledWith('/api/index_lifecycle_management/lifecycle', { lifecycle, indexTemplatePatch });
  });

  it('should bootstrap an index and alias', async () => {
    const indexName = 'index';
    const aliasName = 'alias';
    await bootstrap(indexName, aliasName);
    expect(post).toHaveBeenCalledWith('/api/index_lifecycle_management/indices/bootstrap', { indexName, aliasName });
  });

  it('should get affected indices', async () => {
    await getAffectedIndices('template', 'policy');
    expect(get).toHaveBeenCalledWith('/api/index_lifecycle_management/indices/affected/template/policy');
    get.mockClear();
    await getAffectedIndices('template');
    expect(get).toHaveBeenCalledWith('/api/index_lifecycle_management/indices/affected/template');
    get.mockClear();
    await getAffectedIndices('template', 'foo bar');
    expect(get).toHaveBeenCalledWith('/api/index_lifecycle_management/indices/affected/template/foo%20bar');
  });
});
