/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { indexTemplate } from '../index_template';
import { fetchingIndexTemplates, fetchedIndexTemplates, fetchedIndexTemplate, setSelectedIndexTemplateName } from '../../actions';

describe('general', () => {
  it('should handle the `fetchingIndexTemplates` action', () => {
    const result = indexTemplate({}, fetchingIndexTemplates());
    expect(result.isLoading).toBe(true);
  });

  it('should handle the `fetchedIndexTemplates` action', () => {
    const templates = [{ name: 'foo' }];
    const result = indexTemplate({}, fetchedIndexTemplates(templates));
    expect(result.isLoading).toEqual(false);
    expect(result.indexTemplates).toEqual(templates);
  });

  it('should handle the `fetchedIndexTemplate` action', () => {
    const template = { name: 'foo' };
    const result = indexTemplate({}, fetchedIndexTemplate(template));
    expect(result.fullSelectedIndexTemplate).toEqual(template);
  });

  it('should handle the `setSelectedIndexTemplateName` action', () => {
    const result = indexTemplate({}, setSelectedIndexTemplateName('foo'));
    expect(result.selectedIndexTemplateName).toEqual('foo');
  });
});
