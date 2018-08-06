const express = require('express');
const ethers = require('ethers');
const bodyParser = require('body-parser');
const _ = require('lodash');
const handlebars = require('./config/handlebars');
const port = require('./config/settings.js').server.port;
const keys = require('./config/keys.js')

let createIDProxy = require('./createIDProxy.js');
let executeService = require('./executeService.js');

let app = express();


const Wallet = ethers.Wallet;
let deployerWallet = new Wallet(keys.deployerPrivateKey)

app.use(bodyParser.json());
handlebars.handlebarInit(app);

app.get('/', (request, response) => {
    response.render('partials/home');
});


app.post('/create', async (req,res) => {
    try{
        const body = _.pick(req.body, ['addressHash', 'addressSig'])
        let idAddress = await createIdentityProxy(body.addressHash, body.addressSig)
        res.send(idAddress)
    } catch(e){
        console.log(e)
        res.status(400).send(e)
    }
    
})

async function createIdentityProxy(addressHash, addressSig) {
    let ectoolsAddress = keys.libraryAddress;
    return await createIDProxy(addressHash, addressSig, deployerWallet.privateKey, ectoolsAddress);
}

app.post('/execute', async(req, res) => {
    try{
        const body = _.pick(req.body, ['identityProxyAddress', 'serviceContractAddress', 'reward', 'wei', 'data', 'signedDataHash']);
        let result = await executeService(body.identityProxyAddress, body.serviceContractAddress, body.reward, body.wei, body.data, body.signedDataHash, deployerWallet)
        res.send(result);
    } catch(e){
        res.status(400).send(e)
        console.log(e)
    }
})

app.listen(port, () => {
    console.log('Started up at port: ', port)
});

module.exports = {app}