/**
	joCard
	======
	
	Special container for card views, more of an application-level view.
	
	Extends
	-------
	
	- joContainer
	
	Events
	-------
	
	- activateEvent
	- deactivateEvent 
	
	 These are used to replace the default activate() and deactivate() methods so .subscribe() can be used
	
*/
joCard = function(data) {
	joContainer.apply(this, arguments);

	this.activateEvent = new joSubject(this);
	this.deactivateEvent = new joSubject(this);
};
joCard.extend(joContainer, {
	tagName: "jocard",
	
	activate: function() {
		this.activateEvent.fire();
	},
	
	deactivate : function() {
		this.deactivateEvent.fire();
	}
});

