/**forever start -l forever.log -o out.log -e err.log  --debug -a app.js
 * Node.js Mongo invoices
 * Author : Gianluca Del Gobbo, Fabrizio Chivoloni as Flyer communication, FLxER, Free Hardware Foundation and Linux Club
 * More Info : https://github.com/gianlucadelgobbo/mongo-invoices
 */

global.settings = {
	port:			8005,
	dbPort:			27017,
	dbHost:			"localhost",
	dbUsersName:	"admin",
	root_path:		__dirname,
	defaultLocales: ["en","it"],
	defaultLocale: 	"en",
	roles: require('./app/server/config.js')._roles.roles,
	googleAnalytics: "UA-85060850-1"
}
var DBUsers = require('./app/server/helpers/db-users-manager');

DBUsers.init(function(){
	var exp = require('express');
	var app = exp.createServer();

	require('./app/server/setup')(app, exp);
	require('./app/server/router')(app);

	app.listen(global.settings.port, function(){
		console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
	});
});

