/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */
import { Alert } from '../../alerting/common';

export interface CommonBaseAlert {
  type: string;
  label: string;
  throttle: string;
  rawAlert: Alert;
}

export interface CommonActionDefaultParameters {
  [alertTypeId: string]: {
    [actionTypeId: string]: any;
  };
}

export interface CommonAlertStatus {
  exists: boolean;
  enabled: boolean;
  states: CommonAlertState[];
  alert: CommonBaseAlert;
}

export interface CommonAlertState {
  firing: boolean;
  state: any;
  meta: any;
}
