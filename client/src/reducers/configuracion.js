import { configuracionAct } from '../constants/actionTypes'

export default (state = { isOpen: false, smtp: '', email: '', password: '' }, action) => {
  switch (action.type) {
    case configuracionAct.edit:
      return { ...state, isOpen: !state.isOpen }
    case configuracionAct.save:
      return action.configuracion
    case configuracionAct.populate:
      return action.configuracion
    default:
      return state
  }
}

const update = (state, name, value) => (
  state.map(filter => filter.name === name ? { ...filter, value } : filter)
)
