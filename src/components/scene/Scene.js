import Camera3D from "../Camera3D.js";
import gl from "../../core/gl.js";

class Scene {

    constructor(sceneData, shaders) {


        this.gameObjects = sceneData.gameObjects[0];

        this.camera = new Camera3D(45, gl.ctx.canvas.width / gl.ctx.canvas.height, 0.1, 1000);
    }

    update(tick) {

    }

    draw() {

        const perspMat = this.camera.projectionMatrix;
        const camMat = this.camera.updateMatrix();

        this.gameObjects.forEach(gameObject => {
            gameObject.render(gl.ctx, perspMat, camMat);
        });
    }

    getGameObjectByName(goName) {

        for (let i = 0; i < this.gameObjects.length; i++) {
            const go = this.gameObjects[i];

            console.log(go)
            if(go.name === goName) return go;
        }

        return null;
    }
}

Scene.NAME = "Scene";

export default Scene;