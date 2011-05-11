/**
	joRecord
	========
	
	An event-driven wrapper for an object and its properties. Useful as a
	data interface for forms and other collections of UI controls.
	
	Extends
	-------
	
	- joDataSource
	
	Methods
	-------
	
	- `link(property)`
	
	  Returns a reference to a joProperty object which can be used with UI
	  controls (children of joControl) to automatically save or load data
	  based on user interaction.
	
	- `save()`
	
	  Saves the object's data. The base class does not itself save the data;
	  you will need to make your own action for the save method, or have
	  something which subscribes to the `saveEvent`.
	
	- `load()`
	
	  Loads the object's data, and fires off notifications to any UI controls
	  which are linked to this joRecord object. Same as the `save()` method,
	  you will have to make this function do some actual file loading if that's
	  what you want it to do.
	
	- `getProperty(property)`
	- `setProperty(property, value)`
	
	  Get or set a given property. Used in conjunction with `setAutoSave()`,
	  `setProprty()` will also trigger a call to the `save()` method.

	- `getDelegate(property)`
	
	  Returns a reference to the joProperty object which fires off events
	  for data changes for that property. If none exists, one is created.
	  This method is used by the `link()` method, and can be overriden if
	  you extend this class to provide some other flavor of a joDataSource
	  to manage events for your properties.

	Use
	---
	
		// setup a joRecord
		var r = new joRecord({
			user: "Jo",
			password: "1234",
			active: true
		});
		
		// bind it to some fields
		var x = new joGroup([
			new joLabel("User"),
			new joInput(r.link("user")),
			new joLabel("Password"),
			new joPasswordInput(r.link("password")),
			new joFlexBox([
				new joLabel("Active"),
				new joToggle(r.link("active"))
			])
		]);

	And if you want the data to be persistent, or interact with some
	cloud service, you'll need to do something like this:
	
		// make something happen to load the data
		r.load = function() {
			// some AJAX or SQL call here
		};
		
		// make something happen to save the data
		r.save = function() {
			// some AJAX or SQL call here
		};
	
	You could also make your own subclass of joRecord with your own save
	and load methods using `extend()` like this:
	
		var preferences = function() {
			// call to the superclass constructor
			joRecord.apply(this, arguments);
		};
		preferences.extend(joRecord, {
			save: function() {
				// do an AJAX or SQL call here
			},
			
			load: function() {
				// do an AJAX or SQL call here
			}
		});

	See Class Patterns for more details on this method of "subclassing"
	in JavaScript.

*/

joRecord = function(data) {
	joDataSource.call(this, data || {});
	this.delegate = {};
};
joRecord.extend(joDataSource, {
	link: function(p) {
		return this.getDelegate(p);
	},
	
	getDelegate: function(p) {
		if (typeof this.data[p] === "undefined")
			this.data[p] === null;
		
		if (!this.delegate[p])
			this.delegate[p] = new joProperty(this, p);
			
		return this.delegate[p];
	},
	
	getProperty: function(p) {
		return this.data[p];
	},
	
	setProperty: function(p, data) {
		if (typeof this.data[p] !== 'undefined' && this.data[p] === data)
			return;
		
		this.data[p] = data;
		this.changeEvent.fire(p);
		
		if (this.autoSave)
			this.save();

		return this;
	},
	
	load: function() {
		console.log("TODO: extend the load() method");
		return this;
	},

	save: function() {
		console.log("TODO: extend the save() method");
		return this;
	}
});
	
/**
	joProperty
	==========
	
	Used by joRecord to provide an event-driven binding to properties.
	This class is instantiated by joRecord and not of much use on its own.
	
	Extends
	-------
	
	- joDataSource
	
	Use
	---
	
	See joRecord for examples.
*/
joProperty = function(datasource, p) {
	joDataSource.call(this);

	this.changeEvent = new joSubject(this);
	datasource.changeEvent.subscribe(this.onSourceChange, this);

	this.datasource = datasource;
	this.p = p;
};
joProperty.extend(joDataSource, {
	setData: function(data) {
		if (this.datasource)
			this.datasource.setProperty(this.p, data);
		
		return this;
	},
	
	getData: function() {
		if (!this.datasource)
			return null;

		return this.datasource.getProperty(this.p);
	},
	
	onSourceChange: function() {
		this.changeEvent.fire(this.getData());
	}
});
