var _config = {
    "locales":			["it","en"],

	"defaultLocale": 	"it",
	"company": {
		"logo":	"/logo.png",
		"name":	"Associazione Culturale Linux Club Italia",
		"row1":	"Associazione Culturale Linux Club Italia<br />Via del Verano 39, 00185 Roma, Italia - t +39.06.78147301 - f +39.06.78390805",
		"row2":	"CF 97318630585 P.IVA 08459281005 - linux-club.org - info@linux-club.org"
	},
	"banks":[
		["POSTE ITALIANE SPA - Ufficio radicamento: 55937 CC intestato a: Associazione Culturale Linux Club Italia - IBAN: IT-37-M-07601-03200-000063473623"]
	],
	"currency":			["€"],
	"vat_perc":	22,
	"accountingSettings":{
		"currency": {
			"symbol" : "",		// default currency symbol is "$"
			"format": "%v",		// controls output: %s = symbol, %v = value/number (can be object: see below)
			"decimal" : ",",	// decimal point separator
			"thousand": ".",	// thousands separator
			"precision" : 2		// decimal places
		},
		"number": {
			"precision" : 2,	// default precision on numbers is 0
			"thousand": ".",
			"decimal" : ","
		}
	},
	"googleAnalytics": "",
	"emailDispatcher": {
		"host"			: 'smtp.gmail.com',
		"user" 			: '',
		"password" 		: '',
		"sendername"	: '',
		"senderemail"	: ''
	}
};
var _roles = {
	"roles":{
		"superadmin": {
			"display_name" : "Super Administrator",
			"superadmin" : true,
			"admin" : true,
			"write": true,
			"read" : true
		},
		"admin": {
			"display_name" : "Administrator",
			"superadmin" : false,
			"admin" : true,
			"write": true,
			"read" : true
		},
		"editor": {
			"display_name" : "Editor",
			"superadmin" : false,
			"admin" : false,
			"write": true,
			"read" : true
		},
		"viewer": {
			"display_name" : "Viewer",
			"superadmin" : false,
			"admin" : false,
			"write": false,
			"read" : true
		}
	}
};
if (typeof exports !== "undefined") exports._config = _config;
if (typeof exports !== "undefined") exports._roles = _roles;
//if (GLOBAL) GLOBAL._config = _config;
//console.log(GLOBAL._config);
