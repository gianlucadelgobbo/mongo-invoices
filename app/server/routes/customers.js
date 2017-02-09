var ObjectID = require('mongodb').ObjectID;
var DB = require('../helpers/db-manager');
var CT = require('../helpers/country-list');
var helpers = require('../helpers/helpers');

exports.getAll = function get(req, res) {
  helpers.canIseeThis(req, function (auth) {
    if (auth) {
      var msg = {};
      if (req.params.customer && req.query.del) {
        DB.delete_customer(req.params.customer, function(err, obj){
          if (obj){
            msg.c = [];
            msg.c.push({name:"",m:__("Customer deleted successfully")});
          } else {
            msg.e = [];
            msg.e.push({name:"",m:__("Customer not found")});
          }
        });
      }
      DB.customers.find({}).sort( { name: 1 } ).toArray(function(e, result) {
        var conta = 0;
        if (result.length) {
          result.forEach(function(item, index, arr) {
            DB.invoices.find({"to_client._id":arr[index]._id.toString()}).toArray(function (e, result) {
              conta++;
              arr[index].invoicesCount = result.length;
              if (conta == arr.length) res.render('customers', { title: __("Customers"), result : arr, msg: msg, udata : req.session.user });
            });
          });
        } else {
          res.render('customers', { title: __("Customers"), msg: msg, udata : req.session.user });
        }

      });
      /*
       DB.customers.find({}).sort( { name: 1 } ).toArray(function(e, result) {
       res.render('customers', {  locals: { title: __("Customers"), result : result, msg: msg, udata : req.session.user } });
       });
       */
    } else {
      res.redirect('/?from='+req.url);
    }
  });
};

exports.get = function get(req, res) {
  helpers.canIseeThis(req, function (auth) {
    if (auth) {
      if (req.params.customer && req.params.customer!="new") {
        DB.customers.findOne({_id:new ObjectID(req.params.customer)}, function(e, result) {
          if (!result.contacts) result.contacts = [];
          res.render('customer', { title: __("Customer"), countries : CT, country : global._config.company.country, result : result , udata : req.session.user });
        });
      } else {
        res.render('customer', { title: __("Customer"), countries : CT, country : global._config.company.country, result : {address:{}, contacts:[]}, udata : req.session.user });
      }
    } else {
      res.redirect('/?from='+req.url);
    }
  });
};

exports.post = function post(req, res) {
  helpers.canIseeThis(req, function (auth) {
    if (auth) {
      helpers.validateFormCustomer(req.body, function(e, o) {
        if (e.length) {
          if (req.body.ajax) {
            res.status(200).send({msg:{e:e}});
          } else {
            res.render('customer', { title: __("Customer"), countries : CT, country : global._config.company.country, result : o, msg:{e:e}, udata : req.session.user });
          }
        } else {
          if (req.body.id) {
            var id = req.body.id;
            DB.update_customer(o, function(o){
              var e = [];
              if (!o) e.push({name:"", m:__("Error updating customer")});
              if (e.length) {
                if (req.body.ajax) {
                  res.status(200).send({msg:{e:e}});
                } else {
                  o._id = o.id;
                  res.render('customer', { title: __("Customer"), countries : CT, country : global._config.company.country, result : o, msg:{e:e}, udata : req.session.user });
                }
              } else {
                e.push({m:__("Customer saved with success")});
                if (req.body.ajax) {
                  res.status(200).send({msg:{c:e}});
                } else {
                  DB.customers.findOne({_id:new ObjectID(id)},function(err, result) {
                    res.render('customer', { title: __("Customer"), countries : CT, country : global._config.company.country, result : result, msg:{c:e}, udata : req.session.user });
                  });
                }
              }
            });
          } else {
            DB.insert_customer(req.body, function(e, o){
              e = [];
              if (!o){
                e.push({name:"",m:__("Error updating customer")});
              }
              if (e.length) {
                if (req.body.ajax) {
                  res.status(200).send({msg:{e:e}});
                } else {
                  res.render('customer', { title: __("Customer"), countries : CT, country : global._config.company.country, result : o[0], msg:{e:e}, udata : req.session.user });
                }
              } else {
                e.push({name:"",m:__("Customer saved with success")});
                if (req.body.ajax) {
                  res.status(200).send({msg:{c:e,redirect:"/"+global.settings.dbName+"/customer?id="+ o._id}});
                } else {
                  DB.customers.findOne({_id:o[0]._id},function(err, result) {
                    res.render('customer', { title: __("Customer"), countries : CT, country : global._config.company.country, result : result, msg:{c:e}, udata : req.session.user });
                  });
                }
              }
            });
          }
        }
      });
    } else {
      res.redirect('/?from='+req.url);
    }
  });
};
