var indexRoutes = require('./routes/index');
var logoutRoutes = require('./routes/logout');
var homeRoutes = require('./routes/home');
var accountsRoutes = require('./routes/accounts');
var accountRoutes = require('./routes/account');
var lostPasswordRoutes = require('./routes/lost-password');
var resetPasswordRoutes = require('./routes/reset-password');
var clientsRoutes = require('./routes/clients');
var clientRoutes = require('./routes/client');
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
  app.get('/home', homeRoutes.get);

  // Accounts //
  app.get('/accounts', accountsRoutes.get);
  app.get('/account', accountRoutes.get);
  app.post('/account', accountRoutes.post);

  // password reset //
  app.post('/lost-password', lostPasswordRoutes.post);
  app.get('/reset-password', resetPasswordRoutes.get);
  app.post('/reset-password', resetPasswordRoutes.post);

  // Clients //
  app.get('/clients', clientsRoutes.get);
  app.get('/client', clientRoutes.get);
  app.post('/client', clientRoutes.post);

  // Invoices //
  app.get('/invoices', invoicesRoutes.get);
  app.get('/invoice', invoiceRoutes.get);
  app.post('/invoice', invoiceRoutes.post);
  app.get('/print/invoice', invoiceRoutes.print);

  // Offers //
  app.get('/offers', offersRoutes.get);
  app.get('/offer', offerRoutes.get);
  app.post('/offer', offerRoutes.post);
  app.get('/print/offer', offerRoutes.print);

  // Api //
  app.get('/api/clients', apiRoutes.getClients);
  app.get('/api/payments', apiRoutes.getPayments);
  app.get('/api/invoices', apiRoutes.getInvoices);
  app.get('/api/products', apiRoutes.getClients);

  // all other routes 404
  app.get('*', function(req, res) { res.render('404', { title: __("Page Not Found")}); });
};
