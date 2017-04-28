import { filtersAct } from '../constants/actionTypes'

export const updateSearchFilter = (searchText) => ({
  type: filtersAct.search,
  searchText
})
