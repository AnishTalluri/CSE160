// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobelRoatateMatrix;
  void main() {
    gl_Position = u_GlobelRoatateMatrix * u_ModelMatrix * a_Position;
  }`
  
// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
    }`
  
// Global Variables
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_GlobelRoatateMatrix;

let marioDrawn = false;

function setupWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
}

function connectVariablesToGLSL() {
   // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  u_GlobelRoatateMatrix = gl.getUniformLocation(gl.program, 'u_GlobelRoatateMatrix');
  if (!u_GlobelRoatateMatrix) {
    console.log('Failed to get the storage location of u_GlobelRoatateMatrix');
    return;
  }
}

// Constants
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;
// Globals related to UI elements
let g_selectedColor=[1.0,1.0,1.0,1.0];
let g_selectedSize=5;
let g_selectedType=POINT;
let g_selectedSegments=10;
let g_globalAngle=0;
let g_globalVerticalAngle=0;
let g_zoomLevel=1;
let g_leftThighAngle=0;
let g_rightThighAngle=0;
let g_leftCalfAngle=0;
let g_rightCalfAngle=0;
let g_leftArmAngle=0;
let g_rightArmAngle=0;
let g_animationOn=false;
let g_seconds=0;
let g_waveOn=false;
let g_waveArmAngle=0;
let g_waveSwayAngle=0;

// Poke animation
let g_pokeOn = false;
let g_pokeStartTime = 0;
let g_pokeDuration = 1.0; // 1 second animation
let g_pokeJumpHeight = 0;
let g_pokeEarAngle = 0;

// Mouse rotation control
let g_isDragging = false;
let g_lastMouseX = 0;
let g_lastMouseY = 0;

// Performance tracking
let g_frameCount = 0;
let g_lastFpsUpdate = 0;
let g_currentFps = 0;

function addActionsForHTMLUI() {
  document.getElementById('animToggle').onclick = function() {
    g_animationOn = !g_animationOn;
    this.textContent = g_animationOn ? 'Stop Animation' : 'Start Animation';
    if (g_animationOn) {
      g_leftArmAngle = 0;
      g_rightArmAngle = 0;
      g_leftThighAngle = 0;
      g_rightThighAngle = 0;
      g_leftCalfAngle = 0;
      g_rightCalfAngle = 0;
    }
  };
  document.getElementById('waveToggle').onclick = function() {
    g_waveOn = !g_waveOn;
    this.textContent = g_waveOn ? 'Stop Wave' : 'Start Wave';
    if (g_waveOn) {
      g_leftArmAngle = 0;
      g_rightArmAngle = 0;
      g_leftThighAngle = 0;
      g_rightThighAngle = 0;
      g_leftCalfAngle = 0;
      g_rightCalfAngle = 0;
    }
  };
  // Camera & zoom sliders
  document.getElementById('angleSlide').addEventListener('input', function() { g_globalAngle = this.value; renderScene(); });
  document.getElementById('verticalSlide').addEventListener('input', function() { g_globalVerticalAngle = this.value; renderScene(); });
  document.getElementById('zoomSlide').addEventListener('input', function() { g_zoomLevel = this.value; renderScene(); });
  document.getElementById('leftThighSlide').addEventListener('input', function() { g_leftThighAngle = this.value; renderScene(); });
  document.getElementById('rightThighSlide').addEventListener('input', function() { g_rightThighAngle = this.value; renderScene(); });
  document.getElementById('leftCalfSlide').addEventListener('input', function() { g_leftCalfAngle = this.value; renderScene(); });
  document.getElementById('rightCalfSlide').addEventListener('input', function() { g_rightCalfAngle = this.value; renderScene(); });
  document.getElementById('leftArmSlide').addEventListener('input', function() { g_leftArmAngle = this.value; renderScene(); });
  document.getElementById('rightArmSlide').addEventListener('input', function() { g_rightArmAngle = this.value; renderScene(); });
}

function addMouseControls() {
  // Mouse rotation control
  canvas.addEventListener('mousedown', function(ev) {
    if (ev.shiftKey) {
      // Shift+click triggers poke animation
      g_pokeOn = true;
      g_pokeStartTime = g_seconds;
    } else {
      // Normal click starts drag rotation
      g_isDragging = true;
      g_lastMouseX = ev.clientX;
      g_lastMouseY = ev.clientY;
    }
  });
  
  canvas.addEventListener('mousemove', function(ev) {
    if (g_isDragging) {
      let deltaX = ev.clientX - g_lastMouseX;
      let deltaY = ev.clientY - g_lastMouseY;
      g_globalAngle -= deltaX * 0.5; // Horizontal rotation (inverted)
      g_globalVerticalAngle -= deltaY * 0.5; // Vertical rotation (inverted)
      g_lastMouseX = ev.clientX;
      g_lastMouseY = ev.clientY;
      renderScene();
    }
  });
  
  canvas.addEventListener('mouseup', function(ev) {
    g_isDragging = false;
  });
  
  // Also stop dragging if mouse leaves canvas
  canvas.addEventListener('mouseleave', function(ev) {
    g_isDragging = false;
  });
}

function main() {

  // Set up canvas and gl variables
  setupWebGL();
  // Set up GLSL shader programs and connect GLSL variables
  connectVariablesToGLSL();

  addActionsForHTMLUI();
  addMouseControls();

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  // gl.clear(gl.COLOR_BUFFER_BIT);
  renderScene();
  tick();
}

function tick() {
  g_seconds = performance.now() / 1000.0;
  if (g_animationOn || g_waveOn) {
    updateAnimationAngles();
  }
  if (g_pokeOn) {
    updatePokeAnimation();
  }
  renderScene();
  requestAnimationFrame(tick);
}

function updateAnimationAngles() {
  if (g_animationOn) {
    g_leftArmAngle = 30 * Math.sin(g_seconds * 2.0);
    g_rightArmAngle = 30 * Math.sin(g_seconds * 2.0 + Math.PI);
    g_leftThighAngle = 20 * Math.sin(g_seconds * 2.0);
    g_rightThighAngle = 20 * Math.sin(g_seconds * 2.0 + Math.PI);
    g_leftCalfAngle = 10 * Math.sin(g_seconds * 2.0 + Math.PI / 2);
    g_rightCalfAngle = 10 * Math.sin(g_seconds * 2.0 + Math.PI / 2);
  }
  if (g_waveOn) {
    g_waveArmAngle = -160; // Raise arm up
    g_waveSwayAngle = 30 * Math.sin(g_seconds * 3.0); // Sway left-right
    g_rightArmAngle = g_waveArmAngle;
  }
}

function updatePokeAnimation() {
  let elapsed = g_seconds - g_pokeStartTime;
  
  if (elapsed >= g_pokeDuration) {
    // Animation finished
    g_pokeOn = false;
    g_pokeJumpHeight = 0;
    g_pokeEarAngle = 0;
  } else {
    // Jump up and down (parabolic motion)
    let progress = elapsed / g_pokeDuration;
    g_pokeJumpHeight = 0.3 * Math.sin(progress * Math.PI * 2); // Two bounces
    
    // Wiggle ears
    g_pokeEarAngle = 20 * Math.sin(elapsed * 15);
  }
}


var g_shapesList = [];

// var g_points = [];  // The array for the position of a mouse press
// var g_colors = [];  // The array to store the color of a point
// var g_sizes = []; // THe array to store the size of the a point

function click(ev) {
  
  // Extract the event click and return it in the WebGL coordinates
  let [x,y] = convertCoordinatesEventToGL(ev);
  
  let point = new Triangle();
  if (g_selectedType==POINT){
    point = new Point();
  } else if (g_selectedType ==TRIANGLE) {
    point = new Triangle();
  } else {
    point = new Circle();
  }
  point.position = [x,y];
  point.color = g_selectedColor.slice();
  point.size = g_selectedSize;

  if (g_selectedType == CIRCLE) {
    point.segments = g_selectedSegments;
  }

  g_shapesList.push(point);

  // Draw every shape that is supposed to be in the canvas
  renderScene();
}

function convertCoordinatesEventToGL(ev) {
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  return([x,y]);
}

// Draw a cube with vertices from -0.5 to 0.5 in each dimension
// If color is provided, draw the cube with a solid color
// Takes a Matrix4 parameter to apply transformations
function drawCube(M, color) {
  // Apply the transformation matrix
  gl.uniformMatrix4fv(u_ModelMatrix, false, M.elements);
  
  // Define vertices for a cube (from -0.5 to 0.5)
  
  // Front face (z = 0.5) - RED
  var frontVertices = new Float32Array([
    -0.5, -0.5,  0.5,
     0.5, -0.5,  0.5,
     0.5,  0.5,  0.5,
    -0.5, -0.5,  0.5,
     0.5,  0.5,  0.5,
    -0.5,  0.5,  0.5
  ]);
  drawCubeFace(frontVertices, color || [1.0, 0.0, 0.0, 1.0]); // Red

  // Back face (z = -0.5) - CYAN
  var backVertices = new Float32Array([
    -0.5, -0.5, -0.5,
    -0.5,  0.5, -0.5,
     0.5,  0.5, -0.5,
    -0.5, -0.5, -0.5,
     0.5,  0.5, -0.5,
     0.5, -0.5, -0.5
  ]);
  drawCubeFace(backVertices, color || [0.0, 1.0, 1.0, 1.0]); // Cyan

  // Left face (x = -0.5) - GREEN
  var leftVertices = new Float32Array([
    -0.5, -0.5, -0.5,
    -0.5, -0.5,  0.5,
    -0.5,  0.5,  0.5,
    -0.5, -0.5, -0.5,
    -0.5,  0.5,  0.5,
    -0.5,  0.5, -0.5
  ]);
  drawCubeFace(leftVertices, color || [0.0, 1.0, 0.0, 1.0]); // Green

  // Right face (x = 0.5) - MAGENTA
  var rightVertices = new Float32Array([
     0.5, -0.5, -0.5,
     0.5,  0.5,  0.5,
     0.5, -0.5,  0.5,
     0.5, -0.5, -0.5,
     0.5,  0.5, -0.5,
     0.5,  0.5,  0.5
  ]);
  drawCubeFace(rightVertices, color || [1.0, 0.0, 1.0, 1.0]); // Magenta

  // Top face (y = 0.5) - BLUE
  var topVertices = new Float32Array([
    -0.5,  0.5, -0.5,
    -0.5,  0.5,  0.5,
     0.5,  0.5,  0.5,
    -0.5,  0.5, -0.5,
     0.5,  0.5,  0.5,
     0.5,  0.5, -0.5
  ]);
  drawCubeFace(topVertices, color || [0.0, 0.0, 1.0, 1.0]); // Blue

  // Bottom face (y = -0.5) - YELLOW
  var bottomVertices = new Float32Array([
    -0.5, -0.5, -0.5,
     0.5, -0.5,  0.5,
    -0.5, -0.5,  0.5,
    -0.5, -0.5, -0.5,
     0.5, -0.5, -0.5,
     0.5, -0.5,  0.5
  ]);
  drawCubeFace(bottomVertices, color || [1.0, 1.0, 0.0, 1.0]); // Yellow
}

// Helper function to draw a single colored face
function drawCubeFace(vertices, color) {
  var n = 6; // 6 vertices per face (2 triangles)

  // Create a buffer object
  var vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  // Write data into the buffer object
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.DYNAMIC_DRAW);

  // Assign the buffer object to a_Position variable
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);

  // Enable the assignment to a_Position variable
  gl.enableVertexAttribArray(a_Position);

  // Set the color
  gl.uniform4f(u_FragColor, color[0], color[1], color[2], color[3]);

  // Draw the face
  gl.drawArrays(gl.TRIANGLES, 0, n);
}

// Draw a cube without the front face (for ears so inner ear shows through)
function drawCubeNoFront(M, color) {
  // Apply the transformation matrix
  gl.uniformMatrix4fv(u_ModelMatrix, false, M.elements);
  
  // Back face (z = -0.5) - CYAN
  var backVertices = new Float32Array([
    -0.5, -0.5, -0.5,
    -0.5,  0.5, -0.5,
     0.5,  0.5, -0.5,
    -0.5, -0.5, -0.5,
     0.5,  0.5, -0.5,
     0.5, -0.5, -0.5
  ]);
  drawCubeFace(backVertices, color || [0.0, 1.0, 1.0, 1.0]);

  // Left face (x = -0.5) - GREEN
  var leftVertices = new Float32Array([
    -0.5, -0.5, -0.5,
    -0.5, -0.5,  0.5,
    -0.5,  0.5,  0.5,
    -0.5, -0.5, -0.5,
    -0.5,  0.5,  0.5,
    -0.5,  0.5, -0.5
  ]);
  drawCubeFace(leftVertices, color || [0.0, 1.0, 0.0, 1.0]);

  // Right face (x = 0.5) - MAGENTA
  var rightVertices = new Float32Array([
     0.5, -0.5, -0.5,
     0.5,  0.5,  0.5,
     0.5, -0.5,  0.5,
     0.5, -0.5, -0.5,
     0.5,  0.5, -0.5,
     0.5,  0.5,  0.5
  ]);
  drawCubeFace(rightVertices, color || [1.0, 0.0, 1.0, 1.0]);

  // Top face (y = 0.5) - BLUE
  var topVertices = new Float32Array([
    -0.5,  0.5, -0.5,
    -0.5,  0.5,  0.5,
     0.5,  0.5,  0.5,
    -0.5,  0.5, -0.5,
     0.5,  0.5,  0.5,
     0.5,  0.5, -0.5
  ]);
  drawCubeFace(topVertices, color || [0.0, 0.0, 1.0, 1.0]);

  // Bottom face (y = -0.5) - YELLOW
  var bottomVertices = new Float32Array([
    -0.5, -0.5, -0.5,
     0.5, -0.5,  0.5,
    -0.5, -0.5,  0.5,
    -0.5, -0.5, -0.5,
     0.5, -0.5, -0.5,
     0.5, -0.5,  0.5
  ]);
  drawCubeFace(bottomVertices, color || [1.0, 1.0, 0.0, 1.0]);
}

// Draw a single bunny
function drawBunny() {
  // === BUNNY BODY ===
  let body = new Matrix4();
  body.translate(0.0, -0.1 + g_pokeJumpHeight, 0.0); // Add jump offset
  body.scale(0.4, 0.55, 0.35);  // Even slimmer and shorter
  drawCubeNoFront(body, [0.6, 0.635, 0.643, 1.0]); // #99A2A4

  // === BUNNY BODY INNER ===
  let bodyInner = new Matrix4();
  bodyInner.translate(0.0, -0.1 + g_pokeJumpHeight, 0.0); // Add jump offset
  bodyInner.scale(0.35, 0.5, 0.3);  // Slightly smaller white inner
  drawCube(bodyInner, [1.0, 1.0, 1.0, 1.0]); // White

  // === BUNNY HEAD ===
  let head = new Matrix4();
  head.translate(0.0, 0.38 + g_pokeJumpHeight, 0); // Add jump offset
  head.scale(0.42, 0.4, 0.38);  // Head stays larger than body width
  drawCube(head, [0.6, 0.635, 0.643, 1.0]); // #99A2A4

  // === LEFT EYE - WHITE HALF ===
  let leftEyeWhite = new Matrix4();
  leftEyeWhite.translate(-0.14, 0.448 + g_pokeJumpHeight, 0.20);
  leftEyeWhite.scale(0.06, 0.10, 0.04);  // Rectangular eye shape
  drawCube(leftEyeWhite, [1.0, 1.0, 1.0, 1.0]); // White

  // === LEFT EYE - BLACK HALF ===
  let leftEyeBlack = new Matrix4();
  leftEyeBlack.translate(-0.08, 0.45 + g_pokeJumpHeight, 0.20);
  leftEyeBlack.scale(0.06, 0.12, 0.04);  // Rectangular eye shape
  drawCube(leftEyeBlack, [0.0, 0.0, 0.0, 1.0]); // Black

  // === RIGHT EYE - BLACK HALF ===
  let rightEyeBlack = new Matrix4();
  rightEyeBlack.translate(0.08, 0.45 + g_pokeJumpHeight, 0.20);
  rightEyeBlack.scale(0.06, 0.12, 0.04);  // Rectangular eye shape
  drawCube(rightEyeBlack, [0.0, 0.0, 0.0, 1.0]); // Black

  // === RIGHT EYE - WHITE HALF ===
  let rightEyeWhite = new Matrix4();
  rightEyeWhite.translate(0.14, 0.448 + g_pokeJumpHeight, 0.20);
  rightEyeWhite.scale(0.06, 0.10, 0.04);  // Rectangular eye shape
  drawCube(rightEyeWhite, [1.0, 1.0, 1.0, 1.0]); // White

  // === NOSE ===
  let nose = new Matrix4();
  nose.translate(0.0, 0.35 + g_pokeJumpHeight, 0.23);
  nose.scale(0.08, 0.08, 0.04);  // Fits between inner edges of black eyes
  drawCube(nose, [0.851, 0.490, 0.373, 1.0]); // #D97D5F

  // === LEFT MOUTH ===
  let leftMouth = new Matrix4();
  leftMouth.translate(-0.16, 0.35 + g_pokeJumpHeight, 0.20);
  leftMouth.scale(0.20, 0.08, 0.04);  // Same height as nose
  drawCube(leftMouth, [1.0, 1.0, 1.0, 1.0]); // White

  // === RIGHT MOUTH ===
  let rightMouth = new Matrix4();
  rightMouth.translate(0.16, 0.35 + g_pokeJumpHeight, 0.20);
  rightMouth.scale(0.20, 0.08, 0.04);  // Same height as nose
  drawCube(rightMouth, [1.0, 1.0, 1.0, 1.0]); // White

  // === LEFT LOWER MOUTH ===
  let leftLowerMouth = new Matrix4();
  leftLowerMouth.translate(-0.16, 0.28 + g_pokeJumpHeight, 0.20);
  leftLowerMouth.scale(0.20, 0.11, 0.04);  // Extends down, stops before bottom row
  drawCube(leftLowerMouth, [1.0, 1.0, 1.0, 1.0]); // White

  // === RIGHT LOWER MOUTH ===
  let rightLowerMouth = new Matrix4();
  rightLowerMouth.translate(0.16, 0.28 + g_pokeJumpHeight, 0.20);
  rightLowerMouth.scale(0.20, 0.11, 0.04);  // Extends down, stops before bottom row
  drawCube(rightLowerMouth, [1.0, 1.0, 1.0, 1.0]); // White

  // === LEFT EAR ===
  // === MOUTH FILL (Bottom half of face) ===
  let mouthFill = new Matrix4();
  mouthFill.translate(0.0, 0.28 + g_pokeJumpHeight, 0.20);
  mouthFill.scale(0.42, 0.20, 0.04);  // Fills bottom half of face
  drawCube(mouthFill, [1.0, 1.0, 1.0, 1.0]); // White

  // === RED MOUTH ===
  let mouthRed = new Matrix4();
  mouthRed.translate(0.0, 0.27 + g_pokeJumpHeight, 0.21);
  mouthRed.scale(0.22, 0.06, 0.04);  // Small red mouth inside white area
  drawCube(mouthRed, [1.0, 0.0, 0.0, 1.0]); // Red

  // === TEETH (LEFT WHITE) ===
  let teethLeft = new Matrix4();
  teethLeft.translate(-0.0313, 0.27 + g_pokeJumpHeight, 0.22);
  teethLeft.scale(0.05, 0.06, 0.04);  // Same height as top red rectangle
  drawCube(teethLeft, [1.0, 1.0, 1.0, 1.0]); // White

  // === TEETH (BLACK STRIP) ===
  let teethStrip = new Matrix4();
  teethStrip.translate(0.0, 0.27 + g_pokeJumpHeight, 0.23);
  teethStrip.scale(0.01, 0.06, 0.04);  // Thin vertical black line
  drawCube(teethStrip, [0.0, 0.0, 0.0, 1.0]); // Black

  // === TEETH (RIGHT WHITE) ===
  let teethRight = new Matrix4();
  teethRight.translate(0.0313, 0.27 + g_pokeJumpHeight, 0.22);
  teethRight.scale(0.05, 0.06, 0.04);  // Same height as top red rectangle
  drawCube(teethRight, [1.0, 1.0, 1.0, 1.0]); // White

  // === RED MOUTH LOWER ===
  let mouthRedLower = new Matrix4();
  mouthRedLower.translate(0.0, 0.23 + g_pokeJumpHeight, 0.21);
  mouthRedLower.scale(0.16, 0.05, 0.04);  // Shorter width, centered
  drawCube(mouthRedLower, [1.0, 0.0, 0.0, 1.0]); // Red

  let leftEar = new Matrix4();
  leftEar.translate(-0.16, 0.72 + g_pokeJumpHeight, 0); // Add jump offset
  leftEar.rotate(g_pokeEarAngle, 0, 0, 1); // Wiggle rotation
  leftEar.scale(0.1, 0.45, 0.1);  // Taller ear
  drawCubeNoFront(leftEar, [0.6, 0.635, 0.643, 1.0]); // #99A2A4

  // === LEFT EAR INNER ===
  let leftEarInner = new Matrix4();
  leftEarInner.translate(-0.16, 0.72 + g_pokeJumpHeight, 0); // Add jump offset
  leftEarInner.rotate(g_pokeEarAngle, 0, 0, 1); // Wiggle rotation
  leftEarInner.scale(0.04, 0.45, 0.03);  // Skinnier white inner
  drawCube(leftEarInner, [0.851, 0.490, 0.373, 1.0]); // #D97D5F

  // === LEFT EAR TIP 1 ===
  let leftEarTip1 = new Matrix4();
  leftEarTip1.translate(-0.16, 1.0 + g_pokeJumpHeight, 0); // Add jump offset
  leftEarTip1.rotate(g_pokeEarAngle, 0, 0, 1); // Wiggle rotation
  leftEarTip1.scale(0.08, 0.15, 0.08);
  drawCube(leftEarTip1, [0.6, 0.635, 0.643, 1.0]); // #99A2A4

  // // === LEFT EAR TIP 2 ===
  // let leftEarTip2 = new Matrix4();
  // leftEarTip2.translate(-0.16, 1.25, 0.1);
  // leftEarTip2.scale(0.06, 0.12, 0.06);
  // drawCube(leftEarTip2, [0.6, 0.635, 0.643, 1.0]); // #99A2A4

  // === RIGHT EAR ===
  let rightEar = new Matrix4();
  rightEar.translate(0.16, 0.72 + g_pokeJumpHeight, 0); // Add jump offset
  rightEar.rotate(-g_pokeEarAngle, 0, 0, 1); // Wiggle rotation (opposite direction)
  rightEar.scale(0.1, 0.45, 0.1);  // Taller ear
  drawCubeNoFront(rightEar, [0.6, 0.635, 0.643, 1.0]); // #99A2A4

  // === RIGHT EAR INNER ===
  let rightEarInner = new Matrix4();
  rightEarInner.translate(0.16, 0.72 + g_pokeJumpHeight, 0); // Add jump offset
  rightEarInner.rotate(-g_pokeEarAngle, 0, 0, 1); // Wiggle rotation (opposite direction)
  rightEarInner.scale(0.04, 0.45, 0.03);  // Skinnier white inner
  drawCube(rightEarInner, [0.851, 0.490, 0.373, 1.0]); // #D97D5F

  // === RIGHT EAR TIP 1 ===
  let rightEarTip1 = new Matrix4();
  rightEarTip1.translate(0.16, 1.0 + g_pokeJumpHeight, 0); // Add jump offset
  rightEarTip1.rotate(-g_pokeEarAngle, 0, 0, 1); // Wiggle rotation (opposite direction)
  rightEarTip1.scale(0.08, 0.15, 0.08);
  drawCube(rightEarTip1, [0.6, 0.635, 0.643, 1.0]); // #99A2A4

  // // === RIGHT EAR TIP 2 ===
  // let rightEarTip2 = new Matrix4();
  // rightEarTip2.translate(0.16, 1.25, 0.1);
  // rightEarTip2.scale(0.06, 0.12, 0.06);
  // drawCube(rightEarTip2, [0.6, 0.635, 0.643, 1.0]); // #99A2A4

  // === LEFT SHOULDER ===
  let leftShoulder = new Matrix4();
  leftShoulder.translate(-0.2, 0.1 + g_pokeJumpHeight, 0);
  leftShoulder.scale(0.18, 0.2, 0.18);
  drawCube(leftShoulder, [0.6, 0.635, 0.643, 1.0]); // #99A2A4

  // === LEFT ARM (UPPER) ===
  let leftArmBase = new Matrix4();
  leftArmBase.translate(-0.35, 0.2 + g_pokeJumpHeight, 0);
  leftArmBase.rotate(g_leftArmAngle, 1, 0, 0);
  let leftUpperArm = new Matrix4(leftArmBase);
  leftUpperArm.translate(0, -0.25, 0);
  leftUpperArm.scale(0.14, 0.5, 0.14);
  drawCube(leftUpperArm, [0.6, 0.635, 0.643, 1.0]); // #99A2A4

  // === LEFT HAND ===
  let leftHand = new Matrix4(leftArmBase);
  leftHand.translate(0, -0.53, 0);
  leftHand.scale(0.20, 0.20, 0.20); // Proper cube hand
  drawCube(leftHand, [1.0, 1.0, 1.0, 1.0]); // White

  // === RIGHT SHOULDER ===
  let rightShoulder = new Matrix4();
  rightShoulder.translate(0.2, 0.1 + g_pokeJumpHeight, 0);
  rightShoulder.scale(0.18, 0.2, 0.18);
  drawCube(rightShoulder, [0.6, 0.635, 0.643, 1.0]); // #99A2A4

  // === RIGHT ARM (UPPER) ===
  let rightArmBase = new Matrix4();
  rightArmBase.translate(0.35, 0.2 + g_pokeJumpHeight, 0);
  rightArmBase.rotate(g_rightArmAngle, 1, 0, 0);
  if (g_waveOn) {
    rightArmBase.rotate(g_waveSwayAngle, 0, 0, 1); // Add left-right sway when waving
  }
  let rightUpperArm = new Matrix4(rightArmBase);
  rightUpperArm.translate(0, -0.25, 0);
  rightUpperArm.scale(0.14, 0.5, 0.14);
  drawCube(rightUpperArm, [0.6, 0.635, 0.643, 1.0]); // #99A2A4

  // === RIGHT HAND ===
  let rightHand = new Matrix4(rightArmBase);
  rightHand.translate(0, -0.53, 0);
  rightHand.scale(0.20, 0.20, 0.20); // Proper cube hand
  drawCube(rightHand, [1.0, 1.0, 1.0, 1.0]); // White

  // === LEFT LEG (UPPER) ===
  let leftLegBase = new Matrix4();
  leftLegBase.translate(-0.1, -0.375 + g_pokeJumpHeight, 0);
  leftLegBase.rotate(g_leftThighAngle, 1, 0, 0);
  let leftUpperLeg = new Matrix4(leftLegBase);
  leftUpperLeg.translate(0, -0.275, 0);
  leftUpperLeg.scale(0.14, 0.55, 0.14);
  drawCube(leftUpperLeg, [0.6, 0.635, 0.643, 1.0]); // #99A2A4

  // === RIGHT LEG (UPPER) ===
  let rightLegBase = new Matrix4();
  rightLegBase.translate(0.1, -0.375 + g_pokeJumpHeight, 0);
  rightLegBase.rotate(g_rightThighAngle, 1, 0, 0);
  let rightUpperLeg = new Matrix4(rightLegBase);
  rightUpperLeg.translate(0, -0.275, 0);
  rightUpperLeg.scale(0.14, 0.55, 0.14);
  drawCube(rightUpperLeg, [0.6, 0.635, 0.643, 1.0]); // #99A2A4

  // === LEFT FOOT ===
  let leftLowerLeg = new Matrix4(leftLegBase);
  leftLowerLeg.translate(0, -0.55, 0);
  leftLowerLeg.rotate(g_leftCalfAngle, 1, 0, 0);
  let leftFoot = new Matrix4(leftLowerLeg);
  leftFoot.translate(-0.059, -0.075, 0.05);
  leftFoot.rotate(45, 0, 1, 0);  // 45 degrees outward
  leftFoot.rotate(180, 1, 0, 0);  // Flip vertically
  leftFoot.scale(0.35, 0.15, 0.2);  // Bigger foot
  drawCube(leftFoot, [1.0, 1.0, 1.0, 1.0]); // White

  // === RIGHT FOOT ===
  let rightLowerLeg = new Matrix4(rightLegBase);
  rightLowerLeg.translate(0, -0.55, 0);
  rightLowerLeg.rotate(g_rightCalfAngle, 1, 0, 0);
  let rightFoot = new Matrix4(rightLowerLeg);
  rightFoot.translate(0.059, -0.075, 0.05);
  rightFoot.rotate(-45, 0, 1, 0);  // 45 degrees outward
  rightFoot.rotate(180, 1, 0, 0);  // Flip vertically
  rightFoot.scale(0.35, 0.15, 0.2);  // Bigger foot
  drawCube(rightFoot, [1.0, 1.0, 1.0, 1.0]); // White

  // === TAIL (SPHERE for non-cube primitive) ===
  let tail = new Matrix4();
  tail.translate(0.0, -0.2 + g_pokeJumpHeight, -0.30);
  tail.scale(0.25, 0.25, 0.25);  // Small fluffy tail
  drawSphere(tail, [1.0, 1, 1, 1.0]); // White/cream spherical tail
}

// Draw every shape needed in the canvas
function renderScene() {
  
  // Check the time at the start of function
  var startTime = performance.now();

  var globalRotMat = new Matrix4();
  globalRotMat.rotate(g_globalVerticalAngle, 1, 0, 0);  // Vertical rotation (X-axis)
  globalRotMat.rotate(g_globalAngle, 0, 1, 0);           // Horizontal rotation (Y-axis)
  globalRotMat.scale(g_zoomLevel, g_zoomLevel, g_zoomLevel);  // Apply zoom
  gl.uniformMatrix4fv(u_GlobelRoatateMatrix, false, globalRotMat.elements);
  
  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Use identity matrix for 2D shapes
  const baseMatrix = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, baseMatrix.elements);

  drawBunny();

  // Check the time at the end of function and calculate FPS
  var duration = performance.now() - startTime;
  
  // Update FPS counter (average over 0.5 seconds for stability)
  g_frameCount++;
  if (performance.now() - g_lastFpsUpdate > 500) {
    g_currentFps = Math.round((g_frameCount * 1000) / (performance.now() - g_lastFpsUpdate));
    g_frameCount = 0;
    g_lastFpsUpdate = performance.now();
  }

  sendTextToHTML("FPS: " + g_currentFps + " | ms: " + Math.floor(duration), "numdot");
}

function sendTextToHTML(text, htmlID) {
  var htmlElm = document.getElementById(htmlID);
  if (!htmlElm) {
    console.log("Failed to get " + htmlID + " from HTML");
    return;
  }
  htmlElm.innerHTML = text;
}
