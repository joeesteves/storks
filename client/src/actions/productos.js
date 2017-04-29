import { productosAct } from '../constants/actionTypes'
import { fetchJsonToObs, getProductById } from '../../helpers'
import { store } from '../../store'
import { Maybe } from 'ramda-fantasy'
export const fetchProductos = (sessionData) => {
  fetchJsonToObs('../productos')
    .subscribe(produtosDatosAdicionales => {
      fetchJsonToObs(`https://api.mercadolibre.com/users/254307406/items/search?access_token=${sessionData.access_token}`)
        .flatMap(res => res.results)
        .flatMap(id => getProductById(id))
        .subscribe(prod => {
          const licencias = Maybe(produtosDatosAdicionales.find(producto => producto.id === prod.id))
          .map(prod => prod.licencias).getOrElse([])
          store.dispatch(add_producto({ ...prod, licencias }))
        })
    })

}

export const add_producto = (producto) => {
  return { type: productosAct.add, producto }
}

export const toggleEditProducto = (id) => {
  return { type: productosAct.edit, id }
}

export const turnOffEditProducto = () => {
  return { type: productosAct.offEdit }
}