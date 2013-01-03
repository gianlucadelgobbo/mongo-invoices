var CT = require('../modules/country-list');

exports.get = function get(req, res) {
  if (req.session.user == null) {
    res.redirect('/?from='+req.url);
  } else {
    res.render('home', { locals: { title: __("Home"), countries : CT, udata : req.session.user } });
  }
};
