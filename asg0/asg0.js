function main() {
  var canvas = document.getElementById('example');
  if (!canvas) {
    console.log('Failed to retrieve the <canvas> element');
    return;
  }

  var ctx = canvas.getContext('2d');

  // fill the canvas with black color (Step 2)
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, 400, 400);

  // create vector v1 (Step 2)
  var v1 = new Vector3([2.25, 2.25, 0]);
  console.log(v1.elements);

  // draw vector v1 (Step 2)
  drawVector(ctx, v1, 'rgba(255, 0, 0, 1.0)');

  // Blue square from Step 1
  // ctx.fillStyle = 'rgba(0, 0, 255, 1.0)';
  // ctx.fillRect(120, 10, 150, 150);
}

// Function to draw a vector on the canvas (Step 2)
function drawVector(ctx, v, color) {
  // center of the canvas
  var originX = 200;
  var originY = 200;

  // vector components (from Vector3)
  var x = v.elements[0];
  var y = v.elements[1];

  // set stroke style
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(originX, originY);

  // scale by 20, flip y-axis
  ctx.lineTo(originX + x * 20, originY - y * 20);

  ctx.stroke();
}

// Function to handle Draw button click event (Step 3)
function handleDrawEvent() {
  var canvas = document.getElementById('example');
  var ctx = canvas.getContext('2d');

  // Clear the canvas
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, 400, 400);

  // ---- v1 ----
  // Get x and y values from input fields
  var x = document.getElementById('xInput').value;
  var y = document.getElementById('yInput').value;

  // Create vector v1 (z = 0) 
  var v1 = new Vector3([x, y, 0]);

  drawVector(ctx, v1, 'red');

  // ---- v2 ----
  // Read v2 values and draw (Step 4)
  var x2 = parseFloat(document.getElementById('xInput2').value);
  var y2 = parseFloat(document.getElementById('yInput2').value);

  // Create vector v2 (z = 0)
  var v2 = new Vector3([x2, y2, 0]);

  drawVector(ctx, v2, "blue");
}

// Function to handle Draw Opreation button click event (Step 5)
function handleDrawOperationEvent() {
  var canvas = document.getElementById('example');
  var ctx = canvas.getContext('2d');

  // Clear the canvas
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, 400, 400);

    // ---- v1 ----
  // Get x and y values from input fields
  var x = document.getElementById('xInput').value;
  var y = document.getElementById('yInput').value;

  // Create vector v1 (z = 0) 
  var v1 = new Vector3([x, y, 0]);

  drawVector(ctx, v1, 'red');

  // ---- v2 ----
  // Read v2 values and draw (Step 4)
  var x2 = parseFloat(document.getElementById('xInput2').value);
  var y2 = parseFloat(document.getElementById('yInput2').value);

  // Create vector v2 (z = 0)
  var v2 = new Vector3([x2, y2, 0]);

  drawVector(ctx, v2, "blue");

  // Read operation + scalar (Step 5)
  var op = document.getElementById('opSelect').value;
  var s = parseFloat(document.getElementById('scalarInput').value);

  // Perform operation and draw result vector v3
  if (op === 'add') {
    var v3 = new Vector3(v1.elements); // create a copy of v1
    v3.add(v2);
    drawVector(ctx, v3, "green");
  } else if (op === 'sub') {
    var v3 = new Vector3(v1.elements); // create a copy of v1
    v3.sub(v2);
    drawVector(ctx, v3, "green");
  } else if (op === 'mul') {
    var v3 = new Vector3(v1.elements); // create a copy of v1
    v3.mul(s);
    drawVector(ctx, v3, "green");

    var v4 = new Vector3(v2.elements); // create a copy of v2
    v4.mul(s);
    drawVector(ctx, v4, "green");
  } else if (op === 'div') {
    var v3 = new Vector3(v1.elements); // create a copy of v1
    v3.div(s);
    drawVector(ctx, v3, "green");

    var v4 = new Vector3(v2.elements); // create a copy of v2
    v4.div(s);
    drawVector(ctx, v4, "green");
  } else if (op === 'magnitude') {
    // Calculate and log magnitudes
    console.log("Magnitude v1: " + v1.magnitude());
    console.log("Magnitude v2: " + v2.magnitude());
  } else if (op === 'normalize') {

    // Create copies to avoid modifying original vectors
    var n1 = new Vector3(v1.elements); // create a copy of v1
    var n2 = new Vector3(v2.elements); // create a copy of v2

    // Normalize and draw
    n1.normalize();
    n2.normalize();

    drawVector(ctx, n1, "green");
    drawVector(ctx, n2, "green");

  } else if (op === 'angle') {
    // Calculate and log angle between v1 and v2
    const angle = angleBetween(v1, v2);
    console.log("Angle: " + angle);

  } else if (op === 'area') {
    // Calculate and log area of triangle formed by v1 and v2
    const area = areaTriangle(v1, v2);
    console.log("Area of the triangle: " + area);
  }
}

// Function to calculate angle between two vectors in degrees (Step 7)
function angleBetween(v1, v2) {
  // Calculate the angle between v1 and v2 in degrees
  const dot = Vector3.dot(v1, v2);
  const mag1 = v1.magnitude();
  const mag2 = v2.magnitude();

  const cosTheta = dot / (mag1 * mag2);
  const angleRad = Math.acos(cosTheta);
  const angleDeg = angleRad * (180 / Math.PI);

  return angleDeg;
}

function areaTriangle(v1, v2) {
  const cross = Vector3.cross(v1, v2);
  const area = cross.magnitude() / 2;
  return area;
}