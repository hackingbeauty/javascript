/** 
 * The PayPal Mini Cart is a great way to improve your PayPal Cart integration 
 * by creating an overlay on your e-commerce website which appears as a user
 * adds a product to their cart. This results in a smoother user experience 
 * for the customers and they never need to leave your website until they're 
 * ready to checkout!
 * 
 * To use simply include the script on any PayPal Cart enabled page. There's a 
 * few settings which are customizable through a custom object, MiniCart, which
 * needs to be included before the script. For example:
 *
 *  var MiniCart = {
 *	// The edge of the page the cart should pin to. "L" or "R"
 *	displayEdge: 'R',
 *
 *	// Distance from the edge the cart should appear.
 *	edgeDistance: '50px',
 *
 *	// The base path of your website to set the cookie for.
 *	cookiePath: '/',
 *
 *	// The symbol which appears before the price and subtotal.
 *	currencySymbol: '$',
 *
 *	// Function run before the "checkout" form is processed.
 *	onCheckout: function () { ... },
 *
 *	// Function run before a product is added. The product is passed.
 *	onAddToCart: function (product) { ... },
 *
 *	// Function run before the total is updated.
 *	onUpdateTotal: function () { ... }
 * };
 * 
 * Author: Jeff Harrell
 * Version: 1.3
 * Website: https://minicart.paypal-labs.com/
 */



if (typeof MiniCart === 'undefined') { MiniCart = {}; }


(function () {
	
	var cart, itemList, summaryInfo, actionButton, subTotal;
	
	
	function init() {
		// status checks
		if (document.getElementById('PPMiniCart')) { return; }

		// set defaults
		MiniCart.displayEdge = (MiniCart.displayEdge === 'L') ? 'left' : 'right';
		MiniCart.edgeDistance = MiniCart.edgeDistance || '50px';
		MiniCart.cookiePath = MiniCart.cookiePath || '/';
		MiniCart.currencySymbol = MiniCart.currencySymbol || '$';
		MiniCart.base = MiniCart.base || 'https://minicart.paypal-labs.com/';
		MiniCart.subdomain = MiniCart.subdomain || 'www';
		MiniCart.products = [];
		MiniCart.settings = {};
		
		// create and setup the cart
		hijackForms();
		createCart();
		loadData();

		// hide the cart for all non-cart related clicks 
		addEvent(document, 'click', function (e) {
			if (parseInt(cart.style.top, 10) === 0) {
				var target = e.target;
				
				if (!(/input|button|select|option/i.test(target.tagName))) {
					while (target.nodeType === 1) {
						if (target === cart) {
							return;
						}
					
						target = target.parentNode;
					}
					cart.hide();
				}
			}
		});	
	}
	
	
	function createCart() {			
		// form
		cart = createElement('form', null, { 
			show: showCart,
			hide: hideCart,
			add: addToCart,
			style: {
				position: 'fixed', 
				styleFloat: 'none', 
				cssFloat: 'none', 
				top: '-250px', 
				width: '265px',
				minHeight: '155px',
				background: '#fff url(' + MiniCart.base + 'images/paypal_logo.gif) no-repeat 10px 15px',
				border: '1px solid #999',
				borderTop: '0',
				margin: '0',
				padding: '50px 10px 0',
				fontSize: '13px',
				fontFamily: 'arial',
				color: '#333',
				opacity: '0.9',
				filter: 'alpha(opacity=95)',
				MozBorderRadius: '0 0 8px 8px',
				WebkitBorderBottomLeftRadius: '8px',
				WebkitBorderBottomRightRadius: '8px'
			}
		});
		cart.style[MiniCart.displayEdge] = MiniCart.edgeDistance;
			
		// list of items
		itemList = createElement('ul', null, {
			style: {
				position: 'relative',
				overflowX: 'hidden',
				overflowY: 'auto',
				minHeight: '113px',
				margin: '0 0 7px',
				padding: '0',
				listStyleType: 'none',
				borderTop: '1px solid #ccc',
				borderBottom: '1px solid #ccc'
			}
		}, cart);
		
		// checkout button
		actionButton = createElement('a', 'Checkout', {
			href: '#',
			style: {
				position: 'absolute',
				right: '10px',
				margin: '4px 0 0',
				padding: '1px 4px',
				textDecoration: 'none',
				fontWeight: 'normal',
				color: '#000',
				background: '#ffa822 url(' + MiniCart.base + 'images/button_submit.gif) repeat-x left center',
				border: '1px solid #d5bd98',
				borderRightColor: '#935e0d',
				borderBottomColor: '#935e0d'
			}
		});
		addEvent(actionButton, 'click', doCheckout);
				
		// subtotal
		subTotal = createElement('span', 'Subtotal: ');
		subTotal.amount = createElement('span', '0.00');
		subTotal.appendChild(subTotal.amount);	
		
		// shipping
		var shippingNotice = createElement('span', 'does not include shipping & tax', {
			style: {
				display: 'block',
				fontSize: '10px',
				fontWeight: 'normal',
				color: '#999'
			}
		});

		// summary
		summaryInfo = createElement('p', [actionButton, subTotal, shippingNotice], {
			style: {
				margin: '0',
				padding: '0 0 0 20px',
				background: 'url(' + MiniCart.base + 'images/arrow_down.gif) no-repeat left center',
				fontWeight: 'bold',
				fontSize: '13px'
			},
			onmouseover: function () { 
				this.style.cursor = 'pointer'; 
			},
			onmouseover: function () {
				this.style.cursor = 'pointer';
			},
			onclick: function () {
				if (parseInt(cart.style.top, 10) === 0) {
					cart.hide();
				} else {
					cart.show();
				}
			}
		}, cart);

		// add it to the page in a container
		var container = createElement('div', cart, { 
			id: 'PPMiniCart',
			style: {position: 'absolute', zIndex: '999', textAlign: 'left' }
		}, document.body);

		
		// workaround: IE 6 and IE 7/8 in quirks mode do not support fixed positioning
		var ie = navigator.userAgent.match(/MSIE\s([^;]*)/);

		if (ie && !window.opera) {
			var version = parseFloat(ie[1]);
			if (version < 7 || (version >= 7 && document.compatMode === 'BackCompat')) {
				cart.style.position = 'absolute';
				container.style[MiniCart.displayEdge] = '0';
				container.style.setExpression('top', 'x = document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop');
			}
		}
	}
	
	
	function showCart() {
		var fromValue = parseInt(this.style.top, 10);
		var toValue = 0;
		
		animate(this, 'top', { from: fromValue, to: toValue });
		summaryInfo.style.backgroundImage = 'url(' + MiniCart.base + 'images/arrow_up.gif)';
	}
	
	
	function hideCart() {
		var cartHeight = (this.offsetHeight) ? this.offsetHeight : document.defaultView.getComputedStyle(this, '').getPropertyValue('height');
		var summaryHeight = (summaryInfo.offsetHeight) ? summaryInfo.offsetHeight : document.defaultView.getComputedStyle(summaryInfo, '').getPropertyValue('height');
		
		var fromValue = parseInt(this.style.top, 10);
		var toValue = ((cartHeight - summaryHeight - 8) * -1);

		animate(this, 'top', { from: fromValue, to: toValue });
		summaryInfo.style.backgroundImage = 'url(' + MiniCart.base + 'images/arrow_down.gif)';
	}
	
	
	function addToCart(product) {
		// pre-processing callback
		if (typeof MiniCart.onAddToCart === 'function') {
			if (MiniCart.onAddToCart(product) === false) {
				return;
			}
		}
		
		// workaround: add in a blank element so the numbers don't out of sync
		if (!product.item_name && !product.item_number) {
			var emptyItem = createElement('input', null, { type: 'hidden', disabled: true });		
			var emptyLine = createElement('li', emptyItem, { style: { display: 'none' } }, itemList);

			return false;
		}
			
		// name
		var name = '', fullname = [], meta = [], i = 0;
		
		if (product.item_number) { meta.push('#' + product.item_number); }
		if (product.item_name) { name = product.item_name; }

		fullname.push(name);
		name = (name.length > 20) ? name = name.substr(0, 20) + '...' : name;
		
		var itemName = createElement('a', name, {
			href: document.location.href,
			style: {
				textDecoration: 'none',
				border: '0',
				color: '#333'
			}
		});
		
		// options
		while (typeof product['on' + i] !== 'undefined') {
			meta.push(product['on' + i] + ': ' + product['os' + i]);	
			i++;
		}
		
		meta = meta.join('<br />');
		fullname.push(meta);
		
		var itemOptions = createElement('span', null, {
			style: {
				display: 'block',
				fontSize: '10px',
				color: '#999'
			}
		}, itemName);

		itemOptions.innerHTML = meta;
		
		// quantity
		var quantity = (parseInt(product.quantity, 10) > 0) ? parseInt(product.quantity, 10) : 1;
		
		var itemQty = createElement('input', null, {
			name: 'quantity_' + product.offset,
			value: product.quantity,
			type: 'text',
			style: {
				position: 'absolute',
				right: '78px',
				width: '22px',
				border: '1px solid #83a8cc',
				padding: '1px',
				textAlign: 'right'
			},
			onblur: function () {
				var value = parseInt(this.value, 10);
				value = (isNaN(value)) ? 1 : value;

				if (value === 0) {
					MiniCart.products[product.offset - 1] = {};
					saveData();

					this.value = '';
					
					animate(item, 'opacity', { from: 1, to: 0 }, function () {
						animate(item, 'height', { from: 18, to: 0 }, function () {
							item.style.display = 'none';
						});
					});
				} else {
					MiniCart.products[product.offset - 1].quantity = value;
					saveData();	
				}

				updateSubTotal();
			}
		});
			
		
		// delete button
		var itemX = createElement('img', null, {
			src: MiniCart.base + 'images/x.gif',
			style: {
				position: 'absolute',
				right: '63px',
				top: '9px',
				cursor: 'pointer'
			},
			onclick: function () {
				itemQty.value = '0';
				itemQty.focus();
				itemQty.blur();
			}
		});

		// price
		var price = getItemPrice(product);
		var itemPrice = createElement('span', MiniCart.currencySymbol + price.toFixed(2), {
			style: {
				position: 'absolute',
				right: '4px'	
			}
		});
		
		// item
		var item = createElement('li', [itemQty, itemX, itemPrice, itemName], {
			style: {
				position: 'relative',
				margin: '-1px 0 0',
				padding: '6px 5px 6px 0',
				opacity: '0',
				borderTop: '1px solid #f2f2f2'
			}, 
			title: fullname.join(' ')
		}, itemList);
		
		animate(item, 'opacity', { from: 0, to: 1 });
			
		// update the subtotal	
		updateSubTotal();

		return true;
	}
	
	
	function getItemPrice(product) {
		var price = parseFloat(product.amount, 10);
		if (isNaN(price)) { price = 0; }
		
		var option_index = (product.option_index) ? product.option_index : '0';

		if (product['os' + option_index]) {
			var i = 0;

			while (typeof product['option_select' + i] !== 'undefined') {
				if (product['option_select' + i] === product['os' + option_index]) {
					price += parseFloat(product['option_amount' + i]);
					break;
				}
				i++;
			}
		}
		
		return price;
	}

	
	function updateSubTotal() {
		// pre-processing callback
		if (typeof MiniCart.onUpdateTotal === 'function') {
			MiniCart.onUpdateTotal();
		}
		
		var subtotal = 0, product, i;
		
		for (i = 0; i < MiniCart.products.length; i++) {
			product = MiniCart.products[i];
			
			if (product.quantity) {
				subtotal += getItemPrice(product) * parseInt(product.quantity, 10);
			}
		}
		
		var currency = MiniCart.settings['currency_code'] || 'USD';
		subTotal.amount.innerHTML = subtotal.toFixed(2) + ' ' + currency; 
		
		// fade it in
		var level = 1;
		
		(function fade() {
			var hex = level.toString(16);
			subTotal.style.backgroundColor = '#ffff' + hex + hex;
			level += 2;

			if (level >= 15) {
				subTotal.style.backgroundColor = 'transparent';
				return;
			}

			setTimeout(fade, 50);
		}());
	}
	
	
	function hijackForms() {
		var forms = document.getElementsByTagName('form');
	
		var add = function (event) { 
			event.preventDefault();
			
			var data = {};
			data.quantity = 1;
			data.offset = MiniCart.products.length + 1;
			
			// unencrypted button
			if (this.cmd.value === '_cart') {
				for (i = 0; i < this.elements.length; i++) {
					if (/^(?:item_number|item_name|amount|quantity|on|os|option_|tax|weight|handling|shipping)/.test(this.elements[i].name)) {
						data[this.elements[i].name] = this.elements[i].value;
					}
				}
			}
			
			submitForm.call(this, data);
		};

		var show = function (event) { 
			event.preventDefault();
			cart.show();
		};
		
		for (var i = 0; i < forms.length; i++) {
			var form = forms[i];
			
			// look for all cmd forms on the page
			if (form.cmd && form.cmd.value === '_cart') {
				if (form.add) {
					addEvent(form, 'submit', add);
				} else if (form.display) {
					addEvent(form, 'submit', show);
				}
			}
		}
	}
	
	
	function submitForm(data) {
		// see if any of the generic settings on this form have not been populated in the main cart yet
		for (var j = 0; j < this.elements.length; j++) {
			if (/^(?:business|currency_code|lc|paymentaction|no_shipping|cn|no_note|invoice|handling_cart|weight_cart|weight_unit|tax_cart|page_style|image_url|cpp_|cs|cbt|return|cancel_return|notify_url|rm|custom)/.test(this.elements[j].name)) {
				MiniCart.settings[this.elements[j].name] = this.elements[j].value;
			}
		}
		
		// check the products to see if this variation already exists; if it does update it's quantity
		for (var i = 0; i < MiniCart.products.length; i++) {
			if ((!this.elements.item_name || MiniCart.products[i].item_name === this.elements.item_name.value) &&
				(!this.elements.item_number || MiniCart.products[i].item_number === this.elements.item_number.value) && 
				(!this.elements.os0 || MiniCart.products[i].os0 === this.elements.os0.value) &&
				(!this.elements.os1 || MiniCart.products[i].os1 === this.elements.os1.value)) {
				
					var input = cart.elements[MiniCart.products[i].offset - 1];

					// trigger the update function
					if (input) {
						input.value = ++MiniCart.products[i].quantity;
						input.focus();
						input.blur();
				
						cart.show();
					}
					
					return;
			}
		}
		
		// else add a new product
		MiniCart.products.push(data);
		saveData();
	
		cart.add(data);
		cart.show();
	}
	

	function doCheckout(e) {
		e.preventDefault();

		if (MiniCart.products.length > 0) {
			// pre-processing callback
			if (typeof MiniCart.onCheckout === 'function') {
				if (MiniCart.onCheckout() === false) {
					return;
				}
			}
			
			var form = createElement('form', null, { 
				action: 'https://' + MiniCart.subdomain + '.paypal.com/cgi-bin/webscr',
				method: 'post',
				style: { display: 'none'}
			});
			
			var addInput = function (name, value) {
				var input = createElement('input');
				input.type = 'hidden';
				input.name = name;
				input.value = value;
				form.appendChild(input);
			};
			
			// add the settings
			addInput('cmd', '_cart');
			addInput('upload', '1');
			addInput('bn', 'MiniCart_AddToCart_WPS_US');
			
			var i, j, k;

			for (k in MiniCart.settings) {
				addInput(k, MiniCart.settings[k]);
			}
		
			// add the products
			for (i = 0, j = 0; i < MiniCart.products.length; i++) {
				var product = MiniCart.products[i];
				
				if (product.quantity > 0) {
					j++;
					
					// third part carts don't like option price; override the amount with the complete price
					product['amount'] = getItemPrice(product);
							
					for (k in product) {
						addInput(k + '_' + j, product[k]);
					}
				}
			}

			document.body.appendChild(form);
		
			setTimeout(function () {
				form.submit();
			}, 50);
		}
	}
	
	
	function loadData() {
		try {
			// load the data from the cookie
			var data = function () {
				var name = 'minicart=';
				var cookies = document.cookie.split(';');

				for (var i = 0; i < cookies.length; i++) {
					var cookie = cookies[i];

					while (cookie.charAt(0) === ' ') { 
						cookie = cookie.substring(1, cookie.length);
					}

					if (cookie.indexOf(name) === 0) {
						var data = cookie.substring(name.length, cookie.length);
						return JSON.parse(unescape(data));
					}
				}

				return null;
			}();

			// if loaded then process it and populate the cart
			if (data) {
				MiniCart.settings = data.settings;
				MiniCart.products = data.products;
				

				var show = false;				

				for (var i = 0; i < MiniCart.products.length; i++) {	
					if (cart.add(MiniCart.products[i])) {
						show = true;
					}
				}
				
				data = null;
				

				if (show) {
					setTimeout(function () { cart.hide(); }, 250);
				} else {
					MiniCart.settings = {};
					MiniCart.products = [];

					deleteData();
				}
			}
		} catch(e) {}
	}
	

	function saveData(duration) {
		duration = duration || 30;
		
		var date = new Date();
		date.setTime(date.getTime() + duration * 24 * 60 * 60 * 1000);
		
		var data = {
			'settings': MiniCart.settings,
			'products': MiniCart.products
		};
	
		document.cookie = 'minicart=' + escape(JSON.stringify(data)) + '; expires=' + date.toGMTString() + '; path=' + MiniCart.cookiePath;
	}
	
	
	function deleteData() {
		saveData(-1);
	}
	
	
	function animate(el, prop, config, callback) {
		config = config || {};
		config.from = config.from || 0;
		config.to = config.to || 0;
		config.duration = config.duration || 10;
		config.unit = (/top|bottom|left|right|width|height/.test(prop)) ? 'px' : '';
		
		var step = (config.to - config.from) / 20;
		var current = config.from;
		
		(function func() {
			el.style[prop] = current + config.unit;
			current += step;
			
			if ((step > 0 && current > config.to) || (step < 0 && current < config.to) || step === 0) {
				el.style[prop] = config.to + config.unit;
				
				if (typeof callback === 'function') {
					callback();
				}
				
				return;
			}
			
			setTimeout(func, config.duration);
		})();
	}
	
	
	function createElement(type, children, attrs, parent) {
		var x, y, el = document.createElement(type);
		
		for (x in attrs) {
			if (x === 'style') {
				for (y in attrs[x]) {
					el.style[y] = attrs[x][y];
				}
			} else {
				el[x] = attrs[x];
			}
		}
		
		if (children) {
			if (typeof children === 'string') {
				el.appendChild(document.createTextNode(children));
			} else if (typeof children === 'object' && children.length > 0) {
				for (x = 0; x < children.length; x++) {
					el.appendChild(children[x]);
				}
			} else {
				el.appendChild(children);
			}
		}
		
		if (parent) { 
			parent.appendChild(el);
		}
		
		return el;
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
	

	addEvent(window, 'load', init);	
	
}());


// JSON Parser - http://www.json.org/js.html
if(!this.JSON){JSON={};}(function(){function f(n){return n<10?"0"+n:n;}if(typeof Date.prototype.toJSON!=="function"){Date.prototype.toJSON=function(key){return this.getUTCFullYear()+"-"+f(this.getUTCMonth()+1)+"-"+f(this.getUTCDate())+"T"+f(this.getUTCHours())+":"+f(this.getUTCMinutes())+":"+f(this.getUTCSeconds())+"Z";};String.prototype.toJSON=Number.prototype.toJSON=Boolean.prototype.toJSON=function(key){return this.valueOf();};}var cx=/[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,escapable=/[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,gap,indent,meta={"\b":"\\b","\t":"\\t","\n":"\\n","\f":"\\f","\r":"\\r",'"':'\\"',"\\":"\\\\"},rep;function quote(string){escapable.lastIndex=0;return escapable.test(string)?'"'+string.replace(escapable,function(a){var c=meta[a];return typeof c==="string"?c:"\\u"+("0000"+a.charCodeAt(0).toString(16)).slice(-4);})+'"':'"'+string+'"';}function str(key,holder){var i,k,v,length,mind=gap,partial,value=holder[key];if(value&&typeof value==="object"&&typeof value.toJSON==="function"){value=value.toJSON(key);}if(typeof rep==="function"){value=rep.call(holder,key,value);}switch(typeof value){case"string":return quote(value);case"number":return isFinite(value)?String(value):"null";case"boolean":case"null":return String(value);case"object":if(!value){return"null";}gap+=indent;partial=[];if(Object.prototype.toString.apply(value)==="[object Array]"){length=value.length;for(i=0;i<length;i+=1){partial[i]=str(i,value)||"null";}v=partial.length===0?"[]":gap?"[\n"+gap+partial.join(",\n"+gap)+"\n"+mind+"]":"["+partial.join(",")+"]";gap=mind;return v;}if(rep&&typeof rep==="object"){length=rep.length;for(i=0;i<length;i+=1){k=rep[i];if(typeof k==="string"){v=str(k,value);if(v){partial.push(quote(k)+(gap?": ":":")+v);}}}}else{for(k in value){if(Object.hasOwnProperty.call(value,k)){v=str(k,value);if(v){partial.push(quote(k)+(gap?": ":":")+v);}}}}v=partial.length===0?"{}":gap?"{\n"+gap+partial.join(",\n"+gap)+"\n"+mind+"}":"{"+partial.join(",")+"}";gap=mind;return v;}}if(typeof JSON.stringify!=="function"){JSON.stringify=function(value,replacer,space){var i;gap="";indent="";if(typeof space==="number"){for(i=0;i<space;i+=1){indent+=" ";}}else{if(typeof space==="string"){indent=space;}}rep=replacer;if(replacer&&typeof replacer!=="function"&&(typeof replacer!=="object"||typeof replacer.length!=="number")){throw new Error("JSON.stringify");}return str("",{"":value});};}if(typeof JSON.parse!=="function"){JSON.parse=function(text,reviver){var j;function walk(holder,key){var k,v,value=holder[key];if(value&&typeof value==="object"){for(k in value){if(Object.hasOwnProperty.call(value,k)){v=walk(value,k);if(v!==undefined){value[k]=v;}else{delete value[k];}}}}return reviver.call(holder,key,value);}cx.lastIndex=0;if(cx.test(text)){text=text.replace(cx,function(a){return"\\u"+("0000"+a.charCodeAt(0).toString(16)).slice(-4);});}if(/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,"@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,"]").replace(/(?:^|:|,)(?:\s*\[)+/g,""))){j=eval("("+text+")");return typeof reviver==="function"?walk({"":j},""):j;}throw new SyntaxError("JSON.parse");};}}());
