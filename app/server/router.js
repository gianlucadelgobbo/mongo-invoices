
var CT = require('./modules/country-list');
var DB = require('./modules/db-manager');
var EM = require('./modules/email-dispatcher');

var ObjectID = require('mongodb').ObjectID;

module.exports = function(app) {

// main login page //

	app.get('/', function(req, res){
	// check if the user's credentials are saved in a cookie //
		if (req.cookies.user == undefined || req.cookies.pass == undefined){
			res.render('login', { locals: { title: 'Hello - Please Login To Your Account' }});
		}	else{
	// attempt automatic login //
			DB.autoLogin(req.cookies.user, req.cookies.pass, function(o){
				if (o != null){
				    req.session.user = o;
					res.redirect('/home');
				}	else{
					res.render('login', { locals: { title: 'Hello - Please Login To Your Account' }});
				}
			});
		}
	});
	
	app.post('/', function(req, res){
		DB.manualLogin(req.param('user'), req.param('pass'), function(e, o){
			if (!o){
				res.send(e, 400);
			}	else{
			    req.session.user = o;
				if (req.param('remember-me') == 'true'){
					res.cookie('user', o.user, { maxAge: 900000 });
					res.cookie('pass', o.pass, { maxAge: 900000 });
				}
				res.send(o, 200);
			}
		});
	});
	
// logged-in user homepage //
	
	app.get('/logout', function(req, res) {
		res.clearCookie('user');
		res.clearCookie('pass');
		req.session.destroy(function(e){res.redirect('/')});
	});
	
	app.get('/account', function(req, res) {
	    if (req.session.user == null){
	// if user is not logged-in redirect back to login page //
	        res.redirect('/');
	    }   else{
			res.render('account', {
				locals: {
					title : 'Control Panel',
					countries : CT,
					udata : req.session.user
				}
			});
	    }
	});
	
	app.post('/account', function(req, res){
		if (req.param('user') != undefined) {
			DB.update({
				user 		: req.param('user'),
				name 		: req.param('name'),
				email 		: req.param('email'),
				country 	: req.param('country'),
				pass		: req.param('pass')
			}, function(o){
				if (o){
					req.session.user = o;
			// udpate the user's login cookies if they exists //
					if (req.cookies.user != undefined && req.cookies.pass != undefined){
						res.cookie('user', o.user, { maxAge: 900000 });
						res.cookie('pass', o.pass, { maxAge: 900000 });	
					}
					res.send('ok', 200);
				}	else{
					res.send('error-updating-account', 400);
				}
			});
		} else if (req.param('logout') == 'true'){
			res.clearCookie('user');
			res.clearCookie('pass');
			req.session.destroy(function(e){res.send('ok', 200); });
		}
	});
	
// creating new accounts //
	
	app.get('/signup', function(req, res) {
		res.render('signup', {  locals: { title: 'Signup', countries : CT } });
	});
	
	app.post('/signup', function(req, res){
		DB.signup({
			name 	: req.param('name'),
			email 	: req.param('email'),
			user 	: req.param('user'),
			pass	: req.param('pass'),
			country : req.param('country')
		}, function(e, o){
			console.log(e);
			console.log(o);
			if (e){
				res.send(e, 400);
			}	else{
				res.send('ok', 200);
			}
		});
	});

// password reset //

	app.post('/lost-password', function(req, res){
	// look up the user's account via their email //
		DB.getEmail(req.param('email'), function(o){
			if (o){
				res.send('ok', 200);
				EM.dispatchResetPasswordLink(o, function(e, m){
				// this callback takes a moment to return //
				// should add an ajax loader to give user feedback //
					if (!e) {
					//	res.send('ok', 200);
					}	else{
						res.send('email-server-error', 400);
						for (k in e) console.log('error : ', k, e[k]);
					}
				});
			}	else{
				res.send('email-not-found', 400);
			}
		});
	});

	app.get('/reset-password', function(req, res) {
		var email = req.query["e"];
		var passH = req.query["p"];
		DB.validateLink(email, passH, function(e){
			if (e != 'ok'){
				res.redirect('/');
			} else{
	// save the user's email in a session instead of sending to the client //
				req.session.reset = { email:email, passHash:passH };
				res.render('reset', { title : 'Reset Password' });
			}
		})
	});
	
	app.post('/reset-password', function(req, res) {
		var nPass = req.param('pass');
	// retrieve the user's email from the session to lookup their account and reset password //
		var email = req.session.reset.email;
	// destory the session immediately after retrieving the stored email //
		req.session.destroy();
		DB.setPassword(email, nPass, function(o){
			if (o){
				res.send('ok', 200);
			}	else{
				res.send('unable to update password', 400);
			}
		})
	});
	
// view & delete accounts //
	
	app.get('/print', function(req, res) {
		DB.getAllRecords( function(e, accounts){
			res.render('print', { locals: { title : 'Account List', accts : accounts } });
		})
	});
	
	app.post('/delete', function(req, res){
		DB.delete(req.body.id, function(e, obj){
			if (!e){
				res.clearCookie('user');
				res.clearCookie('pass');
	            req.session.destroy(function(e){ res.send('ok', 200); });
			}	else{
				res.send('record not found', 400);
			}
	    });
	});
	
	app.get('/reset', function(req, res) {
		DB.delAllRecords( );
		res.redirect('/print');
	});
	
	
	//invoice
	
	app.get('/invoice', function(req, res) {
	    if (req.session.user == null) {
	        res.redirect('/');
	    } else {
			if (req.query.id) {
				DB.invoices.find({_id:new ObjectID(req.query.id)}).toArray(function(e, result) {
					res.render('flyer_client', {  locals: { title: 'Invoice', result : result[0], udata : req.session.user } });
				});
			} else {
				res.render('flyer_invoice', {  locals: { title: 'Invoice', result:[] , udata : req.session.user } });
			}
		}
	});
	
	app.get('/invoices', function(req, res){
	    if (req.session.user == null) {
	        res.redirect('/');
	    } else {
			DB.invoices.find({}).toArray(function(e, result) {
				res.render('flyer_invoices', {  locals: { title: 'Invoices', result : result, udata : req.session.user } });
			});
		}
	});
	
	app.post('/invoices', function(req, res){
	    if (req.session.user == null) {
	        res.redirect('/');
	    } else {
			DB.insert_invoice(req.body, function(e, o){
				if (e){
					res.send(e, 400);
				}else{
					DB.invoices.find({}).toArray(function(e, result) {
						res.render('flyer_invoices', {  locals: { title: 'Invoices', result : result, udata : req.session.user } });
					});
				}
			});
			//return false;
		}
	});
	
	//api
	
	app.get('/api/clients',function(req, res) {
		if (req.session.user == null) {
	        res.redirect('/');
	    } else {
			DB.clients.find({name:new RegExp("/^"+req.term+"/")}).toArray(function(e, result) {
				console.log(result);
				res.send(result);
			});
		}
	});
	
	
	//client
	app.get('/client',function(req, res) {
	    if (req.session.user == null) {
	        res.redirect('/');
	    } else {
			if (req.query.id) {
				DB.clients.find({_id:new ObjectID(req.query.id)}).toArray(function(e, result) {
					res.render('flyer_client', {  locals: { title: 'Client', countries : CT, result : result[0], udata : req.session.user } });
				});
			} else {
				res.render('flyer_client', {  locals: { title: 'Client', countries : CT, result : {indirizzo:{}}, udata : req.session.user } });
			}
		}
	});
	
	app.get('/clients', function(req, res){
	    if (req.session.user == null) {
	        res.redirect('/');
	    } else {
			DB.clients.find({}).toArray(function(e, result) {
				res.render('flyer_clients', {  locals: { title: 'Clients', result : result, udata : req.session.user } });
			});
		}
	});
	
	app.post('/clients', function(req, res){
	    if (req.session.user == null) {
	        res.redirect('/');
	    } else {
			if (req.body.id) {
				DB.update_client(req.body, function(e, o){
						DB.clients.find({}).toArray(function(e, result) {
							res.render('flyer_clients', {  locals: { title: 'Clients', result : result, udata : req.session.user } });
						});
				});
			} else {
				DB.insert_client(req.body, function(e, o){
					if (e){
						res.send(e, 400);
					}else{
						DB.clients.find({}).toArray(function(e, result) {
							res.render('flyer_clients', {  locals: { title: 'Clients', result : result, udata : req.session.user } });
						});
					}
				});
			}
		}
	});

	app.get('/home', function(req, res) {
	    if (req.session.user == null) {
	        res.redirect('/');
	    } else {
			res.render('home', {
				locals: {
					title : 'Home',
					countries : CT,
					udata : req.session.user
				}
			});
	    }
	});
	
	
	app.get('*', function(req, res) { res.render('404', { title: 'Page Not Found'}); });

};