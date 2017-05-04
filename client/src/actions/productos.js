import { productosAct } from '../constants/actionTypes'
import { fetchJsonToObs, getProductById } from '../../helpers'
import { store } from '../../store'
import { Maybe } from 'ramda-fantasy'
import Rx from 'rxjs'

export const fetchProductos = (sessionData) => {
  fetchJsonToObs('../productos')
    .subscribe(produtosDatosAdicionales => {
      Rx.Observable.merge(
        fetchJsonToObs(`https://api.mercadolibre.com/users/${sessionData.user_id}/items/search?access_token=${sessionData.access_token}`)
          .flatMap(res => res.results)
          .flatMap(id => getProductById(id))
          .map(prod => ({ ...prod, origen: 'MercadoLibre' })),
        fetchJsonToObs(`https://api.mercadoshops.com/v1/shops/${sessionData.user_id}/listings/search?access_token=${sessionData.access_token}`)
          .flatMap(res => res.results)
          .map(prod => ({ ...prod, origen: 'MercadoShops' }))
      )
        .subscribe(prod => {
          const localProducto = Maybe(produtosDatosAdicionales.find(producto => producto.id == prod.id))
            .getOrElse({ licencias: [], template: '' })
          store.dispatch(add_producto({ ...prod, ...localProducto }))
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
export const updateProducto = (id, licencias, template) => {
  fetch('../productos', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ id, licencias, template })
  })
  return { type: productosAct.updateProducto, licencias, template, id }
}

export const addLicencia = (id) => {
  return { type: productosAct.addLicencia, id }
}

export const removeLicencia = (id, index) => {
  return { type: productosAct.removeLicencia, id, index }
}
