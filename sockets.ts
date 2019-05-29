import { DB } from './database';
import { Server } from 'socket.io';

export function initSockets (db: DB, io: Server) {

    let count = Math.floor(Math.random() * 1000);
    setInterval(() => {
        count = Math.round(Math.random() + 0.3) ? count + 1 : count - 1;
        console.log(count);
        io.of('/count').emit('count', count); // emit count on all initSockets
    }, 300);

    // Add socket.io connection to count unicorns (like WebSocket)
    io.of('/count').on('connection', (socket) => {

        console.log(`${socket.id} connected`);

        socket.on('ISawOne', () => count++);

    });

    io.of('/unicorns').on('connection', (socket) => {

        console.log(`${socket.id} connected`);

        socket.emit('unicorns', db.unicorns);

        socket.on('POST:unicorns', (unicorn) => {
            db.unicorns = [db.unicorns, unicorn];
            io.emit('unicorns', db.unicorns);
        });

        socket.on('PUT:unicorns', (unicorn) => {
            db.unicorns = [db.unicorns.filter(u => u.id !== unicorn.id), unicorn];
            io.emit('unicorns', db.unicorns);
        });

        socket.on('DELETE:unicorns', (unicorn) => {
            db.unicorns = db.unicorns.filter(u => u.id !== unicorn.id);
            io.emit('unicorns', db.unicorns);
        });

    });

    io.of('/capacities').on('connection', (socket) => {

        console.log(`${socket.id} connected`);

        socket.emit('capacities', db.capacities);

        socket.on('POST:capacities', (capacity) => {
            db.capacities = [db.capacities, capacity];
            io.emit('capacities', db.capacities);
        });

        socket.on('PUT:capacities', (capacity) => {
            db.capacities = [db.capacities.filter(u => u.id !== capacity.id), capacity];
            io.emit('capacities', db.capacities);
        });

        socket.on('DELETE:capacities', (capacity) => {
            db.capacities = db.capacities.filter(u => u.id !== capacity.id);
            io.emit('capacities', db.capacities);
        });

    });

}
