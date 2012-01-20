/**
	joTabBar
	=========
	
	Tab bar widget.
	
	Extends
	-------
	
	- joList

	Model
	-----
	
	Data is expected to be an array of `{ type: "", label: ""}` objects,
	in the display order for the bar.

*/
joTabBar = function() {
	joList.apply(this, arguments);
};
joTabBar.extend(joList, {
	tagName: "jotabbar",
	
	formatItem: function(data, index) {
		var o = document.createElement("jotab");
		
		if (data.type)
			o.className = data.type;

	    if (data.badge):
	               o.innerHTML = "div class='badge'>" + data.badge + "</div>";
            

		o.setAttribute("index", index);
                
		
		return o;
	}
});
