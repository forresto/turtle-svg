// Turtle graphics drawing to SVG (?)
var TAU = 2 * Math.PI;
var _accuracy = 1000000000;

// Reset turtle
var _moveCount, _pen, _pathD, _vector, _currentAngle;
var resetTurtle = function(){
  _moveCount = 0;
  _pen = true;
  _pathD = "M 250 250 ";
  _vector = {
    x: 0 * _accuracy,
    y: 1 * _accuracy
  };
  _currentAngle = 0;  
};
resetTurtle();

// Relative turns, angles are 0.0 to 1.0
var turn = function(){
  // Using _accuracy because otherwise we get some stupid tiny numbers
  _vector.x = Math.round( Math.sin(TAU*_currentAngle) * _accuracy );
  _vector.y = Math.round( Math.cos(TAU*_currentAngle) * _accuracy );
};

var turnRight, r;
turnRight = r =  function(angle){
  if (isNaN(angle)) { return; }

  turnLeft(-angle);
};
var turnLeft, l;
turnLeft = l = function(angle){
  if (isNaN(angle)) { return; }

  _currentAngle += angle;
  _currentAngle = _currentAngle%1;
  turn();
};

// Absolute turn
var turnTo, t;
turnTo = t = function(angle){
  if (isNaN(angle)) { return; }

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
  if (isNaN(distance)) { return; }

  _pathD += _pen ? "l " : "m ";
  var x = distance * _vector.x / _accuracy;
  var y = distance * _vector.y / _accuracy;
  _pathD += x + " " + y + " ";
  _moveCount++;
}

// SVG path 
// Absolute move
var moveTo = function (x, y) {
  if (isNaN(x) || isNaN(y)) { return; }

  _pathD += "M " + x + " " + y + " ";
  _moveCount++;
}
// Relative move
var moveBy = function (x, y) {
  if (isNaN(x) || isNaN(y)) { return; }

  _pathD += "m " + x + " " + y + " ";
  _moveCount++;
}
// Absolute line
var lineTo = function (x, y) {
  if (isNaN(x) || isNaN(y)) { return; }

  _pathD += "L " + x + " " + y + " ";
  _moveCount++;
}
// Relative line
var lineBy = function (x, y) {
  if (isNaN(x) || isNaN(y)) { return; }

  _pathD += "l " + x + " " + y + " ";
  _moveCount++;
}

// Worker setup
self.onmessage = function(e) {

  resetTurtle();

  try {
    eval(e.data);

    self.postMessage({
      path: _pathD,
      code: e.data
    });
  } catch (error) {
    // err
    self.postMessage("");
  }
};
