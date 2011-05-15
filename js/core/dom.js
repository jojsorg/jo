/**
	joDOM
	======
	
	Singleton with utility methods for manipulating DOM elements.
	
	Methods
	-------

	- `get(id)`

	  Returns an HTMLElement which has the given id or if the
	  id is not a string returns the value of id.
	
	- `create(type, style)`
	
	  Type is a valid HTML tag type. Style is the same as `setStyle()`
	  method. Returns an HTMLElement.

			// simple
			var x = joDOM.create("div", "mycssclass");

			// more interesting
			var x = joDOM.create("div", {
				id: "name",
				className: "selected",
				background: "#fff",
				color: "#000"
			});

	- `setStyle(tag, style)`
	
	  Style can be an object literal with
	  style information (including "id" or "className") or a string. If
	  it's a string, it will simply use the style string as the className
	  for the new element.
	  
	  Note that the preferred and most cross-platform method for working
	  with the DOM is to use `className` and possibly `id` and put your
	  actual style information in your CSS file. That said, sometimes it's
	  easier to just set the background color in the code. Up to you.
	
	- `getParentWithin(node, ancestor)`

	  Returns an HTMLElement which is
	  the first child of the ancestor which is a parent of a given node.
	
	- `addCSSClass(HTMLElement, classname)`

	  Adds a CSS class to an element unless it is already there.
	
	- `removeCSSClass(HTMLElement, classname)`

	  Removes a CSS class from an element if it exists.
	
	- `toggleCSSClass(HTMLElement, classname)`

	  Auto add or remove a class from an element.
	
	- `pageOffsetLeft(HTMLElement)` and `pageOffsetHeight(HTMLElement)`
	
	  Returns the "true" left and top, in pixels, of a given element relative
	  to the page.
	
	- `applyCSS(css, stylenode)`
	
	  Applies a `css` string to the app. Useful for quick changes, like backgrounds
	  and other goodies. Basically creates an inline `<style>` tag. This method
	  returns a reference to the new `<style>` tag, which you can use with `removeCSS()`
	  and subsequent calls to `applyCSS()` as the `stylenode` argument.
	
	- `loadCSS(filename)`
	
	  Works the same as `applyCSS()` but loads the CSS from a file instead of a string.
	
	- `removeCSS(stylenode)`
	
	  Removes a `<style>` tag created with `applyCSS()` or `loadCSS()`.

*/
joDOM = {
	enabled: false,
	
	get: function(id) {
		if (typeof id === "string") {
			return document.getElementById(id);
		}
		else if (typeof id === 'object') {
			if (id instanceof joView)
				return id.container;
			else
				return id;
		}
	},
	
	remove: function(node) {
		if (node.parentNode)
			node.parentNode.removeChild(node);
	},

	enable: function() {
		this.enabled = true;
	},
	
	getParentWithin: function(node, ancestor) {
		while (node.parentNode !== window && node.parentNode !== ancestor) {
			node = node.parentNode;
		}

		return node;
	},

	addCSSClass: function(node, classname) {
		node = joDOM.get(node);

		if (typeof node.className !== "undefined") {
			var n = node.className.split(/\s+/);

			for (var i = 0, l = n.length; i < l; i++) {
				if (n[i] == classname)
					return;
			}

			n.push(classname);
			node.className = n.join(" ");
		}
		else {
			node.className = classname;
		}
	},

	removeCSSClass: function(node, classname, toggle) {
		node = joDOM.get(node);

		if (typeof node.className !== "undefined") {
			var n = node.className.split(/\s+/);

			for (var i = 0, l = n.length; i < l; i++) {
				if (n[i] == classname) {
					if (l == 1) {
						node.className = "";
					}
					else {
						n.splice(i, i);
						node.className = n.join(" ");
					}

					return;
				}
			}

			if (toggle) {
				n.push(classname);
				node.className = n.join(" ");
			}
		}
		else {
			node.className = classname;
		}
	},

	toggleCSSClass: function(node, classname) {
		this.removeCSSClass(node, classname, true);
	},

	create: function(tag, style) {
		if (!this.enabled)
			return null;

		var o;
		
		if (typeof tag === "object" && typeof tag.tagName === "string") {
			// being used to create a container for a joView
			o = document.createElement(tag.tagName);

			if (tag.className)
				this.setStyle(o, tag.className);
		}
		else {
			o = document.createElement(tag);

			if (style)
				this.setStyle(o, style);
		}
		
		return o;
	},
	
	setStyle: function(node, style) {
		node = joDOM.get(node);
		
		if (typeof style === "string") {
			node.className = style;
		}
		else if (typeof style === "object") {
			for (var i in style) {
				switch (i) {
				case "id":
				case "className":
					node[i] = style[i];
					break;
				default:
					node.style[i] = style[i];
				}
			}
		}
		else if (typeof style !== "undefined") {
			throw("joDOM.setStyle(): unrecognized type for style argument; must be object or string.");
		}
	},
	
	applyCSS: function(style, oldnode) {
		// TODO: should insert before and then remove the old node
		if (oldnode)
			document.body.removeChild(oldnode);

		var css = joDOM.create('jostyle');
		css.innerHTML = '<style>' + style + '</style>';

		document.body.appendChild(css);

		return css;
	},
	
	removeCSS: function(node) {
		document.body.removeChild(node);
	},
	
	loadCSS: function(filename, oldnode) {
		// you can just replace the source for a given
		// link if one is passed in
		var css = (oldnode) ? oldnode : joDOM.create('link');

		css.rel = 'stylesheet';
		css.type = 'text/css';
		css.href = filename + (jo.debug ? ("?" + joTime.timestamp()) : "");

		if (!oldnode)
			document.body.appendChild(css);
		
		return css;
	},
	
	pageOffsetLeft: function(node) {
		var l = 0;
		
		while (typeof node !== 'undefined' && node && node.parentNode !== window) {
			if (node.offsetLeft)
				l += node.offsetLeft;

			node = node.parentNode;
		}

		return l;
	},
	
	pageOffsetTop: function(node) {
		var t = 0;
		
		while (typeof node !== 'undefined' && node && node.parentNode !== window) {
			if(node.offsetTop)
				t += node.offsetTop;
				
			node = node.parentNode;
		}

		return t;
	},
	
	getBounds:function(node) {
		var top = joDOM.pageOffsetTop(node);
		var left = joDOM.pageOffsetLeft(node);
		var bottom = top+node.offsetHeight;
		var right = left+node.offsetWidth;
		
		return {
			top:top,
			left:left,
			bottom:bottom,
			right:right,
			center:{
				x:left+(right-left)/2,
				y:top+(bottom-top)/2
			}			
		};
	}
};

joCSSRule = function(data) {
	this.setData(data);
};
joCSSRule.prototype = {
	container: null,
	
	setData: function(data) {
		this.data = data || "";
		this.enable();
	},
	
	clear: function() {
		this.setData();
	},
	
	disable: function() {
		joDOM.removeCSS(this.container);
	},
	
	enable: function() {
		this.container = joDOM.applyCSS(this.data, this.container);
	}
};
