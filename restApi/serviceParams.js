const mongoose = require('mongoose');
const _ = require('lodash');

let ServiceParams = mongoose.model('ServiceParams', {
    identityProxyAddress:{
        type: String,
        required:[true, "The address of the identity proxy contract is required"],
        trim: true
    },
    serviceContractAddress: {
        type: String,
        required:[true, "The address of the service contract is required"],
        trim: true
    },
    reward:{
        type: Number,
        required: [true, 'The reward to the relayer is required'],
    },
    wei:{
        type: Number,
    },
    data: {
        type: String,
        required: [true, 'The service data is required'],
        trim: true
    },
    signedDataHash: {
        type: String,
        required: [true, 'The signed data hash is required'],
        trim: true
    }
})

module.exports = {ServiceParams};
