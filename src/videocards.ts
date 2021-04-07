/*
This file is a list of all cards, which you can play from 30 FPS
*/

export function isCompatible(renderer: string): boolean {
    if(renderer.match("GeForce GTX 960") !== null) {
        return true;
    }
    if(renderer.match("GeForce GTX 970") !== null) { // My card ( 4 GB ). Goes 50-60 FPS. Sometimes goes 40 FPS
        return true;
    }
    if(renderer.match("GeForce GTX 980") !== null) {
        return true;
    }
    if(renderer.match("GeForce GTX 1030") !== null) {
        return true;
    }
    if(renderer.match("GeForce GTX 1050") !== null) {
        return true;
    }
    if(renderer.match("GeForce GTX 1060") !== null) { // Also tested GPU ( 6 GB ). Results is very good. Always 60 FPS.
        return true;
    }
    if(renderer.match("GeForce GTX 1070") !== null) {
        return true;
    }
    if(renderer.match("GeForce GTX 1080") !== null) {
        return true;
    }
    if(renderer.match("GeForce GTX 1650") !== null) {
        return true;
    }
    if(renderer.match("GeForce GTX 1660") !== null) {
        return true;
    }
    if(renderer.match("GeForce GTX 2060") !== null) {
        return true;
    }
    if(renderer.match("GeForce GTX 2070") !== null) {
        return true;
    }
    if(renderer.match("GeForce GTX 2080") !== null) {
        return true;
    }
    if(renderer.match("GeForce GTX 3060") !== null) {
        return true;
    }
    if(renderer.match("GeForce GTX 3070") !== null) {
        return true;
    }
    if(renderer.match("GeForce GTX 3080") !== null) {
        return true;
    }
    if(renderer.match("GeForce GTX 3090") !== null) {
        return true;
    }

    return false;
}