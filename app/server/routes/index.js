var DBUsers = require('../helpers/db-users-manager');
var DB = require('../helpers/db-manager');
var CT = require('../helpers/country-list');
var helpers = require('./../helpers/helpers');

exports.get = function get(req, res) {
  DBUsers.users.findOne({}, function (e, result) {
    if (result) {
      if (req.session && req.session.user && global.settings.dbName) {
        var redirect = req.query.from ? req.query.from : "/" + global.settings.dbName + "/home/";
        res.redirect(redirect);
      } else {
        // check if the user's credentials are saved in a cookie //
        if (req.cookies === undefined || req.cookies.user === undefined || req.cookies.pass === undefined || req.cookies.role === undefined) {
          console.log(global.settings);
          res.render('login', {layout: "layout_nologged.pug", title: __('Hello - Please Login To Your Account'), result: {}, from: req.query.from});
        } else {
          // attempt automatic login //
          DBUsers.users.findOne({user: req.cookies.user}, function (e, o) {
            if (o) {
              if (o.pass === req.cookies.pass) {
                o.dbs = helpers.generateDBs(o);
                req.session.user = o;
                global.settings.dbName = o.companies[0].dbname;
                global.settings.companyName = o.companies[0].companyname;
                DB.init(function () {
                  var redirect = req.query.from ? req.query.from : "/" + global.settings.dbName + "/home/";
                  res.redirect(redirect);
                });
              } else {
                res.render('login', {layout: "layout_nologged.pug", title: __('Hello - Please Login To Your Account'), result: {}, from: req.query.from});
              }
            } else {
              res.render('login', {layout: "layout_nologged.pug", title: __('Hello - Please Login To Your Account'), result: {}, from: req.query.from});
            }
          });
        }
      }
    } else {
      res.redirect("/startup");
    }
  });
};

exports.post = function post(req, res) {
  DBUsers.users.findOne({},function(e, result){
    if(result){
      helpers.validateFormLogin(req.body, function(e, o) {
        if (e.length) {
          if (req.body.ajax) {
            res.status(200).send({msg:{e:e}});
          } else {
            o._id = o.id;
            res.render('login', {title: __('Hello - Please Login To Your Account'), result: {}, from: req.query.from, errors: e});
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
            var rr = req.body.from!='undefined' ? req.body.from : "/"+global.settings.dbName+"/home/";
            if (req.body.ajax) {
              res.status(200).send({msg:{c:[{m:"Login success!!!"}], redirect:rr}});
            } else {
              res.redirect(rr);
            }
          });
        }
      });
    } else {
      res.redirect("/startup/");
    }
  });
};
