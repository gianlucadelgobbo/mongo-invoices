var DB = require('../modules/db-manager');

exports.get = function get(req, res) {
  if (req.session.user == null) {
    res.redirect('/?from='+req.url);
  } else {
    var msg = {};
    if (req.query.id && req.query.del) {
      DB.delete_account(req.query.id, function(err, obj){
        if (obj){
          msg.c = [];
          msg.c.push({name:"",m:__("Account deleted successfully")});
        } else {
          msg.e = [];
          msg.e.push({name:"",m:__("Account not found")});
        }
      });
    }
    DB.accounts.find({}).toArray(function(e, result) {
      res.render('accounts', {  locals: { title: __('Accounts'), result : result, msg: msg, udata : req.session.user } });
    });
  }
};
