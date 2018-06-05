/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React from 'react';
import { shallow } from 'enzyme';
import { NodeAttrsDetails } from '../node_attrs_details';

describe('NodeAttrsDetails', () => {
  it('should render normally', () => {
    const fetchNodeDetails = jest.fn();
    const component = shallow(
      <NodeAttrsDetails
        fetchNodeDetails={fetchNodeDetails}
        close={() => {}}
        selectedNodeAttrs="foo"
      />
    );

    expect(fetchNodeDetails).toHaveBeenCalledWith('foo');
    expect(component).toMatchSnapshot();
  });

  it('should render a warning for allocation rules', () => {
    const component = shallow(
      <NodeAttrsDetails
        fetchNodeDetails={() => {}}
        close={() => {}}
        selectedNodeAttrs="foo"
        allocationRules={{}}
      />
    );

    expect(component.find('EuiCallOut')).toMatchSnapshot();
  });
});
