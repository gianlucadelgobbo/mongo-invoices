
/**forever start -l forever.log -o out.log -e err.log  --debug -a app.js
 * Node.js Mongo invoices
 * Author : Gianluca Del Gobbo, Fabrizio Chivoloni as Flyer communication, FLxER, Free Hardware Foundation and Linux Club
 * More Info : https://github.com/gianlucadelgobbo/mongo-invoices
 */

var exp = require('express');
var app = exp.createServer();

app.root = __dirname;
global.host = 'localhost';

require('./app/setup')(app, exp);
require('./app/server/router')(app);

<<<<<<< HEAD
app.listen(8000, function(){
=======
app.listen(8003, function(){
>>>>>>> 76c7f54683f84df84f7b9728c952da133448c7f9
	console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
