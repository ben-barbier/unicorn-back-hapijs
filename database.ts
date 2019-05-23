import * as socketIo from 'socket.io';
import { Server } from 'socket.io';

export class DB {
    private _capacities = [];
    private _unicorns = [];

    get capacities() {
        return this._capacities;
    }

    set capacities(capacities) {
        this._capacities = capacities;
        this.io.of('/capacities').emit('capacities', capacities);
    };

    get unicorns() {
        return this._unicorns;
    };

    set unicorns(unicorns) {
        this._unicorns = unicorns;
        this.io.of('/unicorns').emit('unicorns', unicorns);
    };

    constructor(private io: Server) {
    };
}
