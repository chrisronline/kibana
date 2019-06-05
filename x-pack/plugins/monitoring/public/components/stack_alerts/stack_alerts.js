/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { Fragment, useState } from 'react';
import { EuiMonitoringTable } from '../table';
import {
  EuiPage,
  EuiPageContent,
  EuiPageBody,
  EuiSwitch,
  EuiFieldNumber,
  EuiSelect,
} from '@elastic/eui';
import { i18n } from '@kbn/i18n';
import { injectI18n } from '@kbn/i18n/react';
import { get } from 'lodash';

function StackAlertsUI({ alerts, toggleAlertState, throttleAlert, intl, ...props }) {
  const [throttles, setThrottles] = useState(
    alerts.reduce((list, alert) => ({
      ...list,
      [alert.id]: {
        value: alert.throttle_period_in_millis || 0,
        unit: get(alert, 'metadata.throttle_period_units', 'm')
      }
      // [alert.id]: alert.throttle_period_in_millis / 1000 / 60 || 0
    }), {})
  );

  const columns = [];

  columns.push({
    name: i18n.translate('xpack.monitoring.stackAlerts.nameColumnTitle', {
      defaultMessage: 'Name',
    }),
    field: 'metadata.xpack.watch',
    sortable: true,
  });

  columns.push({
    name: i18n.translate('xpack.monitoring.stackAlerts.descriptionColumnTitle', {
      defaultMessage: 'Description',
    }),
    field: 'metadata.name',
    sortable: true,
  });

  columns.push({
    name: i18n.translate('xpack.monitoring.stackAlerts.enabledColumnTitle', {
      defaultMessage: 'Enabled',
    }),
    field: 'status.state.active',
    align: 'right',
    sortable: true,
    render: (state, alert) => {
      return (
        <EuiSwitch
          checked={state}
          onChange={(e) => {
            toggleAlertState(alert.id, e.target.checked);
          }}
        />
      );
    }
  });

  columns.push({
    name: i18n.translate('xpack.monitoring.stackAlerts.throttleColumnTitle', {
      defaultMessage: 'Throttle (in minutes)',
    }),
    field: 'id',
    sortable: true,
    width: '300px',
    render: (id, alert) => {
      if (!get(alert, 'status.state.active', false)) {
        return null;
      }

      const throttle = throttles[id];
      return (
        <Fragment>
          <EuiFieldNumber
            min={0}
            value={throttle.value}
            onChange={e => {
              const value = parseInt(e.target.value);
              setThrottles({
                ...throttles,
                [alert.id]: {
                  ...throttles[alert.id],
                  value,
                }
              });
              throttleAlert(alert.id, `${value}${throttles[alert.id].unit}`);
            }}
          />
          {' '}
          <EuiSelect
            options={[
              { value: 's', text: 'seconds' },
              { value: 'm', text: 'minutes' },
              { value: 'h', text: 'hours' },
              { value: 'd', text: 'days' },
            ]}
            value={throttle.unit}
            onChange={e => {
              const unit = e.target.value;
              setThrottles({
                ...throttles,
                [alert.id]: {
                  ...throttles[alert.id],
                  unit,
                }
              });
              throttleAlert(alert.id, `${unit}${throttles[alert.id].value}`);
            }}
          />
        </Fragment>
      );
    }
  });

  const { sorting, pagination, onTableChange } = props;

  return (
    <EuiPage>
      <EuiPageBody>
        <EuiPageContent>
          <EuiMonitoringTable
            className="stackAlertsTable"
            rows={alerts}
            columns={columns}
            sorting={{
              ...sorting,
              sort: {
                ...sorting.sort,
                field: 'metadata.xpack.watch'
              }
            }}
            pagination={pagination}
            search={{
              box: {
                incremental: true,
                placeholder: intl.formatMessage({
                  id: 'xpack.monitoring.stackAlerts.monitoringTablePlaceholder',
                  defaultMessage: 'Filter Alerts…',
                }),
              },
            }}
            onTableChange={onTableChange}
            executeQueryOptions={{
              defaultFields: ['metadata.xpack.watch']
            }}
          />
        </EuiPageContent>
      </EuiPageBody>
    </EuiPage>
  );
}

export const StackAlerts = injectI18n(StackAlertsUI);
