/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import {
  EuiTitle,
  EuiCodeEditor,
  EuiButton,
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutHeader,
  EuiSpacer,
  EuiPage,
  EuiPageBody,
  EuiPageContent,
  EuiButtonEmpty,
} from '@elastic/eui';

import 'brace/theme/github';
import 'brace/mode/javascript';
import 'brace/snippets/javascript';
import 'brace/ext/language_tools';
import { DiffView } from '../../../wizard/components/review/diff_view';

export class ManageIndexTemplate extends Component {
  static propTypes = {
    fetchIndexTemplate: PropTypes.func.isRequired,
    resetSelectedIndexTemplate: PropTypes.func.isRequired,

    match: PropTypes.shape({
      params: PropTypes.shape({
        name: PropTypes.string,
      }),
    }),
    isEditMode: PropTypes.bool,
    isCreateMode: PropTypes.bool,
    indexTemplate: PropTypes.object,
  };

  constructor(props) {
    super(props);

    const stringified = JSON.stringify(props.indexTemplate || {}, null, 2);
    this.state = {
      indexTemplateJSON: stringified,
      originalIndexTemplate: props.indexTemplate,
      isShowingDiffView: false,
    };
  }

  get templateName() {
    return this.props.match.params.name;
  }

  componentWillMount() {
    if (this.props.isEditMode) {
      this.props.fetchIndexTemplate(this.templateName);
    }
  }

  componentWillUnmount() {
    this.props.resetSelectedIndexTemplate();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.indexTemplate && !this.props.indexTemplate) {
      const stringified = JSON.stringify(nextProps.indexTemplate, null, 2);
      this.setState({
        indexTemplateJSON: stringified,
        originalIndexTemplate: nextProps.indexTemplate,
      });
    }
  }

  onChange = (indexTemplateJSON) => {
    this.setState({ indexTemplateJSON });
  }

  renderDiffView() {
    if (!this.state.isShowingDiffView) {
      return null;
    }

    return (
      <EuiFlyout
        onClose={() => this.setState({ isShowingDiffView: false })}
        aria-labelledby="flyoutTitle"
      >
        <EuiFlyoutHeader>
          <EuiTitle size="m">
            <h2>Diff View</h2>
          </EuiTitle>
        </EuiFlyoutHeader>
        <EuiFlyoutBody>
          <DiffView templateDiff={{
            originalFullIndexTemplate: this.state.originalIndexTemplate,
            newFullIndexTemplate: JSON.parse(this.state.indexTemplateJSON)
          }}
          />
        </EuiFlyoutBody>
      </EuiFlyout>
    );
  }

  render() {
    const {
      isEditMode,
    } = this.props;

    return (
      <EuiPage>
        <EuiPageBody>
          <EuiPageContent verticalPosition="center" horizontalPosition="center" className="ilmContent">
            <EuiTitle>
              {isEditMode ? (
                <h2>Edit Index Template {this.templateName}</h2>
              ) : (
                <h2>Create Index Template</h2>
              )}
            </EuiTitle>
            <EuiSpacer size="s"/>
            <EuiCodeEditor
              mode="javascript"
              theme="github"
              width="500px"
              height="500px"
              value={this.state.indexTemplateJSON}
              onChange={this.onChange}
              setOptions={{
                fontSize: '14px',
                enableBasicAutocompletion: true,
                enableSnippets: true,
                enableLiveAutocompletion: true,
              }}
            />
            <EuiSpacer />
            <EuiButton fill onClick={this.submit}>
              {isEditMode ? 'Save' : 'Create'}
            </EuiButton>
            { isEditMode ? (
              <EuiButtonEmpty
                onClick={() => this.setState({ isShowingDiffView: !this.state.isShowingDiffView })}
              >
                {this.state.isShowingDiffView ? 'Hide' : 'Show' } Diff
              </EuiButtonEmpty>) : null }
            {this.renderDiffView()}
          </EuiPageContent>
        </EuiPageBody>
      </EuiPage>
    );
  }
}
