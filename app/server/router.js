var indexRoutes = require('./routes/index');
var changedbRoutes = require('./routes/changedb');
var startupRoutes = require('./routes/startup');
var sendemailRoutes = require('./routes/send-email');
var logoutRoutes = require('./routes/logout');
var homeRoutes = require('./routes/home');
var accountsRoutes = require('./routes/users');
var accountRoutes = require('./routes/user');
var settingsRoutes = require('./routes/settings');
var lostPasswordRoutes = require('./routes/lost-password');
var resetPasswordRoutes = require('./routes/reset-password');
var customersRoutes = require('./routes/customers');
var partnersRoutes = require('./routes/partners');
var invoicesRoutes = require('./routes/invoices');
var invoiceRoutes = require('./routes/invoice');
var offerRoutes = require('./routes/offer');
var offersRoutes = require('./routes/offers');
var apiRoutes = require('./routes/api');
var errorsRoutes = require('./routes/errors');
var ajaxRoutes = require('./routes/ajax');

module.exports = function(app) {
  // Log In //
  app.get('/', indexRoutes.get);
  app.post('/', indexRoutes.post);

  // AJAX
  app.get('/ajax/drawFBPostActivities', ajaxRoutes.drawFBPostActivities);
  app.post('/ajax/drawFBPostActivities', ajaxRoutes.drawFBPostActivities);
  app.get('/ajax/drawTWPostActivities', ajaxRoutes.drawTWPostActivities);
  app.post('/ajax/drawTWPostActivities', ajaxRoutes.drawTWPostActivities);

  // Log Out //
  app.get('/logout', logoutRoutes.get);

  // Api //
  //app.get('/api/partners', apiRoutes.getPartners);
  app.get('/api/accounting/customers', apiRoutes.getCustomers);
  app.get('/api/accounting/payments', apiRoutes.getPayments);
  app.get('/api/accounting/invoices', apiRoutes.getInvoices);
  app.get('/api/accounting/products', apiRoutes.getProducts);
  app.get('/api/accounting/offers', apiRoutes.getOffers);

  // Logged-in redirect / homepage //
  app.get('/:dbname/home', homeRoutes.get);

  // ChangeDB //
  app.get('/startup', startupRoutes.get);
  app.post('/startup', startupRoutes.post);

  // SendMail //
  app.get('/sendemail', sendemailRoutes.get);
  app.post('/sendemail', sendemailRoutes.post);

  // password reset //
  app.post('/lost-password', lostPasswordRoutes.post);
  app.get('/reset-password', resetPasswordRoutes.get);
  app.post('/reset-password', resetPasswordRoutes.post);

  // Settings //
  app.get('/:dbname/settings', settingsRoutes.get);
  app.post('/:dbname/settings', settingsRoutes.post);

  // Accounts //
  app.get('/:dbname/accounts', accountsRoutes.get);
  app.get('/:dbname/account', accountRoutes.get);
  app.post('/:dbname/account', accountRoutes.post);

  // Partners //
  app.get('/:dbname/partners', partnersRoutes.getPartners);
  app.get('/:dbname/partners/partner/new', partnersRoutes.newPartner);
  app.post('/:dbname/partners/partner/new', partnersRoutes.setPartner);
  app.get('/:dbname/partners/partner/:partner', partnersRoutes.getPartner);
  app.get('/:dbname/partners/partner/:partner/edit', partnersRoutes.getPartner);
  app.post('/:dbname/partners/partner/:partner/edit', partnersRoutes.setPartner);

  app.get('/:dbname/partners/:project', partnersRoutes.getPartners);
  app.get('/:dbname/partners/:project/channels', partnersRoutes.getPartners);

  app.get('/:dbname/partners/:project/actions', partnersRoutes.getActions);
  //app.get('/:dbname/partners/:project/actions/new', partnersRoutes.getActions);
  app.get('/:dbname/partners/:project/actions/new', partnersRoutes.newAction);
  app.post('/:dbname/partners/:project/actions/new', partnersRoutes.setAction);
  app.get('/:dbname/partners/:project/actions/:action', partnersRoutes.getAction);
  app.get('/:dbname/partners/:project/actions/:action/edit', partnersRoutes.getAction);
  app.post('/:dbname/partners/:project/actions/:action/edit', partnersRoutes.setAction);


  // Customers //
  app.get('/:dbname/accounting/customers', customersRoutes.getAll);
  app.get('/:dbname/accounting/customers/:customer', customersRoutes.get);
  app.post('/:dbname/accounting/customers', customersRoutes.post);

  // Invoices //
  app.get('/:dbname/accounting/invoices', invoicesRoutes.get);
  app.get('/:dbname/accounting/invoice', invoiceRoutes.get);
  app.post('/:dbname/accounting/invoice', invoiceRoutes.post);
  app.get('/:dbname/accounting/print/invoice', invoiceRoutes.print);

  // Offers //
  app.get('/:dbname/accounting/offers', offersRoutes.get);
  app.get('/:dbname/accounting/offer', offerRoutes.get);
  app.post('/:dbname/accounting/offer', offerRoutes.post);
  app.get('/:dbname/accounting/print/offer', offerRoutes.print);

  // ChangeDB //
  app.get('/:dbname', changedbRoutes.get);

  // all other routes 404
  app.get('/:dbname/*', errorsRoutes.get404);
  app.get('*', errorsRoutes.get);
};
