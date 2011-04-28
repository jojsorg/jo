
joListItem = function(data, value) {
	joContainer.apply(this, arguments);
	this.container.setAttribute("index", value);
}

joListItem.extend(joContainer, {
	tagName:"jolistitem"
});

joSpacer = function() {
	joControl.call(this);
}

joSpacer.extend(joControl, {
	tagName:"jospacer"
});

joClassyCaption = function(text, className) {
	joCaption.apply(this, arguments);
	
	if(!!className && typeof(className) === "string") {
		this.container.className = className;
	}
}

joClassyCaption.extend(joCaption);

joDraggableList = function(data, value, config) {
	this.setConfig(config, true);
	joList.apply(this, arguments);
	
	this.holdEvent = new joSubject(this);
	this.listChangeEvent = new joSubject(this);
	this.wasHold = false;
		
	//this.listChangeEvent.subscribe(this.onListChange, this);
	if(!!this.config.draggable) this.holdEvent.subscribe(this.onStartDrag, this);
	
	// bind user-passed event handlers
	if(config.onSelect)	this.selectEvent.subscribe(config.onSelect, this);
	if(config.onHold) this.holdEvent.subscribe(config.onHold, this);
	if(config.onListChange) this.listChangeEvent.subscribe(config.onListChange, this);
		
	joEvent.capture(this.container, "mousedown", this.onStartHold, this);
	joEvent.capture(this.container, "mouseup", this.onEndHold, this);
}

joDraggableList.extend(joList, {
	// copied draw() from joList to inject joSpacers.  would ideally 
	draw: function() {
		var html = "";
		var length = 0;

		if (typeof this.data === 'undefined' || !this.data || !this.data.length) {
			if (this.defaultMessage)
				this.container.innerHTML = this.defaultMessage;

			return;
		}
		
		// prepend spacer
		this.container.appendChild(new joSpacer().container);

		for (var i = 0, l = this.data.length; i < l; i++) {
			var element = this.formatItem(this.data[i], i, length);

			if (!element)
				continue;
			
			if (typeof element === "string") {
				html += element;
			} else {
				this.container.appendChild((element instanceof joView) ? element.container : element);
				this.container.appendChild(new joSpacer().container);
			}

			++length;
		}
		
		// support setting the contents with innerHTML in one go,
		// or getting back HTMLElements ready to append to the contents
		if (html.length)
			this.container.innerHTML = html;
		
		// refresh our current selection
		if (this.value >= 0)
			this.setValue(this.value, true);
			
		return;
	},
	formatItem:function(item, index, length) {
		return (this.config && this.config.formatItem) ? new joListItem(this.config.formatItem(item), index) : joList.prototype.formatItem.apply(this, arguments);
	},
	getConfig:function() {
		return this.config;
	},
	setConfig:function(config, silent) {
		this.config = config || {};
		
		if(!silent) {
			this.refresh();
		}
	},
	onMouseDown:function() {
		if(!this.wasHold) {
			joList.prototype.onMouseDown.apply(this, arguments);
		} else {
			this.wasHold = false;
		}
	},
	onStartHold:function(e) {
		// if no subscribers to hold event, treat holds as selects
		if(this.holdEvent.subscriptions.length == 0) return;
		
		// set timer for 0.4s to trigger holdEvent
		this.holdTimer = joDefer(function() {
			if(!this.holdTimer) return;				// kick out if a hold isn't active
			
			this.mousePosition = {					// store mouse position for dragger, have to include offset of list control as well
				top:e.clientY,
				left:e.clientX
			};
			this.wasHold = true; 					// flag hold to skip select event
			var value = this.findSourceItem(e);		// get index for held item
			this.setValue(value, true);				// set value and surpress selectEvent
			this.holdEvent.fire(value);				// fire holdEvent
		}, this, 400);
	},
	onEndHold:function(e) {
		// mouseup came before timer fired so treat as single click and clear timer
		if(this.holdTimer) {
			window.clearTimeout(this.holdTimer);
		}
	},
	findSourceItem:function(e) {
		var node = joEvent.getTarget(e);
		var index = -1;
		
		while (index == -1 && node !== this.container) {
			index = node.getAttribute("index") || -1;
			node = node.parentNode;
		}
		
		return index;
	},
	onStartDrag:function(index) {
		var offset = {
			top:joDOM.pageOffsetTop(this.container),
			left:joDOM.pageOffsetLeft(this.container)
		};
		
		this.dragger = new Dragger(this.getNode(index), offset, this.mousePosition);
		this.dragger.dropEvent.subscribe(this.onDrop, this);
		this.dragger.hoverEvent.subscribe(this.onHover, this);
	},
	onDrop:function(e) {
		var index = this.getIndexForPosition(e.clientX, e.clientY, this.dragger.node);  // next sibling index
		var oldIndex = parseInt(this.dragger.node.getAttribute("index"));               // index before dragging
		
		// if drop occurred within list (index != -1) and it's in a new position,
		// update the model, fire listChange, set new index as selected
		if(index !== -1 && index-1 !== oldIndex) {
			var nextSibling = this.data[index];
			var n = this.data[oldIndex];
			
			this.data.splice(oldIndex, 1);
			
			if(nextSibling) {
				for(var i=0;i<this.data.length;i++) {
					if(this.data[i] === nextSibling) {
						index = i;
						this.data.splice(i, 0, n);
						break;
					}
				}
			} else {
				index = this.data.length;
				this.data.push(n);
			}
			
			this.listChangeEvent.fire(this.data);
			this.setValue(index, true);
		}
		
		// reload list.  not exceptionally efficient but does the trick for now
		this.refresh();
	},
	onHover:function(e) {
		var hoverIndex = this.getIndexForPosition(e.center.x, e.center.y, this.dragger.node);
		this.openSpacer(hoverIndex);
	},
	openSpacer:function(index) {
		var spacers = this.container.querySelectorAll("jospacer");
		for(var i=0;i<spacers.length;i++) {
			if(i === index) {
				if(spacers[i].offsetHeight == 0) {
					joDOM.setStyle(spacers[i], {height:this.dragger.node.offsetHeight + "px"});
				}
			} else {
				if(spacers[i].offsetHeight > 0) joDOM.setStyle(spacers[i], {height:"0px"});
			}
		}
	},
	getNode:function(index) {
		var n = this.container.querySelector('jolistitem[index="' + index + '"]');
		return n;
	},
	getIndexForPosition:function(x,y, ignoreElement) {
		var index = -1;
		
		// getBounds is a new enhancement to joDOM
		var bounds = joDOM.getBounds(this.container);
					
		if(y >= bounds.top && y <= bounds.bottom && x >= bounds.left && x <= bounds.right) {
			var nodes = this.container.querySelectorAll("jolistitem")
			index = nodes.length;
			for(var i=0;i<nodes.length;i++) {
				var n = nodes[i];
				if(n === ignoreElement) continue;
				
				var nTop = joDOM.pageOffsetTop(n)+(n.offsetHeight/2);
				if(y <= nTop) {
					index = i;
					break;
				}
			}
		}
		
		return index;
	}
});

var Dragger = function(node, containerOffset, attachOffset) {
	this.node = node;
	this.containerOffset = containerOffset;
	this.attachOffset = attachOffset;
	
	var p = this.absolutify();
	this.offset = {top:attachOffset.top-p.top,left:attachOffset.left-p.left};
	joDefer(function() {
		this.move(attachOffset.top, attachOffset.left);
		this.hoverEvent.fire(joDOM.getBounds(this.node));
	}, this);	
	
	this.dropEvent = new joSubject(this);
	this.hoverEvent = new joSubject(this);
	
	this.handlers = {
		onMouseUp:joEvent.capture(this.node, "mouseup", this.onMouseUp, this),
		onDocMouseUp:joEvent.capture(document, "mouseup", this.onDocMouseUp, this),
		onMouseMove:joEvent.capture(document, "mousemove", this.onMouseMove, this)
	}
}

Dragger.prototype = {
	absolutify:function() {
		var p = {
			top:joDOM.pageOffsetTop(this.node)-this.containerOffset.top,
			left:joDOM.pageOffsetLeft(this.node)-this.containerOffset.left
		}

		joDOM.setStyle(this.node, {
			width:this.node.offsetWidth + "px"
		});
		joDOM.addCSSClass(this.node, "dragging");
		
		return p;
	},
	onDocMouseUp:function(e) {
		this.onMouseUp(e);
	},
	onMouseUp:function(e) {
		joEvent.remove(this.node, "mouseup", this.handlers.onMouseUp, true);
		joEvent.remove(document, "mouseup", this.handlers.onDocMouseUp, true);
		joEvent.remove(document, "mousemove", this.handlers.onMouseMove, true);
		this.dropEvent.fire(e);
	},
	onMouseMove:function(e) {
		this.move(e.clientY, e.clientX);
		this.hoverEvent.fire(joDOM.getBounds(this.node));
	},
	move:function(t,l) {
		var top = (t-this.offset.top);
		var left = (l-this.offset.left);
		joDOM.setStyle(this.node, {top:top + "px"});
		
		// restricting to only vertical movement right now
		//this.node.style.left = left + "px";
	}
};
