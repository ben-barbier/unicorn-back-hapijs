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

// Data (init)
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

server.connection({
    host: '127.0.0.1',
    port: process.env.PORT || '3000',
    labels: ['api'],
});

server.connection({
    host: '127.0.0.1',
    port: process.env.PORT + 1 || '3001',
    labels: ['count-unicorns'],
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
server.select('api').route([{
    method: 'GET',
    path: '/capacities',
    handler: function (request, reply) {
        return reply(db.capacities);
    },
    config: {
        tags: ['api'],
        response: {
            schema: Joi.array().items(capacities.schema)
        }
    }
}, {
    method: 'GET',
    path: '/capacities/{capacityId}',
    handler: function (request, reply) {
        const capacity = _(db.capacities).find({id: +request.params.capacityId});
        if (capacity) {
            return reply(capacity);
        } else {
            return reply(`Capacity '${request.params.capacityId}' not found`).code(404);
        }
    },
    config: {
        tags: ['api'],
        response: {
            schema: capacities.schema
        }
    }
}, {
    method: 'POST',
    path: '/capacities',
    handler: function (request, reply) {
        let newCapacity = request.payload;
        newCapacity.id = (_(db.capacities).map('id').max() || 0) + 1;
        db.capacities.push(newCapacity);
        return reply(newCapacity).code(201);
    },
    config: {
        tags: ['api'],
        validate: {
            payload: capacities.schema
        }
    }
}, {
    method: 'PUT',
    path: '/capacities/{capacityId}',
    handler: function (request, reply) {
        const updatedCapacity = request.payload;
        if (updatedCapacity.id !== +request.params.capacityId) {
            return reply('Incoherent capacity ID between request param and payload').code(500);
        }
        if (!_(db.capacities).find({id: updatedCapacity.id})) {
            return reply(`Capacity '${request.params.capacityId}' not found`).code(404);
        }
        db.capacities = _(db.capacities).filter((capacity) => capacity.id !== updatedCapacity.id).value();
        db.capacities.push(updatedCapacity);
        return reply(updatedCapacity);
    },
    config: {
        tags: ['api'],
        validate: {
            payload: capacities.schema
        }
    }
}, {
    method: 'DELETE',
    path: '/capacities/{capacityId}',
    handler: function (request, reply) {
        if (!_(db.capacities).find({id: +request.params.capacityId})) {
            return reply(`Capacity '${request.params.capacityId}' not found`).code(404);
        }
        db.capacities = _(db.capacities).filter((capacity) => capacity.id !== +request.params.capacityId).value();
        return reply();
    },
    config: {
        tags: ['api']
    }
}, {
    method: 'GET',
    path: '/unicorns',
    handler: function (request, reply) {
        return reply(db.unicorns);
    },
    config: {
        tags: ['api'],
        response: {
            schema: Joi.array().items(unicorns.schema)
        }
    }
}, {
    method: 'GET',
    path: '/unicorns/{unicornId}',
    handler: function (request, reply) {
        const unicorn = _(db.unicorns).find({id: +request.params.unicornId});
        if (unicorn) {
            return reply(unicorn);
        } else {
            return reply(`Unicorn '${request.params.unicornId}' not found`).code(404);
        }
    },
    config: {
        tags: ['api'],
        response: {
            schema: unicorns.schema
        }
    }
}, {
    // Add unicorns photos
    method: 'GET',
    path: '/unicorns/{param*}',
    handler: {
        directory: {
            path: '.',
            redirectToSlash: true,
            index: true,
        }
    }
}, {
    method: 'POST',
    path: '/unicorns',
    handler: function (request, reply) {
        let newUnicorn = request.payload;
        newUnicorn.id = (_(db.unicorns).map('id').max() || 0) + 1;
        db.unicorns.push(newUnicorn);
        return reply(newUnicorn).code(201);
    },
    config: {
        tags: ['api'],
        validate: {
            payload: unicorns.schema
        }
    }
}, {
    method: 'PUT',
    path: '/unicorns/{unicornId}',
    handler: function (request, reply) {
        const updatedUnicorn = request.payload;
        if (updatedUnicorn.id !== +request.params.unicornId) {
            return reply('Incoherent unicorn ID between request param and payload').code(500);
        }
        if (!_(db.unicorns).find({id: updatedUnicorn.id})) {
            return reply(`Unicorn '${request.params.unicornId}' not found`).code(404);
        }
        db.unicorns = _(db.unicorns).filter((unicorn) => unicorn.id !== updatedUnicorn.id).value();
        db.unicorns.push(updatedUnicorn);
        return reply(updatedUnicorn);
    },
    config: {
        tags: ['api'],
        validate: {
            payload: unicorns.schema
        }
    }
}, {
    method: 'DELETE',
    path: '/unicorns/{unicornId}',
    handler: function (request, reply) {
        if (!_(db.unicorns).find({id: +request.params.unicornId})) {
            return reply(`Unicorn '${request.params.unicornId}' not found`).code(404);
        }
        db.unicorns = _(db.unicorns).filter((unicorn) => unicorn.id !== +request.params.unicornId).value();
        return reply();
    },
    config: {
        tags: ['api']
    }
}]);

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
