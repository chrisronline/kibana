/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React from 'react';
import { render } from 'react-dom';
import { find } from 'lodash';
import uiRoutes from 'ui/routes';
import moment from 'moment';
import { ajaxErrorHandlersProvider } from 'plugins/monitoring/lib/ajax_error_handler';
import { routeInitProvider } from 'plugins/monitoring/lib/route_init';
import {
  isPipelineMonitoringSupportedInVersion
} from 'plugins/monitoring/lib/logstash/pipelines';
import template from './index.html';
import { timefilter } from 'ui/timefilter';
import { PipelineListing } from '../../../components/logstash/pipeline_listing/pipeline_listing';

/*
 * Logstash Pipelines Listing page
 */

const getPageData = ($injector) => {
  const $http = $injector.get('$http');
  const globalState = $injector.get('globalState');
  const Private = $injector.get('Private');

  const url = `../api/monitoring/v1/clusters/${globalState.cluster_uuid}/logstash/pipelines`;
  const timeBounds = timefilter.getBounds();

  return $http.post(url, {
    ccs: globalState.ccs,
    timeRange: {
      min: timeBounds.min.toISOString(),
      max: timeBounds.max.toISOString()
    }
  })
    .then(response => response.data)
    .catch((err) => {
      const ajaxErrorHandlers = Private(ajaxErrorHandlersProvider);
      return ajaxErrorHandlers(err);
    });
};

function makeUpgradeMessage(logstashVersions) {
  if (!Array.isArray(logstashVersions)
    || (logstashVersions.length === 0)
    || logstashVersions.some(isPipelineMonitoringSupportedInVersion)) {
    return null;
  }

  return 'Pipeline monitoring is only available in Logstash version 6.0.0 or higher.';
}

uiRoutes
  .when('/logstash/pipelines', {
    template,
    resolve: {
      clusters(Private) {
        const routeInit = Private(routeInitProvider);
        return routeInit();
      },
      pageData: getPageData
    },
    controller($injector, $scope) {
      const $route = $injector.get('$route');
      const globalState = $injector.get('globalState');
      const title = $injector.get('title');
      const $executor = $injector.get('$executor');
      const kbnUrl = $injector.get('kbnUrl');

      $scope.cluster = find($route.current.locals.clusters, { cluster_uuid: globalState.cluster_uuid });
      $scope.pageData = $route.current.locals.pageData;

      $scope.upgradeMessage = makeUpgradeMessage($scope.pageData.clusterStatus.versions);
      timefilter.enableTimeRangeSelector();
      timefilter.enableAutoRefreshSelector();

      title($scope.cluster, 'Logstash Pipelines');

      $executor.register({
        execute: () => getPageData($injector),
        handleResponse: (response) => $scope.pageData = response
      });

      $executor.start($scope);

      $scope.$on('$destroy', $executor.destroy);

      function onBrush(xaxis) {
        timefilter.setTime({
          from: moment(xaxis.from),
          to: moment(xaxis.to),
          mode: 'absolute'
        });
      }

      function renderReact(pageData) {
        render(
          <PipelineListing
            onBrush={onBrush}
            stats={pageData.clusterStatus}
            data={pageData.pipelines}
            sorting={$scope.sorting}
            pagination={$scope.pagination}
            onTableChange={$scope.onTableChange}
            upgradeMessage={$scope.upgradeMessage}
            angular={{
              kbnUrl,
              scope: $scope,
            }}
          />,
          document.getElementById('monitoringLogstashPipelinesApp')
        );
      }

      $scope.$watch('pageData', pageData => {
        renderReact(pageData);
      });
    }
  });
