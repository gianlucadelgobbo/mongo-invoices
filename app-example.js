/**forever start -l forever.log -o out.log -e err.log  --debug -a app.js
 * Node.js AVnode-Members-Tools
 * Author : Gianluca Del Gobbo, Fabrizio Chivoloni as Flyer communication, FLxER, Free Hardware Foundation and Linux Club
 * More Info : https://github.com/gianlucadelgobbo/AVnode-Members-Tools
 */

global.settings = {
  port:			8100,
  dbPort:			27017,
  dbHost:			"localhost",
  dbUsersName:	"members-tools-admin",
  root_path:		__dirname,
  defaultLocales: ["en","it"],
  defaultLocale: 	"en",
  roles: require('./app/server/config.js')._roles.roles,
  googleAnalytics: "UA-91163374-1"
};
var DBUsers = require('./app/server/helpers/db-users-manager');

DBUsers.init(function(){
  var exp = require('express');
  var app = exp();
  app.set('port', process.env.PORT || global.settings.port);

  require('./app/server/setup')(app, exp);
  require('./app/server/router')(app);

  app.listen(app.get('port'), function(){
    console.log("Express server listening on port %d in %s mode", app.get('port'), app.settings.env);
  });
});

