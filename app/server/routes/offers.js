var DB = require('../modules/db-manager');

exports.get = function get(req, res) {
  if (req.session.user == null) {
    res.redirect('/?from='+req.url);
  } else {
    var msg = {};
    if (req.query.id && req.query.del) {
      DB.delete_offer(req.query.id, function(err, obj){
        if (obj){
          msg.c = [];
          msg.c.push({name:"",m:__("Offer deleted successfully")});
        } else {
          msg.e = [];
          msg.e.push({name:"",m:__("Offer not found")});
        }
      });
    }
    DB.offers.find({}).sort({offer_number:1}).toArray(function(e, result) {
      res.render('offers', {  locals: {  title: __("Offers"), result : result, msg:msg, udata : req.session.user } });
    });
  }
};
