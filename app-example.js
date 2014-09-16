/**forever start -l forever.log -o out.log -e err.log  --debug -a app.js
 * Node.js Mongo invoices
 * Author : Gianluca Del Gobbo, Fabrizio Chivoloni as Flyer communication, FLxER, Free Hardware Foundation and Linux Club
 * More Info : https://github.com/gianlucadelgobbo/mongo-invoices
 */

global.settings = {
	port:		8003,
	dbPort:		27017,
	dbHost:		'localhost',
	dbName:		"admin-linux"
}
var DB = require('./app/server/modules/db-manager');

DB.init(function(){
	var exp = require('express');
	var app = exp.createServer();
	
	app.root = __dirname;
	
	require('./app/setup')(app, exp);
	require('./app/server/router')(app);
	
	app.listen(global.settings.port, function(){
		console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
	});
});	

