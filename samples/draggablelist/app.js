// required
jo.load();

var App = (function() {
	var stack;
	
	var cards = {
		lists:function() {
			var config = {
				draggable:true,
				formatItem:function (item, index) {
					var o = new joFlexrow([
						new joClassyCaption(item.title, "list-item-title"),
						new joButton("Click", "list-item-button")
					]);
					
					return o;
				},
				onSelect:function(index, event) {
					console.log("select",event.data[index]);
				},
				onListChange:function(data) {
					console.log("data changed",JSON.stringify(data));
				}
			};
			
			var card = new joCard([
				 new joDraggableList([
					{ title: "Grocery", id: "123" },
					{ title: "Hardware", id: "456" },
					{ title: "Stuff", id: "789" },
					{ title: "Fourth", id: "012" }
				], undefined, config)
			]).setTitle("My Lists");
			
			return card;
		}
	};
	
	function navigate(card, event, param) {
		// assume single argument is from direct call (rather than event) so map to param
		if(arguments.length === 1) {
			param = card;
		}
		
		stack.push(joCache.get(param));
	};

	function init() {
		var nav;
		
		for(var cardName in cards) {
			joCache.set(cardName, cards[cardName]);
		}
		
		scn = new joScreen(
			new joContainer([
				new joFlexcol([
					nav = new joNavbar(),
					stack = new joStackScroller()
				])
			]).setStyle({position: "absolute", top: "0", left: "0", bottom: "0", right: "0"})
		);
		
		nav.setStack(stack);
		navigate("lists");
	}
	
	// public stuff
	return {
		"init": init,
		"getStack": function() { return stack; }
	}
}());
