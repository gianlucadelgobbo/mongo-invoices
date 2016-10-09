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
      res.render('account_admin_new', {layout: "layout_nologged.pug", locals: {title: __('Signup'), countries : CT, result: {}}});
    }
  });
};

/*
  if (req.session.user && DBUsers.db) {
    if (req.query.dbname) {
      var index = 0;
      for(var a=0;a<req.session.user.companies.length;a++){
        if (req.session.user.companies[a].dbname==req.query.dbname){
          index = a;
        }
      }
      global.settings.dbName = req.session.user.companies[index].dbname;
      global.settings.companyName = req.session.user.companies[index].companyname;
      DB.init(function(){
        var redirect = req.query.from ? req.query.from : "/"+global.settings.dbName+"/home/";
        res.redirect(redirect);
      });
    } else {
      var redirect = req.query.from ? req.query.from : "/"+global.settings.dbName+"/home/";
      res.redirect(redirect);
    }

  } else {
    DBUsers.users.findOne({}, function (e, result) {
      if (result) {
        // check if the user's credentials are saved in a cookie //
        if (req.cookies.user === undefined || req.cookies.pass === undefined || req.cookies.role === undefined) {
          res.render('login', {layout: "layout_nologged.pug", locals: {title: __('Hello - Please Login To Your Account'), result: {}, from: req.query.from}});
        } else {
          // attempt automatic login //
          DBUsers.users.findOne({user: req.cookies.user}, function (e, o) {
            if (o) {
              if (o.pass === req.cookies.pass) {
                o.dbs = helpers.generateDBs(o);
                req.session.user = o;
                global.settings.dbName = o.companies[0].dbname;
                global.settings.companyName = o.companies[0].companyname;
                DB.init(function(){
                  var redirect = req.query.from ? req.query.from : "/"+global.settings.dbName+"/home/";
                  res.redirect(redirect);
                });
              } else {
                res.render('login', {layout: "layout_nologged.pug", locals: {title: __('Hello - Please Login To Your Account'), result: {}, from: req.query.from}});
              }
            } else {
              res.render('login', {layout: "layout_nologged.pug", locals: {title: __('Hello - Please Login To Your Account'), result: {}, from: req.query.from}});
            }
          });
        }
      } else {
        res.render('account', {layout: "layout_nologged.pug", locals: {title: __('Signup'), countries: CT, result: {}}});
      }
    });
  }
};
*/
exports.post = function post(req, res) {
  DBUsers.users.findOne({},function(e, result){
    if(result){
      helpers.validateFormLogin(req.body, function(e, o) {
        if (e.length) {
          if (req.body.ajax) {
            res.send({msg:{e:e}}, 200);
          } else {
            o._id = o.id;
            res.render('login', {layout: "layout_nologged.pug", locals: { title: __('Hello - Please Login To Your Account'), result : o, msg:{e:e}, from:req.body.from}});
          }
        } else {
          o.dbs = helpers.generateDBs(o);
          req.session.user = o;
          global.settings.dbName = o.companies[0].dbname;
          global.settings.companyName = o.companies[0].companyname;
          DB.init(function(){
            if (req.params.rememberme == 'true'){
              res.cookie('user', o.user, { maxAge: 900000 });
              res.cookie('pass', o.pass, { maxAge: 900000 });
              res.cookie('role', o.role, { maxAge: 900000 });
            }
            var redirect = req.body.from ? req.body.from : "/"+global.settings.dbName+"/home/";
            res.redirect(redirect);
          });
        }
      });
    } else {
      helpers.validateFormAccount(req.body, function(e, o) {
        if (e.length) {
          if (req.body.ajax) {
            res.send({msg:{e:e}}, 200);
          } else {
            if (o.id) o._id = o.id;
            res.render('account', {layout: "layout_nologged.pug", locals: {  title: __("Account"), countries : CT, result : o, msg:{e:e} } });
          }
        } else {
          DBUsers.insert_user(req.body, function(e, o){
            e = [];
            if (!o){
              e.push({name:"",m:__("Error updating account")});
            }
            if (e.length) {
              res.render('account', {layout: "layout_nologged.pug", locals: {  title: __("Customer"), countries : CT, result : o[0], msg:{e:e}, udata : req.session.user } });
            } else {
              DBUsers.users.findOne({}, function(err, result) {
                o.dbs = helpers.generateDBs(result);
                req.session.user = result;
                global.settings.dbName = result.companies[0].dbname;
                global.settings.companyName = result.companies[0].companyname;
                DB.init(function(){
                  res.redirect("/"+global.settings.dbName+"/home/");
                });
              });
            }
          });
        }
      });
    }
  });
};
