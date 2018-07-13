import Component from "./Component.js";

class Mesh extends Component {

    constructor(meshData) {

        super();

        this.name = meshData.name;
        this.id = meshData.meshID;

        this.vertices = meshData.vertices;
        this.indices = meshData.indices;
        this.uvs = meshData.uvs;
        this.uvsIndices = meshData.uvsIndices;
        this.normals = meshData.normals;
    }
}
Mesh.NAME = "Mesh";

export default Mesh;