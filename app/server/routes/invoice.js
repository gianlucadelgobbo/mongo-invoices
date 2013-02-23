var DB = require('../modules/db-manager');
var Validators = require('../../common/validators').Validators;
var helpers = require('./helpers');
var ObjectID = require('mongodb').ObjectID;

exports.get = function get(req, res) {
  if (req.session.user == null) {
    res.redirect('/?from='+req.url);
  } else {
    if (req.query.id) {
      DB.invoices.findOne({_id:new ObjectID(req.query.id)},function(e, result) {
        result = helpers.formatMoney(result);
        res.render('invoice', {  locals: { title: __("Invoice"), result : result, udata : req.session.user } });
      });
    } else {
      DB.invoices.find({},{invoice_date:1,invoice_number:1}).sort({invoice_number:1}).toArray(function(e, resultInvoice) {
        if (req.query.offer) {
          DB.offers.findOne({_id:new ObjectID(req.query.offer)},function(e, result) {
            result = helpers.formatMoney(result);
            result.invoice_date = new Date();
            result.invoice_number = resultInvoice.length+1;
            result.offer = {offer_number:result.offer_number,offer_date:result.offer_date};
            delete result._id;
            res.render('invoice', {  locals: {  title: __("Invoice"), result : result, udata : req.session.user } });
          });
        } else {
          var resultEmpty = {invoice_date:new Date(),invoice_number:resultInvoice.length+1,vat_perc:_config.vat_perc,to_client:{address:{}},offer:{},items:[{}]};
          res.render('invoice', {  locals: {  title: __("Invoice"), result : resultEmpty, udata : req.session.user } });
        }
      });
    }
  }
};

exports.post = function post(req, res) {
  if (req.session.user == null) {
    res.redirect('/?from='+req.url);
  } else {
    //controls
    var errors = [];
    errors = errors.concat(Validators.checkClientID(req.body.to_client._id));
    errors = errors.concat(Validators.checkInvoiceNumber(req.body.invoice_number));
    errors = errors.concat(Validators.checkInvoiceDate(req.body.invoice_date));
    errors = errors.concat(Validators.checkDeliveryDate(req.body.delivery_date));
    var d = req.body.invoice_date.split("/");
    if (errors.length === 0){
      DB.clients.findOne({_id:new ObjectID(req.body.to_client._id)},function(e, result) {
        if (result) {
          var d = req.body.invoice_date.split("/");
          var date = new Date(parseInt(d[2], 10),parseInt(d[1], 10)-1,parseInt(d[0], 10));
          var q = {invoice_date:{$gt: date},invoice_number:(req.body.invoice_number-1).toString() };
          DB.invoices.find(q).toArray(function(e, result) {
            if(errors.length === 0){
              var myid = req.body.id;
              if (req.body.id) {
                DB.update_invoice(req.body, req.session.user, function(e, o){
                  errors.push({name:"",m:__("Invoice saved with success")});
                  console.dir("bella");
                  res.render('invoice', {  locals: {  title: __("Invoice"), result : helpers.formatMoney(o), msg:{c:errors}, udata : req.session.user } });
                });
              } else {
                DB.insert_invoice(req.body, req.session.user, function(e, o){
                  var msg = {};
                  if (e){
                    msg.e = [];
                    msg.e.push({name:"",m:__("Error updating invoice")});
                  } else {
                    msg.c = [];
                    msg.c.push({name:"",m:__("Invoice saved with success")});
                  }
                  res.render('invoice', {  locals: {  title: __("Invoice"), result : helpers.formatMoney(o[0]), msg:msg, udata : req.session.user } });
                });
              }
            } else {
              if (req.body.id) req.body._id = req.body.id;
              errors.push({name:"invoice_date",m:__("Data must be greater than")+": "+result.invoice_date});
              var d = req.body.offer_date.split("/");
              req.body.invoice_date = new Date(parseInt(d[2], 10),parseInt(d[1], 10)-1,parseInt(d[0], 10));
              if (req.body.delivery_date) {
                d = req.body.delivery_date.split("/");
                req.body.delivery_date = new Date(parseInt(d[2], 10),parseInt(d[1], 10)-1,parseInt(d[0], 10));
              }
              if (req.body.offer.offer_date) {
                d = req.body.offer.offer_date.split("/");
                req.body.offer.offer_date = new Date(parseInt(d[2], 10),parseInt(d[1], 10)-1,parseInt(d[0], 10));
              }
              req.body.to_client.address={};
              res.render('invoice', {  locals: {  title: __("Invoice"), result : req.body, msg:{e:errors}, udata : req.session.user } });
            }
          });
        } else {
          if (req.body.id) req.body._id = req.body.id;
          errors.push({name:"to_client[name]",m:__("You have to insert a valid client")});
          var d = req.body.offer_date.split("/");
          req.body.invoice_date = new Date(parseInt(d[2], 10),parseInt(d[1], 10)-1,parseInt(d[0], 10));
          if (req.body.delivery_date) {
            d = req.body.delivery_date.split("/");
            req.body.delivery_date = new Date(parseInt(d[2], 10),parseInt(d[1], 10)-1,parseInt(d[0], 10));
          }
          if (req.body.offer.offer_date) {
            d = req.body.offer.offer_date.split("/");
            req.body.offer.offer_date = new Date(parseInt(d[2], 10),parseInt(d[1], 10)-1,parseInt(d[0], 10));
          }
          req.body.to_client.address={};
          res.render('invoice', {  locals: {  title: __("Invoice"), result : req.body, msg:{e:errors}, udata : req.session.user } });
        }
      });
    } else {
      if (req.body.id) req.body._id = req.body.id;
      req.body.invoice_date = new Date(parseInt(d[2], 10),parseInt(d[1], 10)-1,parseInt(d[0], 10));
      if (req.body.delivery_date) {
        d = req.body.delivery_date.split("/");
        req.body.delivery_date = new Date(parseInt(d[2], 10),parseInt(d[1], 10)-1,parseInt(d[0], 10));
      }
      if (req.body.offer.offer_date) {
        d = req.body.offer.offer_date.split("/");
        req.body.offer.offer_date = new Date(parseInt(d[2], 10),parseInt(d[1], 10)-1,parseInt(d[0], 10));
      }
      req.body.to_client.address={};
      res.render('invoice', {  locals: {  title: __("Invoice"), result : req.body, msg:{e:errors}, udata : req.session.user } });
    }
  }
};

exports.print = function print(req, res) {
  if (req.session.user == null) {
    res.redirect('/?from='+req.url);
  } else {
    if (req.query.id) {
      DB.invoices.findOne({_id:new ObjectID(req.query.id)},function(e, result) {
        res.render('print_invoice', { layout: 'print.jade' ,  locals: {  title: __("Invoice"), result : result, udata : req.session.user } });
      });
    } else {
      res.redirect('/invoices');
    }
  }
};
