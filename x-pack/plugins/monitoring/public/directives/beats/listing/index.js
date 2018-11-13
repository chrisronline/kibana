/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React from 'react';
import { render } from 'react-dom';
import { uiModules } from 'ui/modules';
import { Listing } from '../../../components/beats/listing/listing';



// const beatRowFactory = (scope, kbnUrl) => {
//   return props => {
//     const goToBeat = uuid => () => {
//       scope.$evalAsync(() => {
//         kbnUrl.changePath(`/beats/beat/${uuid}`);
//       });
//     };
//     const applyFiltering = filterText => () => {
//       props.dispatchTableAction(TABLE_ACTION_UPDATE_FILTER, filterText);
//     };

//     return (
//       <KuiTableRow>
//         <KuiTableRowCell>
//           <div className="monTableCell__name">
//             <EuiLink
//               onClick={goToBeat(props.uuid)}
//               data-test-subj={`beatLink-${props.name}`}
//             >
//               {props.name}
//             </EuiLink>
//           </div>
//         </KuiTableRowCell>
//         <KuiTableRowCell>
//           <EuiLink
//             onClick={applyFiltering(props.type)}
//           >
//             {props.type}
//           </EuiLink>
//         </KuiTableRowCell>
//         <KuiTableRowCell>
//           {props.output}
//         </KuiTableRowCell>
//         <KuiTableRowCell>
//           {formatMetric(props.total_events_rate, '', '/s')}
//         </KuiTableRowCell>
//         <KuiTableRowCell>
//           {formatMetric(props.bytes_sent_rate, 'byte', '/s')}
//         </KuiTableRowCell>
//         <KuiTableRowCell>
//           {formatMetric(props.errors, '0')}
//         </KuiTableRowCell>
//         <KuiTableRowCell>
//           {formatMetric(props.memory, 'byte')}
//         </KuiTableRowCell>
//         <KuiTableRowCell>
//           <EuiLink
//             onClick={applyFiltering(props.version)}
//           >
//             {props.version}
//           </EuiLink>
//         </KuiTableRowCell>
//       </KuiTableRow>
//     );
//   };
// };

const uiModule = uiModules.get('monitoring/directives', []);
uiModule.directive('monitoringBeatsListing', (kbnUrl) => {
  return {
    restrict: 'E',
    scope: {
      data: '=',
      sorting: '=',
      pagination: '=paginationSettings',
      onTableChange: '=',
    },
    link(scope, $el) {
      function renderReact(data) {
        render((
          <Listing
            stats={data.stats}
            data={data.listing}
            sorting={scope.sorting}
            pagination={scope.pagination}
            onTableChange={scope.onTableChange}
            angular={{
              kbnUrl,
              scope,
            }}
          />
        ), $el[0]);
      }
      scope.$watch('data', (data = {}) => {
        renderReact(data);
      });
    }
  };
});
