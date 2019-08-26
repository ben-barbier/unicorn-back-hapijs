import * as Joi from 'joi';

const schema = {
    name: Joi.string().required(),
    birthyear: Joi.number().required().integer().min(1800).max(new Date().getFullYear()),
    weight: Joi.number().required(),
    photo: Joi.string().required().uri().allow(''),
    hobbies: Joi.array().required().items(Joi.string().trim()).min(0).unique(),
    capacities: Joi.array().required().items(Joi.number()).min(0).unique(),
};

const postJoiSchema = Joi.object({
    ...schema,
    id: Joi.forbidden(),
});

const joiSchema = Joi.object({
    ...schema,
    id: Joi.number().required(),
});

const getRoutes = db => [{
    method: 'GET',
    path: '/unicorns',
    handler: (request, h) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(h.response(db.unicorns));
            }, 180);
        });
    },
    options: {
        tags: ['api'],
        response: {
            schema: Joi.array().items(joiSchema),
        },
    },
}, {
    method: 'GET',
    path: '/unicorns/{unicornId}',
    handler: (request, h) => {
        const unicorn = db.unicorns.find(u => u.id === +request.params.unicornId);
        if (unicorn) {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve(unicorn);
                }, 180);
            });
        }
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(h.response(`Unicorn '${request.params.unicornId}' not found`).code(404));
            }, 180);
        });
    },
    options: {
        tags: ['api'],
        response: {
            schema: joiSchema,
        },
    },
}, {
    method: 'GET',
    path: '/unicorns/photos/{photoUrl*}',
    handler: (request, h) => {
        return h.file(`../resources/photos/${request.params.photoUrl}`);
    }
}, {
    method: 'POST',
    path: '/unicorns',
    handler: (request, h) => {
        const newUnicorn = {
            ...request.payload,
            id: db.unicorns.reduce((acc, val) => (val.id > acc) ? val.id : acc, 1) + 1
        };
        db.unicorns.push(newUnicorn);
        return h.response(newUnicorn).code(201);
    },
    options: {
        tags: ['api'],
        validate: {
            payload: postJoiSchema,
        },
    },
}, {
    method: 'PUT',
    path: '/unicorns/{unicornId}',
    handler: (request, h) => {
        const updatedUnicorn = request.payload;
        if (updatedUnicorn.id !== +request.params.unicornId) {
            return h.response('Incoherent unicorn ID between request param and payload').code(400);
        }
        if (!db.unicorns.some(u => u.id === updatedUnicorn.id)) {
            return h.response(`Unicorn '${request.params.unicornId}' not found`).code(404);
        }
        db.unicorns = db.unicorns.filter(u => u.id !== updatedUnicorn.id);
        db.unicorns.push(updatedUnicorn);
        return updatedUnicorn;
    },
    options: {
        tags: ['api'],
        validate: {
            payload: joiSchema,
        },
    },
}, {
    method: 'DELETE',
    path: '/unicorns/{unicornId}',
    handler: (request, h) => {
        if (!db.unicorns.some(u => u.id === +request.params.unicornId)) {
            return h.response(`Unicorn '${request.params.unicornId}' not found`).code(404);
        }
        db.unicorns = db.unicorns.filter(u => u.id !== +request.params.unicornId);
        return h.response().code(204);
    },
    options: {
        tags: ['api'],
    },
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
            capacities: [1, 2],
        },
        {
            id: 2,
            name: 'Dylan',
            birthyear: new Date().getFullYear() - 1,
            weight: 32,
            photo: server.info.uri + '/unicorns/photos/unicorn-2.jpg',
            hobbies: ['Coffee', 'Sing', 'Cinema'],
            capacities: [1],

        },
        {
            id: 3,
            name: 'Charly',
            birthyear: new Date().getFullYear() - 12,
            weight: 45,
            photo: server.info.uri + '/unicorns/photos/unicorn-3.png',
            hobbies: ['Read', 'Photography'],
            capacities: [2],
        },
        {
            id: 4,
            name: 'John',
            birthyear: new Date().getFullYear() - 17,
            weight: 54,
            photo: server.info.uri + '/unicorns/photos/unicorn-4.jpg',
            hobbies: ['Sport', 'Music'],
            capacities: [],
        },
        {
            id: 5,
            name: 'Freddy',
            birthyear: new Date().getFullYear() - 49,
            weight: 90,
            photo: server.info.uri + '/unicorns/photos/unicorn-5.jpg',
            hobbies: ['Cut wood', 'Hockey'],
            capacities: [3],
        },
        {
            id: 6,
            name: 'Cindy',
            birthyear: new Date().getFullYear() - 15,
            weight: 46,
            photo: server.info.uri + '/unicorns/photos/unicorn-6.jpg',
            hobbies: ['Vampire Diaries', 'Gossip Girl', 'Justin Bieber', 'One Direction'],
            capacities: [1, 2, 3],
        },
        {
            id: 7,
            name: 'Hervé',
            birthyear: new Date().getFullYear() - 9,
            weight: 21,
            photo: server.info.uri + '/unicorns/photos/unicorn-7.jpg',
            hobbies: ['Drink', 'Football', 'cycling'],
            capacities: [3],
        },
        {
            id: 8,
            name: 'Christian',
            birthyear: new Date().getFullYear() - 35,
            weight: 75,
            photo: server.info.uri + '/unicorns/photos/unicorn-8.png',
            hobbies: ['Horsing', 'Gymnastic', 'Parties'],
            capacities: [2, 4],
        },
        {
            id: 9,
            name: 'Gandalf',
            birthyear: new Date().getFullYear() - 150,
            weight: 65,
            photo: server.info.uri + '/unicorns/photos/unicorn-9.png',
            hobbies: ['Dragons', 'Magic'],
            capacities: [4],
        },
        {
            id: 10,
            name: 'Donatello, Raphael, Michelangelo & leonardo',
            birthyear: new Date().getFullYear() - 21,
            weight: 300,
            photo: server.info.uri + '/unicorns/photos/unicorn-10.jpg',
            hobbies: ['Pizzas', 'Martial arts'],
            capacities: [1, 2],
        },
    ];
};

module.exports = { getRoutes, getUnicorns };
