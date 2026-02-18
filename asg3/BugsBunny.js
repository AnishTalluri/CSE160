class BugsBunny {
  constructor(x = 16, y = 5, z = 16) {
    this.position = [x, y, z];
    this.pokeJumpHeight = 0;
    this.pokeEarAngle = 0;
    this.animationTime = 0;
  }
  
  updateAnimation(time) {
    this.animationTime = time;
    this.pokeEarAngle = Math.sin(time * 4) * 8;
  }
  
  render() {
    const px = this.position[0];
    const py = this.position[1];
    const pz = this.position[2];
    const jh = this.pokeJumpHeight;
    const ea = this.pokeEarAngle;

    // === BUNNY BODY ===
    let body = new Cube();
    body.color = [0.6, 0.635, 0.643, 1.0];
    body.matrix.translate(px + 0.0, py - 0.1 + jh, pz + 0.0);
    body.matrix.scale(0.4, 0.55, 0.35);
    body.textureNum = -1;
    body.render();

    // === BUNNY BODY INNER ===
    let bodyInner = new Cube();
    bodyInner.color = [1.0, 1.0, 1.0, 1.0];
    bodyInner.matrix.translate(px + 0.0, py - 0.1 + jh, pz + 0.0);
    bodyInner.matrix.scale(0.35, 0.5, 0.3);
    bodyInner.textureNum = -1;
    bodyInner.render();

    // === BUNNY HEAD ===
    let head = new Cube();
    head.color = [0.6, 0.635, 0.643, 1.0];
    head.matrix.translate(px + 0.0, py + 0.38 + jh, pz + 0);
    head.matrix.scale(0.42, 0.4, 0.38);
    head.textureNum = -1;
    head.render();

    // === LEFT EYE - WHITE HALF ===
    let leftEyeWhite = new Cube();
    leftEyeWhite.color = [1.0, 1.0, 1.0, 1.0];
    leftEyeWhite.matrix.translate(px - 0.14, py + 0.448 + jh, pz + 0.20);
    leftEyeWhite.matrix.scale(0.06, 0.10, 0.04);
    leftEyeWhite.textureNum = -1;
    leftEyeWhite.render();

    // === LEFT EYE - BLACK HALF ===
    let leftEyeBlack = new Cube();
    leftEyeBlack.color = [0.0, 0.0, 0.0, 1.0];
    leftEyeBlack.matrix.translate(px - 0.08, py + 0.45 + jh, pz + 0.20);
    leftEyeBlack.matrix.scale(0.06, 0.12, 0.04);
    leftEyeBlack.textureNum = -1;
    leftEyeBlack.render();

    // === RIGHT EYE - BLACK HALF ===
    let rightEyeBlack = new Cube();
    rightEyeBlack.color = [0.0, 0.0, 0.0, 1.0];
    rightEyeBlack.matrix.translate(px + 0.08, py + 0.45 + jh, pz + 0.20);
    rightEyeBlack.matrix.scale(0.06, 0.12, 0.04);
    rightEyeBlack.textureNum = -1;
    rightEyeBlack.render();

    // === RIGHT EYE - WHITE HALF ===
    let rightEyeWhite = new Cube();
    rightEyeWhite.color = [1.0, 1.0, 1.0, 1.0];
    rightEyeWhite.matrix.translate(px + 0.14, py + 0.448 + jh, pz + 0.20);
    rightEyeWhite.matrix.scale(0.06, 0.10, 0.04);
    rightEyeWhite.textureNum = -1;
    rightEyeWhite.render();

    // === NOSE ===
    let nose = new Cube();
    nose.color = [0.851, 0.490, 0.373, 1.0];
    nose.matrix.translate(px + 0.0, py + 0.35 + jh, pz + 0.23);
    nose.matrix.scale(0.08, 0.08, 0.04);
    nose.textureNum = -1;
    nose.render();

    // === LEFT MOUTH ===
    let leftMouth = new Cube();
    leftMouth.color = [1.0, 1.0, 1.0, 1.0];
    leftMouth.matrix.translate(px - 0.16, py + 0.35 + jh, pz + 0.20);
    leftMouth.matrix.scale(0.20, 0.08, 0.04);
    leftMouth.textureNum = -1;
    leftMouth.render();

    // === RIGHT MOUTH ===
    let rightMouth = new Cube();
    rightMouth.color = [1.0, 1.0, 1.0, 1.0];
    rightMouth.matrix.translate(px + 0.16, py + 0.35 + jh, pz + 0.20);
    rightMouth.matrix.scale(0.20, 0.08, 0.04);
    rightMouth.textureNum = -1;
    rightMouth.render();

    // === LEFT LOWER MOUTH ===
    let leftLowerMouth = new Cube();
    leftLowerMouth.color = [1.0, 1.0, 1.0, 1.0];
    leftLowerMouth.matrix.translate(px - 0.16, py + 0.28 + jh, pz + 0.20);
    leftLowerMouth.matrix.scale(0.20, 0.11, 0.04);
    leftLowerMouth.textureNum = -1;
    leftLowerMouth.render();

    // === RIGHT LOWER MOUTH ===
    let rightLowerMouth = new Cube();
    rightLowerMouth.color = [1.0, 1.0, 1.0, 1.0];
    rightLowerMouth.matrix.translate(px + 0.16, py + 0.28 + jh, pz + 0.20);
    rightLowerMouth.matrix.scale(0.20, 0.11, 0.04);
    rightLowerMouth.textureNum = -1;
    rightLowerMouth.render();

    // === MOUTH FILL ===
    let mouthFill = new Cube();
    mouthFill.color = [1.0, 1.0, 1.0, 1.0];
    mouthFill.matrix.translate(px + 0.0, py + 0.28 + jh, pz + 0.20);
    mouthFill.matrix.scale(0.42, 0.20, 0.04);
    mouthFill.textureNum = -1;
    mouthFill.render();

    // === RED MOUTH ===
    let mouthRed = new Cube();
    mouthRed.color = [1.0, 0.0, 0.0, 1.0];
    mouthRed.matrix.translate(px + 0.0, py + 0.27 + jh, pz + 0.21);
    mouthRed.matrix.scale(0.22, 0.06, 0.04);
    mouthRed.textureNum = -1;
    mouthRed.render();

    // === TEETH (LEFT WHITE) ===
    let teethLeft = new Cube();
    teethLeft.color = [1.0, 1.0, 1.0, 1.0];
    teethLeft.matrix.translate(px - 0.0313, py + 0.27 + jh, pz + 0.22);
    teethLeft.matrix.scale(0.05, 0.06, 0.04);
    teethLeft.textureNum = -1;
    teethLeft.render();

    // === TEETH (BLACK STRIP) ===
    let teethStrip = new Cube();
    teethStrip.color = [0.0, 0.0, 0.0, 1.0];
    teethStrip.matrix.translate(px + 0.0, py + 0.27 + jh, pz + 0.23);
    teethStrip.matrix.scale(0.01, 0.06, 0.04);
    teethStrip.textureNum = -1;
    teethStrip.render();

    // === TEETH (RIGHT WHITE) ===
    let teethRight = new Cube();
    teethRight.color = [1.0, 1.0, 1.0, 1.0];
    teethRight.matrix.translate(px + 0.0313, py + 0.27 + jh, pz + 0.22);
    teethRight.matrix.scale(0.05, 0.06, 0.04);
    teethRight.textureNum = -1;
    teethRight.render();

    // === RED MOUTH LOWER ===
    let mouthRedLower = new Cube();
    mouthRedLower.color = [1.0, 0.0, 0.0, 1.0];
    mouthRedLower.matrix.translate(px + 0.0, py + 0.23 + jh, pz + 0.21);
    mouthRedLower.matrix.scale(0.16, 0.05, 0.04);
    mouthRedLower.textureNum = -1;
    mouthRedLower.render();

    // === LEFT EAR ===
    let leftEar = new Cube();
    leftEar.color = [0.6, 0.635, 0.643, 1.0];
    leftEar.matrix.translate(px - 0.16, py + 0.72 + jh, pz + 0);
    leftEar.matrix.rotate(ea, 0, 0, 1);
    leftEar.matrix.scale(0.1, 0.45, 0.1);
    leftEar.textureNum = -1;
    leftEar.render();

    // === LEFT EAR INNER ===
    let leftEarInner = new Cube();
    leftEarInner.color = [0.851, 0.490, 0.373, 1.0];
    leftEarInner.matrix.translate(px - 0.16, py + 0.72 + jh, pz + 0);
    leftEarInner.matrix.rotate(ea, 0, 0, 1);
    leftEarInner.matrix.scale(0.04, 0.45, 0.03);
    leftEarInner.textureNum = -1;
    leftEarInner.render();

    // === LEFT EAR TIP 1 ===
    let leftEarTip1 = new Cube();
    leftEarTip1.color = [0.6, 0.635, 0.643, 1.0];
    leftEarTip1.matrix.translate(px - 0.16, py + 1.0 + jh, pz + 0);
    leftEarTip1.matrix.rotate(ea, 0, 0, 1);
    leftEarTip1.matrix.scale(0.08, 0.15, 0.08);
    leftEarTip1.textureNum = -1;
    leftEarTip1.render();

    // === RIGHT EAR ===
    let rightEar = new Cube();
    rightEar.color = [0.6, 0.635, 0.643, 1.0];
    rightEar.matrix.translate(px + 0.16, py + 0.72 + jh, pz + 0);
    rightEar.matrix.rotate(-ea, 0, 0, 1);
    rightEar.matrix.scale(0.1, 0.45, 0.1);
    rightEar.textureNum = -1;
    rightEar.render();

    // === RIGHT EAR INNER ===
    let rightEarInner = new Cube();
    rightEarInner.color = [0.851, 0.490, 0.373, 1.0];
    rightEarInner.matrix.translate(px + 0.16, py + 0.72 + jh, pz + 0);
    rightEarInner.matrix.rotate(-ea, 0, 0, 1);
    rightEarInner.matrix.scale(0.04, 0.45, 0.03);
    rightEarInner.textureNum = -1;
    rightEarInner.render();

    // === RIGHT EAR TIP 1 ===
    let rightEarTip1 = new Cube();
    rightEarTip1.color = [0.6, 0.635, 0.643, 1.0];
    rightEarTip1.matrix.translate(px + 0.16, py + 1.0 + jh, pz + 0);
    rightEarTip1.matrix.rotate(-ea, 0, 0, 1);
    rightEarTip1.matrix.scale(0.08, 0.15, 0.08);
    rightEarTip1.textureNum = -1;
    rightEarTip1.render();

    // === LEFT SHOULDER ===
    let leftShoulder = new Cube();
    leftShoulder.color = [0.6, 0.635, 0.643, 1.0];
    leftShoulder.matrix.translate(px - 0.2, py + 0.1 + jh, pz + 0);
    leftShoulder.matrix.scale(0.18, 0.2, 0.18);
    leftShoulder.textureNum = -1;
    leftShoulder.render();

    // === LEFT ARM (UPPER) ===
    let leftArmBase = new Cube();
    leftArmBase.color = [0.6, 0.635, 0.643, 1.0];
    leftArmBase.matrix.translate(px - 0.35, py + 0.2 + jh, pz + 0);
    leftArmBase.matrix.translate(0, -0.25, 0);
    leftArmBase.matrix.scale(0.14, 0.5, 0.14);
    leftArmBase.textureNum = -1;
    leftArmBase.render();

    // === LEFT HAND ===
    let leftHand = new Cube();
    leftHand.color = [1.0, 1.0, 1.0, 1.0];
    leftHand.matrix.translate(px - 0.35, py + 0.2 + jh, pz + 0);
    leftHand.matrix.translate(0, -0.53, 0);
    leftHand.matrix.scale(0.20, 0.20, 0.20);
    leftHand.textureNum = -1;
    leftHand.render();

    // === RIGHT SHOULDER ===
    let rightShoulder = new Cube();
    rightShoulder.color = [0.6, 0.635, 0.643, 1.0];
    rightShoulder.matrix.translate(px + 0.2, py + 0.1 + jh, pz + 0);
    rightShoulder.matrix.scale(0.18, 0.2, 0.18);
    rightShoulder.textureNum = -1;
    rightShoulder.render();

    // === RIGHT ARM (UPPER) ===
    let rightArmBase = new Cube();
    rightArmBase.color = [0.6, 0.635, 0.643, 1.0];
    rightArmBase.matrix.translate(px + 0.35, py + 0.2 + jh, pz + 0);
    rightArmBase.matrix.translate(0, -0.25, 0);
    rightArmBase.matrix.scale(0.14, 0.5, 0.14);
    rightArmBase.textureNum = -1;
    rightArmBase.render();

    // === RIGHT HAND ===
    let rightHand = new Cube();
    rightHand.color = [1.0, 1.0, 1.0, 1.0];
    rightHand.matrix.translate(px + 0.35, py + 0.2 + jh, pz + 0);
    rightHand.matrix.translate(0, -0.53, 0);
    rightHand.matrix.scale(0.20, 0.20, 0.20);
    rightHand.textureNum = -1;
    rightHand.render();

    // === LEFT LEG (UPPER) ===
    let leftLegBase = new Cube();
    leftLegBase.color = [0.6, 0.635, 0.643, 1.0];
    leftLegBase.matrix.translate(px - 0.1, py - 0.375 + jh, pz + 0);
    leftLegBase.matrix.translate(0, -0.275, 0);
    leftLegBase.matrix.scale(0.14, 0.55, 0.14);
    leftLegBase.textureNum = -1;
    leftLegBase.render();

    // === RIGHT LEG (UPPER) ===
    let rightLegBase = new Cube();
    rightLegBase.color = [0.6, 0.635, 0.643, 1.0];
    rightLegBase.matrix.translate(px + 0.1, py - 0.375 + jh, pz + 0);
    rightLegBase.matrix.translate(0, -0.275, 0);
    rightLegBase.matrix.scale(0.14, 0.55, 0.14);
    rightLegBase.textureNum = -1;
    rightLegBase.render();

    // === LEFT FOOT ===
    let leftLowerLeg = new Cube();
    leftLowerLeg.matrix.translate(px - 0.1, py - 0.375 + jh, pz + 0);
    leftLowerLeg.matrix.translate(0, -0.55, 0);
    let leftFoot = new Cube();
    leftFoot.color = [1.0, 1.0, 1.0, 1.0];
    leftFoot.matrix = new Matrix4(leftLowerLeg.matrix);
    leftFoot.matrix.translate(-0.059, -0.075, 0.05);
    leftFoot.matrix.rotate(45, 0, 1, 0);
    leftFoot.matrix.rotate(180, 1, 0, 0);
    leftFoot.matrix.scale(0.35, 0.15, 0.2);
    leftFoot.textureNum = -1;
    leftFoot.render();

    // === RIGHT FOOT ===
    let rightLowerLeg = new Cube();
    rightLowerLeg.matrix.translate(px + 0.1, py - 0.375 + jh, pz + 0);
    rightLowerLeg.matrix.translate(0, -0.55, 0);
    let rightFoot = new Cube();
    rightFoot.color = [1.0, 1.0, 1.0, 1.0];
    rightFoot.matrix = new Matrix4(rightLowerLeg.matrix);
    rightFoot.matrix.translate(0.059, -0.075, 0.05);
    rightFoot.matrix.rotate(-45, 0, 1, 0);
    rightFoot.matrix.rotate(180, 1, 0, 0);
    rightFoot.matrix.scale(0.35, 0.15, 0.2);
    rightFoot.textureNum = -1;
    rightFoot.render();

    // === TAIL ===
    let tail = new Cube();
    tail.color = [1.0, 1.0, 1.0, 1.0];
    tail.matrix.translate(px + 0.0, py - 0.2 + jh, pz - 0.30);
    tail.matrix.scale(0.25, 0.25, 0.25);
    tail.textureNum = -1;
    tail.render();
  }
}
