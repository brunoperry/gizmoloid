import Loader from "./Loader.js";
import Resources from "../Resources.js";

class OBJLoader extends Loader {

    constructor(fileData, shadersData) {
        super();

        this.shadersData = shadersData;

        this.matURL = null;

        this.objData = {}
        this.objData.objects = this.getObjects(fileData);
    }

    async build() {

        this.createMeshes(this.objData.objects);
        this.objData.materials = await this.getMaterials();

        await this.createMaterials(this.objData.materials);
        this.createModels(this.getModels(this.objData.objects));

        return true;
    }

    getObjects(data) {

        let obj = {
            vertices: [],
            indices: [],
            uvs: [],
            uvsIndices: [],
            normals: [],
            meshID: 0,
            name: null
        };

        const lines = data.split("\n");
        let newMesh = false;
        const meshes = [];
        meshes.push(obj);   

        let index = 1;
        for (let i = 0; i < lines.length; i++) {

            if(lines[i].charAt(0) === "#" || lines[i] === "") continue;
            const line = lines[i].split(" ");

            switch(line[0]) {

                case "mtllib":
                    this.matURL = line[1];
                    break
                case "v":
                    if(newMesh) {
                        // const uvIndexed = [];
                        // for (let i = 0; i < obj.uvsIndices.length; i++) {
                        //     const ind = 1 - obj.uvsIndices[i + 1];
                        //     uvIndexed.push(obj.uvs[ind])
                        // }
                        // console.log(uvIndexed)
                        // obj.uvs = uvIndexed;
                        obj = {
                            vertices: [],
                            indices: [],
                            uvs: [],
                            uvsIndices: [],
                            normals: [],
                            meshID: index,
                            name: null
                        };
                        index++;
                        meshes.push(obj);
                        newMesh = false;
                    }
                    obj.vertices.push(parseFloat(line[1]));
                    obj.vertices.push(parseFloat(line[2]));
                    obj.vertices.push(parseFloat(line[3]));
                    break;
                case "vt":
                    obj.uvs.push([parseFloat(line[1]), parseFloat(line[2])]);
                    break;
                case "vn":
                    obj.normals.push(parseFloat(line[1]));
                    obj.normals.push(parseFloat(line[2]));
                    obj.normals.push(parseFloat(line[3]));
                    break;
                case "g":
                    obj.name = line[1];
                    break;
                case "usemtl":
                    obj.material = line[1];
                    break;
                case "f":
                    const fa = line[1].split("/");
                    const fb = line[2].split("/");
                    const fc = line[3].split("/");
                    obj.indices.push(fa[0] - 1);
                    obj.indices.push(fb[0] - 1);
                    obj.indices.push(fc[0] - 1);

                    obj.uvsIndices.push(parseInt(fa[1] - 1));
                    obj.uvsIndices.push(parseInt(fb[1] - 1));
                    obj.uvsIndices.push(parseInt(fc[1] - 1));

                    newMesh = true;
                break;
            }
            // obj.uvs = tmpUVS;
        }


        let tmpUVS = [];
        for(let i = 0; i < obj.uvsIndices.length; i++) {
            const ind = obj.uvsIndices[i];
            tmpUVS.push(obj.uvs[ind][0], obj.uvs[ind][1])
        }
        // console.log(obj.uvs)
        // console.log(obj.uvsIndices)
        // console.log(tmpUVS)

        obj.uvs = tmpUVS;
        return meshes;
    }

    async getMaterials() {

        return fetch(Resources.PATH + this.matURL).
        then(res => {
            return res.text();
        }).
        then(matText => {
            const mData = [];

            const lines = matText.split("\n");
            let ind = -1;
            for (let i = 0; i  < lines.length; i++) {
                const line = lines[i].split(" ");

                switch(line[0]) {

                    case "newmtl":
                        ind++;
                        mData.push({
                            materialID: ind,
                            name: line[1]
                        });
                        mData[ind].shaders = this.shadersData;
                    break;
                    case "illum":

                    break;
                    case "Kd":

                    break;
                    case "Ka":

                    break;
                    case "Tf":

                    break;
                    case "map_Kd":
                        mData[ind].texture = line[1];
                        break;
                    case "Ni":

                    break;
                }
            }
            return mData;

        })
    }

    getModels(data) {

        const mData = [];
        for (let i = 0; i < data.length; i++) {

            // let m = this.getMatByName(data[i].material)

            mData.push({
                modelID: i,
                mesh: this.getById(this.meshes, data[i].meshID),
                material: this.getMatByName(data[i].material)
            })
        }


        return mData;
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
}

export default OBJLoader;