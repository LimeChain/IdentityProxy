let IdentityProxy = require('../build/IdentityProxy.json');
let ethers = require('ethers');
let Wallet = ethers.Wallet;
let keys = require('./config/keys.js')
let config = require('./config/config.js');

class ExecuteService {
	
	constructor(identityProxyAddress) {
		this.deployerWallet = new Wallet(keys.deployerPrivateKey)
		this.deployerWallet.provider = config.provider;
		this.identityContract = new ethers.Contract(identityProxyAddress, IdentityProxy.abi, this.deployerWallet);
	}

	async execute(serviceContractAddress, reward, wei, data, signedDataHash){
		let transaction = await this.identityContract.execute(serviceContractAddress, reward, wei, data, signedDataHash);
		return transaction.hash
	}
}

module.exports = ExecuteService;