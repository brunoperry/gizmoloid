import Scene from "./Scene.js";

class TemplateScene extends Scene {

    constructor(sceneData, shaders) {

        super(sceneData, shaders);
        this.cube = this.getGameObjectByName("plane");
    }

    update(tick) {

        let val = Math.sin(tick / 100) / 100;

        this.cube.translate(vec3.fromValues(0,0,0))
        this.cube.rotate(vec3.fromValues(0,0,0), tick / 100)
        super.update(tick);
    }
}

export default TemplateScene;