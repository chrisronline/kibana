/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { PluginInitializerContext, CoreStart } from 'kibana/public';
import { NavigationPublicPluginStart as NavigationStart } from '../../../../src/plugins/navigation/public';
import { DataPublicPluginStart } from '../../../../src/plugins/data/public';
import { TriggersAndActionsUIPublicPluginSetup } from '../../triggers_actions_ui/public';

// eslint-disable-next-line @kbn/eslint/no-restricted-paths
export { MonitoringConfig } from '../server';

export interface MonitoringPluginDependencies {
  navigation: NavigationStart;
  data: DataPublicPluginStart;
  element: HTMLElement;
  core: CoreStart;
  isCloud: boolean;
  pluginInitializerContext: PluginInitializerContext;
  externalConfig: Array<Array<string | number> | Array<string | boolean>>;
  triggersActionsUi: TriggersAndActionsUIPublicPluginSetup;
}
