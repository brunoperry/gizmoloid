import Component from "./Component.js";

class Transform extends Component {

    constructor() {

        super();
        this.name = Transform.NAME;

        this.position = vec3.fromValues(0,0,0);
        this.scale = vec3.fromValues(1, 1, 1);
        this.rotation = vec4.create();
        this.matView = mat4.create();
        this.matNormal = mat3.create();
    }

    translate(amount) {
        vec3.add(this.position, this.position, amount);
    }

    rotate(axis, amount) {
        this.rotation.x = axis[0];
        this.rotation.y = axis[1];
        this.rotation.z = axis[2];
        this.rotation.w = amount;
    }

    updateMatrix() {

        mat4.identity(this.matView);
        mat4.translate(this.matView, this.matView, this.position);
        mat4.rotate(this.matView, this.matView, this.rotation.w, vec3.fromValues(this.rotation.x,this.rotation.y,this.rotation.z));
        mat4.scale(this.matView, this.matView, this.scale);

        return this.matView;
    }
}
Transform.NAME = "Transform";

export default Transform;