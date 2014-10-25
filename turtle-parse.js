// Turtle graphics drawing to SVG (?)
var TAU = 2 * Math.PI;
var _accuracy = 1000000000;

// Reset turtle
var _moveCount, _pen, _position, _vector, _currentAngle, _paths, _currentPath, _max, _defaultUsed;
var _resetTurtle = function(){
  _moveCount = 0;
  _pen = true;
  _position = {
    x: 250,
    y: 250
  };
  _vector = {
    x: 0 * _accuracy,
    y: 1 * _accuracy
  };
  _max = {
    x: 1,
    y: 1
  };
  _currentAngle = 0;
  _paths = [];

  // Start default path
  color("rgba(0,0,0,0.75)");
  _defaultUsed = false;
};

// Relative turns, angles are 0.0 to 1.0
var _turn = function(){
  // Using * _accuracy because otherwise we get some stupid tiny numbers
  _vector.x = Math.round( Math.sin(TAU*_currentAngle) * _accuracy );
  _vector.y = Math.round( Math.cos(TAU*_currentAngle) * _accuracy );
};

var turnRight, r;
turnRight = r = function (angle) {
  if (isNaN(angle)) { return; }

  angle = -angle;
  _currentAngle += angle;
  _currentAngle = _currentAngle%1;
  _currentPath.commands.push({cmd:'right', arg:0-angle*360});
  _turn();
};
var turnLeft, l;
turnLeft = l = function (angle) {
  if (isNaN(angle)) { return; }

  _currentAngle += angle;
  _currentAngle = _currentAngle%1;
  _currentPath.commands.push({cmd:'left', arg:angle*360});
  _turn();
};

// Absolute turn
var turnTo, t;
turnTo = t = function (angle) {
  if (isNaN(angle)) { return; }

  _currentAngle = angle;
  _turn();
};

// Tool up/down
var penUp, u;
penUp = u = function(){
  _pen = false;
  _currentPath.commands.push({cmd:'penup'});
};
var penDown, d;
penDown = d = function(){
  _pen = true;
  _currentPath.commands.push({cmd:'pendown'});
};

// Set color and make a new path
var color = function(color, fill) {
  if (!_defaultUsed){
    _paths = [];
  }
  if (fill===true){
    fill = color;
  }
  color = color.replace(/\"|\'|\>|</g, " ");
  var newPath = {
    color: color,
    d: "M " + _position.x + " " + _position.y + " ",
    commands: [],
    fill: fill
  };
  _paths.push(newPath);
  _currentPath = newPath;
};

// Track position
var _positionTo = function(x, y) {
  _position.x = x;
  _position.y = y;
  _max.x = Math.max(_max.x, _position.x);
  _max.y = Math.max(_max.y, _position.y);

  _defaultUsed = true;
};
var _positionBy = function(x, y) {
  _positionTo(_position.x+x, _position.y+y);
};

// Relative moves
var moveForward, f;
moveForward = f = function (distance) {
  if (isNaN(distance)) { return; }

  var x = distance * _vector.x / _accuracy;
  var y = distance * _vector.y / _accuracy;

  _positionBy(x, y);

  _currentPath.d += _pen ? "l " : "m ";
  _currentPath.d += x + " " + y + " ";
  _currentPath.commands.push({cmd:'forward', arg:distance});
  _moveCount++;
};

// SVG path 
// Absolute move
var moveTo = function (x, y) {
  if (isNaN(x) || isNaN(y)) { return; }

  _positionTo(x, y);

  _currentPath.d += "M " + x + " " + y + " ";
  _moveCount++;
};
// Relative move
var moveBy = function (x, y) {
  if (isNaN(x) || isNaN(y)) { return; }

  _positionBy(x, y);

  _currentPath.d += "m " + x + " " + y + " ";
  _moveCount++;
};
// Absolute line
var lineTo = function (x, y) {
  if (isNaN(x) || isNaN(y)) { return; }

  _positionTo(x, y);

  _currentPath.d += "L " + x + " " + y + " ";
  _moveCount++;
};
// Relative line
var lineBy = function (x, y) {
  if (isNaN(x) || isNaN(y)) { return; }

  _positionBy(x, y);

  _currentPath.d += "l " + x + " " + y + " ";
  _moveCount++;
};
