const etherlime = require('etherlime');
const BillboardService = require('../build/BillboardService.json');
const ECTools = require('../build/ECTools.json');
const config = require('../relayer_api/config/config.js')

const deploy = async (network, secret) => {
	const deployer = config.deployer;
	await deployer.deploy(BillboardService);
	await deployer.deploy(ECTools);
}

module.exports = {
	deploy
}