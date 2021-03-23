function main(data) {
  const canvas = document.querySelector('#glcanvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

  // If we don't have a GL context, give up now
  if (!gl) {
    alert('Unable to initialize WebGL. Your browser or machine may not support it.');
    return;
  }

  // Vertex shader program
  const vsSource = `
    attribute vec4 aVertexPosition;
    attribute vec4 aVertexColor;
    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;
    varying lowp vec4 vColor;
    void main(void) {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
      vColor = aVertexColor;
    }
  `;

  // Fragment shader program
  const fsSource = `
    varying lowp vec4 vColor;
    void main(void) {
      gl_FragColor = vColor;
    }
  `;

  // Initialize a shader program; this is where all the lighting
  // for the vertices and so forth is established.
  const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

  // Collect all the info needed to use the shader program.
  // Look up which attributes our shader program is using
  // for aVertexPosition, aVevrtexColor and also
  // look up uniform locations.
  const programInfo = {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
      vertexColor: gl.getAttribLocation(shaderProgram, 'aVertexColor'),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
      modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
    }
  };

  // Here's where we call the routine that builds all the
  // objects we'll be drawing.
  const buffers = initBuffers(gl, data);

  // Draw the scene repeatedly
  function render() {
    drawScene(gl, programInfo, buffers, data.vertexCount);
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}

//
// initBuffers
//
// Initialize the buffers we'll need. For this demo, we just
// have one object -- a simple three-dimensional cube.
//
function initBuffers(gl, data) {
  const { positions, indices, faceColors } = data;

  // Create a buffer for the cube's vertex positions.

  const positionBuffer = gl.createBuffer();

  // Select the positionBuffer as the one to apply buffer
  // operations to from here out.

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // Now pass the list of positions into WebGL to build the
  // shape. We do this by creating a Float32Array from the
  // JavaScript array, then use it to fill the current buffer.

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  // Convert the array of colors into a table for all the vertices.
  let colors = [];
  for (let j = 0; j < faceColors.length; ++j) {
    const c = faceColors[j];

    // Repeat each color four times for the four vertices of the face
    colors = colors.concat(c, c, c, c);
  }

  const colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

  // Build the element array buffer; this specifies the indices
  // into the vertex arrays for each face's vertices.

  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

  // Now send the element array to GL
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(indices), gl.STATIC_DRAW);

  return {
    position: positionBuffer,
    color: colorBuffer,
    indices: indexBuffer,
  };
}

// Draw the scene.
function drawScene(gl, programInfo, buffers, vertexCount) {
  // Unpack variables from program control

  gl.clearColor(0.2, 0.2, 0.2, 1.0);  // Clear to black, fully opaque
  gl.clearDepth(1.0);            // Clear everything
  gl.enable(gl.DEPTH_TEST);            // Enable depth testing
  gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

  // Set the viewport
  gl.viewport(0.0, 0.0, gl.canvas.clientWidth, gl.canvas.clientHeight);

  // Clear the canvas before we start drawing on it.

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Create a perspective matrix, a special matrix that is
  // used to simulate the distortion of perspective in a camera.
  // Our field of view is 45 degrees, with a width/height
  // ratio that matches the display size of the canvas
  // and we only want to see objects between 0.1 units
  // and 100 units away from the camera.

  const fieldOfView = 45 * Math.PI / 180;   // in radians
  const left = 0;
  const top = 0;
  const right = gl.canvas.clientWidth;
  const bottom = gl.canvas.clientHeight;
  const aspect = (right - left) / (bottom - top);
  const zNear = 0.1;
  const zFar = 100.0;
  const projectionMatrix = create();
  const cameraAngleRadian = ((document.getElementById('cameraAngle').value  - 50.0) * Math.PI) / 25.0;
  const projectionType = document.getElementById('perspectiveOption').value;
  let radius = -((document.getElementById('cameraZoom').value - 50.0) / 25.0) + 5.5;

  // note: glmatrix.js always has the first argument
  // as the destination to receive the result.
  if (projectionType === "perspective") {
    perspective(projectionMatrix,
        fieldOfView,
        aspect,
        zNear,
        zFar);
  } else if (projectionType === "orthographic") {
    ortho(projectionMatrix,
        -aspect,
        aspect,
        -1.0,
        1.0,
        zNear,
        zFar);
    // Change the radius
    radius *= (2.0 / 5.5);
  } else if (projectionType === "oblique") {
    ortho(projectionMatrix,
        -aspect,
        aspect,
        -1.0,
        1.0,
        zNear,
        zFar);
    // Change the radius
    radius *= (1.5 / 5.5);
    oblique(projectionMatrix, 80, 90);
  }

  // Set the drawing position to the "identity" point, which is
  // the center of the scene.
  const modelViewMatrix = create();

  // Now move the drawing position a bit to where we want to
  // start drawing the square.
  // Camera configuration
  translate(modelViewMatrix,     // destination matrix
                 modelViewMatrix,     // matrix to translate
                 [0.0, 0.0, -radius]);  // amount to translate
  rotate(modelViewMatrix,      // destination matrix
              modelViewMatrix,      // matrix to rotate
              cameraAngleRadian,   // amount to rotate
              [0, 1, 0]);           // axis to rotate around (Y)

  // Translation, Rotation, and Scaling values
  const x = document.getElementById("x").value / 100;
  const y = document.getElementById("y").value / 100;
  const z = document.getElementById("z").value / 100;
  const angleX = document.getElementById("angleX").value / 100;
  const angleY = document.getElementById("angleY").value / 100;
  const angleZ = document.getElementById("angleZ").value / 100;
  const scales = document.getElementById("scale").value;

  // Translation
  translate(modelViewMatrix,    // destination matrix
            modelViewMatrix,    // matrix to translate
            [x, y, z]);         // amount to translate

  // Rotation on X axis
  rotate(modelViewMatrix,   // destination matrix
          modelViewMatrix,    // matrix to rotate
          angleX,             // amount to rotate in radians
          [0, 1, 0]);         // axis to rotate around (X)
        
  // Rotation on Y axis
  rotate(modelViewMatrix,   // destination matrix
        modelViewMatrix,    // matrix to rotate
        angleY,             // amount to rotate in radians
        [1, 0, 0]);         // axis to rotate around (Y)

  // Rotation on Z axis
  rotate(modelViewMatrix,   // destination matrix
        modelViewMatrix,    // matrix to rotate
        angleZ,             // amount to rotate in radians
        [0, 0, 1]);         // axis to rotate around (Z)

  // Scale
  scale(modelViewMatrix,        // destination matrix
    modelViewMatrix,            // matrix to translate
    [scales, scales, scales]);    // amount to translate

  // Tell WebGL how to pull out the positions from the position
  // buffer into the vertexPosition attribute
  {
    const numComponents = 3;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexPosition,
        numComponents,
        type,
        normalize,
        stride,
        offset);
    gl.enableVertexAttribArray(
        programInfo.attribLocations.vertexPosition);
  }

  // Tell WebGL how to pull out the colors from the color buffer
  // into the vertexColor attribute.
  {
    const numComponents = 4;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexColor,
        numComponents,
        type,
        normalize,
        stride,
        offset);
    gl.enableVertexAttribArray(
        programInfo.attribLocations.vertexColor);
  }

  // Tell WebGL which indices to use to index the vertices
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

  // Tell WebGL to use our program when drawing

  gl.useProgram(programInfo.program);

  // Set the shader uniforms

  gl.uniformMatrix4fv(
      programInfo.uniformLocations.projectionMatrix,
      false,
      projectionMatrix);
  gl.uniformMatrix4fv(
      programInfo.uniformLocations.modelViewMatrix,
      false,
      modelViewMatrix);

  {
    const type = gl.UNSIGNED_SHORT;
    const offset = 0;
    gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
  }
}

//
// Initialize a shader program, so WebGL knows how to draw our data
//
function initShaderProgram(gl, vsSource, fsSource) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  // Create the shader program

  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  // If creating the shader program failed, alert

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
    return null;
  }

  return shaderProgram;
}

//
// creates a shader of the given type, uploads the source and
// compiles it.
//
function loadShader(gl, type, source) {
  const shader = gl.createShader(type);

  // Send the source to the shader object

  gl.shaderSource(shader, source);

  // Compile the shader program

  gl.compileShader(shader);

  // See if it compiled successfully

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}
