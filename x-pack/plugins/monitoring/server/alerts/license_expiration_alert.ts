/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */
import moment from 'moment';
import { IUiSettingsClient } from 'kibana/server';
import { i18n } from '@kbn/i18n';
import { BaseAlert } from './base_alert';
import {
  AlertData,
  AlertCluster,
  AlertState,
  AlertMessage,
  AlertMessageTimeToken,
  AlertMessageLinkToken,
  AlertLicense,
  AlertLicenseState,
  AlertInstanceState,
} from './types';
import { AlertInstance, AlertExecutorOptions } from '../../../alerts/server';
import {
  INDEX_ALERTS,
  INDEX_PATTERN_ELASTICSEARCH,
  ALERT_LICENSE_EXPIRATION,
  ALERT_ACTION_TYPE_EMAIL,
  ALERT_ACTION_TYPE_LOG,
} from '../../common/constants';
import { getCcsIndexPattern } from '../lib/alerts/get_ccs_index_pattern';
import { AlertMessageTokenType, AlertSeverity } from '../../common/enums';
import { fetchLicenses } from '../lib/alerts/fetch_licenses';
import { fetchDefaultEmailAddress } from '../lib/alerts/fetch_default_email_address';
import { CommonAlertParams } from '../../common/types';
import { fetchLegacyAlerts } from '../lib/alerts/fetch_legacy_alerts';

const RESOLVED = i18n.translate('xpack.monitoring.alerts.licenseExpiration.resolved', {
  defaultMessage: 'resolved',
});
const FIRING = i18n.translate('xpack.monitoring.alerts.licenseExpiration.firing', {
  defaultMessage: 'firing',
});

const EXPIRES_DAYS = [60, 30, 14, 7];

const WATCH_NAME = 'xpack_license_expiration';

export class LicenseExpirationAlert extends BaseAlert {
  public type = ALERT_LICENSE_EXPIRATION;
  public label = 'License expiration';
  public isLegacy = true;

  protected dateFormat: string = '';
  protected emailAddress: string = '';

  protected async execute(options: AlertExecutorOptions): Promise<any> {
    await super.execute(options);

    const uiSettings = (await this.getUiSettingsService()).asScopedToClient(
      options.services.savedObjectsClient
    );
    this.dateFormat = await uiSettings.get<string>('dateFormat');
    this.emailAddress = await fetchDefaultEmailAddress(uiSettings);
  }

  protected async fetchData(
    params: CommonAlertParams,
    callCluster: any,
    clusters: AlertCluster[],
    uiSettings: IUiSettingsClient,
    availableCcs: string[]
  ): Promise<AlertData[]> {
    const logger = this.getLogger(this.type);
    let alertIndexPattern = INDEX_ALERTS;
    if (availableCcs) {
      alertIndexPattern = getCcsIndexPattern(alertIndexPattern, availableCcs);
    }
    let esIndexPattern = INDEX_PATTERN_ELASTICSEARCH;
    if (availableCcs) {
      esIndexPattern = getCcsIndexPattern(esIndexPattern, availableCcs);
    }
    const [licenses, legacyAlerts] = await Promise.all([
      await fetchLicenses(callCluster, clusters, esIndexPattern),
      await fetchLegacyAlerts(
        callCluster,
        clusters,
        alertIndexPattern,
        WATCH_NAME,
        this.config.ui.max_bucket_size
      ),
    ]);
    return legacyAlerts.reduce((accum: AlertData[], legacyAlert) => {
      const license = licenses.find(
        (_license) => _license.clusterUuid === legacyAlert.metadata.cluster_uuid
      );
      if (!license) {
        // This is potentially bad
        logger.warn(
          `Unable to map legacy alert status to license for ${legacyAlert.metadata.cluster_uuid}. No alert will show in the UI but it is assumed the alert has been resolved.`
        );
        return accum;
      }

      const $expiry = moment.utc(license.expiryDateMS);
      let isExpired = false;
      let severity = AlertSeverity.Success;

      if (license.status !== 'active') {
        isExpired = true;
        severity = AlertSeverity.Danger;
      } else if (license.expiryDateMS) {
        for (let i = EXPIRES_DAYS.length - 1; i >= 0; i--) {
          if (license.type === 'trial' && i < 2) {
            break;
          }

          const $fromNow = moment.utc().add(EXPIRES_DAYS[i], 'days');
          if ($fromNow.isAfter($expiry)) {
            isExpired = true;
            severity = i > 1 ? AlertSeverity.Warning : AlertSeverity.Danger;
            break;
          }
        }
      }

      accum.push({
        instanceKey: `${license.clusterUuid}`,
        clusterUuid: license.clusterUuid,
        shouldFire: isExpired,
        severity,
        meta: license,
        ccs: license.ccs,
      });
      return accum;
    }, []);
  }

  protected getDefaultAlertState(cluster: AlertCluster, item: AlertData): AlertLicenseState {
    const license = item.meta as AlertLicense;
    return {
      cluster,
      ccs: null,
      expiredCheckDateMS: license.expiryDateMS,
      ui: {
        isFiring: false,
        message: null,
        severity: AlertSeverity.Success,
        resolvedMS: 0,
        triggeredMS: 0,
        lastCheckedMS: 0,
      },
    };
  }

  protected getUiMessage(alertState: AlertState, item: AlertData): AlertMessage {
    const license = item.meta as AlertLicense;
    if (!alertState.ui.isFiring) {
      return {
        text: i18n.translate('xpack.monitoring.alerts.licenseExpiration.ui.resolvedMessage', {
          defaultMessage: `This cluster's license is active.`,
        }),
      };
    }
    return {
      text: i18n.translate('xpack.monitoring.alerts.licenseExpiration.ui.firingMessage', {
        defaultMessage: `This cluster's license is going to expire in #relative at #absolute. #start_linkPlease update your license.#end_link`,
      }),
      tokens: [
        {
          startToken: '#relative',
          type: AlertMessageTokenType.Time,
          isRelative: true,
          isAbsolute: false,
          timestamp: license.expiryDateMS,
        } as AlertMessageTimeToken,
        {
          startToken: '#absolute',
          type: AlertMessageTokenType.Time,
          isAbsolute: true,
          isRelative: false,
          timestamp: license.expiryDateMS,
        } as AlertMessageTimeToken,
        {
          startToken: '#start_link',
          endToken: '#end_link',
          type: AlertMessageTokenType.Link,
          url: 'license',
        } as AlertMessageLinkToken,
      ],
    };
  }

  protected async executeActions(
    instance: AlertInstance,
    instanceState: AlertInstanceState,
    item: AlertData,
    cluster: AlertCluster
  ) {
    if (instanceState.alertStates.length === 0) {
      return;
    }
    const alertState = instanceState.alertStates[0];
    const license = item.meta;
    const $expiry = moment.utc(license.expiryDateMS);
    if (!alertState.ui.isFiring) {
      instance.scheduleActions('default', {
        state: RESOLVED,
        expiredDate: $expiry.calendar(),
        clusterName: cluster.clusterName,
      });
    } else {
      instance.scheduleActions('default', {
        state: FIRING,
        expiredDate: $expiry.calendar(),
        clusterName: cluster.clusterName,
        action: i18n.translate('xpack.monitoring.alerts.licenseExpiration.action', {
          defaultMessage: 'Please update your license',
        }),
      });
    }
  }

  public getDefaultActionParams(actionTypeId: string) {
    switch (actionTypeId) {
      case ALERT_ACTION_TYPE_EMAIL:
        return {
          subject: i18n.translate('xpack.monitoring.alerts.licenseExpiration.emailSubject', {
            defaultMessage: `License expiration alert is {state} for {clusterName}`,
            values: {
              state: '{{context.state}}',
              clusterName: '{{context.clusterName}}',
            },
          }),
          message: i18n.translate('xpack.monitoring.alerts.licenseExpiration.emailMessage', {
            defaultMessage: `Your license will expire on {expiredDate} for {clusterName}. {action}`,
            values: {
              expiredDate: '{{context.expiredDate}}',
              action: '{{context.action}}',
              clusterName: '{{context.clusterName}}',
            },
          }),
        };
      case ALERT_ACTION_TYPE_LOG:
        return {
          message: i18n.translate('xpack.monitoring.alerts.licenseExpiration.serverLog', {
            defaultMessage: `License expiration alert is {state} for {clusterName}. Your license will expire on {expiredDate}. {action}`,
            values: {
              state: '{{context.state}}',
              expiredDate: '{{context.expiredDate}}',
              action: '{{context.action}}',
              clusterName: '{{context.clusterName}}',
            },
          }),
        };
    }
    return null;
  }
}
