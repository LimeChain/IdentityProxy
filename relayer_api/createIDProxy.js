let etherlime = require('etherlime');
let IdentityProxy = require('../build/IdentityProxy.json');
let ethers = require('ethers');
let Wallet = ethers.Wallet;
let keys = require('./config/keys.js');
let config = require('./config/config.js');


class CreateIDProxy {
	constructor(){
		this.provider = config.provider;
		this.deployerWallet = new Wallet(keys.deployerPrivateKey)
		this.deployerWallet.provider = this.provider
	}

	async createProxy(addressHash, addressSig) {

		let deployer = new etherlime.EtherlimeGanacheDeployer(keys.deployerPrivateKey);
		let libraries = {
			"ECTools": keys.libraryAddress
		}
	
		let result = await deployer.deploy(IdentityProxy, libraries, addressHash, addressSig);
		let proxyContract = result.contract;
	
		return proxyContract;
	}	
}

module.exports = CreateIDProxy;
