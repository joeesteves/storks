const fs = require('fs')
let session = {}

const getSession = () => {
  session = JSON.parse(fs.readFileSync('session.json'))
  return session
}

const updateSession = (newSession) => {
  console.log("UPDATE SESSION")
  fs.writeFileSync('session.json', JSON.stringify(newSession))
  return session = newSession
}

module.exports = {
  getSession,
  updateSession
}