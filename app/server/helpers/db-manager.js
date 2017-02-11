var Mongodb = require('mongodb').Db;
var Server = require('mongodb').Server;

var bcrypt = require('bcrypt-nodejs');

var dbPort = global.settings.dbPort;
var dbHost = global.settings.dbHost;

// use moment.js for pretty date-stamping //
var moment = require('moment');

var ObjectID = require('mongodb').ObjectID;

var accounting = require('accounting');

var i18nAdmin = require('./i18n-admin');

var DB = {};

DB.init = function(callback) {
  DB.db = new Mongodb(global.settings.dbName, new Server(dbHost, dbPort, {auto_reconnect: true,safe:true}, {}));
  DB.db.open(function(e, d){
    var e;
    if (e) {
      console.log(e);
    } else {
      console.log('connected to database: ' + global.settings.dbName);
      DB.db.collection('settings').findOne({}, function(e, o){
        if (!o) o = require('./../config.js')._config;
        global._config = o;
        accounting.settings =     global._config.accountingSettings;
        i18nAdmin.setLocale(o.defaultLocale);
        DB.customers = DB.db.collection('clients');
        DB.invoices = DB.db.collection('invoices');
        DB.offers = DB.db.collection('offers');
        DB.partners = DB.db.collection('partners');
        DB.extras = DB.db.collection('extras');
        DB.actions = DB.db.collection('actions');
        DB.settings = DB.db.collection('settings');
        callback();
      });
    }
  });
};

// Accont insertion, update & deletion methods //

DB.insert_settings = function(newData, userData, callback) {
  delete newData.id;
  DB.settings.insert(newData, {safe: true}, function(err, records){
    callback(err, records.ops[0]);
  });
};
DB.update_settings = function(newData, userData, callback) {

  DB.settings.findOne({_id:new ObjectID(newData.id)}, function(e, o){
    newData._id = o._id;
    if (!newData.emailDispatcher.password && o.emailDispatcher && o.emailDispatcher.password) newData.emailDispatcher.password = o.emailDispatcher.password;
    DB.settings.save(newData);
    DB.settings.findOne({_id:newData._id}, function(e, o){
      global._config = o;
      if (!global._config.roles) global._config.roles = require('./../config.js')._config.roles;
      i18nAdmin.setLocale(o.defaultLocale);
      callback(e, o);
    });
  });
};

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
    callback(err, records.ops[0]);
  });
};
DB.update_invoice = function(newData, userData, callback) {
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
    if (!newData.revisions)  newData.revisions = [];
    newData.revisions.push({userID : userData._id,username: userData.name,time : new Date()});
    delete newData.id;
    //console.log(newData.invoice_date);
    DB.invoices.save(newData);
    DB.invoices.findOne({_id:newData._id}, function(e, o){
      callback(e, o);
    });
  });
};
DB.delete_invoice = function(id, callback) {
  DB.invoices.remove({_id: new ObjectID(id)},{safe: true}, function(err, records){
    callback(err, records);
  });
};

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
    callback(err, records.ops[0]);
  });
};
DB.update_offer = function(newData, userData, callback) {
  DB.offers.findOne({_id:new ObjectID(newData.id)}, function(e, o){
    newData._id = o._id;
    var d = newData.offer_date.split("/");
    newData.offer_date = new Date(parseInt(d[2], 10),parseInt(d[1], 10)-1,parseInt(d[0], 10));
    if (newData.delivery_date!="") {
      d = newData.delivery_date.split("/");
      newData.delivery_date = new Date(parseInt(d[2], 10),parseInt(d[1], 10)-1,parseInt(d[0], 10));
    }
    newData.offer_number=parseInt(newData.offer_number);
    newData.vat_perc=parseInt(newData.vat_perc);
    unformatPrices(newData);
    if (!newData.revisions)  newData.revisions = [];
    newData.revisions.push({userID : userData._id,username: userData.name,time : new Date()});
    delete newData.id;
    DB.offers.save(newData);
    DB.offers.findOne({_id:newData._id}, function(e, o){
      callback(e, o);
    });
  });
};
DB.delete_offer = function(id, callback) {
  DB.offers.remove({_id: new ObjectID(id)},{safe: true}, function(err, records){
    callback(err, records);
  });
};

DB.insert_customer = function(newData, callback) {
  delete newData.id;
  DB.customers.insert(newData, {safe: true}, function(err, records){
    callback(err, records.ops[0]);
  });
};
DB.update_customer = function(newData, callback) {
  DB.customers.findOne({_id:new ObjectID(newData.id)}, function(e, o){
    newData._id = o._id;
    delete newData.id;
    DB.customers.save(newData);
    callback(newData);
  });
};
DB.delete_customer = function(id, callback) {
  DB.customers.remove({_id: new ObjectID(id)},{safe: true}, function(err, records){
    callback(err, records);
  });
};

DB.insert_action = function(newData, callback) {
  newData.date = new Date();
  DB.actions.insert(newData, {safe: true}, function(err, records){
    callback(err, records.ops[0]);
  });
};
DB.update_action = function(newData, callback) {
  DB.actions.findOne({_id:new ObjectID(newData._id)}, function(e, o){
    delete newData.ajax;
    delete newData.dbName;
    newData._id = o._id;
    DB.actions.save(newData);
    callback(newData);
  });
};
DB.delete_action = function(id, callback) {
  DB.actions.remove({_id: new ObjectID(id)},{safe: true}, function(err, records){
    callback(err, records);
  });
};

DB.insert_partner = function(newData, callback) {
  delete newData.id;
  DB.partners.insert(newData, {safe: true}, function(err, records){
    callback(err, records.ops[0]);
  });
};
DB.update_partner = function(newData, callback) {
  DB.partners.findOne({_id:new ObjectID(newData.id)}, function(e, o){
    newData._id = o._id;
    delete newData.id;
    DB.partners.save(newData);
    callback(newData);
  });
};
DB.delete_partner = function(id, callback) {
  DB.partners.remove({_id: new ObjectID(id)},{safe: true}, function(err, records){
    callback(err, records);
  });
};


function unformatPrices(newInvoice){
  newInvoice.subtotal=parseFloat(accounting.unformat(newInvoice.subtotal, ","));
  newInvoice.vat_amount=parseFloat(accounting.unformat(newInvoice.vat_amount, ","));
  newInvoice.shipping_costs=parseFloat(accounting.unformat(newInvoice.shipping_costs, ","));
  newInvoice.total=parseFloat(accounting.unformat(newInvoice.total, ","));
  for (var item in newInvoice.items) {
    newInvoice.items[item].price=parseFloat(accounting.unformat(newInvoice.items[item].price, ","));
    newInvoice.items[item].amount=parseFloat(accounting.unformat(newInvoice.items[item].amount, ","));
  }
  if (newInvoice.items) {
  }
}

module.exports = DB;
