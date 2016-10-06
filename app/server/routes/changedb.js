var helpers = require('./../helpers/helpers');

exports.get = function get(req, res) {
  helpers.canIseeThis(req, function (auth) {
    if (auth) {
      var redirect = req.query.from ? req.query.from : "/"+global.settings.dbName+"/home/";
      res.redirect(redirect);
    } else {
      res.clearCookie('user');
      res.clearCookie('pass');
      res.clearCookie('role');
      req.session.destroy(function(e){
        res.redirect('/');
      });
    }
  });
};
