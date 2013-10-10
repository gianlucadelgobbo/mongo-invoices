
var bcrypt = require('bcrypt')
var Db = require('mongodb').Db;
var Server = require('mongodb').Server;

var dbPort = 27017;
var dbHost = global.host;
var dbName = _config.dbName;

// use moment.js for pretty date-stamping //
var moment = require('moment');

var accounting = require('accounting');
accounting.settings = _config.accountingSettings;

var ObjectID = require('mongodb').ObjectID;

var DB = {};
	DB.db = new Db(dbName, new Server(dbHost, dbPort, {auto_reconnect: true}, {}));
	DB.db.open(function(e, d){
		if (e) {
			console.log(e);
		} else {
			console.log('connected to database :: ' + dbName);
		}
	});
	DB.accounts = DB.db.collection('accounts');
	DB.clients = DB.db.collection('clients');
	DB.invoices = DB.db.collection('invoices');
	DB.offers = DB.db.collection('offers');

module.exports = DB;

// Accont insertion, update & deletion methods //

DB.insert_account = function(newData, callback) {
	delete newData.id;
	DB.saltAndHash(newData.pass, function(hash){
		newData.pass = hash;
	// append date stamp when record was created //
		newData.date = moment().format('MMMM Do YYYY, h:mm:ss a');
		DB.accounts.insert(newData, {safe: true}, function(err, records){
			callback(err, records);
		});
	});
}
DB.update_account = function(newData, callback) {
	DB.accounts.findOne({_id: new ObjectID(newData.id)}, function(e, o){
		o.name 		= newData.name;
		o.role 		= newData.role;
		o.email 	= newData.email;
		o.country 	= newData.country;
		if (newData.pass == ''){
			DB.accounts.save(o);
			callback(o);
		} else{
			DB.saltAndHash(newData.pass, function(hash){
				o.pass = hash;
				DB.accounts.save(o);
				callback(o);
			});
		}
	});
}
DB.delete_account = function(id, callback) {
	DB.accounts.remove({_id: new ObjectID(id)}, {safe: true}, function(err, records){
		callback(err, records);
	});
}

DB.setPassword = function(email, newPass, callback) {
	DB.accounts.findOne({email:email}, function(e, o){
		DB.saltAndHash(newPass, function(hash){
			o.pass = hash;
			DB.accounts.save(o); callback(o);
		});
	});
}

DB.validateLink = function(email, passHash, callback) {
	DB.accounts.find({ $and: [{email:email, pass:passHash}] }, function(e, o){
		callback(o ? 'ok' : null);
	});
}

DB.saltAndHash = function(pass, callback) {
	bcrypt.genSalt(10, function(err, salt) {
		bcrypt.hash(pass, salt, function(err, hash) {
			callback(hash);
		});
	});
}


/*
// just for testing - these are not actually being used //

DB.findById = function(id, callback) {
	DB.accounts.findOne({_id: new ObjectID(id)},
		function(e, res) {
		if (e) callback(e)
		else callback(null, res)
	});
}


DB.findByMultipleFields = function(a, callback) {
// this takes an array of name/val pairs to search against {fieldName : 'value'} //
	DB.accounts.find( { $or : a } ).toArray(
		function(e, results) {
		if (e) callback(e)
		else callback(null, results)
	});
}

DB.getEmail = function(email, callback) {
	DB.accounts.findOne({email:email}, function(e, o){ callback(o); });
}

DB.getObjectId = function(id) {
	return DB.accounts.db.bson_serializer.ObjectID.createFromHexString(id)
}
DB.getAllRecords = function(callback) {
	DB.accounts.find().toArray(
		function(e, res) {
		if (e) callback(e)
		else callback(null, res)
	});
}

DB.delAllRecords = function(id, callback) {
	DB.accounts.remove(); // reset accounts collection for testing //
}
*/

DB.insert_invoice = function(newData, userData, callback) {
	delete newData.id;
	var d = newData.invoice_date.split("/");
	newData.invoice_date = new Date(parseInt(d[2], 10),parseInt(d[1], 10)-1,parseInt(d[0], 10));
	if(newData.delivery_date!=""){
		d = newData.delivery_date.split("/");
		newData.delivery_date = new Date(parseInt(d[2], 10),parseInt(d[1], 10)-1,parseInt(d[0], 10));
	}
	if(newData.offer.offer_date!=""){
		d = newData.offer.offer_date.split("/");
		newData.offer.offer_date = new Date(parseInt(d[2], 10),parseInt(d[1], 10)-1,parseInt(d[0], 10));
	}
	newData.invoice_number = parseInt(newData.invoice_number);
	newData.vat_perc = parseInt(newData.vat_perc);
	unformatPrices(newData);
	//revisions
	newData.revisions = [];
	newData.revisions.push({userID : userData._id,username: userData.name,time : new Date()});
	DB.invoices.insert(newData, {safe: true}, function(err, records){
		callback(err, records);
	});
}
DB.update_invoice = function(newData, userData, callback) {
	//console.log(newData.invoice_date);
	DB.invoices.findOne({_id:new ObjectID(newData.id)}, function(e, o){
		newData._id = o._id;
		var d = newData.invoice_date.split("/");
		newData.invoice_date = new Date(parseInt(d[2], 10),parseInt(d[1], 10)-1,parseInt(d[0], 10));
		//console.log((d[2])+"-"+((d[1]))+"-"+(d[0]));
		//console.log(parseInt(d[2], 10)+"-"+(parseInt(d[1], 10))+"-"+parseInt(d[0], 10));
		if(newData.delivery_date!=""){
			d = newData.delivery_date.split("/");
			newData.delivery_date = new Date(parseInt(d[2], 10),parseInt(d[1], 10)-1,parseInt(d[0], 10));
		}
		if(newData.offer.offer_date!=""){
			d = newData.offer.offer_date.split("/");
			newData.offer.offer_date = new Date(parseInt(d[2], 10),parseInt(d[1], 10)-1,parseInt(d[0], 10));
		}
		newData.invoice_number=parseInt(newData.invoice_number);
		newData.vat_perc=parseInt(newData.vat_perc);
		unformatPrices(newData);
		if (!newData.revisions)	newData.revisions = [];
		newData.revisions.push({userID : userData._id,username: userData.name,time : new Date()});
		delete newData.id;
		//console.log(newData.invoice_date);
		DB.invoices.save(newData);
		DB.invoices.findOne({_id:newData._id}, function(e, o){
			callback(e, o);
		});
	});
}
DB.delete_invoice = function(id, callback) {
	DB.invoices.remove({_id: new ObjectID(id)},{safe: true}, function(err, records){
		callback(err, records);
	});
}

DB.insert_offer = function(newData, userData, callback) {
	delete newData.id;
	var d = newData.offer_date.split("/");
	newData.offer_date = new Date(parseInt(d[2], 10),parseInt(d[1], 10)-1,parseInt(d[0], 10));
	if(newData.delivery_date!=""){
		d = newData.delivery_date.split("/");
		newData.delivery_date = new Date(parseInt(d[2], 10),parseInt(d[1], 10)-1,parseInt(d[0], 10));
	}
	newData.offer_number = parseInt(newData.offer_number);
	newData.vat_perc = parseInt(newData.vat_perc);
	unformatPrices(newData);
	//revisions
	newData.revisions = [];
	newData.revisions.push({userID : userData._id,username: userData.name,time : new Date()});
	DB.offers.insert(newData, {safe: true}, function(err, records){
		//console.log(records);
		callback(err, records);
	});
}
DB.update_offer = function(newData, userData, callback) {
	DB.offers.findOne({_id:new ObjectID(newData.id)}, function(e, o){
		newData._id = o._id;
		var d = newData.offer_date.split("/");
		newData.offer_date = new Date(parseInt(d[2], 10),parseInt(d[1], 10)-1,parseInt(d[0], 10));
		d = newData.delivery_date.split("/");
		newData.delivery_date = new Date(parseInt(d[2], 10),parseInt(d[1], 10)-1,parseInt(d[0], 10));
		newData.offer_number=parseInt(newData.offer_number);
		newData.vat_perc=parseInt(newData.vat_perc);
		unformatPrices(newData);
		if (!newData.revisions)	newData.revisions = [];
		newData.revisions.push({userID : userData._id,username: userData.name,time : new Date()});
		delete newData.id;
		DB.offers.save(newData);
		DB.offers.findOne({_id:newData._id}, function(e, o){
			callback(e, o);
		});
	});
}
DB.delete_offer = function(id, callback) {
	DB.offers.remove({_id: new ObjectID(id)},{safe: true}, function(err, records){
		callback(err, records);
	});
}

DB.insert_client = function(newData, callback) {
	delete newData.id;
	DB.clients.insert(newData, {safe: true}, function(err, records){
		callback(err, records);
	});
}
DB.update_client = function(newData, callback) {
	DB.clients.findOne({_id:new ObjectID(newData.id)}, function(e, o){
		newData._id = o._id;
		delete newData.id;
		DB.clients.save(newData);
		callback(newData);
	});
}
DB.delete_client = function(id, callback) {
	DB.clients.remove({_id: new ObjectID(id)},{safe: true}, function(err, records){
		callback(err, records);
	});
}


function unformatPrices(newInvoice){
	newInvoice.subtotal=parseFloat(accounting.unformat(newInvoice.subtotal, ","));
	newInvoice.vat_amount=parseFloat(accounting.unformat(newInvoice.vat_amount, ","));
	newInvoice.shipping_costs=parseFloat(accounting.unformat(newInvoice.shipping_costs, ","));
	newInvoice.total=parseFloat(accounting.unformat(newInvoice.total, ","));
	for (item in newInvoice.items) {
		newInvoice.items[item].price=parseFloat(accounting.unformat(newInvoice.items[item].price, ","));
		newInvoice.items[item].amount=parseFloat(accounting.unformat(newInvoice.items[item].amount, ","));
	}
	if (newInvoice.items) {
	}
}