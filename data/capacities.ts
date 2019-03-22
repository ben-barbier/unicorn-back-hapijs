import * as Joi from 'joi';

const schema = Joi.object({
    id: Joi.number(),
    label: Joi.string().required(),
});

const getRoutes = db => [{
    method: 'GET',
    path: '/capacities',
    handler: (request, h) => {
        return db.capacities;
    },
    options: {
        tags: ['api'],
        response: {
            schema: Joi.array().items(schema),
        },
    },
}, {
    method: 'GET',
    path: '/capacities/{capacityId}',
    handler: (request, h) => {
        const capacity = db.capacities.find(c => c.id === +request.params.capacityId);
        if (capacity) {
            return capacity;
        }
        return h.response(`Capacity '${request.params.capacityId}' not found`).code(404);
    },
    options: {
        tags: ['api'],
        response: {
            schema,
        },
    },
}, {
    method: 'POST',
    path: '/capacities',
    handler: (request, h) => {
        const newCapacity = {
            ...request.payload,
            id: db.capacities.reduce((acc, val) => (val.id > acc) ? val.id : acc, 1) + 1,
        };
        db.capacities.push(newCapacity);
        return h.response(newCapacity).code(201);
    },
    options: {
        tags: ['api'],
        validate: {
            payload: schema,
        },
    },
}, {
    method: 'PUT',
    path: '/capacities/{capacityId}',
    handler: (request, h) => {
        const updatedCapacity = request.payload;
        if (updatedCapacity.id !== +request.params.capacityId) {
            return h.response('Incoherent capacity ID between request param and payload').code(500);
        }
        if (!db.capacities.some(c => c.id === updatedCapacity.id)) {
            return h.response(`Capacity '${request.params.capacityId}' not found`).code(404);
        }
        db.capacities = db.capacities.filter(c => c.id !== updatedCapacity.id);
        db.capacities.push(updatedCapacity);
        return updatedCapacity;
    },
    options: {
        tags: ['api'],
        validate: {
            payload: schema,
        },
    },
}, {
    method: 'DELETE',
    path: '/capacities/{capacityId}',
    handler: (request, h) => {
        if (!db.capacities.some(c => c.id === +request.params.capacityId)) {
            return h.response(`Capacity '${request.params.capacityId}' not found`).code(404);
        }
        db.capacities = db.capacities.filter(c => c.id !== +request.params.capacityId);
        return h.response();
    },
    options: {
        tags: ['api'],
    },
}];

const getCapacities = () => [
    {
        id: 1,
        label: 'Strong',
    },
    {
        id: 2,
        label: 'Speed',
    },
    {
        id: 3,
        label: 'Sweet',
    },
    {
        id: 4,
        label: 'Telepath',
    },
];

module.exports = { getRoutes, getCapacities, schema };
