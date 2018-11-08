/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { capitalize } from 'lodash';
import numeral from '@elastic/numeral';
import React from 'react';
import { render } from 'react-dom';
import { uiModules } from 'ui/modules';
import { MonitoringTable } from 'plugins/monitoring/components/table';
import { MachineLearningJobStatusIcon } from 'plugins/monitoring/components/elasticsearch/ml_job_listing/status_icon';
import { LARGE_ABBREVIATED, LARGE_BYTES } from '../../../../common/formatting';
import {
  EuiLink,
  EuiPage,
  EuiPageContent,
  EuiPageBody,
} from '@elastic/eui';
import { ClusterStatus } from '../../../components/elasticsearch/cluster_status';

const getColumns = (kbnUrl, scope) => ([
  {
    name: 'Job ID',
    field: 'job_id',
    sortable: true
  },
  {
    name: 'State',
    field: 'state',
    sortable: true,
    render: state => (
      <div>
        <MachineLearningJobStatusIcon status={state} />&nbsp;
        { capitalize(state) }
      </div>
    )
  },
  {
    name: 'Processed Records',
    field: 'data_counts.processed_record_count',
    sortable: true,
    render: value => (
      <span>
        {numeral(value).format(LARGE_ABBREVIATED)}
      </span>
    )
  },
  {
    name: 'Model Size',
    field: 'model_size_stats.model_bytes',
    sortable: true,
    render: value => (
      <span>
        {numeral(value).format(LARGE_BYTES)}
      </span>
    )
  },
  {
    name: 'Forecasts',
    field: 'forecasts_stats.total',
    sortable: true,
    render: value => (
      <span>
        {numeral(value).format(LARGE_ABBREVIATED)}
      </span>
    )
  },
  {
    name: 'Node',
    field: 'node.name',
    sortable: true,
    render: (name, node) => {
      if (node) {
        return (
          <EuiLink
            onClick={() => {
              scope.$evalAsync(() => kbnUrl.changePath(`/elasticsearch/nodes/${node.id}`));
            }}
          >
            { name }
          </EuiLink>
        );
      }

      return (
        <span>N/A</span>
      );
    }
  }
]);

const uiModule = uiModules.get('monitoring/directives', []);
uiModule.directive('monitoringMlListing', kbnUrl => {
  return {
    restrict: 'E',
    scope: {
      jobs: '=',
      paginationSettings: '=',
      sorting: '=',
      onTableChange: '=',
      status: '=',
    },
    link(scope, $el) {
      const columns = getColumns(kbnUrl, scope);

      scope.$watch('jobs', (jobs = []) => {
        const mlTable = (
          <EuiPage>
            <EuiPageBody>
              <EuiPageContent>
                <ClusterStatus stats={scope.status} />
                <MonitoringTable
                  className="mlJobsTable"
                  rows={jobs}
                  columns={columns}
                  sorting={scope.sorting}
                  pagination={scope.paginationSettings}
                  message="There are no Machine Learning Jobs that match your query. Try changing the time range selection."
                  search={{
                    box: {
                      incremental: true,
                      placeholder: 'Filter Jobs...'
                    },
                  }}
                  onTableChange={scope.onTableChange}

                  // rows={jobs}
                  // pageIndex={scope.pageIndex}
                  // filterText={scope.filterText}
                  // sortKey={scope.sortKey}
                  // sortOrder={scope.sortOrder}
                  // onNewState={scope.onNewState}
                  // placeholder="Filter Jobs..."
                  // filterFields={filterFields}
                  // columns={columns}
                  // rowComponent={jobRowFactory(scope, kbnUrl)}
                  // getNoDataMessage={getNoDataMessage}
                />
              </EuiPageContent>
            </EuiPageBody>
          </EuiPage>
        );
        render(mlTable, $el[0]);
      });

    }
  };
});
