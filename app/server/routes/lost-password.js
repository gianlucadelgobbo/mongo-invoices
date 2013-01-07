var DB = require('../modules/db-manager');
var EM = require('../modules/email-dispatcher');

exports.post = function post(req, res) {
  // look up the user's account via their email //
  DB.accounts.findOne({email:req.param('email')}, function(e, o){
    if (o){
      res.send('ok', 200);
      EM.dispatchResetPasswordLink(o, function(e, m){
        // this callback takes a moment to return //
        // should add an ajax loader to give user feedback //
        if (!e) {
          //  res.send('ok', 200);
        } else {
          res.send('email-server-error', 400);
          for (var k in e) console.log('error : ', k, e[k]);
        }
      });
    } else {
      res.send('email-not-found', 400);
    }
  });
};
