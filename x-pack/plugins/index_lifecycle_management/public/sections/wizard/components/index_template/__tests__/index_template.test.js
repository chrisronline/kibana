/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React from 'react';
import { shallow } from 'enzyme';
import { IndexTemplate } from '../index_template';
import { STRUCTURE_TEMPLATE_SELECTION, STRUCTURE_CONFIGURATION } from '../../../../../store/constants';

describe('IndexTemplate', () => {
  it('should render normally', () => {
    const component = shallow(
      <IndexTemplate
        done={() => {}}
        validate={() => {}}
        errors={{
          [STRUCTURE_TEMPLATE_SELECTION]: [],
          [STRUCTURE_CONFIGURATION]: [],
        }}
      />
    );

    expect(component).toMatchSnapshot();
  });

  it('should return error state on validation', async () => {
    const validate = jest.fn();
    const component = shallow(
      <IndexTemplate
        done={() => {}}
        validate={validate}
        errors={{
          [STRUCTURE_TEMPLATE_SELECTION]: ['There is an error.'],
          [STRUCTURE_CONFIGURATION]: [],
        }}
      />
    );

    const result = await component.instance().validate();
    expect(result).toBe(false);
    expect(validate).toHaveBeenCalled();
  });

  it('should submit if valid', async () => {
    const done = jest.fn();
    const component = shallow(
      <IndexTemplate
        done={done}
        validate={() => {}}
        errors={{
          [STRUCTURE_TEMPLATE_SELECTION]: ['There is an error.'],
          [STRUCTURE_CONFIGURATION]: [],
        }}
      />
    );

    await component.instance().submit();
    expect(done).not.toHaveBeenCalled();

    const noErrorComponent = shallow(
      <IndexTemplate
        done={done}
        validate={() => {}}
        errors={{
          [STRUCTURE_TEMPLATE_SELECTION]: [],
          [STRUCTURE_CONFIGURATION]: [],
        }}
      />
    );

    await noErrorComponent.instance().submit();
    expect(done).toHaveBeenCalled();
  });
});
