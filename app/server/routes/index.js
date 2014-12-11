var DB = require('../modules/db-manager');
var CT = require('../modules/country-list');
var helpers = require('./helpers');

exports.get = function get(req, res) {
  DB.accounts.findOne({},function(e, result){
    if(result){
      // check if the user's credentials are saved in a cookie //
      if (req.cookies.user === undefined || req.cookies.pass === undefined || req.cookies.role === undefined){
        res.render('login', { locals: { title: __('Hello - Please Login To Your Account'), result : {}, from:req.query.from }});
      } else {
        // attempt automatic login //
        DB.accounts.findOne({user:req.cookies.user}, function(e, o) {
          if (o){
            if (o.pass === req.cookies.pass) {
              req.session.user = o;
              var redirect = req.query.from ? req.query.from : '/home';
              res.redirect(redirect);
            } else {
              res.render('login', { locals: { title: __('Hello - Please Login To Your Account'), result : {}, from:req.query.from }});
            }
          } else {
            res.render('login', { locals: { title: __('Hello - Please Login To Your Account'), result : {}, from:req.query.from }});
          }
        });
      }
    } else {
      res.render('account', {  locals: { title: __('Signup'), countries : CT, result : {} } });
    }
  });
};

exports.post = function post(req, res) {
  //var errors = [];
  DB.accounts.findOne({},function(e, result){
    if(result){
      helpers.validateFormLogin(req.body, function(e, o) {
        if (e.length) {
          if (req.body.ajax) {
            res.send({msg:{e:e}}, 200);
          } else {
            o._id = o.id;
            res.render('login', { locals: { title: __('Hello - Please Login To Your Account'), result : o, msg:{e:e}, from:req.body.from}});
          }
        } else {
          req.session.user = o;
          if (req.param('remember-me') == 'true'){
            res.cookie('user', o.user, { maxAge: 900000 });
            res.cookie('pass', o.pass, { maxAge: 900000 });
            res.cookie('role', o.role, { maxAge: 900000 });
          }
          if (req.param('ajax') == 'true') {
            res.send(o, 200);
          } else {
            var redirect = req.body.from ? req.body.from : '/home';
            res.redirect(redirect);
          }
        }
      });
    } else {
      helpers.validateFormAccount(req.body, function(e, o) {
        if (e.length) {
          if (req.body.ajax) {
            res.send({msg:{e:e}}, 200);
          } else {
            if (o.id) o._id = o.id;
            res.render('account', {  locals: {  title: __("Account"), countries : CT, result : o, msg:{e:e} } });
          }
        } else {
          DB.insert_account(req.body, function(e, o){
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
              DB.accounts.findOne({}, function(err, result) {
                req.session.user = result;
                e.push({name:"",m:__("Account saved with success")});
                if (req.body.ajax) {
                  res.send({msg:{c:e,redirect:"/home/"}}, 200);
                } else {
                  res.redirect("/home/");
                }
              });
            }
          });
        }
      });
    }
  });
};
