const etherlime = require('etherlime');
const IdentityProxy = require('../build/IdentityProxy.json');

const ethers = require('ethers');
const providers = ethers.providers;
const Wallet = ethers.Wallet;
const utils = ethers.utils;

var provider;


async function createIDProxy(addressHash, addressSig, deployerPK, ectoolsAddress) {

	console.log('local verify: ', Wallet.verifyMessage(addressHash, addressSig));

	const deployer = new etherlime.EtherlimeGanacheDeployer(deployerPK);
	const libraries = {
		"ECTools": ectoolsAddress
	}

	const result = await deployer.deploy(IdentityProxy, libraries, addressHash, addressSig);

	const proxyContract = result.contract;

	const owner = await proxyContract.owner();

	console.log(owner);

	return proxyContract;
}

module.exports = createIDProxy;