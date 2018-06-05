/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React from 'react';
import { shallow } from 'enzyme';
import { ErrableFormRow } from '../form_errors';

describe('ErrableFormRow', () => {
  it('should render a form row with invalid props and mark the child as invalid', () => {
    expect(shallow(
      <ErrableFormRow
        errorKey="key"
        isShowingErrors={true}
        errors={{
          key: ['There is an error.']
        }}
      >
        <div/>
      </ErrableFormRow>
    )).toMatchSnapshot();
  });

  it('should render a form row with invalid props and mark the child as invalid only if it is invalid', () => {
    expect(shallow(
      <ErrableFormRow
        errorKey="key2"
        isShowingErrors={true}
        errors={{
          key: ['There is an error.'],
          key2: []
        }}
      >
        <div/>
      </ErrableFormRow>
    )).toMatchSnapshot();
  });

  it('should not render errors is we are not showing thenm', () => {
    expect(shallow(
      <ErrableFormRow
        errorKey="key"
        isShowingErrors={false}
        errors={{
          key: ['There is an error.'],
        }}
      >
        <div/>
      </ErrableFormRow>
    )).toMatchSnapshot();
  });
});
