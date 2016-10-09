var helpers = require('./../helpers/helpers');

exports.get = function get(req, res) {
  res.send('stocazzoooooooooooo');
};
exports.post = function post(req, res) {
  console.log("server1");
  if(req.session.user) {
    console.log("server2");
    console.log(req.body);
    //if (auth) {
      var email = require('emailjs');

      var server = email.server.connect({
        host 	    : global._config.emailDispatcher.host,
        user 	    : global._config.emailDispatcher.user,
        password    : global._config.emailDispatcher.password,
        ssl: true
      });
      console.log("server3");
      console.log(global._config.emailDispatcher);
      server.send({
        text: req.body.text,
        from: global._config.emailDispatcher.sendername+' <'+ global._config.emailDispatcher.senderemail + ">",
        to: req.body.to_name+'<'+req.body.to_email+'>',
        cc: '',
        subject: req.body.subject,
        attachment: [
          {data:req.body.text, alternative:true},
          {path:req.body.folderfile, type:"application/pdf", name:req.body.file}
        ]
      }, function (err, message) {
        console.log("wilson");
        console.log(err || message);
        if (err) {
          console.log("err");
          console.log(err.toString());
          res.send(err.toString());
        } else {
          res.send(false);
        }

      });
    //} else {
    //res.redirect('/?from='+req.url);
    //}
  }
};
