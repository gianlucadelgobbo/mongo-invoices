var http = require('http');
var jQuery = require('jQuery');

var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;

var host = process.env['MONGO_NODE_DRIVER_HOST'] != null ? process.env['MONGO_NODE_DRIVER_HOST'] : 'localhost';
var port = process.env['MONGO_NODE_DRIVER_PORT'] != null ? process.env['MONGO_NODE_DRIVER_PORT'] : Connection.DEFAULT_PORT;

var fs = require('fs');
var path = require("path");  
var url = require("url");
// this is what we needed to do now
var path = ('http://ipb.flyer.it/api/explore?radius=5&ll=41.8988101,12.5199406');

function getData() {
	var r = jQuery.ajax({
	  	url:path,
	  	dataType:'json',
	  	success: function(data) {
			console.log("Connecting to " + host + ":" + port);
			var server = new Server(host, port, {});
			console.log(server);
			var db = new Db('paginebaby', server, {native_parser:false});
			console.log(db);
	  		console.log(data.data.length);
			insertData(db,'places',data.data)
	  	}
	});
}


/*
var fileContents = fs.readFileSync(path,'utf8'); 
console.log(fileContents);
var schema = JSON.parse(fileContents); 
console.log('loadJSONfile:', fileContents);

console.log("Connecting to " + host + ":" + port);
var server = new Server(host, port, {});
console.log(server);
var db = new Db('paginebaby', server, {native_parser:false});
console.log(db);
insertData(db,'places',myData)
*/
function insertData(db,t,d) {
	db.open(function(err, db) {
		db.collection(t, function(err, collection) {      
	    	collection.remove({}, function(err, result) {});
			// Insert 3 records
			for(var item in d) {
				//d[item].loc = [d[item].lng,d[item].lat];
				d[item].loc = { lon : parseFloat(d[item].lng), lat: parseFloat(d[item].lat) };
				d[item].cat = d[item].cat.split(",");
				d[item].date_new = new Date(d[item].date_new);
				d[item].date_edit = new Date(d[item].date_edit);
				collection.insert(d[item]);
			}
			
			collection.count(function(err, count) {
				console.log("There are " + count + " records in the test collection. Here they are:");
					collection.find(function(err, cursor) {
						cursor.each(function(err, item) {
							if(item != null) {
								//console.log(item);
								console.log("Created at " + new Date(item._id.generationTime) + "\n")
							}
					});
				});          
			});
		});      
	});
}
/*
center = [12.5156696,41.8980429]
radius = .1
db.places.find({"loc" : {"$within" : {"$center" : [center, radius]}}}).length()
db.places.find({"loc" : {"$within" : {"$center" : [[12.5156696,41.8980429], .00001]}}},{loc:'1',name:'1'})
*/
function getData2() {
	console.log("Cazzo");
	db.open(function(err, db) {
	  db.dropDatabase(function(err, result) {
	    db.collection('test', function(err, collection) {      
	      // Erase all records from the collection, if any
	      collection.remove({}, function(err, result) {
	        // Insert 3 records
	        for(var i = 0; i < 3; i++) {
	          collection.insert({'a':i});
	        }
	        
	        collection.count(function(err, count) {
	          console.log("There are " + count + " records in the test collection. Here they are:");
	
	          collection.find(function(err, cursor) {
	            cursor.each(function(err, item) {
	              if(item != null) {
	                console.dir(item);
	                console.log("created at " + new Date(item._id.generationTime) + "\n")
	              }
	              // Null signifies end of iterator
	              if(item == null) {                
	                // Destory the collection
	                collection.drop(function(err, collection) {
	                  db.close();
	                });
	              }
	            });
	          });          
	        });
	      });      
	    });
	  });
	});
	return "Cazzo";
}
getData();
