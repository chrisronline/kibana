/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React from 'react';
import { SummaryStatus } from '../../summary_status';
import { KibanaStatusIcon } from '../status_icon';
import { formatMetric } from '../../../lib/format_number';

export function DetailStatus({ stats }) {
  const {
    transport_address: transportAddress,
    os_memory_free: osFreeMemory,
    version,
    uptime,
    status
  } = stats;

  const metrics = [
    {
      label: 'Transport Address',
      value: transportAddress,
      'data-test-subj': 'transportAddress'
    },
    {
      label: 'OS Free Memory',
      value: formatMetric(osFreeMemory, 'byte'),
      'data-test-subj': 'osFreeMemory'
    },
    {
      label: 'Version',
      value: version,
      'data-test-subj': 'version'
    },
    {
      label: 'Uptime',
      value: formatMetric(uptime, 'time_since'),
      'data-test-subj': 'uptime'
    }
  ];

  const IconComponent = ({ status }) => (
    <KibanaStatusIcon status={status} />
  );

  return (
    <SummaryStatus
      metrics={metrics}
      status={status}
      IconComponent={IconComponent}
      data-test-subj="kibanaDetailStatus"
    />
  );
}
