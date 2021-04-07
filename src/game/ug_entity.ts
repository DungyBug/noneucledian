import { Coordinate } from "./ub_coordinate";

export interface IEntity {
    coords: Coordinate;
    rotation: Coordinate;
    health: number;
    meshes: Array<any>;
}

export class Entity implements IEntity {
    coords: Coordinate;
    health: number;
    meshes: Array<any>;
    rotation: Coordinate;

    constructor(health) {
        this.coords = {
            x: 0,
            y: 0,
            z: 0
        };

        this.health = health;
        this.meshes = [];
    }

    linkMesh(mesh) {
        this.meshes.push(mesh);
        mesh.entity = this;
        this.coords.x = mesh.position.x;
        this.coords.y = mesh.position.y;
        this.coords.z = mesh.position.z;
        this.rotation.x = mesh.rotation.x;
        this.rotation.y = mesh.rotation.y;
        this.rotation.z = mesh.rotation.z;
    }

    onDamaged() {
        
    } // nothing
}