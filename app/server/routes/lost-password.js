exports.post = function post(req, res) {
	var DB = require('../modules/db-manager');
	var EM = require('../modules/email-dispatcher');
	// look up the user's account via their email //
	if (global._config.emailDispatcher && global._config.emailDispatcher.host && global._config.emailDispatcher.password) {
		DB.accounts.findOne({email: req.param('email')}, function (e, o) {
			if (o) {
				res.send('ok', 200);
				EM.dispatchResetPasswordLink(o, req.headers.host, function (e, m) {
					console.log(req);
					console.log(req.headers.host);
					// this callback takes a moment to return //
					// should add an ajax loader to give user feedback //
					if (!e) {
						//  res.send('ok', 200);
					} else {
						res.send('email-server-error', 400);
						for (var k in e) console.log('error : ', k, e[k]);
					}
				});
			} else {
				res.send('email-not-found', 400);
			}
		});
	} else {
		res.send('email-settings-not-found', 400);
	}
};
