const etherlime = require('etherlime');
const BillboardService = require('../build/BillboardService.json');
const IdentityContract = require('../build/IdentityContract.json')
const ECTools = require('../build/ECTools.json');
const infuraApiKey = 'XTIF9kIt1kgSOOKclKG0';

const deploy = async (network, secret) => {
	let deployer;
	if (network) {
		deployer = new etherlime.InfuraPrivateKeyDeployer(secret, network, infuraApiKey);
	} else {
		deployer = new etherlime.EtherlimeGanacheDeployer();
	}

	await deployer.deploy(BillboardService);

	const library = await deployer.deploy(ECTools);
	const libraries = {
		"ECTools": library.contractAddress
	}

	const identityContract = await deployer.deploy(IdentityContract, libraries)

}

module.exports = {
	deploy
}