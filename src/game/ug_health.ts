import { SOUND } from "../audio";
import { State } from "../global";
import { Vector } from "../vector";

export function damage(mesh, count) {
    if(mesh.entity !== undefined) {

        mesh.entity.health -= count;

        // -60 health is maximum health, when entity can be gibbed
        if(mesh.entity.health < -60) {
            mesh.entity.health = -60;
            SOUND.DEATH_GIBBED.play();
        } else if(mesh.entity.health === 0) {
            SOUND.DEATH.play();
        }
    }
}

export function damageByRadius(count, radius, pos) {
    let sphere = BABYLON.MeshBuilder.CreateSphere("", {
        segments: 2,
        diameter: radius * 2,
    }, State.ultra3.scene);
    sphere.position = new BABYLON.Vector3(pos.x, pos.y, pos.z);
    sphere.visibility = 0.3;
    sphere.isPickable = false;

    for(let i = 0; i < State.ultra3.scene.meshes.length; i++) {

        if(State.ultra3.scene.meshes[i].entity !== undefined && State.ultra3.scene.meshes[i].entity !== null) { // Some objects such as walls hasn't entities and won't be damaged.

            if(sphere.intersectsMesh(State.ultra3.scene.meshes[i], false) || ((-sphere.position.x - State.ultra3.scene.meshes[i].position.x < radius && -sphere.position.x - State.ultra3.scene.meshes[i].position.x > -radius) && (sphere.position.y - State.ultra3.scene.meshes[i].position.y < radius && sphere.position.y - State.ultra3.scene.meshes[i].position.y > -radius) && (sphere.position.z - State.ultra3.scene.meshes[i].position.z < radius && sphere.position.z - State.ultra3.scene.meshes[i].position.z > -radius))) { // We check collision by hitbox of entity to optimize resources.

                State.ultra3.scene.meshes[i].entity.health -= Math.floor(count / (Vector.mag(-sphere.position.x - State.ultra3.scene.meshes[i].position.x, sphere.position.y - State.ultra3.scene.meshes[i].position.y, sphere.position.z - State.ultra3.scene.meshes[i].position.z) / radius / 4));
        
                // -60 health is maximum health, when entity can be gibbed
                if(State.ultra3.scene.meshes[i].entity.health < -60) {
                    State.ultra3.scene.meshes[i].entity.health = -60;
                }

                State.ultra3.scene.meshes[i].entity.onDamaged();
            }
        }
    }
    
    sphere.dispose();
}