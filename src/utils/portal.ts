import { State } from "../global";

export interface Portal {
    portal1Pos: any;
    portal2Pos: any;
    plane1: any;
    plane2: any;
    renderTarget1: any;
    renderTarget2: any;
    portalMaterial: any;
    camera1: any;
    camera2: any;
};

/*
_x: 230.5668593315476, _y: -7.523848164306469, _z: 110.72459768491176
_x: 209.26746661925307, _y: -5.541869086430066, _z: 99.99341088719707
*/

export let portalsArray = [];

export class Portal implements Portal {
    portal1Pos: any;
    portal2Pos: any;
    plane1: any;
    plane2: any;
    renderTarget1: any;
    renderTarget2: any;
    portalMaterial1: any;
    portalMaterial2: any;
    camera1: any;
    camera2: any;

    constructor(portal1Coord: Array<number>, portal1: any, portal2Coord: Array<number>, portal2: any) {
        this.portalMaterial1 = new BABYLON.ShaderMaterial("shader", State.ultra3.scene, {
            vertex: "portal",
            fragment: "portal",
        },
        {
            attributes: ["position", "normal", "uv"],
            uniforms: ["world", "worldView", "worldViewProjection", "view", "projection"]
        });
        this.portalMaterial2 = new BABYLON.ShaderMaterial("shader", State.ultra3.scene, {
            vertex: "portal",
            fragment: "portal",
        },
        {
            attributes: ["position", "normal", "uv"],
            uniforms: ["world", "worldView", "worldViewProjection", "view", "projection"]
        });

        // this.portalMaterial1 = new BABYLON.StandardMaterial("", State.ultra3.scene);
        // this.portalMaterial2 = new BABYLON.StandardMaterial("", State.ultra3.scene);

        this.renderTarget1 = new BABYLON.RenderTargetTexture("portal1", 512, State.ultra3.scene);
        this.renderTarget2 = new BABYLON.RenderTargetTexture("portal2", 512, State.ultra3.scene);
        State.ultra3.scene.customRenderTargets.push(this.renderTarget1);
        State.ultra3.scene.customRenderTargets.push(this.renderTarget2);

        this.camera1 = new BABYLON.UniversalCamera("", BABYLON.Vector3.Zero(), State.ultra3.scene);
        this.camera2 = new BABYLON.UniversalCamera("", BABYLON.Vector3.Zero(), State.ultra3.scene);

        this.camera1.position.x = portal1Coord[0];
        this.camera1.position.y = portal1Coord[1];
        this.camera1.position.z = portal1Coord[2];
        this.camera2.position.x = portal2Coord[0];
        this.camera2.position.y = portal2Coord[1];
        this.camera2.position.z = portal2Coord[2];
        this.camera1.fov = 45;
        this.camera2.fov = 45;

        this.renderTarget1.activeCamera = this.camera1;
        this.renderTarget2.activeCamera = this.camera2;

        this.renderTarget1.renderList = State.ultra3.scene.meshes;
        this.renderTarget2.renderList = State.ultra3.scene.meshes;

        this.portalMaterial1.setTexture("textureSampler", this.renderTarget1);
        this.portalMaterial2.setTexture("textureSampler", this.renderTarget2);
        this.portal1Pos = {
            x: 0,
            y: 0,
            z: 0
        };
        this.portal2Pos = {
            x: 0,
            y: 0,
            z: 0
        };
        this.portal1Pos.x = portal1Coord[0];
        this.portal1Pos.y = portal1Coord[1];
        this.portal1Pos.z = portal1Coord[2];
        this.portal2Pos.x = portal2Coord[0];
        this.portal2Pos.y = portal2Coord[1];
        this.portal2Pos.z = portal2Coord[2];
        this.plane1 = BABYLON.Mesh.CreatePlane("", 1, State.ultra3.scene);
        this.plane1.scaling.x = portal1.sizeX;
        this.plane1.scaling.y = portal1.sizeY;
        this.plane1.rotation.x = portal1.rotation.x;
        this.plane1.rotation.y = portal1.rotation.y;
        this.plane1.rotation.z = portal1.rotation.z;
        this.plane1.position.x = this.portal1Pos.x;
        this.plane1.position.y = this.portal1Pos.y;
        this.plane1.position.z = this.portal1Pos.z;
        this.plane2 = BABYLON.Mesh.CreatePlane("", 1, State.ultra3.scene);
        this.plane2.scaling.x = portal2.sizeX;
        this.plane2.scaling.y = portal2.sizeY;
        this.plane2.rotation.x = portal2.rotation.x;
        this.plane2.rotation.y = portal2.rotation.y;
        this.plane2.rotation.z = portal2.rotation.z;
        this.plane2.position.x = this.portal2Pos.x;
        this.plane2.position.y = this.portal2Pos.y;
        this.plane2.position.z = this.portal2Pos.z;
        this.plane1.material = this.portalMaterial1;
        this.plane2.material = this.portalMaterial2;
        portalsArray.push(this);
    }

    calculate() {
        this.camera1.rotation = State.ultra3.camera.rotation.clone();
        this.camera2.rotation = State.ultra3.camera.rotation.clone();
        this.camera1.position.x = this.plane2.position.x;
        this.camera1.position.y = this.plane2.position.y;
        this.camera1.position.z = this.plane2.position.z;
        this.camera2.position.x = this.plane1.position.x;
        this.camera2.position.y = this.plane1.position.y;
        this.camera2.position.z = this.plane1.position.z;

        if((State.ultra3.camera.position.x - this.plane1.position.x) ** 2 + (State.ultra3.camera.position.y - this.plane1.position.y) ** 2 + (State.ultra3.camera.position.z - this.plane1.position.z) ** 2 < 16) {
            State.ultra3.camera.position = this.plane2.position.clone();
            let direction = State.ultra3.getCameraDirection();
            State.ultra3.camera.position.x += direction.x * 5;
            State.ultra3.camera.position.y += direction.y * 5;
            State.ultra3.camera.position.z += direction.z * 5;
        }
        
        if((State.ultra3.camera.position.x - this.plane2.position.x) ** 2 + (State.ultra3.camera.position.y - this.plane2.position.y) ** 2 + (State.ultra3.camera.position.z - this.plane2.position.z) ** 2 < 16) {
            State.ultra3.camera.position = this.plane1.position.clone();
            let direction = State.ultra3.getCameraDirection();
            State.ultra3.camera.position.x += direction.x * 5;
            State.ultra3.camera.position.y += direction.y * 5;
            State.ultra3.camera.position.z += direction.z * 5;
        }
    }
}