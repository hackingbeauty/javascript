(function(){

	if(!window.TEST) {window['TEST'] = {}}	
		
	var computeSquare= function() {
		var arr = [2,10,20,4,9,11];
		for(var i=0, j=arr.length; i < j; i++){
			var num = arr[i];
			for(k=0,l=arr.length; k < l; k++){
				if(Math.sqrt(arr[k]) == num){
					alert("the is " + arr[k] + "and its square root is " + num);
				}
			}
		}
	}
	window['TEST']['computeSquare'] = computeSquare;
	
	
	var algorithm = function(){
		console.log('boo');
	}
	window.TEST.algorithm = algorithm;
		
	var factorial = function(n){
		var answer;
		if(n==0){
			return 1;
		} else {
			answer = n * factorial(n-1);
			console.log(answer);
			
		}
		return answer;
	}
	window.TEST.factorial = factorial;
	
	//1: 1+(1-1) = 1
	//2: 2+(2-1) = 3
	//3: 3+(3-1) = 5
	//4: 4+(4-1) = 7

	// 1,1,2,3,5,8,13,21
	var fibonnaci = function(n){
		var answer;
		if(n<2){
			return n;
		} else {
			console.log(fibonnaci(n-2) + fibonnaci(n-1));
		}
	}
	window.TEST.fibonnaci = fibonnaci;
		
})();
		
$(document).ready(function(){
	
	// TEST.computeSquare();
	// 
	// TEST.algorithm();
	
	// console.log(TEST.factorial(3));

	console.log(TEST.fibonnaci(5));
	
	// console.log(TEST.fibonnaci(10));
	
});










