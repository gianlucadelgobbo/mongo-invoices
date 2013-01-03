exports.get = function get(req, res) {
		res.clearCookie('user');
		res.clearCookie('pass');
		res.clearCookie('role');
		req.session.destroy(function(e){
      res.redirect('/');
    });
};
