let _ = require('lodash');
let ethers = require('ethers');
let CreateIDProxy = require('./../createIDProxy.js');
let ExecuterService = require('./../executeService.js');

let createProxyService = new CreateIDProxy();


let ProxyController = (function() {
    let createIDProxy = async function(req, res) {
        try{
            let reqBody = req.body;
            const body = _.pick(reqBody, ['addressHash', 'addressSig'])
            let idAddress = await createIdentityProxy(body.addressHash, body.addressSig)
            res.send(idAddress)
        } catch(e){
            console.log(e)
            res.status(400).send(e)
        }

    }

    async function createIdentityProxy(addressHash, addressSig) {
        return await createProxyService.createProxy(addressHash, addressSig);
    }


    let execute = async function(req, res) {
        try{
            const body = _.pick(req.body, ['identityProxyAddress', 'serviceContractAddress', 'reward', 'wei', 'data', 'signedDataHash']);
            let executerService = new ExecuterService(body.identityProxyAddress);
            let result = await executerService.execute(body.serviceContractAddress, body.reward, body.wei, body.data, body.signedDataHash)
            res.send(result);
        } catch(e){
            res.status(400).send(e)
            console.log(e)
        }
    }
    
    return {
        createIDProxy: createIDProxy,
        execute: execute
    }
    
})()


module.exports = ProxyController;