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

const unicornSchema = Joi.object({
    id: Joi.number(),
    name: Joi.string().required(),
    birthyear: Joi.number().integer().min(1900).max(new Date().getFullYear()),
    weight: Joi.number(),
    photo: Joi.string().uri().allow(''),
    hobbies: Joi.array().required().items(Joi.string().trim()).min(0).unique(),
    capacities: Joi.array().unique()
});

const capacities = Joi.object({
    id: Joi.number(),
    label: Joi.string().required(),
});

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
    host: '0.0.0.0',
    port: process.env.PORT || '3000'
});

server.register([
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
        db.capacities = [
            {
                id: 1,
                label: 'Strong'
            },
            {
                id: 2,
                label: 'Speed'
            },
            {
                id: 3,
                label: 'Sweet'
            }
        ];
        db.unicorns = [
            {
                id: 1,
                name: 'Baby',
                birthyear: new Date().getFullYear(),
                weight: 10,
                photo: server.info.uri + '/unicorns/photos/unicorn-1.jpg',
                hobbies: ['Sleep', 'Cry'],
                capacities: [1, 2]
            },
            {
                id: 2,
                name: 'Dylan',
                birthyear: new Date().getFullYear() - 1,
                weight: 32,
                photo: server.info.uri + '/unicorns/photos/unicorn-2.jpg',
                hobbies: ['Coffee', 'Sing', 'Cinema'],
                capacities: [1]

            },
            {
                id: 3,
                name: 'Charly',
                birthyear: new Date().getFullYear() - 12,
                weight: 45,
                photo: server.info.uri + '/unicorns/photos/unicorn-3.png',
                hobbies: ['Read', 'Photography'],
                capacities: [2]
            },
            {
                id: 4,
                name: 'John',
                birthyear: new Date().getFullYear() - 17,
                weight: 54,
                photo: server.info.uri + '/unicorns/photos/unicorn-4.jpg',
                hobbies: ['Sport', 'Music'],
                capacities: []
            },
            {
                id: 5,
                name: 'Freddy',
                birthyear: new Date().getFullYear() - 49,
                weight: 90,
                photo: server.info.uri + '/unicorns/photos/unicorn-5.jpg',
                hobbies: ['Cut wood', 'Hockey'],
                capacities: [3]
            },
            {
                id: 6,
                name: 'Cindy',
                birthyear: new Date().getFullYear() - 15,
                weight: 46,
                photo: server.info.uri + '/unicorns/photos/unicorn-6.jpg',
                hobbies: ['Vampire Diaries', 'Gossip Girl', 'Justin Bieber', 'One Direction'],
                capacities: [1, 2, 3]
            }
        ];
        console.log('Server running at:', server.info.uri);
    });
});

// Add routes
server.route([{
    method: 'GET',
    path: '/capacities',
    handler: function (request, reply) {
        return reply(db.capacities);
    },
    config: {
        tags: ['api'],
        response: {
            schema: Joi.array().items(capacities)
        }
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
            schema: Joi.array().items(unicornSchema)
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
            schema: unicornSchema
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
        return reply(newUnicorn);
    },
    config: {
        tags: ['api'],
        validate: {
            payload: unicornSchema
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
            payload: unicornSchema
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
