"use strict";

var ctx, w = 700, h = 700;

$(document).ready(function() {
	var canvas = document.getElementById('canvas');
	ctx = canvas.getContext("2d");
	drawRecursive(1);
});

function draw() {
	ctx.beginPath();
	ctx.moveTo(0, 0);
	ctx.lineTo(w, 0);
	ctx.lineTo(w, h);
	ctx.lineTo(w/6, h);
	ctx.lineTo(w/6, h-h/5);
	ctx.lineTo(w-w/4, h-h/5);
	ctx.lineTo(w-w/4, h/3);
	ctx.lineTo(0, h/3);
	ctx.fill();
}

// transform(scaleX, skewX, skewY, scaleY, ofsX, ofsY)
function drawRecursive(step) {
	if (step <= 0) {
		draw();
		return;
	}
	step--;
	ctx.save();
	ctx.save();
	ctx.save();
	ctx.save();
	// T1
	makeTransform(1);
	drawRecursive(step);
	ctx.restore();
	// T2
	makeTransform(2);
	drawRecursive(step);
	ctx.restore();
	// T3
	makeTransform(3);
	drawRecursive(step);
	ctx.restore();
	// T4
	makeTransform(4);
	drawRecursive(step);
	ctx.restore();
}

function makeTransform(i) {
	switch (i) {
		case 1: 
			ctx.transform(0.5, 0, 0, 0.5, 0, 0);
			ctx.fillStyle = "rgb(1, 0, 0)";
		break;
		case 2: 
			ctx.rotate(-90 * Math.PI / 180);
			ctx.transform(0.5, 0, 0, 0.5, -w/2, h/2);
			ctx.fillStyle = "rgb(100, 21, 1)";
		break;
		case 3: 
			ctx.rotate(90 * Math.PI / 180);
			ctx.transform(0.25, 0, 0, 0.25, w/2, -h/2);
			ctx.fillStyle = "rgb(45, 41, 101)";
		break;
		case 4: 
			ctx.transform(-0.5, 0, 0, 0.5, w, h/2);
			ctx.fillStyle = "rgb(10, 101, 32)";
		break;
	}
}

var animInterval = undefined;
var timer = 0;
var max = 75;
function animateTi(i) {
	if (timer++ >= max) {
		clearInterval(animInterval);
		$('button').attr('disabled', false);
		return;
	}
	ctx.save();
	ctx.clearRect(0, 0, w, h);
	var scale = 1 - (timer / max) * 0.5;
	switch (i) {
		case 1:
			ctx.transform(scale, 0, 0, scale, 0, 0);
		break;
		case 2:
			ctx.rotate(-(timer / max) * 1.5708);
			ctx.transform(scale, 0, 0, scale, (-w/2) * (timer/max), (h/2) * (timer/max));
			ctx.fillStyle = "rgb(100, 21, 1)";
		break;
		case 3:
			ctx.rotate((timer / max) * 1.5708);
			ctx.transform(scale/2, 0, 0, scale/2, (w/2) * (timer/max), (-h/2) * (timer/max));
			ctx.fillStyle = "rgb(45, 41, 101)";
		break;
		case 4:
			ctx.transform((scale*3-2), 0, 0, scale, w * (timer/max) , (h/2) * (timer/max));
			ctx.fillStyle = "rgb(10, 101, 32)";
		break;
	}
	draw();
	ctx.restore();
}

var app = angular.module("U1App", []);
app.controller("U1Controller", ["$scope", function($scope) {
	
	$scope.level = 1;
	
	$scope.nextStep = function() {
		ctx.clearRect(0, 0, w, h);
		drawRecursive(++$scope.level);
	};
	
	$scope.previousStep = function() {
		if ($scope.level == 0)
			return;
		ctx.clearRect(0, 0, w, h);
		drawRecursive(--$scope.level);
	};
	
	$scope.animateTransform = function(i) {
		timer = 0;
		animInterval = setInterval(animateTi, 20, i);
		$('button').attr('disabled', true);
	};
}]);