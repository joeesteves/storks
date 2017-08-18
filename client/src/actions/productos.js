import { productosAct } from '../constants/actionTypes'
import { fetchJsonToObs, getProductById } from '../../helpers'
import { store } from '../../store'
import { Maybe } from 'ramda-fantasy'
import Rx from 'rxjs'

export const fetchProductos = (sessionData) => {
  const meliUrl = `https://api.mercadolibre.com/users/${sessionData.user_id}/items/search?status=active&access_token=${sessionData.access_token}`
  const mshopsUrl = `https://api.mercadoshops.com/v1/shops/${sessionData.user_id}/listings/search?access_token=${sessionData.access_token}`
  fetchJsonToObs('../productos')
    .subscribe(produtosDatosAdicionales => {
      Rx.Observable.merge(
        fetchAndConcat(meliUrl, sessionData, 0)
          .flatMap(id => getProductById(id))
          .map(prod => ({ ...prod, origen: 'MercadoLibre' })),
        fetchAndConcat(mshopsUrl, sessionData, 0)
          .map(prod => ({ ...prod, origen: 'MercadoShops' })),
        Rx.Observable.of({ id: 'templateVencimiento', origen: 'MercadoLibre', status: 'active', title: 'Template para vencimientos',thumbnail: 'http://4.bp.blogspot.com/-Pmx-FbDHLxA/VKV26N_7yZI/AAAAAAAA7S8/NQK1qOZMK3U/s1600/calendario.png'})
      )
        .filter(product => product.status === 'active')

        .subscribe(prod => {
          const localProducto = Maybe(produtosDatosAdicionales
            .find(producto => producto._id == prod.id))
            .getOrElse({ licencias: [], template: '' })
          store.dispatch(add_producto({ ...prod, ...localProducto }))
        })
    })

}
const fetchAndConcat = (url, sessionData, offset) => {
  return Rx.Observable.defer(() => {
    return fetchJsonToObs(`${url}&offset=${offset}`)
      .flatMap(res => {
        const items = Rx.Observable.from(res.results)
        const next = (res.paging.offset + 50 < res.paging.total) ? fetchAndConcat(url, sessionData, res.paging.offset + 50) : Rx.Observable.empty()
        return Rx.Observable.concat(items, next)
      })
  })
}

const add_producto = (producto) => {
  return { type: productosAct.add, producto }
}

export const toggleEditProducto = (id) => {
  return { type: productosAct.edit, id }
}

export const turnOffEditProducto = () => {
  return { type: productosAct.offEdit }
}
export const pushProducto = (id, _rev, licencias, template, vigencia) => {
  console.log(vigencia)
  fetch('../productos', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ id, _rev, licencias, template, vigencia })
  })
    .then((doc) => {
      console.log(doc)
      store.dispatch(toggleEditProducto(id))
      store.dispatch(updateProducto(id, doc._rev, licencias, template, vigencia))
    })
    .catch(console.log)
  return { type: productosAct.pushProducto }
}

const updateProducto = (id, _rev, licencias, template, vigencia) => {

  return { type: productosAct.updateProducto, licencias, template, id, _rev, vigencia }
}

export const addLicencia = (id) => {
  return { type: productosAct.addLicencia, id }
}

export const removeLicencia = (id, index) => {
  return { type: productosAct.removeLicencia, id, index }
}
