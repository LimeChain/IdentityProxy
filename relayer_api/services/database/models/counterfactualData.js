const mongoose = require('mongoose');
const validator = require('validator');

const CounterfactualDataSchema = new mongoose.Schema({
    counterfactualContractAddress: {
        type: String,
        required: true,
        minlength: 42,
        trim: true,
        unique: true
    },
    fullData: {
        type: Object,
        required: true,
        trim: true
    },
    status: {
        type: String,
        required: true,
        trim: true,
        validate: {
            validator: (value) => {
                return validator.isIn(value, ['deployed', 'notDeployed'])
            },
            message: '{VALUE} is not valid status. Choose between "deployed" and "notDeployed"'
        }
    }
})

const CounterfactualSchema = mongoose.model("CounterfactualData", CounterfactualDataSchema)

module.exports = CounterfactualSchema