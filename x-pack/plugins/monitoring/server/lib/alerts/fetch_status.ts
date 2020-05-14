/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */
import moment from 'moment';
import { Logger } from '../../../../../../src/core/server';
import { AlertState } from '../../alerts/types';
import { AlertsClient } from '../../../../alerting/server';
import { AlertsFactory } from '../../alerts';
import { CommonAlertStatus, CommonAlertState } from '../../../common/types';

export async function fetchStatus(
  alertsClient: AlertsClient,
  alertTypes: string[],
  clusterUuid: string,
  start: number,
  end: number,
  log: Logger
): Promise<any> {
  const byType: { [type: string]: CommonAlertStatus } = {};
  await Promise.all(
    alertTypes.map(async type => {
      const alert = await AlertsFactory.getByType(type, alertsClient);
      const result: CommonAlertStatus = {
        exists: false,
        enabled: false,
        states: [],
        alert,
      };

      byType[type] = result;

      const id = alert.getId();
      if (!id) {
        return result;
      }

      result.exists = true;
      result.enabled = true;

      // Now that we have the id, we can get the state
      const states = await alertsClient.getAlertState({ id });
      if (!states || !states.alertInstances) {
        result.enabled = true;
        return result;
      }

      result.states = Object.values(states.alertInstances).reduce(
        (accum: CommonAlertState[], instance: any) => {
          const state = instance.state as AlertState;
          const meta = instance.meta;
          if (clusterUuid && state.cluster.clusterUuid !== clusterUuid) {
            return accum;
          }

          let firing = false;
          const isInBetween = moment(state.ui.resolvedMS).isBetween(start, end);
          if (state.ui.isFiring || isInBetween) {
            firing = true;
          }
          accum.push({ firing, state, meta });
          return accum;
        },
        []
      );

      return result;
    })
  );

  return byType;
}
