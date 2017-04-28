import { productosAct } from '../constants/actionTypes'


export default (state = [], action) => {
  switch (action.type) {
    case productosAct.add:      
      return [...state, { ...action.producto, edit:false }]
    case productosAct.edit:
      return toggleEdit(state, action.id)
    default:
      return state
  }
} 

const toggleEdit = (productos, id) => (
  productos.map(producto => producto.id === id ? {...producto, edit: !producto.edit}: producto)
)