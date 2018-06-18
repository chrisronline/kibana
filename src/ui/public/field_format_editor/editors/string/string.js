/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import stringTemplate from './string.html';

export function stringEditor() {
  return {
    formatId: 'string',
    template: stringTemplate,
    controllerAs: 'cntrl',
    controller: function () {
      this.transformOpts = [
        { id: false, name: '- none -' },
        { id: 'lower', name: 'Lower Case' },
        { id: 'upper', name: 'Upper Case' },
        { id: 'title', name: 'Title Case' },
        { id: 'short', name: 'Short Dots' },
        { id: 'base64', name: 'Base64 Decode' }
      ];
      this.sampleInputs = [
        'A Quick Brown Fox.',
        'STAY CALM!',
        'com.organizations.project.ClassName',
        'hostname.net',
        'SGVsbG8gd29ybGQ='
      ];
    }
  };
}
