var bcrypt = require('bcrypt-nodejs');
var ObjectID = require('mongodb').ObjectID;
var accounting = require('accounting');
accounting.settings = _config.accountingSettings;
var DB = require('../modules/db-manager');
var Validators = require('../../common/validators').Validators;

// Forms validators //
exports.validateFormLogin = function validateFormLogin(o,callback) {
	var e = [];
	DB.accounts.findOne({user:o.user}, function(err, result) {
		if (result == null){
			e.push({name:"user",m:__("User not found")});
			callback(e, o);
		} else {
			bcrypt.compare(o.pass, result.pass, function(err, res) {
				if (!res) e.push({name:"pass",m:__("Invalid password")});
				callback(e, result);
			});
		}
	});
};

exports.validateFormAccount = function validateFormAccount(o,callback) {
	var e = [];
	if (!Validators.validateStringLength(o.name, 3, 50)){
		e.push({name:"name",m:__("Please enter a valid Name")});
	}
	if (typeof o.country === "undefined" || !Validators.validateStringLength(o.country, 3, 50)){
		e.push({name:"country",m:__("Please enter a Country")});
	}
	if (!_config.roles[o.role]){
		e.push({name:"role",m:__("Please enter a valid Role")});
	}
	if (((o.id && o.pass !== "") || !o.id) && !Validators.validateStringLength(o.pass, 3, 50)){
		e.push({name:"pass",m:__("Please enter a valid Password")});
	}
	if (((o.id && o.user!=="") || !o.id) && !Validators.validateStringLength(o.user, 3, 50)){
		e.push({name:"user",m:__("Please enter a valid Username")});
	}
	if(!Validators.validateEmail(o.email)){
		e.push({name:"email",m:"Email is not email"});
		callback(e, o);
	} else {
		var q = (o.id ? {_id:{$ne: new ObjectID(o.id)},email:o.email} : {email:o.email});
		DB.accounts.findOne(q ,function(err, result) {
			if (result) {
				e.push({name:"email",m:__("Email already used from another account")});
				callback(e, o);
			} else {
				var q = (o.id ? {_id:{$ne: new ObjectID(o.id)},user:o.user} : {user:o.user});
				DB.accounts.findOne(q, function(err, result) {
					if (result){
						e.push({name:"email",m:__("Username already in use")});
					}
					callback(e, o);
				});
			}
		});
	}
};

exports.formatMoney = function formatMoney(result) {
	result.subtotal=accounting.formatMoney(result.subtotal);
	result.vat_amount=accounting.formatMoney(result.vat_amount);
	result.shipping_costs=accounting.formatMoney(result.shipping_costs);
	result.total=accounting.formatMoney(result.total);
	for (item in result.items) {
		if (result.items[item]) {
			result.items[item].price=accounting.formatMoney(result.items[item].price);
			result.items[item].amount=accounting.formatMoney(result.items[item].amount);
		}
	}
	for (item in result) {
		result[item].subtotal=accounting.formatMoney(result[item].subtotal);
		result[item].vat_amount=accounting.formatMoney(result[item].vat_amount);
		result[item].shipping_costs=accounting.formatMoney(result[item].shipping_costs);
		result[item].total=accounting.formatMoney(result[item].total);
	}
	return result;
};


exports.validateFormClient = function validateFormClient(o,callback) {
	var e = [];
	if (!Validators.validateStringLength(o.name, 3, 50)){
		e.push({name:"name",m:__("Please enter a valid Client")});
	}
	if (o.force != 1) {
		if (!Validators.validateStringLength(o.address.street, 3, 100)){
			e.push({name:"address[street]",m:__("Please enter a valid Street")});
		}
		if (!Validators.validateStringLength(o.address.zipcode, 3, 20)){
			e.push({name:"address[zipcode]",m:__("Please enter a valid ZIP code")});
		}
		if (!Validators.validateStringLength(o.address.city, 3, 50)){
			e.push({name:"address[city]",m:__("Please enter a valid City")});
		}
		if (!Validators.validateStringLength(o.address.country, 3, 50)){
			e.push({name:"address[country]", m:__("Please enter a valid Country")});
		}
		if (o.address.country == "Italy") {
			if (o.vat_number) e = e.concat(Validators.checkVAT(o.vat_number,o.address.country));
			if (o.fiscal_code != o.vat_number || o.fiscal_code=="") {
				e = e.concat(Validators.checkCF(o.fiscal_code));
			}
		}
	}
	if (e){
		callback(e, o);
	} else {
		var q = (o.id ? {_id:{$ne: new ObjectID(o.id)},vat_number:o.vat_number} : {vat_number:o.vat_number});
		DB.accounts.findOne(q ,function(err, result) {
			if (result) {
				e.push({name:"vat_number",m:__("VAT number already in use")});
				callback(e, o);
			} else {
				if (o.address.country == "Italy"){
					//var q = (o.id ? {_id:{$ne: new ObjectID(o.id)},fiscal_code:o.fiscal_code} : {fiscal_code:o.fiscal_code});
					DB.accounts.findOne({user:o.user}, function(err, result) {
						if (result){
							e.push({name:"fiscal_code",m:__("Fiscal code already in use")});
						}
						callback(e, o);
					});
				} else {
					callback(e, o);
				}
			}
		});
	}
};
