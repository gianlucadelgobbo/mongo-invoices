var ObjectID = require('mongodb').ObjectID;
var DB = require('../modules/db-manager');
var Validators = require('../../common/validators').Validators;
var helpers = require('./helpers');

exports.get = function get(req, res) {
	if (req.session.user == null) {
		res.redirect('/?from='+req.url);
	} else {
		if (req.query.id) {
			DB.offers.findOne({_id:new ObjectID(req.query.id)},function(e, result) {
				result = helpers.formatMoney(result);
				res.render('offer', {	locals: {	title: __("Offer"), result : result, udata : req.session.user } });
			});
		} else {
			DB.offers.find({},{offer_date:1,offer_number:1}).sort({offer_number:1}).toArray(function(e, result) {
				var resultEmpty = {offer_date:new Date(),offer_number:result.length+1,to_client:{address:{}},offer:{},items:[{}]};
				res.render('offer', {	locals: {	title: __("Offer"), result : resultEmpty, udata : req.session.user } });
			});
		}
	}
};

exports.post = function post(req, res) {
	if (req.session.user == null) {
			res.redirect('/?from='+req.url);
	} else {
		//console.dir(req.body);
		//controls
		var errors = [];
		errors = errors.concat(Validators.checkClientID(req.body.to_client._id));
		errors = errors.concat(Validators.checkOfferNumber(req.body.offer_number));
		errors = errors.concat(Validators.checkOfferDate(req.body.offer_date));
		var d = req.body.offer_date.split("/");
		if(errors.length === 0){
			DB.clients.findOne({_id:new ObjectID(req.body.to_client._id)},function(e, result) {
				if (result) {
					var d = req.body.offer_date.split("/");
					var date=new Date(parseInt(d[2], 10),parseInt(d[1], 10)-1,parseInt(d[0], 10));
					var q = {offer_date:{$gt: date},offer_number:(req.body.offer_number-1).toString() };
					DB.offers.find(q).toArray(function(e, result) {
						if(errors.length === 0){
							var myid = req.body.id;
							if (req.body.id) {
								DB.update_offer(req.body, req.session.user, function(e, o){
									errors.push({name:"",m:__("Offer saved with success")});
									res.render('offer', {	locals: {	title: __("Offer"), result : helpers.formatMoney(o), msg:{c:errors}, udata : req.session.user } });
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
									res.render('offer', {	locals: {	title: __("Offer"), result : helpers.formatMoney(o[0]), msg:msg, udata : req.session.user } });
								});
							}
						} else {
							if (req.body.id) req.body._id = req.body.id;
							errors.push({name:"offer_date",m:__("Data must be greater than")+": "+result.offer_date});
							var d = req.body.offer_date.split("/");
							req.body.offer_date = new Date(parseInt(d[2], 10),parseInt(d[1], 10)-1,parseInt(d[0], 10));
							if (req.body.delivery_date) {
								d = req.body.delivery_date.split("/");
								req.body.delivery_date = new Date(parseInt(d[2], 10),parseInt(d[1], 10)-1,parseInt(d[0], 10));
							}
							if (req.body.offer.offer_date) {
								d = req.body.offer.offer_date.split("/");
								req.body.offer.offer_date = new Date(parseInt(d[2], 10),parseInt(d[1], 10)-1,parseInt(d[0], 10));
							}
							req.body.to_client.address={};
							res.render('offer', {	locals: {	title: __("Offer"), result : req.body, msg:{e:errors}, udata : req.session.user } });
						}
					});
				} else {
					if (req.body.id) req.body._id = req.body.id;
					errors.push({name:"to_client[name]",m:__("You have to insert a valid client")});
					var d = req.body.offer_date.split("/");
					req.body.offer_date = new Date(parseInt(d[2], 10),parseInt(d[1], 10)-1,parseInt(d[0], 10));
					if (req.body.delivery_date) {
						d = req.body.delivery_date.split("/");
						req.body.delivery_date = new Date(parseInt(d[2], 10),parseInt(d[1], 10)-1,parseInt(d[0], 10));
					}
					if (req.body.offer.offer_date) {
						d = req.body.offer.offer_date.split("/");
						req.body.offer.offer_date = new Date(parseInt(d[2], 10),parseInt(d[1], 10)-1,parseInt(d[0], 10));
					}
					req.body.to_client.address={};
					res.render('offer', {	locals: {	title: __("Offer"), result : req.body, msg:{e:errors}, udata : req.session.user } });
				}
			});
		} else {
			if (req.body.id) req.body._id = req.body.id;
			errors.push({name:"to_client[name]",m:__("You have to insert a valid client")});
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
			res.render('offer', {	locals: {	title: __("Offer"), result : req.body, msg:{e:errors}, udata : req.session.user } });
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
				res.render('print_offer', { layout: 'print.jade' ,	locals: {	title: __("Offer"), result : result, udata : req.session.user } });
			});
		} else {
			res.redirect('/offers');
		}
	}
};
