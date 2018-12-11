const Joi = require('joi');

const schema = Joi.object({
    id: Joi.number(),
    name: Joi.string().required(),
    birthyear: Joi.number().integer().min(1900).max(new Date().getFullYear()),
    weight: Joi.number(),
    photo: Joi.string().uri().allow(''),
    hobbies: Joi.array().required().items(Joi.string().trim()).min(0).unique(),
    capacities: Joi.array().items(Joi.number()).unique()
});

const getRoutes = (db) => [{
    method: 'GET',
    path: '/unicorns',
    handler: function (request, reply) {
        return reply(db.unicorns);
    },
    config: {
        tags: ['api'],
        response: {
            schema: Joi.array().items(schema)
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
            schema: schema
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
            payload: schema
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
            payload: schema
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
}];

const getUnicorns = (server) => {
    return [
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
};

module.exports = {getRoutes, getUnicorns, schema};
