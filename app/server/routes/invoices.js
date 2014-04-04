var DB = require('../modules/db-manager');
var helpers = require('./helpers');

exports.get = function get(req, res) {
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
		var year = parseInt(req.query.year ? req.query.year : new Date().getFullYear());
		var query = req.query.client ? {"to_client._id":req.query.client} : {};
		var start = new Date(year-1, 11, 31);
		var end = new Date(year+1, 0, 1);
		query.invoice_date = {$gte: start, $lt: end}
		DB.invoices.find().toArray(function(e, result) {
			var years = [new Date().getFullYear()]
			for (var a=0;a<result.length;a++) {
				var y = new Date(result[a].invoice_date).getFullYear();
				if (years.indexOf(y) == -1) years.push(y);
			}
			years.sort()
			console.log(query)
			DB.invoices.find(query).sort({invoice_date:-1,invoice_number:-1}).toArray(function(e, result) {
				res.render('invoices', {	locals: { title: __("Invoices"), result : helpers.formatMoney(result), msg:msg, udata : req.session.user,years:years,year:year } });
			});
		});
	}
};
