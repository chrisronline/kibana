/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { mergeAndPreserveDuplicateKeys, REMOVAL_PREFIX, ADDITION_PREFIX } from "../diff_tools";

describe('diff_tools', () => {
  it('should create a consolidated json object with diffs and removals', () => {
    const source = {
      foo: 1,
      bar: {
        la: 2,
        lo: ['lalo'],
        foobar: {
          bar: 'lola',
        }
      },
      another: {
        other: 1,
      }
    };

    const target = {
      foo: 2,
      bar: {
        la: 2,
        lo: ['lalo*'],
        foobar: {
          bar: 'lola',
          barfoo: 2,
        }
      }
    };

    const result = mergeAndPreserveDuplicateKeys(source, target);
    expect(result).toEqual({
      result: {
        [`${REMOVAL_PREFIX}foo`]: 1,
        [`${ADDITION_PREFIX}foo`]: 2,
        bar: {
          la: 2,
          [`${REMOVAL_PREFIX}lo`]: ['lalo'],
          [`${ADDITION_PREFIX}lo`]: ['lalo*'],
          foobar: {
            bar: 'lola',
            [`${ADDITION_PREFIX}barfoo`]: 2,
          }
        },
        another: {
          other: 1,
        }
      },
      changes: [
        {
          key: 'foo',
          original: 1,
          updated: 2,
        },
        {
          key: 'lo',
          original: ['lalo'],
          updated: ['lalo*']
        },
        {
          key: 'barfoo',
          updated: 2,
        }
      ]
    });

  });
});
