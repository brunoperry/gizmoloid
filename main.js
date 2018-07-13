import gl from "./src/core/gl.js";
import Resources from "./src/core/Resources.js";
import GizmoGL from "./src/GizmoGL.js";

let gzm;
let btn;
window.onload = async () => {

    gl.init(480, 360);

    const resources = await Resources.init();



    gzm = new GizmoGL(resources);

    btn = document.getElementById("startstop-button")
    btn.onclick = () => { onStartStop(); }
}

const onStartStop = () => {
    gzm.startStop();
    if(gzm.isRunning) {
        btn.innerHTML = "STOP";
    } else {
        btn.innerHTML = "PLAY";
    }
}