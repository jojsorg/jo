//Jo StarterKit
//by ph.charriere@k33g.org
//2010-12-2&

// initialize jo
jo.load();

/*---[DEFINE MAIN SCREEN]---------------------------------------*/
var MainScreen;
var HeaderBar;
var Content;
var LeftView;
var FooterBar;
var Container;
var Box;

/*
MainScreen_(joScreen)
           \_Container_(joContainer)
           |           \_Box_(joFlexcol)
           |                 \_HeaderBar_(HeaderBar)
           |                 \_Content_(joStackScroller) <- joCards 
           |                                                are "inserted" here
           \_FooterBar_(joToolbar)
*/


MainScreen = new joScreen(
	Container = new joContainer([
		Box = new joFlexcol([
			HeaderBar = new joNavbar("HEADER TITLE"),
                        LeftView = new joStackScroller(),
			Content = new joStackScroller()
		]),
		FooterBar = new joToolbar("FOOTER TITLE")
	]).setStyle({
			position: "absolute", 
			top: "0", left: "0", bottom: "0", right: "0"
		})
);


LeftView.setStyle({position:"fixed",float:"left",width:"30%",left:"0"});
Content.setStyle({position:"fixed",float:"right",width:"70%",left:"30%",borderLeft:"solid 1px black"});


/*
link navigation bar(HeaderBar) with stack scroller(Content).
It allows change title of navigation bar with setTitle()
method of joCard.
Other way : HeaderBar.setTitle("Hello");
*/
HeaderBar.setStack(Content); 

/*---[END DEFINE MAIN SCREEN]-----------------------------------*/

/*---[DEFINE MENU CARD]-----------------------------------------*/
var MenuCard;
var Menu;
MenuCard = new joCard([
	Menu = new joMenu([
		{ title: "joOption", id: "joOptionCard" },
		{ title: "joSelect", id: "joSelectCard" },
		{ title: "joToggle", id: "joToggleCard" },
		{ title: "joExpando", id: "joExpandoCard" },
		{ title: "joHTML", id: "joHTMLCard" },
		{ title: "joTextarea", id: "joTextareaCard" },
		{ title: "joList", id: "joListCard" }
	
	]).selectEvent.subscribe(function(id) {
					if (id == "joOptionCard") Content.push(joOptionCard);
					if (id == "joSelectCard") Content.push(joSelectCard);
					if (id == "joToggleCard") Content.push(joToggleCard);
					if (id == "joExpandoCard") Content.push(joExpandoCard);
					if (id == "joHTMLCard") Content.push(joHTMLCard);
					if (id == "joTextareaCard") Content.push(joTextareaCard);
					if (id == "joListCard") Content.push(joListCard);
	
				}, this)
	

]).setTitle("Menu Card (joMenu)");

/*---[END DEFINE MENU CARD]-------------------------------------*/


/*---[DEFINE JOEXPANDO CARD]------------------------------------*/

var joExpandoCard;
var Expando;
var TxtMail;
var TxTwww;

joExpandoCard = new joCard([

	new joGroup([
		Expando = new joExpando([
			new joExpandoTitle("Expando Form"),
			new joExpandoContent([
				new joFlexrow([
					TxtMail = new joInput()
				]),
				new joFlexrow([
					TxTwww = new joInput()
				])
			])
		]).openEvent.subscribe(function() {
			Content.scrollTo(Expando);
			console.log("scrollto");
		})

	]),
	
        /*
	new joButton("To Menu Card").selectEvent.subscribe(function() {
			        Content.push(MenuCard);
	})
        */

]).setTitle("joExpando Card");

TxtMail.container.placeholder = "your.name@your.domain.com";
TxTwww.container.placeholder = "www.your.domain.com";

/*---[END DEFINE JOEXPANDO CARD]--------------------------------*/


/*---[DEFINE JOTOGGLE CARD]-------------------------------------*/

var joToggleCard;
var ToggleOne;
var ToggleTwo;

joToggleCard = new joCard([
	CaptionToggleValue = new joCaption("Switch on/off"),
	new joGroup([

		new joFlexrow([
			new joLabel("Activate").setStyle("left"),
			ToggleOne = new joToggle(true)			
		]),
		new joFlexrow([
			new joLabel("Notify").setStyle("left"),
			ToggleTwo = new joToggle().setLabels(["No", "Yes"])
			
		])	

	]),
	
	new joButton("Get values of toogles").selectEvent.subscribe(function() {
					MainScreen.alert('Hello ...',ToggleOne.getData()+' '+ToggleTwo.getData());
	}),
	
        /*
	new joButton("To Menu Card").selectEvent.subscribe(function() {
			        Content.push(MenuCard);
	})
        */

]).setTitle("joToggle Card");


/*---[END DEFINE JOTOGGLE CARD]---------------------------------*/



/*---[DEFINE JOSELECT CARD]-------------------------------------*/
var joSelectCard;
var CaptionSelectedChoice;
var DropDownList;


joSelectCard = new joCard([
	new joGroup([
		CaptionSelectedChoice = new joCaption("Make your choice"),
		new joDivider(),

		DropDownList = new joSelect(["Item 1", "Item 2", "Item 3", "..."]),

		//new joDivider(),
	]),
	
        /*
	new joButton("To Menu Card").selectEvent.subscribe(function() {
			        Content.push(MenuCard);
	})
        */

]).setTitle("joSelect Card");

DropDownList.selectEvent.subscribe(function(value) {

						switch(value){
						case "0":
							CaptionSelectedChoice.setData("Item 1");
						  	break;
						case "1":
							CaptionSelectedChoice.setData("Item 2");
						  	break;
						case "2":
							CaptionSelectedChoice.setData("Item 3");
						  	break;

						default:
						  	CaptionSelectedChoice.setData("...");
						}
					})

/*---[END DEFINE JOSELECT CARD]---------------------------------*/


/*---[DEFINE JOPTION CARD]--------------------------------------*/
var joOptionCard;
var CaptionOptionChoice;


joOptionCard = new joCard([
	CaptionOptionChoice = new joCaption("Make your choice"),
	new joDivider(),
	new joFlexrow(
		new joOption(
					[
						"Option 1", "Option 2", "Option 3", "..."
					]).selectEvent.subscribe(function(value) {
						//console.log("option selected: " + value);
						switch(value){
						case "0":
							CaptionOptionChoice.setData("Option 1");
						  	break;
						case "1":
							CaptionOptionChoice.setData("Option 2");
						  	break;
						case "2":
							CaptionOptionChoice.setData("Option 3");
						  	break;

						default:
						  	CaptionOptionChoice.setData("Option ...");
						}
					})
	),
	new joDivider()
        /*
	new joButton("To Menu Card").selectEvent.subscribe(function() {
			        Content.push(MenuCard);
	})
        */

]).setTitle("joOption Card");

/*---[END DEFINE JOPTION CARD]----------------------------------*/

/*---[DEFINE JOHTML CARD]---------------------------------------*/
var joHTMLCard;
var ButtonGoToJoTextareaCard;
//var ButtonGoToMenuCard;
var htmlCode = new joHTML([
			'<h1>Card One</h1>',
			'	<p>',
			'		This is a JoApp StarterKit',
			'		Have fun ...',			
			'	</p>'
].join(""));
var Group;

joHTMLCard = new joCard([
	new joLabel('This is a Label'),
	Group = new joGroup(htmlCode),
	new joCaption('This is a Caption'),
	new joDivider(),
	ButtonGoToJoTextareaCard = new joButton("To joTextareaCard").selectEvent.subscribe(function() {
				        Content.push(joTextareaCard);
				        FooterBar.setTitle("joTextarea Card");
				    })
	/*
        ButtonGoToMenuCard = new joButton("To Menu Card").selectEvent.subscribe(function() {
				        Content.push(MenuCard);
				    })
        */

]).setTitle("joHTML Card");

/*---[END DEFINE JOPTION CARD]----------------------------------*/


/*---[DEFINE JOTEXTAREA CARD]-----------------------------------*/
var joTextareaCard;
var ButtonGoToJoHTMLCard;
var TextArea1;
var TextArea2;

joTextareaCard = new joCard([
	new joGroup([
		TextArea1 = new joTextarea("Type your text ...."),
		new joFlexrow(
		TextArea2 = new joTextarea("Type your text ....").setStyle({
							minHeight: "100px",
							maxHeight: "300px"
						}) 
		),
		
		/*
			TextArea2 is an auto-sized Text Area because embeded in a joFlexrow
		*/
		
		new joDivider(),
		new joButton("PopUp").selectEvent.subscribe(function() {
					        MainScreen.alert('Hello ...','... World !!!');
					        TextArea1.setData('Text has changed');
					    })
	
	]),

	new joFooter([
		new joDivider(),
		ButtonGoToJoHTMLCard = new joButton("To joHTMLCard").selectEvent.subscribe(function() {
					        Content.push(joHTMLCard);
					    })
	])
	/*
	new joButton("To Menu Card").selectEvent.subscribe(function() {
			        Content.push(MenuCard);
	})
        */

]).setTitle("joTextarea Card");

/*---[END DEFINE JOTEXTAREA CARD]-------------------------------*/

/*---[DEFINE JOLIST CARD]---------------------------------------*/
var joListCard;
var DataSource = ["Row 1", "Row 2", "Row 3", "Row 4"];
var ListControl;
var Index = 4;

joListCard = new joCard([
	ListControl = new joList(DataSource).setAutoSort(true).selectEvent.subscribe(function(){
		MainScreen.alert(ListControl.getValue()+' '+DataSource[ListControl.getValue()]);
	}), 
	new joDivider(),
	
	new joButton("Add Item").selectEvent.subscribe(function() {
		Index++;
		DataSource.push("Row "+Index);
		//Refresh ListControl
		ListControl.refresh();
		})
	/*
	new joButton("To Menu Card").selectEvent.subscribe(function() {
			        Content.push(MenuCard);
		})
        */
]).setTitle("joList Card");
/*---[END DEFINE JOLIST CARD]-----------------------------------*/

LeftView.push(MenuCard);
Content.push(joOptionCard);