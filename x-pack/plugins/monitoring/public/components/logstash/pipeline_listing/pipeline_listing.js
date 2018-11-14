/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { PureComponent } from 'react';
import moment from 'moment';
import { partialRight } from 'lodash';
import { EuiPage, EuiLink, EuiPageBody, EuiPageContent, EuiSpacer, EuiFlexGroup, EuiFlexItem } from '@elastic/eui';
import { formatMetric } from '../../../lib/format_number';
import { ClusterStatus } from '..//cluster_status';
import { Sparkline } from 'plugins/monitoring/components/sparkline';
import { MonitoringTable } from '../../table';

export class PipelineListing extends PureComponent {
  tooltipXValueFormatter(xValue) {
    return moment(xValue).format(this.props.dateFormat);
  }

  tooltipYValueFormatter(yValue, format, units) {
    return formatMetric(yValue, format, units);
  }

  getColumns() {
    const { onBrush } = this.props;
    const { kbnUrl, scope } = this.props.angular;

    return [
      {
        name: 'ID',
        field: 'id',
        render: (id) => (
          <EuiLink
            data-test-subj="id"
            onClick={() => {
              scope.$evalAsync(() => {
                kbnUrl.changePath(`/logstash/pipelines/${id}`);
              });
            }}
          >
            {id}
          </EuiLink>
        )
      },
      {
        name: 'Events Emitted Rate',
        field: 'latestThroughput',
        render: (value, pipeline) => {
          const throughput = pipeline.metrics.throughput;
          return (
            <EuiFlexGroup
              gutterSize="none"
              alignItems="center"
            >
              <EuiFlexItem>
                <Sparkline
                  series={throughput.data}
                  onBrush={onBrush}
                  tooltip={{
                    xValueFormatter: this.tooltipXValueFormatter,
                    yValueFormatter: partialRight(this.tooltipYValueFormatter, throughput.metric.format, throughput.metric.units)
                  }}
                  options={{ xaxis: throughput.timeRange }}
                />
              </EuiFlexItem>
              <EuiFlexItem
                className="monTableCell__number"
                data-test-subj="eventsEmittedRate"
              >
                { formatMetric(value, '0.[0]a', throughput.metric.units) }
              </EuiFlexItem>
            </EuiFlexGroup>
          );
        }
      },
      {
        name: 'Number of Nodes',
        field: 'latestNodesCount',
        render: (value, pipeline) => {
          const nodesCount = pipeline.metrics.nodesCount;
          return (
            <EuiFlexGroup
              gutterSize="none"
              alignItems="center"
            >
              <EuiFlexItem>
                <Sparkline
                  series={nodesCount.data}
                  onBrush={onBrush}
                  tooltip={{
                    xValueFormatter: this.tooltipXValueFormatter,
                    yValueFormatter: partialRight(this.tooltipYValueFormatter, nodesCount.metric.format, nodesCount.metric.units)
                  }}
                  options={{ xaxis: nodesCount.timeRange }}
                />
              </EuiFlexItem>
              <EuiFlexItem
                className="monTableCell__number"
                data-test-subj="nodeCount"
              >
                { formatMetric(value, '0a') }
              </EuiFlexItem>
            </EuiFlexGroup>
          );
        }
      },
    ];
  }
  render() {
    const { data, stats, sorting, pagination, onTableChange } = this.props;
    const columns = this.getColumns();

    return (
      <EuiPage>
        <EuiPageBody>
          <EuiPageContent>
            <ClusterStatus stats={stats} />
            <EuiSpacer size="m"/>
            <MonitoringTable
              className="logstashNodesTable"
              rows={data}
              columns={columns}
              sorting={sorting}
              pagination={pagination}
              search={{
                box: {
                  incremental: true,
                  placeholder: 'Filter Nodes...'
                },
              }}
              onTableChange={onTableChange}
            />
          </EuiPageContent>
        </EuiPageBody>
      </EuiPage>
    );
  }
}
