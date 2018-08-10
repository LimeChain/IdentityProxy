let IdentityProxy = require('./../build/IdentityProxy.json');
let IIdentityContract = require('./../build/IIdentityContract.json');
let ethers = require('ethers');
let Wallet = ethers.Wallet;
let keys = require('./config/templates/keys-templates.js');
let config = require('./config/config.js');


class CreateIDProxy {
	constructor(){
		this.deployerWallet = new Wallet(keys.deployerPrivateKey)
		this.deployerWallet.provider = config.provider
	}
	
	async createProxy(addressHash, addressSig) {
		let deployer = config.deployer;

		let identityProxy = await deployer.deploy(IdentityProxy, {}, keys.implementationAddress);
		let identityContractInstance = await deployer.wrapDeployedContract(IIdentityContract, identityProxy.contractAddress);

		await identityContractInstance.contract.init(addressHash, addressSig);
        
        return identityContractInstance.contractAddress;
		
	}
	
}

module.exports = CreateIDProxy;
