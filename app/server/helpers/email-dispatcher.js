
var EM = {};
module.exports = EM;
if (global._config.emailDispatcher && global._config.emailDispatcher.host && global._config.emailDispatcher.password){
	EM.server = require("emailjs/email").server.connect({
		host 	    : global._config.emailDispatcher.host,
		user 	    : global._config.emailDispatcher.user,
		password    : global._config.emailDispatcher.password,
		ssl		    : true
	});

	EM.dispatchResetPasswordLink = function(account, host, callback) {
		EM.server.send({
			from         : global._config.emailDispatcher.sendername+" <"+global._config.emailDispatcher.senderemail+">",
			to           : account.email,
			subject      : 'Password Reset',
			text         : 'something went wrong... :(',
			attachment   : EM.composeEmail(account, host)
		}, callback );
	}

	EM.composeEmail = function(o,host) {
		var emailencoded = new Buffer(o.email).toString('base64');
		var link = 'http://'+host+'/reset-password?e='+emailencoded;
		var html = "<html><body>";
		html += "Hi "+o.name+",<br><br>";
		html += "Your username is: <b>"+o.user+"</b><br><br>";
		html += "<a href='"+link+"'>"+__("Please click here to reset your password")+"</a><br><br>";
		html += "Cheers,<br>";
		html += "<a href='http://"+host+"'>"+host+"</a><br><br>";
		html += "</body></html>";
		return  [{data:html, alternative:true}];
	}
}
