const _ = require('lodash');
const CreateService = require('./../services/createService.js');
const ExecuteService = require('./../services/executeService.js');

const createServiceInstance = new CreateService();
const executeServiceInstance = new ExecuteService();

const ProxyController = (function () {
    const create = async function (req, res) {
        try {
            const reqBody = req.body;
            const body = _.pick(reqBody, ['addressHash', 'addressSig'])
            const result = await createServiceInstance.createProxy(body.addressHash, body.addressSig);
            res.send(result)
        } catch (e) {
            console.log(e)
            res.status(400).send(e)
        }

    }

    const deploy = async function (req, res) {
        try {
            const reqBody = req.body;
            const body = _.pick(reqBody, ['identityContract'])
            const result = await createServiceInstance.deployProxy(body.identityContract);
            res.send(result)
        } catch (e) {
            console.log(e)
            res.status(400).send(e)
        }

    }

    const execute = async function (req, res) {
        try {
            const body = _.pick(req.body, ['identityAddress', 'serviceContractAddress', 'reward', 'wei', 'data', 'signedDataHash']);

            const result = await executeServiceInstance.execute(body.identityAddress, body.serviceContractAddress, body.reward, body.wei, body.data, body.signedDataHash)
            res.send(result);
        } catch (e) {
            res.status(400).send(e)
            console.log(e)
        }
    }

    return {
        create,
        deploy,
        execute
    }

})()


module.exports = ProxyController;