/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { PureComponent } from 'react';
import { uniq } from 'lodash';
import { EuiPage, EuiPageBody, EuiPageContent, EuiSpacer, EuiLink } from '@elastic/eui';
import { Stats } from 'plugins/monitoring/components/beats';
import { formatMetric } from 'plugins/monitoring/lib/format_number';
import { MonitoringTable } from 'plugins/monitoring/components/table';

export class Listing extends PureComponent {
  getColumns() {
    const { kbnUrl, scope } = this.props.angular;

    return [
      {
        name: 'Name',
        field: 'name',
        render: (name, beat) => (
          <EuiLink
            onClick={() => {
              scope.$evalAsync(() => {
                kbnUrl.changePath(`/beats/beat/${beat.uuid}`);
              });
            }}
            data-test-subj={`beatLink-${name}`}
          >
            {name}
          </EuiLink>
        )
      },
      {
        name: 'Type',
        field: 'type',
      },
      {
        name: 'Output Enabled',
        field: 'output'
      },
      {
        name: 'Total Events Rate',
        field: 'total_events_rate',
        render: value => formatMetric(value, '', '/s')
      },
      {
        name: 'Bytes Sent Rate',
        field: 'bytes_sent_rate',
        render: value => formatMetric(value, 'byte', '/s')
      },
      {
        name: 'Output Errors',
        field: 'errors',
        render: value => formatMetric(value, '0')
      },
      {
        name: 'Allocated Memory',
        field: 'memory',
        render: value => formatMetric(value, 'byte')
      },
      {
        name: 'Version',
        field: 'version',
      },
    ];
  }

  render() {
    const {
      stats,
      data,
      sorting,
      pagination,
      onTableChange
    } = this.props;


    const types = uniq(data.map(item => item.type)).map(type => {
      return { value: type };
    });

    const versions = uniq(data.map(item => item.version)).map(version => {
      return { value: version };
    });

    return (
      <EuiPage>
        <EuiPageBody>
          <EuiPageContent>
            <Stats stats={stats} />
            <EuiSpacer size="m"/>
            <MonitoringTable
              className="beatsTable"
              rows={data}
              columns={this.getColumns()}
              sorting={sorting}
              pagination={pagination}
              search={{
                box: {
                  incremental: true,
                  placeholder: 'Filter Beats...'
                },
                filters: [
                  {
                    type: 'field_value_selection',
                    field: 'type',
                    name: 'Type',
                    options: types,
                    multiSelect: 'or',
                  },
                  {
                    type: 'field_value_selection',
                    field: 'version',
                    name: 'Version',
                    options: versions,
                    multiSelect: 'or',
                  }
                ]
              }}
              onTableChange={onTableChange}

              // pageIndex={props.pageIndex}
              // filterText={props.filterText}
              // sortKey={props.sortKey}
              // sortOrder={props.sortOrder}
              // onNewState={props.onNewState}
              // placeholder="Filter Nodes..."
              // filterFields={filterFields}

            />
          </EuiPageContent>
        </EuiPageBody>
      </EuiPage>
    );
  }
}
