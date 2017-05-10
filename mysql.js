const mysql = require('mysql')
var connection = mysql.createConnection({
  host     : '190.228.29.59',
  user     : 'entregas',
  password : 'Alfa12345',
  database : 'entregas',
  insecureAuth: true
});

connection.query('SELECT 1 + 1 AS solution', function (error, results, fields) {
  if (error) throw error;
  console.log('The solution is: ', results[0].solution);
});

connection.end();
