import TemplateScene from "./components/scene/TemplateScene.js";
import gl from "./core/gl.js";
class GizmoGL {

    constructor(resources) {

        this.isRunning = false;

        this.scene = new TemplateScene({
            gameObjects: resources
        });
    }

    init() {

        let tick = 0;
        const loop = () => {

            gl.ctx.clearColor(0, 0, 0, 0);
            gl.ctx.clear(gl.ctx.COLOR_BUFFER_BIT);
            this.scene.update(tick)
            this.scene.draw();

            if(this.isRunning) {
                window.requestAnimationFrame(loop);
            }
            tick++;
        }
        window.requestAnimationFrame(loop);
    }

    startStop() {
        this.isRunning = !this.isRunning;
        if(this.isRunning) this.init();
    }
}

export default GizmoGL;