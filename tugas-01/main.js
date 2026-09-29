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

function createBezierCurve(p0x, p0y, p1x, p1y, p2x, p2y, segments = 15) {
  const points = [];
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const x = (1 - t) * (1 - t) * p0x + 2 * (1 - t) * t * p1x + t * t * p2x;
      const y = (1 - t) * (1 - t) * p0y + 2 * (1 - t) * t * p1y + t * t * p2y;
      points.push(x, y);
    }
  return new Float32Array(points);
}

function drawScene(seconds) {
  // Clear canvas
  gl.clearColor(0.53, 0.81, 0.98, 1.0); // Warna langit
  gl.clear(gl.COLOR_BUFFER_BIT);

  // ==========================================
  // 1. GAMBAR OBJEK STATIS (Latar Belakang, Gunung, Laut, Pohon, Rumah)
  // ==========================================
  gl.uniformMatrix3fv(matrixLocation, false, Mat3.identity());

  drawShape([
    -1.0, 0.0, 0.0, 0.0, -0.5, 0.8,
    0.0, 0.0, 1.0, 0.0, 0.5, 0.5
  ], [0.2, 0.3, 0.2, 1.0]);

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

  // pohon kelapa
  drawShape([
    -0.65, -0.1,  -0.7, -0.1,  -0.65, -0.7,
    -0.7, -0.7,  -0.7, -0.1,  -0.65, -0.7
  ], [0.4, 0.2, 0.1, 1.0]);

  drawShape([
    //daun1
    -0.67, -0.1,  -0.5,  0.2,   -0.35,  0.15,
    //daun2
    -0.67, -0.1,  -0.4, -0.05,  -0.2, -0.2,
    //daun3
    -0.67, -0.1,  -0.35, -0.5, -0.55, -0.4,
    //daun4
    -0.67, -0.1,  -0.95, -0.35, -0.8, -0.35,
    //daun5
    -0.67, -0.1,  -0.98,  0.1,   -0.85, -0.1,
    //daun6
    -0.67, -0.1,  -0.8, 0.35, -0.65, 0.1
  ], [0.0, 0.6, 0.2, 1.0]);

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

  // burung
  const leftWing = createBezierCurve(-0.2, 0.6,  -0.15, 0.68,  -0.1, 0.62);
  const rightWing = createBezierCurve(-0.1, 0.62,  -0.05, 0.68,  0.0, 0.6);

  drawShape(leftWing, [0.0, 0.0, 0.0, 1.0], gl.LINE_STRIP);
  drawShape(rightWing, [0.0, 0.0, 0.0, 1.0], gl.LINE_STRIP);
 
  function updateBirdAnimation(seconds) {
    // Puncak kepakan sayap bergerak naik-turun
    const flap = Math.sin(seconds * 8.0) * 0.05;

    const leftWingDynamic = createBezierCurve(
      -0.2, 0.6,             // Titik Awal
      -0.15, 0.68 + flap,    // Titik Puncak (di-animasikan!)
      -0.1, 0.62             // Titik Tengah
    );

    const rightWingDynamic = createBezierCurve(
      -0.1, 0.62,            // Titik Tengah
      -0.05, 0.68 + flap,    // Titik Puncak (di-animasikan!)
      0.0, 0.6               // Titik Akhir
    );

    drawShape(leftWingDynamic, [0.0, 0.0, 0.0, 1.0], gl.LINE_STRIP);
    drawShape(rightWingDynamic, [0.0, 0.0, 0.0, 1.0], gl.LINE_STRIP);
  }
  
  const scale = 1.0 + Math.sin(seconds * 3.0) * 0.15;

  const sunX = 0.8;
  const sunY = 0.8;

  const scaleMatrix = Mat3.scaling(scale, scale);
  const translationMatrix = Mat3.translation(sunX, sunY);
  
  const sunMatrix = Mat3.multiply(scaleMatrix, translationMatrix);

  const sunVertices = createCircleVertices(0.0, 0.0, 0.2, 36);
  gl.uniformMatrix3fv(matrixLocation, false, sunMatrix);
  drawShape(sunVertices, [1.0, 0.95, 0.0, 1.0], gl.TRIANGLE_FAN);
}

// Render loop
function render(time) {
  const seconds = time * 0.001;
  drawScene(seconds);
  requestAnimationFrame(render);
}

requestAnimationFrame(render);

/*
gl.clearColor(0.05, 0.08, 0.15, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);

drawShape([
  -1.0 , 1.0, -1.0, 0.0, 1.0, 1.0,
  -1.0, 0.0, 1.0, 0.0, 1.0, 1.0
], [0.6, 0.9, 1.0, 1.0]);

drawShape([
  -1.0, 0.0, 0.0, 0.0, -0.5, 0.8,
  0.0, 0.0, 1.0, 0.0, 0.5, 0.5
], [0.2, 0.3, 0.2, 1.0]);

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

// pohon kelapa
drawShape([
  -0.65, -0.1,  -0.7, -0.1,  -0.65, -0.7,
  -0.7, -0.7,  -0.7, -0.1,  -0.65, -0.7
], [0.4, 0.2, 0.1, 1.0]);

drawShape([
  //daun1
  -0.67, -0.1,  -0.5,  0.2,   -0.35,  0.15,
  //daun2
  -0.67, -0.1,  -0.4, -0.05,  -0.2, -0.2,
  //daun3
  -0.67, -0.1,  -0.35, -0.5, -0.55, -0.4,
  //daun4
  -0.67, -0.1,  -0.95, -0.35, -0.8, -0.35,
  //daun5
  -0.67, -0.1,  -0.98,  0.1,   -0.85, -0.1,
  //daun6
  -0.67, -0.1,  -0.8, 0.35, -0.65, 0.1
], [0.0, 0.6, 0.2, 1.0]);

// matahari
const sunVertices = createCircleVertices(0.9, 0.9, 0.2, 40);

drawShape(sunVertices, [1.0, 0.9, 0.0, 1.0], gl.TRIANGLE_FAN);
*/