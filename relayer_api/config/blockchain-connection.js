const ethers = require('ethers');
const Wallet = ethers.Wallet;
const settings = require('./settings.js');
const keys = require('./keys.js');

function getNodeProvider() {
	if (settings.network !== "local") {
		return new ethers.providers.InfuraProvider(settings.network, settings.infuraApikey);
	}
	return new ethers.providers.JsonRpcProvider("http://localhost:8545/");
}

function getWallet(provider) {
	const wallet = new Wallet(keys.deployerPrivateKey)
	wallet.provider = provider;
	return wallet;
}

const provider = getNodeProvider();
const wallet = getWallet(provider);

module.exports = { provider, wallet };