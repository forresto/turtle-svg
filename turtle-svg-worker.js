// Turtle graphics drawing to SVG (?)
var TAU = 2 * Math.PI;

// Reset turtle
var _moveCount = 0;
var _pen = true;
var _pathD = "M 250 250 ";
var _vector = {
  x: 0,
  y: 1
};
var _currentAngle = 0;  

var _accuracy = 1000000000;

// Relative turns, angles are 0.0 to 1.0
var turn = function(){
  _vector.x = Math.round( Math.sin(TAU*_currentAngle) * _accuracy ) / _accuracy;
  _vector.y = Math.round( Math.cos(TAU*_currentAngle) * _accuracy ) / _accuracy;
};

var turnRight, r;
turnRight = r =  function(angle){
  turnLeft(-angle);
};
var turnLeft, l;
turnLeft = l = function(angle){
  _currentAngle += angle;
  _currentAngle = _currentAngle%1;
  turn();
};

// Absolute turn
var turnTo, t;
turnTo = t = function(angle){
  _currentAngle = angle;
  turn();
};

// Drawing
var penUp, u;
penUp = u = function(){
  _pen = false;
};
var penDown, d;
penDown = d = function(){
  _pen = true;
};

// Relative moves
var moveForward, f;
moveForward = f = function (distance) {
  _pathD += _pen ? "l " : "m ";
  var x = Math.round( distance * _vector.x * _accuracy) / _accuracy;
  var y = Math.round( distance * _vector.y * _accuracy) / _accuracy;
  _pathD += x + " " + y + " ";
  _moveCount++;
}

// SVG path 
// Absolute move
var Move = function (x, y) {
  _pathD += "M " + x + " " + y + " ";
  _moveCount++;
}
// Relative move
var move = function (x, y) {
  _pathD += "m " + x + " " + y + " ";
  _moveCount++;
}
// Absolute line
var Line = function (x, y) {
  _pathD += "L " + x + " " + y + " ";
  _moveCount++;
}
// Relative line
var line = function (x, y) {
  _pathD += "l " + x + " " + y + " ";
  _moveCount++;
}

// Worker setup
self.onmessage = function(e) {

  // Reset
  _moveCount = 0;
  _pen = true;
  _pathD = "M 250 250 ";
  _vector.x = 0;
  _vector.y = 1;
  _currentAngle = 0; 

  try {
    eval(e.data);
    self.postMessage(_pathD);
  } catch (error) {
    // err
    self.postMessage("");
  }
};
