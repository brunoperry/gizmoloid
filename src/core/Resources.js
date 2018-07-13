import FBXLoader from "./loaders/FBXLoader.js";
import OBJLoader from "./loaders/OBJLoader.js";

class Resources {

    static async init(resourcesURL="resources.json") {

        const resourcesData = await fetch(Resources.PATH + resourcesURL);
        const res = await resourcesData.json();



        const shadersData = await Resources.loadShaders(res.shaders);
        const filesData = await Resources.loadFiles(res.models);

        const models = [];
        for (let i = 0; i < filesData.length; i++) {
            const fData = filesData[i];

            let l;
            if(filesData[i].includes("FBX")) {
                l = new FBXLoader(fData, shadersData);
            } else {
                l = new OBJLoader(fData, shadersData);
            }
            models.push(l.models);
            const f = await l.build();
        }

        return models;
    }

    static async loadShaders(shadersURL) {
        const urls = [];
        shadersURL.forEach(url => { urls.push(Resources.PATH + url) });
        return Promise.all(urls.map(url =>
            fetch(url).then(resp => resp.text())
        )).then(shadersData => { 
            return shadersData;
        });
    }

    static async loadFiles(filesURL) {
        const urls = [];
        filesURL.forEach(url => { urls.push(Resources.PATH + url) });
        return Promise.all(urls.map(url =>
            fetch(url).then(resp => resp.text())
        )).then(filesData => { 
            return filesData;
        });
    }
}

Resources.EXT = {
    FBX: "fbx",

}
Resources.PATH = "resources/";

export default Resources;