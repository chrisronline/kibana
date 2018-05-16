/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { toastNotifications } from 'ui/notify';

import {
  EuiTitle,
  EuiHorizontalRule,
  EuiButton,
  EuiButtonEmpty,
  EuiLink,
  EuiSpacer,
  EuiFieldText,
} from '@elastic/eui';

import { HotPhase } from '../../../wizard/components/policy_configuration/components/hot_phase';
import {
  STRUCTURE_POLICY_CONFIGURATION,
  PHASE_HOT,
  PHASE_WARM,
  PHASE_COLD,
  PHASE_DELETE,
  STRUCTURE_POLICY_NAME,
  STRUCTURE_REVIEW,
} from '../../../../store/constants';
import { hasErrors } from '../../../../lib/find_errors';
import { WarmPhase } from '../../../wizard/components/policy_configuration/components/warm_phase';
import { ColdPhase } from '../../../wizard/components/policy_configuration/components/cold_phase';
import { DeletePhase } from '../../../wizard/components/policy_configuration/components/delete_phase';
import { NodeAttrsDetails } from '../../../wizard/components/node_attrs_details';
import { BASE_PATH } from '../../../../../common/constants';
import { ErrableFormRow } from '../../../wizard/form_errors';

export class ManagePolicy extends Component {
  static propTypes = {
    fetchPolicy: PropTypes.func.isRequired,
    validateLifecycle: PropTypes.func.isRequired,
    setSelectedPolicyName: PropTypes.func.isRequired,
    resetSelectedPolicy: PropTypes.func.isRequired,

    match: PropTypes.shape({
      params: PropTypes.shape({
        name: PropTypes.string,
      }),
    }),
    isEditMode: PropTypes.bool,
    isCreateMode: PropTypes.bool,
    policy: PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.state = {
      errors: this.getErrors(),
      isShowingErrors: false,
      selectedNodeAttrsForDetails: undefined,
    };
  }

  componentWillMount() {
    if (this.props.isEditMode) {
      this.props.fetchPolicy(this.props.match.params.name);
    }
  }

  componentWillUnmount() {
    this.props.resetSelectedPolicy();
  }

  getErrors = () => {
    const errors = this.props.validateLifecycle();
    return {
      policy: errors[STRUCTURE_POLICY_CONFIGURATION],
      name: errors[STRUCTURE_REVIEW],
    };
  };

  validate = () => {
    const errors = this.getErrors();
    this.setState({ errors });
    return !hasErrors(errors);
  };

  submit = async () => {
    this.setState({ isShowingErrors: true });
    if (await this.validate()) {
      await this.props.savePolicy(this.props.policy);
      this.props.history.push(`/policies`);
    } else {
      toastNotifications.addDanger('Please fix errors on the page.');
    }
  };

  showNodeDetailsFlyout = selectedNodeAttrsForDetails => {
    this.setState({
      isShowingNodeDetailsFlyout: true,
      selectedNodeAttrsForDetails,
    });
  };

  render() {
    const {
      policy,
      isEditMode,
      isCreateMode,
      setSelectedPolicyName,
    } = this.props;
    const { errors, isShowingErrors } = this.state;

    return (
      <Fragment>
        <EuiTitle>
          {isEditMode ? (
            <h2>Edit Policy {policy.name}</h2>
          ) : (
            <h2>Create Policy</h2>
          )}
        </EuiTitle>
        {isCreateMode ? (
          <Fragment>
            <ErrableFormRow
              label="Policy name"
              errorKey={STRUCTURE_POLICY_NAME}
              isShowingErrors={isShowingErrors}
              errors={errors.name}
            >
              <EuiFieldText
                value={policy.name}
                onChange={async e => {
                  await setSelectedPolicyName(e.target.value);
                  this.validate();
                }}
              />
            </ErrableFormRow>
            <EuiSpacer />
          </Fragment>
        ) : null}
        <HotPhase
          validate={this.validate}
          errors={errors.policy[PHASE_HOT]}
          isShowingErrors={
            isShowingErrors && hasErrors(errors.policy[PHASE_HOT])
          }
        />
        <EuiHorizontalRule className="ilmHrule" />
        <WarmPhase
          validate={this.validate}
          errors={errors.policy[PHASE_WARM]}
          showNodeDetailsFlyout={this.showNodeDetailsFlyout}
          isShowingErrors={
            isShowingErrors && hasErrors(errors.policy[PHASE_WARM])
          }
        />
        <EuiHorizontalRule className="ilmHrule" />
        <ColdPhase
          validate={this.validate}
          errors={errors.policy[PHASE_COLD]}
          showNodeDetailsFlyout={this.showNodeDetailsFlyout}
          isShowingErrors={
            isShowingErrors && hasErrors(errors.policy[PHASE_COLD])
          }
        />
        <EuiHorizontalRule className="ilmHrule" />
        <DeletePhase
          validate={this.validate}
          errors={errors.policy[PHASE_DELETE]}
          isShowingErrors={
            isShowingErrors && hasErrors(errors.policy[PHASE_DELETE])
          }
        />
        <EuiHorizontalRule className="ilmHrule" />
        <EuiLink href={`#${BASE_PATH}policies`}>
          <EuiButtonEmpty onClick={this.cancel}>Cancel</EuiButtonEmpty>
        </EuiLink>
        &nbsp;&nbsp;
        <EuiButton fill onClick={this.submit}>
          {isEditMode ? 'Save' : 'Create'}
        </EuiButton>
        {this.state.isShowingNodeDetailsFlyout ? (
          <NodeAttrsDetails
            selectedNodeAttrs={this.state.selectedNodeAttrsForDetails}
            close={() => this.setState({ isShowingNodeDetailsFlyout: false })}
          />
        ) : null}
      </Fragment>
    );
  }
}
