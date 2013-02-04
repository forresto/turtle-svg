// Turtle graphics drawing to SVG (?)
var TAU = 2 * Math.PI;

var moveCount = 0;
var pen = true;
var d = "M 0 0 ";
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
var turnRight = function(angle){
  turnLeft(-angle);
};
var turnLeft = function(angle){
  currentAngle += angle;
  currentAngle = currentAngle%1;
  turn();
};

// Absolute turn
var turnTo = function(angle){
  currentAngle = angle;
  turn();
};

// Drawing
var penUp = function(){
  pen = false;
};
var penDown = function(){
  pen = true;
};

// Relative moves
var moveForward = function (distance) {
  d += pen ? "l " : "m ";
  d += (distance * vector.x) + " " + (distance * vector.y) + " ";
  moveCount++;
}

// Absolute moves
var moveTo = function (x, y) {
  d += pen ? "L " : "M ";
  d += x + " " + y + " ";
  moveCount++;
}

// Worker function

self.onmessage = function(e) {

  // Reset
  moveCount = 0;
  pen = true;
  d = "M 0 0 ";
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
