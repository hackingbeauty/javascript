(function(){
	
	if(!window.PayPal){window.PayPal = {}}
	
	var MiniCart = {
		init:function(){
			console.log(products.length);
			
		},
		
	}
	
	var Product = function(name,quantity,price){
		this.name = name;
		this.quantity = quantity;
		this.price = price;
		this.subtotal;
		this.updateProduct = function(quantity,price){
			
		}
	}

	function addEvent(obj, event, fn, capture) {
		if (obj.addEventListener) {
			obj.addEventListener(event, fn, capture);
			return true;
		} else if (obj.attachEvent) {
			// wrap IE's callback and normalize the event
			var wrapperFn = function () {
				var e = window.event;
				e.target = e.target || e.srcElement;
				
				e.preventDefault = function () {
					window.event.returnValue = false;
				};
				
				fn.call(obj, e);
			};
			
			return obj.attachEvent('on' + event, wrapperFn);
		}
	}
	
	addEvent(window,'load',MiniCart.init)
	
}());
