var ObjectID = require('mongodb').ObjectID;
var DB = require('../modules/db-manager');
var CT = require('../modules/country-list');
var helpers = require('./helpers');

exports.get = function get(req, res) {
  if (req.session.user == null) {
    res.redirect('/?from='+req.url);
  } else {
    if (req.query.id) {
      DB.clients.findOne({_id:new ObjectID(req.query.id)}, function(e, result) {
        console.log(global._config);
        res.render('client', {  locals: { title: __("Client"), countries : CT, country : global._config.company.country, result : result , udata : req.session.user } });
      });
    } else {
      console.log(global._config);
      res.render('client', {  locals: { title: __("Client"), countries : CT, country : global._config.company.country, result : {address:{}}, udata : req.session.user } });
    }
  }
};

exports.post = function post(req, res) {
  if (req.session.user == null) {
    res.redirect('/?from='+req.url);
  } else {
    helpers.validateFormClient(req.body, function(e, o) {
      if (e.length) {
        if (req.body.ajax) {
          res.send({msg:{e:e}}, 200);
        } else {
          o._id = o.id;
          console.log(global._config);
          res.render('client', {  locals: { title: __("Client"), countries : CT, country : global._config.company.country, result : o, msg:{e:e}, udata : req.session.user } });
        }
      } else {
        if (req.body.id) {
          var id = req.body.id;
          DB.update_client(o, function(o){
            var e = [];
            if (!o) e.push({name:"", m:__("Error updating client")});
            if (e.length) {
              if (req.body.ajax) {
                res.send({msg:{e:e}}, 200);
              } else {
                o._id = o.id;
                console.log(global._config.company.country);
                res.render('client', {  locals: { title: __("Client"), countries : CT, country : global._config.company.country, result : o, msg:{e:e}, udata : req.session.user } });
              }
            } else {
              e.push({name:"",m:__("Client saved with success")});
              if (req.body.ajax) {
                res.send({msg:{c:e}}, 200);
              } else {
                DB.clients.findOne({_id:new ObjectID(id)},function(err, result) {
                  console.log(global._config.company.country);
                  res.render('client', {  locals: { title: __("Client"), countries : CT, country : global._config.company.country, result : result, msg:{c:e}, udata : req.session.user } });
                });
              }
            }
          });
        } else {
          DB.insert_client(req.body, function(e, o){
            // FIXME: deal with error, don't overwrite it
            e = [];
            if (!o){
              e.push({name:"",m:__("Error updating client")});
            }
            if (e.length) {
              if (req.body.ajax) {
                res.send({msg:{e:e}}, 200);
              } else {
                console.log(global._config.company.country);
                res.render('client', {  locals: { title: __("Client"), countries : CT, country : global._config.company.country, result : o[0], msg:{e:e}, udata : req.session.user } });
              }
            } else {
              e.push({name:"",m:__("Client saved with success")});
              if (req.body.ajax) {
                res.send({msg:{c:e}}, 200);
              } else {
                DB.clients.findOne({_id:o[0]._id},function(err, result) {
                  console.log(global._config.company.country);
                  res.render('client', {  locals: { title: __("Client"), countries : CT, country : global._config.company.country, result : result, msg:{c:e}, udata : req.session.user } });
                });
              }
            }
          });
        }
      }
    });
  }
};
