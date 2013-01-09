
var CT = require('./modules/country-list');
var DB = require('./modules/db-manager');
var EM = require('./modules/email-dispatcher');
var Validators = require('../common/validators').Validators;
var bcrypt = require('bcrypt')

var accounting = require('accounting');
accounting.settings = _config.accountingSettings;

var ObjectID = require('mongodb').ObjectID;

module.exports = function(app) {

// Log In //

	app.get('/', function(req, res){
		DB.accounts.findOne({},function(e, result){
			if(result){
				// check if the user's credentials are saved in a cookie //
				if (req.cookies.user == undefined || req.cookies.pass == undefined || req.cookies.role == undefined){
					res.render('login', { locals: { title: __('Hello - Please Login To Your Account'), result : {}, from:req.query.from }});
				} else {
				// attempt automatic login //
				DB.accounts.findOne({user:req.cookies.user}, function(e, o) {
					if (o){
						if (o.pass == req.cookies.pass) {
						    req.session.user = o;
	    					var redirect = req.query.from ? req.query.from : '/home';
							res.redirect(redirect);
						} else {
							res.render('login', { locals: { title: __('Hello - Please Login To Your Account'), result : {}, from:req.query.from }});
						}
					} else {
						res.render('login', { locals: { title: __('Hello - Please Login To Your Account'), result : {}, from:req.query.from }});
					}
				});
				}
			} else {
				res.render('account', {  locals: { title: __('Signup'), countries : CT, result : {} } });
			}
		});
	});
	app.post('/', function(req, res){
		var errors = [];
		DB.accounts.findOne({},function(e, result){
			if(result){
		    	validateFormLogin(req.body, function(e, o) {
		    		if (e.length) {
		    			if (req.body.ajax) {
							res.send({msg:{e:e}}, 200);
		    			} else {
			    			o._id = o.id;
							res.render('login', { locals: { title: __('Hello - Please Login To Your Account'), result : o, msg:{e:e}, from:req.body.from}});
		    			}
		    		} else {
					    req.session.user = o;
						if (req.param('remember-me') == 'true'){
							res.cookie('user', o.user, { maxAge: 900000 });
							res.cookie('pass', o.pass, { maxAge: 900000 });
							res.cookie('role', o.role, { maxAge: 900000 });
						}
						if (req.param('ajax') == 'true') {
							res.send(o, 200);
						} else {
							var redirect = req.body.from ? req.body.from : '/home';
							res.redirect(redirect);
						}
		    		}
		    	});
		    } else {
		    	validateFormAccount(req.body, function(e, o) {
		    		if (e.length) {
		    			if (req.body.ajax) {
							res.send({msg:{e:e}}, 200);
		    			} else {
			    			if (o.id) o._id = o.id;
							res.render('account', {  locals: {  title: __("Account"), countries : CT, result : o, msg:{e:e} } });
		    			}
		    		} else {
						DB.insert_account(req.body, function(e, o){
							var e = [];
							if (!o){
								e.push({name:"",m:__("Error updating account")});
							}
				    		if (e.length) {
				    			if (req.body.ajax) {
									res.send({msg:{e:e}}, 200);
				    			} else {
									res.render('account', {  locals: {  title: __("Client"), countries : CT, result : o[0], msg:{e:e}, udata : req.session.user } });
				    			}
				    		} else {
								DB.accounts.findOne({}, function(err, result) {
						    		req.session.user = result;
									e.push({name:"",m:__("Account saved with success")});
					    			if (req.body.ajax) {
										res.send({msg:{c:e,redirect:"/home/"}}, 200);
					    			} else {
					    				res.redirect("/home/");
					    			}
								});
							}
						});
		    		}
		    	});
		    }
		});
	});


// Log Out //

	app.get('/logout', function(req, res) {
		res.clearCookie('user');
		res.clearCookie('pass');
		res.clearCookie('role');
		req.session.destroy(function(e){res.redirect('/')});
	});

// Logged-in redirect / homepage //

	app.get('/home', function(req, res) {
	    if (req.session.user == null) {
	        res.redirect('/?from='+req.url);
	    } else {
			res.render('home', { locals: { title: __("Home"), countries : CT, udata : req.session.user } });
	    }
	});
	
	
// Accounts //
	
	app.get('/accounts', function(req, res){
	    if (req.session.user == null) {
	        res.redirect('/?from='+req.url);
	    } else {
			var msg = {};
	    	if (req.query.id && req.query.del) {
				DB.delete_account(req.query.id, function(err, obj){
					if (obj){
						msg.c = [];
						msg.c.push({name:"",m:__("Account deleted successfully")});
					} else {
						msg.e = [];
						msg.e.push({name:"",m:__("Account not found")});
					}
			    });
		    }
			DB.accounts.find({}).toArray(function(e, result) {
				res.render('accounts', {  locals: { title: __('Accounts'), result : result, msg: msg, udata : req.session.user } });
			});
		}
	});
	app.get('/account', function(req, res) {
	    if (req.session.user == null){
	        res.redirect('/?from='+req.url);
	    } else {
			if (req.query.id) {
				DB.accounts.findOne({_id:new ObjectID(req.query.id)}, function(e, result) {
					res.render('account', {  locals: { title: __('Account'), countries : CT, result : result, udata : req.session.user } });
				});
			} else {
				res.render('account', {  locals: { title: __('Account'), countries : CT, result : {}, udata : req.session.user } });
			}
	    }
	});
	
	app.post('/account', function(req, res){
		if (req.session.user == null) {
	        res.redirect('/?from='+req.url);
	    } else {
	    	validateFormAccount(req.body, function(e, o) {
	    		if (e.length) {
	    			if (req.body.ajax) {
						res.send({msg:{e:e}}, 200);
	    			} else {
		    			if (o.id) o._id = o.id;
						res.render('account', {  locals: {  title: __("Account"), countries : CT, result : o, msg:{e:e}, udata : req.session.user } });
	    			}
	    		} else {
					if (req.body.id) {
						DB.update_account(o, function(o){
							var e = [];
							if (o){
								if (req.session.user._id == o._id){
									req.session.user = o;
									// udpate the user's login cookies if they exists //
									if (req.cookies.user != undefined && req.cookies.pass != undefined && req.cookies.role != undefined){
										res.cookie('user', o.user, { maxAge: 900000 });
										res.cookie('pass', o.pass, { maxAge: 900000 });	
										res.cookie('role', o.role, { maxAge: 900000 });	
									}
								}
							} else {
								e.push({name:"",m:__("Error updating account")});
							}
				    		if (e.length) {
				    			if (req.body.ajax) {
									res.send({msg:{e:e}}, 200);
				    			} else {
					    			o._id = o.id;
									res.render('account', {  locals: {  title: __("Account"), countries : CT, result : o, msg:{e:e}, udata : req.session.user } });
				    			}
				    		} else {
								e.push({name:"",m:__("Account saved with success")});
				    			if (req.body.ajax) {
									res.send({msg:{c:e}}, 200);
				    			} else {
					    			o._id = o.id;
									DB.accounts.findOne({_id:new ObjectID(req.param('id'))},function(err, result) {
										res.render('account', {  locals: {  title: __("Account"), countries : CT, result : result, msg:{c:e}, udata : req.session.user } });
									});
				    			}
							}
						});
					} else {
						DB.insert_account(req.body, function(e, o){
							var e = [];
							if (!o){
								e.push({name:"",m:__("Error updating account")});
							}
				    		if (e.length) {
				    			if (req.body.ajax) {
									res.send({msg:{e:e}}, 200);
				    			} else {
									res.render('account', {  locals: {  title: __("Client"), countries : CT, result : o[0], msg:{e:e}, udata : req.session.user } });
				    			}
				    		} else {
								e.push({name:"",m:__("Account saved with success")});
				    			if (req.body.ajax) {
									res.send({msg:{c:e}}, 200);
				    			} else {
									DB.accounts.findOne({_id:o[0]._id},function(err, result) {
										res.render('account', {  locals: {  title: __("Client"), countries : CT, result : result, msg:{c:e}, udata : req.session.user } });
									});
				    			}
							}
						});
					}
	    		}
	    	});
		}	
	});

	
// password reset //

	app.post('/lost-password', function(req, res){
	// look up the user's account via their email //
		DB.accounts.findOne({email:req.param('email')}, function(e, o){
			if (o){
				res.send('ok', 200);
				EM.dispatchResetPasswordLink(o, function(e, m){
				// this callback takes a moment to return //
				// should add an ajax loader to give user feedback //
					if (!e) {
					//	res.send('ok', 200);
					} else {
						res.send('email-server-error', 400);
						for (k in e) console.log('error : ', k, e[k]);
					}
				});
			} else {
				res.send('email-not-found', 400);
			}
		});
	});

	app.get('/reset-password', function(req, res) {
		var email = req.query["e"];
		var passH = req.query["p"];
		DB.validateLink(email, passH, function(e){
			if (e != 'ok'){
				res.redirect('/?from='+req.url);
			} else{
	// save the user's email in a session instead of sending to the client //
				req.session.reset = { email:email, passHash:passH };
				res.render('reset', { title: __("Reset Password") });
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
			} else {
				res.send('unable to update password', 400);
			}
		})
	});
	
		
// Clients //

	app.get('/clients', function(req, res){
	    if (req.session.user == null) {
	        res.redirect('/?from='+req.url);
	    } else {
			var msg = {};
	    	if (req.query.id && req.query.del) {
				DB.delete_client(req.query.id, function(err, obj){
					if (obj){
						msg.c = [];
						msg.c.push({name:"",m:__("Client deleted successfully")});
					} else {
						msg.e = [];
						msg.e.push({name:"",m:__("Client not found")});
					}
			    });
		    }
			DB.clients.find({}).toArray(function(e, result) {
				res.render('clients', {  locals: { title: __("Clients"), result : result, msg: msg, udata : req.session.user } });
			});
		}
	});
	
	app.get('/client',function(req, res) {
	    if (req.session.user == null) {
	        res.redirect('/?from='+req.url);
	    } else {
			if (req.query.id) {
				DB.clients.findOne({_id:new ObjectID(req.query.id)}, function(e, result) {
					res.render('client', {  locals: { title: __("Client"), countries : CT, result : result , udata : req.session.user } });
				});
			} else {
				res.render('client', {  locals: { title: __("Client"), countries : CT, result : {address:{}}, udata : req.session.user } });
			}
		}
	});
	
	app.post('/client', function(req, res){
	    if (req.session.user == null) {
	        res.redirect('/?from='+req.url);
	    } else {
	    	validateFormClient(req.body, function(e, o) {
	    		if (e.length) {
	    			if (req.body.ajax) {
						res.send({msg:{e:e}}, 200);
	    			} else {
		    			o._id = o.id;
						res.render('client', {  locals: { title: __("Client"), countries : CT, result : o, msg:{e:e}, udata : req.session.user } });
	    			}
	    		} else {
					if (req.body.id) {
						var id = req.body.id;
						DB.update_client(o, function(o){
							var e = [];
							if (!o) e.push({name:"", m:__("Error updating client")});
				    		if (e.length) {
				    			if (req.body.ajax) {
									res.send({msg:{e:e}}, 200);
				    			} else {
					    			o._id = o.id;
									res.render('client', {  locals: { title: __("Client"), countries : CT, result : o, msg:{e:e}, udata : req.session.user } });
				    			}
				    		} else {
								e.push({name:"",m:__("Client saved with success")});
				    			if (req.body.ajax) {
									res.send({msg:{c:e}}, 200);
				    			} else {
									DB.clients.findOne({_id:new ObjectID(id)},function(err, result) {
										res.render('client', {  locals: { title: __("Client"), countries : CT, result : result, msg:{c:e}, udata : req.session.user } });
									});
				    			}
							}
						});
					} else {
						DB.insert_client(req.body, function(e, o){
							var e = [];
							if (!o){
								e.push({name:"",m:__("Error updating client")});
							}
				    		if (e.length) {
				    			if (req.body.ajax) {
									res.send({msg:{e:e}}, 200);
				    			} else {
									res.render('client', {  locals: { title: __("Client"), countries : CT, result : o[0], msg:{e:e}, udata : req.session.user } });
				    			}
				    		} else {
								e.push({name:"",m:__("Client saved with success")});
				    			if (req.body.ajax) {
									res.send({msg:{c:e}}, 200);
				    			} else {
									DB.clients.findOne({_id:o[0]._id},function(err, result) {
										res.render('client', {  locals: { title: __("Client"), countries : CT, result : result, msg:{c:e}, udata : req.session.user } });
									});
				    			}
							}
						});
					}
	    		}
	    	});
		}
	});

// Invoices //
	
	app.get('/invoices', function(req, res){
	    if (req.session.user == null) {
	        res.redirect('/?from='+req.url);
	    } else {
			var msg = {};
	    	if (req.query.id && req.query.del) {
				DB.delete_invoice(req.query.id, function(err, obj){
					if (obj){
						msg.c = [];
						msg.c.push({name:"",m:__("Invoice deleted successfully")});
					} else {
						msg.e = [];
						msg.e.push({name:"",m:__("Invoice not found")});
					}
			    });
		    }
	    	var query = req.query.client ? {"to_client._id":req.query.client} : {};
			DB.invoices.find(query).sort({invoice_number:1}).toArray(function(e, result) {
				res.render('invoices', {  locals: { title: __("Invoices"), result : result, msg:msg, udata : req.session.user } });
			});
		}
	});
	app.get('/invoice', function(req, res) {
	    if (req.session.user == null) {
	        res.redirect('/?from='+req.url);
	    } else {
			if (req.query.id) {
				DB.invoices.findOne({_id:new ObjectID(req.query.id)},function(e, result) {
					result = formatMoney(result);
					res.render('invoice', {  locals: { title: __("Invoice"), result : result, udata : req.session.user } });
				});
			} else {
				DB.invoices.find({},{invoice_date:1,invoice_number:1}).sort({invoice_number:1}).toArray(function(e, resultInvoice) {
					if (req.query.offer) {
						DB.offers.findOne({_id:new ObjectID(req.query.offer)},function(e, result) {
							result = formatMoney(result);
							result.invoice_date = new Date();
							result.invoice_number = resultInvoice.length+1;
							result.offer = {offer_number:result.offer_number,offer_date:result.offer_date};
							delete result._id;
							res.render('invoice', {  locals: {  title: __("Invoice"), result : result, udata : req.session.user } });
						});
					} else {
						resultEmpty = {invoice_date:new Date(),invoice_number:resultInvoice.length+1,to_client:{address:{}},offer:{},items:[{}]};
						res.render('invoice', {  locals: {  title: __("Invoice"), result : resultEmpty, udata : req.session.user } });
					}
				});
			}
		}
	});
	
	app.post('/invoice', function(req, res){
	    if (req.session.user == null) {
	        res.redirect('/?from='+req.url);
	    } else {
			//controls
			var errors = [];
			errors = errors.concat(Validators.checkClientID(req.body.to_client._id));
			errors = errors.concat(Validators.checkInvoiceNumber(req.body.invoice_number));
			errors = errors.concat(Validators.checkInvoiceDate(req.body.invoice_date));
			errors = errors.concat(Validators.checkDeliveryDate(req.body.delivery_date));
			var d = req.body.invoice_date.split("/");
			if(errors.length == 0){
				DB.clients.findOne({_id:new ObjectID(req.body.to_client._id)},function(e, result) {
					if (result) {
						var d = req.body.invoice_date.split("/");
						var date=new Date(parseInt(d[2]),parseInt(d[1])-1,parseInt(d[0]));
						var q = {invoice_date:{$gt: date},invoice_number:(req.body.invoice_number-1).toString() };
						DB.invoices.find(q).toArray(function(e, result) {
							if(errors.length == 0){
								var myid = req.body.id;
								if (req.body.id) {
									DB.update_invoice(req.body, req.session.user, function(e, o){
										errors.push({name:"",m:__("Invoice saved with success")});
										res.render('invoice', {  locals: {  title: __("Invoice"), result : o, msg:{c:errors}, udata : req.session.user } });
									});
								} else {
									DB.insert_invoice(req.body, req.session.user, function(e, o){
										var msg = {};
										if (e){
											msg.e = [];
											msg.e.push({name:"",m:__("Error updating invoice")});
										} else {
											msg.c = [];
											msg.c.push({name:"",m:__("Invoice saved with success")});
										}
										res.render('invoice', {  locals: {  title: __("Invoice"), result : o[0], msg:msg, udata : req.session.user } });
									});
								}
							} else {
								if (req.body.id) req.body._id = req.body.id;
								errors.push({name:"invoice_date",m:__("Data must be greater than")+": "+result.invoice_date});
								var d = req.body.offer_date.split("/");
								req.body.invoice_date = new Date(parseInt(d[2]),parseInt(d[1])-1,parseInt(d[0]));
								if (req.body.delivery_date) {
									var d = req.body.delivery_date.split("/");
									req.body.delivery_date = new Date(parseInt(d[2]),parseInt(d[1])-1,parseInt(d[0]));
								}
								if (req.body.offer.offer_date) {
									var d = req.body.offer.offer_date.split("/");
									req.body.offer.offer_date = new Date(parseInt(d[2]),parseInt(d[1])-1,parseInt(d[0]));
								}
								req.body.to_client.address={};
								res.render('invoice', {  locals: {  title: __("Invoice"), result : req.body, msg:{e:errors}, udata : req.session.user } });
							}
						});
					} else {
						if (req.body.id) req.body._id = req.body.id;
						errors.push({name:"to_client[name]",m:__("You have to insert a valid client")});
						var d = req.body.offer_date.split("/");
						req.body.invoice_date = new Date(parseInt(d[2]),parseInt(d[1])-1,parseInt(d[0]));
						if (req.body.delivery_date) {
							var d = req.body.delivery_date.split("/");
							req.body.delivery_date = new Date(parseInt(d[2]),parseInt(d[1])-1,parseInt(d[0]));
						}
						if (req.body.offer.offer_date) {
							var d = req.body.offer.offer_date.split("/");
							req.body.offer.offer_date = new Date(parseInt(d[2]),parseInt(d[1])-1,parseInt(d[0]));
						}
						req.body.to_client.address={};
						res.render('invoice', {  locals: {  title: __("Invoice"), result : req.body, msg:{e:errors}, udata : req.session.user } });
					}
				});
			} else {
				if (req.body.id) req.body._id = req.body.id;
				req.body.invoice_date = new Date(parseInt(d[2]),parseInt(d[1])-1,parseInt(d[0]));
				if (req.body.delivery_date) {
					var d = req.body.delivery_date.split("/");
					req.body.delivery_date = new Date(parseInt(d[2]),parseInt(d[1])-1,parseInt(d[0]));
				}
				if (req.body.offer.offer_date) {
					var d = req.body.offer.offer_date.split("/");
					req.body.offer.offer_date = new Date(parseInt(d[2]),parseInt(d[1])-1,parseInt(d[0]));
				}
				req.body.to_client.address={};
				res.render('invoice', {  locals: {  title: __("Invoice"), result : req.body, msg:{e:errors}, udata : req.session.user } });
			}
		}
	});
	
	app.get('/print/invoice', function(req, res) {
	    if (req.session.user == null) {
	        res.redirect('/?from='+req.url);
	    } else {
			if (req.query.id) {
				DB.invoices.findOne({_id:new ObjectID(req.query.id)},function(e, result) {
					res.render('print_invoice', { layout: 'print.jade' ,  locals: {  title: __("Invoice"), result : result, udata : req.session.user } });
				});
			} else {
	        	res.redirect('/invoices');
			}
		}
	});
			
// Offers //
	
	app.get('/offers', function(req, res){
	    if (req.session.user == null) {
	        res.redirect('/?from='+req.url);
	    } else {
			var msg = {};
	    	if (req.query.id && req.query.del) {
				DB.delete_invoice(req.query.id, function(err, obj){
					if (obj){
						msg.c = [];
						msg.c.push({name:"",m:__("Invoice deleted successfully")});
					} else {
						msg.e = [];
						msg.e.push({name:"",m:__("Invoice not found")});
					}
			    });
		    }
			DB.offers.find({}).sort({offer_number:1}).toArray(function(e, result) {
				res.render('offers', {  locals: {  title: __("Offers"), result : result, msg:msg, udata : req.session.user } });
			});
		}
	});
	app.get('/offer', function(req, res) {
	    if (req.session.user == null) {
	        res.redirect('/?from='+req.url);
	    } else {
			if (req.query.id) {
				DB.offers.findOne({_id:new ObjectID(req.query.id)},function(e, result) {
					result = formatMoney(result);
					res.render('offer', {  locals: {  title: __("Offer"), result : result, udata : req.session.user } });
				});
			} else {
				DB.offers.find({},{offer_date:1,offer_number:1}).sort({offer_number:1}).toArray(function(e, result) {
					resultEmpty = {offer_date:new Date(),offer_number:result.length+1,to_client:{address:{}},offer:{},items:[{}]};
					res.render('offer', {  locals: {  title: __("Offer"), result : resultEmpty, udata : req.session.user } });
				});
			}
		}
	});
	
	app.post('/offer', function(req, res){
	    if (req.session.user == null) {
	        res.redirect('/?from='+req.url);
	    } else {
			//controls
			var errors = [];
			errors = errors.concat(Validators.checkClientID(req.body.to_client._id));
			errors = errors.concat(Validators.checkOfferNumber(req.body.offer_number));
			errors = errors.concat(Validators.checkOfferDate(req.body.offer_date));
			var d = req.body.offer_date.split("/");
			if(errors.length == 0){
				DB.clients.findOne({_id:new ObjectID(req.body.to_client._id)},function(e, result) {
					if (result) {
						var d = req.body.offer_date.split("/");
						var date=new Date(parseInt(d[2]),parseInt(d[1])-1,parseInt(d[0]));
						var q = {offer_date:{$gt: date},offer_number:(req.body.offer_number-1).toString() };
						DB.offers.find(q).toArray(function(e, result) {
							if(errors.length == 0){
								var myid = req.body.id;
								if (req.body.id) {
									DB.update_offer(req.body, req.session.user, function(e, o){
										errors.push({name:"",m:__("Offer saved with success")});
										res.render('offer', {  locals: {  title: __("Offer"), result : o, msg:{c:errors}, udata : req.session.user } });
									});
								} else {
									DB.insert_offer(req.body, req.session.user, function(e,o){
										var msg = {};
										if (e){
											msg.e = [];
											msg.e.push({name:"",m:__("Error updating offer")});
										} else {
											msg.c = [];
											msg.c.push({name:"",m:__("Offer saved with success")});
										}
										res.render('offer', {  locals: {  title: __("Offer"), result : o[0], msg:msg, udata : req.session.user } });
									});
								}
							} else {
								if (req.body.id) req.body._id = req.body.id;
								errors.push({name:"offer_date",m:__("Data must be greater than")+": "+result.offer_date});
								var d = req.body.offer_date.split("/");
								req.body.offer_date = new Date(parseInt(d[2]),parseInt(d[1])-1,parseInt(d[0]));
								if (req.body.delivery_date) {
									var d = req.body.delivery_date.split("/");
									req.body.delivery_date = new Date(parseInt(d[2]),parseInt(d[1])-1,parseInt(d[0]));
								}
								if (req.body.offer.offer_date) {
									var d = req.body.offer.offer_date.split("/");
									req.body.offer.offer_date = new Date(parseInt(d[2]),parseInt(d[1])-1,parseInt(d[0]));
								}
								req.body.to_client.address={};
								res.render('offer', {  locals: {  title: __("Offer"), result : req.body, msg:{e:errors}, udata : req.session.user } });
							}
						});
					} else {
						if (req.body.id) req.body._id = req.body.id;
						errors.push({name:"to_client[name]",m:__("You have to insert a valid client")});
						var d = req.body.offer_date.split("/");
						req.body.offer_date = new Date(parseInt(d[2]),parseInt(d[1])-1,parseInt(d[0]));
						if (req.body.delivery_date) {
							var d = req.body.delivery_date.split("/");
							req.body.delivery_date = new Date(parseInt(d[2]),parseInt(d[1])-1,parseInt(d[0]));
						}
						if (req.body.offer.offer_date) {
							var d = req.body.offer.offer_date.split("/");
							req.body.offer.offer_date = new Date(parseInt(d[2]),parseInt(d[1])-1,parseInt(d[0]));
						}
						req.body.to_client.address={};
						res.render('offer', {  locals: {  title: __("Offer"), result : req.body, msg:{e:errors}, udata : req.session.user } });
					}
				});
			} else {
				if (req.body.id) req.body._id = req.body.id;
				errors.push({name:"to_client[name]",m:__("You have to insert a valid client")});
				var d = req.body.offer_date.split("/");
				req.body.offer_date = new Date(parseInt(d[2]),parseInt(d[1])-1,parseInt(d[0]));
				if (req.body.delivery_date) {
					var d = req.body.delivery_date.split("/");
					req.body.delivery_date = new Date(parseInt(d[2]),parseInt(d[1])-1,parseInt(d[0]));
				}
				if (typeof req.body.invoice!== "undefined" && req.body.invoice.invoice_date) {
					var d = req.body.invoice.invoice_date.split("/");
					req.body.invoice.invoice_date = new Date(parseInt(d[2]),parseInt(d[1])-1,parseInt(d[0]));
				}
				req.body.to_client.address={};
				res.render('offer', {  locals: {  title: __("Offer"), result : req.body, msg:{e:errors}, udata : req.session.user } });
			}
		}
	});
	
	app.get('/print/offer', function(req, res) {
	    if (req.session.user == null) {
	        res.redirect('/?from='+req.url);
	    } else {
			if (req.query.id) {
				DB.offers.findOne({_id:new ObjectID(req.query.id)}, function(e, result) {
					res.render('print_offer', { layout: 'print.jade' ,  locals: {  title: __("Offer"), result : result, udata : req.session.user } });
				});
			} else {
	        	res.redirect('/offers');
			}
		}
	});
// Forms validators //
	function validateFormLogin(o,callback) {
		var e = [];
		DB.accounts.findOne({user:o.user}, function(err, result) {
			if (result == null){
				e.push({name:"user",m:__("User not found")});
				callback(e, o);
			} else {
				bcrypt.compare(o.pass, result.pass, function(err, res) {
					if (!res) e.push({name:"pass",m:__("Invalid password")});
					callback(e, result);
				});
			}
		});
	}

	function validateFormAccount(o,callback) {
		var e = [];
		if (!Validators.validateStringLength(o.name, 3, 50)){
			e.push({name:"name",m:__("Please enter a valid Name")});
		}
		if (typeof o.country === "undefined" || !Validators.validateStringLength(o.country, 3, 50)){
			e.push({name:"country",m:__("Please enter a Country")});
		}
		if (!_config.roles[o.role]){
			e.push({name:"role",m:__("Please enter a valid Role")});
		}
		if (((o.id && o.pass!="") || !o.id) && !Validators.validateStringLength(o.pass, 3, 50)){
			e.push({name:"pass",m:__("Please enter a valid Password")});
		}
		if (((o.id && o.user!="") || !o.id) && !Validators.validateStringLength(o.user, 3, 50)){
			e.push({name:"user",m:__("Please enter a valid Username")});
		}
		if(!Validators.validateEmail(o.email)){
			e.push({name:"email",m:"Email is not email"});
			callback(e, o);
		} else {
			var q = (o.id ? {_id:{$ne: new ObjectID(o.id)},email:o.email} : {email:o.email})
			DB.accounts.findOne(q ,function(err, result) {
				if (result) {
					e.push({name:"email",m:__("Email already used from another account")});
					callback(e, o);
				} else {
					var q = (o.id ? {_id:{$ne: new ObjectID(o.id)},user:o.user} : {user:o.user})
					DB.accounts.findOne(q, function(err, result) {
						if (result){
							e.push({name:"email",m:__("Username already in use")});
						}
						callback(e, o);
					});
				}
			});
		}
	}

	function formatMoney(result) {
		result.subtotal=accounting.formatMoney(result.subtotal);
		result.vat_amount=accounting.formatMoney(result.vat_amount);
		result.shipping_costs=accounting.formatMoney(result.shipping_costs);
		result.total=accounting.formatMoney(result.total);
		for(var i=0;i<result.items.length;i++){
			result.items[i].price=accounting.formatMoney(result.items[i].price);
			result.items[i].amount=accounting.formatMoney(result.items[i].amount);
		}
		return result;
	}	

	function validateFormClient(o,callback) {
		var e = [];
		if (!Validators.validateStringLength(o.name, 3, 50)){
			e.push({name:"name",m:__("Please enter a valid Client")});
		}
		if (!Validators.validateStringLength(o.address.street, 3, 100)){
			e.push({name:"address[street]",m:__("Please enter a valid Street")});
		}
		if (!Validators.validateStringLength(o.address.zipcode, 3, 20)){
			e.push({name:"address[zipcode]",m:__("Please enter a valid ZIP code")});
		}
		if (!Validators.validateStringLength(o.address.city, 3, 50)){
			e.push({name:"address[city]",m:__("Please enter a valid City")});
		}
		if (!Validators.validateStringLength(o.address.country, 3, 50)){
			e.push({name:"address[country]", m:__("Please enter a valid Country")});
		}
		e = e.concat(Validators.checkVAT(o.vat_number));
		if (o.address.country == "Italy"){
			e = e.concat(Validators.checkCF(o.fiscal_code));
		}
		if (e){
			callback(e, o);
		} else {
			var q = (o.id ? {_id:{$ne: new ObjectID(o.id)},vat_number:o.vat_number} : {vat_number:o.vat_number})
			DB.accounts.findOne(q ,function(err, result) {
				if (result) {
					e.push({name:"vat_number",m:__("VAT number already in use")});
					callback(e, o);
				} else {
					if (o.address.country == "Italy"){
						var q = (o.id ? {_id:{$ne: new ObjectID(o.id)},fiscal_code:o.fiscal_code} : {fiscal_code:o.fiscal_code})
						DB.accounts.findOne({user:o.user}, function(err, result) {
							if (result){
								e.push({name:"fiscal_code",m:__("Fiscal code already in use")});
							}
							callback(e, o);
						});
					} else {
						callback(e, o);
					}
				}
			});
		}
	}
			
// Api //
	
	app.get('/api/clients',function(req, res) {
		if (req.session.user == null) {
	        res.redirect('/?from='+req.url);
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
	        res.redirect('/?from='+req.url);
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
	        res.redirect('/?from='+req.url);
	    } else {
			query = {"items.description":{$regex: req.query.term, $options: 'i' }};
			console.dir(query);
			DB.invoices.distinct("items.description", query, function(e, result) {
				console.dir(result);
				res.send(result);
			});
		}
	});
	
	app.get('*', function(req, res) { res.render('404', { title: __("Page Not Found")}); });

};