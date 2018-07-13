import Scene from "./Scene.js";

class TemplateScene extends Scene {

    constructor(sceneData, shaders) {

        super(sceneData, shaders);
        this.cube = this.getGameObjectByName("cube");
    }

    update(tick) {

        let val = Math.sin(tick / 100) / 100;

        // this.cube.translate(vec3.fromValues(0,val,0))
        this.cube.rotate(vec3.fromValues(0,1,0), tick / 100)
        super.update(tick);
    }
}

export default TemplateScene;