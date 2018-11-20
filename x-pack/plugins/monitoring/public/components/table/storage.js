/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { get, set } from 'lodash';
import { STORAGE_KEY } from '../../../common/constants';

export const tableStorageGetter = keyPrefix => {
  return storage => {
    const localStorageData = storage.get(STORAGE_KEY) || {};
    const sort = get(localStorageData, [ keyPrefix, 'sort' ]);
    const page  = get(localStorageData, [ keyPrefix, 'page' ]);

    return { page, sort };
  };
};

export const tableStorageSetter = keyPrefix => {
  return (storage, { sort, page }) => {
    const localStorageData = storage.get(STORAGE_KEY) || {};

    set(localStorageData, [ keyPrefix, 'sort' ], sort || undefined); // don`t store empty data
    set(localStorageData, [ keyPrefix, 'page' ], page || undefined);

    storage.set(STORAGE_KEY, localStorageData);

    return localStorageData;
  };
};
