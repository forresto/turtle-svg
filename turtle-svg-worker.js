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
turnRight = r =  function(angle){
  if (isNaN(angle)) { return; }

  turnLeft(-angle);
};
var turnLeft, l;
turnLeft = l = function(angle){
  if (isNaN(angle)) { return; }

  _currentAngle += angle;
  _currentAngle = _currentAngle%1;
  _turn();
};

// Absolute turn
var turnTo, t;
turnTo = t = function(angle){
  if (isNaN(angle)) { return; }

  _currentAngle = angle;
  _turn();
};

// Tool up/down
var penUp, u;
penUp = u = function(){
  _pen = false;
};
var penDown, d;
penDown = d = function(){
  _pen = true;
};

// Set color and make a new path
var color = function(color) {
  if (!_defaultUsed){
    _paths = [];
  }
  color = color.replace(/\"|\'|\>|</g, " ");
  var newPath = {
    color: color,
    d: "M " + _position.x + " " + _position.y + " "
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

// Worker setup
self.onmessage = function(e) {

  _resetTurtle();

  try {
    eval(e.data);

    // Build SVG string
    var svg = '<svg id="turtle-svg" xmlns="http://www.w3.org/2000/svg" version="1.1" width="'+
      Math.ceil(_max.x) + '" height="' +
      Math.ceil(_max.y) +'">'+"\n";
    for (var i=0; i<_paths.length; i++) {
      var path = _paths[i];
      svg += '  <path id="turtle-path-'+ i +'" '+
        'stroke="' + path.color + '" '+
        'd="' + path.d + '" '+
        'fill="none" vector-effect="non-scaling-stroke" />' + "\n";
    }
    svg += '</svg>';

    self.postMessage({
      svg: svg,
      code: e.data
    });
  } catch (error) {
    // err
    self.postMessage("");
  }
};
