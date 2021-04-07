/**
This engine is a "pack" of two engines

It's a Babylon.JS and Ammo.JS with own tools
It may support Oimo.JS in future versions

Ultra3 v.0.1 Alpha
*/

import { EventEmitter } from "./services/eventemitter";
import * as BABYLON from "babylonjs";
import "babylonjs-loaders";
import { tonemapPixelShader } from "babylonjs/Shaders/tonemap.fragment";

export interface Options {
    mass?: number;
    restituion?: number;
    size?: number;
    width?: number;
    height?: number;
    depth?: number;
    segments?: number;
    diameter?: number;
    diameterX?: number;
    diameterY?: number;
    diameterZ?: number;
    arc?: number;
    slice?: number;
    sideOrientation?: number;
    frontUVs?: BABYLON.Vector4;
    backUVs?: BABYLON.Vector4;
    updatable?: boolean;
}

export interface Ultra3 {
    engine: BABYLON.Engine;
    scene: any;
    canvas: HTMLCanvasElement;
    camera: BABYLON.FreeCamera;
    camera2: BABYLON.FreeCamera;
    meshes: Array<any>;
    lights: Array<any>;
    shadowsGens: Array<BABYLON.ShadowGenerator>;
    physicModels: Array<any>;
    savedFrames: Array<any>;
    frame: number;
    isLocked: boolean;
    paused: boolean;
    savePaused: boolean;
    run: boolean;
    glGPU_Vendor: string;
    glGPU_Renderer: string;
}

export class Ultra3 extends EventEmitter {
    constructor(canvas: HTMLCanvasElement, secondview: boolean) {
        super();
        this.engine = new BABYLON.Engine(canvas, true);
        this.scene = new BABYLON.Scene(this.engine);
        BABYLON.SceneLoader.ShowLoadingScreen = false;
        this.canvas = canvas;
        this.camera = new BABYLON.FreeCamera("MainCamera", new BABYLON.Vector3(0, 0, 0), this.scene);
        if(secondview) {
            this.camera2 = new BABYLON.FreeCamera("SecondCamera", new BABYLON.Vector3(0, 0, 0), this.scene);
            this.camera.viewport = new BABYLON.Viewport(0, 0, 1, 1);
            this.camera2.viewport = new BABYLON.Viewport(0, 0.8, 0.2, 0.2);
            this.scene.activeCameras = [this.camera, this.camera2];
        }
        this.camera.inertia = 0;
        this.camera.minZ = 1;
        this.camera.maxZ = 10000;
        this.camera.keysDown = [];
        this.camera.keysUp = [];
        this.camera.keysLeft = [];
        this.camera.keysRight = [];
        this.meshes = [];
        this.lights = [];
        this.shadowsGens = [];
        this.physicModels = [];
        this.savedFrames = [];
        this.frame = 0;
        this.isLocked = false;
        this.paused = false;
        this.savePaused = true;
        this.run = true;
        let debugRenderInfo = this.engine._gl.getExtension("WEBGL_debug_renderer_info");
        this.glGPU_Vendor = this.engine._gl.getParameter(debugRenderInfo.UNMASKED_VENDOR_WEBGL);
        this.glGPU_Renderer = this.engine._gl.getParameter(debugRenderInfo.UNMASKED_RENDERER_WEBGL);
    }

    get BabylonScene() {
        return this.scene;
    }

    get BabylonCamera() {
        return this.camera;
    }

    get Canvas() {
        return this.canvas;
    }

    // getCameraDirection
    /**
     * Obviosly, returns camera direction
     */
    getCameraDirection() {
        return BABYLON.Ray.CreateNewFromTo(this.camera.position, this.camera.getTarget()).direction;
    }

    /**
     * enablePointerLock
     * 
     * enables ability to pointer lock 
     */
    enalbePointerLock() {
        this.scene.onPointerDown = () => {
		
            //true/false check if we're locked, faster than checking pointerlock on each single click.
            if (!this.isLocked) {
                this.canvas.requestPointerLock = this.canvas.requestPointerLock || null;
                if (this.canvas.requestPointerLock) {
                    this.canvas.requestPointerLock();
                }
            }

        };

        // Attach events to the document
        document.addEventListener("pointerlockchange", () => {
            var controlEnabled = document.pointerLockElement || null;
            
            // If the user is already locked
            if (!controlEnabled) {
                this.camera.detachControl(this.canvas);
                this.isLocked = false;
            } else {
                this.camera.attachControl(this.canvas);
                this.isLocked = true;
            }
        }, false);
    }

    Vec3(x: number, y: number, z: number) {
        return new BABYLON.Vector3(x, y, z);
    }
    
    /**
     * initPhysics
     * 
     * Inits and starts physics simulation
     * Note: All objects, that have been added before, already have physic model and ready to start physics.
     */

    initPhysics() {
        // let gravityVector = new BABYLON.Vector3(0, -9.80665, 0);
        // let physicsPlugin = new BABYLON.AmmoJSPlugin();
        // this.scene.enablePhysics(gravityVector, physicsPlugin);
        // this.scene.collisionsEnabled = true;
        // let index = this.createBox({
        //     size: 0.5,
        //     mass: 0
        // }, new BABYLON.Vector3(0, 0.2, 0));
        // this.meshes[this.meshes.length - 1].visibility = 0;
    }

    setCameraPos(pos: BABYLON.Vector3) {
        this.camera.position = pos;
    }

    // Create Light
    /**
     * 
     * @param {*} LightType Type of light. The type defines by setting "link" to the class, example: BABYLON.HemisphericLight
     * @param {*} pos  Position of light. Defines by two ways: new BABYLON.Vector3(x, y, z) or Ultra3.Vec3(x, y, z)
     */

    createLight(LightType: any, pos: BABYLON.Vector3, intensity = 1) {
        this.lights[this.lights.length] = new LightType("", pos, this.scene);
        this.shadowsGens[this.shadowsGens.length] = new BABYLON.ShadowGenerator(2048, this.lights[this.lights.length - 1]);
        for(let i = 0; i < this.meshes.length; i++) {
            this.shadowsGens[this.shadowsGens.length - 1].getShadowMap().renderList.push(this.meshes[i]);
        }
        this.lights[this.lights.length - 1].intensity = intensity;
        return this.lights.length - 1;
    }

    // Create Box
    /**
     * 
     * @param {*} options Options of cube. This options is the same as Babylon ( so, it's obviously ).
     * See https://doc.babylonjs.com/divingDeeper/mesh/creation/set/box
     * 
     */
    createBox(options: Options, pos: BABYLON.Vector3, calcPhysics = true) {
        this.meshes[this.meshes.length] = BABYLON.MeshBuilder.CreateBox("", options, this.scene);
        this.meshes[this.meshes.length - 1].position = pos;
        this.meshes[this.meshes.length - 1].checkCollisions = true;
        this.meshes[this.meshes.length - 1].receiveShadows = true;
        this.meshes[this.meshes.length - 1].isPickable = calcPhysics;

        for(let i = 0; i < this.shadowsGens.length; i++) {
            this.shadowsGens[i].getShadowMap().renderList.push(this.meshes[this.meshes.length - 1]);
        }
        new BABYLON.PhysicsImpostor(this.meshes[this.meshes.length - 1], BABYLON.PhysicsImpostor.BoxImpostor, { mass: options.mass || 0, restitution: options.restituion || 0.2 }, this.scene);
        return this.meshes.length - 1;
    }

    // Create Sphere
    /**
     * 
     * @param {*} options Options of sphere. This options is the same as Babylon ( so, it's obviously ).
     * See https://doc.babylonjs.com/divingDeeper/mesh/creation/set/sphere
     * 
     */
    createSphere(options: Options, pos: BABYLON.Vector3, calcPhysics = true) {
        this.meshes[this.meshes.length] = BABYLON.MeshBuilder.CreateSphere("", options, this.scene);
        this.meshes[this.meshes.length - 1].position = pos;
        this.meshes[this.meshes.length - 1].checkCollisions = true;
        this.meshes[this.meshes.length - 1].receiveShadows = true;
        this.meshes[this.meshes.length - 1].isPickable = calcPhysics;

        for(let i = 0; i < this.shadowsGens.length; i++) {
            this.shadowsGens[i].getShadowMap().renderList.push(this.meshes[this.meshes.length - 1]);
        }
        new BABYLON.PhysicsImpostor(this.meshes[this.meshes.length - 1], BABYLON.PhysicsImpostor.BoxImpostor, { mass: options.mass || 0, restitution: options.restituion || 0.2 }, this.scene);
        return this.meshes.length - 1;
    }

    // Load Model
    /**
     * 
     * @param {*} src Path to file ( example: "./", "/assets" )
     * @param {*} filename Name of file ( example: "duck.glb" )
     * @param {function} callback callback when mesh loaded
     * @param {boolean} canSaved can mesh be saved when saving frame ( set false if it level model )
     * @param {boolean} calcPhysics calc physics or not ( you can use it to define collision model )
     * @param {number} numberOfMaterials number of materials, used in model. Model divides by materials and every material is a separate mesh.
     */
    loadModel(src: string, filename: string, callback: Function, canSaved = true, calcPhysics = true, numberOfMaterials = 1) {

        BABYLON.SceneLoader.Append(src, filename, this.scene, () => {

            for (let i = 0; i < numberOfMaterials; i++) {
                this.meshes[this.meshes.length] = this.scene.meshes[this.scene.meshes.length - i - 1];
                this.meshes[this.meshes.length - 1].canSaved = canSaved;
                this.meshes[this.meshes.length - 1].calcPhysics = calcPhysics;
                this.meshes[this.meshes.length - 1].isPickable = calcPhysics;
            }
            for (let i = 0; i < this.shadowsGens.length; i++) {
                this.shadowsGens[i].getShadowMap().renderList.push(this.scene.meshes[this.scene.meshes.length - 3]);
                this.shadowsGens[i].getShadowMap().renderList.push(this.scene.meshes[this.scene.meshes.length - 1]);
            }
            
            try {
                callback(this.scene.meshes.length - numberOfMaterials - 1);
            } catch(e) {
                console.error(e);
            }
        });
    }

    setMeshPosition(index: number, pos: BABYLON.Vector3) {
        this.meshes[index].position = pos;
    }

    addMeshPosition(index: number, pos: BABYLON.Vector3) {
        this.meshes[index].position.x += pos.x;
        this.meshes[index].position.y += pos.y;
        this.meshes[index].position.z += pos.z;
    }

    setMeshRotation(index: number, rot: BABYLON.Vector3) {
        this.meshes[index].rotation = rot;
    }

    addMeshRotation(index: number, rot: BABYLON.Vector3) {
        this.meshes[index].rotation.x += rot.x;
        this.meshes[index].rotation.y += rot.y;
        this.meshes[index].rotation.z += rot.z;
    }

    freeze() {
        if(this.run) {
            this.run = false;
        } else {
            this.run = true;
        }
    }

    runRenderLoop(callback: Function) {
        this.engine.runRenderLoop(() => {
            if(this.paused) {
                return;
            }
            this.frame++;
            if(this.run) {
                this.emit("framestart");
            }
            callback(this.frame);
            this.scene.render();
        });
    }


    // Debuging tools

    /**
     * saveFrame
     * 
     * Copy all meshes from current frame to buffer
     * Note: do not use it many times, 'cause it can eat memory for gigabytes.
     */

    saveFrame() {
        let l = this.savedFrames.length;

        this.savedFrames[l] = {
            frame: this.frame,
            camera: {
                position: this.camera.position.clone(),
                rotation: this.camera.rotation.clone(),
                quaternion: this.camera.rotationQuaternion.clone()
            },
            meshes: []
        }

        for(let i = 0; i < this.meshes.length; i++) {
            if(this.meshes[i].canSaved) {
                this.savedFrames[l].meshes[i] = this.meshes[i].clone();
            }
        }
    }

    /**
     * restoreFrame
     * 
     * @param {*} index - the index in array or number of save
     * 
     * Restores frame
     * Note: do not use it many times, 'cause it can eat memory for gigabytes.
     */

    restoreFrame(index: number) {
        this.camera.position = this.savedFrames[index].camera.position.clone();
        this.camera.rotation = this.savedFrames[index].camera.rotation.clone();
        this.camera.rotationQuaternion = this.savedFrames[index].camera.quaternion.clone();
        for(let i = 0; i < this.savedFrames[index].meshes.length; i++) {
            this.meshes[i] = this.savedFrames[index].meshes[i].clone();
        }
    }
}