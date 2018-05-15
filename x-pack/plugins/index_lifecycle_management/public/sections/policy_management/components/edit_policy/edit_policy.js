/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { toastNotifications } from 'ui/notify';

import {
  EuiTitle, EuiHorizontalRule, EuiButton, EuiButtonEmpty, EuiLink
} from '@elastic/eui';

import { HotPhase } from '../../../wizard/components/policy_configuration/components/hot_phase';
import { STRUCTURE_POLICY_CONFIGURATION, PHASE_HOT, PHASE_WARM, PHASE_COLD, PHASE_DELETE } from '../../../../store/constants';
import { hasErrors } from '../../../../lib/find_errors';
import { WarmPhase } from '../../../wizard/components/policy_configuration/components/warm_phase';
import { ColdPhase } from '../../../wizard/components/policy_configuration/components/cold_phase';
import { DeletePhase } from '../../../wizard/components/policy_configuration/components/delete_phase';
import { NodeAttrsDetails } from '../../../wizard/components/node_attrs_details/node_attrs_details';
import { BASE_PATH } from '../../../../../common/constants';

export class EditPolicy extends Component {
  static propTypes = {
    fetchPolicy: PropTypes.func.isRequired,
    validateLifecycle: PropTypes.func.isRequired,

    match: PropTypes.shape({
      params: PropTypes.shape({
        name: PropTypes.string.isRequired
      }).isRequired,
    }).isRequired,
    policy: PropTypes.object,
  }

  constructor(props) {
    super(props);
    this.state = {
      errors: this.getErrors(),
      isShowingErrors: false,
      selectedNodeAttrsForDetails: undefined,
    };
  }

  componentWillMount() {
    this.props.fetchPolicy(this.props.match.params.name);
  }

  getErrors = () => {
    const errors = this.props.validateLifecycle();
    return errors[STRUCTURE_POLICY_CONFIGURATION];
  };

  validate = () => {
    const errors = this.getErrors();
    this.setState({ errors });
    return !hasErrors(errors);
  };

  submit = async () => {
    this.setState({ isShowingErrors: true });
    if (await this.validate()) {
      this.props.savePolicy(this.props.policy);
    } else {
      toastNotifications.addDanger('Please fix errors on the page.');
    }
  };

  showNodeDetailsFlyout = selectedNodeAttrsForDetails => {
    this.setState({ isShowingNodeDetailsFlyout: true, selectedNodeAttrsForDetails });
  }

  render() {
    const { policy } = this.props;
    const { errors, isShowingErrors } = this.state;

    return (
      <Fragment>
        <EuiTitle>
          <h2>Edit Policy {policy.name}</h2>
        </EuiTitle>
        <HotPhase
          validate={this.validate}
          errors={errors[PHASE_HOT]}
          isShowingErrors={isShowingErrors && hasErrors(errors[PHASE_HOT])}
        />
        <EuiHorizontalRule className="ilmHrule" />
        <WarmPhase
          validate={this.validate}
          errors={errors[PHASE_WARM]}
          showNodeDetailsFlyout={this.showNodeDetailsFlyout}
          isShowingErrors={isShowingErrors && hasErrors(errors[PHASE_WARM])}
        />
        <EuiHorizontalRule className="ilmHrule" />
        <ColdPhase
          validate={this.validate}
          errors={errors[PHASE_COLD]}
          showNodeDetailsFlyout={this.showNodeDetailsFlyout}
          isShowingErrors={isShowingErrors && hasErrors(errors[PHASE_COLD])}
        />
        <EuiHorizontalRule className="ilmHrule" />
        <DeletePhase
          validate={this.validate}
          errors={errors[PHASE_DELETE]}
          isShowingErrors={isShowingErrors && hasErrors(errors[PHASE_DELETE])}
        />
        <EuiHorizontalRule className="ilmHrule" />

        <EuiLink href={`#${BASE_PATH}policies`}>
          <EuiButtonEmpty
            iconSide="left"
            iconType="sortLeft"
            onClick={this.cancel}
          >
            Cancel
          </EuiButtonEmpty>
        </EuiLink>
        &nbsp;&nbsp;
        <EuiButton
          fill
          iconSide="right"
          iconType="sortRight"
          onClick={this.submit}
        >
          Save
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
