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

const getEditUrl = name => `#${BASE_PATH}index_templates/edit_template/${name}`;

export class IndexTemplateList extends PureComponent {
  static propTypes = {
    fetchIndexTemplates: PropTypes.func.isRequired,
    deleteIndexTemplate: PropTypes.func.isRequired,

    indexTemplates: PropTypes.array.isRequired,
  }

  componentWillMount() {
    this.props.fetchIndexTemplates();
  }

  render() {
    const { indexTemplates, deleteIndexTemplate } = this.props;

    return (
      <Fragment>
        <EuiTitle>
          <h2>Index Template Management</h2>
        </EuiTitle>
        <EuiLink href={`#${BASE_PATH}index_templates/new`}>
          Create new index template
        </EuiLink>
        <EuiInMemoryTable
          items={indexTemplates}
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
              name: 'Index Patterns',
              field: 'index_patterns',
              sortable: false,
            },
            {
              render: policy => {
                return (<EuiIcon type="trash" color="danger" onClick={() => deleteIndexTemplate(policy.name)}/>);
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
