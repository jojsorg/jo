/**
	joYQL
	=====
	
	A joDataSource geared for YQL RESTful JSON calls. YQL is like SQL, but for cloud
	services. Pretty amazing stuff:
	
	> The Yahoo! Query Language is an expressive SQL-like language that lets you query,
	> filter, and join data across Web services. With YQL, apps run faster with fewer lines of
	> code and a smaller network footprint.
	>
	> Yahoo! and other websites across the Internet make much of their structured data
	> available to developers, primarily through Web services. To access and query these
	> services, developers traditionally endure the pain of locating the right URLs and
	> documentation to access and query each Web service.
	>
	> With YQL, developers can access and shape data across the Internet through one
	> simple language, eliminating the need to learn how to call different APIs.

	[Yahoo! Query Language Home](http://developer.yahoo.com/yql/)
	
	Use
	---
	
	A simple one-shot use would look like:
	
		// setup our data source
		var yql = new joYQL("select * from rss where url='http://davebalmer.wordpress.com'");
		
		// subscribe to load events
		yql.loadEvent.subscribe(function(data) {
			joLog("received data!");
		});

		// kick off our call
		yql.exec();
	
	A more robust example with parameters in the query could look something
	like this:
	
		// quick/dirty augmentation of the setQuery method
		var yql = new joYQL();
		yql.setQuery = function(feed, limit) {
			this.query = "select * from rss where url='"
				+ feed + "' limit " + limit
				+ " | sort(field=pubDate)";
		};
		
		// we can hook up a list to display the results
		var list = new joList(yql).attach(document.body);
		list.formatItem = function(data, index) {
			var html = new joListItem(data.title + " (" + data.pubDate + ")", index);
		};
		
		// later, we make our call with our parameters
		yql.exec("http://davebalmer.wordpress.com", 10);
	
	Methods
	-------
	- `setQuery()`
	
	  Designed to be augmented, see the example above.
	
	- `exec()`
	
	Extends
	-------
	
	- joDataSource

*/

joYQL = function(query,itemPath) {
	joDataSource.call(this);

	this.setQuery(query);
	this.setItemPath(itemPath);
};
joYQL.extend(joDataSource, {
	baseurl: 'http://query.yahooapis.com/v1/public/yql?',
	format: 'json',
	query: '',
	
	exec: function() {
		var get = this.baseurl + "q=" + encodeURIComponent(this.query)
			+ "&format=" + this.format + "&callback=" + joDepot(this.load, this);

		joScript(get, this.callBack, this);
		
		return this;
	},
	
	setItemPath: function(itemPath) {
		this.itemPath = itemPath;
	},
	
	load: function(data) {
		
		if (this.itemPath) {
			data.query.results.item = function (p, o) {
				var p = p.split(".");
				for(var i = 0; i < p.length; i++)
					o = (o.hasOwnProperty(p[i])) ? o[p[i]] : undefined;
				return o;
			}(this.itemPath,data.query.results);
		}
				
		var results = data.query && data.query.results && data.query.results.item;
		
		if (!results)
			this.errorEvent.fire(data);
		else {
			this.data = results;
			this.changeEvent.fire(results);
		}
		
		return this;
	},
	
	callBack: function(error) {
		if (error)
			this.errorEvent.fire();
	}
});


/*
	Used by joYQL for RESTful calls, may be abstracted into
	a restful superclass, but that will be dependant on a
	callback paramter as well.
*/
joDepotCall = [];
joDepot = function(call, context) {
	joDepotCall.push(handler);
		
	function handler(data) {
		if (context)
			call.call(context, data);
		else
			call(data);
	}
	
	return "joDepotCall[" + (joDepotCall.length - 1) + "]";
};
