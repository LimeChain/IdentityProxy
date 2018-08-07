const settings = require('./settings.js');
const ethers = require('ethers');

let provider = getNodeProvider();

function getNodeProvider() {
	if(settings.network !== "local"){
		return new ethers.providers.InfuraProvider(settings.network, settings.infuraApikey);
	}
	return new ethers.providers.JsonRpcProvider("http://localhost:8545/");
}

module.exports = {provider};