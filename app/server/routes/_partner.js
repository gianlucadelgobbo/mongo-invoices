var ObjectID = require('mongodb').ObjectID;
var DB = require('../helpers/db-manager');
var CT = require('../helpers/country-list');
var helpers = require('../helpers/helpers');

exports.get = function get(req, res) {
  helpers.canIseeThis(req, function (auth) {
    if (auth) {
      if (req.query.id) {
        DB.partners.findOne({_id:new ObjectID(req.query.id)}, function(e, result) {
          if (!result.contacts) result.contacts = [];
          res.render('partner', { title: __("Partner"), countries : CT, country : global._config.company.country, result : result , udata : req.session.user });
        });
      } else {
        res.render('partner', { title: __("Partner"), countries : CT, country : global._config.company.country, result : {address:{}, contacts:[]}, udata : req.session.user });
      }
    } else {
      res.redirect('/?from='+req.url);
    }
  });
};

exports.post = function post(req, res) {
  helpers.canIseeThis(req, function (auth) {
    if (auth) {
      helpers.validateFormPartner(req.body, function(e, o) {
        if (e.length) {
          if (req.body.ajax) {
            res.status(200).send({msg:{e:e}});
          } else {
            res.render('partner', { title: __("Partner"), countries : CT, country : global._config.company.country, result : o, msg:{e:e}, udata : req.session.user });
          }
        } else {
          if (req.body.id) {
            var id = req.body.id;
            DB.update_partner(o, function(o){
              var e = [];
              if (!o) e.push({name:"", m:__("Error updating partner")});
              if (e.length) {
                if (req.body.ajax) {
                  res.status(200).send({msg:{e:e}});
                } else {
                  o._id = o.id;
                  res.render('partner', { title: __("Partner"), countries : CT, country : global._config.company.country, result : o, msg:{e:e}, udata : req.session.user });
                }
              } else {
                e.push({m:__("Partner saved with success")});
                if (req.body.ajax) {
                  res.status(200).send({msg:{c:e}});
                } else {
                  DB.partners.findOne({_id:new ObjectID(id)},function(err, result) {
                    res.render('partner', { title: __("Partner"), countries : CT, country : global._config.company.country, result : result, msg:{c:e}, udata : req.session.user });
                  });
                }
              }
            });
          } else {
            DB.insert_partner(req.body, function(e, o){
              e = [];
              if (!o){
                e.push({name:"",m:__("Error updating partner")});
              }
              if (e.length) {
                if (req.body.ajax) {
                  res.status(200).send({msg:{e:e}});
                } else {
                  res.render('partner', { title: __("Partner"), countries : CT, country : global._config.company.country, result : o[0], msg:{e:e}, udata : req.session.user });
                }
              } else {
                e.push({name:"",m:__("Partner saved with success")});
                if (req.body.ajax) {
                  res.status(200).send({msg:{c:e,redirect:"/"+global.settings.dbName+"/partner?id="+ o._id}});
                } else {
                  DB.partners.findOne({_id:o[0]._id},function(err, result) {
                    res.render('partner', { title: __("Partner"), countries : CT, country : global._config.company.country, result : result, msg:{c:e}, udata : req.session.user });
                  });
                }
              }
            });
          }
        }
      });
    } else {
      res.redirect('/?from='+req.url);
    }
  });
};
