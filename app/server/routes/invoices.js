var DB = require('../modules/db-manager');

exports.get = function get(req, res) {
  if (req.session.user == null) {
    res.redirect('/?from='+req.url);
  } else {
    var msg = {};
    if (req.query.id && req.query.del) {
      DB.delete_invoice(req.query.id, function(err, obj){
        if (obj){
          msg.c = [];
          msg.c.push({name:"",m:__("Invoice deleted successfully")});
        } else {
          msg.e = [];
          msg.e.push({name:"",m:__("Invoice not found")});
        }
      });
    }
    var query = req.query.client ? {"to_client._id":req.query.client} : {};
    DB.invoices.find(query).sort({invoice_number:1}).toArray(function(e, result) {
      res.render('invoices', {  locals: { title: __("Invoices"), result : result, msg:msg, udata : req.session.user } });
    });
  }
};
