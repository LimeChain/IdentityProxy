let IIdentityContract = require('../../build/IIdentityContract.json');
let ethers = require('ethers');
let connection = require('./../config/blockchain-connection.js');

class ExecuteService {

	async execute(identityAddress, serviceContractAddress, reward, wei, data, signedDataHash) {
		// TODO simulate the transaction and check result
		// TODO estimate transaction cost before executing and work out the reward
		// TODO rework the numbers into big numbers
		const identityContract = new ethers.Contract(identityAddress, IIdentityContract.abi, connection.wallet);

		const transaction = await identityContract.execute(serviceContractAddress, `${reward}`, `${wei}`, data, signedDataHash);

		return transaction.hash
	}
}

module.exports = ExecuteService;