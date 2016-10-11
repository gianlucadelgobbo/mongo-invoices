var ObjectID = require('mongodb').ObjectID;
var DB = require('../helpers/db-manager');
var CT = require('../helpers/country-list');
var helpers = require('../helpers/helpers');

exports.get = function get(req, res) {
  helpers.canIseeThis(req, function (auth) {
    if (auth) {
      if (req.query.id) {
        DB.customers.findOne({_id:new ObjectID(req.query.id)}, function(e, result) {
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
            res.send({msg:{e:e}}, 200);
          } else {
            o._id = o.id;
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
                  res.send({msg:{e:e}}, 200);
                } else {
                  o._id = o.id;
                  res.render('customer', { title: __("Customer"), countries : CT, country : global._config.company.country, result : o, msg:{e:e}, udata : req.session.user });
                }
              } else {
                e.push({name:"",m:__("Customer saved with success")});
                if (req.body.ajax) {
                  res.send({msg:{c:e}}, 200);
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
                  res.send({msg:{e:e}}, 200);
                } else {
                  res.render('customer', { title: __("Customer"), countries : CT, country : global._config.company.country, result : o[0], msg:{e:e}, udata : req.session.user });
                }
              } else {
                e.push({name:"",m:__("Customer saved with success")});
                if (req.body.ajax) {
                  res.send({msg:{c:e,redirect:"/"+global.settings.dbName+"/customer?id="+ o._id}}, 200);
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
