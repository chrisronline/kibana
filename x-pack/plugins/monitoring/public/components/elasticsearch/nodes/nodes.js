/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React from 'react';
import { NodeStatusIcon } from '../node';
import { extractIp } from '../../../lib/extract_ip'; // TODO this is only used for elasticsearch nodes summary / node detail, so it should be moved to components/elasticsearch/nodes/lib
import { ClusterStatus } from '../cluster_status';
import { MonitoringTable } from '../../table';
import { MetricCell, OfflineCell } from './cells';
import {
  EuiLink,
  EuiToolTip,
  EuiSpacer,
  EuiPage,
  EuiPageContent,
  EuiPageBody,
} from '@elastic/eui';

const getColumns = showCgroupMetricsElasticsearch => {
  const cols = [];

  cols.push({
    name: 'Name',
    field: 'name',
    sortable: true,
    footer: ({ items }) => {
      return (
        <span>Total Nodes: {items.length}</span>
      );
    },
    render: (value, node) => (
      <div>
        <div className="monTableCell__name">
          <EuiToolTip
            position="bottom"
            content={node.nodeTypeLabel}
          >
            <span className={`fa ${node.nodeTypeClass}`} />
          </EuiToolTip>
          &nbsp;
          <span data-test-subj="name">
            <EuiLink
              href={`#/elasticsearch/nodes/${node.resolver}`}
              data-test-subj={`nodeLink-${node.resolver}`}
            >
              {value}
            </EuiLink>
          </span>
        </div>
        <div className="monTableCell__transportAddress">
          {extractIp(node.transport_address)}
        </div>
      </div>
    )
  });

  cols.push({
    name: 'Status',
    field: 'isOnline',
    sortable: true,
    render: value => {
      const status = value ? 'Online' : 'Offline';
      return (
        <div className="monTableCell__status">
          <NodeStatusIcon
            isOnline={value}
            status={status}
          />{' '}
          {status}
        </div>
      );
    }
  });

  if (showCgroupMetricsElasticsearch) {
    cols.push({
      name: 'CPU Usage',
      field: 'node_cgroup_quota',
      sortable: true,
      render: (value, node) => (
        <MetricCell
          isOnline={node.isOnline}
          metric={value}
          isPercent={true}
          data-test-subj="cpuQuota"
        />
      )
    });

    cols.push({
      name: 'CPU Throttling',
      field: 'node_cgroup_throttled',
      sortable: true,
      render: (value, node) => (
        <MetricCell
          isOnline={node.isOnline}
          metric={value}
          isPercent={false}
          data-test-subj="cpuThrottled"
        />
      )
    });
  } else {
    cols.push({
      name: 'CPU Usage',
      field: 'node_cpu_utilization',
      sortable: true,
      render: (value, node) => (
        <MetricCell
          isOnline={node.isOnline}
          metric={value}
          isPercent={true}
          data-test-subj="cpuUage"
        />
      )
    });

    cols.push({
      name: 'Load Average',
      field: 'node_load_average',
      sortable: true,
      render: (value, node) => (
        <MetricCell
          isOnline={node.isOnline}
          metric={value}
          isPercent={false}
          data-test-subj="loadAverage"
        />
      )
    });
  }

  cols.push({
    name: 'JVM Memory',
    field: 'node_jvm_mem_percent',
    sortable: true,
    render: (value, node) => (
      <MetricCell
        isOnline={node.isOnline}
        metric={value}
        isPercent={true}
        data-test-subj="jvmMemory"
      />
    )
  });

  cols.push({
    name: 'Disk Free Space',
    field: 'node_free_space',
    sortable: true,
    width: '300px',
    render: (value, node) => (
      <MetricCell
        isOnline={node.isOnline}
        metric={value}
        isPercent={false}
        data-test-subj="diskFreeSpace"
      />
    )
  });

  cols.push({
    name: 'Shards',
    field: 'shardCount',
    sortable: true,
    render: (value, node) => {
      return node.isOnline ? (
        <div className="monTableCell__number" data-test-subj="shards">
          {value}
        </div>
      ) : <OfflineCell/>;
    }
  });

  return cols;
};

export function ElasticsearchNodes({ clusterStatus, nodes, showCgroupMetricsElasticsearch, ...props }) {
  const columns = getColumns(showCgroupMetricsElasticsearch);
  const { sorting, pagination, onTableChange } = props;

  return (
    <EuiPage>
      <EuiPageBody>
        <EuiPageContent>
          <ClusterStatus stats={clusterStatus} />
          <EuiSpacer size="m"/>
          <MonitoringTable
            className="elasticsearchNodesTable"
            rows={nodes}
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
