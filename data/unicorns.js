const Joi = require('joi');

exports.schema = Joi.object({
    id: Joi.number(),
    name: Joi.string().required(),
    birthyear: Joi.number().integer().min(1900).max(new Date().getFullYear()),
    weight: Joi.number(),
    photo: Joi.string().uri().allow(''),
    hobbies: Joi.array().required().items(Joi.string().trim()).min(0).unique(),
    capacities: Joi.array().items(Joi.number()).unique()
});

exports.getUnicorns = (server) => {
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
