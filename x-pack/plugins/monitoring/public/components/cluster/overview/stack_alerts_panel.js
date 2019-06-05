/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { Fragment } from 'react';
import { get, capitalize } from 'lodash';
import { formatNumber } from 'plugins/monitoring/lib/format_number';
import { ClusterItemContainer } from './helpers';
import {
  EuiButtonEmpty,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPanel,
  EuiStat,
  EuiSpacer
} from '@elastic/eui';
import { LicenseText } from './license_text';
import { i18n } from '@kbn/i18n';
import { FormattedMessage, injectI18n } from '@kbn/i18n/react';
import { Reason } from '../../logs/reason';

function StackAlertsPanelUi(props) {
  const goToStackAlerts = () => props.changeUrl('stack_alerts');

  const alerts = props.alerts;

  return (
    <ClusterItemContainer
      {...props}
      url="stack_alerts"
      title="Stack Alerts"
    >
      <EuiFlexGroup>
        <EuiFlexItem>
          <EuiPanel>
            <EuiStat
              title={alerts.totalCount}
              description="Total alerts"
            />
          </EuiPanel>
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiPanel>
            <EuiStat
              titleColor="secondary"
              title={alerts.activeCount}
              description="Enabled alerts"
            />
          </EuiPanel>
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiPanel>
            <EuiStat
              titleColor="danger"
              title={alerts.inactiveCount}
              description="Disabled alerts"
            />
          </EuiPanel>
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiSpacer/>
      <EuiButtonEmpty onClick={goToStackAlerts}>
        Manage Stack Alerts
      </EuiButtonEmpty>
    </ClusterItemContainer>
  );
}

export const StackAlertsPanel = injectI18n(StackAlertsPanelUi);
