/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */


import React from 'react';
import { EuiCallOut, EuiSpacer } from '@elastic/eui';
import { injectI18n } from '@kbn/i18n/react';

const DeprecationLogsPanelUI = ({ intl }) => (
  <div>
    <EuiCallOut
      title={intl.formatMessage({
        id: 'xpack.monitoring.cluster.overview.deprecationLogsPanel.title',
        defaultMessage: 'We have detected deprecation messages in your Elasticsearch logs'
      })}
      color="warning"
    >
      <p>
        {/* <FormattedMessage
          id=""
          defaultMessage=""
          values={{

          }}
        /> */}
      </p>
    </EuiCallOut>
    <EuiSpacer size="m"/>
  </div>
);

export const DeprecationLogsPanel = injectI18n(DeprecationLogsPanelUI);
