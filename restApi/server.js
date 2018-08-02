const express = require('express');
const ethers = require('ethers');
const bodyParser = require('body-parser');
const _ = require('lodash');
const handlebars = require('./config/handlebars');

let createIDProxy = require('./../scripts/createProxy.js');
let executeService = require('./../scripts/executeService.js');
let {HashParams} = require('./HashParams');
let {ServiceParams} = require('./ServiceParams');
let {mongoose} = require('./mongoose.js')

let app = express();
const port = 8080;

const Wallet = ethers.Wallet;
let deployerWallet = new Wallet('0x7ab741b57e8d94dd7e1a29055646bafde7010f38a900f55bbd7647880faa6ee8')

app.use(bodyParser.json());
handlebars.handlebarInit(app);

app.get('/', (request, response) => {
    response.render('partials/home');
});


app.post('/sign', async (req,res) => {
    try{
        const body = _.pick(req.body, ['addressHash', 'addressSig'])
        const params = await new HashParams(body);
        const hashParams = await params.save()
        let idAddress = await create(hashParams.addressHash, hashParams.addressSig)
        res.send(idAddress)
    } catch(e){
        console.log(e)
        res.status(400).send(e)
    }
    
})

async function create(addressHash, addressSig) {
    let ectoolsAddress = '0x9eD274314f0fB37837346C425D3cF28d89ca9599';
    return await createIDProxy(addressHash, addressSig, deployerWallet.privateKey, ectoolsAddress);
}

app.post('/execute', async(req, res) => {
    try{
        const body = _.pick(req.body, ['identityProxyAddress', 'serviceContractAddress', 'reward', 'wei', 'data', 'signedDataHash']);
        const params = await new ServiceParams(body);
        const serviceParams = await params.save()
        let result = await executeService(serviceParams.identityProxyAddress, serviceParams.serviceContractAddress, serviceParams.reward, serviceParams.wei, serviceParams.data, serviceParams.signedDataHash, deployerWallet)
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