var DB = require('../modules/db-manager');
var ObjectID = require('mongodb').ObjectID;
var CT = require('../modules/country-list');
var helpers = require('./helpers');

exports.get = function get(req, res) {
  if (req.session.user == null){
    res.redirect('/?from='+req.url);
  } else {
    if (req.query.id) {
      DB.accounts.findOne({_id:new ObjectID(req.query.id)}, function(e, result) {
        res.render('account', {  locals: { title: __('Account'), countries : CT, result : result, udata : req.session.user } });
      });
    } else {
      res.render('account', {  locals: { title: __('Account'), countries : CT, result : {}, udata : req.session.user } });
    }
  }
};

exports.post = function post(req, res) {
  if (req.session.user == null) {
    res.redirect('/?from='+req.url);
  } else {
    helpers.validateFormAccount(req.body, function(e, o) {
      if (e.length) {
        if (req.body.ajax) {
          res.send({msg:{e:e}}, 200);
        } else {
          if (o.id) o._id = o.id;
          res.render('account', {  locals: {  title: __("Account"), countries : CT, result : o, msg:{e:e}, udata : req.session.user } });
        }
      } else {
        if (req.body.id) {
          DB.update_account(o, function(o){
            var e = [];
            if (o){
              if (req.session.user._id == o._id){
                req.session.user = o;
                // udpate the user's login cookies if they exists //
                if (req.cookies.user !== undefined && req.cookies.pass !== undefined && req.cookies.role !== undefined){
                  res.cookie('user', o.user, { maxAge: 900000 });
                  res.cookie('pass', o.pass, { maxAge: 900000 });
                  res.cookie('role', o.role, { maxAge: 900000 });
                }
              }
            } else {
              e.push({name:"",m:__("Error updating account")});
            }
            if (e.length) {
              if (req.body.ajax) {
                res.send({msg:{e:e}}, 200);
              } else {
                o._id = o.id;
                res.render('account', {  locals: {  title: __("Account"), countries : CT, result : o, msg:{e:e}, udata : req.session.user } });
              }
            } else {
              e.push({name:"",m:__("Account saved with success")});
              if (req.body.ajax) {
                res.send({msg:{c:e}}, 200);
              } else {
                o._id = o.id;
                DB.accounts.findOne({_id:new ObjectID(req.param('id'))},function(err, result) {
                  res.render('account', {  locals: {  title: __("Account"), countries : CT, result : result, msg:{c:e}, udata : req.session.user } });
                });
              }
            }
          });
        } else {
          DB.insert_account(req.body, function(e, o){
            // FIXME: error should be dealt with not overwritten
            e = [];
            if (!o){
              e.push({name:"",m:__("Error updating account")});
            }
            if (e.length) {
              if (req.body.ajax) {
                res.send({msg:{e:e}}, 200);
              } else {
                res.render('account', {  locals: {  title: __("Client"), countries : CT, result : o[0], msg:{e:e}, udata : req.session.user } });
              }
            } else {
              e.push({name:"",m:__("Account saved with success")});
              if (req.body.ajax) {
                res.send({msg:{c:e}}, 200);
              } else {
                DB.accounts.findOne({_id:o[0]._id},function(err, result) {
                  res.render('account', {  locals: {  title: __("Client"), countries : CT, result : result, msg:{c:e}, udata : req.session.user } });
                });
              }
            }
          });
        }
      }
    });
  }
};
