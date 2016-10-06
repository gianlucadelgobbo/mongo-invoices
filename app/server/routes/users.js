var DBUsers = require('../helpers/db-users-manager');
var helpers = require('./../helpers/helpers');

exports.get = function get(req, res) {
  helpers.canIseeThis(req, function (auth) {
    if (auth) {
      var msg = {};
      if (req.query.id && req.query.del) {
        DBUsers.delete_account(req.query.id, function(err, obj){
          if (obj){
            msg.c = [];
            msg.c.push({name:"",m:__("Account deleted successfully")});
          } else {
            msg.e = [];
            msg.e.push({name:"",m:__("Account not found")});
          }
        });
      }
      var q = [];
      for(var a=0;a<req.session.user.companies.length;a++) if(req.session.user.companies[a].dbname) q.push(req.session.user.companies[a].dbname);
      DBUsers.users.find({ "companies.dbname": { $in: q } }).toArray(function(e, result) {
        res.render('accounts', {  locals: { title: __('Accounts'), result : result, msg: msg, udata : req.session.user } });
      });
    } else {
      res.redirect('/?from='+req.url);
    }
  });
};