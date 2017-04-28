import { productosAct } from '../constants/actionTypes'

export default (state = [], action) => {
  switch (action.type) {
    case productosAct.add:      
      return [...state, action.producto]
    default:
      return state
  }
} 