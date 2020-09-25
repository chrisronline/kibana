/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */
import moment from 'moment';

const DATE_FORMAT = 'YYYY.MM.DD';

export function getIndicesForRange(start: number, end: number, indexPattern: string) {
  const daysToUse: string[] = [];
  const differenceInDays = moment(end).diff(moment(start), 'days');
  if (differenceInDays === 0) {
    daysToUse.push(moment().format(DATE_FORMAT));
  } else {
    for (let i = 0; i < differenceInDays; i++) {
      daysToUse.push(moment().subtract(i, 'days').format(DATE_FORMAT));
    }
  }

  return indexPattern
    .split(',')
    .reduce((accum: string[], indexPatternPart) => {
      const pattern = indexPatternPart.substr(0, indexPatternPart.length - 1);
      for (const day of daysToUse) {
        accum.push(`${pattern}*${day}*`);
      }
      return accum;
    }, [])
    .join(',');
}
