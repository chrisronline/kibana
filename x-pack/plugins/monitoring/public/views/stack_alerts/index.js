/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React from 'react';
import { i18n } from '@kbn/i18n';
import moment from 'moment';
import { find, get, debounce } from 'lodash';
import uiRoutes from'ui/routes';
import { routeInitProvider } from 'plugins/monitoring/lib/route_init';
import template from './index.html';
import { MonitoringViewBaseEuiTableController } from '../';
import { StackAlerts } from '../../components/stack_alerts';
import { timefilter } from 'ui/timefilter';
import { I18nContext } from 'ui/i18n';
import { ajaxErrorHandlersProvider } from '../../lib/ajax_error_handler';

function getPageData($injector, api) {
  const $http = $injector.get('$http');
  const globalState = $injector.get('globalState');

  return $http
    .post(api, {
      ccs: globalState.ccs,
    })
    .then(response => response.data)
    .catch(err => {
      const Private = $injector.get('Private');
      const ajaxErrorHandlers = Private(ajaxErrorHandlersProvider);
      return ajaxErrorHandlers(err);
    });
}

function toggleAlertState($injector, alertId, checked) {
  let endpoint = null;
  if (checked) {
    endpoint = `../api/monitoring/v1/clusters/null/stack_alert/${alertId}/activate`;
  } else {
    endpoint = `../api/monitoring/v1/clusters/null/stack_alert/${alertId}/deactivate`;
  }

  const $http = $injector.get('$http');
  return $http
    .post(endpoint)
    .then(response => response.data)
    .catch(err => {
      const Private = $injector.get('Private');
      const ajaxErrorHandlers = Private(ajaxErrorHandlersProvider);
      return ajaxErrorHandlers(err);
    });
}

function throttleAlert($injector, alertId, throttlePeriod) {
  const endpoint = `../api/monitoring/v1/clusters/null/stack_alert/${alertId}/throttle`;
  const $http = $injector.get('$http');
  return $http
    .post(endpoint, {
      throttlePeriod
    })
    .then(response => response.data)
    .catch(err => {
      const Private = $injector.get('Private');
      const ajaxErrorHandlers = Private(ajaxErrorHandlersProvider);
      return ajaxErrorHandlers(err);
    });
}

uiRoutes.when('/stack_alerts', {
  template,
  resolve: {
    clusters: function (Private) {
      const routeInit = Private(routeInitProvider);
      return routeInit();
    },
  },

  controller: class extends MonitoringViewBaseEuiTableController {
    constructor($injector, $scope) {
      const $route = $injector.get('$route');
      const globalState = $injector.get('globalState');
      $scope.cluster = find($route.current.locals.clusters, {
        cluster_uuid: globalState.cluster_uuid
      });

      super({
        title: i18n.translate('xpack.monitoring.stackAlerts.routeTitle', {
          defaultMessage: 'Stack Alerts',
        }),
        getPageData,
        api: `../api/monitoring/v1/clusters/${globalState.cluster_uuid}/stack_alerts`,
        defaultData: {},
        reactNodeId: 'stackAlertsReact',
        $scope,
        $injector,
        options: {
          enableTimeFilter: false,
          enableAutoRefresh: false
        }
      });

      this.toggleAlertState = async (...args) => {
        await toggleAlertState($injector, ...args);
        this.updateData();
      };

      this.throttleAlert = debounce(async (alertId, throttlePeriod) => {
        // console.log('throttleAlert()', { alertId, throttlePeriod });
        await throttleAlert($injector, alertId, throttlePeriod);
      }, 500);

      $scope.$watch(() => this.data, data => {
        this.renderReact(data);
      });
    }

    renderReact(data) {
      const component = (
        <I18nContext>
          <StackAlerts
            {...data}
            toggleAlertState={this.toggleAlertState}
            throttleAlert={this.throttleAlert}
            sorting={this.sorting}
            pagination={this.pagination}
            onTableChange={this.onTableChange}
          />
        </I18nContext>
      );
      super.renderReact(component);
    }
  }
});
