jQuery.fn.phoneFormat = function(){
	return this.each(function(e,obj){
		// if (e.keyCode == 9) {
		//   return;
		// }
		var validchars = '0123456789';
		var p = obj.value;
		for (var i = p.length; i >= 0; i--) {
		  if (validchars.indexOf(p.charAt(i)) == -1) {
		    p = p.replace(p.charAt(i), '');
		  }
		}
		if (p.length > 1 && p.charAt(0) != "(") {
		  p = "(" + p;
		}
		if (p.length > 4 && p.charAt(4) != ")") {
		  p = p.substring(0, 4) + ") " + p.substring(4);
		}
		if (p.length > 5 && p.charAt(5) !== " ") {
		  p = p.substring(0, 5) + " " + p.substring(5);
		}
		if (p.length > 9 && p.charAt(9) != "-") {
		  p = p.substring(0, 9) + "-" + p.substring(9);
		}
		for (var xPos = 0; xPos < p.length; xPos++) {
		  if ((p.charAt(xPos) == "-") && (xPos != 9)) {
		    p = p.substring(0, p.length - 1);
		  }
		}
		if (p.length > 14){ 
		    p = p.substring(0, 14);
		}
		obj.value = p;
	});
};