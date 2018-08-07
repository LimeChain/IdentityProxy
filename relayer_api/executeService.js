let IdentityProxy = require('../build/IdentityProxy.json');
let ethers = require('ethers');
let providers = ethers.providers;
let Wallet = ethers.Wallet;
let keys = require('./config/keys.js')
let config = require('./config/config.js');
let serviceAddress = keys.serviceAddress;


class ExecuteService {
	
	constructor() {
		this.provider = config.provider;
		this.deployerWallet = new Wallet(keys.deployerPrivateKey)
		this.deployerWallet.provider = this.provider
	}

	async executeService(identityProxyAddress, serviceContractAddress, reward, wei, data, signedDataHash){
		let identityContract = new ethers.Contract(identityProxyAddress, IdentityProxy.abi, this.deployerWallet);
		let transaction = await identityContract.execute(serviceContractAddress, reward, wei, data, signedDataHash);
		return transaction.hash
	}
}

module.exports = ExecuteService;