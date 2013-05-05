/*
	Dots and Boxes - Game.js
	(c) Tom Wiesing 2013

	This work is licensed under the Creative Commons Attribution-NonCommercial 3.0 Unported License. 
	To view a copy of this license, visit http://creativecommons.org/licenses/by-nc/3.0/ or 
	send a letter to Creative Commons, 444 Castro Street, Suite 900, Mountain View, California, 94041, USA.
*/

var startbutton, table, turn, playercount, Player_Colors, layout; //Global variables

Player_Colors = ["red", "blue", "green", "yellow", "orange", "cyan"];

/*
	Start a game
*/
var game_start = function(){
	
	turn = -1; //reset turns

	playercount = parseInt($("#playercount").spinner("value"));

	var h = parseInt($("#gheight").spinner("value"));
	var w = parseInt($("#gwidth").spinner("value"));
	
	if($("#layouttype").val() == "box"){
		layout = BoxLayout(w, h);
	} else if($("#layouttype").val() == "triangle"){
		layout = TriangleLayout(w);
	}
	
	
	if(isNaN(h) || isNaN(w) || isNaN(playercount)){
		alert("Please enter valid numbers! ");
		return; 
	}
	
	startbutton.val("Restart game");
	
	//calc actual table width & height
	var aw = 2*layout.maxX+3;
	var ah = 2*layout.maxY+3;
	
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
	.addClass("dot");
	
	dots = dots.filter(function(i, e){
		var dot = $(e);
		if(!DotIsInLayout(dot.data("x"), dot.data("y"))){
			dot.addClass("undot"); 
		} else {
			return true;
		}
		return true;
	});
	
	var rows = rows_dots.not(dots).addClass("selectablevert").filter(function(i, e){
		var cell = $(e);
		if(!LineIsInLayout(cell.data("x"), cell.data("y"))){
			cell.removeClass("selectablevert").addClass("unselectablevert");
			return false;
		}
		return true;
	});
	
	var columns = column_dots.not(dots).addClass("selectablehort").filter(function(i, e){
		var cell = $(e);
		if(!LineIsInLayout(cell.data("x"), cell.data("y"))){
			cell.removeClass("selectablehort").addClass("unselectablehort");
			return false;
		}
		return true;
	});;

	$("#gamearea").html("").append(table);
		
	game_update();
};

/*
	Update the game
*/
var game_update = function(){
	var data = table
	.find(".selectablevert, .selectablehort")
	.off("click")
	.off("mouseenter mouseleave")
	.removeAttr("style")
	.not(".selected")

	.click(function(){
		$(this).addClass("selected");
		game_update();
	});

	var did_something = false;
	
	var points = []
	for(var i=0;i<playercount;i++){
		points.push(0);		
	}
	
	for(var i=0;i<=layout.maxX;i++){
		for(var j=0;j<=layout.maxY;j++){
			if(BoxIsInLayout(2*i+1, 2*j+1)){
				if(!is_taken(i, j) && is_surrounded(i, j)){
					get_table_cell(2*i+1, 2*j+1)
					.addClass("taken")
					.css("background-color", getplayercolor(turn))
					.data("playerId", turn);
					did_something = true;
				}
				
				if(is_taken(i, j)){
					points[
						get_table_cell(2*i+1, 2*j+1).data("playerId")
					]++;
				}
			}
		}
	}
	
	if(!did_something){
		turn = (turn + 1) % playercount;
	}

	data
	.hover(function(){
		$(this).css("background-color", getplayercolor(turn));
	}, function(){
		$(this).removeAttr("style");
	});
	
	var scoreNode = $("#scores").html("");

	if(gameHasWinner(points)){
		scoreNode.append("The first place can no longer change. <br />");		
	} else {
		scoreNode.append("<br />");		
	}
	
	var ranking = makePlayerRanking(points, playercount);
	
	var taken = 0;
	
	for(var i=0;i<ranking.length;i++){
		for(var j=0;j<ranking[i].length;j++){
			var player = ranking[i][j];
			var score = points[player];
			var color = getplayercolor(player);
			taken += score; 
			var node = $("<span>").text((i+1).toString()+") Player "+(player+1)+" - "+score+" Boxes").css("background-color", color).width(200);
			scoreNode.append(
				node, 
				$("<br />")
			);
			if(player == turn){node.css("font-weight", "bold");}
		}
	}
	
	scoreNode.append(
		$("<span>").text(""+taken+"/"+(layout.length)+" Boxes occupied. ").width(200), 
		$("<br />")
	);
};

/*
	A Box layout
*/
var BoxLayout = function(width, height){
	var box = [];
	for(var i=0;i<width;i++){
		for(var j=0;j<height;j++){
			box.push([i, j]);
		}
	}
	box.maxX = width-1;
	box.maxY = height-1;
	return box;
};

/*
	A Box layout
*/
var TriangleLayout = function(size){
	var box = [];
	for(var i=0;i<=size;i++){
		for(var j=0;j<i;j++){
			box.push([size-i, size-j-1]);
		}
	}
	box.maxX = size-1;
	box.maxY = size-1;
	return box;
};

/*	

	Checks if a box is in layout
*/
var BoxIsInLayout = function(boxX, boxY){
	var x = (boxX-1) / 2;
	var y = (boxY-1) / 2;
	for(var i=0;i<layout.length;i++){
		if(layout[i][0] == x && layout[i][1] == y){
			return true;
		}
	}
	return false;
};

/*
	Checks if a line is in the layout
*/
var LineIsInLayout = function(lineX, lineY){
	return (
		   BoxIsInLayout(lineX, lineY+1)
		|| BoxIsInLayout(lineX, lineY-1)
		|| BoxIsInLayout(lineX+1, lineY)
		|| BoxIsInLayout(lineX-1, lineY)
	);
}

var DotIsInLayout = function(dotX, dotY){
	return (
		   LineIsInLayout(dotX, dotY+1)
		|| LineIsInLayout(dotX, dotY-1)
		|| LineIsInLayout(dotX+1, dotY)
		|| LineIsInLayout(dotX-1, dotY)
	);
}


/* Get player ranking */
var makePlayerRanking = function(player_scores){
	var arr = [];
	for(var i=0;i<playercount;i++){
		arr.push([i, player_scores[i]]);
	}
	arr.sort(function(left, right){
		return (left[1]>=right[1])?(-1):1;
	});
	var res = [];
	var points = -1;
	for(var i=0;i<playercount;i++){
		var playerid = arr[i][0];
		if(points == arr[i][1]){
			res[res.length-1].push(arr[i][0]);
		} else {
			res.push([arr[i][0]]);
		}

		points = arr[i][1];
	}
	return res;
};

/*
	Check if the game has a winner. 
*/
var gameHasWinner = function(player_scores){
	var total = 0;
	var maxPoints = layout.length;
	for(var i=0;i<player_scores.length;i++){
		total += player_scores[i];
		if(player_scores[i] > (maxPoints) / 2){
			return true;
		}
	}
	return (total == maxPoints);
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

/*
	Get Player Colors
*/
var getplayercolor = function(i){
	return Player_Colors[i];
};

/*
	Create a table
	@param	w	Table width
	@param	h	Table height
*/
var create_table = function(w, h){
	var $table = $("<table>");
	var $td = $("<td>");
	var $tr = $("<tr>");
	for(var i=0;i<w;i++){
		$tr.append($td.clone().data("x", i));
	}
	for(var i=0;i<h;i++){
		var clone = $tr.clone(true);
		clone.find("td").addBack().data("y", i);
		$table.append(clone);
	}
	return $table;
}

/*
	Get table cell
*/
var get_table_cell = function(i, j){
	return table.find("tr:nth-child("+(j+1)+") td:nth-child("+(i+1)+")");
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


//Inititalisation
$(function(){
	var buttons = $(":button, a.button").button();
	startbutton = buttons.eq(0);
	
	$("#gheight, #gwidth").spinner({
		spin: function(event, ui) {
			if(ui.value<1) {
				$(this).spinner( "value", 1 );
				return false;
			}
		}
	}); 

	$("#playercount").spinner({
		spin: function(event, ui) {
			if(ui.value<2) {
				$(this).spinner( "value", 2 );
				return false;
			}
			if(ui.value>Player_Colors.length) {
				$(this).spinner( "value", Player_Colors.length );
				return false;
			}
		}
	}); 
	
	$("#layouttype").change(function(){
		if($(this).val() == "triangle"){
			$("#gheight").spinner("disable");
		} else {
			$("#gheight").spinner("enable");
		}
	});
	
	startbutton.click(game_start);
	
	$("#controls, #about, #scores").hide();
	$("#gamearea").find("span").text("Loading Game... ");
	
	window.setTimeout(function(){
		$("#gamearea").find("span").text("Press start to start a new game. ");

		$("#about").dialog({
			closeOnEscape: false,
			open: function(event, ui) { $(this).parent().find(".ui-dialog-titlebar-close").remove(); },
			position: {
				my: "right top", 
				at: "right top", 
				of: $("body")
			}
		});
	
		$("#controls").dialog({
			closeOnEscape: false,
			open: function(event, ui) {
				$(this).parent().find(".ui-dialog-titlebar-close").remove();
			},
			position: {
				my: "right top", 
				at: "left top", 
				of: $("#about").parent()
			}
		});
	
		$("#scores").dialog({
			closeOnEscape: false,
			open: function(event, ui) {
				$(this).parent().find(".ui-dialog-titlebar-close").remove();
			},
			height: 250,
			position: {
				my: "right top", 
				at: "right bottom", 
				of: $("#controls").parent()
			}
		});
	}, 100);
});
