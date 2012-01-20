var joScrollbar = function(data, hasTabBar) {
  joView.apply(this, arguments);
  this.hasTabBar = hasTabBar;
  this.scroller = null;
  this.calibrate();
};
joScrollbar.extend(joView, {
  tagName: "joscrollbar",

  createContainer: function() {
    var o = joDOM.create(this.tagName);

    if (o)
      o.setAttribute("tabindex", "1");

    var w = joDOM.create("joscrollbarpadding");
    o.appendChild(w);
        
    var s = joDOM.create("joscrollbarslider");
    w.appendChild(s);
    this.slider = s;

    return o;
  },
    
  /*
   * Move the scrollbar slider.
   *
   * scaledPosition - how far to move expressed as a fraction of 
   * visible page size/scrollbar size
   */
  setSliderPosition: function(scaledPosition) {
    var y = -1 * Math.floor(scaledPosition * this.slider.clientHeight);
    this.slider.style.webkitTransform = "translate3d(0, " + y + "px, 0)";
  },
    
  /*
   * We must size the scrollbar correctly: this function must be called 
   * after the scrollbar is inserted into the DOM, and every time the 
   * page changes size - e.g. on orientation change.
   *
   * a) Set the height of the joScrollbar to a useful size
   * b) Set the relative height of the inner slider by looking at the window 
   * and viewport height.
   */
  calibrate: function() {
    if( !this.scroller ) {
      return;
    }; 
        
    // find the jocard element so we can measure its height
    var view = null;
    for( var i = 0, l = this.scroller.container.children.length; i < l; i++ ) {
      if( this.scroller.container.children[i].tagName == "JOCARD" ) {
        view = this.scroller.container.children[i];
      }
    }
    if( !view ) {
      // the thing is not in the DOM yet, so do nothing;
      return;
    }
        
    var viewportHeight = window.innerHeight;
    var viewportWidth = window.innerWidth;
    var viewHeight = view.clientHeight; 

    if( this.hasTabBar ) {
      // 59px is the height of the tab bar in iOS; if you are replicating 
      // that with a joToolbar, then you need to account for its height 
      // in figuring this lot out, otherwise you'll be noticably off.
      viewHeight -= 59;
    }
        
    // some fudge factors to get the scrollbar entirely in the visible page, 
    // below the header and above the footer
    if( viewportHeight > viewportWidth ) {
      var heightFactor = 0.75;
    } else {
      var heightFactor = 0.65;
    }
        
    var setHeight = Math.floor(viewportHeight * heightFactor);
    this.container.style.height = "" + setHeight + "px";
    this.container.firstChild.style.height = "" + (setHeight - 10) + "px";
    
    var scrollerHeight = this.container.clientHeight;
    var sliderHeight = Math.floor(viewportHeight * (scrollerHeight - 10) / viewHeight);
    this.slider.style.height = "" + sliderHeight + "px";
        
    if( sliderHeight < scrollerHeight - 10 ) {
      this.setStyle("active");
    } else {
      this.setStyle("inactive");
    }
        
  }
    
});