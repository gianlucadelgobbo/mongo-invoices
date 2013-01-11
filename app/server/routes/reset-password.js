var DB = require('../modules/db-manager');

exports.get = function get(req, res) {
  var email = req.query.e;
  var passH = req.query.p;
  DB.validateLink(email, passH, function(e){
    if (e != 'ok'){
      res.redirect('/?from='+req.url);
    } else{
      // save the user's email in a session instead of sending to the client //
      req.session.reset = { email:email, passHash:passH };
      res.render('reset', { title: __("Reset Password") });
    }
  });
};

exports.post = function post(req, res) {
  var nPass = req.param('pass');
  // retrieve the user's email from the session to lookup their account and reset password //
  var email = req.session.reset.email;
  // destory the session immediately after retrieving the stored email //
  req.session.destroy();
  DB.setPassword(email, nPass, function(o){
    if (o){
      res.send('ok', 200);
    } else {
      res.send('unable to update password', 400);
    }
  });
};
