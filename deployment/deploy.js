let etherlime = require('etherlime');
let BillboardService = require('../build/BillboardService.json');
let IdentityContract = require('../build/IdentityContract.json')
let ECTools = require('../build/ECTools.json');
let config = require('../relayer_api/config/config.js')


const deploy = async (network, secret) => {
	let deployer = config.deployer;

	await deployer.deploy(BillboardService);
	
	let library = await deployer.deploy(ECTools);
	let libraries = {
			"ECTools": library.contractAddress
		}

	let identityContract = await deployer.deploy(IdentityContract,libraries)

}

module.exports = {
	deploy
}