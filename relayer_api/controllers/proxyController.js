const _ = require('lodash');
const RelayerService = require('./../services/relayerService.js');

const relayerServiceInstance = new RelayerService();

const ProxyController = (function () {
    const create = async function (req, res) {
        try {
            const reqBody = req.body;
            const body = _.pick(reqBody, ['addressHash', 'addressSig'])
            const result = await relayerServiceInstance.createProxy(body.addressHash, body.addressSig);
            res.send(result)
        } catch (e) {
            console.log(e)
            res.status(400).send(e)
        }

    }

    const execute = async function (req, res) {
        try {
            const body = _.pick(req.body, ['identityAddress', 'serviceContractAddress', 'reward', 'wei', 'data', 'signedDataHash']);

            const result = await relayerServiceInstance.execute(body.identityAddress, body.serviceContractAddress, body.reward, body.wei, body.data, body.signedDataHash)
            res.send(result);
        } catch (e) {
            res.status(400).send(e)
            console.log(e)
        }
    }

    return {
        create,
        execute
    }

})()


module.exports = ProxyController;