/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */
import { UiSettingsServiceStart, ICustomClusterClient, Logger } from 'kibana/server';
import { AlertClusterHealthType, AlertMessageTokenType, AlertSeverity } from '../../common/enums';
import { MonitoringConfig } from '../config';

export interface AlertLicense {
  status: string;
  type: string;
  expiryDateMS: number;
  clusterUuid: string;
  ccs: string;
}

export interface AlertClusterHealth {
  health: AlertClusterHealthType;
  clusterUuid: string;
}

export interface AlertState {
  cluster: AlertCluster;
  ccs: string | null;
  ui: AlertUiState;
}

export interface AlertStates {
  states: AlertState[];
  isFiring: boolean;
}

export interface AlertClusterHealthState extends AlertState {
  health: AlertClusterHealthType;
}

export interface AlertLicenseState extends AlertState {
  expiredCheckDateMS: number;
}

export interface AlertCpuUsageState extends AlertState {
  cpuUsage: number;
  nodeId: string;
  nodeName: string;
}

export interface AlertUiState {
  isFiring: boolean;
  severity: AlertSeverity;
  message: AlertMessage | null;
  resolvedMS: number;
  lastCheckedMS: number;
  triggeredMS: number;
}

export interface AlertMessage {
  text: string; // Do this. #link this is a link #link
  nextSteps?: AlertMessage[];
  tokens?: AlertMessageToken[];
}

export interface AlertMessageToken {
  startToken: string;
  endToken?: string;
  type: AlertMessageTokenType;
}

export interface AlertMessageLinkToken extends AlertMessageToken {
  url?: string;
}

export interface AlertMessageTimeToken extends AlertMessageToken {
  isRelative: boolean;
  isAbsolute: boolean;
  timestamp: number;
}

export interface AlertLicenseUiState extends AlertUiState {
  expirationTime: number;
}

export interface AlertCluster {
  clusterUuid: string;
  clusterName: string;
}

export interface AlertParams {
  dateFormat: string;
  timezone: string;
}

export interface AlertCreationParameters {
  getUiSettingsService: () => Promise<UiSettingsServiceStart>;
  monitoringCluster: ICustomClusterClient;
  getLogger: (...scopes: string[]) => Logger;
  config: MonitoringConfig;
  kibanaUrl: string;
}

export interface AlertCpuUsageNodeStats {
  clusterUuid: string;
  nodeId: string;
  nodeName: string;
  cpuUsage: number;
  containerUsage: number;
  containerPeriods: number;
  containerQuota: number;
  ccs: string | null;
}

export interface AlertCpuUsageActionable {
  cluster: AlertCluster;
  nodeName: string;
  cpuUsage: number;
}

export interface AlertData {
  instanceKey: string;
  clusterUuid: string;
  ccs: string | null;
  shouldFire: boolean;
  severity: AlertSeverity;
  meta: any;
}

export interface LegacyAlert {
  prefix: string;
  message: string;
  metadata: {
    severity: number;
    cluster_uuid: string;
  };
}
