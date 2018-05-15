/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { registerFetchRoute } from './register_fetch_route';
import { registerLoadRoute } from './register_load_route';
import { registerCreateRoute } from './register_create_route';

export function registerPoliciesRoutes(server) {
  registerFetchRoute(server);
  registerLoadRoute(server);
  registerCreateRoute(server);
}
