const Joi = require('joi');

exports.schema = Joi.object({
    id: Joi.number(),
    label: Joi.string().required(),
});

exports.getCapacities = () => [
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
