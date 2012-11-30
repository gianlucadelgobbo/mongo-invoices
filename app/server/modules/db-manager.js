
var bcrypt = require('bcrypt')
var Db = require('mongodb').Db;
var Server = require('mongodb').Server;

var dbPort = 27017;
var dbHost = global.host;
var dbName = 'login-testing';

// use moment.js for pretty date-stamping //
var moment = require('moment');

var ObjectID = require('mongodb').ObjectID;

var DB = {};
	DB.db = new Db(dbName, new Server(dbHost, dbPort, {auto_reconnect: true}, {}));
	DB.db.open(function(e, d){
		if (e) {
			console.log(e);
		}	else{
			console.log('connected to database :: ' + dbName);
		}
	});
	DB.accounts = DB.db.collection('accounts');
	DB.clients = DB.db.collection('clients');
	DB.invoices = DB.db.collection('invoices');

module.exports = DB;

// logging in //

DB.autoLogin = function(user, pass, callback) {
	DB.accounts.findOne({user:user}, function(e, o) {
		if (o){
			o.pass == pass ? callback(o) : callback(null);
		}	else{
			callback(null);
		}
	});
}

DB.manualLogin = function(user, pass, callback) {
	DB.accounts.findOne({user:user}, function(e, o) {
		if (o == null){
			callback('user-not-found');
		}	else{
			bcrypt.compare(pass, o.pass, function(err, res) {
				if (res){
					callback(null, o);
				}	else{
					callback('invalid-password');
				}
			});
		}
	});
}

// record insertion, update & deletion methods //

DB.signup = function(newData, callback) {
	DB.accounts.findOne({user:newData.user}, function(e, o) {
		if (o){
			callback('username-taken');
		}	else{
			DB.accounts.findOne({email:newData.email}, function(e, o) {
				if (o){
					callback('email-taken');
				}	else{
					DB.saltAndHash(newData.pass, function(hash){
						newData.pass = hash;
					// append date stamp when record was created //
						newData.date = moment().format('MMMM Do YYYY, h:mm:ss a');
						DB.accounts.insert(newData, callback(null));
					});
				}
			});
		}
	});
}

DB.update = function(newData, callback) {
	DB.accounts.findOne({user:newData.user}, function(e, o){
		o.name 		= newData.name;
		o.email 	= newData.email;
		o.country 	= newData.country;
		if (newData.pass == ''){
			DB.accounts.save(o); callback(o);
		}	else{
			DB.saltAndHash(newData.pass, function(hash){
				o.pass = hash;
				DB.accounts.save(o); callback(o);
			});
		}
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

DB.delete = function(id, callback) {
	DB.accounts.remove({_id: this.getObjectId(id)}, callback);
}

// auxiliary methods //

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

// just for testing - these are not actually being used //

DB.findById = function(id, callback) {
	DB.accounts.findOne({_id: this.getObjectId(id)},
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
	
//flyer
DB.insert_invoice = function(newData, callback) {
	delete newData.id;
	var d = newData.invoice_date.split("/");
	newData.invoice_date = new Date(parseInt(d[2]),parseInt(d[1])-1,parseInt(d[0]));
	DB.invoices.insert(newData, callback(null));
}
DB.update_invoice = function(newData, callback) {
	DB.invoices.findOne({_id:new ObjectID(newData.id)}, function(e, o){
		newData._id = o._id;
		var d = newData.invoice_date.split("/");
		newData.invoice_date = new Date(parseInt(d[2]),parseInt(d[1])-1,parseInt(d[0]));
		delete newData.id;
		DB.invoices.save(newData);
		callback(o);
	});
}

DB.insert_client = function(newData, callback) {
	delete newData.id;
	DB.clients.insert(newData,callback(null));
}
DB.update_client = function(newData, callback) {
	DB.clients.findOne({_id:new ObjectID(newData.id)}, function(e, o){
		newData._id = o._id;
		delete newData.id;
		DB.clients.save(newData);
		callback(o);
	});
}


