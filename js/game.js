/*
	Dots and Boxes
	(c) Tom Wiesing 2013
*/

var startbutton, aboutbutton, table; //Global variables

/*
	Start a game
*/
var game_start = function(){
	
	var turn = false;

	//start the game
	var h = parseInt($("#gheight").spinner("value"));
	var w = parseInt($("#gwidth").spinner("value"));
	if(isNaN(h) || isNaN(w)){
		alert("Invalid size. Please try again");
		return; 
	}
	
	startbutton.val("Restart game");
	
	//calc actual table width & height
	var aw = 2*w+1;
	var ah = 2*h+1;
	
	table = create_table(aw, ah);
	
	
	//table formating
	var rows_dots = $("");
	var column_dots = $("");
	for(var i=0;i<ah;i=i+2){
		rows_dots = rows_dots.add(table_get_row(i));
	}
	for(var i=0;i<aw;i=i+2){
		column_dots = column_dots.add(table_get_column(i));
	}
	
	var dots = rows_dots.filter(column_dots)
	.removeClass("selectablehort")
	.removeClass("selectablevert")
	.addClass("dot");
	
	var rows = rows_dots.not(dots).addClass("selectablevert");
	var columns = column_dots.not(dots).addClass("selectablehort");

	$("#table").html("").append(table).append("<br>")
	.append("<span id='winners'></span><br />Blue: <span id='scoreblue'></span> <br />Red: <span id='scorered'></span>");
		
	game_update();
};

/*
		Update the game
	*/
	var game_update = function(){
		var data = table
		.find(".selectablevert, .selectablehort")
		.off("click")
		.click(function(){
			$(this).addClass("selected");
			game_update();
		});
		
		var did_something = false;
		
		var blue = 0;
		var red = 0;
		
		for(var i=0;i<h;i++){
			for(var j=0;j<w;j++){
				if(!is_taken(i, j) && is_surrounded(i, j)){
					get_table_cell(2*i+1, 2*j+1).addClass("taken").addClass(turn?"takenred":"takenblue");
					did_something = true;
				}
				if(is_taken(i, j)){
					if(get_table_cell(2*i+1, 2*j+1).hasClass("takenred")){
						red++;
					} else {
						blue++;
					}
				}
			}
		}
		
		if(!did_something){
			turn = !turn;
			data
			.removeClass(turn?"blue":"red")
			.addClass(turn?"red":"blue")
		}
		
		$("#scoreblue").text(blue);
		$("#scorered").text(red);
		
		if(blue + red == h*w && blue == red){
			end_game(0);
		} else if(blue > h*w / 2){
			end_game(1);
		} else if(red > h*w / 2){
			end_game(-1);
		}
	};
	
	/*
		End the game
	*/
	var end_game = function(winner){
		//1 = blue wins
		//-1 = red wins
		//0 = tie
		table
		.find(".selectablevert, .selectablehort")
		.removeClass("red").removeClass("blue")
		.off("click");
		
		if(winner == 1){
			$("#winners").text("Blue has more than half the boxes! Blue wins! ");
			$("<div title='Blue wins!'>Blue has more than half the boxes! Blue wins! </div>").dialog({modal: true});
		}
		if(winner == -1){
			$("#winners").text("Red has more than half the boxes! Red wins! ");
			$("<div title='Red wins!'>Red has more than half the boxes! Red wins! </div>").dialog({modal: true});
		}
		if(winner == 0){
			$("#winners").text("Both have the same score! It's a tie!");
			$("<div title='Same score'>Both have the same score! It's a tie!</div>").dialog({modal: true});
		}
	};

/*
	Checks if a square is taken
*/
var is_taken = function(i, j){
	return get_table_cell(2*i+1, 2*j+1).is(".taken");
}

/*
	Checks if a square is surrounded.
*/
var is_surrounded = function(i, j){
	return (get_table_cell(2*i, 2*j+1).is(".selected") && 
		get_table_cell(2*i+2, 2*j+1).is(".selected") && 
		get_table_cell(2*i+1, 2*j).is(".selected") && 
		get_table_cell(2*i+1, 2*j+2).is(".selected"));
}

/*">
	Create a table
	@param	w	Table width
	@param	h	Table height
*/
var create_table = function(w, h){
	var $table = $("<table>");
	var $td = $("<td>");
	var $tr = $("<tr>");
	for(var i=0;i<w;i++){
		$tr.append($td.clone());
	}
	for(var i=0;i<h;i++){
		$table.append($tr.clone());
	}
	return $table;
}

/*
	Get table cell
	@param	i	Table index i
	@param	j	Table index j
*/
var get_table_cell = function(i, j){
	return table.find("tr:nth-child("+(i+1)+") td:nth-child("+(j+1)+")");
}

/*
	Get the ith row of a table. 
*/
var table_get_row = function(i){
	return table.find("tr:nth-child("+(i+1)+")").find("td");
}

/*
	Get the nth column of a table
*/
var table_get_column = function(i){
	return table.find("tr td:nth-child("+(i+1)+")");
}

/*
	Show the about dialog
*/
var about_dialog = function(){
	$("#dialog-about").dialog({modal: true, width: 400, height: 300});
};

$(function(){
	var buttons = $(":button, a.button").button();
	startbutton = buttons.eq(0);
	aboutbutton = buttons.eq(1);
	
	$("#gheight, #gwidth").spinner({
		spin: function(event, ui) {
			if(ui.value<1) {
				$(this).spinner( "value", 1 );
				return false;
			}
		}
	}); 
	
	//Init buttons
	aboutbutton.click(function(){
		about_dialog();
	});
	
	startbutton.click(game_start);
	
	$("#dialog-about").hide();
});