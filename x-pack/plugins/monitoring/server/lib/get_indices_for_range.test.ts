/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */
import moment from 'moment';
import { INDEX_PATTERN_ELASTICSEARCH } from '../../common/constants';
import { getIndicesForRange } from './get_indices_for_range';

const NOW = '2020-01-01T00:00:00.000';

jest.mock('moment', () => {
  return (time: any) => jest.requireActual('moment')(time || '2020-01-01T00:00:00.000');
});

describe('getIndicesForRange', () => {
  it('should work for a time range within a day', async () => {
    const start = +moment(NOW).subtract(1, 'hour');
    const end = +moment(NOW);
    const pattern = getIndicesForRange(start, end, `${INDEX_PATTERN_ELASTICSEARCH},metricbeat-*`);
    expect(pattern).toBe(
      '.monitoring-es-6-*2020.01.01*,.monitoring-es-7-*2020.01.01*,metricbeat-*2020.01.01*'
    );
  });

  it('should work for a longer time range', async () => {
    const start = +moment(NOW).subtract(1, 'week');
    const end = +moment(NOW);
    const pattern = getIndicesForRange(start, end, `${INDEX_PATTERN_ELASTICSEARCH},metricbeat-*`);
    expect(pattern).toBe(
      '.monitoring-es-6-*2020.01.01*,.monitoring-es-6-*2019.12.31*,.monitoring-es-6-*2019.12.30*,.monitoring-es-6-*2019.12.29*,.monitoring-es-6-*2019.12.28*,.monitoring-es-6-*2019.12.27*,.monitoring-es-6-*2019.12.26*,.monitoring-es-7-*2020.01.01*,.monitoring-es-7-*2019.12.31*,.monitoring-es-7-*2019.12.30*,.monitoring-es-7-*2019.12.29*,.monitoring-es-7-*2019.12.28*,.monitoring-es-7-*2019.12.27*,.monitoring-es-7-*2019.12.26*,metricbeat-*2020.01.01*,metricbeat-*2019.12.31*,metricbeat-*2019.12.30*,metricbeat-*2019.12.29*,metricbeat-*2019.12.28*,metricbeat-*2019.12.27*,metricbeat-*2019.12.26*'
    );
  });
});
