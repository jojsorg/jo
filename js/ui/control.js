/**
	joControl
	=========
	
	Interactive, data-driven control class which may be bound to a joDataSource,
	can receive focus events, and can fire off important events which other objects
	can listen for and react to.
	
	Extends
	-------
	
	- joView
	
	Events
	------
	
	- `changeEvent`
	- `selectEvent`
	
	Methods
	-------
	
	- `setValue(value)`
	
	  Many controls have a *value* in addition to their *data*. This is
	  particularly useful for `joList`, `joMenu`, `joOption` and other controls
	  which has a list of possibilities (the data) and a current seletion from those
	  (the value).
	
	- `enable()`
	- `disable()`
	
	  Enable or disable the control, pretty much does what you'd expect.
	
	- `focus()`
	- `blur()`
	
	  Manually control focus for this control.
	
	- `setDataSource(joDataSource)`
	
	  Tells this control to bind its data to any `joDataSource` or subclass.
	
	- `setValueSource(joDataSource)`
	
	  Tells this control to bind its *value* to any `joDataSource` type.
	
	- `setReadOnly(state)`
	
	  Certain controls can have their interaction turned off. State is either `true`
	  or `false`.
	
	See Also
	--------
	
	- joRecord and joProperty are specialized joDataSource classes which
	  make it simple to bind control values to a data structure.

*/
joControl = function(data, value) {
	this.selectEvent = new joSubject(this);
	this.enabled = true;
	this.value = null;

	if (typeof value !== "undefined" && value !== null) {
		if (value instanceof joDataSource)
			this.setValueSource(value);
		else
			this.value = value;
	}

	if (typeof data !== "undefined" && data instanceof joDataSource) {
		// we want to bind directly to some data
		joView.call(this);
		this.setDataSource(data);
	}
	else {
		joView.apply(this, arguments);
	}
};
joControl.extend(joView, {
	tagName: "jocontrol",
	
	setEvents: function() {
		// not sure what we want to do here, want to use
		// gesture system, but that's not defined
		joEvent.capture(this.container, "click", this.onMouseDown, this);
		joEvent.on(this.container, "blur", this.onBlur, this);
		joEvent.on(this.container, "focus", this.onFocus, this);
	},
	
	onMouseDown: function(e) {
		this.select(e);
	},
	
	select: function(e) {
		if (e)
			joEvent.stop(e);

		if(this.enabled) {
			this.selectEvent.fire(this.data);
		}
		
		return this;
	},
	
	enable: function() {
		joDOM.removeCSSClass(this.container, 'disabled');
		this.container.contentEditable = true;
		this.enabled = true;
		
		return this;
	},
	
	disable: function() {
		joDOM.addCSSClass(this.container, 'disabled');
		this.container.contentEditable = false;
		this.enabled = false;
		
		return this;
	},

	setReadOnly: function(value) {
		if (typeof value === 'undefined' || value)
			this.container.setAttribute('readonly', '1');
		else 
			this.container.removeAttribute('readonly');
		
		return this;
	},

	onFocus: function(e) {
		joEvent.stop(e);
		
		if (this.enabled)
			joFocus.set(this);
	},
	
	onBlur: function(e) {
		this.data = (this.container.value) ? this.container.value : this.container.innerHTML;
		joEvent.stop(e);

		if (this.enabled) {
			this.blur();

			this.changeEvent.fire(this.data);
		}
	},
	
	focus: function(e) {
		if (!this.enabled)
			return;
		
		joDOM.addCSSClass(this.container, 'focus');

		if (!e)
			this.container.focus();
			
		return this;
	},
	
	setValue: function(value) {
		this.value = value;
		this.changeEvent.fire(value);

		return this;
	},
	
	getValue: function() {
		return this.value;
	},
	
	blur: function() {
		joDOM.removeCSSClass(this.container, 'focus');
		
		return this;
	},
	
	setDataSource: function(source) {
		this.dataSource = source;
		source.changeEvent.subscribe(this.setData, this);

		var data = source.getData();
		this.setData((data !== 'undefined') ? data : null);
		this.changeEvent.subscribe(source.setData, source);
		
		return this;
	},
	
	setValueSource: function(source) {
		this.valueSource = source;
		source.changeEvent.subscribe(this.setValue, this);
		
		var value = source.getData();
		this.setValue((value !== 'undefined') ? value : null);
		this.selectEvent.subscribe(source.setData, source);
		
		return this;
	}
});
