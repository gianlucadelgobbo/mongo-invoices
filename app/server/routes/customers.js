var DB = require('./../helpers/db-manager');
var helpers = require('./../helpers/helpers');

exports.get = function get(req, res) {
  helpers.canIseeThis(req, function (auth) {
    if (auth) {
      var msg = {};
      if (req.query.id && req.query.del) {
        DB.delete_customer(req.query.id, function(err, obj){
          if (obj){
            msg.c = [];
            msg.c.push({name:"",m:__("Customer deleted successfully")});
          } else {
            msg.e = [];
            msg.e.push({name:"",m:__("Customer not found")});
          }
        });
      }
      DB.customers.find({}).sort( { name: 1 } ).toArray(function(e, result) {
        var conta = 0;
        if (result.length) {
          result.forEach(function(item, index, arr) {
            DB.invoices.find({"to_client._id":arr[index]._id.toString()}).toArray(function (e, result) {
              conta++;
              arr[index].invoicesCount = result.length;
              if (conta == arr.length) res.render('customers', { title: __("Customers"), result : arr, msg: msg, udata : req.session.user });
            });
          });
        } else {
          res.render('customers', { title: __("Customers"), msg: msg, udata : req.session.user });
        }

      });
      /*
       DB.customers.find({}).sort( { name: 1 } ).toArray(function(e, result) {
       res.render('customers', {  locals: { title: __("Customers"), result : result, msg: msg, udata : req.session.user } });
       });
       */
    } else {
      res.redirect('/?from='+req.url);
    }
  });
};
