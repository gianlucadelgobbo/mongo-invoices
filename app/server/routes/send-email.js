var helpers = require('./../helpers/helpers');

exports.get = function get(req, res) {
  res.send('stocazzoooooooooooo');
};
exports.post = function post(req, res) {
  if(req.session.user) {
    //if (auth) {
      var email = require('emailjs');

      var server = email.server.connect({
        host 	    : global._config.emailDispatcher.host,
        user 	    : global._config.emailDispatcher.user,
        password    : global._config.emailDispatcher.password,
        ssl: true
      });
      server.send({
        text: req.body.text,
        from: global._config.emailDispatcher.sendername+' <'+ global._config.emailDispatcher.senderemail + ">",
        to: req.body.to_name+'<'+req.body.to_email+'>',
        cc: '',
        subject: req.body.subject,
        attachment: [
          {data:req.body.text.replace(/(?:\r\n|\r|\n)/g, '<br />'), alternative:true},
          {path:req.body.folderfile, type:"application/pdf", name:req.body.file}
        ]
      }, function (err, message) {
        if (err) {
          res.send(err.smtp);
        } else {
          res.send(false);
        }

      });
    //} else {
    //res.redirect('/?from='+req.url);
    //}
  }
};
