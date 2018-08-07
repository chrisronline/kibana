/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { Fragment } from 'react';
import { SummaryStatus } from '../../summary_status';
import { ApmStatusIcon } from '../status_icon';
import { formatMetric } from '../../../lib/format_number';

export function DetailStatus({ stats }) {
  const {
    name,
    output,
    version,
    uptime,
    configReloads
  } = stats;

  console.log('stats', stats);

  const metrics = [
    {
      value: name,
      dataTestSubj: 'name'
    },
    {
      label: 'Output',
      value: output,
      dataTestSubj: 'output'
    },
    {
      label: 'Config Reloads',
      value: formatMetric(configReloads, 'int_commas'),
      dataTestSubj: 'configReloads',
    },
    {
      label: 'Version',
      value: version,
      dataTestSubj: 'version'
    },
    {
      label: 'Uptime',
      value: formatMetric(uptime, 'time_since'),
      dataTestSubj: 'uptime'
    }
  ];

  const IconComponent = ({ status }) => (
    <Fragment>
      Status: <ApmStatusIcon status={status} />
    </Fragment>
  );

  return (
    <SummaryStatus
      metrics={metrics}
      // status={status}
      IconComponent={IconComponent}
      data-test-subj="apmDetailStatus"
    />
  );
}
