import React from 'react';
import {
  KuiTitle,
  KuiIcon,
  KuiFlexGroup,
  KuiFlexItem,
  KuiText,
  KuiTable,
  KuiTableRow,
  KuiTableRowCell,
  KuiTableHeaderCell,
  KuiTableBody,
  KuiTableHeader,
  KuiButtonEmpty,
} from 'ui_framework/components';

const IndexPatternResults = ({
  indices,
  numOfPages,
  perPage,
  page,
  sortBy,
  sortAsc,
  changeSort,
  goToPreviousPage,
  goToNextPage,
}) => {
  if (indices === undefined) {
    return null;
  }

  const indexRows = indices.map((index, key) => {
    return (
      <KuiTableRow key={key}>
        <KuiTableRowCell>
          {index.name}
        </KuiTableRowCell>
        <KuiTableRowCell>
          {index.count}
        </KuiTableRowCell>
      </KuiTableRow>
    );
  });

  return (
    <KuiFlexItem>
      <KuiTitle>
        <h3>...that will match these indices</h3>
      </KuiTitle>
      <KuiTable className="kuiVerticalRhythm">
        <KuiTableHeader>
          <KuiTableHeaderCell>
            <KuiButtonEmpty
              onClick={() => changeSort('name')}
            >
              Name
              { sortBy === 'name'
                ?
                  <span>
                    &nbsp;
                    <KuiIcon
                      type={sortAsc ? 'arrowUp' : 'arrowDown'}
                      size="medium"
                    />
                  </span>
                : null
              }
            </KuiButtonEmpty>
          </KuiTableHeaderCell>
          <KuiTableHeaderCell>
            <KuiButtonEmpty
              onClick={() => changeSort('count')}
            >
              Doc Count
              { sortBy === 'count'
                ?
                  <span>
                    &nbsp;
                    <KuiIcon
                      type={sortAsc ? 'arrowUp' : 'arrowDown'}
                      size="medium"
                    />
                  </span>
                : null
              }
            </KuiButtonEmpty>
          </KuiTableHeaderCell>
        </KuiTableHeader>
        <KuiTableBody>
          {indexRows}
        </KuiTableBody>
      </KuiTable>
      {numOfPages > 1
        ?
          <div className="kuiVerticalRhythm">
            <KuiText>
              <span>
                {page}
                &nbsp;
                of
                &nbsp;
                {numOfPages}
                &nbsp;
                &nbsp;
              </span>
            </KuiText>
            <KuiIcon
              type="arrowLeft"
              size="medium"
              onClick={goToPreviousPage}
            />
            <KuiIcon
              type="arrowRight"
              size="medium"
              onClick={goToNextPage}
            />
          </div>
        : null
      }
    </KuiFlexItem>
  );
};

export default IndexPatternResults;
