import { player } from "./player";
import { CONFIG } from "./config";
import { Ultra3 } from "./ultra3";
import { Rocket, TR_LINEAR } from "./game/ug_missile";
import { Vector } from "./vector";
import { drawNoise } from "./noise";
import { SOUND } from "./audio";
import { Entity } from "./game/ug_entity";
import { checkCameraForCollisions, calcGravity, movePlayer } from "./physics";
import * as BABYLON from "babylonjs";
import State from "./global";
import "./utils/bind";
import { ShaderMaterial } from "babylonjs";
import { isCompatible } from "./videocards";
import { Portal, portalsArray } from "./utils/portal";
import { Planet } from "./utils/planet";
const canvas: HTMLCanvasElement = document.getElementById("canvas") as HTMLCanvasElement;
State.ultra3 = new Ultra3(canvas, true);
let health = document.getElementById("health");
let fps = document.getElementById("fps");
let entity;
State.ultra3.initPhysics();
if(!isCompatible(State.ultra3.glGPU_Renderer)) {
    alert("К сожалению, ваша карта не поддерживается. Сообщите название карты в тех. поддержку: " + State.ultra3.glGPU_Renderer);
}
let isMouseDown = false;
let playingFrames = false;
let frameIndex = 0;
let binds = Array<Function>();
let deaths = 0;
let noclip = false;
let deviation = new BABYLON.Vector3(0, 0, 0);
let jumpSpeedMultiply = 1;

fetch("/Media/chain_shot.mp3")
    .then((response) => response.blob())
    .then((blob) => {
        var reader = new FileReader();
        reader.onload = function() { 
            CONFIG.WEAPONS.CHAINGUN.SHOT_SOUND = this.result;
        }
        reader.readAsDataURL(blob);
    });

State.ultra3.setCameraPos(State.ultra3.Vec3(0, 1, 0));
// let volumeLight = new BABYLON.VolumetricLightScatteringPostProcess('godrays', 5.0, State.ultra3.camera, null, 50, BABYLON.Texture.BILINEAR_SAMPLINGMODE, State.ultra3.engine, false);
// volumeLight.mesh.position = new BABYLON.Vector3(3, 12, -3);
// volumeLight.mesh.scaling = new BABYLON.Vector3(20, 7, 20);
// volumeLight.mesh.rotation = new BABYLON.Vector3(0, 0, 0);
State.ultra3.createLight(BABYLON.PointLight, new BABYLON.Vector3(0.326724, 6.62855, 0), 10)

State.ultra3.scene.onPointerObservable.add((pointerInfo: any) => {
    if(pointerInfo.type === 4) {
        deviation.x += pointerInfo.event.movementX * Math.PI / 180 / CONFIG.DEVIATION_SENSIVITY;
        deviation.y += pointerInfo.event.movementY * Math.PI / 180 / CONFIG.DEVIATION_SENSIVITY;
    }
});

function bind(keyCode: number, callback: Function) {
    binds[keyCode] = callback;
}

State.ultra3.runRenderLoop((frame: number) => {
    State.shaderMaterial.setFloat("time", frame / 10);
    if(frame % 6 === 0 && !State.ultra3.savePaused) {
        State.ultra3.saveFrame();
        console.log(frame / 10);
    } else if(playingFrames && State.ultra3.savePaused) {
        if(frame % 6 === 0) {
            State.ultra3.restoreFrame(frameIndex);
            if(frameIndex < State.ultra3.savedFrames.length) {
                frameIndex++;
            }
        }
    }

    if(player.dead) {
        return;
    }

    let direction = State.ultra3.getCameraDirection();
    // volumeLight.mesh.rotation = new BABYLON.Vector3(0, 0, 0);
    let angle = Math.atan2(direction.x, direction.z) / Math.PI * 180;
    if(CONFIG.WEAPONS.NEAR_COF < 3) {
        CONFIG.WEAPONS.NEAR_COF += 0.2;
    }

    if(isMouseDown && Number(new Date()) - State.lastShot >= CONFIG.WEAPONS.CHAINGUN.MIN_TIME_TO_SHOT) {
        new Audio(CONFIG.WEAPONS.CHAINGUN.SHOT_SOUND).play();
        State.lastShot = Number(new Date());
        CONFIG.WEAPONS.NEAR_COF -= 1;
        try {
            let rocket = new Rocket(null, {
                x: State.ultra3.camera.position.clone().x + direction.x * 2,
                y: State.ultra3.camera.position.clone().y + direction.y * 2,
                z: State.ultra3.camera.position.clone().z + direction.z * 2
            }, TR_LINEAR);
            rocket.create(() => {
                rocket.model.rotation = State.ultra3.camera.rotation.clone();
                rocket.model.addRotation(90 * Math.PI / 180, 0, 0);
                let rand = 1;

                for(let i = 0; i < CONFIG.WEAPONS.CHAINGUN.ACCURACY_SAMPLES; i++) {
                    rand *= Math.random();
                }

                rocket.speed *= jumpSpeedMultiply;
                
                rocket.fire({
                    x: direction.x + Math.random() * CONFIG.WEAPONS.CHAINGUN.SPREAD_COFF * rand * 2 - CONFIG.WEAPONS.CHAINGUN.SPREAD_COFF * rand,
                    y: direction.y + Math.random() * CONFIG.WEAPONS.CHAINGUN.SPREAD_COFF * rand * 2 - CONFIG.WEAPONS.CHAINGUN.SPREAD_COFF * rand,
                    z: direction.z + Math.random() * CONFIG.WEAPONS.CHAINGUN.SPREAD_COFF * rand * 2 - CONFIG.WEAPONS.CHAINGUN.SPREAD_COFF * rand
                });
            });
        } catch(e) {
            console.error(e);
        }
    } else if(isMouseDown) {
        if(State.ultra3.scene.animationGroups[0]) {
            State.ultra3.scene.animationGroups[0].play();
        }
    } else {
        if(State.ultra3.scene.animationGroups[0]) {
            State.ultra3.scene.animationGroups[0].stop();
        }
    }

    // controls

    if (noclip) {
        if (State.keys[CONFIG.PLAYER.GO_FORWARD_KEY]) { // Go forward
            State.ultra3.camera.position.x += direction.x;
            State.ultra3.camera.position.y += direction.y;
            State.ultra3.camera.position.z += direction.z;
        }
        if (State.keys[CONFIG.PLAYER.GO_BACKWARD_KEY]) { // Go forward
            State.ultra3.camera.position.x -= direction.x;
            State.ultra3.camera.position.y -= direction.y;
            State.ultra3.camera.position.z -= direction.z;
        }
    } else {
    
        if ((State.keys[CONFIG.PLAYER.GO_FORWARD_KEY] || State.keys[CONFIG.PLAYER.GO_BACKWARD_KEY] || State.keys[CONFIG.PLAYER.GO_LEFT_KEY] || State.keys[CONFIG.PLAYER.GO_RIGHT_KEY]) && player.onGround) {
            player.direction = {
                x: 0,
                z: 0
            }    
        }

        if (!player.onGround) {
            jumpSpeedMultiply += 0.001;
        } else if(jumpSpeedMultiply > 1) {
            jumpSpeedMultiply = 1;
        }

        if (State.keys[CONFIG.PLAYER.GO_FORWARD_KEY]) { // Go forward
            //State.ultra3.scene.meshes[CONFIG.PLAYER.MESH_INDEX].isPickable = false; // turn off physics for player model to avoid bugs

            player.dirspeed = CONFIG.PLAYER.SPEED;
            let hit = checkCameraForCollisions(new BABYLON.Vector3(direction.x, 0, 0), CONFIG.PLAYER.SPEED * CONFIG.PHYSICS.MIN_DISTANCE_TO_COLLISION);

            if(!hit.hit) {
                player.direction.x += direction.x;
            }
            hit = checkCameraForCollisions(new BABYLON.Vector3(0, 0, direction.z), CONFIG.PLAYER.SPEED * CONFIG.PHYSICS.MIN_DISTANCE_TO_COLLISION);

            if(!hit.hit) {
                player.direction.z += direction.z;
            }

            //State.ultra3.scene.meshes[CONFIG.PLAYER.MESH_INDEX].isPickable = true;
        }

        if (State.keys[CONFIG.PLAYER.GO_BACKWARD_KEY]) { // Go backward
            //State.ultra3.scene.meshes[CONFIG.PLAYER.MESH_INDEX].isPickable = false; // turn off physics for player model to avoid bugs

            player.dirspeed = CONFIG.PLAYER.SPEED;
            let hit = checkCameraForCollisions(new BABYLON.Vector3(-direction.x, 0, 0), CONFIG.PLAYER.SPEED * CONFIG.PHYSICS.MIN_DISTANCE_TO_COLLISION);
            if(!hit.hit) {
                player.direction.x -= direction.x;
            }

            hit = checkCameraForCollisions(new BABYLON.Vector3(0, 0, -direction.z), CONFIG.PLAYER.SPEED * CONFIG.PHYSICS.MIN_DISTANCE_TO_COLLISION);
            if(!hit.hit) {
                player.direction.z -= direction.z;
            }

            //State.ultra3.scene.meshes[CONFIG.PLAYER.MESH_INDEX].isPickable = true;
        }

        CONFIG.PLAYER.SPEED /= 1.5;

        if (State.keys[CONFIG.PLAYER.GO_LEFT_KEY]) { // Go left
            //State.ultra3.scene.meshes[CONFIG.PLAYER.MESH_INDEX].isPickable = false; // turn off physics for player model to avoid bugs

            player.dirspeed = CONFIG.PLAYER.SPEED;
            if(!State.map.have_walls) {
                player.direction.x -= Math.sin((angle + 90) * Math.PI / 180);
                player.direction.z -= Math.cos((angle + 90) * Math.PI / 180)
            } else {
                if(!checkCameraForCollisions(new BABYLON.Vector3(Math.sin((angle - 90) * Math.PI / 180), 0, 0), CONFIG.PHYSICS.MIN_DISTANCE_TO_COLLISION).hit && !checkCameraForCollisions(new BABYLON.Vector3(Math.sin((angle - 85) * Math.PI / 180), 0, 0), CONFIG.PHYSICS.MIN_DISTANCE_TO_COLLISION).hit && !checkCameraForCollisions(new BABYLON.Vector3(Math.sin((angle - 95) * Math.PI / 180), 0, 0), CONFIG.PHYSICS.MIN_DISTANCE_TO_COLLISION).hit) {
                    player.direction.x -= Math.sin((angle + 90) * Math.PI / 180);
                }

                if(!checkCameraForCollisions(new BABYLON.Vector3(0, 0, Math.cos((angle - 90) * Math.PI / 180)), CONFIG.PHYSICS.MIN_DISTANCE_TO_COLLISION).hit && !checkCameraForCollisions(new BABYLON.Vector3(0, 0, Math.cos((angle - 85) * Math.PI / 180)), CONFIG.PHYSICS.MIN_DISTANCE_TO_COLLISION).hit && !checkCameraForCollisions(new BABYLON.Vector3(0, 0, Math.cos((angle - 95) * Math.PI / 180)), CONFIG.PHYSICS.MIN_DISTANCE_TO_COLLISION).hit) {
                    player.direction.z -= Math.cos((angle + 90) * Math.PI / 180);
                }
            }

            //State.ultra3.scene.meshes[CONFIG.PLAYER.MESH_INDEX].isPickable = true;
        }

        if (State.keys[CONFIG.PLAYER.GO_RIGHT_KEY]) { // Go right
            //State.ultra3.scene.meshes[CONFIG.PLAYER.MESH_INDEX].isPickable = false; // turn off physics for player model to avoid bugs

            player.dirspeed = CONFIG.PLAYER.SPEED;
            if(!State.map.have_walls) {
                player.direction.x += Math.sin((angle + 90) * Math.PI / 180);
                player.direction.z += Math.cos((angle + 90) * Math.PI / 180)
            } else {
                if(!checkCameraForCollisions(new BABYLON.Vector3(Math.sin((angle + 90) * Math.PI / 180), 0, 0), CONFIG.PHYSICS.MIN_DISTANCE_TO_COLLISION).hit && !checkCameraForCollisions(new BABYLON.Vector3(Math.sin((angle + 85) * Math.PI / 180), 0, 0), CONFIG.PHYSICS.MIN_DISTANCE_TO_COLLISION).hit && !checkCameraForCollisions(new BABYLON.Vector3(Math.sin((angle + 95) * Math.PI / 180), 0, 0), CONFIG.PHYSICS.MIN_DISTANCE_TO_COLLISION).hit) {
                    player.direction.x += Math.sin((angle + 90) * Math.PI / 180);
                }

                if(!checkCameraForCollisions(new BABYLON.Vector3(0, 0, Math.cos((angle + 90) * Math.PI / 180)), CONFIG.PHYSICS.MIN_DISTANCE_TO_COLLISION).hit && !checkCameraForCollisions(new BABYLON.Vector3(0, 0, Math.cos((angle + 85) * Math.PI / 180)), CONFIG.PHYSICS.MIN_DISTANCE_TO_COLLISION).hit && !checkCameraForCollisions(new BABYLON.Vector3(0, 0, Math.cos((angle + 95) * Math.PI / 180)), CONFIG.PHYSICS.MIN_DISTANCE_TO_COLLISION).hit) {
                    player.direction.z += Math.cos((angle + 90) * Math.PI / 180);
                }
            }

            //State.ultra3.scene.meshes[CONFIG.PLAYER.MESH_INDEX].isPickable = true;
        }

        player.direction = Vector.normalize(player.direction.x, 0, player.direction.z);

        calcGravity();
        movePlayer();
        
        State.ultra3.camera.position.y += player.speed.y;

        // if (State.ultra3.camera.position.y < 3) { // Player falling from the map => death.
        //     // player.dead = true;
        //     // if(State.ultra3.scene.meshes[CONFIG.WEAPONS.CHAINGUN.MESH_INDEX]) {
        //     //     State.ultra3.scene.meshes[CONFIG.WEAPONS.CHAINGUN.MESH_INDEX].dispose();
        //     // }
        //     State.ultra3.camera.position.y = 60;
        //     State.ultra3.camera.position.x = 0;
        //     State.ultra3.camera.position.z = 0;
        // }

        // if(!noclip) {
        //     State.ultra3.scene.meshes[CONFIG.PLAYER.MESH_INDEX].position = new BABYLON.Vector3(-State.ultra3.camera.position.x, State.ultra3.camera.position.y, State.ultra3.camera.position.z);
        // }

    }

    if (State.keys[70] && Number(new Date()) - State.lastShot >= 1000) {
        State.lastShot = Number(new Date());
        let rocket = new Rocket(null, {
            x: State.ultra3.camera.position.clone().x + direction.x * 2,
            y: State.ultra3.camera.position.clone().y + direction.y * 2,
            z: State.ultra3.camera.position.clone().z + direction.z * 2
        }, TR_LINEAR);
        State.ultra3.camera2.rotation = State.ultra3.camera.rotation.clone();
        rocket.create(() => {
            rocket.model.rotation = State.ultra3.camera.rotation.clone();
            rocket.model.addRotation(90 * Math.PI / 180, 0, 0);
            let rand = 1;

            for(let i = 0; i < CONFIG.WEAPONS.CHAINGUN.ACCURACY_SAMPLES; i++) {
                rand *= Math.random();
            }

            rocket.speed *= jumpSpeedMultiply;
            rocket.viewing = true;
            rocket.teleporter = true;
            State.ultra3.camera2.rotation = State.ultra3.camera.rotation.clone();
            
            rocket.fire({
                x: direction.x + Math.random() * CONFIG.WEAPONS.CHAINGUN.SPREAD_COFF * rand * 2 - CONFIG.WEAPONS.CHAINGUN.SPREAD_COFF * rand,
                y: direction.y + Math.random() * CONFIG.WEAPONS.CHAINGUN.SPREAD_COFF * rand * 2 - CONFIG.WEAPONS.CHAINGUN.SPREAD_COFF * rand,
                z: direction.z + Math.random() * CONFIG.WEAPONS.CHAINGUN.SPREAD_COFF * rand * 2 - CONFIG.WEAPONS.CHAINGUN.SPREAD_COFF * rand
            });
        });
    }

    if (State.keys[69] && Number(new Date()) - State.lastFakeShot >= 200) { // fire from point to test
        State.lastFakeShot = Number(new Date());
        let rocket = new Rocket(null, {
            x: -9.978203143127258,
            y: 1000.306000000003063,
            z: 7.995583881418834 + Math.sin(frame * Math.PI / 180) * 10
        }, TR_LINEAR);
        rocket.create(() => {
            rocket.model.rotation = State.ultra3.camera.rotation.clone();
            rocket.model.addRotation(90 * Math.PI / 180, -180 * Math.PI / 180, 0);
            let rand = 1;

            for(let i = 0; i < CONFIG.WEAPONS.CHAINGUN.ACCURACY_SAMPLES; i++) {
                rand *= Math.random();
            }

            rocket.speed *= jumpSpeedMultiply;
            
            let vector = Vector.normalize((State.ultra3.camera.position.x + 9.978203143127258), (State.ultra3.camera.position.y - 20.306000000003063), (State.ultra3.camera.position.z - 7.995583881418834 - Math.sin(frame * Math.PI / 180) * 10));

            rocket.fire({
                x: vector.x + Math.random() * CONFIG.WEAPONS.CHAINGUN.SPREAD_COFF * rand * 2 - CONFIG.WEAPONS.CHAINGUN.SPREAD_COFF * rand,
                y: vector.y + Math.random() * CONFIG.WEAPONS.CHAINGUN.SPREAD_COFF * rand * 2 - CONFIG.WEAPONS.CHAINGUN.SPREAD_COFF * rand,
                z: vector.z + Math.random() * CONFIG.WEAPONS.CHAINGUN.SPREAD_COFF * rand * 2 - CONFIG.WEAPONS.CHAINGUN.SPREAD_COFF * rand
            });
        });
    }

//    State.ultra3.scene.meshes[CONFIG.FAKEPLAYER.MESH_INDEX].position = new BABYLON.Vector3(9.978203143127258, 20.306000000003063, 7 + Math.sin(frame * Math.PI / 180) * 10);

    if(State.keys[16]) { // run
        CONFIG.PLAYER.SPEED = CONFIG.PLAYER.RUNSPEED;
        CONFIG.PHYSICS.MIN_DISTANCE_TO_COLLISION = 2 * jumpSpeedMultiply;
    } else {
        CONFIG.PLAYER.SPEED = CONFIG.PLAYER.WALKSPEED;
        CONFIG.PHYSICS.MIN_DISTANCE_TO_COLLISION = 1 * jumpSpeedMultiply;
    }

    if(State.keys[32]) { // jump
        if(player.speed.y === 0) { // if player not in air
            player.speed.y = 0.4;
        }
    }

    // So we can init physics before scene starts

    // So this "if" at end because else this may cause some bugs with gun
    if(CONFIG.WEAPONS.CHAINGUN.MESH_INDEX !== null) {
        State.ultra3.scene.meshes[CONFIG.WEAPONS.CHAINGUN.MESH_INDEX].position = new BABYLON.Vector3(State.ultra3.camera.position.x + direction.x * CONFIG.WEAPONS.NEAR_COF, State.ultra3.camera.position.y + direction.y * CONFIG.WEAPONS.NEAR_COF, State.ultra3.camera.position.z + direction.z * CONFIG.WEAPONS.NEAR_COF);
        //State.ultra3.scene.meshes[CONFIG.WEAPONS.CHAINGUN.MESH_INDEX].position = State.ultra3.camera.position.clone();
        State.ultra3.scene.meshes[CONFIG.WEAPONS.CHAINGUN.MESH_INDEX].rotation = new BABYLON.Vector3(State.ultra3.camera.rotation.x, State.ultra3.camera.rotation.y, State.ultra3.camera.rotation.z);
        State.ultra3.scene.meshes[CONFIG.WEAPONS.CHAINGUN.MESH_INDEX].addRotation(-Math.PI / 2, 0, Math.PI / 2);
    }
    State.ultra3.scene.clearColor = new BABYLON.Color3(0.3, 0.3, 0.3);
    fps.innerHTML = `FPS: ${State.ultra3.engine.getFps().toFixed()}`;

    for(let i = 0; i < portalsArray.length; i++) {
        portalsArray[i].calculate();
    }
});


State.ultra3.camera.position.z += 3;

// ***************************************************************
// #MODELS_LOAD
// ***************************************************************

State.ultra3.loadModel("/Models/maps/", "snowmap_main.babylon", function(scene: any) {
    player.entity = new Entity(100);
    State.ultra3.camera.position.y = 500;
    player.dead = false;
    // State.ultra3.scene.meshes[scene + 1].material = State.shaderMaterial;
    // State.ultra3.scene.meshes[scene + 2].material = State.shaderMaterial;
    State.ultra3.loadModel("/Models/Weapons/", "grenade_launcher.babylon", function(scene: any) {
        
        CONFIG.WEAPONS.CHAINGUN.MESH_INDEX = scene + 1;
        State.ultra3.scene.meshes[scene + 1].isPickable = false;
        // State.ultra3.scene.meshes[scene + 1].material = State.shaderMaterial;
        // State.ultra3.scene.animationGroups[0]._speedRatio = 0.2;

        // State.ultra3.loadModel("/Models/", "player.glb", function(index: number) {
        //     console.log("Success");
        //     CONFIG.PLAYER.MESH_INDEX = index + 1;
        //     State.ultra3.scene.meshes[CONFIG.PLAYER.MESH_INDEX].visibility = 0;
        //     setTimeout(() => {
        //         player.entity.linkMesh(State.ultra3.scene.meshes[CONFIG.PLAYER.MESH_INDEX]);
        //         State.ultra3.scene.meshes[CONFIG.PLAYER.MESH_INDEX].entity.onDamaged = function() {
        //             health.innerHTML = "Health: " + State.ultra3.scene.meshes[CONFIG.PLAYER.MESH_INDEX].entity.health;
        //             health.style.color = `rgb(255, ${(State.ultra3.scene.meshes[CONFIG.PLAYER.MESH_INDEX].entity.health > 50 ? 50 : State.ultra3.scene.meshes[CONFIG.PLAYER.MESH_INDEX].entity.health) * 5}, ${(State.ultra3.scene.meshes[CONFIG.PLAYER.MESH_INDEX].entity.health > 80 ? 80 : State.ultra3.scene.meshes[CONFIG.PLAYER.MESH_INDEX].entity.health) * 3.125})`;
        //             if(State.ultra3.scene.meshes[CONFIG.PLAYER.MESH_INDEX].entity.health === -60 && !player.dead) {
        //                 SOUND.DEATH_GIBBED.play();
        //                 player.dead = true;
        //                 drawNoise();
        //             } else if(State.ultra3.scene.meshes[CONFIG.PLAYER.MESH_INDEX].entity.health < 1 && State.ultra3.scene.meshes[CONFIG.PLAYER.MESH_INDEX].entity.health > -60 && !player.dead) {
        //                 SOUND.DEATH.play();
        //                 player.dead = true;
        //                 drawNoise();
        //             }
        //         }
        //     }, 100);
        // }, false, false, 1);

    }, false, false, 1);
    State.ultra3.loadModel("/Models/maps/", "snowmap.babylon", function(scene: any) {
        State.ultra3.scene.meshes[scene + 1].visibility = 0;
        State.ultra3.scene.meshes[scene + 2].visibility = 0;
    }, false, true, 2);
}, false, false, 2);
State.ultra3.camera.position.y = 1000;
State.ultra3.enalbePointerLock();

document.onmousedown = () => {
    isMouseDown = true;
}

document.onmouseup = () => {
    isMouseDown = false;
}

setTimeout(() => {
    new Portal([230.5668593315476, -7.523848164306469, 110.72459768491176], {
        sizeX: 16,
        sizeY: 9,
        rotation: {
            x: 0,
            y: 0,
            z: 0
        }
    }, [209.26746661925307, -5.541869086430066, 99.99341088719707], {
        sizeX: 16,
        sizeY: 9,
        rotation: {
            x: 0,
            y: 0,
            z: 0
        }
    });
    // new Planet(100, 10000, {x: 0, y: 0, z: 0}, 64, 0.8, 0.1, 0.1);
    // new Planet(300, 30000, {x: -500, y: -200, z: 3000}, 64, 0.8, 0.1, 0.1);
    // new Planet(200, 20000, {x: 2000, y: 0, z: 500}, 64, 0.8, 0.1, 0.1);
}, 10000);

document.onkeydown = (e) => {
    State.keys[e.keyCode] = true;

    for(let i = 0; i < binds.length; i++) {
        if(State.keys[i] && binds[i]) {
            binds[i]();
        }
    }
}

document.onkeyup = (e) => {
    State.keys[e.keyCode] = false;
}

document.onwheel = (e) => {
    if(e.deltaY < 0) {
        if(State.ultra3.camera.fov > 10 * Math.PI / 180) {
            State.ultra3.camera.fov -= 10 * Math.PI / 180; // 10 degrees
            State.ultra3.camera.angularSensibility += 200;
        }
    } else if(e.deltaY > 0) {
        if(State.ultra3.camera.fov < 120 * Math.PI / 180) {
            State.ultra3.camera.fov += 10 * Math.PI / 180; // 10 degrees
            State.ultra3.camera.angularSensibility -= 200;
        }
    }
};

bind(66, () => State.ultra3.freeze()); // B
bind(67, () => {
    State.noclip = !State.noclip;
}); // B

    // Compile

    BABYLON.Effect.ShadersStore["customVertexShader"]=                "precision highp float;\r\n"+

    "// Attributes\r\n"+
    "attribute vec3 position;\r\n"+
    "attribute vec2 uv;\r\n"+
    "attribute vec3 normal;\r\n"+

    "// Uniforms\r\n"+
    "uniform mat4 worldViewProjection;\r\n"+

    "// Varying\r\n"+
    "varying vec3 norm;\r\n"+
    "varying vec3 pos;\r\n"+

    "void main(void) {\r\n"+
    "    gl_Position = worldViewProjection * vec4(position, 1.0);\r\n"+
    "    norm = normal;\r\n"+
    "    pos = position;\r\n"+
    "}\r\n";

    BABYLON.Effect.ShadersStore["customFragmentShader"] = "precision highp float;\r\n"+
    "varying vec3 norm;\r\n"+
    "varying vec3 pos;\r\n"+
    "uniform vec3 cameraPosition;\r\n"+

    "vec3 linearInterpolate(vec3 a, vec3 b, float coff) {\r\n"+
    "    return a + (b - a) * coff;\r\n"+
    "}\r\n"+
    "void main(void) {\r\n"+
    "    float power = 60.0;\r\n"+
    "    vec3 fogColor = vec3(0.2, 0.0, 0.2);\r\n"+
    "    vec3 sunPosition = vec3(1.0, 1.0, 0.0);\r\n"+
    "    float sunAmbient = dot(normalize(sunPosition), norm) * 1.0;\r\n"+
    "    float skyAmbient = max(0.0, dot(vec3(0.0, 1.0, 0.0), norm));\r\n"+
    "    gl_FragColor = vec4(linearInterpolate(fogColor, vec3(sunAmbient + 0.3 * skyAmbient, sunAmbient + 0.444 * skyAmbient, sunAmbient + skyAmbient), min(0.5, pow(power / length(pos - cameraPosition), 5.0))), 1.0);\r\n"+
    "}\r\n";
    State.shaderMaterial = new BABYLON.ShaderMaterial("shader", State.ultra3.scene, {
        vertex: "custom",
        fragment: "custom",
    },
        {
            attributes: ["position", "normal", "uv"],
            uniforms: ["world", "worldView", "worldViewProjection", "view", "projection"]
        });
    State.shaderMaterial.setVector3("cameraPosition", State.ultra3.camera.position);
    State.shaderMaterial.backFaceCulling = false;
// setTimeout(() => {
//     for(let i = 0; i < State.ultra3.scene.meshes.length; i++) {
//         State.ultra3.scene.meshes[i].oldMaterial = State.ultra3.scene.meshes[i].material;
//         State.ultra3.scene.meshes[i].material = State.shaderMaterial;
//     }
// }, 4000);

// setTimeout(() => {
//     for(let i = 0; i < State.ultra3.scene.meshes.length; i++) {
//         State.ultra3.scene.meshes[i].material = State.ultra3.scene.meshes[i].oldMaterial;
//     }
// }, 10000);