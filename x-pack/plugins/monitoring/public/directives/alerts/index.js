/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { capitalize } from 'lodash';
import React from 'react';
import { render } from 'react-dom';
import { EuiIcon, EuiHealth } from '@elastic/eui';
import { uiModules } from 'ui/modules';
import { MonitoringTable } from 'plugins/monitoring/components/table';
import { CALCULATE_DURATION_SINCE } from '../../../common/constants';
import { Tooltip } from 'plugins/monitoring/components/tooltip';
import { FormattedAlert } from 'plugins/monitoring/components/alerts/formatted_alert';
import { mapSeverity } from 'plugins/monitoring/components/alerts/map_severity';
import { formatTimestampToDuration } from '../../../common/format_timestamp_to_duration';
import { formatDateTimeLocal } from '../../../common/formatting';

const linkToCategories = {
  'elasticsearch/nodes': 'Elasticsearch Nodes',
  'elasticsearch/indices': 'Elasticsearch Indices',
  'kibana/instances': 'Kibana Instances',
  'logstash/instances': 'Logstash Nodes',
};
const getColumns = (kbnUrl, scope) => ([
  {
    name: 'Status',
    field: 'metadata.severity',
    render: severity => {
      const severityIcon = mapSeverity(severity);

      return (
        <Tooltip text={severityIcon.title} placement="bottom" trigger="hover">
          <EuiHealth color={severityIcon.color} data-test-subj="alertIcon" aria-label={severityIcon.title}>
            { capitalize(severityIcon.value) }
          </EuiHealth>
        </Tooltip>
      );
    }
  },
  {
    name: 'Resolved',
    field: 'resolved_timestamp',
    render: (resolvedTimestamp) => {
      const resolution = {
        icon: null,
        text: 'Not Resolved'
      };

      if (resolvedTimestamp) {
        resolution.text = `${formatTimestampToDuration(resolvedTimestamp, CALCULATE_DURATION_SINCE)} ago`;
      } else {
        resolution.icon = <EuiIcon type="alert" size="m" aria-label="Not Resolved" />;
      }

      return (
        <span>
          { resolution.icon } { resolution.text }
        </span>
      );
    },
  },
  {
    name: 'Message',
    field: 'message',
    render: (message, alert) => (
      <FormattedAlert
        prefix={alert.prefix}
        suffix={alert.suffix}
        message={message}
        metadata={alert.metadata}
        changeUrl={target => {
          scope.$evalAsync(() => {
            kbnUrl.changePath(target);
          });
        }}
      />
    )
  },
  {
    name: 'Category',
    field: 'metadata.link',
    render: link => linkToCategories[link] ? linkToCategories[link] : 'General'
  },
  {
    name: 'Last Checked',
    field: 'update_timestamp',
    render: timestamp => formatDateTimeLocal(timestamp)
  },
  {
    name: 'Triggered',
    field: 'timestamp',
    render: timestamp => formatTimestampToDuration(timestamp, CALCULATE_DURATION_SINCE) + ' ago'
  },
]);

const uiModule = uiModules.get('monitoring/directives', []);
uiModule.directive('monitoringClusterAlertsListing', kbnUrl => {
  return {
    restrict: 'E',
    scope: {
      alerts: '=',
      pagination: '=paginationSettings',
      sorting: '=',
      onTableChange: '='
    },
    link(scope, $el) {

      scope.$watch('alerts', (alerts = []) => {
        const alertsTable = (
          <MonitoringTable
            className="alertsTable"
            rows={alerts}
            columns={getColumns(kbnUrl, scope)}
            sorting={scope.sorting}
            pagination={scope.pagination}
            search={{
              box: {
                incremental: true,
                placeholder: 'Filter Alerts...'
              },
            }}
            onTableChange={scope.onTableChange}
          />
        );
        render(alertsTable, $el[0]);
      });

    }
  };
});
