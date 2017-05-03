import { productosAct } from '../constants/actionTypes'

export default (state = [], action) => {
  switch (action.type) {
    case productosAct.add:
      return [...state, { ...action.producto, edit: false }]
    case productosAct.edit:
      return toggleEdit(state, action.id)
    case productosAct.offEdit:
      return state.map(offEdit)
    case productosAct.updateProducto:
      return updateProducto(state, action.id, action.licencias, action.template)
    case productosAct.addLicencia:
      return addLicencia(state, action.id)
    case productosAct.removeLicencia:
      return removeLicencia(state, action.id, action.index)
    default:
      return state
  }
}

const toggleEdit = (productos, id) => (
  productos.map(producto => producto.id === id ? { ...producto, edit: !producto.edit } : producto)
)

const offEdit = prod => ({ ...prod, edit: false })

const updateProducto = (state, id, licencias, template) => (
  state.map(producto => producto.id === id ? { ...producto, licencias, template } : producto)
)
const addLicencia = (state, id) => (
  state.map(producto => producto.id === id ? { ...producto, licencias: [...producto.licencias, { codigo: "", cantidad: 1 }] } : producto)
)

const removeLicencia = (state, id, index) => (
  state.map(prod => prod.id === id ? {...prod, licencias: [...prod.licencias.slice(0,index), ...prod.licencias.slice(index+1)]} : prod)
)
