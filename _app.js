//forever -m 5 /sites.local/node/app.js

var http = require('http');
var qs = require('querystring');
var url = require("url");

var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;

var host = 'localhost';
var port = 8000;
//}).listen(8000, "77.43.86.242");

var host_db = process.env['MONGO_NODE_DRIVER_HOST'] != null ? process.env['MONGO_NODE_DRIVER_HOST'] : 'localhost';
var port_db = process.env['MONGO_NODE_DRIVER_PORT'] != null ? process.env['MONGO_NODE_DRIVER_PORT'] : Connection.DEFAULT_PORT;

var server = new Server(host_db, port_db, {});
var date = new Date();
var start = date.getTime();
//console.log(server);
var db = new Db('paginebaby', server, {native_parser:false});
db.open(function(err, db) {});

// start server
http.createServer(function(req, res) {
    res.writeHead(200);
    console.log(req.method);
    if(req.method=='GET' || req.method=='POST') {
	    if(req.method=='POST') {
	        var body='';
	        req.on('data', function (data) {
	            body +=data;
	        });
	        req.on('end',function(){
	            
	            var POST =  qs.parse(body);
	            console.log(POST);
	        });
			res.end("bella POST");
	    }
	    if(req.method=='GET') {
	        var url_parts = url.parse(req.url,true);
	        var GET =  url_parts.query;
		    if (GET.ll) {
		        var c = GET.ll.toString().split(',');
		        var center = [parseFloat(c[1]),parseFloat(c[0])];
		        var radius = parseFloat(GET.radius);
		        
		        //var q='Policlinico';
		        //var cat = '|311|371|';
		        var query = {geoNear : "places", near : center, maxDistance : radius, num:50000};
		        //query.query = {skip:0, limit:50};
		        //query.query = {num:50};
		        if (GET.cat || GET.q) query.query = {};
		        if (GET.cat) query.query.cat = GET.cat;
		        if (GET.q) {
			        var reg = new RegExp( ".*"+GET.q+".*", "gi");
		//	        var reg = new RegExp( "."+GET.q+".", "gi");
		        	query.query.$or = [{name:reg},{txt:reg}];
		        }
		        db.executeDbCommand(query, function(err, result) {
		        	var date = new Date();
		        	var end = date.getTime();
		        	var speed = end-start;
		        	var db_speed = {start:start,end:end,speed:speed}; 
					result.stats = db_speed;
					
		        	res.end(JSON.stringify(result));
		        	console.log(db_speed);
		        	console.log(result.documents[0].results.length);
          			//db.close();
					//res.end("bella");
		        }); 
		        
		/*
				db.collection('places', function(err, collection) {      
					collection.find({"loc" : {"$within" : {"$center" : [center, radius]}}},{loc:'1',name:'1'}).toArray(function(err, docs) {
					    res.end(JSON.stringify(docs));
						//console.log(docs);
					});;          
				});      
		*/
		    } else {
			    res.end("bella GET");
			}
	    }
	} else {
	    res.end("bella NONE");
	}
}).listen(port, host);
//console.log('Server listening on http://'+host+':' + port);