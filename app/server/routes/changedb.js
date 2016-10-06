var DB = require('../helpers/db-manager');
var helpers = require('./../helpers/helpers');

exports.get = function get(req, res) {
  if (helpers.canIseeThis(req)) {
    var index = req.session.user.dbs.indexOf(req.params.dbname);
    global.settings.dbName = req.session.user.companies[index].dbname;
    global.settings.companyName = req.session.user.companies[index].companyname;
    DB.init(function(){
      var redirect = req.query.from ? req.query.from : "/"+global.settings.dbName+"/home/";
      res.redirect(redirect);
    });
  } else {
    res.redirect('/?from='+req.url);
  }
};
