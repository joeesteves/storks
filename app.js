
const init = require('./server'),
  fs = require('fs'),
  log_file = fs.createWriteStream(`${__dirname}/logs/${new Date().toISOString()}.debug.log`, { flags: 'w' }),
  log_stdout = process.stdout

console.log = (d) => {
  log_file.write(`${new Date().toISOString()} ${d} \n`)
  log_stdout.write(`${new Date().toISOString()} ${d} \n`)
}

console.log("STARTING SERVER")
init()
