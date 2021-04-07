import { Weapon } from "./ug_weapon";
import { Rocket, TR_LINEAR, TR_GRAVITY, TR_WAVE } from "./ug_missile";
import { CONFIG } from "../config";

export class ChainRocketLauncher extends Weapon {
    fire(direction) {
        if(this.ammo > 0) {
            this.ammo--;

            let rocket = new Rocket(this.owner, {
                x: this.owner.coords.x + direction.x * 2,
                y: this.owner.coords.y + direction.y * 2,
                z: this.owner.coords.z + direction.z * 2
            }, TR_LINEAR);
            
            rocket.create(() => {
                rocket.model.rotation.x = this.owner.rotation.x;
                rocket.model.rotation.y = this.owner.rotation.y;
                rocket.model.rotation.z = this.owner.rotation.z;
                rocket.model.addRotation(90 * Math.PI / 180, 0, 0);
                let rand = 1;

                for(let i = 0; i < CONFIG.WEAPONS.CHAINGUN.ACCURACY_SAMPLES; i++) {
                    rand *= Math.random();
                }
                
                rocket.fire({
                    x: direction.x + Math.random() * CONFIG.WEAPONS.CHAINGUN.SPREAD_COFF * rand * 2 - CONFIG.WEAPONS.CHAINGUN.SPREAD_COFF * rand,
                    y: direction.y + Math.random() * CONFIG.WEAPONS.CHAINGUN.SPREAD_COFF * rand * 2 - CONFIG.WEAPONS.CHAINGUN.SPREAD_COFF * rand,
                    z: direction.z + Math.random() * CONFIG.WEAPONS.CHAINGUN.SPREAD_COFF * rand * 2 - CONFIG.WEAPONS.CHAINGUN.SPREAD_COFF * rand
                });
            });
        }
    }

    pickUpAmmo() {
        this.ammo += 10;
    }
};

export class GrenadeLauncher extends Weapon {
    fire(direction) {
        if(this.ammo > 0) {
            this.ammo--;

            let rocket = new Rocket(this.owner, {
                x: this.owner.coords.x + direction.x * 2,
                y: this.owner.coords.y + direction.y * 2,
                z: this.owner.coords.z + direction.z * 2
            }, TR_GRAVITY);
            
            rocket.create(() => {
                rocket.model.rotation.x = this.owner.rotation.x;
                rocket.model.rotation.y = this.owner.rotation.y;
                rocket.model.rotation.z = this.owner.rotation.z;
                rocket.model.addRotation(90 * Math.PI / 180, 0, 0);
                
                rocket.fire({
                    x: direction.x + Math.random() * CONFIG.WEAPONS.GRENADE_LAUNCHER.SPREAD_COFF * 2 - CONFIG.WEAPONS.GRENADE_LAUNCHER.SPREAD_COFF,
                    y: direction.y + Math.random() * CONFIG.WEAPONS.GRENADE_LAUNCHER.SPREAD_COFF * 2 - CONFIG.WEAPONS.GRENADE_LAUNCHER.SPREAD_COFF,
                    z: direction.z + Math.random() * CONFIG.WEAPONS.GRENADE_LAUNCHER.SPREAD_COFF * 2 - CONFIG.WEAPONS.GRENADE_LAUNCHER.SPREAD_COFF
                });
            });
        }
    }

    pickUpAmmo() {
        this.ammo += 15;
    }
};