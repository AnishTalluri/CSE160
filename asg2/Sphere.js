class Sphere {
  constructor() {
    this.type='sphere';
    this.position = [0.0,0.0,0.0];
    this.color = [1.0,1.0,1.0,1.0];
    this.matrix = new Matrix4();
    this.segments = 16; // Number of latitude/longitude segments
  }

  render() {
    var rgba = this.color;

    // Pass the color of a point to u_FragColor variable
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

    // Pass the matrix to u_ModelMatrix attribute
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    // Generate sphere vertices using spherical coordinates
    let latSegments = this.segments;
    let lonSegments = this.segments;
    
    for (let lat = 0; lat < latSegments; lat++) {
      let theta1 = (lat * Math.PI) / latSegments;
      let theta2 = ((lat + 1) * Math.PI) / latSegments;
      
      for (let lon = 0; lon < lonSegments; lon++) {
        let phi1 = (lon * 2 * Math.PI) / lonSegments;
        let phi2 = ((lon + 1) * 2 * Math.PI) / lonSegments;
        
        // Calculate vertices for this quad (will be split into 2 triangles)
        // Vertex 1: (theta1, phi1)
        let x1 = Math.sin(theta1) * Math.cos(phi1);
        let y1 = Math.cos(theta1);
        let z1 = Math.sin(theta1) * Math.sin(phi1);
        
        // Vertex 2: (theta2, phi1)
        let x2 = Math.sin(theta2) * Math.cos(phi1);
        let y2 = Math.cos(theta2);
        let z2 = Math.sin(theta2) * Math.sin(phi1);
        
        // Vertex 3: (theta2, phi2)
        let x3 = Math.sin(theta2) * Math.cos(phi2);
        let y3 = Math.cos(theta2);
        let z3 = Math.sin(theta2) * Math.sin(phi2);
        
        // Vertex 4: (theta1, phi2)
        let x4 = Math.sin(theta1) * Math.cos(phi2);
        let y4 = Math.cos(theta1);
        let z4 = Math.sin(theta1) * Math.sin(phi2);
        
        // Scale to unit sphere (radius 1) centered at origin
        // The sphere will be from -0.5 to 0.5 to match cube dimensions
        // Triangle 1
        drawTriangle3D([
          x1 * 0.5, y1 * 0.5, z1 * 0.5,
          x2 * 0.5, y2 * 0.5, z2 * 0.5,
          x3 * 0.5, y3 * 0.5, z3 * 0.5
        ]);
        
        // Triangle 2
        drawTriangle3D([
          x1 * 0.5, y1 * 0.5, z1 * 0.5,
          x3 * 0.5, y3 * 0.5, z3 * 0.5,
          x4 * 0.5, y4 * 0.5, z4 * 0.5
        ]);
      }
    }
  }
}

function drawSphere(matrix, color) {
  let sphere = new Sphere();
  sphere.matrix = matrix;
  sphere.color = color;
  sphere.render();
}
