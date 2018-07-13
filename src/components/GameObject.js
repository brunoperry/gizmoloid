import Component from "./Component.js";
import Transform from "./Transform.js";
import MeshRenderer from "./render/MeshRenderer.js";

class GameObject extends Transform {

    constructor(name) {

        super();
        this.name = name;
        this.components = new Map();
    }

    addComponent(component) {
        this.components.set(component.name, component);
    }
    getComponent(componentName) {
        return this.components.get(componentName);
    }

    render(gl, pMat, cMat) {

        this.updateMatrix();


        // console.log(this.components.get(MeshRenderer.NAME))
        this.components.get(MeshRenderer.NAME).render(gl, pMat, cMat, this.matView);
    }
}
GameObject.NAME = "GameObject";

export default GameObject;