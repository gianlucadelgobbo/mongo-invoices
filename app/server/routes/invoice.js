var DB = require('./../helpers/db-manager');
var Validators = require('../../common/validators').Validators;
var helpers = require('./../helpers/helpers');
var ObjectID = require('mongodb').ObjectID;
var fs = require("fs");

exports.get = function get(req, res) {
	helpers.canIseeThis(req, function (auth) {
		if (auth) {
			if (req.query.id) {
				DB.invoices.findOne({_id:new ObjectID(req.query.id)},function(e, result) {
					result = helpers.formatMoney(result);
					res.render('invoice', {	locals: { title: __("Invoice"), country:global._config.company.country, result : result, udata : req.session.user } });
				});
			} else {
				var dd = new Date();
				var start = new Date(dd.getFullYear()+"-01-01");
				var end = new Date(dd.getFullYear()+"-12-31");

				DB.invoices.find({invoice_date:{$gte: start, $lt: end}},{invoice_date:1,invoice_number:1}).sort({invoice_number:1}).toArray(function(e, resultInvoice) {
					if (req.query.offer) {
						DB.offers.findOne({_id:new ObjectID(req.query.offer)},function(e, result) {
							result = helpers.formatMoney(result);
							result.invoice_date = new Date();
							result.invoice_number = resultInvoice.length+1;
							result.offer = {offer_number:result.offer_number,offer_date:result.offer_date};
							delete result._id;
							res.render('invoice', {	locals: {	title: __("Invoice"), country:global._config.company.country, result : result, udata : req.session.user } });
						});
					} else if (req.query.dup) {
						DB.invoices.findOne({_id:new ObjectID(req.query.dup)},function(e, result) {
							result = helpers.formatMoney(result);
							result.invoice_date = new Date();
							result.invoice_number = resultInvoice.length+1;
							delete result._id;
							res.render('invoice', {	locals: {	title: __("Invoice"), country:global._config.company.country, result : result, udata : req.session.user } });
						});
					} else {
						var resultEmpty = {invoice_date:new Date(),invoice_number:resultInvoice.length+1,vat_perc:_config.vat_perc,to_client:{address:{}},offer:{},items:[{}]};
						res.render('invoice', {	locals: {	title: __("Invoice"), country:global._config.company.country, result : resultEmpty, udata : req.session.user } });
					}
				});
			}
		} else {
			res.redirect('/?from='+req.url);
		}
	});
	if (req.session.user == null) {
		res.redirect('/?from='+req.url);
	} else {

	}
}
exports.post = function post(req, res) {
	helpers.canIseeThis(req, function (auth) {
		if (auth) {
			//controls
			var errors = [];
			errors = errors.concat(Validators.checkCustomerID(req.body.to_client._id));
			errors = errors.concat(Validators.checkInvoiceNumber(req.body.invoice_number));
			errors = errors.concat(Validators.checkInvoiceDate(req.body.invoice_date));
			errors = errors.concat(Validators.checkDeliveryDate(req.body.delivery_date));
			var d = req.body.invoice_date.split("/");
			if (errors.length === 0){
				DB.customers.findOne({_id:new ObjectID(req.body.to_client._id)},function(e, result) {
					var d;
					if (result) {
						d = req.body.invoice_date.split("/");
						var date = new Date(parseInt(d[2], 10),parseInt(d[1], 10)-1,parseInt(d[0], 10));
						var q = {invoice_date:{$gt: date},invoice_number:(req.body.invoice_number-1).toString() };
						DB.invoices.find(q).toArray(function(e, result) {
							if(errors.length === 0){
								if (req.body.id) {
									DB.update_invoice(req.body, req.session.user, function(e, o){
										errors.push({name:"",m:__("Invoice saved with success")});
										res.render('invoice', {	locals: {	title: __("Invoice"), country:global._config.company.country, result : helpers.formatMoney(o), msg:{c:errors}, udata : req.session.user } });
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
										res.redirect('/'+global.settings.dbName+'/invoice/?id='+o[0]._id);
//									res.render('invoice', {	locals: {	title: __("Invoice"), country:global._config.company.country, result : helpers.formatMoney(o[0]), msg:msg, udata : req.session.user } });
									});
								}
							} else {
								if (req.body.id) req.body._id = req.body.id;
								errors.push({name:"invoice_date",m:__("Data must be greater than")+": "+result.invoice_date});
								var d = req.body.offer_date.split("/");
								req.body.invoice_date = new Date(parseInt(d[2], 10),parseInt(d[1], 10)-1,parseInt(d[0], 10));
								if (req.body.delivery_date) {
									d = req.body.delivery_date.split("/");
									req.body.delivery_date = new Date(parseInt(d[2], 10),parseInt(d[1], 10)-1,parseInt(d[0], 10));
								}
								if (req.body.offer.offer_date) {
									d = req.body.offer.offer_date.split("/");
									req.body.offer.offer_date = new Date(parseInt(d[2], 10),parseInt(d[1], 10)-1,parseInt(d[0], 10));
								}
								req.body.to_client.address={};
								res.render('invoice', {	locals: {	title: __("Invoice"), country:global._config.company.country, result : req.body, msg:{e:errors}, udata : req.session.user } });
							}
						});
					} else {
						if (req.body.id) req.body._id = req.body.id;
						errors.push({name:"to_client[name]",m:__("You have to insert a valid customer")});
						d = req.body.offer_date.split("/");
						req.body.invoice_date = new Date(parseInt(d[2], 10),parseInt(d[1], 10)-1,parseInt(d[0], 10));
						if (req.body.delivery_date) {
							d = req.body.delivery_date.split("/");
							req.body.delivery_date = new Date(parseInt(d[2], 10),parseInt(d[1], 10)-1,parseInt(d[0], 10));
						}
						if (req.body.offer.offer_date) {
							d = req.body.offer.offer_date.split("/");
							req.body.offer.offer_date = new Date(parseInt(d[2], 10),parseInt(d[1], 10)-1,parseInt(d[0], 10));
						}
						req.body.to_client.address={};
						res.render('invoice', {	locals: {	title: __("Invoice"), country:global._config.company.country, result : req.body, msg:{e:errors}, udata : req.session.user } });
					}
				});
			} else {
				if (req.body.id) req.body._id = req.body.id;
				req.body.invoice_date = new Date(parseInt(d[2], 10),parseInt(d[1], 10)-1,parseInt(d[0], 10));
				if (req.body.delivery_date) {
					d = req.body.delivery_date.split("/");
					req.body.delivery_date = new Date(parseInt(d[2], 10),parseInt(d[1], 10)-1,parseInt(d[0], 10));
				}
				if (req.body.offer.offer_date) {
					d = req.body.offer.offer_date.split("/");
					req.body.offer.offer_date = new Date(parseInt(d[2], 10),parseInt(d[1], 10)-1,parseInt(d[0], 10));
				}
				req.body.to_client.address={};
				res.render('invoice', {	locals: {	title: __("Invoice"), country:global._config.company.country, result : req.body, msg:{e:errors}, udata : req.session.user } });
			}
		} else {
			res.redirect('/?from='+req.url);
		}
	});
};
;

exports.print = function print(req, res) {
	helpers.canIseeThis(req, function (auth) {
		console.log("1");
		if (auth) {
			if (req.query.id) {
				DB.invoices.findOne({_id:new ObjectID(req.query.id)},function(e, result) {
					console.log("2");
					result = helpers.formatMoney(result);
					var folder = '/accounts/'+global.settings.dbName+'/invoices/'+result.invoice_date.getFullYear()+'/';
					var filename = result.invoice_date.getFullYear()+'-'+(result.invoice_date.getMonth()+1)+'-'+result.invoice_date.getDate()+'_'+result.invoice_number+'_'+global.settings.companyName+'_'+result.to_client.name+'.pdf';
					//fs.writeFile('./warehouse/'+global.settings.dbName+"/style_print.jade", "", { flag: 'wx' }, function (err) {
						res.render('../../../warehouse/accounts/'+global.settings.dbName+"/style_print", {layout: false}, function (error_style, style) {
							console.log("3");
							res.render('print_invoice', {locals: {	title: __("Invoice"), country:global._config.company.country, result : result, udata : req.session.user, file:folder+filename, style:style, js:false } }, function (error1, html1) {
								console.log("4");
								res.send(html1);
								// PDF START
								var pdf = require('html-pdf');
								var options = { format: 'A4',"header": {"height": "75mm"},"footer": {"height": "30mm"}};
								res.render('print_invoice_pdf', { layout: 'print_pdf.jade' ,	locals: {	title: __("Invoice"), country:global._config.company.country, result : result, udata : req.session.user, style:style } }, function (error, html) {
									console.log("5");
									console.log(error);
									if (!error) {
										//pdf.create(html, options).toFile('./warehouse'+folder+filename, function(pdferr, pdfres) {
										console.log("6");
										console.log(html1);
										//res.send(html1);
											//if (pdferr) return console.log(pdferr);
											//console.log(pdfres); // { filename: '/app/businesscard.pdf' }
										//});
									}
								});
								// PDF END
							});
						});
					//});
				});
			} else {
				res.redirect('/invoices');
			}
		} else {
			res.redirect('/?from='+req.url);
		}
	});
};
