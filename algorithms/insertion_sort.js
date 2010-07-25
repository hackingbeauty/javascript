function insertionSort(numbers){
  for(var j = 1; j<numbers.length;j++){
    var key = numbers[j];
    var i = j-1;
    while((i >= 0) && (numbers[i] > key)){
      numbers[i+1] = numbers[i];
      i = i - 1;
    }
    numbers[i+1] = key;
  }
  return numbers;
}

var numbers = [23,34,46,87,12,1,66,3,99,1000000,2,57];
print(insertionSort(numbers));