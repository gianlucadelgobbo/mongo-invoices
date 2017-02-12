var bcrypt = require('bcrypt-nodejs');
var ObjectID = require('mongodb').ObjectID;
var accounting = require('accounting');
var DBusers = require('./db-users-manager');
var DB = require('./db-manager');
var Validators = require('../../common/validators').Validators;
var request = require('request');

exports.canIseeThis = function canIseeThis(req,callback) {
  global.settings.currenturl = req.url;
  if(req.session.user == null) {
    callback(false);
  } else if(req.params.dbname && req.session.user.dbs.indexOf(req.params.dbname)==-1) {
    callback(false);
  } else if(req.params.dbname && global.settings.dbName != req.params.dbname) {
    var index = req.session.user.dbs.indexOf(req.params.dbname);
    global.settings.dbName = req.session.user.companies[index].dbname;
    global.settings.companyName = req.session.user.companies[index].companyname;
    DB.init(function () {
      callback(true);
    });
  } else if(req.params.dbname && global.settings.dbName == req.params.dbname) {
    callback(true);
  //} else if(global.settings.dbName) {
  //  callback(true);
  } else {
    callback(false);
  }
};
exports.getChannels = function getChannels(result, project) {
  var channels = [];
  if (result) {
    for(var x in result) {
      //console.log(x);

      var pp;
      for (var partnership in result[x].partnerships) {
        if (result[x].partnerships[partnership].name == project) pp = result[x].partnerships[partnership];
        //console.log(result[x].partnerships[partnership].name + " - " + project);
      }
      //console.log(pp);
      for (var channel in result[x].channels) {
        var channel_ins = {};
        channel_ins._id = result[x]._id;
        channel_ins.brand = result[x].brand;
        channel_ins.group = pp.group;
        channel_ins.status = pp.status;
        channel_ins.type = result[x].channels[channel].type;
        channel_ins.profilename = result[x].channels[channel].profilename;
        channel_ins.id = result[x].channels[channel].id;
        channel_ins.url = result[x].channels[channel].url;
        channels.push(channel_ins);
      }
    }
  }
  return channels;
};

exports.generateDBs = function generateDBs(o) {
  var res = [];
  for (var a=0;a<o.companies.length;a++) {
    if (o.companies[a].dbname) res.push(o.companies[a].dbname);
  }
  return res;
}
// Forms validators //
exports.validateFormLogin = function validateFormLogin(o,callback) {
  var e = [];
  DBusers.users.findOne({user:o.user}, function(err, result) {
    if (result == null){
      e.push({name:"user",m:__("User not found")});
      callback(e, o);
    } else {
      bcrypt.compare(o.pass, result.pass, function(err, res) {
        if (!res) e.push({name:"pass",m:__("Invalid password")});
        callback(e, result);
      });
    }
  });
};

exports.validateFormAccount = function validateFormAccount(o,callback) {
  var e = [];
  var companies = [];
  if (o.companies) {
    for (var a=0;a<o.companies.length;a++) {
      //if (o.companies[a].dbname){
        if (!Validators.validateStringLength(o.companies[a].companyname, 3, 100)){
          e.push({name:"name",m:__("Please enter a valid Company Name")});
        }
        if (typeof o.companies[a].dbname=="undefined"){
          e.push({name:"name",m:__("Please enter a valid DB Name")});
        } else  if (!Validators.validateStringLength(o.companies[a].dbname, 3, 100)){
          e.push({name:"name",m:__("Please enter a valid DB Name")});
        }
      //} else {
      //  o.companies.splice(a, 1);;
      //}
    }
  } else {
    e.push({name:"name",m:__("Please enter a valid Company Name")});
  }
  if (!Validators.validateStringLength(o.name, 3, 100)){
    e.push({name:"name",m:__("Please enter a valid Name")});
  }
  if (typeof o.country === "undefined" || !Validators.validateStringLength(o.country, 3, 50)){
    e.push({name:"country",m:__("Please enter a Country")});
  }
  if (!settings.roles[o.role]){
    e.push({name:"role",m:__("Please enter a valid Role")});
  }
  if (((o.id && o.pass !== "") || !o.id) && !Validators.validateStringLength(o.pass, 3, 50)){
    e.push({name:"pass",m:__("Please enter a valid Password")});
  }
  if (((o.id && o.user!=="") || !o.id) && !Validators.validateStringLength(o.user, 3, 50)){
    e.push({name:"user",m:__("Please enter a valid Username")});
  }
  if(!Validators.validateEmail(o.email)){
    e.push({name:"email",m:"Email is not email"});
    callback(e, o);
  } else {
    var q = (o.id ? {_id:{$ne: new ObjectID(o.id)},email:o.email} : {email:o.email});
    DBusers.users.findOne(q ,function(err, result) {
      if (result) {
        e.push({name:"email",m:__("Email already used from another account")});
        callback(e, o);
      } else {
        var q = (o.id ? {_id:{$ne: new ObjectID(o.id)},user:o.user} : {user:o.user});
        DBusers.users.findOne(q, function(err, result) {
          if (result){
            e.push({name:"email",m:__("Username already in use")});
          }
          callback(e, o);
        });
      }
    });
  }
};

exports.formatMoney = function formatMoney(result) {
  accounting.settings = global._config.accountingSettings;
  result.subtotal=accounting.formatMoney(result.subtotal);
  result.vat_amount=accounting.formatMoney(result.vat_amount);
  result.shipping_costs=accounting.formatMoney(result.shipping_costs);
  result.total=accounting.formatMoney(result.total);
  for (var item in result.items) {
    if (result.items[item]) {
      result.items[item].price=accounting.formatMoney(result.items[item].price);
      result.items[item].amount=accounting.formatMoney(result.items[item].amount);
    }
  }
  return result;
};

exports.formatMoneyList = function formatMoneyList(result) {
  var res = [];
  for (var item in result) {
    res.push(this.formatMoney(result[item]));
  }
  return res;
};


exports.validateFormPartner = function validateFormPartner(o,callback) {
  var e = [];
  if (!Validators.validateStringLength(o.name, 3, 100)){
    e.push({name:"name",m:__("Please enter a valid Action name")});
  }
  callback(e, o);
};

exports.validateFormAction = function validateFormAction(o,callback) {
  var e = [];
  if (!Validators.validateStringLength(o.name, 3, 100)){
    e.push({name:"name",m:__("Please enter a valid Action name")});
  }
  callback(e, o);
};


exports.validateFormCustomer = function validateFormCustomer(o,callback) {
  var e = [];
  if (!Validators.validateStringLength(o.name, 3, 100)){
    e.push({name:"name",m:__("Please enter a valid Customer")});
  }
  if (o.force != 1) {
    if (!Validators.validateStringLength(o.address.street, 3, 100)){
      e.push({name:"address[street]",m:__("Please enter a valid Street")});
    }
    if (!Validators.validateStringLength(o.address.zipcode, 3, 20)){
      e.push({name:"address[zipcode]",m:__("Please enter a valid ZIP code")});
    }
    if (!Validators.validateStringLength(o.address.city, 3, 50)){
      e.push({name:"address[city]",m:__("Please enter a valid City")});
    }
    if (!Validators.validateStringLength(o.address.country, 3, 50)){
      e.push({name:"address[country]", m:__("Please enter a valid Country")});
    }
    if (global._config.company.country == "Italy" && o.address.country == "Italy") {
      if (o.vat_number) e = e.concat(Validators.checkVAT(o.vat_number,o.address.country));
      if (o.fiscal_code != o.vat_number || o.fiscal_code=="") {
        e = e.concat(Validators.checkCF(o.fiscal_code));
      }
    }
  }
  if (e){
    callback(e, o);
  } else {
    var q = (o.id ? {_id:{$ne: new ObjectID(o.id)},vat_number:o.vat_number} : {vat_number:o.vat_number});
    DB.accounts.findOne(q ,function(err, result) {
      if (result) {
        e.push({name:"vat_number",m:__("VAT number already in use")});
        callback(e, o);
      } else {
        if (global._config.company.country == "Italy" && o.address.country == "Italy"){
          //var q = (o.id ? {_id:{$ne: new ObjectID(o.id)},fiscal_code:o.fiscal_code} : {fiscal_code:o.fiscal_code});
          DB.accounts.findOne({user:o.user}, function(err, result) {
            if (result){
              e.push({name:"fiscal_code",m:__("Fiscal code already in use")});
            }
            callback(e, o);
          });
        } else {
          callback(e, o);
        }
      }
    });
  }
};




exports.getPartners = function getPartners(callback) {
  //var mainList = loadJsonFileAjaxSync("https://spreadsheets.google.com/feeds/list/1sAqX96AjK69cTkZPkKBXG29dMNVSULnzntoTwCdJ2no/1/public/values?alt=json", "application/json", 0);
  request("https://spreadsheets.google.com/feeds/list/1UfH2Dzk1lcUqW2kTds-OAWzFswHZKaqHN0MaGr7xVOY/1/public/values?alt=json", function (error, response, body) {
    //console.log(error);
    if (!error && response.statusCode == 200) {
      var mainList = JSON.parse(body);
      console.log("getData");
      console.log(mainList.feed.entry.length);
      var partners = [];
      var status = "ACTIVE";
      for (var row in mainList.feed.entry) {
        var partner = {
          brand :	mainList.feed.entry[row].gsx$brand.$t ? mainList.feed.entry[row].gsx$brand.$t : "",
          legalentity :	mainList.feed.entry[row].gsx$legalentity.$t ? mainList.feed.entry[row].gsx$legalentity.$t : "",
          delegate :	mainList.feed.entry[row].gsx$delegate.$t ? mainList.feed.entry[row].gsx$delegate.$t : "",
          selecta :	mainList.feed.entry[row].gsx$selecta.$t ? mainList.feed.entry[row].gsx$selecta.$t : "",
          satellite :	mainList.feed.entry[row].gsx$sat.$t ? mainList.feed.entry[row].gsx$sat.$t : "",
          event :	mainList.feed.entry[row].gsx$event.$t ? mainList.feed.entry[row].gsx$event.$t : "",
          country :	mainList.feed.entry[row].gsx$country.$t ? mainList.feed.entry[row].gsx$country.$t : "",
          description :	mainList.feed.entry[row].gsx$description.$t ? mainList.feed.entry[row].gsx$description.$t : "",
          address :	mainList.feed.entry[row].gsx$address.$t ? mainList.feed.entry[row].gsx$address.$t : "",
          type :	 mainList.feed.entry[row].gsx$type.$t ? mainList.feed.entry[row].gsx$type.$t : "",
          websites : mainList.feed.entry[row].gsx$website.$t ? [mainList.feed.entry[row].gsx$website.$t] : [],
          contacts : [],
          partnerships : [],
          channels : []
        };
        if (mainList.feed.entry[row].gsx$lpm2017.$t=="X")
        partner.partnerships.push({
          name:"LPM-2017",
          status:mainList.feed.entry[row].gsx$status.$t ? mainList.feed.entry[row].gsx$status.$t : "",
          group:mainList.feed.entry[row].gsx$group.$t,
          notes:mainList.feed.entry[row].gsx$notes.$t ? mainList.feed.entry[row].gsx$notes.$t : ""
        });
        if (mainList.feed.entry[row].gsx$lcf2017.$t=="X")
        partner.partnerships.push({
          name:"LCF-2017",
          status:mainList.feed.entry[row].gsx$status.$t ? mainList.feed.entry[row].gsx$status.$t : "",
          group:mainList.feed.entry[row].gsx$group.$t,
          notes:mainList.feed.entry[row].gsx$notes.$t ? mainList.feed.entry[row].gsx$notes.$t : ""
        });
        if (mainList.feed.entry[row].gsx$lpmpast.$t=="X")
          partner.partnerships.push({
            name:"LPM-Past",
            status:mainList.feed.entry[row].gsx$status.$t ? mainList.feed.entry[row].gsx$status.$t : "",
            group:mainList.feed.entry[row].gsx$group.$t,
            notes:mainList.feed.entry[row].gsx$notes.$t ? mainList.feed.entry[row].gsx$notes.$t : ""
          });
        if (mainList.feed.entry[row].gsx$lcfpast.$t=="X")
          partner.partnerships.push({
            name:"LCF-Past",
            status:mainList.feed.entry[row].gsx$status.$t ? mainList.feed.entry[row].gsx$status.$t : "",
            group:mainList.feed.entry[row].gsx$group.$t,
            notes:mainList.feed.entry[row].gsx$notes.$t ? mainList.feed.entry[row].gsx$notes.$t : ""
          });
        if (mainList.feed.entry[row].gsx$avnode.$t=="X")
          partner.partnerships.push({
            name:"AVnode",
            status:mainList.feed.entry[row].gsx$status.$t ? mainList.feed.entry[row].gsx$status.$t : "",
            group:mainList.feed.entry[row].gsx$group.$t,
            notes:mainList.feed.entry[row].gsx$notes.$t ? mainList.feed.entry[row].gsx$notes.$t : ""
          });
        if (mainList.feed.entry[row].gsx$lpm1518.$t=="X")
          partner.partnerships.push({
            name:"LPM_15-18",
            status:mainList.feed.entry[row].gsx$status.$t ? mainList.feed.entry[row].gsx$status.$t : "",
            group:mainList.feed.entry[row].gsx$group.$t,
            notes:""
          });
        if (mainList.feed.entry[row].gsx$email.$t || mainList.feed.entry[row].gsx$phone.$t) partner.contacts.push({
          name: mainList.feed.entry[row].gsx$name.$t,
          surname: mainList.feed.entry[row].gsx$surname.$t,
          email: mainList.feed.entry[row].gsx$email.$t,
          phone: mainList.feed.entry[row].gsx$phone.$t,
          lang: mainList.feed.entry[row].gsx$lang.$t,
          types: ["Contact"]
        });
        if (mainList.feed.entry[row].gsx$ccemail.$t || mainList.feed.entry[row].gsx$ccphone.$t) partner.contacts.push({
          name: mainList.feed.entry[row].gsx$ccname.$t,
          surname: mainList.feed.entry[row].gsx$ccsurname.$t,
          email: mainList.feed.entry[row].gsx$ccemail.$t,
          phone: mainList.feed.entry[row].gsx$ccphone.$t,
          lang: mainList.feed.entry[row].gsx$lang.$t,
          types: ["Head Master"]
        });
        partners.push(partner);
      }
      console.log(partners.length);
      request("https://spreadsheets.google.com/feeds/list/1UfH2Dzk1lcUqW2kTds-OAWzFswHZKaqHN0MaGr7xVOY/2/public/values?alt=json", function (error, response, body) {
        console.log("getData");
        var subList = JSON.parse(body);
        //console.log(subList);
        for (var row in subList.feed.entry) {
          console.log(subList.feed.entry[row].gsx$partner.$t);
          var trovato = false;
          for (var item in partners) {
            //console.log("confronto");
            //console.log("##"+subList.feed.entry[row].gsx$partner.$t+"## - ##"+partners[item].brand+"##");
            if (partners[item].brand == subList.feed.entry[row].gsx$partner.$t) {
              partners[item].channels.push({
                profilename: subList.feed.entry[row].gsx$profilename.$t,
                type: subList.feed.entry[row].gsx$type.$t,
                url: subList.feed.entry[row].gsx$url.$t,
                id: subList.feed.entry[row].gsx$id.$t

              });
              trovato = true;
            }
          }
          console.log((trovato ? "TROVATO: " : "NON TROVATO: ")+subList.feed.entry[row].gsx$partner.$t);
        }
        /*for (var row in subList.feed.entry) {
         for (var item in partners) {
         if (partners[item].brand == subList.feed.entry[row].gsx$partner.$t) {
         console.log("TROVATO " + partners[item].brand);
         } else {
         console.log("NON TROVATO "+partners[item].brand);
         }
         }
         }*/

        console.log("Partners");
        console.log(partners);
        callback(partners);
      });
    }
  });

}

