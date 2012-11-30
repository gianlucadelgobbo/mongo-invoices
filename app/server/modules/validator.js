var DB = require('./db-manager');

var Validator = {};
module.exports = Validator;

//Invoice checks

//Check Client ID
Validator.checkClientID = function(clientID){
	if(!clientID){
		return false;
	} else {
		return true;
	}
}
//Check Invoice Date
Validator.checkInvoiceDate = function(invoiceNumber,invoiceDate){
	var d = invoiceDate.split("/");
	var date=new Date(parseInt(d[2]),parseInt(d[1])-1,parseInt(d[0]));
	if(!invoiceNumber||!invoiceDate){
		if (!req.body.invoice_number) console.log("no invoice number");
		if (!req.body.invoice_date) console.log("no invoice date");
		return false;
	} else {
		if (!is_date(date/*invoiceDate*/)){
			console.log("date is not date");
			return false;
		} else {
			//var d = invoiceDate.split("/");
			var q = {invoice_date:{$gt: date/*new Date(parseInt(d[2]),parseInt(d[1])-1,parseInt(d[0]))*/},invoice_number:(invoiceNumber-1).toString() };
			console.dir(q);
			DB.invoices.find(q).toArray(function(e, result) {
				if(result.length){
					console.log("Data must be greater than ");
					return false;
				} else {
					return true;
				}
			});
		}
	}
}

//generic functions

function is_date(aaaa,mm,gg){
	var res=true;
	mmNew = parseFloat(mm)-1;
	mm = (mmNew.toString().length==1 ? "0"+mmNew : mmNew);
	var dteDate=new Date(aaaa,mm,gg);
	if (!((gg==dteDate.getDate()) && (mm==dteDate.getMonth()) && (aaaa==dteDate.getFullYear())))
		res=false;
	return res;
}