// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  varying vec2 v_UV;
  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
  }
`;

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform sampler2D u_Sampler2;
  uniform sampler2D u_Sampler3;
  uniform sampler2D u_Sampler4;
  uniform int u_whichTexture;
  void main() {
    if (u_whichTexture == -1) {
      gl_FragColor = u_FragColor;
    } else if (u_whichTexture == 0) {
      gl_FragColor = texture2D(u_Sampler0, v_UV);
    } else if (u_whichTexture == 1) {
      gl_FragColor = texture2D(u_Sampler1, v_UV);
    } else if (u_whichTexture == 2) {
      gl_FragColor = texture2D(u_Sampler2, v_UV);
    } else if (u_whichTexture == 3) {
      gl_FragColor = texture2D(u_Sampler3, v_UV);
    } else if (u_whichTexture == 4) {
      gl_FragColor = texture2D(u_Sampler4, v_UV);
    } else {
      gl_FragColor = vec4(1.0, 0.0, 1.0, 1.0); // Magenta for error
    }
  }
`;

// Global variables
var gl;
var canvas;
var a_Position;
var a_UV;
var u_FragColor;
var u_ModelMatrix;
var u_ViewMatrix;
var u_ProjectionMatrix;
var u_Sampler0;
var u_Sampler1;
var u_Sampler2;
var u_Sampler3;
var u_Sampler4;
var u_whichTexture;

var camera;
var world = [];

// Mouse tracking variables
var lastMouseX = -1;
var lastMouseY = -1;
var mouseDown = false;

// Mode tracking
var isFlying = false;
var isSprinting = false;
var keyPressed = {};

// Game tracking
var gameWon = false;
var goalPosition = {x: 2, z: 2}; // Goal is at corner
var blocksPlaced = 0;
var blocksRemoved = 0;

// Block editing distance (how far in front to look)
var blockEditDistance = 3;

// Available wall textures
var wallTextures = [0, 3, 4]; // wall, stone, fancy-wall
var selectedTextureIndex = 0;

// 32x32 world map - 0 = no wall, 1-4 = wall height
var worldMap = [
  [4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
  [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
  [4,0,2,2,2,0,0,0,3,3,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
  [4,0,2,0,2,0,0,0,3,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
  [4,0,2,0,2,0,0,0,3,3,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
  [4,0,2,2,2,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
  [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
  [4,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
  [4,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
  [4,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
  [4,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
  [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
  [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
  [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
  [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,3,3,3,3,0,0,0,0,4],
  [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,3,0,0,0,0,4],
  [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,3,0,0,0,0,4],
  [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,3,0,0,0,0,4],
  [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,3,3,3,3,0,0,0,0,4],
  [4,0,0,0,0,0,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
  [4,0,0,0,0,0,2,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
  [4,0,0,0,0,0,2,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
  [4,0,0,0,0,0,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
  [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
  [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
  [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
  [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
  [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
  [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
  [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
  [4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
  [4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4]
];

// Texture map - stores which texture each block should use (default 0 = wall)
var textureMap = [];

function initTextureMap() {
  // Initialize texture map
  textureMap = [];
  for (let z = 0; z < 32; z++) {
    textureMap[z] = [];
    for (let x = 0; x < 32; x++) {
      // Default texture assignment based on initial map
      if (worldMap[z][x] <= 2) {
        textureMap[z][x] = 0; // Wall texture for short walls
      } else if (worldMap[z][x] <= 4) {
        textureMap[z][x] = 3; // Stone texture for tall walls
      } else {
        textureMap[z][x] = 4; // Fancy wall for very tall
      }
    }
  }
}

// Highlight cube for targeting
var highlightCube = null;

var highlightedBlock = null;

console.log('asg3.js loaded');

function main() {
  console.log('main() started');
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  gl = canvas.getContext('webgl', { preserveDrawingBuffer: true });
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to initialize shaders.');
    return;
  }

  // Get the storage locations of attribute and uniform variables
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  a_UV = gl.getAttribLocation(gl.program, 'a_UV');
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
  u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
  u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
  u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Sampler2');
  u_Sampler3 = gl.getUniformLocation(gl.program, 'u_Sampler3');
  u_Sampler4 = gl.getUniformLocation(gl.program, 'u_Sampler4');
  u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');

  if (a_Position < 0 || a_UV < 0 || !u_FragColor || !u_ModelMatrix || 
      !u_ViewMatrix || !u_ProjectionMatrix || !u_Sampler0 || !u_whichTexture) {
    console.log('Failed to get the storage location of attribute or uniform variable');
    return;
  }

  // Initialize buffers
  initBuffers();

  // Initialize texture map
  initTextureMap();

  // Set up camera
  camera = new Camera();
  camera.setProjection(canvas);

  // Register keyboard event handlers
  document.onkeydown = keydown;
  document.onkeyup = keyup;

  // Register mouse event handlers
  canvas.onmousedown = function(ev) { mouseDown = true; };
  canvas.onmouseup = function(ev) { mouseDown = false; };
  canvas.onmousemove = handleMouseMove;
  
  // Click to lock pointer (optional - for better FPS feel)
  canvas.onclick = function() {
    canvas.requestPointerLock = canvas.requestPointerLock || canvas.mozRequestPointerLock;
    canvas.requestPointerLock();
  };

  // Specify the color for clearing <canvas>
  gl.clearColor(0.53, 0.81, 0.92, 1.0); // Sky blue

  // Enable depth test
  gl.enable(gl.DEPTH_TEST);

  // Initialize textures
  initTextures();

  // Build the world
  buildWorld();

  // Start rendering
  console.log('Starting render...');
  renderLoop();
}

function initTextures() {
  // Create textures
  var texture0 = gl.createTexture();
  var texture1 = gl.createTexture();
  var texture2 = gl.createTexture();
  var texture3 = gl.createTexture();
  var texture4 = gl.createTexture();

  if (!texture0 || !texture1 || !texture2 || !texture3 || !texture4) {
    console.log('Failed to create texture object');
    return false;
  }

  // Create images
  var image0 = new Image();
  var image1 = new Image();
  var image2 = new Image();
  var image3 = new Image();
  var image4 = new Image();

  if (!image0 || !image1 || !image2 || !image3 || !image4) {
    console.log('Failed to create image object');
    return false;
  }

  // Register the event handler to be called when image loading is completed
  image0.onload = function() { 
    console.log('Loaded wall.jpg');
    loadTexture(texture0, image0, 0); 
  };
  image1.onload = function() { 
    console.log('Loaded grass.jpg');
    loadTexture(texture1, image1, 1); 
  };
  image2.onload = function() { 
    console.log('Loaded sky.jpg');
    loadTexture(texture2, image2, 2); 
  };
  image3.onload = function() { 
    console.log('Loaded stone.jpg');
    loadTexture(texture3, image3, 3); 
  };
  image4.onload = function() { 
    console.log('Loaded fancy-wall.jpg');
    loadTexture(texture4, image4, 4); 
  };
  
  image0.onerror = function() { console.error('Failed to load wall.jpg'); };
  image1.onerror = function() { console.error('Failed to load grass.jpg'); };
  image2.onerror = function() { console.error('Failed to load sky.jpg'); };
  image3.onerror = function() { console.error('Failed to load stone.jpg'); };
  image4.onerror = function() { console.error('Failed to load fancy-wall.jpg'); };

  // Tell the browser to load images
  console.log('Loading textures...');
  image0.src = 'wall.jpg';
  image1.src = 'grass.jpg';
  image2.src = 'sky.jpg';
  image3.src = 'stone.jpg';
  image4.src = 'fancy-wall.jpg';

  return true;
}

var g_texUnit0 = false;
var g_texUnit1 = false;
var g_texUnit2 = false;
var g_texUnit3 = false;
var g_texUnit4 = false;

function loadTexture(texture, image, texUnit) {
  // Flip the image's y-axis
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);

  // Activate texture unit
  if (texUnit == 0) {
    gl.activeTexture(gl.TEXTURE0);
    g_texUnit0 = true;
  } else if (texUnit == 1) {
    gl.activeTexture(gl.TEXTURE1);
    g_texUnit1 = true;
  } else if (texUnit == 2) {
    gl.activeTexture(gl.TEXTURE2);
    g_texUnit2 = true;
  } else if (texUnit == 3) {
    gl.activeTexture(gl.TEXTURE3);
    g_texUnit3 = true;
  } else if (texUnit == 4) {
    gl.activeTexture(gl.TEXTURE4);
    g_texUnit4 = true;
  }

  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  // Set the image to texture
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  // Pass the texture unit to the sampler
  if (texUnit == 0) {
    gl.uniform1i(u_Sampler0, 0);
  } else if (texUnit == 1) {
    gl.uniform1i(u_Sampler1, 1);
  } else if (texUnit == 2) {
    gl.uniform1i(u_Sampler2, 2);
  } else if (texUnit == 3) {
    gl.uniform1i(u_Sampler3, 3);
  } else if (texUnit == 4) {
    gl.uniform1i(u_Sampler4, 4);
  }

  // Check if all textures are loaded
  if (g_texUnit0 && g_texUnit1 && g_texUnit2 && g_texUnit3 && g_texUnit4) {
    renderScene();
  }
}

function buildWorld() {
  world = [];

  // Create ground
  var ground = new Cube();
  ground.color = [0.4, 0.8, 0.4, 1.0];
  ground.matrix.translate(0, -0.1, 0);
  ground.matrix.scale(32, 0.1, 32);
  ground.textureNum = 1; // Grass texture
  world.push(ground);

  // Create sky box
  var sky = new Cube();
  sky.color = [0.53, 0.81, 0.92, 1.0];
  sky.matrix.translate(16, 16, 16);
  sky.matrix.scale(500, 500, 500);
  sky.textureNum = 2; // Sky texture
  world.push(sky);

  // Create walls from map
  for (let x = 0; x < 32; x++) {
    for (let z = 0; z < 32; z++) {
      let height = worldMap[z][x];
      if (height > 0) {
        // Create stack of cubes based on height
        for (let y = 0; y < height; y++) {
          let wall = new Cube();
          wall.color = [0.7, 0.7, 0.7, 1.0];
          wall.matrix.translate(x, y, z);
          
          // Use texture from textureMap
          wall.textureNum = textureMap[z][x];
          
          world.push(wall);
        }
      }
    }
  }

  console.log('World built with ' + world.length + ' objects');
}

function getBlockInFront() {
  // Compute forward direction vector
  let fx = camera.at.elements[0] - camera.eye.elements[0];
  let fy = camera.at.elements[1] - camera.eye.elements[1];
  let fz = camera.at.elements[2] - camera.eye.elements[2];
  
  // Normalize
  let len = Math.sqrt(fx * fx + fy * fy + fz * fz);
  fx /= len;
  fy /= len;
  fz /= len;
  
  // Get position in front of camera
  let targetX = camera.eye.elements[0] + fx * blockEditDistance;
  let targetY = camera.eye.elements[1] + fy * blockEditDistance;
  let targetZ = camera.eye.elements[2] + fz * blockEditDistance;
  
  // Round to nearest block
  let blockX = Math.round(targetX);
  let blockY = Math.round(targetY);
  let blockZ = Math.round(targetZ);
  
  // Clamp to world bounds
  blockX = Math.max(0, Math.min(31, blockX));
  blockY = Math.max(0, Math.min(3, blockY));
  blockZ = Math.max(0, Math.min(31, blockZ));
  
  return { x: blockX, y: blockY, z: blockZ };
}

function placeBlock() {
  let block = getBlockInFront();
  
  // Check bounds
  if (block.x < 0 || block.x >= 32 || block.z < 0 || block.z >= 32) {
    return;
  }
  
  // Increase height at this location
  if (worldMap[block.z][block.x] < 4) {
    worldMap[block.z][block.x]++;
    // Set texture to currently selected texture
    textureMap[block.z][block.x] = wallTextures[selectedTextureIndex];
    blocksPlaced++;
    console.log('Placed block at (' + block.x + ', ' + block.z + '), texture: ' + wallTextures[selectedTextureIndex]);
    rebuildWorld();
  }
}

function removeBlock() {
  let block = getBlockInFront();
  
  // Check bounds
  if (block.x < 0 || block.x >= 32 || block.z < 0 || block.z >= 32) {
    return;
  }
  
  // Decrease height at this location
  if (worldMap[block.z][block.x] > 0) {
    worldMap[block.z][block.x]--;
    blocksRemoved++;
    console.log('Removed block at (' + block.x + ', ' + block.z + '), new height: ' + worldMap[block.z][block.x]);
    rebuildWorld();
  }
}

function rebuildWorld() {
  // Rebuild the entire world based on current map
  buildWorld();
  renderScene();
}

function handleMouseMove(ev) {
  // Check if pointer is locked
  if (document.pointerLockElement === canvas || document.mozPointerLockElement === canvas) {
    // Use movement deltas when pointer is locked
    let deltaX = ev.movementX || ev.mozMovementX || 0;
    let deltaY = ev.movementY || ev.mozMovementY || 0;
    
    camera.panMouse(deltaX, deltaY);
    renderScene();
  } else if (mouseDown) {
    // Fallback: only rotate when mouse button is held down
    if (lastMouseX === -1) {
      lastMouseX = ev.clientX;
      lastMouseY = ev.clientY;
      return;
    }
    
    let deltaX = ev.clientX - lastMouseX;
    let deltaY = ev.clientY - lastMouseY;
    
    lastMouseX = ev.clientX;
    lastMouseY = ev.clientY;
    
    camera.panMouse(deltaX, deltaY);
    renderScene();
  } else {
    lastMouseX = -1;
    lastMouseY = -1;
  }
}

function renderLoop() {
  // Handle continuous input
  if (isFlying) {
    // Continuous movement when flying
    if (keyPressed[32]) { // Space - fly up
      camera.moveUp();
    }
    if (keyPressed[17]) { // Ctrl - fly down
      camera.moveDown();
    }
  }
  
  // Update status display
  updateStatusDisplay();
  
  requestAnimationFrame(renderLoop);
  renderScene();
}

function renderScene() {
  // Clear color and depth buffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Pass the view and projection matrices to the shader
  gl.uniformMatrix4fv(u_ViewMatrix, false, camera.viewMatrix.elements);
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, camera.projectionMatrix.elements);

  // Render all world objects
  for (let i = 0; i < world.length; i++) {
    world[i].render();
  }
  
  // Draw highlight cube for targeted block
  let target = getBlockInFront();
  if (target.x >= 0 && target.x < 32 && target.z >= 0 && target.z < 32) {
    let highlight = new Cube();
    highlight.color = [1.0, 1.0, 0.0, 0.3]; // Yellow with transparency
    highlight.matrix.translate(target.x, target.y, target.z);
    highlight.textureNum = -1; // Use solid color (yellow)
    highlight.render();
  }
}

function keydown(ev) {
  keyPressed[ev.keyCode] = true;
  console.log('Key pressed: ' + ev.keyCode);
  
  // Shift - Sprint mode
  if (ev.keyCode === 16) {
    isSprinting = true;
    camera.setSprint(true);
    updateModeDisplay();
  }
  // Space - Flying mode toggle
  else if (ev.keyCode === 32) {
    isFlying = !isFlying;
    updateModeDisplay();
    console.log('Flying mode: ' + (isFlying ? 'ON' : 'OFF'));
  }
  // W - Move forward
  else if (ev.keyCode === 87) {
    console.log('Moving forward');
    camera.moveForward();
  }
  // S - Move backward
  else if (ev.keyCode === 83) {
    console.log('Moving backward');
    camera.moveBackwards();
  }
  // A - Move left
  else if (ev.keyCode === 65) {
    console.log('Moving left');
    camera.moveLeft();
  }
  // D - Move right
  else if (ev.keyCode === 68) {
    console.log('Moving right');
    camera.moveRight();
  }
  // Q - Rotate left
  else if (ev.keyCode === 81) {
    console.log('Rotating left');
    camera.panLeft();
  }
  // E - Rotate right
  else if (ev.keyCode === 69) {
    console.log('Rotating right');
    camera.panRight();
  }
  // Ctrl - Move down (when flying)
  else if (ev.keyCode === 17) {
    if (isFlying) {
      camera.moveDown();
      console.log('Moving down');
    }
  }
  // X - Place block
  else if (ev.keyCode === 88) {
    console.log('Placing block');
    placeBlock();
  }
  // Z - Remove block
  else if (ev.keyCode === 90) {
    console.log('Removing block');
    removeBlock();
  }
  // Left Arrow - Previous texture
  else if (ev.keyCode === 37) {
    selectedTextureIndex = (selectedTextureIndex - 1 + wallTextures.length) % wallTextures.length;
    let textureNames = ['Wall', 'Stone', 'Fancy Wall'];
    console.log('Selected texture: ' + textureNames[selectedTextureIndex] + ' (texture ' + wallTextures[selectedTextureIndex] + ')');
    updateTextureDisplay();
  }
  // Right Arrow - Next texture
  else if (ev.keyCode === 39) {
    selectedTextureIndex = (selectedTextureIndex + 1) % wallTextures.length;
    let textureNames = ['Wall', 'Stone', 'Fancy Wall'];
    console.log('Selected texture: ' + textureNames[selectedTextureIndex] + ' (texture ' + wallTextures[selectedTextureIndex] + ')');
    updateTextureDisplay();
  }

  renderScene();
}

function keyup(ev) {
  keyPressed[ev.keyCode] = false;
  
  // Shift released - Stop sprinting
  if (ev.keyCode === 16) {
    isSprinting = false;
    camera.setSprint(false);
    updateModeDisplay();
  }
}

function updateTextureDisplay() {
  let textureNames = ['Wall', 'Stone', 'Fancy Wall'];
  let display = document.getElementById('textureDisplay');
  if (display) {
    display.textContent = textureNames[selectedTextureIndex];
  }
}

function updateModeDisplay() {
  let modeDisplay = document.getElementById('modeDisplay');
  if (modeDisplay) {
    let modes = [];
    if (isFlying) modes.push('FLYING');
    if (isSprinting) modes.push('SPRINTING');
    modeDisplay.textContent = modes.length > 0 ? modes.join(' | ') : 'Normal';
  }
}

function updateStatusDisplay() {
  // Update position
  let posDisplay = document.getElementById('posDisplay');
  if (posDisplay && camera) {
    let x = camera.eye.elements[0].toFixed(1);
    let y = camera.eye.elements[1].toFixed(1);
    let z = camera.eye.elements[2].toFixed(1);
    posDisplay.textContent = `X: ${x} Y: ${y} Z: ${z}`;
    
    // Check if player reached goal
    checkGoal();
  }
  
  // Update block count
  let blockCount = document.getElementById('blockCount');
  if (blockCount) {
    blockCount.textContent = world.length;
  }
  
  // Update game stats
  let statsDisplay = document.getElementById('statsDisplay');
  if (statsDisplay) {
    statsDisplay.textContent = `Placed: ${blocksPlaced} | Removed: ${blocksRemoved}`;
  }
}

function checkGoal() {
  if (gameWon) return;
  
  let playerX = Math.floor(camera.eye.elements[0]);
  let playerZ = Math.floor(camera.eye.elements[2]);
  
  // Check if player reached goal (corner at 2,2)
  if (Math.abs(playerX - goalPosition.x) < 2 && Math.abs(playerZ - goalPosition.z) < 2) {
    gameWon = true;
    showWinMessage();
  }
}

function showWinMessage() {
  let winMsg = document.getElementById('winMessage');
  let winStats = document.getElementById('winStats');
  
  if (winMsg) {
    winMsg.style.display = 'block';
  }
  
  if (winStats) {
    winStats.textContent = `Blocks Placed: ${blocksPlaced} | Blocks Removed: ${blocksRemoved}`;
  }
}
