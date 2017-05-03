let cacheConf = {};
const setMailConfig = (conf) => {
  if (!conf) return false
  return cacheConf = conf
}

const getMailConfig = () => {
  return cacheConf
}

module.exports = { setMailConfig, getMailConfig }