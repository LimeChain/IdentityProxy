const _ = require('lodash');
const RelayerService = require('./../services/relayerService.js');
let event = require('./../relayer.js')
let nodeConnection = require('../services/nodeConnection');

const relayerServiceInstance = new RelayerService();

const ProxyController = (function () {
    const create = async function (req, res) {
        try {
            const body = _.pick(req.body, ['addressHash', 'addressSig'])
            const result = await relayerServiceInstance.createProxy(body.addressHash, body.addressSig);
            nodeConnection.emitIdDataOnCreation(result);
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
            nodeConnection.emitIdDeployed(body.identityAddress)
            res.send(result);
        } catch (e) {
            res.status(400).send(e)
            console.log(e)
        }
    }

    const authorize = async function(req, res) {
        try{
            const body = _.pick(req.body, ['identityAddress', 'newSigner', 'addressHash', 'addressSig']);
            const result = await relayerServiceInstance.authorizeSigner(body.identityAddress, body.newSigner, body.addressHash, body.addressSig);
            res.send(result)
        } catch(e) {
            console.log(e)
            res.status(400).send(e)
        }
    }

    const removeAuthorization = async function(req, res) {
        try{
            const body = _.pick(req.body, ['identityAddress', 'signerToRemove', 'addressHash', 'addressSig']);
            const result = await relayerServiceInstance.removeAuthorizedSigner(body.identityAddress, body.signerToRemove, body.addressHash, body.addressSig)
            res.send(result)
        } catch(e){
            res.status(400).send(e)
            console.log(e)
        }
    }

    return {
        create,
        execute,
        authorize,
        removeAuthorization
    }

})()


module.exports = ProxyController;