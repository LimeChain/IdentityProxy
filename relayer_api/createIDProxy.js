let IdentityProxy = require('../build/IdentityProxy.json');
let ethers = require('ethers');
let Wallet = ethers.Wallet;
let keys = require('./config/templates/keys.js');
let config = require('./config/config.js');


class CreateIDProxy {
	constructor(){
		this.deployerWallet = new Wallet(keys.deployerPrivateKey)
		this.deployerWallet.provider = config.provider
	}

	async createProxy(addressHash, addressSig) {

		let deployer = config.deployer;
		let libraries = {
			"ECTools": keys.libraryAddress
		}
	
		let result = await deployer.deploy(IdentityProxy, libraries, addressHash, addressSig);
		let proxyContract = result.contract;
	
		return proxyContract;
	}	
}

module.exports = CreateIDProxy;
