/**
	joDefer
	=======
	
	Utility function which calls a given method within a given context after `n`
	milliseconds with optional static data.

	Use
	-----
	
		joDefer(Function, context, delay, data);
	
	Note that delay defaults to 100ms if not specified, and `data` is optional.

	joYield
	=======
	
	Deprecated, use joDefer instead.

*/
function joDefer(call, context, delay, data) {
	if (!delay)
		delay = 100;

	if (!context)
		context = this;
		
	var timer = window.setTimeout(function() {
		call.call(context, data);
	}, delay);
	
	return timer;
}

joDefer.cancel = function(timer) {
	window.clearTimeout(timer);
}

joYield = joDefer;