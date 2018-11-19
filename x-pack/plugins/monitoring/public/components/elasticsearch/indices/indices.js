/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React from 'react';
import { capitalize } from 'lodash';
import { LARGE_FLOAT, LARGE_BYTES, LARGE_ABBREVIATED } from '../../../../common/formatting';
import { formatMetric } from '../../../lib/format_number';
import { ElasticsearchStatusIcon } from '../status_icon';
import { ClusterStatus } from '../cluster_status';
import { MonitoringTable } from '../../table';
import {
  EuiLink,
  EuiPage,
  EuiPageContent,
  EuiPageBody,
  EuiSwitch,
  EuiSpacer,
} from '@elastic/eui';

const columns = [
  {
    name: 'Name',
    field: 'name',
    width: '350px',
    sortable: true,
    render: (value) => (
      <div data-test-subj="name">
        <EuiLink
          href={`#/elasticsearch/indices/${value}`}
          data-test-subj={`indexLink-${value}`}
        >
          {value}
        </EuiLink>
      </div>
    ),
  },
  {
    name: 'Status',
    field: 'status',
    sortable: true,
    render: (value) => (
      <div title={`Index status: ${value}`}>
        <ElasticsearchStatusIcon status={value} />&nbsp;
        {capitalize(value)}
      </div>
    )
  },
  {
    name: 'Document Count',
    field: 'doc_count',
    sortable: true,
    render: value => (
      <div data-test-subj="documentCount">
        {formatMetric(value, LARGE_ABBREVIATED)}
      </div>
    )
  },
  {
    name: 'Data',
    field: 'data_size',
    sortable: true,
    render: value => (
      <div data-test-subj="dataSize">
        {formatMetric(value, LARGE_BYTES)}
      </div>
    )
  },
  {
    name: 'Index Rate',
    field: 'index_rate',
    sortable: true,
    render: value => (
      <div data-test-subj="indexRate">
        {formatMetric(value, LARGE_FLOAT, '/s')}
      </div>
    )
  },
  {
    name: 'Search Rate',
    field: 'search_rate',
    sortable: true,
    render: value => (
      <div data-test-subj="searchRate">
        {formatMetric(value, LARGE_FLOAT, '/s')}
      </div>
    )
  },
  {
    name: 'Unassigned Shards',
    field: 'unassigned_shards',
    sortable: true,
    render: value => (
      <div data-test-subj="unassignedShards">
        {formatMetric(value, '0')}
      </div>
    )
  }
];

const getNoDataMessage = () => {
  return (
    <div>
      <p>There are no indices that match your selections. Try changing the time range selection.</p>
      <p>If you are looking for system indices (e.g., .kibana), try checking &lsquo;Show system indices&rsquo;.</p>
    </div>
  );
};

export class ElasticsearchIndices extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isShowingSystemIndices: false,
    };
  }
  render() {
    const { clusterStatus, indices, ...props } = this.props;
    const { sorting, pagination, onTableChange } = props;

    const rows = indices
      .filter(index => {
        if (index.name.startsWith('.') && !this.state.isShowingSystemIndices) {
          return false;
        }
        return true;
      });

    return (
      <EuiPage>
        <EuiPageBody>
          <EuiPageContent>
            <ClusterStatus stats={clusterStatus} />
            <EuiSpacer size="xs"/>
            <EuiSwitch
              label="Show system indices"
              checked={this.state.isShowingSystemIndices}
              onChange={e => this.setState({ isShowingSystemIndices: e.target.checked })}
            />
            <EuiSpacer size="m"/>
            <MonitoringTable
              className="elasticsearchIndicesTable"
              rows={rows}
              columns={columns}
              sorting={sorting}
              secondarySortField="name"
              pagination={pagination}
              message={getNoDataMessage()}
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

