import Mesh from "../../components/Mesh.js";
import Resources from "../Resources.js";
import Material from "../../components/render/Material.js";
import GameObject from "../../components/GameObject.js";
import MeshRenderer from "../../components/render/MeshRenderer.js";
import gl from "../gl.js";

class Loader {

    constructor() {

        this.meshes = [];
        this.materials = [];
        this.models = [];

        this.loaderData = {
            meshes: this.meshes,
            materials: this.materials,
        }
    }

    createModels(modelsData) {

        for (let i = 0; i < modelsData.length; i++) {
            const model = modelsData[i];
            const gameObject = new GameObject(model.mesh.name);
            gameObject.addComponent(model);

            const mRenderer = new MeshRenderer();
            mRenderer.setData(gl.ctx, model.material, model.mesh);
            gameObject.addComponent(mRenderer);
            this.models.push(gameObject)
        }
    }

    createMeshes(meshesData) {

        const mData = [];
        for(let i = 0; i < meshesData.length; i++) {
            mData.push(new Mesh(meshesData[i]))
        }
        this.meshes.push(mData);
    }

    async createMaterials(materialData) {

        const mData = [];
        for (let i = 0; i < materialData.length; i++) {
            let texURL = materialData[i].texture;

            if(!texURL) texURL = "default.jpg";
            const img = await this.loadImage(Resources.PATH + texURL);

            const mat = new Material({
                materialID: materialData[i].materialID,
                shaders: materialData[i].shaders,
                texture: img,
                name: materialData[i].name
            });
            mat.setData(gl.ctx)
            
            mData.push(mat);
        }
        this.materials.push(mData);
        return mData;
    }

    async loadImage(imgURL) {
        return new Promise((resolve, reject) => {
            let img = new Image()
            img.onload = () => {
                resolve(img)
            }
            img.onerror = reject
            img.src = imgURL
          })
    }

    getById(from, id) {

        for (let i = 0; i < from.length; i++) {

            const element = from[i];
            for (let j = 0; j < element.length; j++) {
                const elementJ = element[j];
                if (elementJ.id === id) {
                    return elementJ;
                }
            }
        }
    }

    getMatByName(name) {

        for (let i = 0; i < this.materials.length; i++) {
            const mat = this.materials[i];
            for(let j = 0; j < mat.length; j++) {
                if(mat[j].name === name) {
                    return mat[j];
                }
            }
        }
    }

    get data() {
        return this.loaderData;
    }
}

export default Loader;