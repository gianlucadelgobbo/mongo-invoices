var DB = require('./../helpers/db-manager');
var helpers = require('./../helpers/helpers');

exports.get = function get(req, res) {
	if (req.session.user == null) {
		res.redirect('/?from='+req.url);
	} else {
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
		var year = parseInt(req.query.year ? req.query.year : new Date().getFullYear());
		var query = req.query.client ? {"to_client._id":req.query.client} : {};
		var start = new Date(year-1, 11, 31);
		var end = new Date(year+1, 0, 1);
		query.offer_date = {$gte: start, $lt: end};
		DB.offers.find().toArray(function(e, result) {
			var years = [new Date().getFullYear()];
			for (var a=0;a<result.length;a++) {
				var y = new Date(result[a].offer_date).getFullYear();
				if (years.indexOf(y) == -1) years.push(y);
			}
			years.sort();
			DB.offers.find(query).sort({offer_number:-1}).toArray(function(e, result) {
				res.render('offers', {	locals: {	title: __("Offers"), result : helpers.formatMoney(result), msg:msg, udata : req.session.user,years:years,year:year } });
			});
		});
	}
};
