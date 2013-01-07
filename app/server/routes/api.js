var DB = require('../modules/db-manager');

exports.getClients = function getClients(req, res) {
  if (req.session.user == null) {
    res.redirect('/?from='+req.url);
  } else {
    var query = {name:{$regex: req.query.term, $options: 'i' }};
    console.dir(query);
    DB.clients.find(query).toArray(function(e, result) {
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

exports.getProducts = function getProducts(req, res) {
  if (req.session.user == null) {
    res.redirect('/?from='+req.url);
  } else {
    var query = {"items.description":{$regex: req.query.term, $options: 'i' }};
    console.dir(query);
    DB.invoices.distinct("items.description", query, function(e, result) {
      console.dir(result);
      res.send(result);
    });
  }
};
