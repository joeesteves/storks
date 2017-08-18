const fs = require('fs')
let session = {}

const getSession = () => {
  try {
    return JSON.parse(fs.readFileSync('session.json'))
  } catch (e) {
    return false
  }
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