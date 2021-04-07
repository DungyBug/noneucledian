export interface FBXModel {
    verticies: number[];
    normals: number[];
    version: number;
};

export class FBXModel {
    constructor() {
        this.verticies = [];
        this.normals = [];
    }

    checkMagic(blob: string) {
        if(blob.slice(0, 21) === "Kaydara FBX Binary  \0") {
            return true;
        }
        return false;
    }

    load(src) {
        fetch(src)
        .then((response) => response.text())
        .then((blob) => {
            if(this.checkMagic(blob)) {
                this.version = Number(BigInt(blob[23].charCodeAt(0)) << BigInt(32) + BigInt(blob[24].charCodeAt(0)) << BigInt(16) + BigInt(blob[25].charCodeAt(0)) << BigInt(8) + BigInt(blob[26].charCodeAt(0))) / 1000;
                 
            } else {
                console.error("Couldn't load FBX: Invalid magic.");
            }
        });
    }
}