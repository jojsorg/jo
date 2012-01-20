/**
	joScroller
	==========
	
	A scroller container. Ultimately, mobile webkit implementations
	should properly support scrolling elements that have the CSS
	`overflow` property set to `scroll` or `auto`. Why don't they,
	anyway? Until some sanity is adopted, we need to handle this scrolling
	issue ourselves. joScroller expects a single child to manage
	scrolling for.
	
	Use
	---
	
		// make a scroller and set its child later
		var x = new joScroller();
		x.setData(myCard);
		
		// or define things inline, not always a good idea
		var y = new joScroller(new joList(mydata));
		
		// you can dump a big hunk of HTML in there, too
		// since jo wraps strings in a container element, this works
		var z = new joScroller('Some giant HTML as a string');

	Extends
	-------
	
	- joContainer
	
	Methods
	-------
	
	- `scrollBy(position)`
	- `scrollTo(position or joView or HTMLElement)`
	
	  Scrolls to the position or the view or element. If you
	  specify an element or view, make sure that element is a
	  child node, or you'll get interesting results.
	
	- `setScroll(horizontal, vertical)`
	
	  Tells this scroller to allow scrolling the vertical, horizontal, both or none.
	
		// free scroller
		z.setScroll(true, true);
		
		// horizontal
		z.setScroll(true, false);
		
		// no scrolling
		z.setScroll(false, false);
	
*/

joScroller = function(data) {
	this.points = [];
	this.eventset = false;

	this.horizontal = 0;
	this.vertical = 1;
	this.inMotion = false;
	this.moved = false;
	this.mousemove = null;
	this.mouseup = null;
	this.bumpHeight = 0;
	this.bumpWidth = 0;

	// Call Super
	joContainer.apply(this, arguments);
};
joScroller.extend(joContainer, {
	tagName: "joscroller",
	velocity: 1.6,
	bumpRatio: 0.5,
	interval: 100,
	transitionEnd: "webkitTransitionEnd",
	
	setEvents: function() {
//		joEvent.capture(this.container, "click", this.onClick, this);
		joEvent.on(this.container, "mousedown", this.onDown, this);
	},
	
	onFlick: function(e) {
		// placeholder
	},
	
	onClick: function(e) {
		if (this.moved) {
			this.moved = false;
			joEvent.stop(e);
			joEvent.preventDefault(e);
		}
	},
	
	onDown: function(e) {
//		joEvent.stop(e);

		this.reset();
		this.bumpHeight = this.bumpRatio * this.container.offsetHeight;
		this.bumpWidth = this.bumpRatio * this.container.offsetWidth;

		var node = this.container.firstChild;
		
		joDOM.removeCSSClass(node, "flick");
		joDOM.removeCSSClass(node, "flickback");
		joDOM.removeCSSClass(node, "flickfast");

		this.start = this.getMouse(e);
		this.points.unshift(this.start);
		this.inMotion = true;

		if (!this.mousemove) {
			this.mousemove = joEvent.capture(document.body, "mousemove", this.onMove, this);
			this.mouseup = joEvent.on(document.body, "mouseup", this.onUp, this);
		}
	},
	
	reset: function() {
		this.points = [];
		this.moved = false;
		this.inMotion = false;
	},
	
	onMove: function(e) {
		if (!this.inMotion)
			return;
		
		joEvent.stop(e);
		e.preventDefault();
		
		var point = this.getMouse(e);
		
		var y = point.y - this.points[0].y;
		var x = point.x - this.points[0].x;

//		if (y == 0)
//			return;
		
		this.points.unshift(point);

		if (this.points.length > 7)
			this.points.pop();

		// cleanup points if the user drags slowly to avoid unwanted flicks
		var self = this;
		
		if (this.timer)
			window.clearTimeout(this.timer);
		
		this.timer = window.setTimeout(function() {
			if (self.inMotion && self.points.length > 1)
				self.points.pop();
			
			self.timer = null;
		}, this.interval);
		
		if (this.moved)
			this.scrollBy(x, y, true);

		if (!this.moved && this.points.length > 3)
			this.moved = true;
	},

	onUp: function (e) {
		if (!this.inMotion)
			return;

		joEvent.remove(document.body, "mousemove", this.mousemove, true);
		joEvent.remove(document.body, "mouseup", this.mouseup, false);

		this.mousemove = null;
		this.inMotion = false;

//		joEvent.stop(e);
//		joEvent.preventDefault(e);

		var end = this.getMouse(e);
		var node = this.container.firstChild;

		var top = this.getTop();
		var left = this.getLeft();
		
		var dy = 0;
		var dx = 0;
		
		for (var i = 0; i < this.points.length - 1; i++) {
			dy += (this.points[i].y - this.points[i + 1].y);
			dx += (this.points[i].x - this.points[i + 1].x);
		}

		var max = 0 - node.offsetHeight + this.container.offsetHeight;
		var maxx = 0 - node.offsetWidth + this.container.offsetWidth;
		
		// if the velocity is "high" then it was a flick
		if ((Math.abs(dy) * this.vertical > 4 || Math.abs(dx) * this.horizontal > 4)) {
			var flick = dy * (this.velocity * (node.offsetHeight / this.container.offsetHeight));
			var flickx = dx * (this.velocity * (node.offsetWidth / this.container.offsetWidth));

			// we want to move quickly if we're going to land past
			// the top or bottom
			if ((flick + top < max || flick + top > 0)
			|| (flickx + left < maxx || flickx + left > 0)) {
				joDOM.addCSSClass(node, "flickfast");
			}
			else {
				joDOM.addCSSClass(node, "flick");
			}

			this.scrollBy(flickx, flick, false);

			joDefer(this.snapBack, this, 3000);
		}
		else {
			joDefer(this.snapBack, this, 10);
		}

	},
	
	getMouse: function(e) {
		return { 
			x: (this.horizontal) ? e.screenX : 0,
			y: (this.vertical) ? e.screenY : 0
		};
	},
	
	scrollBy: function(x, y, test) {
		var node = this.container.firstChild;

		var top = this.getTop();
		var left = this.getLeft();

		var dy = Math.floor(top + y);
		var dx = Math.floor(left + x);
		
		if (this.vertical && (node.offsetHeight <= this.container.offsetHeight))
			return this;
			
		var max = 0 - node.offsetHeight + this.container.offsetHeight;
		var maxx = 0 - node.offsetWidth + this.container.offsetWidth;

		var ody = dy;
		var odx = dx;
		
		if (this.bumpHeight) {
			if (dy > this.bumpHeight)
				dy = this.bumpHeight;
			else if (dy < max - this.bumpHeight)
				dy = max - this.bumpHeight;
		}
		
		if (this.bumpWidth) {
			if (dx > this.bumpWidth)
				dx = this.bumpWidth;
			else if (dy < maxx - this.bumpWidth)
				dx = maxx - this.bumpWidth;
		}

		if (!this.eventset)
			this.eventset = joEvent.capture(node, this.transitionEnd, this.snapBack, this);

		if (top != dx || left != dy)
			this.moveTo(dx, dy);
			
		return this;
	},

	scrollTo: function(y, instant) {
		var node = this.container.firstChild;
		
		if (!node)
			return this;

		if (typeof y === 'object') {
			var e;
			if (y instanceof HTMLElement)
				e = y;
			else if (y instanceof joView)
				e = y.container;
				
			var t = 0 - e.offsetTop;
			var h = e.offsetHeight + 80;

			var top = this.getTop();
			var bottom = top - this.container.offsetHeight;
			y = top;

			if (t - h < bottom)
				y = (t - h) + this.container.offsetHeight;

			if (y < t)
				y = t;
		}
		
		if (y < 0 - node.offsetHeight)
			y = 0 - node.offsetHeight;
		else if (y > 0)
			y = 0;

		if (!instant) {
			joDOM.addCSSClass(node, 'flick');
		}
		else {
			joDOM.removeCSSClass(node, 'flick');
			joDOM.removeCSSClass(node, 'flickback');
		}

		this.moveTo(0, y);
		
		return this;
	},

	// called after a flick transition to snap the view
	// back into our container if necessary.
	snapBack: function() {
		var node = this.container.firstChild;
		var top = this.getTop();
		var left = this.getLeft();

		var dy = top;
		var dx = left;

		var max = 0 - node.offsetHeight + this.container.offsetHeight;
		var maxx = 0 - node.offsetWidth + this.container.offsetWidth;

		if (this.eventset)
			joEvent.remove(node, this.transitionEnd, this.eventset);
		
		this.eventset = null;

		joDOM.removeCSSClass(node, 'flick');
		
		if (dy > 0)
			dy = 0;
		else if (dy < max)
			dy = max;

		if (dx > 0)
			dx = 0;
		else if (dx < maxx)
			dx = maxx;

		if (dx != left || dy != top) {
			joDOM.addCSSClass(node, 'flickback');
			this.moveTo(dx, dy);
		}
	},

	setScroll: function(x, y) {
		this.horizontal = x ? 1 : 0;
		this.vertical = y ? 1 : 0;
		
		return this;
	},
	
	moveTo: function(x, y) {
		var node = this.container.firstChild;
		
		if (!node)
			return this;
		
		this.setPosition(x * this.horizontal, y * this.vertical, node);

		node.jotop = y;
		node.joleft = x;
	},
	
	setPosition: function(x, y, node) {
		node.style.webkitTransform = "translate3d(" + x + "px, " + y + "px, 0)";
		
		return this;
	},
	
	getTop: function() {
		return this.container.firstChild.jotop || 0;
	},

	getLeft: function() {
		return this.container.firstChild.joleft || 0;
	},
	
	setData: function(data) {
		return joContainer.prototype.setData.apply(this, arguments);
	}
});

