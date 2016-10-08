var ObjectID = require('mongodb').ObjectID;
var DB = require('./../helpers/db-manager');
var Validators = require('../../common/validators').Validators;
var helpers = require('./../helpers/helpers');
var fs = require("fs");

exports.get = function get(req, res) {
	helpers.canIseeThis(req, function (auth) {
		if (auth) {
			if (req.query.id) {
				DB.offers.findOne({_id:new ObjectID(req.query.id)},function(e, result) {
					result = helpers.formatMoney(result);
					res.render('offer', {	title: __("Offer"), country:global._config.company.country, result : result, udata : req.session.user });
				});
			} else {
				var dd = new Date();
				var start = new Date(dd.getFullYear()+"-01-01");
				var end = new Date(dd.getFullYear()+"-12-31");

				DB.offers.find({offer_date:{$gte: start, $lt: end}},{offer_date:1,offer_number:1}).sort({offer_number:1}).toArray(function(e, resultOffer) {
					if (req.query.dup) {
						DB.offers.findOne({_id:new ObjectID(req.query.dup)},function(e, result) {
							result = helpers.formatMoney(result);
							result.offer_date = new Date();
							result.offer_number = resultOffer.length+1;
							delete result._id;
							res.render('offer', {	title: __("Offer"), country:global._config.company.country, result : result, udata : req.session.user });
						});
					} else {
						var resultEmpty = {offer_date:new Date(),offer_number:resultOffer.length+1,vat_perc:_config.vat_perc,to_client:{address:{}},offer:{},items:[{}]};
						res.render('offer', {	title: __("Offer"), country:global._config.company.country, result : resultEmpty, udata : req.session.user });
					}
				});
			}
		} else {
			res.redirect('/?from='+req.url);
		}
	});
};

exports.post = function post(req, res) {
	if (req.session.user == null) {
			res.redirect('/?from='+req.url);
	} else {
		//console.dir(req.body);
		//controls
		var errors = [];
		errors = errors.concat(Validators.checkCustomerID(req.body.to_client._id));
		errors = errors.concat(Validators.checkOfferNumber(req.body.offer_number));
		errors = errors.concat(Validators.checkOfferDate(req.body.offer_date));
		var d = req.body.offer_date.split("/");
		if(errors.length === 0){
			DB.customers.findOne({_id:new ObjectID(req.body.to_client._id)},function(e, result) {
				if (result) {
					d = req.body.offer_date.split("/");
					var date=new Date(parseInt(d[2], 10),parseInt(d[1], 10)-1,parseInt(d[0], 10));
					var q = {offer_date:{$gt: date},offer_number:(req.body.offer_number-1).toString() };
					DB.offers.find(q).toArray(function(e, result) {
						if(errors.length === 0){
							//var myid = req.body.id;
							if (req.body.id) {
								DB.update_offer(req.body, req.session.user, function(e, o){
									errors.push({name:"",m:__("Offer saved with success")});
									res.render('offer', {	title: __("Offer"), country:global._config.company.country, result : helpers.formatMoney(o), msg:{c:errors}, udata : req.session.user });
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
									res.redirect('/'+global.settings.dbName+'/offer/?id='+o[0]._id);
									//res.render('offer', {	title: __("Offer"), result : helpers.formatMoney(o[0]), msg:msg, udata : req.session.user });
								});
							}
						} else {
							if (req.body.id) req.body._id = req.body.id;
							errors.push({name:"offer_date",m:__("Data must be greater than")+": "+result.offer_date});
							d = req.body.offer_date.split("/");
							req.body.offer_date = new Date(parseInt(d[2], 10),parseInt(d[1], 10)-1,parseInt(d[0], 10));
							if (req.body.delivery_date) {
								d = req.body.delivery_date.split("/");
								req.body.delivery_date = new Date(parseInt(d[2], 10),parseInt(d[1], 10)-1,parseInt(d[0], 10));
							}
							if (req.body.offer_date) {
								d = req.body.offer_date.split("/");
								req.body.offer_date = new Date(parseInt(d[2], 10),parseInt(d[1], 10)-1,parseInt(d[0], 10));
							}
							req.body.to_client.address={};
							res.render('offer', {	title: __("Offer"), country:global._config.company.country, result : req.body, msg:{e:errors}, udata : req.session.user });
						}
					});
				} else {
					if (req.body.id) req.body._id = req.body.id;
					errors.push({name:"to_client[name]",m:__("You have to insert a valid customer")});
					d = req.body.offer_date.split("/");
					req.body.offer_date = new Date(parseInt(d[2], 10),parseInt(d[1], 10)-1,parseInt(d[0], 10));
					if (req.body.delivery_date) {
						d = req.body.delivery_date.split("/");
						req.body.delivery_date = new Date(parseInt(d[2], 10),parseInt(d[1], 10)-1,parseInt(d[0], 10));
					}
					if (req.body.offer_date) {
						d = req.body.offer_date.split("/");
						req.body.offer_date = new Date(parseInt(d[2], 10),parseInt(d[1], 10)-1,parseInt(d[0], 10));
					}
					req.body.to_client.address={};
					res.render('offer', {	title: __("Offer"), country:global._config.company.country, result : req.body, msg:{e:errors}, udata : req.session.user });
				}
			});
		} else {
			if (req.body.id) req.body._id = req.body.id;
			errors.push({name:"to_client[name]",m:__("You have to insert a valid customer")});
			d = req.body.offer_date.split("/");
			req.body.offer_date = new Date(parseInt(d[2], 10),parseInt(d[1], 10)-1,parseInt(d[0], 10));
			if (req.body.delivery_date) {
				d = req.body.delivery_date.split("/");
				req.body.delivery_date = new Date(parseInt(d[2], 10),parseInt(d[1], 10)-1,parseInt(d[0], 10));
			}
			if (typeof req.body.invoice!== "undefined" && req.body.invoice.invoice_date) {
				d = req.body.invoice.invoice_date.split("/");
				req.body.invoice.invoice_date = new Date(parseInt(d[2], 10),parseInt(d[1], 10)-1,parseInt(d[0], 10));
			}
			req.body.to_client.address={};
			res.render('offer', {	title: __("Offer"), country:global._config.company.country, result : req.body, msg:{e:errors}, udata : req.session.user });
		}
	}
};

exports.print = function print(req, res) {
	if (req.session.user == null) {
		res.redirect('/?from='+req.url);
	} else {
		if (req.query.id) {
			DB.offers.findOne({_id:new ObjectID(req.query.id)}, function(e, result) {
				result = helpers.formatMoney(result);
				var folder = '/accounts/'+global.settings.dbName+'/offers/'+result.offer_date.getFullYear()+'/';
				var filename = result.offer_date.getFullYear()+'-'+(result.offer_date.getMonth()+1)+'-'+result.offer_date.getDate()+'_'+result.offer_number+'_'+global.settings.companyName+'_'+result.to_client.name+'.pdf';
				fs.writeFile('./warehouse/'+global.settings.dbName+"/style_print.pug", "", { flag: 'wx' }, function (err) {
					res.render('../../../warehouse/accounts/'+global.settings.dbName+"/style_print", {layout: false}, function (error_style, style) {
						res.render('offer_preview', {	title: __("Offer"), country:global._config.company.country, result : result, udata : req.session.user, file:folder+filename, style:style, js:false }, function (error1, html1) {
							// PDF START
							var pdf = require('html-pdf');
							var options = { format: 'A4',"header": {"height": "75mm"},"footer": {"height": "30mm"}};
							res.render('offer_pdf', { layout: 'layout_pdf.pug' ,	locals: {	title: __("Offer"), country:global._config.company.country, result : result, udata : req.session.user, style:style } }, function (error, html) {
								if (!error) {
									pdf.create(html, options).toFile('./warehouse'+folder+filename, function(pdferr, pdfres) {
										res.send(html1);
										//if (pdferr) return console.log(pdferr);
										//console.log(pdfres); // { filename: '/app/businesscard.pdf' }
									});
								}
							});
							// PDF END
						});
					});
				});
			});
		} else {
			res.redirect('/offers');
		}
	}
};
