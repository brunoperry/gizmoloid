class GLUtils {

    static createShader(gl, type, source) {
        const shader = gl.createShader(type);

        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
          return shader;
        } else {
          console.log("error", source)
        }
       
        gl.deleteShader(shader);
      }

      static createProgram(gl, vertexShader, fragmentShader) {
        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
          return program;
        }
       
        console.log(gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
      }
}

export default GLUtils;