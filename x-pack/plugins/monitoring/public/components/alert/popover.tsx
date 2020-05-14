/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */
import React, { Fragment } from 'react';
import {
  EuiSpacer,
  EuiFlexItem,
  EuiFlexGroup,
  EuiTitle,
  EuiIcon,
  EuiText,
  EuiLink,
  EuiButtonIcon,
  EuiPopover,
  EuiButtonEmpty,
  EuiCard,
  EuiButton,
  EuiListGroup,
  EuiListGroupItem,
  EuiCallOut,
  EuiDescriptionList,
  EuiBadge,
  EuiHorizontalRule,
  EuiModal,
  EuiModalBody,
  EuiModalFooter,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiOverlayMask,
  EuiAccordion,
  EuiSwitch,
  EuiTextArea,
  EuiSuperSelect,
  EuiFormRow,
} from '@elastic/eui';

import {
  CommonAlertStatus,
  CommonBaseAlert,
  CommonActionDefaultParameters,
} from '../../../common/types';
import { replaceTokens } from './replace_tokens';
import { ALERT_ACTION_TYPE_LOG, ALERT_ACTION_TYPE_EMAIL } from '../../../common/constants';
import { AlertMessage } from '../../../server/alerts/types';
import { Legacy } from '../../legacy_shims';
import { AlertAction } from '../../../../alerting/common';
import { ActionType, ActionResult } from '../../../../actions/common';
import { ConnectorAddModal } from '../../../../triggers_actions_ui/public/application/sections/action_connector_form/connector_add_modal';
import { TriggerActionsContext } from '../../../../infra/public/utils/triggers_actions_context';
import { HttpSetup } from 'kibana/public';
import { ActionConnector, IErrorObject } from '../../../../triggers_actions_ui/public/types';

interface AlertPopoverContextProps {
  alert: CommonBaseAlert;
  configuredActions: ActionResult[];
  validConnectorTypes: ActionType[];
  defaultParametersByAlertType: CommonActionDefaultParameters;
}
const AlertPopoverContext = React.createContext<AlertPopoverContextProps>({} as any);

function getParamsFieldsComponent(actionTypeId: string) {
  if (!actionTypeId) {
    return null;
  }
  const actionTypeRegistered = Legacy.shims.triggersActionsUi.actionTypeRegistry.get(actionTypeId);
  return actionTypeRegistered ? actionTypeRegistered.actionParamsFields : null;
}

interface AlertPopoverConfigureActionProps {
  action: AlertAction;
  editAction: (field: string, value: string) => void;
  cancel: () => void;
  done: (alert: CommonBaseAlert) => void;
}
const AlertPopoverConfigureAction: React.FC<AlertPopoverConfigureActionProps> = (
  props: AlertPopoverConfigureActionProps
) => {
  const { action, editAction, cancel, done } = props;
  const context = React.useContext(AlertPopoverContext);

  const [isSaving, setIsSaving] = React.useState(false);

  async function saveAction() {
    setIsSaving(true);
    let alert;
    try {
      alert = await Legacy.shims.kfetch({
        method: 'PUT',
        pathname: `/api/monitoring/v1/alert/${context.alert.type}`,
        body: JSON.stringify({
          action,
        }),
      });
    } catch (err) {
      Legacy.shims.toastNotifications.addDanger({
        title: 'Error saving action',
        text: err.message,
      });
    }
    setIsSaving(false);
    done(alert);
  }

  const ParamsFieldsComponent = getParamsFieldsComponent(action.actionTypeId);
  const actionErrors: {
    errors: IErrorObject;
  } = Legacy.shims.triggersActionsUi.actionTypeRegistry
    .get(action.actionTypeId)
    ?.validateParams(action.params);

  return (
    <Fragment>
      <EuiSpacer size="s" />
      <EuiFlexGroup direction="column">
        <EuiFlexItem grow={false}>
          <ParamsFieldsComponent
            actionParams={action.params as any}
            errors={actionErrors.errors}
            editAction={editAction}
            // messageVariables={messageVariables}
            // defaultMessage={defaultActionMessage ?? undefined}
          />
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiFlexGroup justifyContent="flexEnd">
            <EuiFlexItem grow={false}>
              <EuiButtonEmpty size="s" onClick={cancel}>
                Cancel
              </EuiButtonEmpty>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiButton size="s" onClick={saveAction} fill isDisabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save'}
              </EuiButton>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexItem>
      </EuiFlexGroup>
    </Fragment>
  );
};

interface AlertPopoverConfigureNewActionProps {
  actionTypeId: string;
  actionId: string;
  cancel: () => void;
  done: (alert: CommonBaseAlert) => void;
}
const AlertPopoverConfigureNewAction: React.FC<AlertPopoverConfigureNewActionProps> = (
  props: AlertPopoverConfigureNewActionProps
) => {
  const { actionTypeId, actionId, cancel, done } = props;
  const context = React.useContext(AlertPopoverContext);

  const [isAdding, setIsAdding] = React.useState(false);
  const [params, setParams] = React.useState(
    context.defaultParametersByAlertType[context.alert.type][actionTypeId]
  );

  async function addAction() {
    setIsAdding(true);
    let alert;
    try {
      alert = await Legacy.shims.kfetch({
        method: 'PUT',
        pathname: `/api/monitoring/v1/alert/${context.alert.type}`,
        body: JSON.stringify({
          action: {
            id: actionId,
            actionTypeId,
            group: 'default',
            params,
          },
        }),
      });
    } catch (err) {
      Legacy.shims.toastNotifications.addDanger({
        title: 'Error adding action',
        text: err.message,
      });
    }
    setIsAdding(false);
    done(alert);
  }

  const ParamsFieldsComponent = getParamsFieldsComponent(actionTypeId);
  const actionErrors: {
    errors: IErrorObject;
  } = Legacy.shims.triggersActionsUi.actionTypeRegistry.get(actionTypeId)?.validateParams(params);

  let disableButton = isAdding;
  if (!disableButton) {
    for (const errorList of Object.values(actionErrors.errors)) {
      if (errorList.length) {
        disableButton = true;
        break;
      }
    }
  }

  return (
    <Fragment>
      <EuiSpacer size="s" />
      <EuiFlexGroup direction="column">
        <EuiFlexItem grow={false}>
          <ParamsFieldsComponent
            actionParams={params as any}
            errors={actionErrors.errors}
            editAction={(field: string, value: string) =>
              setParams({
                ...params,
                [field]: value,
              })
            }
            // messageVariables={messageVariables}
            // defaultMessage={defaultActionMessage ?? undefined}
          />
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiFlexGroup justifyContent="flexEnd">
            <EuiFlexItem grow={false}>
              <EuiButtonEmpty size="s" onClick={cancel}>
                Cancel
              </EuiButtonEmpty>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiButton size="s" onClick={addAction} fill isDisabled={disableButton}>
                {isAdding ? 'Adding...' : 'Add'}
              </EuiButton>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexItem>
      </EuiFlexGroup>
    </Fragment>
  );
};

interface AlertPopoverSelectExistingActionProps {
  actionTypeId: string;
  cancel: () => void;
  done: (alert: CommonBaseAlert) => void;
}
const AlertPopoverSelectExistingAction: React.FC<AlertPopoverSelectExistingActionProps> = (
  props: AlertPopoverSelectExistingActionProps
) => {
  const { actionTypeId, cancel, done } = props;
  const [showModal, setShowModal] = React.useState(false);
  const [existingActionId, setExistingActionId] = React.useState('');
  const context = React.useContext(AlertPopoverContext);

  let modal = null;
  const actionType = context.validConnectorTypes.find(type => type.id === actionTypeId);
  if (showModal && actionType) {
    modal = (
      <ConnectorAddModal
        actionType={actionType}
        addModalVisible={true}
        setAddModalVisibility={() => setShowModal(false)}
        postSaveEventHandler={(savedAction: ActionConnector) => {
          console.log('post save', { savedAction });
          // configuredActions.push(savedAction);
          // connectors.push(savedAction);
          // setActionIdByIndex(savedAction.id, activeActionItem.index);
        }}
        actionTypeRegistry={Legacy.shims.triggersActionsUi.actionTypeRegistry}
        http={Legacy.shims.http}
        toastNotifications={Legacy.shims.toastNotifications}
        // docLinks={docLinks}
        capabilities={Legacy.shims.capabilities}
      />
    );
  }

  const configuredActionsOptions = context.configuredActions.reduce((list, action) => {
    if (action.actionTypeId !== actionTypeId) {
      return list;
    }

    list.push({
      value: action.id,
      dropdownDisplay: action.name,
      inputDisplay: action.name,
      disabled: !!context.alert.rawAlert.actions.find(
        _action => _action.actionTypeId === actionTypeId
      ),
    });
    return list;
  }, []);

  return (
    <Fragment>
      {modal}
      <EuiFormRow
        label="Select existing connector"
        helpText={
          <EuiText size="s">
            or <EuiLink onClick={() => setShowModal(true)}>create a new one</EuiLink>
          </EuiText>
        }
      >
        <EuiSuperSelect
          options={configuredActionsOptions}
          valueOfSelected={existingActionId}
          onChange={value => setExistingActionId(value)}
        />
      </EuiFormRow>
      {existingActionId ? (
        <Fragment>
          <EuiSpacer size="s" />
          <AlertPopoverConfigureNewAction
            actionId={existingActionId}
            actionTypeId={actionTypeId}
            cancel={() => {
              setExistingActionId('');
              cancel();
            }}
            done={done}
          />
        </Fragment>
      ) : null}
    </Fragment>
  );
};

interface AlertPopoverAddActionProps {
  cancel: () => void;
  done: (alert: CommonBaseAlert) => void;
}
const AlertPopoverAddAction: React.FC<AlertPopoverAddActionProps> = (
  props: AlertPopoverAddActionProps
) => {
  const { cancel, done } = props;
  const [actionTypeId, setActionTypeId] = React.useState('');
  const context = React.useContext(AlertPopoverContext);

  const selectActionTypeOptions = context?.validConnectorTypes.map(type => {
    let iconType = null;
    switch (type.id) {
      case ALERT_ACTION_TYPE_EMAIL:
        iconType = 'email';
        break;
    }
    const dropdownDisplay = (
      <EuiFlexGroup alignItems="center" gutterSize="s">
        <EuiFlexItem grow={false}>
          {iconType ? <EuiIcon type={iconType} size="s" /> : null}
        </EuiFlexItem>
        <EuiFlexItem grow={false}>{type.name}</EuiFlexItem>
      </EuiFlexGroup>
    );
    return {
      value: type.id,
      dropdownDisplay,
      inputDisplay: type.name,
      disabled: !type.enabled,
    };
  });

  return (
    <Fragment>
      <EuiFormRow label="Action type">
        <EuiSuperSelect
          options={selectActionTypeOptions}
          valueOfSelected={actionTypeId}
          onChange={value => setActionTypeId(value)}
        />
      </EuiFormRow>
      {actionTypeId ? (
        <Fragment>
          <AlertPopoverSelectExistingAction
            actionTypeId={actionTypeId}
            cancel={cancel}
            done={done}
          />
        </Fragment>
      ) : null}
    </Fragment>
  );
};

interface AlertPopoverTriggeredActionsProps {
}
const AlertPopoverTriggeredActions: React.FC<AlertPopoverTriggeredActionsProps> = (
  props: AlertPopoverTriggeredActionsProps
) => {
  const context = React.useContext(AlertPopoverContext);
  const [actions, setActions] = React.useState(context.alert.rawAlert.actions);
  const [currentConfigureActionTypeId, setCurrentConfigureActionId] = React.useState<string | null>(
    null
  );
  const [showAddAction, setShowAddAction] = React.useState(false);

  function editAction(action: AlertAction, field: string, value: string) {
    const idx = actions.findIndex(act => act.id === action.id);
    setActions([
      ...actions.slice(0, idx),
      {
        ...action,
        params: {
          ...action.params,
          [field]: value,
        },
      },
      ...actions.slice(idx + 1),
    ]);
  }

  async function disableAction(action: AlertAction) {
    const index = actions.findIndex(_action => _action.id === action.id);
    const updatedActions = [...actions.slice(0, index), ...actions.slice(index + 1)];
    try {
      await Legacy.shims.kfetch({
        method: 'DELETE',
        pathname: `/api/monitoring/v1/alert/${context.alert.type}/action/${action.id}`,
        body: JSON.stringify({
          action,
        }),
      });
      setActions(updatedActions);
    } catch (err) {
      Legacy.shims.toastNotifications.addDanger({
        title: 'Error disabling action',
        text: err.message,
      });
    }
  }

  const actionList = actions.map(action => {
    let icon = 'dot';
    let message;

    switch (action.actionTypeId) {
      case ALERT_ACTION_TYPE_LOG:
        icon = 'logsApp';
        message = 'Wrote to Kibana server log';
        break;
      case ALERT_ACTION_TYPE_EMAIL:
        icon = 'email';
        message = 'Sent an email';
        break;
    }

    const label = (
      <Fragment>
        <EuiFlexGroup alignItems="center" gutterSize="s" justifyContent="spaceBetween">
          <EuiFlexItem grow={false}>
            <EuiIcon type={icon} size="s" />
          </EuiFlexItem>
          <EuiFlexItem grow={5}>
            <EuiText size="s">
              <p>{message}</p>
            </EuiText>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiLink onClick={() => setCurrentConfigureActionId(action.actionTypeId)}>
              <EuiText size="s">Configure</EuiText>
            </EuiLink>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiLink onClick={() => disableAction(action)}>
              <EuiText size="s">Disable</EuiText>
            </EuiLink>
          </EuiFlexItem>
        </EuiFlexGroup>
        {currentConfigureActionTypeId === action.actionTypeId ? (
          <AlertPopoverConfigureAction
            action={action}
            editAction={(field: string, value: string) => editAction(action, field, value)}
            cancel={() => setCurrentConfigureActionId(null)}
            done={alert => {
              setCurrentConfigureActionId(null);
              setActions(alert.rawAlert.actions);
            }}
          />
        ) : null}
      </Fragment>
    );

    return (
      <EuiListGroupItem key={action.id} label={label} style={{ width: '100%', display: 'block' }} />
    );
  });

  actionList.push(
    <EuiListGroupItem
      key="addAction"
      label={
        <Fragment>
          <EuiFlexGroup alignItems="center" gutterSize="s" justifyContent="flexStart">
            <EuiFlexItem grow={false}>
              <EuiIcon type="listAdd" size="s" />
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiLink onClick={() => setShowAddAction(true)}>
                <EuiText size="s">
                  <p>Add action</p>
                </EuiText>
              </EuiLink>
            </EuiFlexItem>
          </EuiFlexGroup>
          {showAddAction ? (
            <Fragment>
              <EuiSpacer size="s" />
              <AlertPopoverAddAction
                cancel={() => {}}
                done={alert => {
                  console.log({ alert });
                  setActions(alert.rawAlert.actions);
                }}
              />
            </Fragment>
          ) : null}
        </Fragment>
      }
      style={{ width: '100%', display: 'block' }}
    />
  );

  return (
    <Fragment>
      <EuiFlexGroup alignItems="center" justifyContent="spaceBetween">
        <EuiFlexItem grow={false}>
          <EuiTitle size="xs">
            <h3>Triggered actions</h3>
          </EuiTitle>
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiSpacer size="s" />
      <EuiListGroup gutterSize="none" size="xs">
        {actionList}
      </EuiListGroup>
    </Fragment>
  );
};

interface AlertPopoverProps {
  alert: CommonAlertStatus;
}
export const AlertPopover: React.FC<AlertPopoverProps> = (props: AlertPopoverProps) => {
  const {
    alert: { alert, enabled, exists, states },
  } = props;

  const [showAlert, setShowAlert] = React.useState(false);
  const [validConnectorTypes, setValidConnectorTypes] = React.useState<ActionType[]>([]);
  const [configuredActions, setConfiguredActions] = React.useState<ActionResult[]>([]);
  const [defaultParametersByAlertType, setDefaultParametersByAlertType] = React.useState<
    CommonActionDefaultParameters
  >({} as any);

  React.useEffect(() => {
    (async () => {
      const {
        types,
        actions: _actions,
        defaultParametersByAlertType: _defaultParametersByAlertType,
      } = await Legacy.shims.kfetch({
        method: 'GET',
        pathname: `/api/monitoring/v1/alert/actions`,
      });
      setConfiguredActions(_actions);
      setValidConnectorTypes(types);
      setDefaultParametersByAlertType(_defaultParametersByAlertType);
    })();
  }, []);

  if (!alert.rawAlert) {
    return null;
  }

  const firingStates = states.filter(state => state.firing);
  if (!firingStates.length) {
    return null;
  }

  const firingState = firingStates[0];

  const settingsList = (
    <Fragment>
      <EuiListGroupItem
        label={
          <EuiFlexGroup alignItems="center" gutterSize="s">
            <EuiFlexItem grow={false}>
              <EuiIcon type="clock" size="s" />
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiText size="s">
                <p>Notify me every {alert.throttle}</p>
              </EuiText>
            </EuiFlexItem>
          </EuiFlexGroup>
        }
      />
    </Fragment>
  );

  const nextStepsUi =
    firingState.state.ui.message.nextSteps && firingState.state.ui.message.nextSteps.length ? (
      <ul>
        {firingState.state.ui.message.nextSteps.map((step: AlertMessage, index: number) => (
          <li key={index}>{replaceTokens(step)}</li>
        ))}
      </ul>
    ) : null;

  return (
    <Fragment>
      <AlertPopoverContext.Provider
        value={{ alert, validConnectorTypes, configuredActions, defaultParametersByAlertType }}
      >
        <EuiPopover
          button={
            <EuiBadge
              color={firingState.state.ui.severity}
              iconType="alert"
              iconOnClickAriaLabel="Show alert"
              iconOnClick={() => setShowAlert(true)}
              onClick={() => setShowAlert(true)}
            >
              View alert
            </EuiBadge>
          }
          isOpen={showAlert}
          anchorPosition="rightCenter"
          closePopover={() => setShowAlert(false)}
        >
          <div style={{ minWidth: '400px' }}>
            <EuiTitle size="xs">
              <h2>{alert.label} alert</h2>
            </EuiTitle>
            <EuiHorizontalRule margin="xs" />
            <EuiCallOut title={replaceTokens(firingState.state.ui.message)} color="warning">
              {nextStepsUi}
            </EuiCallOut>
            <EuiSpacer size="m" />
            <AlertPopoverTriggeredActions />
            <EuiSpacer size="s" />
            <EuiFlexGroup alignItems="center" justifyContent="spaceBetween">
              <EuiFlexItem grow={false}>
                <EuiTitle size="xs">
                  <h3>Alert settings</h3>
                </EuiTitle>
              </EuiFlexItem>
            </EuiFlexGroup>
            <EuiSpacer size="s" />
            <EuiListGroup gutterSize="none" size="xs">
              {settingsList}
            </EuiListGroup>
          </div>
        </EuiPopover>
      </AlertPopoverContext.Provider>
    </Fragment>
  );
};
