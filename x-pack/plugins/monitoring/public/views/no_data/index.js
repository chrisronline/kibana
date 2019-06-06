/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import uiRoutes from 'ui/routes';
import template from './index.html';
import { NoDataController } from './controller';
import { setAngularState, toggleSetupMode } from '../../lib/setup_mode';

uiRoutes
  .when('/no-data', {
    template,
    resolve: {
      clusters: ($injector, $rootScope) => {
        const monitoringClusters = $injector.get('monitoringClusters');
        const kbnUrl = $injector.get('kbnUrl');

        return monitoringClusters().then(clusters => {
          if (clusters && clusters.length) {
            kbnUrl.changePath('/home');
            return Promise.reject();
          }
          setAngularState($rootScope, $injector);
          return toggleSetupMode(true)
            .then(() => {
              return kbnUrl.changePath('/elasticsearch/nodes');
            })
            .catch(err => {
              console.log('promise error', { err });
            })
            .finally(() => {
              return Promise.resolve();
            });
        });
      }
    },
    controller: NoDataController
  })
  .otherwise({ redirectTo: '/home' });
