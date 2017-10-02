/* eslint-disable */
import { connect } from 'react-redux';
import IndexPatternResults from './index-pattern-results.component';

import {
  goToNextPage,
  goToPreviousPage,
  changeSort,
} from '../../../../../store/actions/index-pattern-creation';

import {
  getFilteredAndPaginatedIndices,
} from '../../../../../store/reducers/index-pattern-creation';

import {
  getIndexPatternCreate,
} from '../../../../../reducers';

export default connect(
  state => {
    const indexPatternState = getIndexPatternCreate(state);
    return {
      ...indexPatternState.results,
      ...getFilteredAndPaginatedIndices(indexPatternState),
    };
  },
  { goToNextPage, goToPreviousPage, changeSort },
)(IndexPatternResults);
