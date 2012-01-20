

var screen, nav, stack, tabBar, scrollbar;
screen = new joScreen(
  new joContainer([
    nav = new joNavbar(),
    stack = new joStack(),
    tabBar = new joToolbar([
    	"Some buttons would usually go here"
    ])
  ]).setStyle({position: "absolute", top: "0", left: "0", bottom: "0", right: "0"}) 
);
nav.setStack(stack);
stack.push(
  new joScroller([
    new joCard([
      "Typically a bunch of content objects are defined here."
    ])
  ]).setTitle("View Title to Appear in Nav").addScrollbar(
     scrollbar = new joScrollbar(null, true)
  );
);
scrollbar.calibrate();
