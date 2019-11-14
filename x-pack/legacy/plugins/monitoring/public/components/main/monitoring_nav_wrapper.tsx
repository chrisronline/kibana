/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React from 'react';
import { timefilter } from 'ui/timefilter';
import { RefreshInterval, InputTimeRange } from 'src/plugins/data/public';
import {
  EuiSuperDatePicker,
  EuiFlexGroup,
  EuiFlexItem,
  EuiSpacer,
  EuiTabs,
  EuiTab,
  OnTimeChangeProps,
} from '@elastic/eui';

export interface MonitoringNavWrapperProps {
  name: string;
  $executor: any;
  tabs: MonitoringTab[];
  children: React.ReactNode;
}

export interface MonitoringTab {
  href?: string;
  label: string;
  disabled: boolean;
}

interface EuiTabProps {
  key: number;
  href?: string;
  onClick?: () => void;
  isSelected?: boolean;
  disabled?: boolean;
}

function getSelectedTab() {
  const hashResults = window.location.hash.match(/([^?]+)\?/);
  if (hashResults && hashResults.length) {
    return hashResults[1];
  }
  return null;
}

export const MonitoringNavWrapper: React.FC<MonitoringNavWrapperProps> = (
  props: MonitoringNavWrapperProps
) => {
  const [dateRangeFrom, setDateRangeFrom] = React.useState(timefilter.getTime().from);
  const [dateRangeTo, setDateRangeTo] = React.useState(timefilter.getTime().to);
  const [isRefreshPaused, setIsRefreshPaused] = React.useState(false);
  const [refreshInterval, setRefreshInterval] = React.useState(
    timefilter.getRefreshInterval().value
  );

  const selectedTab = getSelectedTab();

  React.useEffect(() => {
    const interval: RefreshInterval = {
      pause: isRefreshPaused,
      value: refreshInterval,
    };
    timefilter.setRefreshInterval(interval);
  }, [isRefreshPaused, refreshInterval]);

  React.useEffect(() => {
    const range: InputTimeRange = {
      from: dateRangeFrom,
      to: dateRangeTo,
    };
    timefilter.setTime(range);
  }, [dateRangeFrom, dateRangeTo]);

  function onRefreshChange(data: { isPaused: boolean; refreshInterval: number }) {
    setIsRefreshPaused(data.isPaused);
    setRefreshInterval(data.refreshInterval);
  }

  function onTimeChange(data: OnTimeChangeProps) {
    setDateRangeFrom(data.start);
    setDateRangeTo(data.end);

    props.$executor.cancel();
    props.$executor.run();
  }

  function renderTabs() {
    const tabs = props.tabs || [];
    return tabs.map((tab: MonitoringTab, index: number) => {
      const tabProps: EuiTabProps = {
        key: index,
      };

      if (tab.href) {
        tabProps.href = tab.href;
        tabProps.isSelected = tab.href === selectedTab;
        tabProps.disabled = tab.disabled;
      }

      return <EuiTab {...tabProps}>{tab.label}</EuiTab>;
    });
  }

  return (
    <div className="app-container">
      <EuiSpacer size="s" />
      <EuiFlexGroup justifyContent="spaceBetween">
        <EuiFlexItem grow={false} />
        <EuiFlexItem grow={false}>
          <div style={{ marginRight: '5px' }}>
            <EuiSuperDatePicker
              start={dateRangeFrom}
              end={dateRangeTo}
              isPaused={isRefreshPaused}
              refreshInterval={refreshInterval}
              onTimeChange={onTimeChange}
              onRefreshChange={onRefreshChange}
            />
          </div>
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiTabs>{renderTabs()}</EuiTabs>
      {props.children}
    </div>
  );
};
