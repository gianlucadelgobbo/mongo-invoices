var DB = require('./db-manager');

var Validator = {};
module.exports = Validator;

//Invoice checks

//Check Client ID
Validator.checkClientID = function(clientID){
	var errors = [];
	if(!clientID){
		console.log("No client ID");
		errors.push("No client ID");
	}
	return errors;
}
//Check Invoice Date
Validator.checkInvoiceDate = function(invoiceNumber,invoiceDate){
	var d = invoiceDate.split("/");
	var errors = [];
	if(!invoiceNumber||!invoiceDate){
		if (!req.body.invoice_number) errors.push("No invoice number");
		if (!req.body.invoice_date) errors.push("No invoice date");
		return errors;
	} else {
		if (!is_date(d[2],d[1],d[0])){
			console.log("Invoice date is not date");
			errors.push("Invoice date is not date");
		}
		return errors;
	}
}
//Check Delivery Date
Validator.checkDeliveryDate = function(deliveryDate){
	var errors = [];
	if(deliveryDate!=""){
		var d = deliveryDate.split("/");
		if (!is_date(d[2],d[1],d[0])){
			console.log("Delivery date is not date");
			errors.push("Delivery date is not date");
		}
	}
	return errors;
}

//generic functions

function is_date(aaaa,mm,gg){
	var res = true;
	mmNew = parseFloat(mm)-1;
	mm = (mmNew.toString().length==1 ? "0"+mmNew : mmNew);
	var dteDate=new Date(aaaa,mm,gg);
	if (!((gg==dteDate.getDate()) && (mm==dteDate.getMonth()) && (aaaa==dteDate.getFullYear())))
		res = false;
	return res;
}