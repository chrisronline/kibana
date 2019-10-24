/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import moment from 'moment';
import { Logger } from 'src/core/server';
import { ALERT_TYPE_LICENSE_EXPIRATION } from '../../common/constants';
import { AlertType, AlertExecutorOptions } from '../../../alerting';
import { fetchLicense } from '../lib/alerts/fetch_license';
import { fetchDefaultEmailAddress } from '../lib/alerts/fetch_default_email_address';
import { License, AlertState } from './types';

const EXPIRES_DAYS = [60, 30, 14, 7];

export const getLicenseExpiration = (
  getMonitoringCluster: any,
  getLogger: (contexts: string[]) => Logger
): AlertType => {
  async function getCallCluster(services: any): Promise<any> {
    const monitoringCluster = await getMonitoringCluster();
    if (!monitoringCluster) {
      return services.callCluster;
    }

    return monitoringCluster.callCluster;
  }

  const logger = getLogger([ALERT_TYPE_LICENSE_EXPIRATION]);
  return {
    id: ALERT_TYPE_LICENSE_EXPIRATION,
    name: 'Monitoring Alert - License Expiration',
    actionGroups: ['default'],
    async executor({ services, params, state }: AlertExecutorOptions): Promise<any> {
      logger.debug(
        `Firing alert with params: ${JSON.stringify(params)} and state: ${JSON.stringify(state)}`
      );

      const { clusterUuid } = params;
      const callCluster = await getCallCluster(services);

      // Fetch licensing information from cluster_stats documents
      const license: License = await fetchLicense(callCluster, clusterUuid);
      if (!license) {
        logger.warn(`No license found for ${ALERT_TYPE_LICENSE_EXPIRATION}.`);
        return state;
      }

      const emailAddress = await fetchDefaultEmailAddress(services.savedObjectsClient);
      if (!emailAddress) {
        // TODO: we can do more here
        logger.warn(
          `Unable to send email for ${ALERT_TYPE_LICENSE_EXPIRATION} because there is no email configured.` +
            ` Please configure 'xpack.monitoring.cluster_alerts.email_notifications.email_address'.`
        );
        return;
      }

      const $expiry = moment.utc(license.expiry_date_in_millis);
      let isExpired = false;

      if (license.status !== 'active') {
        isExpired = true;
      } else if (license.expiry_date_in_millis) {
        for (let i = EXPIRES_DAYS.length - 1; i >= 0; i--) {
          if (license.type === 'trial' && i < 2) {
            break;
          }

          const $fromNow = moment().add(EXPIRES_DAYS[i], 'days');
          if ($fromNow.isAfter($expiry)) {
            isExpired = true;
          }
        }
      }

      const result: AlertState = {
        expired_check_date_in_millis: 0,
        ...state,
      };
      const instance = services.alertInstanceFactory(ALERT_TYPE_LICENSE_EXPIRATION);

      if (isExpired && !state.expired_check_date_in_millis) {
        logger.debug(`License will expire soon, sending email`);
        instance.scheduleActions('default', {
          subject: 'NEW X-Pack Monitoring: License Expiration',
          message: `This cluster's license is going to expire on ${$expiry.format()}. Please update your license.`,
          to: emailAddress,
        });
        result.expired_check_date_in_millis = moment().valueOf();
      } else if (!isExpired && state.expired_check_date_in_millis) {
        logger.debug(`License expiration has been resolved, sending email`);
        instance.scheduleActions('default', {
          subject: 'RESOLVED X-Pack Monitoring: License Expiration',
          message: `This cluster alert has been resolved: This cluster's license was going to expire on ${$expiry.format()}.`,
          to: emailAddress,
        });
        result.expired_check_date_in_millis = 0;
      }

      return result;
    },
  };
};
