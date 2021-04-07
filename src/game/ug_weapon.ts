import { Coordinate } from "./ub_coordinate";
import { Entity } from "./ug_entity";

const MISSILE_ROCKET  = 0;
const MISSILE_GRENADE = 1;
const MISSILE_RAIL    = 2;
const MISSILE_BULLET  = 3;

export interface Missile {
    speed: number;
    owner: Entity;
    fired: boolean;
    coords: Coordinate;
    trajectory: number;
};

export interface Weapon {
    owner: Entity;
    reloadTime: number;
    model: any;
    ammo: number;
}

export class Missile {
    constructor(owner: Entity, coords: Coordinate, trajectory: number) {
        this.speed = 1;
        this.owner = owner;
        this.fired = false;
        this.coords = coords || {
            x: 0,
            y: 0,
            z: 0
        }
        this.trajectory = trajectory;
    }
};

export class Weapon {
    constructor(owner: Entity) {
        this.owner = owner;
        this.reloadTime = null;
        this.model = null;
        this.ammo = 0;
    }
};