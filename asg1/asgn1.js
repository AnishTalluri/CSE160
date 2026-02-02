// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform float u_Size;
  void main() {
    gl_Position = a_Position;
    //gl_PointSize = 30.0;
    gl_PointSize = u_Size;
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

  u_Size = gl.getUniformLocation(gl.program, 'u_Size');
  if (!u_Size) {
    console.log('Failed to get the storage location of u_Size');
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

function addActionsForHTMLUI() {
  document.getElementById('green').onclick = function() { 
  g_selectedColor = [0.0, 1.0, 0.0, 1.0];
  document.getElementById('greenSlide').value = 100;
  document.getElementById('redSlide').value = 0;
  document.getElementById('blueSlide').value = 0;
  };
  document.getElementById('red').onclick = function() { 
  g_selectedColor = [1.0, 0.0, 0.0, 1.0];
  document.getElementById('greenSlide').value = 0;
  document.getElementById('redSlide').value = 100;
  document.getElementById('blueSlide').value = 0;
  };
  document.getElementById('blue').onclick = function() { 
    g_selectedColor = [0.0, 0.0, 1.0, 1.0];
    document.getElementById('greenSlide').value = 0;
    document.getElementById('redSlide').value = 0;
    document.getElementById('blueSlide').value = 100;
    renderAllShapes(); 
  };

  document.getElementById('clearButton').onclick = function() { 
    g_shapesList = []; 
    marioDrawn = false;
    const btn = document.getElementById('drawMarioButton');
    if (btn) {
      btn.textContent = "Draw Mario";
      btn.style.backgroundColor = '';
      btn.style.color = '';
    }
    renderAllShapes();
  };


  document.getElementById('pointButton').onclick = function() { g_selectedType=POINT};
  document.getElementById('triButton').onclick = function() { g_selectedType=TRIANGLE};
  document.getElementById('circleButton').onclick = function() { g_selectedType=CIRCLE};

  // Slider Events
  document.getElementById('redSlide').addEventListener('input', function() {
  g_selectedColor[0] = this.value/100;
  renderAllShapes(); 
  });

  document.getElementById('greenSlide').addEventListener('input', function() {
    g_selectedColor[1] = this.value/100;
    renderAllShapes(); 
  });

  document.getElementById('blueSlide').addEventListener('input', function() {
    g_selectedColor[2] = this.value/100;
    renderAllShapes();
  });

  document.getElementById('sizeSlide').addEventListener('input', function() {
    g_selectedSize = this.value;
  });

  document.getElementById('circleSlide').addEventListener('input', function() {
    g_selectedSegments = this.value;
  });

  // Draw Mario button
  const drawBtn = document.getElementById('drawMarioButton');
  if (drawBtn) {
    drawBtn.addEventListener('click', function() {
      marioDrawn = true;
      this.textContent = "Mario Drawn";
      this.style.backgroundColor = '#333';
      this.style.color = '#fff';
      renderAllShapes();
    });
  }
}

function initSliders() {
  document.getElementById('redSlide').value = g_selectedColor[0] * 100;
  document.getElementById('greenSlide').value = g_selectedColor[1] * 100;
  document.getElementById('blueSlide').value = g_selectedColor[2] * 100;
}


function main() {

  // Set up canvas and gl variables
  setupWebGL();
  // Set up GLSL shader programs and connect GLSL variables
  connectVariablesToGLSL();

  addActionsForHTMLUI();
  initSliders();
 
  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = click;
  // canvas.onmousemove = click;

  canvas.onmousemove = function(ev) { if(ev.buttons == 1) {click(ev)}};

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
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
  renderAllShapes();
}

function convertCoordinatesEventToGL(ev) {
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  return([x,y]);
}

// Draw every shape needed in the canvas
function renderAllShapes() {
  
  // Check the time at the start of function
  var startTime = performance.now();

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Draw shapes from g_shapesList
  var len = g_shapesList.length;
  for(var i = 0; i < len; i++) {
    g_shapesList[i].render();
  }

  // Redraw Mario on top if it was drawn
  if (marioDrawn) {
    drawMarioDirect();
  }

  var duration = performance.now() - startTime;
  var fps = duration > 0 ? Math.floor(1000 / duration) : 0;

  sendTextToHTML("numdot: " + len + " ms:" + Math.floor(duration) + " fps: " + fps, "numdot");
}

function sendTextToHTML(text, htmlID) {
  var htmlElm = document.getElementById(htmlID);
  if (!htmlElm) {
    console.log("Failed to get " + htmlID + " from HTML");
    return;
  }
  htmlElm.innerHTML = text;
}

// Draw Mario accurately based on reference image using triangles
function drawMarioDirect() {
  // Red shirt/body
  gl.uniform4f(u_FragColor, 0.9, 0.1, 0.1, 1.0);
  // Main torso area
  const torsoL = -0.25, torsoR = 0.25, torsoB = -0.3, torsoT = 0.05;
  const tcols = 3, trows = 2;
  const tdx = (torsoR - torsoL) / tcols;
  const tdy = (torsoT - torsoB) / trows;
  for (let i = 0; i < tcols; i++) {
    for (let j = 0; j < trows; j++) {
      const x0 = torsoL + i * tdx, x1 = x0 + tdx;
      const y0 = torsoB + j * tdy, y1 = y0 + tdy;
      drawTriangle([x0, y0, x1, y0, x0, y1]);
      drawTriangle([x1, y0, x1, y1, x0, y1]);
    }
  }

  // Blue overalls
  gl.uniform4f(u_FragColor, 0.1, 0.3, 0.8, 1.0);
  const ovL = -0.2, ovR = 0.2, ovB = -0.5, ovT = -0.3;
  const ovcols = 3, ovrows = 2;
  const ovdx = (ovR - ovL) / ovcols;
  const ovdy = (ovT - ovB) / ovrows;
  for (let i = 0; i < ovcols; i++) {
    for (let j = 0; j < ovrows; j++) {
      const x0 = ovL + i * ovdx, x1 = x0 + ovdx;
      const y0 = ovB + j * ovdy, y1 = y0 + ovdy;
      drawTriangle([x0, y0, x1, y0, x0, y1]);
      drawTriangle([x1, y0, x1, y1, x0, y1]);
    }
  }

  // Peach/flesh-colored head
  gl.uniform4f(u_FragColor, 0.95, 0.8, 0.65, 1.0);
  const hL = -0.2, hR = 0.2, hB = 0.05, hT = 0.45;
  const hcols = 3, hrows = 3;
  const hdx = (hR - hL) / hcols;
  const hdy = (hT - hB) / hrows;
  for (let i = 0; i < hcols; i++) {
    for (let j = 0; j < hrows; j++) {
      const x0 = hL + i * hdx, x1 = x0 + hdx;
      const y0 = hB + j * hdy, y1 = y0 + hdy;
      drawTriangle([x0, y0, x1, y0, x0, y1]);
      drawTriangle([x1, y0, x1, y1, x0, y1]);
    }
  }

  // Red cap
  gl.uniform4f(u_FragColor, 0.8, 0.1, 0.1, 1.0);
  const capL = -0.22, capR = 0.22, capB = 0.35, capT = 0.6;
  const capCols = 4, capRows = 2;
  const cdx = (capR - capL) / capCols;
  const cdy = (capT - capB) / capRows;
  for (let i = 0; i < capCols; i++) {
    for (let j = 0; j < capRows; j++) {
      const x0 = capL + i * cdx, x1 = x0 + cdx;
      const y0 = capB + j * cdy, y1 = y0 + cdy;
      drawTriangle([x0, y0, x1, y0, x0, y1]);
      drawTriangle([x1, y0, x1, y1, x0, y1]);
    }
  }

  // Black eyes
  gl.uniform4f(u_FragColor, 0.0, 0.0, 0.0, 1.0);
  drawTriangle([-0.08, 0.25, -0.02, 0.25, -0.05, 0.31]);
  drawTriangle([0.02, 0.25, 0.08, 0.25, 0.05, 0.31]);

  // Black shoes
  gl.uniform4f(u_FragColor, 0.1, 0.05, 0.0, 1.0);
  const shL = -0.25, shR = -0.08, shB = -0.55, shT = -0.5;
  drawTriangle([shL, shB, shR, shB, shL, shT]);
  drawTriangle([shR, shB, shR, shT, shL, shT]);
  const sh2L = 0.08, sh2R = 0.25, sh2B = -0.55, sh2T = -0.5;
  drawTriangle([sh2L, sh2B, sh2R, sh2B, sh2L, sh2T]);
  drawTriangle([sh2R, sh2B, sh2R, sh2T, sh2L, sh2T]);
}
