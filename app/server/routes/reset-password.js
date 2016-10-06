var DB = require('./../helpers/db-manager');

exports.get = function get(req, res) {
	res.render('reset', { title: __("Reset Password"), email:req.query.e });
};

exports.post = function post(req, res) {
	var nPass = req.body.pass;
	// retrieve the user's email from the session to lookup their account and reset password //
	var email = new Buffer(req.body.email, 'base64').toString('ascii');
	// destory the session immediately after retrieving the stored email //
	req.session.destroy();
	DB.setPassword(email, nPass, function(o){
		res.render('reset', { title: __("Reset Password"), result:o });
	});
};
