/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { InitAfterBindingsWorkaround } from 'ui/compat';
import { forEach, size } from 'lodash';

export class ThresholdWatchBaseController extends InitAfterBindingsWorkaround {
  getForm = () => {
    return this.form || {
      $setPristine: () => {},
      $setUntouched: () => {},
    };
  }

  checkValidity = () => {
    if (this.isValid()) {
      this.onValid(this.itemId);
    } else {
      this.onInvalid(this.itemId);
    }
  }

  checkDirty = () => {
    if (this.form.$dirty) {
      this.onDirty(this.itemId);
    } else {
      this.onPristine(this.itemId);
    }
  }

  resetForm = () => {
    const form = this.getForm();
    forEach(form, (control) => {
      if (Boolean(control) && typeof control.$setViewValue === 'function') {
        control.$setViewValue(undefined);
      }
    });

    form.$setPristine();
    form.$setUntouched();
  }

  isValid = () => {
    return !(this.getForm().$invalid);
  }

  isDirty = () => {
    return this.getForm().$dirty;
  }

  isValidationMessageVisible = (fieldName, errorType, showIfOtherErrors = true) => {
    const form = this.getForm();
    let showMessage = form[fieldName] &&
      (form[fieldName].$touched || form[fieldName].$dirty) &&
      form[fieldName].$error[errorType];

    if (showMessage && !showIfOtherErrors && size(form[fieldName].$error) > 1) {
      showMessage = false;
    }

    return showMessage;
  }
}
