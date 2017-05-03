const Datastore = require('nedb'),
  db = new Datastore({ filename: 'db', autoload: true })
  
//AutoCompact every 20 min
db.persistence.setAutocompactionInterval(1200000)
// 

module.exports = db