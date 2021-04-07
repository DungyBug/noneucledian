export class State {
    static noclip = false;
    static keys = [];
    static binds = [];
    static lastShot = 0;
    static lastFakeShot = 0;
    static ultra3: any;
    static shaderMaterial: any;
    static map = {
        have_ceiling: false,
        have_walls: false
    };
    static planetsArray: Array<any>;
}

State.planetsArray = [];

export default State;