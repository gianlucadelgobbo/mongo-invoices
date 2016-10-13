exports.post = function post(req, res) {
	var DB = require('./../helpers/db-manager');
	var EM = require('./email-dispatcher');
	// look up the user's account via their email //
	if (global._config.emailDispatcher && global._config.emailDispatcher.host && global._config.emailDispatcher.password) {
		DB.accounts.findOne({email: req.param('email')}, function (e, o) {
			if (o) {
				res.status(200).send('ok');
				EM.dispatchResetPasswordLink(o, req.headers.host, function (e, m) {
					console.log(req);
					console.log(req.headers.host);
					// this callback takes a moment to return //
					// should add an ajax loader to give user feedback //
					if (!e) {
						//  res.status(200).send('ok');
					} else {
						res.status(400).send('email-server-error');
						for (var k in e) console.log('error : ', k, e[k]);
					}
				});
			} else {
				res.status(400).send('email-not-found');
			}
		});
	} else {
		res.status(400).send('email-settings-not-found');
	}
};
