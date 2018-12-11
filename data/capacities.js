const Joi = require('joi');

const schema = Joi.object({
    id: Joi.number(),
    label: Joi.string().required(),
});

const getRoutes = (db) => [{
    method: 'GET',
    path: '/capacities',
    handler: function (request, reply) {
        return reply(db.capacities);
    },
    config: {
        tags: ['api'],
        response: {
            schema: Joi.array().items(schema)
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
            schema: schema
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
            payload: schema
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
            payload: schema
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
}];

const getCapacities = () => [
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
    },
    {
        id: 4,
        label: 'Telepath'
    }
];

module.exports = {getRoutes, getCapacities, schema};
