/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */
import { IUiSettingsClient, Logger } from 'kibana/server';
import { i18n } from '@kbn/i18n';
import { BaseAlert } from './base_alert';
import {
  AlertData,
  AlertCluster,
  AlertState,
  AlertMessage,
  AlertCpuUsageState,
  AlertCpuUsageNodeStats,
  AlertMessageTimeToken,
  AlertMessageLinkToken,
  AlertStates,
} from './types';
import { AlertInstance, AlertServices } from '../../../alerting/server';
import {
  INDEX_PATTERN_ELASTICSEARCH,
  ALERT_CPU_USAGE,
  ALERT_ACTION_TYPE_EMAIL,
  ALERT_ACTION_TYPE_LOG,
} from '../../common/constants';
import { fetchCpuUsageNodeStats } from '../lib/alerts/fetch_cpu_usage_node_stats';
import { getCcsIndexPattern } from '../lib/alerts/get_ccs_index_pattern';
import { AlertMessageTokenType, AlertSeverity, AlertParamType } from '../../common/enums';
import { RawAlertInstance } from '../../../alerting/common';
import { parseDuration } from '../../../alerting/common/parse_duration';
import {
  CommonAlertFilter,
  CommonAlertCpuUsageFilter,
  CommonAlertParams,
  CommonAlertParamDetail,
} from '../../common/types';
import { AlertsClient } from '../../../alerting/server';

const RESOLVED = i18n.translate('xpack.monitoring.alerts.cpuUsage.resolved', {
  defaultMessage: 'resolved',
});
const FIRING = i18n.translate('xpack.monitoring.alerts.cpuUsage.firing', {
  defaultMessage: 'firing',
});

const DEFAULT_THRESHOLD = -1;
const DEFAULT_DURATION = '5m';

interface CpuUsageParams {
  threshold: number;
  duration: string;
}

export class CpuUsageAlert extends BaseAlert {
  public static paramDetails = {
    threshold: {
      label: `Notify when CPU is over`,
      type: AlertParamType.Percentage,
    } as CommonAlertParamDetail,
    duration: {
      label: `Look at the average over`,
      type: AlertParamType.Duration,
    } as CommonAlertParamDetail,
  };

  public type = ALERT_CPU_USAGE;
  public label = 'CPU Usage';

  protected defaultParams: CpuUsageParams = {
    threshold: DEFAULT_THRESHOLD,
    duration: DEFAULT_DURATION,
  };

  protected async fetchData(
    params: CommonAlertParams,
    callCluster: any,
    clusters: AlertCluster[],
    uiSettings: IUiSettingsClient,
    availableCcs: string[]
  ): Promise<AlertData[]> {
    let esIndexPattern = INDEX_PATTERN_ELASTICSEARCH;
    if (availableCcs) {
      esIndexPattern = getCcsIndexPattern(esIndexPattern, availableCcs);
    }
    const duration = parseDuration(((params as unknown) as CpuUsageParams).duration);
    const endMs = +new Date();
    const startMs = endMs - duration;
    const stats = await fetchCpuUsageNodeStats(
      callCluster,
      clusters,
      esIndexPattern,
      startMs,
      endMs,
      this.config
    );
    // TODO: ignore single spikes? look for consistency?
    return stats.map((stat) => {
      let cpuUsage = 0;
      if (this.config.ui.container.elasticsearch.enabled) {
        cpuUsage =
          (stat.containerUsage / (stat.containerPeriods * stat.containerQuota * 1000)) * 100;
      } else {
        cpuUsage = stat.cpuUsage;
      }

      return {
        instanceKey: `${stat.clusterUuid}:${stat.nodeId}`,
        clusterUuid: stat.clusterUuid,
        shouldFire: cpuUsage > params.threshold,
        severity: AlertSeverity.Danger,
        meta: stat,
        ccs: stat.ccs,
      };
    });
  }

  public async getStates(alertsClient: AlertsClient, id: string, filters: any[]) {
    const states = await super.getStates(alertsClient, id, filters);
    return Object.keys(states).reduce((accum, stateType) => {
      return {
        ...accum,
        [stateType]: {
          ...states[stateType],
          meta: {
            ...states[stateType].meta,
            metrics: ['node_cpu_metric'],
          },
        },
      };
    }, {});
  }

  protected filterAlertInstance(alertInstance: RawAlertInstance, filters: CommonAlertFilter[]) {
    const state = (alertInstance.state as unknown) as AlertCpuUsageState;
    if (filters && filters.length) {
      for (const _filter of filters) {
        const filter = _filter as CommonAlertCpuUsageFilter;
        if (filter && filter.nodeUuid) {
          if (state.nodeId !== filter.nodeUuid) {
            return false;
          }
        }
      }
    }
    return true;
  }

  protected getDefaultAlertState(cluster: AlertCluster, item: AlertData): AlertCpuUsageState {
    const stat = item.meta as AlertCpuUsageNodeStats;
    return {
      cluster,
      ccs: item.ccs,
      cpuUsage: stat.cpuUsage,
      nodeId: stat.nodeId,
      nodeName: stat.nodeName,
      ui: {
        isFiring: false,
        message: null,
        severity: AlertSeverity.Danger,
        resolvedMS: 0,
        triggeredMS: 0,
        lastCheckedMS: 0,
      },
    };
  }

  protected getUiMessage(alertState: AlertState, item: AlertData): AlertMessage {
    const stat = item.meta as AlertCpuUsageNodeStats;
    if (!alertState.ui.isFiring) {
      return {
        text: i18n.translate('xpack.monitoring.alerts.cpuUsage.ui.resolvedMessage', {
          defaultMessage: `The cpu usage on node {nodeName} is now under the threshold, currently reporting at {cpuUsage}% as of #resolved`,
          values: {
            nodeName: stat.nodeName,
            cpuUsage: stat.cpuUsage.toFixed(2),
          },
        }),
        tokens: [
          {
            startToken: '#resolved',
            type: AlertMessageTokenType.Time,
            isAbsolute: true,
            isRelative: false,
            timestamp: alertState.ui.resolvedMS,
          } as AlertMessageTimeToken,
        ],
      };
    }
    return {
      text: i18n.translate('xpack.monitoring.alerts.cpuUsage.ui.firingMessage', {
        defaultMessage: `Node {nodeName} is reporting cpu usage of {cpuUsage}% at #absolute`,
        values: {
          nodeName: stat.nodeName,
          cpuUsage: stat.cpuUsage.toFixed(2),
        },
      }),
      nextSteps: [
        {
          text: i18n.translate('xpack.monitoring.alerts.cpuUsage.ui.nextSteps.message1', {
            defaultMessage: `#start_linkInvestigate node#end_link`,
          }),
          tokens: [
            {
              startToken: '#start_link',
              endToken: '#end_link',
              type: AlertMessageTokenType.Link,
              url: `elasticsearch/nodes/${stat.nodeId}`,
            } as AlertMessageLinkToken,
          ],
        },
      ],
      tokens: [
        {
          startToken: '#absolute',
          type: AlertMessageTokenType.Time,
          isAbsolute: true,
          isRelative: false,
          timestamp: alertState.ui.triggeredMS,
        } as AlertMessageTimeToken,
      ],
    };
  }

  protected executeActions(
    instance: AlertInstance,
    alertStates: AlertStates,
    item: AlertData,
    cluster: AlertCluster
  ) {
    const { states, isFiring } = alertStates;
    const nodes = states
      .map((_state) => {
        const state = _state as AlertCpuUsageState;
        return `${state.nodeName}:${state.cpuUsage.toFixed(2)}`;
      })
      .join(',');

    const ccs = states.reduce((accum: string, state): string => {
      if (state.ccs) {
        return state.ccs;
      }
      return accum;
    }, '');

    if (!isFiring) {
      instance.scheduleActions('default', {
        state: RESOLVED,
        nodes,
        count: states.length,
        clusterName: cluster.clusterName,
      });
    } else {
      const globalState = [`cluster_uuid:${cluster.clusterUuid}`];
      if (ccs) {
        globalState.push(`ccs:${ccs}`);
      }
      const url = `${this.kibanaUrl}/app/monitoring#elasticsearch/nodes?_g=(${globalState.join(
        ','
      )})`;
      instance.scheduleActions('default', {
        state: FIRING,
        nodes,
        count: states.length,
        clusterName: cluster.clusterName,
        action: `[Investigate](${url})`,
      });
    }
  }

  protected processData(
    data: AlertData[],
    clusters: AlertCluster[],
    services: AlertServices,
    logger: Logger
  ) {
    for (const cluster of clusters) {
      const nodes = data.filter((_item) => _item.clusterUuid === cluster.clusterUuid);
      if (nodes.length === 0) {
        continue;
      }

      const alertState: AlertStates = {
        states: [],
        isFiring: false,
      };
      const instance = services.alertInstanceFactory(`${this.type}:${cluster.clusterUuid}`);
      let shouldExecuteActions = false;
      for (const node of nodes) {
        const nodeState: AlertState = this.getDefaultAlertState(cluster, node);
        if (node.shouldFire) {
          nodeState.ui.triggeredMS = +new Date();
          alertState.isFiring = nodeState.ui.isFiring = true;
          nodeState.ui.message = this.getUiMessage(nodeState, node);
          nodeState.ui.severity = node.severity;
          nodeState.ui.resolvedMS = 0;
          shouldExecuteActions = true;
        } else if (!node.shouldFire && nodeState.ui.isFiring) {
          nodeState.ui.isFiring = false;
          nodeState.ui.resolvedMS = +new Date();
          nodeState.ui.message = this.getUiMessage(nodeState, node);
          shouldExecuteActions = true;
        }
        alertState.states.push(nodeState);
      }

      instance.replaceState(alertState);
      if (shouldExecuteActions) {
        this.executeActions(instance, alertState, null, cluster);
      }
    }
  }

  public getDefaultActionParams(actionTypeId: string) {
    switch (actionTypeId) {
      case ALERT_ACTION_TYPE_EMAIL:
        return {
          subject: i18n.translate('xpack.monitoring.alerts.cpuUsage.emailSubject', {
            defaultMessage: `CPU usage alert is firing for {count} node(s) in cluster: {clusterName}`,
            // defaultMessage: `CPU usage alert is {state} for {nodeName} in {clusterName}. CPU usage is {cpuUsage}`,
            values: {
              count: '{{context.count}}',
              clusterName: '{{context.clusterName}}',
            },
          }),
          message: i18n.translate('xpack.monitoring.alerts.cpuUsage.emailMessage', {
            defaultMessage: `{action}`,
            values: {
              action: '{{context.action}}',
            },
          }),
        };
      case ALERT_ACTION_TYPE_LOG:
        // Want to get other notifiations for this kind of issue? Visit the Stack Monitoring UI in Kibana to find out more.s
        return {
          message: i18n.translate('xpack.monitoring.alerts.cpuUsage.serverLog', {
            defaultMessage: `CPU usage alert is firing for {count} node(s) in cluster: {clusterName}`,
            values: {
              count: '{{context.count}}',
              clusterName: '{{context.clusterName}}',
            },
          }),
        };
    }
    return null;
  }
}
