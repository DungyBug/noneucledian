import { CONFIG } from "./config";
import { player } from "./player";
import * as BABYLON from 'babylonjs';
import { State } from "./global";
import { Vector } from "./vector";

export function checkCameraForCollisions(direction, length) {
    let ray = new BABYLON.Ray(new BABYLON.Vector3(State.ultra3.camera.position.x, State.ultra3.camera.position.y, State.ultra3.camera.position.z), direction, length);
    let hit = State.ultra3.scene.pickWithRay(ray, null, true);

    // if(hit) {
    //     if(hit.pickedMesh !== null) {
    //         if(hit.pickedMesh.isPickable === false) {
    //             let oldPos = hit.pickedMesh.position;
    //             hit.pickedMesh.position = new BABYLON.Vector3(oldPos.x + length, oldPos.y + length, oldPos.z + length);
    //             hit = checkCameraForCollisions(direction, length);
    //             hit.pickedMesh.position = oldPos.clone();
    //         }
    //     }
    // }
    return hit;
}

export function checkPointForCollisions(point, direction, length) {
    let ray = new BABYLON.Ray(new BABYLON.Vector3(point.x + direction.x * 2, point.y + direction.y * 2, point.z + direction.z * 2), direction, length);
    let hit = State.ultra3.scene.pickWithRay(ray, null, true);
    
    return hit;
}

export let calcGravity = function() {};

export let movePlayer = function() {};

calcGravity = function() {
    //State.ultra3.scene.meshes[CONFIG.PLAYER.MESH_INDEX].isPickable = false;
    State.ultra3.camera.position.x += player.speed.x + player.gravity.x;
    State.ultra3.camera.position.y += player.gravity.y;
    State.ultra3.camera.position.z += player.speed.z + player.gravity.z;
    let gravity;
    for(let i = 0; i < State.planetsArray.length; i++) {
        gravity = State.planetsArray[i].calculateGravityForce(State.ultra3.camera.position.x, State.ultra3.camera.position.y, State.ultra3.camera.position.z);
        player.gravity.x += gravity.x;
        player.gravity.y += gravity.y;
        player.gravity.z += gravity.z;
    }

    if(player.speed.x < -0.1) {
        player.speed.x += 0.1;
    } else if(player.speed.x > 0.1) {
        player.speed.x -= 0.1;
    } else {
        player.speed.x = 0;
    }
    if(player.speed.z < -0.1) {
        player.speed.z += 0.1;
    } else if(player.speed.z > 0.1) {
        player.speed.z -= 0.1;
    } else {
        player.speed.z = 0;
    }

    if(player.gravity.x < -0.01) {
        player.gravity.x += 0.01;
    } else if(player.gravity.x > 0.01) {
        player.gravity.x -= 0.01;
    } else {
        player.gravity.x = 0;
    }
    if(player.gravity.y < -0.01) {
        player.gravity.y += 0.01;
    } else if(player.gravity.y > 0.01) {
        player.gravity.y -= 0.01;
    } else {
        player.gravity.y = 0;
    }
    if(player.gravity.z < -0.01) {
        player.gravity.z += 0.01;
    } else if(player.gravity.z > 0.01) {
        player.gravity.z -= 0.01;
    } else {
        player.gravity.z = 0;
    }
    // if(player.speed.y < 0) {
    // Commented because when i was optimizing physics, adding this if causes a bug, when player while jumping go through skewed walls. This "if" can be useful in doom-like maps ( all walls under 90 deg skew ).
    // Doom-like maps: maps from game "Doom 1".
    let playerSpeedYSubtractedByGravity = false;
    if(!checkCameraForCollisions(new BABYLON.Vector3(0, -1, 0), -player.speed.y + 2).hit) {
        if(!checkCameraForCollisions(new BABYLON.Vector3(0, -1, 0), 2.01 + CONFIG.MAP.GRAVITY).hit) {
            player.speed.y -= CONFIG.MAP.GRAVITY;
            player.onGround = false;
            playerSpeedYSubtractedByGravity = true;
        }
    } else {
        if(player.speed.y < 0) {
            player.speed.y = 0;
        }
        player.onGround = true;
        
        let hit = checkCameraForCollisions(new BABYLON.Vector3(0, -1, 0), 2.01);
        while(hit.hit) {
            State.ultra3.camera.position.y += hit.distance * 0.1;
            player.speed.y += hit.getNormal().y * hit.distance * 0.04;
            if(State.keys[CONFIG.PLAYER.GO_RIGHT_KEY] || State.keys[CONFIG.PLAYER.GO_LEFT_KEY] || State.keys[CONFIG.PLAYER.GO_FORWARD_KEY] || State.keys[CONFIG.PLAYER.GO_BACKWARD_KEY]) {
                player.speed.x += hit.getNormal().x * (hit.distance * 0.025);
                player.speed.z += hit.getNormal().z * (hit.distance * 0.025);
            }
            hit = checkCameraForCollisions(new BABYLON.Vector3(0, -1, 0), 2);
        }
        // while(checkCameraForCollisions(new BABYLON.Vector3(0, -1, 0), -player.speed.y + 1.99).hit) {
        //     State.ultra3.camera.position.y += 0.01 - checkCameraForCollisions(new BABYLON.Vector3(0, -1, 0), 0.01).distance;
        // }
    }
    if(player.speed.y === 0) {
        let hit = checkCameraForCollisions(new BABYLON.Vector3(0, -1, 0), 2);
        if(!hit.hit && !playerSpeedYSubtractedByGravity) {
            if(!checkCameraForCollisions(new BABYLON.Vector3(0, -1, 0), 2.01 + CONFIG.MAP.GRAVITY).hit) {
                player.speed.y -= CONFIG.MAP.GRAVITY;
                player.onGround = false;
            }
        } else {
            if(player.speed.y < 0) {
                player.speed.y = 0;
                
            }
            player.onGround = true;
            
            while(hit.hit) {
                State.ultra3.camera.position.y += hit.distance * 0.1;
                player.speed.y += hit.getNormal().y * hit.distance * 0.04;
                if(State.keys[CONFIG.PLAYER.GO_RIGHT_KEY] || State.keys[CONFIG.PLAYER.GO_LEFT_KEY] || State.keys[CONFIG.PLAYER.GO_FORWARD_KEY] || State.keys[CONFIG.PLAYER.GO_BACKWARD_KEY]) {
                    player.speed.x += hit.getNormal().x * (hit.distance * 0.025);
                    player.speed.z += hit.getNormal().z * (hit.distance * 0.025);
                }
                hit = checkCameraForCollisions(new BABYLON.Vector3(0, -1, 0), 2);
            }
            // while(checkCameraForCollisions(new BABYLON.Vector3(0, -1, 0), 1.99).hit) {
            //     State.ultra3.camera.position.y += 0.01 - checkCameraForCollisions(new BABYLON.Vector3(0, -1, 0), 0.01).distance;
            // }
        }
    } else if(player.speed.y > 0 && State.map.have_ceiling) {
        if(!checkCameraForCollisions(new BABYLON.Vector3(0, 1, 0), player.speed.y).hit) {
            if(!checkCameraForCollisions(new BABYLON.Vector3(0, -1, 0), 2.01).hit) {
                if(!playerSpeedYSubtractedByGravity) {
                    player.speed.y -= CONFIG.MAP.GRAVITY;
                    player.onGround = false;
                }
            }
        } else {
            if(player.speed.y < 0) {
                player.speed.y = 0;
                
            }
            player.onGround = true;
            
            let hit = checkCameraForCollisions(new BABYLON.Vector3(0, 1, 0), 1);
            while(hit.hit) {
                State.ultra3.camera.position.y += hit.distance * 0.1;
                player.speed.y += hit.getNormal().y * hit.distance * 0.04;
                
                if(State.keys[CONFIG.PLAYER.GO_RIGHT_KEY] || State.keys[CONFIG.PLAYER.GO_LEFT_KEY] || State.keys[CONFIG.PLAYER.GO_FORWARD_KEY] || State.keys[CONFIG.PLAYER.GO_BACKWARD_KEY]) {
                    player.speed.x += hit.getNormal().x * (hit.distance * 0.025);
                    player.speed.z += hit.getNormal().z * (hit.distance * 0.025);
                }
                hit = checkCameraForCollisions(new BABYLON.Vector3(0, 1, 0), 1);
            }
            // while(checkCameraForCollisions(new BABYLON.Vector3(0, 1, 0), player.speed.y - 0.01).hit) {
            //     State.ultra3.camera.position.y -= 0.01 - checkCameraForCollisions(new BABYLON.Vector3(0, -1, 0), 0.01).distance;
            // }
        }
    }

    //State.ultra3.scene.meshes[CONFIG.PLAYER.MESH_INDEX].isPickable = true;
}

movePlayer = function() {
    //State.ultra3.scene.meshes[CONFIG.PLAYER.MESH_INDEX].isPickable = false;
    if(player.speed.y === 0) {
        if(player.dirspeed > 0) {
            player.dirspeed -= 0.1;
        } else if(player.dirspeed < 0.05) {
            player.dirspeed = 0;
        }
    } else if(player.dirspeed > 0) {
        if(State.keys[16]) {
            player.dirspeed -= 0.002;
        } else {
            player.dirspeed -= 0.01;
        }
    }

    let hit = checkCameraForCollisions(new BABYLON.Vector3(player.direction.x, 0, 0), player.dirspeed * CONFIG.PHYSICS.MIN_DISTANCE_TO_COLLISION);
    if(hit.hit) {
        player.speed.x = player.direction.x * player.dirspeed - hit.getNormal().x * (player.dirspeed * CONFIG.PHYSICS.MIN_DISTANCE_TO_COLLISION - hit.distance);
    } else {
        player.speed.x = player.direction.x * player.dirspeed;
    }

    hit = checkCameraForCollisions(new BABYLON.Vector3(0, 0, player.direction.z), player.dirspeed * CONFIG.PHYSICS.MIN_DISTANCE_TO_COLLISION);
    if(hit.hit) {
        player.speed.z = player.direction.z * player.dirspeed - hit.getNormal().z * (player.dirspeed * CONFIG.PHYSICS.MIN_DISTANCE_TO_COLLISION - hit.distance);
    } else {
        player.speed.z = player.direction.z * player.dirspeed;
    }

    // if(!checkCameraForCollisions(new BABYLON.Vector3(player.direction.x, 0, 0), player.dirspeed * CONFIG.PHYSICS.MIN_DISTANCE_TO_COLLISION).hit) {
    //     State.ultra3.camera.position.x += player.direction.x * player.dirspeed * jumpSpeedMultiply;
    // }
    // if(!checkCameraForCollisions(new BABYLON.Vector3(0, 0, player.direction.z), player.dirspeed * CONFIG.PHYSICS.MIN_DISTANCE_TO_COLLISION).hit) {
    //     State.ultra3.camera.position.z += player.direction.z * player.dirspeed * jumpSpeedMultiply;
    // }
    //State.ultra3.scene.meshes[CONFIG.PLAYER.MESH_INDEX].isPickable = true;
}