import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { compose } from 'recompose';
// import { TableHoC } from 'plugins/kibana/management/react/hocs/table';
import IndexPatternList from './index-pattern-list.component';

import {
  connectToTransientStore,
  wrapWithSortProps,
  wrapWithPaginateProps,
  wrapWithFilterProps,
} from 'plugins/kibana/management/react/hocs';

import {
  fetchIndexPatterns,
  setTransientTableId,
}  from 'plugins/kibana/management/react/store/actions/index-pattern-list';

import {
  getIndexPatternList,
} from 'plugins/kibana/management/react/reducers';

export default compose(
  connect(
    state => ({ ...getIndexPatternList(state) }),
    { fetchIndexPatterns }
  ),
  connectToTransientStore({ refSetter: setTransientTableId }),
  wrapWithFilterProps({ filterKey: 'attributes.title' }),
  wrapWithSortProps(),
  wrapWithPaginateProps({ perPage: 1, page: 0 }),
)(IndexPatternList);
