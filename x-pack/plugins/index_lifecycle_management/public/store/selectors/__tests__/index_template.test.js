/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import {
  getIndexTemplateOptions,
  getSelectedIndexTemplate,
  getAffectedIndexTemplates,
  getAffectedIndexPatterns,
  getTemplateDiff,
  getIndexTemplatePatch
} from '../index_template';

const selectedIndexTemplate = {
  name: 'foo',
  index_patterns: ['foo*'],
  index_lifecycle_name: 'my_policy',
  settings: {
    index: {
      number_of_shards: 1,
      number_of_replicas: 1,
      lifecycle: {
        name: 'my_policy'
      }
    }
  }
};

const state = {
  policies: {
    selectedPolicy: {
      name: 'my_other_policy',
    }
  },
  nodes: {
    selectedPrimaryShardCount: 2,
    selectedReplicaCount: 2,
  },
  indexTemplate: {
    selectedIndexTemplateName: selectedIndexTemplate.name,
    fullSelectedIndexTemplate: selectedIndexTemplate,
    indexTemplates: [
      selectedIndexTemplate,
    ]
  }
};

describe('index_template', () => {
  it('should return index template options for a select control', () => {
    expect(getIndexTemplateOptions(state)).toEqual([{
      text: ''
    },
    {
      text: 'foo',
      value: 'foo'
    }
    ]);
  });

  it('should get the selected index template', () => {
    expect(getSelectedIndexTemplate(state)).toEqual(selectedIndexTemplate);
  });

  it('should get the affected index templates', () => {
    expect(getAffectedIndexTemplates(state)).toEqual(['foo']);
  });

  it('should get the affected index patterns', () => {
    expect(getAffectedIndexPatterns(state)).toEqual(['foo*']);
  });

  it('should get a diff between two templates', () => {
    const diff = getTemplateDiff(state);
    expect(diff.hasChanged).toBe(true);
    expect(diff.newFullIndexTemplate.settings.index.number_of_replicas).toBe('2');
    expect(diff.newFullIndexTemplate.settings.index.number_of_shards).toBe('2');
    expect(diff.newFullIndexTemplate.settings.index.lifecycle.name).toBe('my_policy');
  });

  it('should return a certain kind of object in the index template patch', () => {
    const result = getIndexTemplatePatch(state);
    expect(result.hasOwnProperty('indexTemplate')).toBeTruthy();
    expect(result.hasOwnProperty('primaryShardCount')).toBeTruthy();
    expect(result.hasOwnProperty('replicaCount')).toBeTruthy();
    expect(result.hasOwnProperty('lifecycleName')).toBeTruthy();
    expect(result.hasOwnProperty('nodeAttrs')).toBeTruthy();
  });
});
