var i18n = require('i18n');
i18n.configure({
    // setup some locales - other locales default to en silently
    locales:['en', 'it'],

    // where to register __() and __n() to, might be "global" if you know what you are doing
    register: global
});
var bla = require('./public/config.js');
GLOBAL._config = bla._config;

module.exports = function(app, exp) {
	app.configure(function(){
		app.use(i18n.init);
		app.set('views', app.root + '/app/server/views');
		app.set('view engine', 'jade');
		app.set('view options', { doctype : 'html', pretty : true });
		app.use(exp.bodyParser());
		app.use(exp.cookieParser());
		app.use(exp.session({ secret: 'super-duper-secret-secret' }));
		app.use(exp.methodOverride());
		app.use(require('stylus').middleware({ src: app.root + '/app/public' }));
		//app.use(exp.static(app.root + '/app/server'));
		app.use(exp.static(app.root + '/config/config.js'));
		app.use(exp.static(app.root + '/app/public'));
	});
}