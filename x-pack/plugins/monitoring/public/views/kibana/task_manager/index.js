/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

/*
 * Kibana Instance
 */
import React from 'react';
import { i18n } from '@kbn/i18n';
import { get } from 'lodash';
import { uiRoutes } from '../../../angular/helpers/routes';
import { ajaxErrorHandlersProvider } from '../../../lib/ajax_error_handler';
import { routeInitProvider } from '../../../lib/route_init';
import template from './index.html';
import { Legacy } from '../../../legacy_shims';
import {
  EuiPage,
  EuiPageBody,
  EuiPageContent,
  EuiSpacer,
  EuiFlexGrid,
  EuiFlexItem,
  EuiPanel,
} from '@elastic/eui';
import { MonitoringTimeseriesContainer } from '../../../components/chart';
import { DetailStatus } from '../../../components/kibana/detail_status';
import { MonitoringViewBaseController } from '../../base_controller';
import {
  CODE_PATH_KIBANA,
  ALERT_KIBANA_VERSION_MISMATCH,
  ALERT_TASK_MANAGER_DURATION,
  KIBANA_SYSTEM_ID,
} from '../../../../common/constants';
import { AlertsCallout } from '../../../alerts/callout';
import { SetupModeRenderer } from '../../../components/renderers';
import { SetupModeContext } from '../../../components/setup_mode/setup_mode_context';

function getPageData($injector) {
  const $http = $injector.get('$http');
  const globalState = $injector.get('globalState');
  const $route = $injector.get('$route');
  const url = `../api/monitoring/v1/clusters/${globalState.cluster_uuid}/kibana/${$route.current.params.uuid}/task_manager`;
  const timeBounds = Legacy.shims.timefilter.getBounds();

  return $http
    .post(url, {
      ccs: globalState.ccs,
      timeRange: {
        min: timeBounds.min.toISOString(),
        max: timeBounds.max.toISOString(),
      },
    })
    .then((response) => response.data)
    .catch((err) => {
      const Private = $injector.get('Private');
      const ajaxErrorHandlers = Private(ajaxErrorHandlersProvider);
      return ajaxErrorHandlers(err);
    });
}

uiRoutes.when('/kibana/instances/:uuid/task_manager', {
  template,
  resolve: {
    clusters(Private) {
      const routeInit = Private(routeInitProvider);
      return routeInit({ codePaths: [CODE_PATH_KIBANA] });
    },
    pageData: getPageData,
  },
  controllerAs: 'monitoringKibanaInstanceTaskManagerApp',
  controller: class extends MonitoringViewBaseController {
    constructor($injector, $scope) {
      super({
        title: `Kibana - ${get($scope.pageData, 'kibanaSummary.name')}`,
        telemetryPageViewTitle: 'kibana_instance',
        defaultData: {},
        getPageData,
        reactNodeId: 'monitoringKibanaInstanceTaskManagerApp',
        $scope,
        $injector,
        alerts: {
          shouldFetch: true,
          options: {
            alertTypeIds: [ALERT_KIBANA_VERSION_MISMATCH, ALERT_TASK_MANAGER_DURATION],
          },
        },
      });

      const renderReact = (data) => {
        console.log({ data });
        this.renderReact(
          <SetupModeRenderer
            scope={$scope}
            injector={$injector}
            productName={KIBANA_SYSTEM_ID}
            render={({ flyoutComponent, bottomBarComponent }) => (
              <SetupModeContext.Provider value={{ setupModeSupported: true }}>
                {flyoutComponent}
                <EuiPage>
                  <EuiPageBody>
                    <EuiPanel>
                      <DetailStatus stats={data.kibanaSummary} alerts={this.alerts} />
                    </EuiPanel>
                    <EuiSpacer size="m" />
                    <AlertsCallout alerts={this.alerts} />
                    <EuiPageContent>
                      <EuiFlexGrid columns={2} gutterSize="s">
                        {Object.values(data.metrics).map((metric) => (
                          <EuiFlexItem grow={true}>
                            <MonitoringTimeseriesContainer
                              series={metric}
                              onBrush={this.onBrush}
                              zoomInfo={this.zoomInfo}
                            />
                            <EuiSpacer />
                          </EuiFlexItem>
                        ))}
                      </EuiFlexGrid>
                    </EuiPageContent>
                  </EuiPageBody>
                </EuiPage>
                {bottomBarComponent}
              </SetupModeContext.Provider>
            )}
          />
        );
      };

      $scope.$watch(
        () => this.data,
        (data) => {
          if (!data || !data.metrics) {
            return;
          }
          this.setTitle(`Kibana - ${get(data, 'kibanaSummary.name')}`);
          this.setPageTitle(
            i18n.translate('xpack.monitoring.kibana.instance.pageTitle', {
              defaultMessage: 'Kibana instance: {instance}',
              values: {
                instance: get($scope.pageData, 'kibanaSummary.name'),
              },
            })
          );

          renderReact(data);
        }
      );
    }
  },
});
