import R from 'ramda'
import Rx from 'rxjs'

export const cookieParser = (cookiesStr) => {
  return R.pipe(R.split(";"), R.map(_extractKeyValues), R.reduce(_merge, {}))(cookiesStr)
}

export const fetchJsonToObs = (url, options = {}) => {
  return Rx.Observable.fromPromise(fetch(url)).flatMap(p => fromPromise(p.json()) )
} 
export const fromPromise = (p) => Rx.Observable.fromPromise(p)

export const getProductById = (id) => {
  return fetchJsonToObs(`https://api.mercadolibre.com/items/${id}`)
}


const _extractKeyValues = (partialStr) => {
  const result = partialStr.match(/(\w*)=(.*)/)
  return { [result[1]]: result[2] }
}

const _merge = (prev, curr) => R.merge(prev, curr)

