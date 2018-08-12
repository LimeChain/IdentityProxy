let IdentityProxy = require('./../../build/IdentityProxy.json');
let ethers = require('ethers');
let Wallet = ethers.Wallet;
let utils = ethers.utils;
let settings = require('../config/settings.js');
let connection = require('../config/blockchain-connection.js');


class CreateService {

	constructor() {
		connection.wallet = connection.wallet;
		this.counterFactualContracts = {};
	}

	async createProxy(addressHash, addressSig) {

		const deployTransaction = ethers.Contract.getDeployTransaction(IdentityProxy.bytecode, IdentityProxy.abi, settings.implementationAddress, connection.wallet.address, addressHash, addressSig);
		deployTransaction.gasLimit = 566700;
		deployTransaction.gasPrice = 100000000000;

		const rawTrans = connection.wallet.sign(deployTransaction);

		const rawTransNoRSV = rawTrans.substring(0, rawTrans.length - 134);

		let randomS = utils.keccak256(utils.randomBytes(3));
		randomS = '0' + randomS.substring(3, randomS.length);

		const counterfactualMagic = `1ba079be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798a0`;

		const counterfactualRawTrans = `${rawTransNoRSV}${counterfactualMagic}${randomS}`;

		const parsedTrans = Wallet.parseTransaction(counterfactualRawTrans);

		const from = parsedTrans.from;

		const transaction = {
			from,
			nonce: 0
		};

		const counterfactualIdentityContract = utils.getContractAddress(transaction)
		// TODO check funds of counterfactual address
		// TODO check number of transactions of getTransactionCount

		const result = {
			counterfactualIdentityContract
		}

		this.counterFactualContracts[counterfactualIdentityContract] = counterfactualRawTrans; //TODO save this in DB. Gossip this.

		return result;

	}

	async deployProxy(counterfactualContract) {
		const counterfactualTx = this.counterFactualContracts[counterfactualContract];
		// TODO check Tx
		// TODO check funds of counterfactual address

		const parsedTrans = Wallet.parseTransaction(counterfactualTx);

		const from = parsedTrans.from;
		// TODO check funds from deployer
		const fundTransaction = await connection.wallet.send(from, utils.bigNumberify(566700).mul(100000000000)) // TODO change value passed
		await connection.provider.waitForTransaction(fundTransaction.hash);

		const deployTx = await connection.provider.sendTransaction(counterfactualTx);
		return {
			hash: deployTx
		};
	}

}

module.exports = CreateService;
