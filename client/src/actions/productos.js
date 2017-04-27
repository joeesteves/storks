import { productos_acciones } from '../constants/productos'
import { fetch2JSON, getProductById } from '../../helpers'
import { store } from '../../store'

export const fetch_productos = (sessionData) => {
  fetch2JSON(`https://api.mercadolibre.com/users/254307406/items/search?access_token=${sessionData.access_token}`)
    .flatMap(res => res.results)
    .flatMap(id => getProductById(id))
    .subscribe(prod => store.dispatch(add_producto(prod)))
  return { type: productos_acciones.fetch }
}

export const add_producto = (producto) => {
  return { type: productos_acciones.add, producto }
}
