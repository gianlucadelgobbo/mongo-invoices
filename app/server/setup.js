//var DB = require('./server/modules/db-manager');
var bodyParser = require('body-parser');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var methodOverride = require('method-override');

module.exports = function(app, exp) {
	var env = process.env.NODE_ENV || 'development';
	if ('development' == env) {
		app.set('views', [global.settings.root_path + '/app/server/views', global.settings.root_path + '/warehouse']);
		app.set('view engine', 'pug');
		//app.set('view options', { doctype : 'html', pretty : true });
		app.use(bodyParser.urlencoded({ extended: true }));
		app.use(cookieParser());
		app.use(session({ secret: 'mongo-invoices', resave: false, saveUninitialized: true, cookie: { maxAge: 60000 } }));
		app.use(methodOverride());
		app.use(require('stylus').middleware({ src: global.settings.root_path + '/app/public' }));
		app.use(exp.static(global.settings.root_path + '/app/common'));
		app.use(exp.static(global.settings.root_path + '/app/public'));
		app.use(exp.static(global.settings.root_path + '/warehouse'));
		//app.use(DB.i18n.init);
	}
};