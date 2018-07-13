import Transform from "./Transform.js";

class Camera3D extends Transform {

    constructor(fov, r, n, f) {
        super();

        this.position = vec3.fromValues(0, 0, 2);
    
        this.projectionMatrix = mat4.create();
        mat4.perspective(this.projectionMatrix, fov, r, n, f);
    }

    updateMatrix() {

        mat4.identity(this.matView);

        mat4.translate(this.matView, this.matView, this.position);
        mat4.rotate(this.matView, this.matView, 0, this.rotation);

        mat4.invert(this.matView, this.matView);
        return this.matView;
    }
}

export default Camera3D;