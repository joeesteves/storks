import { combineReducers } from 'redux'
import productos from './productos'
import filters from './filters'
import configuracion from './configuracion'

const rootReducer = combineReducers({
  productos,
  filters,
  configuracion
})

export default rootReducer