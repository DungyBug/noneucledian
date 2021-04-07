import { Entity } from "./ug_entity";

enum WEAPON {
    WP_CHAIN_ROCKET_LAUNCHER,
    WP_GRENADE_LAUNCHER,
    WP_LASERGUN,
    WP_PLASMAGUN,
    WP_ULTRASONIC,
    WP_RADIATEGUN,
    WP_TELEPORTER,
    WP_LASERVISOR
};

/*
Powerups
Respawns every 80 seconds
Some of them have levels.
Levels of powerups defines by intensity of battle.
How do intensity of battle defines you can see in intensity.txt in docs to this source.
*/
enum POWERUP {
    /*
    PW_SPEED
    1 level
    Makes you faster 1.3 times.
    2 level
    Makes you faster 1.3 times.
    Reload time faster 1.2 times.
    3 level
    Makes you faster 1.3 times
    Reload time faster 1.5 times.
    */
    PW_SPEED,
    /*
    PW_DOUBLE_DAMAGE
    Inflicts damage double times. I inspirate by Quake 3 Arena from idSoftware.
    */
    PW_DOUBLE_DAMAGE,
    /*
    PW_SUPER
    Makes all your weapons third level for the time ( usually 20 seconds )
    */
    PW_SUPER,
    /*
    PW_DOUBLE_JUMP
    Gives you additional jump. You can jump, and then jump in air.
    1 level.
    Additional jump with 0.75 height of usual jump

    2 level
    Additional jump with height of usual jump

    3 level
    Additional jump with double height of usual jump
    */
    PW_DOUBLE_JUMP
};

export interface Player {
    inventory: Array<number>;
    
}

export class Player extends Entity {
    
}