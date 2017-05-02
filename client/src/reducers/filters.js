import { filtersAct } from '../constants/actionTypes'

export default (state = [{ key: 'title', value: '', name: 'searchText' }, { key: 'origen', value: '', name: 'origen' }], action) => {
  switch (action.type) {
    case filtersAct.search:
      return update(state, 'searchText', action.searchText)
    case filtersAct.origen:
      return update(state, 'origen', action.origen)
    default:
      return state
  }
} 

const update = (state, name, value) => (
  state.map(filter => filter.name === name ? {...filter, value}: filter)
)
