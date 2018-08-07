const etherlime = require('etherlime');
const BillboardService = require('../build/BillboardService.json');
const ECTools = require('../build/ECTools.json');


const deploy = async (network, secret) => {
	const deployer = new etherlime.EtherlimeGanacheDeployer();
	await deployer.deploy(BillboardService);
	await deployer.deploy(ECTools);
}

module.exports = {
	deploy
}