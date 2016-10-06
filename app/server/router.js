var indexRoutes = require('./routes/index');
var changedbRoutes = require('./routes/changedb');
var logoutRoutes = require('./routes/logout');
var homeRoutes = require('./routes/home');
var accountsRoutes = require('./routes/users');
var accountRoutes = require('./routes/user');
var settingsRoutes = require('./routes/settings');
var lostPasswordRoutes = require('./routes/lost-password');
var resetPasswordRoutes = require('./routes/reset-password');
var customersRoutes = require('./routes/customers');
var customerRoutes = require('./routes/customer');
var invoicesRoutes = require('./routes/invoices');
var invoiceRoutes = require('./routes/invoice');
var offerRoutes = require('./routes/offer');
var offersRoutes = require('./routes/offers');
var apiRoutes = require('./routes/api');

module.exports = function(app) {
  // Log In //
  app.get('/', indexRoutes.get);
  app.post('/', indexRoutes.post);

  // Log Out //
  app.get('/logout', logoutRoutes.get);

  // Logged-in redirect / homepage //
  app.get('/:dbname/home', homeRoutes.get);

  // Settings //
  app.get('/:dbname/settings', settingsRoutes.get);
  app.post('/:dbname/settings', settingsRoutes.post);

  // Accounts //
  app.get('/:dbname/accounts', accountsRoutes.get);
  app.get('/account', accountRoutes.get);
  app.post('/account', accountRoutes.post);

  // password reset //
  app.post('/lost-password', lostPasswordRoutes.post);
  app.get('/reset-password', resetPasswordRoutes.get);
  app.post('/reset-password', resetPasswordRoutes.post);

  // Customers //
  app.get('/:dbname/customers', customersRoutes.get);
  app.get('/:dbname/customer', customerRoutes.get);
  app.post('/:dbname/customer', customerRoutes.post);

  // Invoices //
  app.get('/:dbname/invoices', invoicesRoutes.get);
  app.get('/:dbname/invoice', invoiceRoutes.get);
  app.post('/:dbname/invoice', invoiceRoutes.post);
  app.get('/:dbname/print/invoice', invoiceRoutes.print);

  // Offers //
  app.get('/:dbname/offers', offersRoutes.get);
  app.get('/:dbname/offer', offerRoutes.get);
  app.post('/:dbname/offer', offerRoutes.post);
  app.get('/:dbname/print/offer', offerRoutes.print);

  // Api //
  app.get('/api/:dbname/customers', apiRoutes.getCustomers);
  app.get('/api/:dbname/payments', apiRoutes.getPayments);
  app.get('/api/:dbname/invoices', apiRoutes.getInvoices);
  app.get('/api/:dbname/products', apiRoutes.getProducts);
  app.get('/api/:dbname/offers', apiRoutes.getOffers);

  // ChangeDB //
  app.get('/:dbname', changedbRoutes.get);

  // all other routes 404
  app.get('*', function(req, res) { res.render('404', { title: "Page Not Found"}); });
};
