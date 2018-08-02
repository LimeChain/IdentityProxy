const mongoose = require('mongoose');
const _ = require('lodash');

let HashParams = mongoose.model('HashParams', {
    addressHash: {
        type: String,
        required: [true, 'The hash of the address is required'],
        trim: true
    },
    addressSig: {
        type: String,
        required: [true, 'The addressSig is required'],
        trim: true
    }
})

module.exports = {HashParams};