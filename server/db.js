const Datastore = require('nedb'),
  db = new Datastore({ filename: 'db', autoload: true }),
  msdb = new Datastore({ filename: 'msdb', autoload: true }),
  mailsdb = new Datastore({ filename: 'mailsdb', autoload: true })

//AutoCompact every 20 min
db.persistence.setAutocompactionInterval(1200000)
msdb.persistence.setAutocompactionInterval(2400000)
// 

module.exports = { db, msdb, mailsdb }