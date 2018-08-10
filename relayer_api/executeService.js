let IIdentityContract = require('../build/IIdentityContract.json');
let ethers = require('ethers');
let Wallet = ethers.Wallet;
let keys = require('./config/templates/keys-templates.js')
let config = require('./config/config.js');

class ExecuteService {
	
	constructor(identityAddress) {
		this.deployerWallet = new Wallet(keys.deployerPrivateKey)
		this.deployerWallet.provider = config.provider;
		this.identityContract = new ethers.Contract(identityAddress, IIdentityContract.abi, this.deployerWallet);
	}

	async execute(serviceContractAddress, reward, wei, data, signedDataHash){
		let transaction = await this.identityContract.execute(serviceContractAddress, reward, wei, data, signedDataHash);
		return transaction.hash
	}
}

module.exports = ExecuteService;