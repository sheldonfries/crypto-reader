const addColours = () => {
		$('.coin').children('td:nth-child(5n)').each(function () {
			if(parseFloat($(this).text()) > 0.00) {
				$(this).css("color", "green");
			}
			else {
				$(this).css("color", "red");
			}
			$(this).append("<span>%</span>");
		});
		$('.coin').children('td:nth-child(6n)').each(function () {
			if(parseFloat($(this).text()) > 0.00) {
				$(this).css("color", "green");
			}
			else {
				$(this).css("color", "red");
			}
			$(this).append("<span>%</span>");
		});
	}
	
const transpose = (array, length) => {
	var newArray = [];
	for(var i = 0; i < length; i++){
	    newArray.push([]);
	};

	for(var i = 0; i < array.length; i++){
	    for(var j = 0; j < length; j++){
	        newArray[j].push(array[i][j]);
	    };
	};

	return newArray;
}

export { addColours, transpose };
