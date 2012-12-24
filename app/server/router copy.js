
var CT = require('./modules/country-list');
var DB = require('./modules/db-manager');
var EM = require('./modules/email-dispatcher');
var Validator = require('./modules/validator');

var accounting = require('accounting');
accounting.settings = _config.accountingSettings;

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
				if (req.param('ajax') == 'true') {
					res.send(o, 200);
				} else {
					res.redirect('/home');
				}
			}
		});
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
	
/*
	app.get('/print', function(req, res) {
		DB.getAllRecords( function(e, accounts){
			res.render('print', { locals: { title : 'Account List', accts : accounts } });
		})
	});
	app.get('/reset', function(req, res) {
		DB.delAllRecords( );
		res.redirect('/print');
	});
	
*/	
	app.post('/deleteuser', function(req, res){
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
	
		
	//client

	app.get('/clients', function(req, res){
	    if (req.session.user == null) {
	        res.redirect('/');
	    } else {
			DB.clients.find({}).toArray(function(e, result) {
				res.render('clients', {  locals: { title: 'Clients', result : result, udata : req.session.user } });
			});
		}
	});
	
	app.get('/client',function(req, res) {
	    if (req.session.user == null) {
	        res.redirect('/');
	    } else {
			if (req.query.id) {
				DB.clients.find({_id:new ObjectID(req.query.id)}).toArray(function(e, result) {
					res.render('client', {  locals: { title: 'Client', countries : CT, result : result[0], udata : req.session.user } });
				});
			} else {
				res.render('client', {  locals: { title: 'Client', countries : CT, result : {address:{}}, udata : req.session.user } });
			}
		}
	});
	
	app.post('/client', function(req, res){
	    if (req.session.user == null) {
	        res.redirect('/');
	    } else {
			if (req.body.id) {
				DB.update_client(req.body, function(e, o){
						DB.clients.find({}).toArray(function(e, result) {
							res.render('clients', {  locals: { title: 'Clients', result : result, udata : req.session.user } });
						});
				});
			} else {
				DB.insert_client(req.body, function(e, o){
					if (e){
						res.send(e, 400);
					}else{
						DB.clients.find({}).toArray(function(e, result) {
							res.render('clients', {  locals: { title: 'Clients', result : result, udata : req.session.user } });
						});
					}
				});
			}
		}
	});

	//invoice
	
	app.get('/invoices', function(req, res){
	    if (req.session.user == null) {
	        res.redirect('/');
	    } else {
			DB.invoices.find({}).sort({invoice_number:1}).toArray(function(e, result) {
				res.render('invoices', {  locals: { title: 'Invoices', result : result, udata : req.session.user } });
			});
		}
	});
	
	app.get('/invoice', function(req, res) {
	    if (req.session.user == null) {
	        res.redirect('/');
	    } else {
			if (req.query.id) {
				DB.invoices.find({_id:new ObjectID(req.query.id)}).toArray(function(e, result) {
					result[0].subtotal=accounting.formatMoney(result[0].subtotal);
					result[0].vat_amount=accounting.formatMoney(result[0].vat_amount);
					result[0].shipping_costs=accounting.formatMoney(result[0].shipping_costs);
					result[0].total=accounting.formatMoney(result[0].total);
					for(var i=0;i<result[0].items.length;i++){
						result[0].items[i].price=accounting.formatMoney(result[0].items[i].price);
						result[0].items[i].amount=accounting.formatMoney(result[0].items[i].amount);
					}
					res.render('invoice', {  locals: { title: 'Invoice', result : result[0], errors : [], udata : req.session.user } });
				});
			} else {
				DB.invoices.find({},{invoice_date:1,invoice_number:1}).sort({invoice_number:1}).toArray(function(e, result) {
					resultEmpty = {invoice_date:new Date(),invoice_number:result.length+1,to_client:{address:{}},offer:{},items:[{}]};
					res.render('invoice', {  locals: { title: 'Invoice', result : resultEmpty, errors : [], udata : req.session.user } });
				});
			}
		}
	});
	
	app.post('/invoice', function(req, res){
	    if (req.session.user == null) {
	        res.redirect('/');
	    } else {
			//controls
			errors = [];
			errors = errors.concat(Validator.checkClientID(req.body.to_client._id));
			errors = errors.concat(Validator.checkInvoiceDate(req.body.invoice_number,req.body.invoice_date));
			errors = errors.concat(Validator.checkDeliveryDate(req.body.delivery_date));
			var d = req.body.invoice_date.split("/");
			if(errors.length == 0){
				var date=new Date(parseInt(d[2]),parseInt(d[1])-1,parseInt(d[0]));
				var q = {invoice_date:{$gt: date},invoice_number:(req.body.invoice_number-1).toString() };
				DB.invoices.find(q).toArray(function(e, result) {
					if(result.length){
						errors.push("Data must be greater than "+result.invoice_date);
					}
					if(errors.length == 0){
						var myid = req.body.id;
						if (req.body.id) {
							DB.update_invoice(req.body, req.session.user, function(e, o){
						        res.redirect('/invoice/?id='+myid);
							});
						} else {
							DB.insert_invoice(req.body, function(e,o){
								if (e){
									res.send(e, 400);
								}else{
									DB.invoices.find({_id: o[0]._id}).toArray(function(e, result) {
										result[0].subtotal=accounting.formatMoney(result[0].subtotal);
										result[0].vat_amount=accounting.formatMoney(result[0].vat_amount);
										result[0].shipping_costs=accounting.formatMoney(result[0].shipping_costs);
										result[0].total=accounting.formatMoney(result[0].total);
										for(var i=0;i<result[0].items.length;i++){
											result[0].items[i].price=accounting.formatMoney(result[0].items[i].price);
											result[0].items[i].amount=accounting.formatMoney(result[0].items[i].amount);
										}
										res.render('invoice', {  locals: { title: 'Invoice', result : result[0], errors : errors, udata : req.session.user } });
									});
								}
							});
						}
					} else {
						var d = req.body.invoice_date.split("/");
						req.body.invoice_date = new Date(parseInt(d[2]),parseInt(d[1])-1,parseInt(d[0]));
						req.body.to_client.address={};
						res.render('invoice', {  locals: { title: 'Invoice', result : req.body, errors : errors, udata : req.session.user } });
					}
				});
			} else {
				req.body.invoice_date = new Date(parseInt(d[2]),parseInt(d[1])-1,parseInt(d[0]));
				req.body.to_client.address={};
				res.render('invoice', {  locals: { title: 'Invoice', result : req.body, errors : errors, udata : req.session.user } });
			}
		}
	});
	
	app.get('/print/invoice', function(req, res) {
	    if (req.session.user == null) {
	        res.redirect('/');
	    } else {
			if (req.query.id) {
				DB.invoices.find({_id:new ObjectID(req.query.id)}).toArray(function(e, result) {
					//result[0].invoice_date = new Date(result[0].invoice_date);
					res.render('print_invoice', { layout: 'print.jade' ,  locals: { title: 'Invoice', result : result[0], errors : [], udata : req.session.user } });
				});
			} else {
	        	res.redirect('/invoices');
			}
		}
	});
			
	//api
	
	app.get('/api/clients',function(req, res) {
		if (req.session.user == null) {
	        res.redirect('/');
	    } else {
			query = {name:{$regex: req.query.term, $options: 'i' }};
			console.dir(query);
			DB.clients.find(query).toArray(function(e, result) {
				console.dir(result);
				res.send(result);
			});
		}
	});
	
	app.get('/api/payments',function(req, res) {
		if (req.session.user == null) {
	        res.redirect('/');
	    } else {
			query = {payment:{$regex: req.query.term, $options: 'i' }};
			console.dir(query);
			DB.invoices.distinct("payment", query, function(e, result) {
				console.dir(result);
				res.send(result);
			});
		}
	});
	
	app.get('/api/invoices',function(req, res) {
		var d = req.query.invoice_date.split("/");
		q = {invoice_date:{$gt:  new Date(parseInt(d[2]),parseInt(d[1])-1,parseInt(d[0]))},invoice_number:(req.query.invoice_number-1).toString() };
		console.dir(q);
		DB.invoices.find(q).toArray(function(e, result) {
			console.dir(result);
			res.send({result:result});
		});
	});
	
	app.get('/api/products',function(req, res) {
		if (req.session.user == null) {
	        res.redirect('/');
	    } else {
			query = {"items.description":{$regex: req.query.term, $options: 'i' }};
			console.dir(query);
			DB.invoices.distinct("items.description", query, function(e, result) {
				console.dir(result);
				res.send(result);
			});
		}
	});
	
	
	app.get('*', function(req, res) { res.render('404', { title: 'Page Not Found'}); });

};