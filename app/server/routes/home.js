var CT = require('../helpers/country-list');
var helpers = require('../helpers/helpers.js');

exports.get = function get(req, res) {
  helpers.canIseeThis(req, function (auth) {
    if (auth) {
      res.render('home', { locals: { title: __("Home"), countries : CT, udata : req.session.user } });
    } else {
      res.redirect('/?from='+req.url);
    }
  });
};
