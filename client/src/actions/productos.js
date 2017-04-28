import { productosAct } from '../constants/actionTypes'
import { fetch2JSON, getProductById } from '../../helpers'
import { store } from '../../store'

export const fetchProductos = (sessionData) => {
  fetch2JSON(`https://api.mercadolibre.com/users/254307406/items/search?access_token=${sessionData.access_token}`)
    .flatMap(res => res.results)
    .flatMap(id => getProductById(id))
    .subscribe(prod => store.dispatch(add_producto(prod)))
  return { type: productosAct.fetch }
}

export const add_producto = (producto) => {
  return { type: productosAct.add, producto }
}
