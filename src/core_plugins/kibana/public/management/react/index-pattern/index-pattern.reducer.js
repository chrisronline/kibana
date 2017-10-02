/* eslint-disable */
import { chunk, sortBy as sortByLodash } from 'lodash';
import {
  FETCHED_INDICES,
  FETCHED_TIME_FIELDS,
  INCLUDE_SYSTEM_INDICES,
  EXCLUDE_SYSTEM_INDICES,
  GOTO_NEXT_PAGE,
  GOTO_PREVIOUS_PAGE,
  CHANGE_SORT,
} from './index-pattern.actions';

const defaultState = {
  allIndices: [],
  filteredIndices: [],
  indices: [],
  timeFields: [],
  hasExactMatches: false,
  page: 1,
  perPage: 10,
  includeSystemIndices: false,
  sortBy: 'name',
  sortAsc: true,
};

function getFilteredIndices(indices, includeSystemIndices) {
  if (!indices) {
    return indices;
  }

  if (includeSystemIndices) {
    return indices;
  }

  // All system indices begin with a period.
  return indices.filter(index => !index.name.startsWith('.'));
}

function getPaginatedIndices(indices, page, perPage) {
  const pagesOfIndices = chunk(indices, perPage);
  return pagesOfIndices[page - 1];
}

function getNextPage({ page, perPage, filteredIndices }) {
  const pages = Math.ceil(filteredIndices.length / perPage);
  const nextPage = page + 1;
  return nextPage > pages
    ? 1
    : nextPage;
}

function getPreviousPage({ page, perPage, filteredIndices }) {
  const pages = Math.ceil(filteredIndices.length / perPage);
  const previousPage = page - 1;
  return previousPage < 1
    ? pages
    : previousPage;
}

function getFilteredAndPaginatedIndices({
  allIndices,
  includeSystemIndices,
  page,
  perPage,
  sortBy,
  sortAsc,
}) {
  let filteredIndices = getFilteredIndices(allIndices, includeSystemIndices);
  if (!!sortBy) {
    filteredIndices = sortByLodash(filteredIndices, sortBy);
    if (!sortAsc) {
      filteredIndices.reverse();
    }
  }

  const indices = getPaginatedIndices(filteredIndices, page, perPage);

  return {
    filteredIndices,
    indices,
  };
}

export default function indexPattern(state = defaultState, action) {
  console.log('index-pattern.reducer', action, state);
  let newState = Object.assign({}, state);

  switch (action.type) {
    case FETCHED_INDICES:
      newState = Object.assign(newState, {
        allIndices: action.indices,
        hasExactMatches: action.hasExactMatches,
      });
      break;
    case FETCHED_TIME_FIELDS:
      newState = Object.assign(newState, { timeFields: action.timeFields });
      break;
    case INCLUDE_SYSTEM_INDICES:
      newState = Object.assign(newState, { includeSystemIndices: true });
      break;
    case EXCLUDE_SYSTEM_INDICES:
      newState = Object.assign(newState, { includeSystemIndices: false });
      break;
    case GOTO_NEXT_PAGE:
      newState = Object.assign(newState, { page: getNextPage(state) });
      break;
    case GOTO_PREVIOUS_PAGE:
      newState = Object.assign(newState, { page: getPreviousPage(state) });
      break;
    case CHANGE_SORT:
      newState = Object.assign(newState, {
        sortBy: action.sortBy,
        sortAsc: state.sortBy === action.sortBy ? !state.sortAsc : action.sortAsc,
      });
      break;
    default:
      return state;
  }

  return Object.assign(newState, getFilteredAndPaginatedIndices(newState));
};
