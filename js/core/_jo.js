/**
	- - -

	jo
	==

	Singleton which the framework uses to store global infomation. It also is
	responsible for initializing the rest of the framework, detecting your environment,
	and notifying your application when jo is ready to use.
	
	Methods
	-------
	
	- `load()`
	
	  This method should be called after your DOM is loaded and before your app uses
	  jo. Typically, you can call this function from your document's `onLoad` method,
	  but it is recommended you use more device-specific "ready" notification if
	  they are available.
	
	- `getPlatform()`
	
	  Returns the platform you're running in as a string. Usually this is not needed,
	  but can be useful.
	
	- `getVersion()`
	
	  Returns the version of jo you loaded in the form of a string (e.g. `0.1.1`).
	
	- `matchPlatform(string)`
	  
	  Feed in a string list of desired platforms (e.g. `"mozilla chrome ipad"`),
	  and returns true if the identified platform is in the test list.

	Events
	------
	
	- `loadEvent`
	- `unloadEvent`
	
	  These events are fired after jo loads or unloads, and can be used in your
	  application to perform initialization or cleanup tasks.

	Function
	========
	
	jo extends the Function object to add a few goodies which augment JavaScript
	in a farily non-intrusive way.
	
	Methods
	-------
	
	- `extend(superclass, prototype)`
	
	  Gives you an easy way to extend a class using JavaScript's natural prototypal
	  inheritance. See Class Patterns for more information.
	
	- `bind(context)`

	  Returns a private function wrapper which automagically resolves context
	  for `this` when your method is called.
	
	HTMLElement
	===========
	
	This is a standard DOM element for JavaScript. Most of the jo views, continers
	and controls deal with these so your application doesn't need to.

	Methods
	-------
	
	Not a complete list by any means, but the useful ones for our
	purposes are:
	
	- `appendChild(node)`
	- `insertChild(before, node)`
	- `removeChild(node)`
	
	Properties
	----------
	
	jo uses these properties quite a bit:
	
	- `innerHTML`
	- `className`
	- `style`

*/

// syntactic sugar to make it easier to extend a class
Function.prototype.extend = function(superclass, proto) {
	// create our new subclass
	this.prototype = new superclass();

	// optional subclass methods and properties
	if (proto) {
		for (var i in proto)
			this.prototype[i] = proto[i];
	}
};

// add bind() method if we don't have it already
if (typeof Function.prototype.bind === 'undefined') {
	Function.prototype.bind = function(context) {
		var self = this;

		function callbind() {
			return self.apply(context, arguments);
		}

		return callbind;
	};
}

// hacky kludge for hacky browsers
if (typeof HTMLElement === 'undefined')
	HTMLElement = Object;

// no console.log? sad...
if (typeof console === 'undefined')
	console = { };
if (typeof console.log !== 'function')
	console.log = function(msg) { };

// just a place to hang our hat
jo = {
	platform: "webkit",
	version: "0.4.2",
	
	useragent: [
		'ipad',
		'iphone',
		'playbook',
		'webos',
		'hpwos',
		'bada',
		'android',
		'opera',
		'chrome',
		'safari',
		'mozilla',
		'gecko',
		'explorer'
	],
	
	debug: false,
	setDebug: function(state) {
		this.debug = state;
	},
	
	flag: {
		stopback: false
	},
	
	load: function(call, context) {
		joDOM.enable();
		
		this.loadEvent = new joSubject(this);
		this.unloadEvent = new joSubject(this);

		// capture these events, prevent default for applications
		document.body.onMouseDown = function(e) { e.preventDefault(); };
		document.body.onDragStart = function(e) { e.preventDefault(); };

		// quick test to see which environment we're in
		if (typeof navigator == 'object' && navigator.userAgent) {
			var agent = navigator.userAgent.toLowerCase();
			for (var i = 0; i < this.useragent.length; i++) {
				if (agent.indexOf(this.useragent[i]) >= 0) {
					this.platform = this.useragent[i];
					break;
				}
			}
		}

		if (joEvent) {
			// detect if we're on a touch or mouse based browser
			var o = document.createElement('div');
			var test = ("ontouchstart" in o);
			if (!test) {
				o.setAttribute("ontouchstart", 'return;');
				test = (typeof o.ontouchstart === 'function');
			}
			joEvent.touchy = test;
			o = null;
		}
		
		if (joGesture)
			joGesture.load();

		var s = joScroller.prototype;
		
		// setup transition css hooks for the scroller
		if (typeof document.body.style.webkitTransition !== "undefined") {
			// webkit, leave everything alone
		}
		else if (typeof document.body.style.MozTransition !== "undefined") {
			// mozilla with transitions
			s.transitionEnd = "transitionend";
			s.setPosition = function(x, y, node) {
				node.style.MozTransform = "translate(" + x + "px," + y + "px)";
			};
		}
		else if (typeof document.body.style.msTransform !== "undefined") {
			// IE9 with transitions
			s.transitionEnd = "transitionend";
			s.setPosition = function(x, y, node) {
				node.style.msTransform = "translate(" + x + "px," + y + "px)";
			};
		}
		else if (typeof document.body.style.OTransition !== "undefined") {
			// opera with transitions
			s.transitionEnd = "otransitionend";
			s.setPosition = function(x, y, node) {
				node.style.OTransform = "translate(" + x + "px," + y + "px)";
			};
		}
		else {
			// no transitions, disable flick scrolling
			s.velocity = 0;
			s.bump = 0;
			s.transitionEnd = "transitionend";
			s.setPosition = function(x, y, node) {
				if (this.vertical)
					node.style.top = y + "px";
				
				if (this.horizontal)
					node.style.left = x + "px";
			};
		}

		joLog("Jo", this.version, "loaded for", this.platform, "environment");

		this.loadEvent.fire();
	},
	
	tagMap: {},
	tagMapLoaded: false,
	
	// make a map of node.tagName -> joView class constructor
	initTagMap: function() {
		// we only do this once per session
		if (this.tagMapLoaded)
			return;

		var key = this.tagMap;
		
		// defaults
		key.JOVIEW = joView;
		key.BODY = joScreen;

		// run through all our children of joView
		// and add to our joCollect.view object
		for (var p in window) {
			var o = window[p];
			if (typeof o === 'function'
			&& o.prototype
			&& typeof o.prototype.tagName !== 'undefined'
			&& o.prototype instanceof joView) {
				var tag = o.prototype.tagName.toUpperCase();
				
				if (o.prototype.type) {
					// handle tags with multiple types
					if (!key[tag])
						key[tag] = {};
						
					key[tag][o.prototype.type] = o;
				}
				else {
					key[tag] = o;
				}
			}
		}
	},
	
	getPlatform: function() {
		return this.platform;
	},
	
	matchPlatform: function(test) {
		return (test.indexOf(this.platform) >= 0);
	},
	
	getVersion: function() {
		return this.version;
	},
	
	getLanguage: function() {
		return this.language;
	}
};

