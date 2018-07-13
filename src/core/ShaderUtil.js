class ShaderUtil {

    static getShaderFromDOM(domID) {
        return document.getElementById(domID).text;
    }

    static createShader(gl, src, type) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, src);
        gl.compileShader(shader);

        if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {

            console.error("Error compining shader", gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);

            return null;
        }

        return shader;
    }

    static createProgram(gl, vShader, fShader, validate) {
        const prog = gl.createProgram();
        gl.attachShader(prog, vShader);
        gl.attachShader(prog, fShader);
        gl.linkProgram(prog);

        if(!gl.getProgramParameter(prog, gl.LINK_STATUS)) {

            console.error("Error creating program", gl.getProgramInfoLog(prog));
            gl.deleteProgram(prog);
            return null;
        }

        if(validate) {
            gl.validateProgram(prog);
            if(!gl.getProgramParameter(prog, gl.VALIDATE_STATUS)) {
                console.error("Error validating program", gl.getProgramInfoLog(prog));
                gl.deleteProgram(prog);
                return null;
            }
        }

        gl.detachShader(prog, vShader);
        gl.detachShader(prog, fShader);
        gl.deleteShader(vShader);
        gl.deleteShader(fShader);

        return prog;
    }

    static domShaderProgram(gl, vShaderID, fShaderID, validate) {
        const vShaderTXT = ShaderUtil.getShaderFromDOM(vShaderID);
        const fShaderTXT = ShaderUtil.getShaderFromDOM(fShaderID);

        if(!vShaderTXT || !fShaderTXT) return null;

        const vShader = ShaderUtil.createShader(gl, vShaderTXT, gl.VERTEX_SHADER);
        const fShader = ShaderUtil.createShader(gl, fShaderTXT, gl.FRGAMENT_SHADER);

        if(!vShader || !fShader) return null;

        return ShaderUtil.createProgram(gl, vShader, fShader, validate);
    }
}

export default ShaderUtil;