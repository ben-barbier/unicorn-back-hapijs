'use strict';

// Hapi
const Hapi = require('hapi');
const Joi = require('joi');
const Path = require('path');

// Swagger
const Inert = require('inert');
const Vision = require('vision');
const HapiSwagger = require('hapi-swagger');
const Pack = require('./package');

// Utils
const _ = require('lodash');
const portfinder = require('portfinder');

// Data
const db = {};
const capacities = require('./data/capacities');
const unicorns = require('./data/unicorns');

const server = new Hapi.Server({
    connections: {
        routes: {
            cors: true,
            // Needed to serve static unicorn photos
            files: {
                relativeTo: Path.join(__dirname, 'resources')
            }
        }
    }
});

portfinder.basePort = 3000;
portfinder.getPortPromise().then((port) => {
    server.connection({
        host: '127.0.0.1',
        port: process.env.PORT || port,
        labels: ['api'],
    });

    server.select('api').register([
        Inert,
        Vision,
        {
            'register': HapiSwagger,
            'options': {
                info: {
                    'title': Pack.name + ' API Documentation',
                    'version': Pack.version,
                }
            }
        }], (err) => {
        // Start the server
        server.start((err) => {
            if (err) {
                throw err;
            }
            db.capacities = capacities.getCapacities();
            db.unicorns = unicorns.getUnicorns(server.select('api'));
            console.log('API                 running at:', server.select('api').info.uri);
            console.log('Socket              running at:', server.select('count-unicorns').info.uri);
            console.log('API documentation available at:', server.select('api').info.uri + '/documentation');
        });
    });

    // Add routes
    server.select('api').route([
        ...unicorns.getRoutes(db),
        ...capacities.getRoutes(db)
    ]);

});

portfinder.basePort = 3100;
portfinder.getPortPromise().then((port) => {
    server.connection({
        host: '127.0.0.1',
        port: process.env.PORT + 1 || port,
        labels: ['count-unicorns'],
    });

    // Socket.io
    const io = require('socket.io')(server.select('count-unicorns').listener);

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

});
