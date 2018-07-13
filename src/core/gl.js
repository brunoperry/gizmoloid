import Color from "./Color.js";

class gl {

    static init(width = 480, height = 320) {

        const canvas = document.createElement("canvas");
        gl.ctx = canvas.getContext("webgl2");
        if (!gl.ctx) {
            alert("WebGL not supported.");
        } else {
            document.body.prepend(canvas);
            gl.setSize(width, height);
        }
    }

    static setSize(width, height) {
        gl.ctx.canvas.width = width;
        gl.ctx.canvas.height = height;

        gl.ctx.viewport(0, 0, width, height);
    }

    static clear(mask = gl.ctx.COLOR_BUFFER_BIT) {
        gl.ctx.clear(mask);
    }

    static setClearColor(c) {
        gl.ctx.clearColor(c.r, c.g, c.b, c.a);
    }

    static createShader(vShaderTxt, fShaderTxt, doValidate = true, transFeedbackVars = null, transFeedbackInterleaved = true) {
        const vShader = gl.compileShader(vShaderTxt, gl.ctx.VERTEX_SHADER);
        if (!vShader) return null;

        const fShader = gl.compileShader(fShaderTxt, gl.ctx.FRAGMENT_SHADER);
        if (!fShader) { ctx.deleteShader(vShader); return null; }

        return gl.createShaderProgram(vShader, fShader, doValidate, transFeedbackVars, transFeedbackInterleaved);
    }

    static compileShader(src, type) {
        var shader = gl.ctx.createShader(type);
        gl.ctx.shaderSource(shader, src);
        gl.ctx.compileShader(shader);

        if (!gl.ctx.getShaderParameter(shader, gl.ctx.COMPILE_STATUS)) {
            alert("Error compiling shader : " + src, gl.ctx.getShaderInfoLog(shader));
            gl.ctx.deleteShader(shader);
            return null;
        }
        return shader;
    }

    static createShaderProgram(vShader, fShader, doValidate = true, transFeedbackVars = null, transFeedbackInterleaved = true) {
        var prog = gl.ctx.createProgram();
        gl.ctx.attachShader(prog, vShader);
        gl.ctx.attachShader(prog, fShader);

        if (transFeedbackVars != null) {
            gl.ctx.transformFeedbackVaryings(prog, transFeedbackVars,
                ((transFeedbackInterleaved) ? gl.ctx.INTERLEAVED_ATTRIBS : gl.ctx.SEPARATE_ATTRIBS)
            );
        }

        gl.ctx.linkProgram(prog);

        if (!gl.ctx.getProgramParameter(prog, gl.ctx.LINK_STATUS)) {
            alert("Error creating shader program.", gl.ctx.getProgramInfoLog(prog));
            gl.ctx.deleteProgram(prog); return null;
        }

        if (doValidate) {
            gl.ctx.validateProgram(prog);
            if (!gl.ctx.getProgramParameter(prog, gl.ctx.VALIDATE_STATUS)) {
                alert("Error validating program", gl.ctx.getProgramInfoLog(prog));
                gl.ctx.deleteProgram(prog); return null;
            }
        }

        gl.ctx.detachShader(prog, vShader);
        gl.ctx.detachShader(prog, fShader);
        gl.ctx.deleteShader(fShader);
        gl.ctx.deleteShader(vShader);

        return prog;
    }
}

export default gl;