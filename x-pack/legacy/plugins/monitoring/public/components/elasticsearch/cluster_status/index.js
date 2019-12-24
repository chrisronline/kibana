/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React from 'react';
import { SummaryStatus } from '../../summary_status';
import { ElasticsearchStatusIcon } from '../status_icon';
import { formatMetric } from '../../../lib/format_number';
import { EuiLoadingSpinner } from '@elastic/eui';
import { i18n } from '@kbn/i18n';

function loadableStat(stat, loading, statUi) {
  if ((stat === undefined || stat === null) && loading) {
    return <EuiLoadingSpinner size="m" />;
  }
  return statUi || stat;
}

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
    status,
    loading,
  } = stats;

  const metrics = [
    {
      label: i18n.translate('xpack.monitoring.elasticsearch.clusterStatus.nodesLabel', {
        defaultMessage: 'Nodes',
      }),
      value: loadableStat(nodesCount, loading),
      'data-test-subj': 'nodesCount',
    },
    {
      label: i18n.translate('xpack.monitoring.elasticsearch.clusterStatus.indicesLabel', {
        defaultMessage: 'Indices',
      }),
      value: loadableStat(indicesCount, loading),
      'data-test-subj': 'indicesCount',
    },
    {
      label: i18n.translate('xpack.monitoring.elasticsearch.clusterStatus.memoryLabel', {
        defaultMessage: 'JVM Heap',
      }),
      value: loadableStat(
        memUsed,
        loading,
        formatMetric(memUsed, 'byte') + ' / ' + formatMetric(memMax, 'byte')
      ),
      'data-test-subj': 'memory',
    },
    {
      label: i18n.translate('xpack.monitoring.elasticsearch.clusterStatus.totalShardsLabel', {
        defaultMessage: 'Total shards',
      }),
      value: loadableStat(totalShards, loading),
      'data-test-subj': 'totalShards',
    },
    {
      label: i18n.translate('xpack.monitoring.elasticsearch.clusterStatus.unassignedShardsLabel', {
        defaultMessage: 'Unassigned shards',
      }),
      value: loadableStat(unassignedShards, loading),
      'data-test-subj': 'unassignedShards',
    },
    {
      label: i18n.translate('xpack.monitoring.elasticsearch.clusterStatus.documentsLabel', {
        defaultMessage: 'Documents',
      }),
      value: loadableStat(documentCount, loading, formatMetric(documentCount, 'int_commas')),
      'data-test-subj': 'documentCount',
    },
    {
      label: i18n.translate('xpack.monitoring.elasticsearch.clusterStatus.dataLabel', {
        defaultMessage: 'Data',
      }),
      value: loadableStat(dataSize, loading, formatMetric(dataSize, 'byte')),
      'data-test-subj': 'dataSize',
    },
  ];

  const IconComponent = ({ status }) => <ElasticsearchStatusIcon status={status} />;

  return (
    <SummaryStatus
      metrics={metrics}
      status={status}
      IconComponent={IconComponent}
      data-test-subj="elasticsearchClusterStatus"
    />
  );
}
