var helpers = require('./../helpers/helpers');

exports.get404 = function get(req, res) {
  helpers.canIseeThis(req, function (auth) {
    if (auth) {
      res.render('404', { title: "Page Not Found", udata : req.session.user});
    } else {
      res.redirect('/?from='+req.url);
    }
  });
};
exports.get = function get(req, res) {
  helpers.canIseeThis(req, function (auth) {
    res.redirect('/');
  });
};