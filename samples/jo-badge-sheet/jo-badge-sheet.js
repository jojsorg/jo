/*Jo badge/sheet demo: this is designed to show how Jo can be customized via scripts and CSS to to fit in with iOS UI conventions. This demo makes use of a tab bar for navigation, includes a notification badge on the tab button, and includes a slideup/slidedown "action sheet" dialog. (c) 2012, Kevin Walzer/WordTech Communications LLC.*/


/*Start app.*/
jo.load();


/*Customize joTabBar to take a "badge" parameter.*/
joTabBar = function() {
	joList.apply(this, arguments);
};
joTabBar.extend(joList, {
	tagName: "jotabbar",
	
	formatItem: function(data, index) {
		var o = document.createElement("jotab");
		
		if (data.type)
			o.className = data.type;

	    if (data.badge)
	               o.innerHTML = "<div class='badge'>" + data.badge + "</div>";
            
		o.setAttribute("index", index);
               	
		return o;
	}
});


/*Implement "action sheet" to slide up/down instead of right/left. To do this, we have to implement the sheet as a subclass of joStackScroller to handle scrolling correctly, and also implement some modified methods from joStack. The implementation replaces hard-coded "next" and "prev" CSS classes with "up/down." This solution is effective for this use-case. It would be nice to have a more general mechanism for specifying animations but Jo does not currently support this. */
 
var joSheetStack = function() {
    // call to the superclass constructor
    joStackScroller.apply(this, arguments);
};

joSheetStack.extend(joStackScroller, {
   
    drawsheet: function() {
		if (!this.container)
			this.createContainer();
			
		if (!this.data || !this.data.length)
			return;

		// short term hack for webos
		// not happy with it but works for now
		jo.flag.stopback = this.index ? true : false;

		var container = this.container;
		var oldchild = this.lastNode;
		var newnode = getnode(this.data[this.index]);
		var newchild = this.getChildStyleContainer(newnode);

		function getnode(o) {
			return (o instanceof joView) ? o.container : o;
		}
		
		if (!newchild)
			return;
		
		var oldclass, newclass;
		
		if (this.index > this.lastIndex) {
		 
		    oldclass = "down";
		    newclass =  "up";
		    joDOM.addCSSClass(newchild, newclass);
		}
		else if (this.index < this.lastIndex) {
		    oldclass = "up";
		    newclass = "down";
		    joDOM.addCSSClass(newchild, newclass);
		}
	   
		this.appendChild(newnode);

		var self = this;
		var transitionevent = null;

		joDefer(animatesheet, this, 1);
		
		function animatesheet() {
			// FIXME: AHHH must have some sort of transition for this to work,
			// need to check computed style for transition to make this
			// better
			if (typeof window.onwebkittransitionend !== 'undefined')
				transitionevent = joEvent.on(newchild, "webkitTransitionEnd", cleanupsheet, self);
			else
				joDefer(cleanupsheet, this, 200);

			if (newclass && newchild)
				joDOM.removeCSSClass(newchild, newclass);

			if (oldclass && oldchild)
				joDOM.addCSSClass(oldchild, oldclass);
		}
		    
		
		function cleanupsheet() {
			if (oldchild) {
				joDOM.removeCSSClass(oldchild,"up");
				joDOM.removeCSSClass(oldchild, "down");
				self.removeChild(oldchild);
			}

			if (newchild) {
				if (transitionevent)
					joEvent.remove(newchild, "webkitTransitionEnd", transitionevent);

				joDOM.removeCSSClass(newchild, "up");
				joDOM.removeCSSClass(newchild, "down");
			}
		}

		if (typeof this.data[this.index].activate !== "undefined")
			this.data[this.index].activate.call(this.data[this.index]);
		
		this.lastIndex = this.index;
		this.lastNode = newchild;
		
		return this;
	},


    pushsheet: function(o) {

		// don't push the same view we already have
		if (this.data && this.data.length && this.data[this.data.length - 1] === o)
			return this;

	        this.switchScroller();

		joDOM.removeCSSClass(o, 'flick');
		joDOM.removeCSSClass(o, 'flickback');

		this.scroller.setData(o);
		this.scroller.scrollTo(0, true);

		this.data.push(o);
		this.index = this.data.length - 1;
	        this.drawsheet();
		this.pushEvent.fire(o);
		
		return this;

	},

    popsheet: function(o) {
		if (this.data.length > this.locked) {
		    	this.switchScroller();
			var o = this.data.pop();
			this.index = this.data.length - 1;

		    this.drawsheet();
			
			if (typeof o.deactivate === "function")
				o.deactivate.call(o);

			if (!this.data.length)
				this.hide();
		}

		if (this.data.length > 0)
			this.popEvent.fire();
			
		return this;
	}
});

/*Now we get to the demo itself.*/

var App = (function () {
    var scn;
    var menu;
    var stack;
    var badgeCard;
    var slideCard;
    var aboutCard;
    var active;
    var nav;
    var datastring;
    var badgetext;
    var badgebutton;
    var slidebutton;
    var closebutton;
    var mailbutton;
    var datastring;

    /*Initialize.*/
    function init() {

      return true;

    }

    /*Mail "about" data using native e-mail client. Shows how to integrate Jo with other apps on platform.*/
    function maildata(data) {

      mailstring = data.replace(/<\/?[a-z][a-z0-9]*[^<>]*>/ig, "");
      location.href = "mailto: ?&subject=Hi%20from%20Jo!&body=" + mailstring;

    }
      

 /*First visible card.*/
  badgeCard = new joScroller(
				    new joCard([
						new joTitle("Badge/Sheet Demo"),
						new joGroup([
							     new joLabel("<strong>Notification</strong>"),
						    new joFlexrow(badgetext = new joInput("Enter badge text here")),
							     badgebutton = new joButton('Enter'),	
] ),
					new joDivider(),
					slidebutton = new joButton('Display Action Sheet'),
				   	
						])
				    ); 

 /*Action sheet that slides up.*/
 slideCard = new joCard([
	new joHTML('E-mail a friend about Jo.'),
	new joDivider(), 
	 mailbutton = new joButton('E-mail'),
	 new joDivider(),
	 
       closebutton = new joButton('Close Sheet'),
        ]);

/*About Jo.*/
     aboutCard = new joCard([
	 new joTitle('About Jo'),
	 datastring = new joHTML('This is a demonstration of some of the customization you can do with the Jo JavaScript framework. This demo is displays some iOS-style touches such as a tab bar for navigation, a notification badge on the tab icon, and an action-sheet dialog.'),
     ]);
  

    /*Button events.*/
     
    /*Set badge text.*/
    badgebutton.selectEvent.subscribe(function() { 
	menu.setData([{type : "doc", badge: badgetext.getData()},		  
		{type : "about"}
		     ]);
	menu.refresh();
      })

      /*Send text via e-mail.*/
      mailbutton.selectEvent.subscribe(function() { 
	  maildata(datastring.getData());
	}) 

        /*Show action sheet.*/
        slidebutton.selectEvent.subscribe(function() { 
	    menu.setStyle({display:"none"});
	    stack.pushsheet(slideCard);						     
	}) 

     /*Hide action sheet.*/
     closebutton.selectEvent.subscribe(function() { 
	 stack.popsheet(slideCard);

	 menu.setData([{type : "doc", badge: badgetext.getData(),},
		      {type : "about"}
		     ]);
	 menu.setStyle({
	     display:"-webkit-box",

	  });
	 menu.refresh();
	 
	})
      
    // Set up the page elements		
    scn = new joScreen(
		       new joContainer([
			   stack = new joSheetStack(),
				    
					menu = new joTabBar([
					    {type : "doc", badge: "Badge"},
					    {type : "about"}
							     ])
				  
					// Very Important! No content displays without this line
					]).setStyle({position: "absolute", top: "0", left: "0", bottom: "0", right: "0"})
		       );
  
    // Set the functionality of the menu 
    menu.selectEvent.subscribe(function(id) {
	if (id == 0) {
	  active = "doc";
	  stack.push(badgeCard);
					
	}
					
	if (id == 1) {
				 
	  active = "about";
	  stack.push(aboutCard);
	} //if

      });
    menu.setIndex(0);     

  })();
			






