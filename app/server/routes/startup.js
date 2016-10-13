var DBUsers = require('../helpers/db-users-manager');
var DB = require('../helpers/db-manager');
var CT = require('../helpers/country-list');
var helpers = require('./../helpers/helpers');

exports.get = function get(req, res) {
  DBUsers.users.findOne({}, function (e, result) {
    if (result) {
      var redirect = req.query.from ? req.query.from : "/" + global.settings.dbName + "/";
      res.redirect(redirect);
    } else {
      res.render('account_admin_new', {title: __('Signup'), countries : CT, result: {}});
    }
  });
};


exports.post = function post(req, res) {
  DBUsers.users.findOne({},function(e, result){
    if(result){
      res.redirect("/");
    } else {
      helpers.validateFormAccount(req.body, function(e, o) {
        if (e.length) {
          if (req.body.ajax) {
            res.status(200).send({msg:{e:e}});
          } else {
            res.render('account_admin_new', {  title: __("Account"), countries : CT, result : o, msg:{e:e}});
          }
        } else {
          DBUsers.insert_user(req.body, function(e, o){
            e = [];
            if (!o){
              e.push({name:"",m:__("Error creating account")});
            }
            if (e.length) {
              if (req.body.ajax) {
                res.status(200).send({msg:{e:e}});
              } else {
                res.render('account_admin_new', {  title: __("Account"), countries : CT, result : o, msg:{e:e}});
              }
              //res.render('account_admin_new', {  title: __("Customer"), countries : CT, result : o[0], msg:{e:e}, udata : req.session.user });
            } else {
              DBUsers.users.findOne({}, function(err, result) {
                result.dbs = helpers.generateDBs(result);
                req.session.user = result;
                global.settings.dbName = result.companies[0].dbname;
                global.settings.companyName = result.companies[0].companyname;
                DB.init(function(){
                  if (req.body.ajax) {
                    res.status(200).send({msg:{c:[{m:__("Start Up success!!! Redirecting...")}],redirect:"/"+global.settings.dbName+"/home/"}});
                  } else {
                    res.redirect("/"+global.settings.dbName+"/home/");
                  }

                });
              });
            }
          });
        }
      });
    }
  });
};
