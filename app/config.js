var i18n = require('i18n');
i18n.configure({
    // setup some locales - other locales default to en silently
    locales:['en', 'it'],

    // where to register __() and __n() to, might be "global" if you know what you are doing
    register: global
});
GLOBAL._config = {
	'company':			'FLYER COMMUNICATION',
	'company_address':	'Via del Verano 39, 00185 Roma t +39.06.78147301 - f +39.06.78390805 - www.flyer.it - flyer@flyer.it Sede Amministrativa: via Cardinal de Luca, 10 00196 Roma PI 06589171005 - NREA 977098',
	'bank':				'BANCA POPOLARE DI MILANO - via Appia Nuova, 447-449 Roma IBAN: IT73Z0558403220000000001753 N°CC: 175 AG: 331 Cab: 03220 Abi: 05584',
	'currency':			['€']
}
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
		app.use(exp.static(app.root + '/app/server'));
		app.use(exp.static(app.root + '/app/public'));
	});
}