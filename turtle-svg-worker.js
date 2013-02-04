// Turtle graphics drawing to SVG (?)
var TAU = 2 * Math.PI;

// Reset turtle
var moveCount = 0;
var pen = true;
var d = "M 250 250 ";
var vector = {
  x: 0,
  y: 1
};
var currentAngle = 0;  

// Relative turns, angles are 0.0 to 1.0
var turn = function(){
  vector.x = Math.sin(TAU*currentAngle);
  vector.y = Math.cos(TAU*currentAngle);
};

var turnRight, r;
turnRight = r =  function(angle){
  turnLeft(-angle);
};
var turnLeft, l;
turnLeft = l = function(angle){
  currentAngle += angle;
  currentAngle = currentAngle%1;
  turn();
};

// Absolute turn
var turnTo, t;
turnTo = t = function(angle){
  currentAngle = angle;
  turn();
};

// Drawing
var penUp, u;
penUp = u = function(){
  pen = false;
};
var penDown, d;
penDown = d = function(){
  pen = true;
};

// Relative moves
var moveForward, f;
moveForward = f = function (distance) {
  d += pen ? "l " : "m ";
  d += (distance * vector.x) + " " + (distance * vector.y) + " ";
  moveCount++;
}

// Absolute moves
var moveTo, m;
moveTo = m = function (x, y) {
  d += pen ? "L " : "M ";
  d += x + " " + y + " ";
  moveCount++;
}

// Worker setup
self.onmessage = function(e) {

  // Reset
  moveCount = 0;
  pen = true;
  d = "M 250 250 ";
  vector.x = 0;
  vector.y = 1;
  currentAngle = 0; 

  try {
    eval(e.data);
    self.postMessage(d);
  } catch (error) {
    // err
    self.postMessage("");
  }
};
