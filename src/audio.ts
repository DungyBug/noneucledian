import { State } from "./global";

export let SOUND: any;

setTimeout(() => {
    SOUND = {
        DEATH: new Audio("/Media/sounds/player/death.wav"),
        DEATH_GIBBED: new Audio("/Media/sounds/player/death_gibbed.wav"),
        EXPLOSION: new BABYLON.Sound("", "/Media/sounds/common/explosion.wav", State.ultra3.scene, null, {
            loop: false,
            autoplay:false,
            spatialSound: true,
            distanceModel: "exponential",
        })
    };
}, 10);