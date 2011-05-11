/**
	- - -

	joDatabase
	===========

	Wrapper class for WebKit SQLite database.
	
	Methods
	-------
	
	- `open(datafile, size)`
	
	  `datafile` is a filename, `size` is an optional parameter for initial
	  allocation size for the database.
	
	- `close()`
	
	- `now()`
	
	  *Deprecated* convenience method which returns a SQLite-formatted date
	  string for use in queries. Should be replaced with a utility function
	  in joTime.
*/
joDatabase = function(datafile, size) {
	this.openEvent = new joSubject(this);
	this.closeEvent = new joSubject(this);
	this.errorEvent = new joSubject(this);

	this.datafile = datafile;
	this.size = size || 256000;
	this.db = null;
};
joDatabase.prototype = {
	open: function() {
		this.db = openDatabase(this.datafile, "1.0", this.datafile, this.size);

		if (this.db) {
			this.openEvent.fire();
		}
		else {
			joLog("DataBase Error", this.db);
			this.errorEvent.fire();
		}
		
		return this;
	},
	
	close: function() {
		this.db.close();
		this.closeEvent.fire();
		
		return this;
	},
	
	now: function(offset) {
		var date = new Date();
		
		if (offset)
			date.setDate(date.valueOf() + (offset * 1000 * 60 * 60 * 24));
		
		return date.format("yyyy-mm-dd");
	}
};
