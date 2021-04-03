/**
	joFileSource
	============
	
	A special joDataSource which loads and handles a file. This class
	wraps joFile.
	
	Extends
	-------
	
	- `joDataSource`
	
*/
joFileSource = function(url, timeout) {
	this.changeEvent = new joSubject(this);
	this.errorEvent = new joSubject(this);
	
	if (timeout)
		this.setTimeout(timeout);
		
	if (url)
		this.setQuery(url);
};
joFileSource.extend(joDataSource, {
	baseurl: '',
	query: '',
	
	load: function() {
		var get = this.baseurl + this.query;

		joFile(get, this.callBack, this);
		
		return this;
	},
	
	callBack: function(data, error) {
		if (error)
			this.errorEvent.fire(error);
		else
			this.setData(data);
	}
});

/**
	joFile
	======
	
	A utility method which uses XMLHttpRequest to load a text-like file
	from either a remote server or a local file.
	
	> Note that some browsers and mobile devices will *not* allow you to
	> load from just any URL, and some will restrict use with local files
	> especially (I'm looking at you, FireFox).
	>
	> If your aim is to load JavaScript-like data (also, JSON), you may want
	> to look at joScript instead, which uses script tags to accomplish the job.
	
	Calling
	-------
	
		joFile(url, call, context, timeout)
	
	Where
	-----
	
	- `url` is a well-formed URL, or, in most cases, a relative url to a local
	  file

	- `call` is a function to call when the operation completes

	- `context` is an optional scope for the function to call (i.e. value of `this`).
	  You can also ignore this parameter (or pass in `null` and use `Function.bind(this)`
	  instead.

	- `timeout` is an optional parameter which tells joFile to wait, in seconds,
	  for a response before throwing an error.
	- `isPOST` is an optional parameter true if you need to do a post,
	  
	- `formData` parameters in a object to pass to POST,
   
	Use
	---
	
		// simple call with a global callback
		var x = joFile("about.html", App.loadAbout);
		
		// an inline function
		var y = joFile("http://joapp.com/index.html", function(data, error) {
			if (error) {
				console.log("error loading file");
				return;
			}
			
			console.log(data);
		});
*/
joFile = function(url, call, context, timeout, postData) {
	var req = new XMLHttpRequest();

	if (!req)
		return onerror();

	// 30 second default on requests
	if (!timeout)
		timeout = 60 * SEC;
		
	var timer = (timeout > 0) ? setTimeout(onerror, timeout) : null;
	if( postData){
		req.open('POST', url, true);
	}else{
		req.open('GET', url, true);
	}
	req.onreadystatechange = onchange;
	req.onError = onerror;
	if( postData ){
		var parmsStr="" ;
		var parmCount=1;
		for (var key in postData) {
			if (postData.hasOwnProperty(key)) {
				if(parmCount==1){
					parmsStr=key+"="+encodeURIComponent(postData[key]);
				}else{
					parmsStr=parmsStr+"&"+key+"="+encodeURIComponent(postData[key]);
				}
				parmCount++;
			}
		}
		//Send the proper header information along with the request
		req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		req.setRequestHeader("Content-length", parmStr.length);
		req.setRequestHeader("Origin", document.location.origin);
		 
		req .setRequestHeader("Connection", "close");
		req.send(parmsStr);
	}else{ //simple Get
		req.send(null);
	}
	
	function onchange(e) {
		if (timer)
			timer = clearTimeout(timer);

		if (req.readyState == 4)
			handler(req.responseText, 0);
	}
	
	function onerror() {
		handler(null, true);
	}
	
	function handler(data, error) {
		if (call) {
			if (context)
				call.call(context, data, error);
			else
				call(data, error);
		}
	}
};

