import { productos_acciones } from '../constants/productos'

export default (state = [], action) => {
  switch (action.type) {
    case productos_acciones.add:      
      return [...state, action.producto]
    default:
      return state
  }
} 