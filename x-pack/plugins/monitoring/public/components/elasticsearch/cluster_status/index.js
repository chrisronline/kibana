/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React from 'react';
import { SummaryStatus } from '../../summary_status';
import { ElasticsearchStatusIcon } from '../status_icon';
import { formatMetric } from '../../../lib/format_number';

export function ClusterStatus({ stats }) {
  const {
    dataSize,
    nodesCount,
    indicesCount,
    memUsed,
    memMax,
    totalShards,
    unassignedShards,
    documentCount,
    status
  } = stats;

  const metrics = [
    {
      label: 'Nodes',
      value: nodesCount,
      'data-test-subj': 'nodesCount'
    },
    {
      label: 'Indices',
      value: indicesCount,
      'data-test-subj': 'indicesCount'
    },
    {
      label: 'Memory',
      value: formatMetric(memUsed, 'byte') + ' / ' + formatMetric(memMax, 'byte'),
      'data-test-subj': 'memory'
    },
    {
      label: 'Total Shards',
      value: totalShards,
      'data-test-subj': 'totalShards'
    },
    {
      label: 'Unassigned Shards',
      value: unassignedShards,
      'data-test-subj': 'unassignedShards'
    },
    {
      label: 'Documents',
      value: formatMetric(documentCount, 'int_commas'),
      'data-test-subj': 'documentCount'
    },
    {
      label: 'Data',
      value: formatMetric(dataSize, 'byte'),
      'data-test-subj': 'dataSize'
    }
  ];

  const IconComponent = ({ status }) => (
    <ElasticsearchStatusIcon status={status} />
  );

  return (
    <SummaryStatus
      metrics={metrics}
      status={status}
      IconComponent={IconComponent}
      data-test-subj="elasticsearchClusterStatus"
    />
  );
}
