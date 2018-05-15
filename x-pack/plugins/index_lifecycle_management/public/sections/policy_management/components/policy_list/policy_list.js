/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';

import {
  EuiInMemoryTable, EuiIcon, EuiTitle, EuiLink
} from '@elastic/eui';
import { BASE_PATH } from '../../../../../common/constants';

const getEditUrl = name => `#${BASE_PATH}policies/edit_policy/${name}`;

export class PolicyList extends PureComponent {
  static propTypes = {
    fetchPolicies: PropTypes.func.isRequired,

    policies: PropTypes.array.isRequired,
  }

  componentWillMount() {
    this.props.fetchPolicies();
  }

  render() {
    const { policies } = this.props;

    return (
      <Fragment>
        <EuiTitle>
          <h2>Policy Management</h2>
        </EuiTitle>
        <EuiInMemoryTable
          items={policies}
          columns={[
            {
              field: 'name',
              sortable: true,
              name: 'Name',
              render: name => (
                <EuiLink href={getEditUrl(name)}>{name}</EuiLink>
              )
            },
            {
              name: 'Warm Phase',
              sortable: true,
              render: policy => {
                return policy.phases.warm ? (<EuiIcon type="check"/>) : (<EuiIcon type="cross"/>);
              }
            },
            {
              name: 'Cold Phase',
              sortable: true,
              render: policy => {
                return policy.phases.cold ? (<EuiIcon type="check"/>) : (<EuiIcon type="cross"/>);
              }
            },
            {
              name: 'Delete Phase',
              sortable: true,
              render: policy => {
                return policy.phases.delete ? (<EuiIcon type="check"/>) : (<EuiIcon type="cross"/>);
              }
            },
            {
              render: () => {
                return (<EuiIcon type="trash" color="danger"/>);
              }
            }
          ]}
          pagination={true}
          sorting={{
            sort: {
              field: 'name',
              direction: 'asc',
            }
          }}
        />
      </Fragment>
    );
  }
}
