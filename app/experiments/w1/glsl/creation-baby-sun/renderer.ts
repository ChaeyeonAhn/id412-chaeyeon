// WebGL2 setup for one full-screen triangle, several fragment shaders (one per tab)
// and one video texture. Every frame: copy the current video frame into the
// texture, set the uniforms, draw with the shader of the chosen tab.

export type Renderer = {
  resize: (width: number, height: number, pixelRatio: number) => void;
  render: (mode: number, time: number, video: HTMLVideoElement) => void;
  destroy: () => void;
};

function createShader(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("WebGL could not create a shader.");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader) ?? "Unknown shader error.";
    gl.deleteShader(shader);
    throw new Error(message);
  }
  return shader;
}

function createProgram(gl: WebGL2RenderingContext, vertexSource: string, fragmentSource: string) {
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
  const program = gl.createProgram();
  if (!program) throw new Error("WebGL could not create a program.");
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const message = gl.getProgramInfoLog(program) ?? "Unknown link error.";
    gl.deleteProgram(program);
    throw new Error(message);
  }
  return {
    program,
    position: gl.getAttribLocation(program, "a_position"),
    resolution: gl.getUniformLocation(program, "u_resolution"),
    time: gl.getUniformLocation(program, "u_time"),
    video: gl.getUniformLocation(program, "u_video"),
  };
}

export function createRenderer(
  gl: WebGL2RenderingContext,
  vertexSource: string,
  fragmentSources: string[],
): Renderer {
  const programs = fragmentSources.map((source) => createProgram(gl, vertexSource, source));

  // One triangle that covers the whole screen.
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);

  // The video texture. Flip Y so uv (0,0) is the bottom-left of the video, like gl_FragCoord.
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  // 1x1 black until the first video frame arrives.
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 255]));

  return {
    resize(width, height, pixelRatio) {
      gl.canvas.width = Math.round(width * pixelRatio);
      gl.canvas.height = Math.round(height * pixelRatio);
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    },
    render(mode, time, video) {
      const p = programs[mode];
      gl.useProgram(p.program);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      if (video.readyState >= 2) {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
      }

      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.enableVertexAttribArray(p.position);
      gl.vertexAttribPointer(p.position, 2, gl.FLOAT, false, 0, 0);
      gl.uniform2f(p.resolution, gl.canvas.width, gl.canvas.height);
      gl.uniform1f(p.time, time);
      gl.uniform1i(p.video, 0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
    destroy() {
      gl.deleteTexture(texture);
      gl.deleteBuffer(positionBuffer);
      programs.forEach((p) => gl.deleteProgram(p.program));
    },
  };
}
