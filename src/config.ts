export const CONFIG = {
    SIZE_CROSSHAIR: 1,
    CROSSHAIR_DISTANCE_FROM_PLAYER: 0.1,
    DEVIATION_SENSIVITY: 100,
    MAP: {
        GRAVITY: 0.021 // 0.021
    },
    WEAPONS: {
        NEAR_COF: 2,
        CHAINGUN: {
            MIN_TIME_TO_SHOT: 500,
            SHOT_SOUND: null as any,
            MESH_INDEX: null as number,
            SPREAD_COFF: 0.2,
            ACCURACY_SAMPLES: 3
        },
        GRENADE_LAUNCHER: {
            MIN_TIME_TO_SHOT: 1500,
            SHOT_SOUND: null as any,
            MESH_INDEX: null as number,
            SPREAD_COFF: 0.02
        }
    },
    PLAYER: {
        SPEED: 0.4,
        RUNSPEED: 0.8,
        WALKSPEED: 0.4,
        GO_FORWARD_KEY: 87,
        GO_BACKWARD_KEY: 83,
        GO_LEFT_KEY: 65,
        GO_RIGHT_KEY: 68,
        ENABLE_CAMERA_LOOK_AT_KEY: 16,
        LOOK_AT_MAX_DIST: 100,
        MESH_INDEX: 0
    },
    FAKEPLAYER: {
        MESH_INDEX: 0
    },
    PHYSICS: {
        MIN_DISTANCE_TO_COLLISION: 1
    }
};