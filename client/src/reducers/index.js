import { combineReducers } from 'redux'
import productos from './productos'
import filters from './filters'

const rootReducer = combineReducers({
  productos,
  filters
})

export default rootReducer