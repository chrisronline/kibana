/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import Joi from 'joi';
import { handleError } from '../../../../lib/errors/handle_error';
import {
  getStackAlerts,
  deactivateStackAlert,
  activateStackAlert,
  throttleStackAlert
} from '../../../../lib/stack_alerts/get_stack_alerts';

export function stackAlertsRoute(server) {
  server.route({
    method: 'POST',
    path: '/api/monitoring/v1/clusters/{clusterUuid}/stack_alerts',
    config: {
      validate: {
        params: Joi.object({
          clusterUuid: Joi.string().required()
        }),
        payload: Joi.object({
          ccs: Joi.string().optional(),
        })
      }
    },
    async handler(req) {
      try {
        const alerts = await getStackAlerts(req);
        return { alerts };
      } catch(err) {
        throw handleError(err, req);
      }
    }
  });

  server.route({
    method: 'POST',
    path: '/api/monitoring/v1/clusters/{clusterUuid}/stack_alert/{alertId}/deactivate',
    config: {
      validate: {
        params: Joi.object({
          clusterUuid: Joi.string().required(),
          alertId: Joi.string().required(),
        }),
      }
    },
    async handler(req) {
      try {
        return await deactivateStackAlert(req, req.params.alertId);
      } catch(err) {
        throw handleError(err, req);
      }
    }
  });

  server.route({
    method: 'POST',
    path: '/api/monitoring/v1/clusters/{clusterUuid}/stack_alert/{alertId}/activate',
    config: {
      validate: {
        params: Joi.object({
          clusterUuid: Joi.string().required(),
          alertId: Joi.string().required(),
        }),
      }
    },
    async handler(req) {
      try {
        return await activateStackAlert(req, req.params.alertId);
      } catch(err) {
        throw handleError(err, req);
      }
    }
  });

  server.route({
    method: 'POST',
    path: '/api/monitoring/v1/clusters/{clusterUuid}/stack_alert/{alertId}/throttle',
    config: {
      validate: {
        params: Joi.object({
          clusterUuid: Joi.string().required(),
          alertId: Joi.string().required(),
        }),
        payload: Joi.object({
          throttlePeriod: Joi.string().required(),
        }).required()
      }
    },
    async handler(req) {
      try {
        return await throttleStackAlert(req, req.params.alertId, req.payload.throttlePeriod);
      } catch(err) {
        throw handleError(err, req);
      }
    }
  });
}
