class Camera {
  constructor() {
    this.fov = 60;
    this.eye = new Vector3([16, 1, 18]);
    this.at = new Vector3([16, 1, 17]);
    this.up = new Vector3([0, 1, 0]);
    
    this.speed = 0.2;
    this.rotationSpeed = 5;
    this.mouseSensitivity = 0.2;
    
    this.viewMatrix = new Matrix4();
    this.updateViewMatrix();
    
    this.projectionMatrix = new Matrix4();
  }
  
  updateViewMatrix() {
    this.viewMatrix.setLookAt(
      this.eye.elements[0], this.eye.elements[1], this.eye.elements[2],
      this.at.elements[0], this.at.elements[1], this.at.elements[2],
      this.up.elements[0], this.up.elements[1], this.up.elements[2]
    );
  }
  
  setProjection(canvas) {
    this.projectionMatrix.setPerspective(
      this.fov, 
      canvas.width / canvas.height, 
      0.1, 
      1000
    );
  }
  
  moveForward() {
    // Compute forward vector f = at - eye
    let fx = this.at.elements[0] - this.eye.elements[0];
    let fy = this.at.elements[1] - this.eye.elements[1];
    let fz = this.at.elements[2] - this.eye.elements[2];
    
    // Normalize
    let len = Math.sqrt(fx * fx + fy * fy + fz * fz);
    fx /= len;
    fy /= len;
    fz /= len;
    
    // Scale by speed
    fx *= this.speed;
    fy *= this.speed;
    fz *= this.speed;
    
    // Add forward vector to both eye and at
    this.eye.elements[0] += fx;
    this.eye.elements[1] += fy;
    this.eye.elements[2] += fz;
    
    this.at.elements[0] += fx;
    this.at.elements[1] += fy;
    this.at.elements[2] += fz;
    
    this.updateViewMatrix();
  }
  
  moveBackwards() {
    // Compute backward vector b = eye - at
    let bx = this.eye.elements[0] - this.at.elements[0];
    let by = this.eye.elements[1] - this.at.elements[1];
    let bz = this.eye.elements[2] - this.at.elements[2];
    
    // Normalize
    let len = Math.sqrt(bx * bx + by * by + bz * bz);
    bx /= len;
    by /= len;
    bz /= len;
    
    // Scale by speed
    bx *= this.speed;
    by *= this.speed;
    bz *= this.speed;
    
    // Add backward vector to both eye and at
    this.eye.elements[0] += bx;
    this.eye.elements[1] += by;
    this.eye.elements[2] += bz;
    
    this.at.elements[0] += bx;
    this.at.elements[1] += by;
    this.at.elements[2] += bz;
    
    this.updateViewMatrix();
  }
  
  moveLeft() {
    // Compute forward vector f = at - eye
    let fx = this.at.elements[0] - this.eye.elements[0];
    let fy = this.at.elements[1] - this.eye.elements[1];
    let fz = this.at.elements[2] - this.eye.elements[2];
    
    // Normalize
    let len = Math.sqrt(fx * fx + fy * fy + fz * fz);
    fx /= len;
    fy /= len;
    fz /= len;
    
    // Compute side vector s = up x f (cross product)
    let sx = this.up.elements[1] * fz - this.up.elements[2] * fy;
    let sy = this.up.elements[2] * fx - this.up.elements[0] * fz;
    let sz = this.up.elements[0] * fy - this.up.elements[1] * fx;
    
    // Normalize
    len = Math.sqrt(sx * sx + sy * sy + sz * sz);
    sx /= len;
    sy /= len;
    sz /= len;
    
    // Scale by speed
    sx *= this.speed;
    sy *= this.speed;
    sz *= this.speed;
    
    // Add side vector to both eye and at
    this.eye.elements[0] += sx;
    this.eye.elements[1] += sy;
    this.eye.elements[2] += sz;
    
    this.at.elements[0] += sx;
    this.at.elements[1] += sy;
    this.at.elements[2] += sz;
    
    this.updateViewMatrix();
  }
  
  moveRight() {
    // Compute forward vector f = at - eye
    let fx = this.at.elements[0] - this.eye.elements[0];
    let fy = this.at.elements[1] - this.eye.elements[1];
    let fz = this.at.elements[2] - this.eye.elements[2];
    
    // Normalize
    let len = Math.sqrt(fx * fx + fy * fy + fz * fz);
    fx /= len;
    fy /= len;
    fz /= len;
    
    // Compute side vector s = f x up (cross product)
    let sx = fy * this.up.elements[2] - fz * this.up.elements[1];
    let sy = fz * this.up.elements[0] - fx * this.up.elements[2];
    let sz = fx * this.up.elements[1] - fy * this.up.elements[0];
    
    // Normalize
    len = Math.sqrt(sx * sx + sy * sy + sz * sz);
    sx /= len;
    sy /= len;
    sz /= len;
    
    // Scale by speed
    sx *= this.speed;
    sy *= this.speed;
    sz *= this.speed;
    
    // Add side vector to both eye and at
    this.eye.elements[0] += sx;
    this.eye.elements[1] += sy;
    this.eye.elements[2] += sz;
    
    this.at.elements[0] += sx;
    this.at.elements[1] += sy;
    this.at.elements[2] += sz;
    
    this.updateViewMatrix();
  }
  
  panLeft() {
    // Compute forward vector f = at - eye
    let f = new Vector3([
      this.at.elements[0] - this.eye.elements[0],
      this.at.elements[1] - this.eye.elements[1],
      this.at.elements[2] - this.eye.elements[2]
    ]);
    
    // Rotate f by rotationSpeed degrees around up vector
    let rotationMatrix = new Matrix4();
    rotationMatrix.setRotate(this.rotationSpeed, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
    let f_prime = rotationMatrix.multiplyVector3(f);
    
    // Update at = eye + f_prime
    this.at.elements[0] = this.eye.elements[0] + f_prime.elements[0];
    this.at.elements[1] = this.eye.elements[1] + f_prime.elements[1];
    this.at.elements[2] = this.eye.elements[2] + f_prime.elements[2];
    
    this.updateViewMatrix();
  }
  
  panRight() {
    // Compute forward vector f = at - eye
    let f = new Vector3([
      this.at.elements[0] - this.eye.elements[0],
      this.at.elements[1] - this.eye.elements[1],
      this.at.elements[2] - this.eye.elements[2]
    ]);
    
    // Rotate f by -rotationSpeed degrees around up vector
    let rotationMatrix = new Matrix4();
    rotationMatrix.setRotate(-this.rotationSpeed, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
    let f_prime = rotationMatrix.multiplyVector3(f);
    
    // Update at = eye + f_prime
    this.at.elements[0] = this.eye.elements[0] + f_prime.elements[0];
    this.at.elements[1] = this.eye.elements[1] + f_prime.elements[1];
    this.at.elements[2] = this.eye.elements[2] + f_prime.elements[2];
    
    this.updateViewMatrix();
  }
  
  panMouse(deltaX, deltaY) {
    // Horizontal rotation (yaw) - rotate around up vector
    if (deltaX !== 0) {
      // Compute forward vector f = at - eye
      let fx = this.at.elements[0] - this.eye.elements[0];
      let fy = this.at.elements[1] - this.eye.elements[1];
      let fz = this.at.elements[2] - this.eye.elements[2];
      
      // Create rotation matrix for horizontal rotation
      let angleX = -deltaX * this.mouseSensitivity;
      let rotationMatrix = new Matrix4();
      rotationMatrix.setRotate(angleX, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
      
      // Apply rotation to forward vector
      let f = new Vector3([fx, fy, fz]);
      let f_prime = rotationMatrix.multiplyVector3(f);
      
      // Update at = eye + f_prime
      this.at.elements[0] = this.eye.elements[0] + f_prime.elements[0];
      this.at.elements[1] = this.eye.elements[1] + f_prime.elements[1];
      this.at.elements[2] = this.eye.elements[2] + f_prime.elements[2];
    }
    
    // Vertical rotation (pitch) - rotate around right vector
    if (deltaY !== 0) {
      // Compute forward vector
      let fx = this.at.elements[0] - this.eye.elements[0];
      let fy = this.at.elements[1] - this.eye.elements[1];
      let fz = this.at.elements[2] - this.eye.elements[2];
      
      // Normalize forward
      let len = Math.sqrt(fx * fx + fy * fy + fz * fz);
      fx /= len;
      fy /= len;
      fz /= len;
      
      // Compute right vector (f x up)
      let rx = fy * this.up.elements[2] - fz * this.up.elements[1];
      let ry = fz * this.up.elements[0] - fx * this.up.elements[2];
      let rz = fx * this.up.elements[1] - fy * this.up.elements[0];
      
      // Create rotation matrix for vertical rotation
      let angleY = -deltaY * this.mouseSensitivity;
      let rotationMatrix = new Matrix4();
      rotationMatrix.setRotate(angleY, rx, ry, rz);
      
      // Apply rotation to forward vector
      let f = new Vector3([
        this.at.elements[0] - this.eye.elements[0],
        this.at.elements[1] - this.eye.elements[1],
        this.at.elements[2] - this.eye.elements[2]
      ]);
      let f_prime = rotationMatrix.multiplyVector3(f);
      
      // Update at = eye + f_prime
      this.at.elements[0] = this.eye.elements[0] + f_prime.elements[0];
      this.at.elements[1] = this.eye.elements[1] + f_prime.elements[1];
      this.at.elements[2] = this.eye.elements[2] + f_prime.elements[2];
    }
    
    this.updateViewMatrix();
  }

  moveUp() {
    // Move up along world Y axis
    this.eye.elements[1] += this.speed;
    this.at.elements[1] += this.speed;
    this.updateViewMatrix();
  }

  moveDown() {
    // Move down along world Y axis
    this.eye.elements[1] -= this.speed;
    this.at.elements[1] -= this.speed;
    this.updateViewMatrix();
  }

  setSprint(isSprinting) {
    // Increase speed when sprinting
    this.speed = isSprinting ? 0.4 : 0.2;
  }
}
