/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { PureComponent } from 'react';
import { EuiPage, EuiLink, EuiPageBody, EuiPageContent, EuiSpacer } from '@elastic/eui';
import { formatPercentageUsage, formatNumber } from '../../../lib/format_number';
import { ClusterStatus } from '..//cluster_status';
import { MonitoringTable } from '../../table';

export class Listing extends PureComponent {
  getColumns() {
    const { kbnUrl, scope } = this.props.angular;

    return [
      {
        name: 'Name',
        field: 'logstash.name',
        render: (name, node) => (
          <div>
            <div>
              <EuiLink
                onClick={() => {
                  scope.$evalAsync(() => {
                    kbnUrl.changePath(`/logstash/node/${node.logstash.uuid}`);
                  });
                }}
              >
                {name}
              </EuiLink>
            </div>
            <div>
              {node.logstash.http_address}
            </div>
          </div>
        )
      },
      {
        name: 'CPU Usage',
        field: 'process.cpu.percent',
        render: value => formatPercentageUsage(value, 100)
      },
      {
        name: 'Load Average',
        field: 'os.cpu.load_average.1m',
        render: value => formatNumber(value, '0.00')
      },
      {
        name: 'JVM Heap Used',
        field: 'jvm.mem.heap_used_percent',
        render: value => formatPercentageUsage(value, 100)
      },
      {
        name: 'Events Ingested',
        field: 'events.out',
        render: value => formatNumber(value, '0.[0]a')
      },
      {
        name: 'Config Reloads',
        render: node => (
          <div>
            <div>{ node.reloads.successes } successes</div>
            <div>{ node.reloads.failures } failures</div>
          </div>
        )
      },
      {
        name: 'Version',
        field: 'logstash.version',
        render: value => formatNumber(value)
      }
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
