let ethers = require('ethers');
let etherlime = require('etherlime');
let settings = require('./settings.js');
let keys = require('./keys.js');

let provider = getNodeProvider();

function getNodeProvider() {
	if(settings.network !== "local"){
		return new ethers.providers.InfuraProvider(settings.network, settings.infuraApikey);
	}
	return new ethers.providers.JsonRpcProvider("http://localhost:8545/");
}

let deployer = getDeployer();

const defaultConfigs = {
	gasPrice: 20200000000,
	gasLimit: 4700000
}

function getDeployer(){
	if(settings.network !== 'local'){
		return new etherlime.InfuraPrivateKeyDeployer(keys.deployerPrivateKey, settings.network, keys.infuraApikey, defaultConfigs)
	}

	return new etherlime.EtherlimeGanacheDeployer(keys.deployerPrivateKey);
}

module.exports = {provider, deployer};