/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { Fragment } from 'react';
import {
  EuiSpacer,
  EuiCodeBlock,
  EuiLink,
  EuiFlexGroup,
  EuiFlexItem,
  EuiButton,
  EuiCallOut
} from '@elastic/eui';
import { formatDateTimeLocal } from '../../../../common/formatting';

export function getKibanaInstructions(product, {
  doneWithMigration,
  esMonitoringUrl,
  checkForMigrationStatus,
  checkingMigrationStatus,
  hasCheckedMigrationStatus
}) {
  const disableInternalCollectionStep = {
    title: 'Disable the default collection of Kibana monitoring metrics',
    children: (
      <Fragment>
        <p>Add the following setting in the Kibana configuration file (kibana.yml):</p>
        <EuiSpacer size="s"/>
        <EuiCodeBlock
          isCopyable
          language="bash"
        >
          xpack.monitoring.kibana.collection.enabled: false
        </EuiCodeBlock>
        <EuiSpacer size="s"/>
        <p>
          Leave the xpack.monitoring.enabled set to its default value (true).
        </p>
      </Fragment>
    )
  };

  const installMetricbeatStep = {
    title: 'Install Metricbeat on the same server as Kibana',
    children: (
      <Fragment>
        <p>
          Follow
          <EuiLink href="https://www.elastic.co/guide/en/beats/metricbeat/current/metricbeat-installation.html" target="_blank">
            the instructions here
          </EuiLink>
        </p>
      </Fragment>
    )
  };


  const enableMetricbeatModuleStep = {
    title: 'Enable and configure the Kibana module in Metricbeat',
    children: (
      <Fragment>
        <EuiCodeBlock
          isCopyable
          language="bash"
        >
          metricbeat modules enable kibana-xpack
        </EuiCodeBlock>
        <EuiSpacer size="s"/>
        <p>
          By default the module will collect Kibana monitoring metrics from http://localhost:5601.
          If the local Kibana instance has a different address,
          you must specify it via the hosts setting in the modules.d/kibana-xpack.yml file.
        </p>
      </Fragment>
    )
  };

  const configureMetricbeatStep = {
    title: 'Configure metricbeat to send to the monitoring cluster',
    children: (
      <Fragment>
        <EuiCodeBlock
          isCopyable
        >
          {`
output.elasticsearch:
  hosts: ["${esMonitoringUrl}"]
`}
        </EuiCodeBlock>
      </Fragment>

    )
  };

  const startMetricbeatStep = {
    title: 'Start Metricbeat',
    children: (
      <Fragment>
        <EuiCodeBlock
          isCopyable
        >
          {`
./metricbeat -e
`}
        </EuiCodeBlock>
      </Fragment>

    )
  };


  let migrationStatusStep = null;
  if (product.isInternalCollector || product.isPartiallyMigrated) {
    let status = null;
    if (hasCheckedMigrationStatus) {
      const lastInternallyCollectedTimestamp = formatDateTimeLocal(product.lastInternallyCollectedTimestamp);

      if (product.isPartiallyMigrated) {
        status = (
          <Fragment>
            <EuiSpacer size="m"/>
            <EuiCallOut
              size="s"
              color="warning"
              title="We still see data coming from the default collection of Kibana. Make sure you disable that before moving forward."
            >
              <p>Last internal collection occurred at {lastInternallyCollectedTimestamp}</p>
            </EuiCallOut>
          </Fragment>
        );
      }
      else {
        status = (
          <Fragment>
            <EuiSpacer size="m"/>
            <EuiCallOut
              size="s"
              color="warning"
              title={`We have not detected any monitoring data coming from Metricbeat for this Kibana`}
            >
              <p>Last internal collection occurred at {lastInternallyCollectedTimestamp}</p>
            </EuiCallOut>
          </Fragment>
        );
      }
    }

    migrationStatusStep = {
      title: 'Migration status',
      status: 'incomplete',
      children: (
        <Fragment>
          <EuiFlexGroup alignItems="center">
            <EuiFlexItem>
              <p>
                Check that data is received from the Metricbeat
              </p>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiButton onClick={checkForMigrationStatus} isDisabled={checkingMigrationStatus}>
                {checkingMigrationStatus ? 'Checking for data...' : 'Check data' }
              </EuiButton>
            </EuiFlexItem>
          </EuiFlexGroup>
          {status}
        </Fragment>
      )
    };
  }
  else if (product.isFullyMigrated) {
    migrationStatusStep = {
      title: 'Migration status',
      status: 'complete',
      children: (
        <Fragment>
          <EuiCallOut
            size="s"
            color="success"
            title="Congratulations! We are now seeing monitoring data shipping from Metricbeat!"
          />
          <EuiSpacer size="m"/>
          <EuiButton onClick={doneWithMigration}>Done</EuiButton>
        </Fragment>
      )
    };
  }

  if (product.isPartiallyMigrated) {
    return [
      disableInternalCollectionStep,
      migrationStatusStep
    ];
  }

  return [
    disableInternalCollectionStep,
    installMetricbeatStep,
    enableMetricbeatModuleStep,
    configureMetricbeatStep,
    startMetricbeatStep,
    migrationStatusStep
  ];
}
