let etherlime = require('etherlime');
let BillboardService = require('../build/BillboardService.json');
let ECTools = require('../build/ECTools.json');
let config = require('./../relayer_api/config/config');

const deploy = async (network, secret) => {
	const deployer = config.deployer;
	await deployer.deploy(BillboardService);
	await deployer.deploy(ECTools);
}

module.exports = {
	deploy
}