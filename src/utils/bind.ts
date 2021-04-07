import State from "../global";

export default function bind(keyCode: number, callback: Function) {
    State.binds[keyCode] = callback;
}