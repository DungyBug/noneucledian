/**
 * All missile classes defined there.
 * 
 * Rocket
 * Bullet
 * Rail
 */

import { State } from "../global";
import { Missile } from "./ug_weapon";
import { checkPointForCollisions } from "../physics";
import { SOUND } from "../audio";
import { damageByRadius } from "./ug_health";
import * as BABYLON from 'babylonjs';
import { Coordinate } from "./ub_coordinate";
import { refractionMaterial } from "../effects";
import { CONFIG } from "../config";

let rocketModel: any;
export const TR_LINEAR  = 0;
export const TR_GRAVITY = 1;
export const TR_WAVE    = 2;

setTimeout(() => {
    State.ultra3.loadModel("/Models/Missiles/", "rocket_d.babylon", (scene: any) => {
        rocketModel = State.ultra3.scene.meshes[scene + 1];
    }, false, false);
}, 10);

function explodeBorder(borderSphere: any, light: any, radius: number, step: number) {
    if(State.ultra3.run) {
        borderSphere._scaling.x = radius;
        borderSphere._scaling.y = radius;
        borderSphere._scaling.z = radius;
        borderSphere.visibility = 2 - radius / 2;
        light.intensity = Math.max(0, 2000 - radius * 800);
        light.radius = 200;
    } else {
        requestAnimationFrame(() => explodeBorder(borderSphere, light, radius, step));
        return;
    }

    if(radius < 5.0) {
        requestAnimationFrame(() => explodeBorder(borderSphere, light, radius + step, step));
    } else {
        borderSphere.dispose();
        light.dispose();
    }
}

export interface Rocket {
    viewing: boolean;
    teleporter: boolean;
    model: BABYLON.Mesh;
    light: BABYLON.Light;
    direction: Coordinate;
    coords: Coordinate;
    gravity: Coordinate;
}

export class Rocket extends Missile {

    create(onload: Function) {
        this.speed = 3;
        this.viewing = false;
        this.teleporter = false;
        this.model = rocketModel.clone();
        State.ultra3.on("framestart", () => this.frame());
        this.light = State.ultra3.scene.lights[State.ultra3.scene.lights.length - 1];
        this.model.position = new BABYLON.Vector3(this.coords.x, this.coords.y, this.coords.z);
        this.gravity = {
            x: 0,
            y: 0,
            z: 0
        }
        onload();
    }

    frame() {

        if(!this.model) {
            return;
        }

        try {
            let gravitate;
            for(let i = 0; i < State.planetsArray.length; i++) {
                gravitate = State.planetsArray[i].calculateGravityForce(this.coords.x, this.coords.y, this.coords.z);
                this.gravity.x += gravitate.x;
                this.gravity.y += gravitate.y;
                this.gravity.z += gravitate.z;
            }

            this.coords.x += this.gravity.x;
            this.coords.y += this.gravity.y;
            this.coords.z += this.gravity.z;

            this.model.position = new BABYLON.Vector3(this.coords.x, this.coords.y, this.coords.z);

            // if (this.fired) {
            //     for (let j = 0; j < this.speed * 10; j++) { // Check speed more accurate
    
            //         for (let i = 0; i < State.ultra3.scene.meshes.length; i++) {
    
            //                 if (this.model.intersectsMesh(State.ultra3.scene.meshes[i],true)) {
    
            //                     this.fired = false; // Stop rocket
    
            //                     damage(State.ultra3.scene.meshes[i], 90);
            //                     damageByRadius(30, 4, this.coords);
            //                     break;
            //                 }
            //         }
    
            //         if (this.fired) { // if rocket still flying
            //             this.coords.x += this.direction.x * 0.1;
            //             this.coords.y += this.direction.y * 0.1;
            //             this.coords.z += this.direction.z * 0.1;
            //             this.model.position.x = this.coords.x;
            //             this.model.position.y = this.coords.y;
            //             this.model.position.z = this.coords.z;
            //         } else {
            //             break;
            //         }
            //     }
            // }
    
            if (this.fired) {

                if (checkPointForCollisions(this.coords, this.direction, this.speed).hit) { // this.model.intersectsMesh(State.ultra3.scene.meshes[i],true)
    

                    this.fired = false; // Stop rocket
                    // if(keys[70]) {
                    //     SOUND.EXPLOSION.setPosition(new BABYLON.Vector3(this.coords.x, this.coords.y, this.coords.z));
                    //     SOUND.EXPLOSION.play();
                    //     const exp = new BABYLON.Sprite("", new BABYLON.SpriteManager("", "http://192.168.0.21/Media/exp.png", 1, 64, State.ultra3.scene)); 
                    //     exp.cellIndex = 1;
                    //     exp.size = 5;
                    //     exp.position = this.model.position.clone();
                    //     exp.playAnimation(1, 25, false, 40, function() {});
                    //     this.model.dispose();
                    //     return;
                    // }
                    let explosionBorder = BABYLON.MeshBuilder.CreateSphere("torus", {diameter: 3, segments: 48});
                    explosionBorder.material = refractionMaterial;
                    explosionBorder.position = this.model.position.clone();
                    explosionBorder.isPickable = false;
                    let light = new BABYLON.PointLight("", this.model.position.clone(), State.ultra3.scene);
                    light.diffuse.g = 0.5;
                    light.diffuse.b = 0;
                    explodeBorder( explosionBorder, light, 0, 0.4 );

                    damageByRadius(30, 0.5, this.coords);
                    damageByRadius(10, 5, this.coords);
    
                    const vector = new BABYLON.Vector3(this.coords.x, this.coords.y, this.coords.z);
                    if(SOUND) {
                        SOUND.EXPLOSION.setPosition(vector);
                        SOUND.EXPLOSION.play();
                    }
                    // const exp = new BABYLON.Sprite("", new BABYLON.SpriteManager("", "/Media/exp.png", 1, 64, State.ultra3.scene)); 
                    // exp.cellIndex = 1;
                    // exp.size = 5;
                    // exp.position = this.model.position.clone();
                    // exp.playAnimation(1, 25, false, 40, function() {});
                    if(this.teleporter) {
                        State.ultra3.camera.position = new BABYLON.Vector3(this.coords.x, this.coords.y, this.coords.z);
                        this.model.dispose();
                        
                        State.shaderMaterial.setVector3("cameraPosition", State.ultra3.camera.position);
                    }
                    this.model.dispose();
                    State.ultra3.off("framestart", () => this.frame());
    
                }
    
                if (this.fired) { // if rocket still flying
                    this.coords.x += this.direction.x * this.speed;
                    this.coords.y += this.direction.y * this.speed;
                    this.coords.z += this.direction.z * this.speed;
                    if(this.viewing) {
                        State.ultra3.camera2.position.x = this.coords.x;
                        State.ultra3.camera2.position.y = this.coords.y;
                        State.ultra3.camera2.position.z = this.coords.z;
                    }

                    if(this.trajectory === TR_GRAVITY) {
                        this.direction.y -= CONFIG.MAP.GRAVITY;
                    }

                    this.model.position = new BABYLON.Vector3(this.coords.x, this.coords.y, this.coords.z);
                }
            }
        } catch(e) {
            console.error(e);
            throw new Error(e);
        }
    }

    fire(direction) {
        this.direction = new BABYLON.Vector3(direction.x, direction.y, direction.z);

        // this.speed = 0.1; // Units per frame
        this.fired = true;
    }

}