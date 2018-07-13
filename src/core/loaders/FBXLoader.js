import Loader from "./Loader.js";

class FBXLoader extends Loader {

    constructor(fileData, shadersData) {
        super();

        this.shadersData = shadersData;
        this.fbxData = this.parse(fileData);
    }

    async build() {

        const obj = this.fbxData.Objects;

        this.createMeshes(obj);

        await this.createMaterials(obj);
        this.createModels(obj);

        return true;
    }

    async createMaterials(materialsData) {

        const mData = [];

        for (let key in materialsData) {
            if (key.includes("Material_")) {
                mData.push({
                    materialID: parseInt(key.split("_")[1])
                });
            }
        }

        for (let i = 0; i < mData.length; i++) {
            const mat = mData[i];
            mData[i].texture = this.getTextureFromConnection(mat.materialID);
            mData[i].shaders = this.shadersData;
        }
        console.log(mData)

        return super.createMaterials(mData);
    }

    createModels(data) {
        const mData = [];

        for (let key in data) {
            if (key.includes("Model_")) {

                const modelID = parseInt(key.split("_")[1]);
                const model = {
                    modelID: modelID
                }

                const conns = this.setModelConnections(modelID);

                for (let keya in conns) {

                    if (keya === FBXLoader.SpecialNodes.GEOMETRY) {
                        model.mesh = this.getById(this.meshes, conns[keya]);
                    } else if (keya === FBXLoader.SpecialNodes.MATERIAL) {
                        model.material = this.getById(this.materials, conns[keya]);
                    }
                }

                mData.push(model);
            }
        }
        super.createModels(mData);
    }

    setModelConnections(modelID) {

        const out = {};
        this.fbxData.Connections.forEach(conn => {
            if (conn.to.id === modelID) {

                if (conn.from.name.includes(FBXLoader.SpecialNodes.GEOMETRY)) {

                    out[FBXLoader.SpecialNodes.GEOMETRY] = conn.from.id;
                } else if (conn.from.name.includes(FBXLoader.SpecialNodes.MATERIAL)) {
                    out[FBXLoader.SpecialNodes.MATERIAL] = conn.from.id;
                }
            }
        });

        return out;
    }

    createMeshes(data) {

        const meshesData = [];

        let verts = [];
        let indices = [];
        let uvs = [];
        let uvsIndices = [];
        let normals = [];
        let name = "";
        let meshID = null;

        for (let key in data) {
            if (key.includes("Geometry_")) {

                meshID = parseInt(key.split("_")[1]);
                name = this.getNameFromConnection(meshID);

                verts = data[key].Vertices;
                for (let i = 0; i < verts.length; i++) { verts[i] = parseFloat(verts[i]); }

                indices = data[key].PolygonVertexIndex;

                for (let i = 0; i < indices.length; i++) {
                    let inV = parseInt(indices[i]);
                    if (inV < 0) { inV = Math.abs(inV) - 1; }
                    indices[i] = inV;
                }
                uvs = data[key].LayerElementUV.UV;
                for (let i = 0; i < uvs.length; i++) { uvs[i] = parseFloat(uvs[i]); }

                uvsIndices = data[key].LayerElementUV.UVIndex;
                for (let i = 0; i < uvsIndices.length; i++) { uvsIndices[i] = parseInt(uvsIndices[i]); }

                normals = data[key].LayerElementNormal.Normals;
                for (let i = 0; i < normals.length; i++) { normals[i] = parseFloat(normals[i]); }

                const tmpuvs = [];
                for (let i = 0; i < uvs.length; i += 2) {
                    tmpuvs.push([uvs[i], uvs[i + 1]])
                }

                const tmpIndices = [];
                for(let m = 0; m < indices.length; m+=3) {

                    tmpIndices.push([indices[m], indices[m+1], indices[m+2]])
                }

                const indexedUVS = [];

                // const g = [];
                for (let j = 0; j < uvsIndices.length; j++) {
                    const index = uvsIndices[j];
                    const uv = tmpuvs[index];
                    indexedUVS.push(uv[0]);
                    indexedUVS.push(uv[1]);

                    // g.push([uv[0], uv[1]])
                }

                // const e = [];
                // for(let k = 0; k < indices.length; k++) {

                //     console.log(indices[k])
                //     e.push(indexedUVS[indices[k]]);
                // }

                // 2, 0, 3, 3, 0, 1
                let t = [
                    0, 1,
                    0, 0,
                    1, 1,
                    1, 0
                ]

                t = [
                    0, 1, 
                    0, 0, 
                    1, 1, 
                    1, 1, 
                    0, 0, 
                    1, 0
                ];
                // console.log("I", verts)
                // console.log(indexedUVS);

                // console.log("t", t)

                uvs = indexedUVS;


                // console.log(data[key])
                meshesData.push({
                    vertices: verts,
                    indices: indices,
                    uvs: uvs,
                    uvsIndices: uvsIndices,
                    normals: normals,
                    meshID: meshID,
                    name: name
                });
            }
        }

        super.createMeshes(meshesData);
    }

    parse(data) {

        let fbxObject = {};
        const nodesData = [];
        let rawData = data;

        const parseDataToNodesTXT = () => {
            let doParse = false;
            let openBrackets = 0;

            let nodeData = "";

            const lines = rawData.split("\n");
            for (let i = 0; i < lines.length; i++) {
                let line = lines[i];

                if (!line || line.charAt(0) === ";") {
                    continue;
                }

                if (line.includes("{")) {
                    doParse = true;
                    openBrackets++;

                } else if (line.includes("}")) {
                    openBrackets--;
                    if (openBrackets === 0) {
                        doParse = false;
                        nodeData += line + "\n";

                        nodesData.push(nodeData);
                        rawData = rawData.replace(nodeData);

                        parseDataToNodesTXT();
                        break;
                    }
                }

                if (doParse) {

                    if (line.includes("undefined")) line = line.replace("undefined", "");

                    nodeData += line + "\n";
                }
            }
        }

        parseDataToNodesTXT();

        for (let i = 0; i < nodesData.length; i++) {
            const node = this.parseNode(nodesData[i]);
            fbxObject[node.key] = node.value;
        }

        return fbxObject;
    }


    parseNode(data) {

        let nodeObject = {}

        const subNodesData = [];
        let subNodeData = "";

        let doSubNodeParse = false;
        let openBrackets = 0;

        const lines = data.split("\n");
        let n = this.cleanStr(lines[0]);
        let key = n.split(":")[0];

        let lockNodeProp = false;

        const propKName = this.getNodeKeyPropertyName(n);

        if (propKName) {
            key = propKName;
            lockNodeProp = true;
        }

        if (key === FBXLoader.SpecialNodes.PROPERTIES70) {
            const propArray = [];
            for (let i = 1; i < lines.length - 1; i++) {
                let line = lines[i];
                if (!line.includes(FBXLoader.SpecialNodes.P)) continue;
                line = line.replace(FBXLoader.SpecialNodes.P + ":", "");
                line = this.cleanStr(line, '"');
                propArray.push(line.split(","));
            }
            nodeObject = propArray;
        } else if (key === FBXLoader.SpecialNodes.CONNECTIONS) {


            nodeObject = this.parseConnections(data);

        } else {

            if (n.includes('"{') && !lockNodeProp) {

                const prop = this.getNodeProperty(n)
                nodeObject.props = prop.value;
            } else if (n.includes(":*")) {

                nodeObject = this.getNumList(data, lines[0])

                // const nums = lines[1].split(",");
                // nums[0] = this.cleanStr(nums[0], "a:");


                // return {
                //     key: key,
                //     value: nums
                // }
            } else {
                for (let i = 1; i < lines.length - 1; i++) {
                    const line = lines[i];

                    if (line.includes("{")) {

                        openBrackets++;
                        if (!doSubNodeParse) {
                            doSubNodeParse = true;
                        }
                    } else if (line.includes("}")) {
                        openBrackets--;


                        if (openBrackets === 0) {

                            subNodesData.push(subNodeData);
                            doSubNodeParse = false;
                            subNodeData = "";
                        }
                    } else if (!doSubNodeParse) {
                        const prop = this.getNodeProperty(line);


                        if (prop.key === FBXLoader.SpecialNodes.A) {

                        }
                        nodeObject[prop.key] = prop.value;
                    }

                    if (doSubNodeParse) {

                        subNodeData += line + "\n";
                    }
                }

                if (subNodesData.length > 0) {

                    for (let i = 0; i < subNodesData.length; i++) {


                        const subNode = this.parseNode(subNodesData[i]);


                        nodeObject[subNode.key] = subNode.value;
                    }
                }
            }
        }

        return {
            key: key,
            value: nodeObject
        }
    }

    getNumList(data, list) {

        list = this.cleanStr(list);
        const strOut = this.cleanStr(data, "a:");

        const nums = strOut.split(",");

        nums[0] = nums[0].replace(list, "");

        return nums;
    }

    parseConnections(data) {

        const connections = [];

        const lines = data.split("\n");
        let doParse = false;
        let con = null;
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            if (doParse) {

                doParse = false;

                const t = line.split(",");
                con.from.id = parseInt(t[1]);
                con.to.id = parseInt(t[2]);
                connections.push(con);
            }

            if (line.includes(";")) {

                con = {
                    from: {
                        name: "",
                        id: ""
                    },
                    to: {
                        name: "",
                        id: ""
                    }
                }

                const t = line.replace(";", "").split(",");
                con.from.name = t[0];
                con.to.name = t[1];

                doParse = true;
            }
        }

        return connections;
    }

    getTextureFromConnection(fromid) {

        for (let i = 0; i < this.fbxData.Connections.length; i++) {

            const conn = this.fbxData.Connections[i];
            if (conn.to.id === fromid && conn.from.name.includes("Texture")) {

                return this.fbxData.Objects["Texture_" + conn.from.id].RelativeFilename.replace("/", "");
            }
        }

    }

    getNameFromConnection(id) {

        for (let i = 0; i < this.fbxData.Connections.length; i++) {
            const conn = this.fbxData.Connections[i];
            if (conn.from.id === id && conn.to.name.includes("Model")) {
                return conn.to.name.split("::")[1];
            }
        }
    }

    getNodeKeyPropertyName(prop) {

        const CONSTS = FBXLoader.SpecialNodes;

        const kn = this.cleanStr(prop.split(":")[0]);

        if (
            kn === CONSTS.OBJECT_TYPE ||
            kn === CONSTS.PROP_TEMPLATE ||
            kn === CONSTS.GEOMETRY ||
            kn === CONSTS.NODE_ATTRIBUTE ||
            kn === CONSTS.MODEL ||
            kn === CONSTS.MATERIAL ||
            kn === CONSTS.VIDEO ||
            kn === CONSTS.TEXTURE
        ) {

            let keyOut = this.cleanStr(prop.split(":")[1], '"');
            keyOut = this.cleanStr(keyOut, "{");
            if (keyOut.includes(",")) {

                keyOut = keyOut.split(",")[0];
            }
            return kn + "_" + keyOut;

        } else {
            return null;
        }
    }

    getNodeProperty(prop) {

        let props;
        let key;
        let value;
        const isComplex = prop.includes(",");

        if (isComplex) {

            value = [];
            props = prop.split(",");
            key = this.cleanStr(prop.split(":")[0]);

            for (let i = 0; i < props.length; i++) {
                let p = props[i];
                p = p.replace(key + ":", "");
                p = this.cleanStr(p, '"');
                p = this.cleanStr(p, "{");
                value.push(p);
            }

        } else {
            props = prop.split(":");
            key = this.cleanStr(props[0], '"');
            value = this.cleanStr(props[1], '"')
        }
        return {
            key: key,
            value: value
        }
    }

    cleanStr(str, from) {
        let strOut = str.replace(/\s/g, "");
        if (from) {

            const reg = new RegExp(from, "g");
            strOut = strOut.replace(reg, "");
        }
        return strOut;
    }

    get data() {

        super.data;
    }
}

FBXLoader.SpecialNodes = {
    PROPERTIES70: "Properties70",
    P: "P",
    PROP_TEMPLATE: "PropertyTemplate",
    OBJECT_TYPE: "ObjectType",
    A: "a",
    GEOMETRY: "Geometry",
    MODEL: "Model",
    NODE_ATTRIBUTE: "NodeAttribute",
    MATERIAL: "Material",
    IMPLEMENTATION: "Implementation",
    CONNECTIONS: "Connections",
    VIDEO: "Video",
    TEXTURE: "Texture"
}

export default FBXLoader;