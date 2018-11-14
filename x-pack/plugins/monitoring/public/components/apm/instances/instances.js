/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React from 'react';
import moment from 'moment';
import { uniq } from 'lodash';
import { MonitoringTable } from '../../table';
import { EuiLink, EuiPage, EuiPageBody, EuiPageContent, EuiSpacer } from '@elastic/eui';
import { Status } from './status';
import { formatMetric } from '../../../lib/format_number';
import { formatTimestampToDuration } from '../../../../common';

const columns = [
  {
    name: 'Name',
    field: 'name',
    render: (name, instance) => (
      <EuiLink
        href={`#/apm/instances/${instance.uuid}`}
        data-test-subj={`apmLink-${name}`}
      >
        {name}
      </EuiLink>
    )
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
    name: 'Last Event',
    field: 'time_of_last_event',
    render: value => formatTimestampToDuration(+moment(value), 'since') + ' ago'
  },
  {
    name: 'Allocated Memory',
    field: 'memory',
    render: value => formatMetric(value, 'byte')
  },
  {
    name: 'Version',
    field: 'version'
  },
];

export function ApmServerInstances({ apms }) {
  const {
    pagination,
    sorting,
    onTableChange,
    data
  } = apms;

  const versions = uniq(data.apms.map(item => item.version)).map(version => {
    return { value: version };
  });

  return (
    <EuiPage>
      <EuiPageBody>
        <EuiPageContent>
          <Status stats={data.stats} />
          <EuiSpacer size="m"/>
          <MonitoringTable
            className="apmInstancesTable"
            rows={data.apms}
            columns={columns}
            sorting={sorting}
            pagination={pagination}
            search={{
              box: {
                incremental: true,
                placeholder: 'Filter APM Instances...'
              },
              filters: [
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
          />
        </EuiPageContent>
      </EuiPageBody>
    </EuiPage>
  );
}
