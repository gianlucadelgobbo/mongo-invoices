var DB = require('../helpers/db-manager');
var helpers = require('../helpers/helpers');

exports.getCustomers = function getCustomers(req, res) {
  console.log(req.session.user);
    if (req.session.user == null) {
      res.redirect('/?from='+req.url);
    } else {
      var query = {name:{$regex: req.query.term, $options: 'i' }};
      console.dir(query);
      DB.customers.find(query).toArray(function(e, result) {
        console.dir(result);
        res.send(result);
      });
    }

};

exports.getPayments = function getPayments(req, res) {
  if (req.session.user == null) {
    res.redirect('/?from='+req.url);
  } else {
    var query = {payment:{$regex: req.query.term, $options: 'i' }};
    console.dir(query);
    DB.invoices.distinct("payment", query, function(e, result) {
      console.dir(result);
      res.send(result);
    });
  }
};

exports.getInvoices = function getInvoices(req, res) {
  var d = req.query.invoice_date.split("/");
  var q = {invoice_date:{$gt:  new Date(parseInt(d[2], 10),parseInt(d[1], 10)-1,parseInt(d[0], 10))},invoice_number:(req.query.invoice_number-1).toString() };
  console.dir(q);
  DB.invoices.find(q).toArray(function(e, result) {
    console.dir(result);
    res.send({result:result});
  });
};

exports.getOffers = function getInvoices(req, res) {
  DB.offers.find({},{offer_number:1,offer_date:1,to_client:1,description:1}).sort({offer_number:-1}).toArray(function(e, result) {
    console.dir(result);
    res.send({result:result});
  });
};

exports.getProducts = function getProducts(req, res) {
  if (req.session.user == null) {
    res.redirect('/?from='+req.url);
  } else {
    var query = {'items.description':{$regex: req.query.term, $options: 'i' }};
    console.dir(query);
    DB.invoices.distinct('items.description', query, function(e, result) {
      console.dir(result);
      res.send(result);
    });
  }
};
