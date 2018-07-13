import GLUtils from "../../core/glUtils.js";

class Material {

    constructor(data) {

        this.id = data.materialID;

        this.name = data.name;

        this.positionAttributeLocation = -1;
        this.texcoordAttributeLocation = -1;

        this.modelMatrixUniformLocation = null;
        this.perspMatrixUniformLocation = null;
        this.camMatrixUniformLocation = null;


        this.shaders = data.shaders;
        this.texImage = data.texture;
    }

    setData(gl) {

        //SET SHADERS
        const vShader = GLUtils.createShader(gl, gl.VERTEX_SHADER, this.shaders[0]);
        const fShader = GLUtils.createShader(gl, gl.FRAGMENT_SHADER, this.shaders[1]);

        this.program = GLUtils.createProgram(gl, vShader, fShader);

        this.positionAttributeLocation = gl.getAttribLocation(this.program, "a_position");
        this.texcoordAttributeLocation = gl.getAttribLocation(this.program, "a_texcoord");

        // console.log(this.texcoordAttributeLocation);

        this.modelMatrixUniformLocation = gl.getUniformLocation(this.program, "uMVMatrix");
        this.perspMatrixUniformLocation = gl.getUniformLocation(this.program, "uPMatrix");
        this.camMatrixUniformLocation = gl.getUniformLocation(this.program, "uCameraMatrix");

        //SET TEXTURE
        this.texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,gl.UNSIGNED_BYTE, this.texImage);
        gl.generateMipmap(gl.TEXTURE_2D);


        // this.texture = gl.createTexture();
        // gl.activeTexture(gl.TEXTURE0);
        // gl.bindTexture(gl.TEXTURE_2D, this.texture);
        // gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        // -- Allocate storage for the texture

        // gl.texStorage2D(gl.TEXTURE_2D, 1, gl.RGB8, this.texImage.width, this.texImage.height);
        // gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, gl.RGB, gl.UNSIGNED_BYTE, this.texImage);
    }

    setUniforms(gl, mMat, pMat, cMat) {

        gl.useProgram(this.program);

        gl.uniformMatrix4fv(this.modelMatrixUniformLocation, false, mMat);
        gl.uniformMatrix4fv(this.perspMatrixUniformLocation, false, pMat);
        gl.uniformMatrix4fv(this.camMatrixUniformLocation, false, cMat);
    }
}

export default Material;