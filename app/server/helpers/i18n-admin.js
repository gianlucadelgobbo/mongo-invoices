var i18nAdmin = require('i18n');

i18nAdmin.init = function(callback) {
  i18nAdmin.configure({
    // setup some locales - other locales default to en silently
    locales:		global.settings.defaultLocales,
    directory: 		global.settings.root_path + '/locales',
    defaultLocale: 	global.settings.defaultLocale,
    // where to register __() and __n() to, might be "global" if you know what you are doing
    register:		global
  });
  callback();
};

module.exports = i18nAdmin;
