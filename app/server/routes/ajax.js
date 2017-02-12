var CT = require('../helpers/country-list');
var helpers = require('../helpers/helpers.js');

exports.drawFBPostActivities = function drawFBPostActivities(req, res) {
  console.log("drawFBPostActivities");
  //delete req.body.partners_channels;
  console.log(req.body);
  res.render('actions_fb', { results:req.body });
};
exports.drawTWPostActivities = function drawTWPostActivities(req, res) {
  console.log("drawTWPostActivities");
  delete req.body.partners_channels;
  //console.log(req.body);
  res.render('actions_tw', { results:req.body });
};
