import Component from "../Component.js";

class MeshRenderer extends Component {

    constructor() {
        super();

        this.name = MeshRenderer.NAME;
        this.indexCount = -1;
        this.material = null;
    }

    setData(gl, material, mesh) {

        this.material = material;

        //SET MESH
        this.vao = gl.createVertexArray();
        gl.bindVertexArray(this.vao);

        this.vertexBuffer = gl.createBuffer();							
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mesh.vertices), gl.STATIC_DRAW);
        gl.vertexAttribPointer(this.material.positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.material.positionAttributeLocation);

        //NORMALS
        // this.normalBuffer = gl.createBuffer();
        // gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
        // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mesh.normals), gl.STATIC_DRAW);
        // gl.enableVertexAttribArray(1);
        // gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0);

        //UVS
        this.uvsBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.uvsBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mesh.uvs), gl.STATIC_DRAW);
        gl.vertexAttribPointer(this.material.texcoordAttributeLocation, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.material.texcoordAttributeLocation);


        //INDICES
        this.indexBuffer = gl.createBuffer();
        this.indexCount = mesh.indices.length;
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);  
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(mesh.indices), gl.STATIC_DRAW);


        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);
        gl.cullFace(gl.BACK);

        //DONE. UNBIND EVERYTHING
        gl.bindVertexArray(null);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,null);
    }

    render(gl, pMat, cMat, mMat) {

        this.material.setUniforms(gl, mMat, pMat, cMat)

        gl.bindVertexArray(this.vao);
        gl.drawElements(gl.TRIANGLES, this.indexCount, gl.UNSIGNED_SHORT, 0);
    }
}

MeshRenderer.NAME = "MeshRenderer";

export default MeshRenderer;