const fs = require('fs'),
  R = require('ramda')
let session = {}

const getSession = () => {
  try {
    return JSON.parse(fs.readFileSync('session.json'))
  } catch (e) {
    return false
  }
}
const isValidSession = (session) => {
  return ['access_token', 'token_type', 'user_id']
  .reduce((p, c) => p && R.contains(c, Object.keys(session), true))
}

const updateSession = (newSession) => {
  console.log("UPDATE SESSION")
  fs.writeFileSync('session.json', JSON.stringify(newSession))
  return session = newSession
}


module.exports = {
  getSession,
  updateSession,
  isValidSession
}