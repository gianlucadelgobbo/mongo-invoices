var ObjectID = require('mongodb').ObjectID;
var DB = require('./../helpers/db-manager');
var helpers = require('./../helpers/helpers');

exports.get = function get(req, res) {
	helpers.canIseeThis(req, function (auth) {
		if (auth) {
			var msg = {};
			if (req.query.id && req.query.del) {
				DB.delete_offer(req.query.id, function(err, obj){
					if (obj){
						msg.c = [];
						msg.c.push({name:"",m:__("Offer deleted successfully")});
					} else {
						msg.e = [];
						msg.e.push({name:"",m:__("Offer not found")});
					}
				});
			}
			var query = req.query.customer ? {"to_client._id":req.query.customer} : {};
			if (!req.query.year) req.query.year = new Date().getFullYear();
			if (req.query.year && req.query.year!="ALL Years") {
				year = parseInt(req.query.year);
				var start = new Date(year-1, 11, 31);
				var end = new Date(year+1, 0, 1);
				query.offer_date = {$gte: start, $lt: end}
			} else {
				year = req.query.year;
			}

			DB.offers.find().toArray(function(e, result) {
				var years = [new Date().getFullYear()];
				for (var a=0;a<result.length;a++) {
					var y = new Date(result[a].offer_date).getFullYear();
					if (years.indexOf(y) == -1) years.push(y);
				}
				years.sort();
				if (req.query.customer){
					DB.customers.findOne({_id:new ObjectID(req.query.customer)}, function(e, customer) {
						DB.offers.find(query).sort({offer_date:-1,offer_number:-1}).toArray(function(e, result) {
							res.render('offers', { title: __("Offers"), result : helpers.formatMoneyList(result), msg:msg, udata : req.session.user,years:years,year:year,customer:{id:req.query.customer,name:customer.name }});
						});
					});
				} else {
					DB.offers.find(query).sort({offer_date:-1,offer_number:-1}).toArray(function(e, result) {
						res.render('offers', { title: __("offers"), result : helpers.formatMoneyList(result), msg:msg, udata : req.session.user,years:years,year:year });
					});
				}
			});
		} else {
			res.redirect('/?from='+req.url);
		}
	});
};