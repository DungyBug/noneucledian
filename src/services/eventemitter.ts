export interface EventEmitter {
    events: any;
};

export class EventEmitter {
    constructor() {
        this.events = {};
    }

    on(name: string, callback: Function) {
        if(!this.events.hasOwnProperty(name)) {
            this.events[name] = [];
        }

        this.events[name].push(callback);
    }

    emit(name: string, ...params: any) {
        if (this.events[name]) {
            for(let i = 0; i < this.events[name].length; i++) {
                this.events[name][i](params);
            }
        }
    }

    off(name: string, callback: Function) {
        if(this.events.hasOwnProperty(name)) {
            this.events[name] = this.events[name].filter(handler => handler !== callback);
        }
    }
}