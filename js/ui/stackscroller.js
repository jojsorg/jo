/**
	joStackScroller
	===============
	
	What happens when you mix joStack and joScroller? You get this
	class. Use exactly as you would joStack, only it automatically
	puts a scroller in the stack as needed. At some point, this
	might get folded into joStack, but for now it's a special class.
	
	It also handles the `scrollTo()` and `scrollBy()` methods from
	joScroller.
	
	Extends
	-------
	- joStack
	- joScroller
*/

joStackScroller = function(data) {
	this.scrollers = [
		new joScroller(),
		new joScroller()
	];
	this.scroller = this.scrollers[0];

	joStack.apply(this, arguments);
	
	this.scroller.attach(this.container);
};
joStackScroller.extend(joStack, {
	type: "scroll",
	scrollerindex: 1,
	scroller: null,
	scrollers: [],
	
	switchScroller: function() {
		this.scrollerindex = this.scrollerindex ? 0 : 1;
		this.scroller = this.scrollers[this.scrollerindex];
	},
	
	getLastScroller: function() {
		return this.scrollers[this.scrollerindex ? 0 : 1];
	},
	
	scrollTo: function(something) {
		this.scroller.scrollTo(something);
		
		return this;
	},
	
	scrollBy: function(y) {
		this.scroller.scrollBy(y);
		
		return this;
	},

	getChildStyleContainer: function() {
		return this.scroller.container;
	},
	
	getContentContainer: function() {
		return this.scroller.container;
	},

	appendChild: function(child) {
		var scroller = this.scroller;
		scroller.setData(child);
		this.container.appendChild(scroller.container);
	},
	
	getChild: function() {
		return this.scroller.container || null;
	},

	forward: function() {
		if (this.index < this.data.length - 1)
			this.switchScroller();
			
		joStack.prototype.forward.call(this);
		
		return this;
	},
	
	back: function() {
		if (this.index > 0)
			this.switchScroller();

		joStack.prototype.back.call(this);
		
		return this;
	},

	home: function() {
		if (this.data && this.data.length && this.data.length > 1) {
			this.switchScroller();
			joStack.prototype.home.call(this);
		}
		
		return this;
	},
		
	push: function(o) {
		// don't push the same view we already have
		if (this.data && this.data.length && this.data[this.data.length - 1] === o)
			return;
			
		this.switchScroller();

		joDOM.removeCSSClass(o, 'flick');
		joDOM.removeCSSClass(o, 'flickback');

		this.scroller.setData(o);
		this.scroller.scrollTo(0, true);

		joStack.prototype.push.call(this, o);
		
		return this;
	},
	
	pop: function() {
		if (this.data.length > this.locked)
			this.switchScroller();

		joStack.prototype.pop.call(this);
		
		return this;
	}
});

