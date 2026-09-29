import {
  Mat3
} from "./matrix3.js";

const canvas =
  document.getElementById(
    "glCanvas"
  );

const gl =
  canvas.getContext(
    "webgl2"
  );

if (!gl) {
  throw new Error(
    "WebGL2 tidak tersedia."
  );
}

gl.viewport(
  0,
  0,
  canvas.width,
  canvas.height
);

const vertexShaderSource = `#version 300 es
in vec2 a_position;
uniform mat3 u_matrix;

void main() {
  vec3 p =
    u_matrix *
    vec3(
      a_position,
      1.0
    );

  gl_Position =
    vec4(
      p.xy,
      0.0,
      1.0
    );
}
`;

const fragmentShaderSource = `#version 300 es
precision highp float;
uniform vec4 u_color;
out vec4 outColor;

void main() {
  outColor =
    u_color;
}
`;

function createShader(
  gl,
  type,
  source
) {
  const shader =
    gl.createShader(type);

  gl.shaderSource(
    shader,
    source
  );

  gl.compileShader(
    shader
  );

  const success =
    gl.getShaderParameter(
      shader,
      gl.COMPILE_STATUS
    );

  if (!success) {
    const info =
      gl.getShaderInfoLog(
        shader
      );

    gl.deleteShader(
      shader
    );

    throw new Error(
      "Shader compile error:\n" +
      info
    );
  }

  return shader;
}

function createProgram(
  gl,
  vertexShader,
  fragmentShader
) {
  const program =
    gl.createProgram();

  gl.attachShader(
    program,
    vertexShader
  );

  gl.attachShader(
    program,
    fragmentShader
  );

  gl.linkProgram(
    program
  );

  const success =
    gl.getProgramParameter(
      program,
      gl.LINK_STATUS
    );

  if (!success) {
    const info =
      gl.getProgramInfoLog(
        program
      );

    gl.deleteProgram(
      program
    );

    throw new Error(
      "Program link error:\n" +
      info
    );
  }

  return program;
}

const vertexShader =
  createShader(
    gl,
    gl.VERTEX_SHADER,
    vertexShaderSource
  );

const fragmentShader =
  createShader(
    gl,
    gl.FRAGMENT_SHADER,
    fragmentShaderSource
  );

const program =
  createProgram(
    gl,
    vertexShader,
    fragmentShader
  );

gl.useProgram(
  program
);

const positionLocation =
  gl.getAttribLocation(
    program,
    "a_position"
  );

const matrixLocation =
  gl.getUniformLocation(
    program,
    "u_matrix"
  );

  gl.uniformMatrix3fv(matrixLocation, false, Mat3.identity());

const colorLocation =
  gl.getUniformLocation(
    program,
    "u_color"
  );

function drawShape(vertices, colorRGBA, mode = gl.TRIANGLES) {
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  gl.uniform4fv(colorLocation, new Float32Array(colorRGBA));
  gl.drawArrays(mode, 0, vertices.length / 2);
}

function createCircleVertices(cx, cy, radius, segments = 30) {
  const vertices = [cx, cy];
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * 2 * Math.PI;
    const x = cx + radius * Math.cos(angle);
    const y = cy + radius * Math.sin(angle);
    vertices.push(x, y);
  }
  return vertices;
}

function drawBushRow(baseY, radius, color, offset) { 
  for (let x = -1.0; x <= 1.0 + radius; x += radius * 1.0) { 
    const bump = Math.sin((x + offset) * 18.0) * 0.04; 
    drawShape(createCircleVertices(x, baseY + bump, radius, 20), color, gl.TRIANGLE_FAN); 
  }
} 

function drawBird(posX, posY, scale, seconds, speed = 6.0) {
  const flap = Math.sin(seconds * speed) * (0.02 * scale);

  const points = [];
  const segments = 30;
  const wingWidth = 0.15 * scale;

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const x = (t - 0.5) * (2 * wingWidth); 
    const y = Math.abs(Math.sin(t * Math.PI * 2)) * ((0.05 * scale) + flap);
    
    points.push(x, y);
  }

  const birdMatrix = Mat3.translation(posX, posY);
  gl.uniformMatrix3fv(matrixLocation, false, birdMatrix);
  drawShape(new Float32Array(points), [0.0, 0.0, 0.0, 1.0], gl.LINE_STRIP);
}

function drawScene(seconds) {
  gl.clearColor(0.53, 0.81, 0.98, 1.0); 
  gl.clear(gl.COLOR_BUFFER_BIT); 

  gl.uniformMatrix3fv(matrixLocation, false, Mat3.identity()); 

  // gunung
  drawShape([ 
    -1.0, 0.0, 0.3, 0.0, -0.35, 0.6, 
    -0.2, 0.0, 1.0, 0.0, 0.4, 0.6 
  ], [0.2, 0.3, 0.2, 1.0]); 

  // semak-semak 
  drawBushRow(0.03, 0.08, [0.45, 0.80, 0.20, 1.0], 1.3); 

  // laut
  drawShape([
    -1.0,  0.0,  1.0,  0.0,  -1.0, -1.0,
    -1.0, -1.0,  1.0,  0.0,   1.0, -1.0
  ], [0.0, 0.3, 0.8, 1.0]);

  // pantai kanan
  drawShape([
    0.3,  0.0,  1.5,  0.0,  0.1, -0.15,
    0.1, -0.15, 0.3, -0.3,  1.5,  0.0,
    0.3, -0.3,  1.5,  0.0,  0.1, -0.5,
    0.1, -0.5,  0.6, -0.8,  1.5,  0.0,
    0.3, -1.0,  1.5, 0.0,   1.0, -1.0,
  ], [0.85, 0.65, 0.4, 1.0]);

  // pantai kiri
  drawShape([
    -1.0, 0.0, -0.4, 0.0, -0.8, -0.4,
    -1.0, -0.6, -0.4, -0.5, -1.0, 0.0,
    -1.0, -0.6, -0.4, -0.5, -1.0, -0.4,
    -1.0, -0.6, -0.6, -0.7, -0.4, -0.5,
    -1.0, -0.6,  -0.6, -0.7,  -1.0, -1.0,
    -1.0, -1.0,  -0.6, -0.7,  -0.2, -1.0
  ], [0.85, 0.65, 0.4, 1.0]);

  // rumah
  drawShape([
    0.6, -0.3,   0.9, -0.3,   0.6, -0.5,
    0.6, -0.5,   0.9, -0.3,   0.9, -0.5
  ], [0.9, 0.9, 0.9, 1.0]);

  // atap rumah
  drawShape([
    0.55, -0.3,  0.95, -0.3,  0.75, -0.15
  ], [0.8, 0.15, 0.15, 1.0]);

  // pintu
  drawShape([
    0.65, -0.35, 0.7, -0.35, 0.7, -0.5,
    0.65, -0.35, 0.65, -0.5, 0.7, -0.5
  ], [0.0, 0.7, 0.8, 1.0]);

  // jendela
  drawShape([
    0.75, -0.35, 0.8, -0.35, 0.8, -0.4,
    0.75, -0.35, 0.8, -0.4, 0.75, -0.4
  ], [1.0, 1.0, 1.0, 1.0]);

  drawShape([
    0.83, -0.35, 0.88, -0.35, 0.88, -0.4,
    0.83, -0.35, 0.88, -0.4, 0.83, -0.4
  ], [1.0, 1.0, 1.0, 1.0]);

  // garis jendela
  const windowGridLines1 = new Float32Array([
    0.775, -0.35,   0.775, -0.4,
    0.75, -0.375,   0.8, -0.375
  ]);

  const windowGridLines2 = new Float32Array([
    0.855, -0.35,   0.855, -0.4,
    0.83, -0.375,   0.88, -0.375
  ]);

  drawShape(windowGridLines1, [0.1, 0.1, 0.1, 1.0], gl.LINES);
  drawShape(windowGridLines2, [0.1, 0.1, 0.1, 1.0], gl.LINES);

  // pohon kelapa
  drawShape([
    -0.65, -0.1,  -0.7, -0.1,  -0.65, -0.7,
    -0.7, -0.7,  -0.7, -0.1,  -0.65, -0.7
  ], [0.4, 0.2, 0.1, 1.0]);

  drawShape([
    -0.67, -0.1,  -0.5,  0.2,   -0.35,  0.15,
    -0.67, -0.1,  -0.4, -0.05,  -0.2, -0.2,
    -0.67, -0.1,  -0.35, -0.5, -0.55, -0.4,
    -0.67, -0.1,  -0.95, -0.35, -0.8, -0.35,
    -0.67, -0.1,  -0.98,  0.1,   -0.85, -0.1,
    -0.67, -0.1,  -0.8, 0.35, -0.65, 0.1
  ], [0.0, 0.6, 0.2, 1.0]);

  // matahari  
  const scale = 1.0 + Math.sin(seconds * 3.0) * 0.15;

  const sunX = 0.0;
  const sunY = 0.7;

  const scaleMatrix = Mat3.scaling(scale, scale);
  const translationMatrix = Mat3.translation(sunX, sunY);
  
  const sunMatrix = Mat3.multiply(scaleMatrix, translationMatrix);

  const sunVertices = createCircleVertices(0.0, 0.0, 0.2, 36);
  gl.uniformMatrix3fv(matrixLocation, false, sunMatrix);
  drawShape(sunVertices, [1.0, 0.95, 0.0, 1.0], gl.TRIANGLE_FAN);

  // burung
  const posX = -1.0 + ((seconds * 0.15) % 2.0);
  const posY = 0.6 + Math.sin(seconds * 6.0) * 0.05;
  drawBird(posX, posY, 1.0, seconds, 6.0);
}

function render(time) {
  const seconds = time * 0.001;
  drawScene(seconds);
  requestAnimationFrame(render);
}

requestAnimationFrame(render);
