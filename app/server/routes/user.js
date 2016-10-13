var ObjectID = require('mongodb').ObjectID;
var DBUsers = require('../helpers/db-users-manager');
var CT = require('../helpers/country-list');
var helpers = require('../helpers/helpers');

exports.get = function get(req, res) {
  helpers.canIseeThis(req, function (auth) {
    if (auth) {
      if (req.query.id) {
        DBUsers.users.findOne({_id: new ObjectID(req.query.id)}, function (e, result) {
          if (global.settings.roles[req.session.user.role].superadmin && req.session.user._id == result._id) {
            res.render('account_admin', {title: __('Account'), countries: CT, result: result, udata: req.session.user});
          } else if (global.settings.roles[req.session.user.role].admin || req.session.user._id == result._id) {
            res.render('account_edit', {title: __('Account'), countries: CT, result: result, udata: req.session.user});
          } else {
            res.render('account_view', {title: __('Account'), countries: CT, result: result, udata: req.session.user});
          }
        });
      } else {
        res.render('account_new', {title: __('Account'), countries: CT, result: {}, udata: req.session.user});
      }
    } else {
      res.redirect('/?from=' + req.url);
    }
  });
};

exports.post = function post(req, res) {
  helpers.canIseeThis(req, function (auth) {
    if (auth) {
      helpers.validateFormAccount(req.body, function(e, o) {
        if (e.length) {
          if (req.body.ajax) {
            res.status(200).send({msg:{e:e}});
          } else {
            if (o.id) o._id = o.id;
            res.render('account', {  title: __("Account"), countries : CT, result : o, msg:{e:e}, udata : req.session.user});
          }
        } else {
          if (req.body.id) {
            DBUsers.update_user(o, function(o){
              var e = [];
              if (o){
                if (req.session.user._id == o._id){
                  o.dbs = helpers.generateDBs(o);
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
                  res.status(200).send({msg:{e:e}});
                } else {
                  o._id = o.id;
                  res.render('account', {  title: __("Account"), countries : CT, result : o, msg:{e:e}, udata : req.session.user});
                }
              } else {
                e.push({name:"",m:__("Account saved with success")});
                if (req.body.ajax) {
                  res.status(200).send({msg:{c:e}});
                } else {
                  o._id = o.id;
                  DBUsers.users.findOne({_id:new ObjectID(req.param('id'))},function(err, result) {
                    res.render('account', {  title: __("Account"), countries : CT, result : result, msg:{c:e}, udata : req.session.user});
                  });
                }
              }
            });
          } else {
            DBUsers.insert_user(req.body, function(e, o){
              // FIXME: error should be dealt with not overwritten
              e = [];
              if (!o){
                e.push({name:"",m:__("Error updating account")});
              }
              if (e.length) {
                if (req.body.ajax) {
                  res.status(200).send({msg:{e:e}});
                } else {
                  res.render('account', {  title: __("Customer"), countries : CT, result : o[0], msg:{e:e}, udata : req.session.user});
                }
              } else {
                e.push({name:"",m:__("Account saved with success")});
                if (req.body.ajax) {
                  res.status(200).send({msg:{c:e, redirect:"/"+global.settings.dbName+"/account?id="+o.ops[0]._id}});
                } else {
                  DBUsers.users.findOne({_id:o.ops[0]._id},function(err, result) {
                    res.render('account', {  title: __("Customer"), countries : CT, result : result, msg:{c:e}, udata : req.session.user});
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
