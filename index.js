'use strict';

// Hapi
const Hapi = require('hapi');
const Path = require('path');

// Swagger
const Inert = require('inert'); // static file and directory handler module for hapi.
const Vision = require('vision');
const HapiSwagger = require('hapi-swagger');
const Pack = require('./package');

// Utils
const portfinder = require('portfinder');

// Data
const db = {};
const capacities = require('./data/capacities');
const unicorns = require('./data/unicorns');

(async () => {
    portfinder.basePort = 3000;
    const apiServerPort = await portfinder.getPortPromise();

    const apiServer = new Hapi.server({
        port: process.env.PORT || apiServerPort,
        host: 'localhost',
        routes: {
            cors: true,
            // Needed to serve static unicorn photos
            files: {
                relativeTo: Path.join(__dirname, 'resources')
            }
        },
    });

    await apiServer.register([
        Inert,
        Vision, {
            'plugin': HapiSwagger,
            'options': {
                info: {
                    'title': Pack.name + ' API Documentation',
                    'version': Pack.version,
                }
            }
        }
    ]);

    db.capacities = capacities.getCapacities();
    db.unicorns = unicorns.getUnicorns(apiServer);

    // Add routes
    apiServer.route([
        ...unicorns.getRoutes(db),
        ...capacities.getRoutes(db),
    ]);

    try {
        await apiServer.start({debug: {request: ['error']}});
    } catch (e) {
        console.log(e);
    }

    portfinder.basePort = 3100;
    const socketServerPort = await portfinder.getPortPromise();

    const socketServer = new Hapi.server({
        host: '127.0.0.1',
        port: process.env.PORT + 1 || socketServerPort,
        routes: {cors: true},
    });

    // Socket.io
    const io = require('socket.io')(socketServer.listener);

    // Add socket.io connection to count unicorns (like WebSocket)
    io.on('connection', (socket) => {

        console.log('user connected');
        let count = Math.floor(Math.random() * 1000);

        const sendNewCountValue = setInterval(() => {
            count = Math.round(Math.random() + 0.3) ? count + 1 : count - 1;
            console.log(count);
            socket.emit('count', count);
        }, 500);

        socket.on('disconnect', () => {
            console.log('user disconnected');
            clearInterval(sendNewCountValue);
        });

        socket.on('ISawOne', () => {
            count++;
        });

    });

    console.log('API                 running at:', apiServer.info.uri);
    console.log('Socket              running at:', socketServer.info.uri);
    console.log('API documentation available at:', apiServer.info.uri + '/documentation');

})();
