const IdentityProxy = require('../build/IdentityProxy.json');

const ethers = require('ethers');
const providers = ethers.providers;
const Wallet = ethers.Wallet;
const utils = ethers.utils;

let serviceAddress = '0x4b46f8F621E1E7E89966babb2Ff4B52244aFff91'

var provider;

async function executeService(identityProxyAddress, serviceContractAddress, reward, wei, data, signedDataHash, deployerWallet){
	provider = new providers.JsonRpcProvider('http://localhost:8545', providers.networks.unspecified);
	deployerWallet.provider = provider
	const identityContract = new ethers.Contract(identityProxyAddress, IdentityProxy.abi, deployerWallet);
	let transaction = await identityContract.execute(serviceContractAddress, reward, wei, data, signedDataHash);
	return true;

}

module.exports = executeService;