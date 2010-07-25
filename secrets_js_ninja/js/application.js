// (function(){
// })();
// 		
// //All functions that need to be executed after page load go here
// $(document).ready(function(){
// 	$('#phone_input').phoneFormat(this);
// });


function Ninja(){
	var slices =0;
	
	this.getSlices = function(){
		return slices;
	};
	
	this.slice = function(){
		slices++
	};
}

var ninja = new Ninja();
console.log(ninja.slices);
console.log(ninja.getSlices() ==1, "We're able to access the internal slice data." );
console.log(ninja.slices === undefined, "And the private data is inaccessible to us."); 








