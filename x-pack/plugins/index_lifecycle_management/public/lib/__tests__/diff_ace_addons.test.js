/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { addDiffAddonsForAce, setCurrentJsonObject } from '../diff_ace_addons';
import { ADDITION_PREFIX, REMOVAL_PREFIX } from '../diff_tools';

jest.mock('brace', () => ({
  define: jest.fn(),
  acequire: () => ({
    JsonHighlightRules: class {
      constructor() {
        this.addRules = jest.fn();
        this.getRules = () => ({
          start: [],
        });
      }
    },
    Mode: jest.fn()
  })
}));

describe('addDiffAddonsForAce', () => {
  it('should add a diff_json mode to ace', () => {
    setCurrentJsonObject({
      [`${ADDITION_PREFIX}foo`]: '1',
      [`${REMOVAL_PREFIX}foobar`]: '2',
      [`${ADDITION_PREFIX}la`]: { foo: '1' },
      [`${REMOVAL_PREFIX}lo`]: { bar: '2' },
      bar: 2,
    });
    addDiffAddonsForAce();

    const define = require('brace').define;
    const Mode = define.mock.calls[0][2]().Mode;
    const mode = new Mode();
    const rules = new mode.HighlightRules();
    expect(rules.addRules.mock.calls.length).toBe(1);
    expect(rules.addRules.mock.calls[0][0].start.length).toBe(2);
    expect(rules.addRules.mock.calls[0][0].array.length).toBe(1);

    const addition = rules.addRules.mock.calls[0][0].start[0].token('foo', '1');
    expect(addition).toBe('diff_addition ace_variable');

    const removal = rules.addRules.mock.calls[0][0].start[0].token('foobar', '2');
    expect(removal).toBe('diff_removal ace_variable');

    const neither = rules.addRules.mock.calls[0][0].start[0].token('bar', '2');
    expect(neither).toBe('variable');

    const objectAddition = rules.addRules.mock.calls[0][0].start[0].token('la', '{');
    expect(objectAddition).toBe('diff_addition ace_variable');

    const objectRemoval = rules.addRules.mock.calls[0][0].start[0].token('lo', '{');
    expect(objectRemoval).toBe('diff_removal ace_variable');
  });
});
