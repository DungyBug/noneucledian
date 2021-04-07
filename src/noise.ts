const noiseCanvas = document.getElementById("noise") as HTMLCanvasElement;
const cont = document.getElementById("cont");
let noise = noiseCanvas.getContext("2d");
let health = document.getElementById("health") as HTMLSpanElement;

import { State } from "./global";
import { player } from "./player";
import { CONFIG } from "./config";

let opacity = 0;
let noiseThreeshold = 255;
let interNoiseThreeshold = 4;

export function drawNoise() {
    let rand;
    noiseCanvas.style.zIndex = (1).toString();

    let array = new Uint8ClampedArray(144 * 256 * 4)
    let i = 0;
    for(let y = 144; y > 0; y--) {
        for(let x = 256; x > 0; x--) {
            rand = Math.floor(Math.random() * noiseThreeshold);

            array[i * 4] = 0;
            array[i * 4 + 1] = 0;
            array[i * 4 + 2] = rand;
            array[i * 4 + 3] = 255;
            i++;
        }
    }

    noise.putImageData(new ImageData(array, 256, 144), 0, 0);

    if(opacity < 1) {
        opacity += 0.01;
        noiseCanvas.style.opacity = opacity.toString();
        State.ultra3.canvas.style.filter = `blur(${opacity * 20}px)`;
    } else if(noiseThreeshold > 0) {
        State.ultra3.paused = true;
        noiseThreeshold -= 0.75;
    } else {
        drawInterNoise();
        return;
    }

    requestAnimationFrame(drawNoise);
}

function drawInterNoise() {
    let array = new Uint8ClampedArray(144 * 256 * 4)
    let i = 0;
    let rand;

    if(interNoiseThreeshold % 1) {
        interNoiseThreeshold += 0.25;
        requestAnimationFrame(drawInterNoise);
        return;
    }
    
    for(let y = 144; y > 0; y--) {
        rand = Math.floor(Math.random() * interNoiseThreeshold);
        if(rand === 3) {
            rand = 1;
        } else {
            rand = 0;
        }
        for(let x = 256; x > 0; x--) {

            array[i * 4] = 0;
            array[i * 4 + 1] = 0;
            array[i * 4 + 2] = rand * 255;
            array[i * 4 + 3] = 255;
            i++;
        }
    }
    noise.putImageData(new ImageData(array, 256, 144), 0, 0);

    if(interNoiseThreeshold < 10) {
        interNoiseThreeshold += 0.25;
        requestAnimationFrame(drawInterNoise);
    } else {
        noise.fillStyle = "#000000";
        noise.fillRect(0, 0, 256, 144);
        cont.style.opacity = "1";
        cont.style.zIndex = "3";
        cont.onclick = () => {
            cont.style.opacity = "0";
            cont.style.zIndex = "-1";
            noiseCanvas.style.zIndex = (-1).toString();
            noiseCanvas.style.opacity = (0).toString();
            player.dead = false;
            State.ultra3.camera.position.x = 0;
            State.ultra3.camera.position.y = 50;
            State.ultra3.camera.position.z = 0;
            State.ultra3.scene.meshes[CONFIG.PLAYER.MESH_INDEX].entity.health = 100;
            State.ultra3.paused = false;
            State.ultra3.canvas.style.filter = "none";
            opacity = 0;
            noiseThreeshold = 255;
            interNoiseThreeshold = 4;
            health.innerHTML = "Health: 100";
            health.style.color = "white";
        }
    }
}