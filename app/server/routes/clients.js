var DB = require('./../helpers/db-manager');

exports.get = function get(req, res) {
  if (req.session.user == null) {
    res.redirect('/?from='+req.url);
  } else {
    var msg = {};
    if (req.query.id && req.query.del) {
      DB.delete_client(req.query.id, function(err, obj){
        if (obj){
          msg.c = [];
          msg.c.push({name:"",m:__("Client deleted successfully")});
        } else {
          msg.e = [];
          msg.e.push({name:"",m:__("Client not found")});
        }
      });
    }
    DB.clients.find({}).sort( { name: 1 } ).toArray(function(e, result) {
      var conta = 0;
      result.forEach(function(item, index, arr) {
        DB.invoices.find({"to_client._id":arr[index]._id.toString()}).toArray(function (e, result) {
          conta++;
          arr[index].invoicesCount = result.length;
          if (conta == arr.length) res.render('clients', {  locals: { title: __("Clients"), result : arr, msg: msg, udata : req.session.user } });
        });
      });
    });
/*
    DB.clients.find({}).sort( { name: 1 } ).toArray(function(e, result) {
      res.render('clients', {  locals: { title: __("Clients"), result : result, msg: msg, udata : req.session.user } });
    });
    */
  }
};
