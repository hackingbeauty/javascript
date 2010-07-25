function BinarySearchTree() {
	this._root = null;
}

BinarySearchTree.prototype = {
	//restore constructor
	constructor: BinarySearchTree,
	
	add: function(value){
		//create a new item object, place data in
		var node = {
			value: value,
			left: null,
			right: null
		},
		
		//used to traverse the structure
		current;
		
		//special case: no items in the tree yet
		if (this._root === null) {
			this._root = node;
		} else {
			current = this._root;
			
			while(true){
				
				//if the new value is less than this node's value, go left
				if(value < current.value):
				
					//if there's no left, then the new node belongs there
					if(current.left === null){
						current.left = node;
						break;
					} else {
						current = current.left;
					}
					
				//if the new value is greater than this node's value, go right
				} else if (value > current.value) {
				
					//if there's no right, then the new node belongs there
					if (current.right === null){
						current.right = node;
						break;
					} else {
						current = current.right;
					}
				
				//if the new value is equal to the current one, just ignore
				} else {
					break;
				} 
			}
		}		
	},
	
	contains: function(value){
		var found 	= false,
		    current = this._root;
		
		while(!found && current) {
			
			//if the value is less than the current node's, go left
			if (value < current.value){ 
				current = current.left;
				
			//if the value is greater than the current node's , go right
			} else if (value > current.value) { 
				current = current.right;
			
			// values are equal, found it1
			} else {
				found = true
			}
		}
			
		//only proceed if the node was found
		return found;
	},
	
	remove: function(value){
		
	},
	
	size: function(){
		
	},
	
	toArray: function(){
		
	},
	
	toString: function(){
		
	}
	
};