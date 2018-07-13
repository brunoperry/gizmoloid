import TextFileReader from "./TextFileReader.js";
import Resources from "../Resources.js";
import Loader from "./Loader.js";

class OBJLoader extends Loader {

    constructor(data, shadersData) {

        super();

        this.m_positions = [];
        this.m_texCoords = [];
        this.m_normals = [];
        this.m_indices = [];
        this.m_hasTexCoords = false;
        this.m_hasNormals = false;

        this.materials = [];
        this.matURL = null;


        this.modelData = {
            fileData: data,
            shader: shadersData
        }

        if (this.modelData === undefined) {
            throw new Error("No file found: " + fileName);
        }

        this.objData = {}
        this.objData.objects = this.getObjects(data);

        
    }

    getObjects() {

        let meshReader = new TextFileReader(this.modelData.fileData);

        while (meshReader.readLine()) {
            let line = meshReader.getLine();
            let tokens = line.split(" ");
            tokens = this.removeEmptyStrings(tokens);

            if (tokens.length == 0 || tokens[0] === "#")
                continue;

            switch(tokens[0]) {
                case OBJLoader.OBJProperties.MAT_LIB:
                this.matURL = tokens[1];
                break;
                case OBJLoader.OBJProperties.VERTEX:
                this.m_positions.push(vec3.fromValues(
                    parseFloat(tokens[1]),
                    parseFloat(tokens[2]),
                    parseFloat(tokens[3])
                ));
                break;
                case OBJLoader.OBJProperties.UV:
                this.m_texCoords.push(vec2.fromValues(
                    parseFloat(tokens[1]),
                    1.0 - parseFloat(tokens[2]))
                );
                break;
                case OBJLoader.OBJProperties.NORMAL:
                this.m_normals.push(vec3.fromValues(
                    parseFloat(tokens[1]),
                    parseFloat(tokens[2]),
                    parseFloat(tokens[3])
                ));
                break;
                case OBJLoader.OBJProperties.FACE:
                for (let i = 0; i < tokens.length - 3; i++) {
                    this.m_indices.push(this.parseOBJIndex(tokens[1]));
                    this.m_indices.push(this.parseOBJIndex(tokens[2 + i]));
                    this.m_indices.push(this.parseOBJIndex(tokens[3 + i]));
                }
                break;
            }
        }

        const result = new IndexedModel();
        const normalModel = new IndexedModel();
        const resultIndexMap = new Map();
        const normalIndexMap = new Map();
        const indexMap = new Map();

        for (let i = 0; i < this.m_indices.length; i++) {
            const currentIndex = this.m_indices[i];

            const currentPosition = this.m_positions[currentIndex.vIndex];
            let currentTexCoord;
            let currentNormal;

            if (this.m_hasTexCoords)
                currentTexCoord = this.m_texCoords[currentIndex.tCoordIndex];
            else
                currentTexCoord = vec2.fromValues(0,0);

            if (this.m_hasNormals)
                currentNormal = this.m_normals[currentIndex.nIndex];
            else
                currentNormal = vec2.fromValues(0,0,0);
                
            let modelVertexIndex = resultIndexMap.get(currentIndex);

            if (modelVertexIndex === undefined) {
                modelVertexIndex = result.getPositions().length;
                resultIndexMap.set(currentIndex, modelVertexIndex);

                result.getPositions().push(currentPosition);
                result.getTexCoords().push(currentTexCoord);
                if (this.m_hasNormals)
                    result.getNormals().push(currentNormal);
            }

            let normalModelIndex = normalIndexMap[currentIndex.vIndex];

            if (normalModelIndex === undefined) {

                normalModelIndex = normalModel.getPositions().length;
                normalIndexMap.set(currentIndex.vIndex, normalModelIndex);

                normalModel.getPositions().push(currentPosition);
                normalModel.getTexCoords().push(currentTexCoord);
                normalModel.getNormals().push(currentNormal);
                normalModel.getTangents().push(vec3.create());
            }

            indexMap.set(modelVertexIndex, normalModelIndex);
            result.getIndices().push(modelVertexIndex);
            normalModel.getIndices().push(normalModelIndex);
            indexMap.set(modelVertexIndex, normalModelIndex);
        }

        if (!this.m_hasNormals) {

            normalModel.calcNormals();
            for (let i = 0; i < result.getPositions().length; i++)
                result.getNormals().push(normalModel.getNormals()[indexMap[i]]);
        }

        normalModel.calcTangents();
        for (let i = 0; i < result.getPositions().length; i++) {

            const res = normalModel.getTangents()[indexMap.get(i)];

            result.getTangents().push(res);
        }

        return result;
    }

    async build() {


        this.createMeshes(this.objData.objects);
        this.objData.materials = await this.getMaterials();
        await this.createMaterials(this.objData.materials);
        this.createModels(this.getModels([this.objData.objects]));

        return true;
    }

    createMeshes(data) {

        const modelsData = [];
        const model = {
            vertices: [],
            indices: data.m_indices,
            uvs: [],
            normals: [],
            name: "cube",
            meshID: 0
        }

        this.objData.objects.m_positions.forEach(pos => {
            model.vertices.push(pos[0])
            model.vertices.push(pos[1])
            model.vertices.push(pos[2])
        });

        this.objData.objects.m_normals.forEach(norm => {
            model.normals.push(norm[0])
            model.normals.push(norm[1])
            model.normals.push(norm[2])
        });

        this.objData.objects.m_texCoords.forEach(uv => {
            model.uvs.push(uv[0])
            model.uvs.push(uv[1])
        });
        modelsData.push(model);

        super.createMeshes(modelsData);

    }

    getModels(data) {

        const mData = [];
        for (let i = 0; i < data.length; i++) {

            // let m = this.getMatByName(data[i].material)

            mData.push({
                modelID: i,
                mesh: this.getById(this.meshes, 0),
                material: this.materials[0][0]
            })
        }


        return mData;
    }

    parseOBJIndex(token) {
        const values = token.split("/");

        const result = new OBJIndex();
        result.vIndex = parseInt(values[0]) - 1;

        if (values.length > 1) {
            if (!(values[1] === "")) {
                this.m_hasTexCoords = true;
                result.tCoordIndex = parseInt(values[1]) - 1;
            }

            if (values.length > 2) {
                this.m_hasNormals = true;
                result.nIndex = parseInt(values[2]) - 1;
            }
        }

        return result;
    }

    removeEmptyStrings(data) {
        const result = [];
        for (let i = 0; i < data.length; i++)
            if (!(data[i] === ""))
                result.push(data[i]);
        return result;
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

                    case OBJLoader.OBJProperties.NEW_MAT:
                        ind++;
                        mData.push({
                            materialID: ind,
                            name: line[1]
                        });
                        mData[ind].shaders = this.modelData.shader;
                    break;
                    case OBJLoader.OBJProperties.ILLUM:
                    break;
                    case OBJLoader.OBJProperties.KD:
                    break;
                    case OBJLoader.OBJProperties.KA:
                    break;
                    case OBJLoader.OBJProperties.TF:
                    break;
                    case OBJLoader.OBJProperties.MAP_KD:
                        mData[ind].texture = line[1];
                        break;
                    case OBJLoader.OBJProperties.NI:
                    break;
                }
            }
            return mData;

        })
    }
}

OBJLoader.OBJProperties = {
    MAT_LIB: "mtllib",
    VERTEX: "v",
    UV: "vt",
    NORMAL: "vn",
    FACE: "f",
    SMOOTH: "s",
    GROUP: "g",
    MAT: "usemtl",
    NEW_MAT: "newmtl",
    ILLUM: "illum",
    KD: "Kd",
    KA: "KA",
    TF: "Tf",
    MAP_KD: "map_Kd",
    NI: "Ni",

}

export default OBJLoader;

class OBJIndex {
    // private vIndex: number;
    // private tCoordIndex: number;
    // private nIndex: number;

    constructor() {
        this.vIndex = -1;
        this.tCoordIndex = -1;
        this.nIndex = -1;
    }

    equals(obj) {
        return this.vIndex == obj.vIndex
            && this.tCoordIndex == obj.tCoordIndex
            && this.nIndex == obj.nIndex;
    }
    hashCode() {
        const BASE = 17;
        const MULTIPLIER = 31;

        let result = BASE;

        result = MULTIPLIER * result + this.vIndex;
        result = MULTIPLIER * result + this.tCoordIndex;
        result = MULTIPLIER * result + this.nIndex;

        return result;
    }
}

class IndexedModel {

    // private m_positions: Array<Vector3f>;
    // private m_texCoords: Array<Vector2f>;
    // private m_normals: Array<Vector3f>;
    // private m_tangents: Array<Vector3f>;
    // private m_indices: Array<number>;

    constructor() {
        this.m_positions = [];
        this.m_texCoords = [];
        this.m_normals = [];
        this.m_tangents = [];
        this.m_indices = [];
    }

    calcNormals() {
        for (let i = 0; i < this.m_indices.length; i += 3) {
            const i0 = this.m_indices[i];
            const i1 = this.m_indices[i + 1];
            const i2 = this.m_indices[i + 2];

            const v1 = this.m_positions[i1].subVec(this.m_positions[i0]);
            const v2 = this.m_positions[i2].subVec(this.m_positions[i0]);

            const normal = v1.cross(v2).normalized();

            this.m_normals[i0].setVec(this.m_normals[i0].addVec(normal));
            this.m_normals[i1].setVec(this.m_normals[i1].addVec(normal));
            this.m_normals[i2].setVec(this.m_normals[i2].addVec(normal));
        }

        for (let i = 0; i < this.m_normals.length; i++)
            this.m_normals[i].setVec(this.m_normals[i].normalized());
    }

    calcTangents() {
        for (let i = 0; i < this.m_indices.length; i += 3) {
            const i0 = this.m_indices[i];
            const i1 = this.m_indices[i + 1];
            const i2 = this.m_indices[i + 2];

            const edge1 = vec3.create();
            vec3.subtract(edge1, this.m_positions[i1], this.m_positions[i0]);
            const edge2 = vec3.create();
            vec3.subtract(edge2, this.m_positions[i2], this.m_positions[i0]);

            // const edge1 = this.m_positions[i1].subVec(this.m_positions[i0]);
            // const edge2 = this.m_positions[i2].subVec(this.m_positions[i0]);

            const deltaU1 = this.m_texCoords[i1][0] - this.m_texCoords[i0][0];
            const deltaV1 = this.m_texCoords[i1][1] - this.m_texCoords[i0][1];
            const deltaU2 = this.m_texCoords[i2][0] - this.m_texCoords[i0][0];
            const deltaV2 = this.m_texCoords[i2][1] - this.m_texCoords[i0][1];



            const dividend = (deltaU1 * deltaV2 - deltaU2 * deltaV1);
            //TODO: The first 0.0f may need to be changed to 1.0f here.
            const f = dividend == 0 ? 0.0 : 1.0 / dividend;

            const tangent = vec3.create();
            tangent[0] = f * (deltaV2 * edge1[0] - deltaV1 * edge2[0]);
            tangent[1] = f * (deltaV2 * edge1[1] - deltaV1 * edge2[1]);
            tangent[2] = f * (deltaV2 * edge1[2] - deltaV1 * edge2[2]);


            // tangent.SetX(f * (deltaV2 * edge1[0] - deltaV1 * edge2[0]));
            // tangent.SetY(f * (deltaV2 * edge1[1] - deltaV1 * edge2[1]));
            // tangent.SetZ(f * (deltaV2 * edge1[2] - deltaV1 * edge2[2]));

            vec3.add(this.m_tangents[i0], this.m_tangents[i0], tangent);
            vec3.add(this.m_tangents[i1], this.m_tangents[i1], tangent);
            vec3.add(this.m_tangents[i2], this.m_tangents[i2], tangent);
            // this.m_tangents[i0].setVec(this.m_tangents[i0].addVec(tangent));
            // this.m_tangents[i1].setVec(this.m_tangents[i1].addVec(tangent));
            // this.m_tangents[i2].setVec(this.m_tangents[i2].addVec(tangent));
        }

        for (let i = 0; i < this.m_tangents.length; i++)


            vec3.normalize(this.m_tangents[i], this.m_tangents[i]);
            // this.m_tangents[i].setVec(this.m_tangents[i].normalized());
    }

    addPosition(pos) { this.m_positions.push(pos); }
    addTexCoords(texCoord) { this.m_texCoords.push(texCoord); }
    addNormals(normal) { this.m_normals.push(normal); }
    addTangents(tan) { this.m_tangents.push(tan); }
    addIndices(index) { this.m_indices.push(index); }

    getPositions() { return this.m_positions; }
    getTexCoords() { return this.m_texCoords; }
    getNormals() { return this.m_normals; }
    getTangents() { return this.m_tangents; }
    getIndices() { return this.m_indices; }
}



