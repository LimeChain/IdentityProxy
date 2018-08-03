const IdentityProxy = require('../build/IdentityProxy.json');

const ethers = require('ethers');
const providers = ethers.providers;
const Wallet = ethers.Wallet;
const utils = ethers.utils;
const keys = require('./../restApi/config/keys.js')
const settings = require('./../restApi/config/settings.js');

let serviceAddress = keys.serviceAddress;

function getNodeProvider() {
	if(settings.network !== "local"){
		return new ethers.providers.InfuraProvider(settings.network, settings.infuraApikey);
	}
	return new ethers.providers.JsonRpcProvider("http://localhost:8545/");
}

async function executeService(identityProxyAddress, serviceContractAddress, reward, wei, data, signedDataHash, deployerWallet){
	let provider = getNodeProvider()
	deployerWallet.provider = provider
	const identityContract = new ethers.Contract(identityProxyAddress, IdentityProxy.abi, deployerWallet);
	let transaction = await identityContract.execute(serviceContractAddress, reward, wei, data, signedDataHash);
	return transaction.hash
}

module.exports = executeService;