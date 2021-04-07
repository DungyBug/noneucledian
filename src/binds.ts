import State from "./global";
import { bind } from "./utils";

bind(66, () => State.ultra3.freeze()); // B
bind(67, () => {
    State.noclip = !State.noclip;
}); // B