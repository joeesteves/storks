import { filtersAct } from '../constants/actionTypes'

export default (state = { searchText: "" }, action) => {
  switch (action.type) {
    case filtersAct.search:
      console.log(action.searchText)
      return Object.assign({}, state, {searchText: action.searchText})
    default:
      return state
  }
} 