var Mongodb = require('mongodb').Db;
var Server = require('mongodb').Server;

var bcrypt = require('bcrypt-nodejs');

// use moment.js for pretty date-stamping //
var moment = require('moment');

var i18nAdmin = require('./i18n-admin');

var ObjectID = require('mongodb').ObjectID;

//var accounting = require('accounting');


var DBUsers = {};

DBUsers.init = function(callback) {
	DBUsers.db = new Mongodb(global.settings.dbUsersName, new Server(global.settings.dbHost, global.settings.dbPort, {auto_reconnect: true,safe:true}, {}));
	DBUsers.db.open(function(e, d){
		var e;
		if (e) {
			console.log(e);
		} else {
			console.log('Connected to database: ' + global.settings.dbUsersName);
			DBUsers.users = DBUsers.db.collection('users');
			i18nAdmin.init(function() {
				callback();
			});
		}
	});
}

DBUsers.insert_user = function(newData, callback) {
	delete newData.id;
	delete newData;
	DBUsers.saltAndHash(newData.pass, function(hash){
		newData.pass = hash;
		// append date stamp when record was created //
		newData.date = moment().format('MMMM Do YYYY, h:mm:ss a');
		DBUsers.users.insert(newData, {safe: true}, function(err, records){
			callback(err, records);
		});
	});
}
DBUsers.update_user = function(newData, callback) {
	DBUsers.users.findOne({_id: new ObjectID(newData.id)}, function(e, o){
		o.name 		= newData.name;
		o.role 		= newData.role;
		o.email 	= newData.email;
		o.country 	= newData.country;
		o.companies = newData.companies;
		if (newData.pass == ''){
			DBUsers.users.save(o);
			callback(o);
		} else{
			DBUsers.saltAndHash(newData.pass, function(hash){
				o.pass = hash;
				DBUsers.users.save(o);
				callback(o);
			});
		}
	});
}
DBUsers.saltAndHash = function(pass, callback) {
	bcrypt.genSalt(10, function(err, salt) {
		bcrypt.hash(pass, salt, function(err, hash) {}, function(err, hash) {
			callback(hash);
		});
	});
}
// Accont insertion, update & deletion methods //
/*
DBUsers.insert_settings = function(newData, userData, callback) {
	delete newData.id;
	DBUsers.settings.insert(newData, {safe: true}, function(err, records){
		callback(err, records);
	});
}
DBUsers.update_settings = function(newData, userData, callback) {

	DBUsers.settings.findOne({_id:new ObjectID(newData.id)}, function(e, o){
		newData._id = o._id;
		DBUsers.settings.save(newData);
		DBUsers.settings.findOne({_id:newData._id}, function(e, o){
			console.log(o);
			global._config = o;
			if (!global._config.roles) global._config.roles = require('./../config.js')._config.roles;
			DBUsers.i18n.setLocale(o.defaultLocale);
			callback(e, o);
		});
	});
}


DBUsers.delete_account = function(id, callback) {
	DBUsers.accounts.remove({_id: new ObjectID(id)}, {safe: true}, function(err, records){
		callback(err, records);
	});
}

DBUsers.setPassword = function(email, newPass, callback) {
	DBUsers.accounts.findOne({email:email}, function(e, o){
		DBUsers.saltAndHash(newPass, function(hash){
			o.pass = hash;
			DBUsers.accounts.save(o);
			callback(o);
		});
	});
}


*/

module.exports = DBUsers;
