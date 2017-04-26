import R from 'ramda'

export const cookieParser = (cookiesStr) => {
  return R.pipe(R.split(";"), R.map(_extractKeyValues), R.reduce(_merge, {}))(cookiesStr)
}


const _extractKeyValues = (partialStr) => {
  const result = partialStr.match(/(\w*)=(.*)/)
  return { [result[1]]: result[2] }
}

const _merge = (prev, curr) => R.merge(prev, curr)

