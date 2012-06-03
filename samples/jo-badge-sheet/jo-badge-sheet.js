/*Jo badge/sheet demo: this is designed to show how Jo can be customized via scripts and CSS to to fit in with iOS UI conventions. This demo makes use of a tab bar for navigation, and includes a notification badge on the tab button. (c) 2012, Kevin Walzer/WordTech Communications LLC.*/


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
	               o.innerHTML = "<span class='badge'>" + data.badge + "</span>";
            
		o.setAttribute("index", index);
               	
		return o;
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
						    new joFlexrow(badgetext = new joInput()),
							     badgebutton = new joButton('Enter'),	
]),
					new joDivider(),
					slidebutton = new joButton('Display Action Sheet'),
				   	
				    ])
  );

				   
      badgetext.container.placeholder='Enter badge text here';

 /*Action alert that slides up.*/
 slideCard = [
     new joTitle('Action Sheet'),
	new joHTML('E-mail a friend about Jo.'),
	new joDivider(), 
	 mailbutton = new joButton('E-mail'),
	 new joDivider(),	 
       closebutton = new joButton('Close Sheet'),
        ];

/*About Jo.*/
     aboutCard = new joCard([
	 new joTitle('About Jo'),
	 datastring = new joHTML('This is a demonstration of some of the customization you can do with the Jo JavaScript framework. This demo displays some iOS-style touches such as a tab bar for navigation, a notification badge on the tab icon, and an action-sheet dialog.'),
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
	    scn.showPopup(slideCard);					     
	}) 

     /*Hide action sheet.*/
     closebutton.selectEvent.subscribe(function() { 
	 scn.hidePopup(slideCard);
	 menu.refresh();
	 
	})
      
    // Set up the page elements		
    scn = new joScreen(
		       new joContainer([
			   stack = new joStackScroller(),
				    
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
			






