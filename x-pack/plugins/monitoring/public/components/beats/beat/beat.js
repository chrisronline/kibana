/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React from 'react';
import { MonitoringTimeseriesContainer } from '../../chart';
import { formatMetric } from '../../../lib/format_number';
import { EuiFlexItem, EuiPage, EuiPageBody, EuiFlexGrid, EuiSpacer, EuiPageContent } from '@elastic/eui';
import { SummaryStatus } from '../../summary_status/summary_status';

export function Beat({ summary, metrics, ...props }) {

  const metricsToShow = [
    metrics.beat_event_rates,
    metrics.beat_fail_rates,
    metrics.beat_throughput_rates,
    metrics.beat_output_errors,
    metrics.beat_memory,
    metrics.beat_cpu_utilization,
    metrics.beat_os_load,
    metrics.beat_handles,
  ];

  const summarytStatsTop = [
    { label: 'Name', value: summary.name, 'data-test-subj': 'name' },
    { label: 'Host', value: summary.transportAddress, 'data-test-subj': 'host' },
    { label: 'Version', value: summary.version, 'data-test-subj': 'version' },
    { label: 'Type', value: summary.type, 'data-test-subj': 'type' },
    { label: 'Output', value: summary.output, 'data-test-subj': 'output' },
    { label: 'Config reloads', value: formatMetric(summary.configReloads, 'int_commas'), 'data-test-subj': 'configReloads' },
    { label: 'Uptime', value: formatMetric(summary.uptime, 'time_since'), 'data-test-subj': 'uptime' },
  ];

  const summarytStatsBot = [
    { label: 'Events total', value: formatMetric(summary.eventsTotal, 'int_commas'), 'data-test-subj': 'eventsTotal' },
    { label: 'Events emitted', value: formatMetric(summary.eventsEmitted, 'int_commas'), 'data-test-subj': 'eventsEmitted' },
    { label: 'Events dropped', value: formatMetric(summary.eventsDropped, 'int_commas'), 'data-test-subj': 'eventsDropped' },
    { label: 'Bytes sent', value: formatMetric(summary.bytesWritten, 'byte'), 'data-test-subj': 'bytesWritten' },
    { label: 'Handles limit (soft)', value: formatMetric(summary.handlesSoftLimit, 'byte'), 'data-test-subj': 'handlesLimitSoft' },
    { label: 'Handles limit (hard)', value: formatMetric(summary.handlesHardLimit, 'byte'), 'data-test-subj': 'handlesLimitHard' },
  ];

  return (
    <EuiPage>
      <EuiPageBody>
        <EuiPageContent>
          <SummaryStatus
            metrics={summarytStatsTop}
            data-test-subj="beatSummaryStatus01"
          />
          <SummaryStatus
            metrics={summarytStatsBot}
            data-test-subj="beatSummaryStatus02"
          />
          <EuiSpacer size="m"/>
          <EuiFlexGrid columns={2} gutterSize="none">
            {metricsToShow.map((metric, index) => (
              <EuiFlexItem key={index} style={{ width: '50%' }}>
                <MonitoringTimeseriesContainer
                  series={metric}
                  {...props}
                />
                <EuiSpacer size="m"/>
              </EuiFlexItem>
            ))}
          </EuiFlexGrid>
        </EuiPageContent>
      </EuiPageBody>
    </EuiPage>
  );
}
