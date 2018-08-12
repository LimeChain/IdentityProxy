const IdentityProxy = require('./../../build/IdentityProxy.json');
const ethers = require('ethers');
const Wallet = ethers.Wallet;
const utils = ethers.utils;
const settings = require('../config/settings.js');
const connection = require('../config/blockchain-connection.js');
const CounterfactualTransactionsService = require('./counterfactualTransactionsService.js');

const transactionsStorage = new CounterfactualTransactionsService();


class RelayerService {

	constructor() {
		connection.wallet = connection.wallet;
	}

	async createProxy(addressHash, addressSig) {
		let deployTransaction = this._createDeployTransaction(addressHash, addressSig);

		deployTransaction = this._setupDeployTransaction(deployTransaction);

		const signedTransaction = this._signDeployTransaction(deployTransaction);

		const counterfactualTransaction = this._counterfactualizeSignedTransaction(signedTransaction);

		const fullCounterfactualData = this._extractCounterfactualParams(counterfactualTransaction);

		transactionsStorage.upsertData(fullCounterfactualData.counterfactualContractAddress, fullCounterfactualData);

		return fullCounterfactualData;
	}

	_createDeployTransaction(addressHash, addressSig) {
		return ethers.Contract.getDeployTransaction(IdentityProxy.bytecode, IdentityProxy.abi, settings.implementationAddress, connection.wallet.address, addressHash, addressSig);
	}

	_setupDeployTransaction(deployTransaction) {
		deployTransaction.gasLimit = 566700;
		deployTransaction.gasPrice = 100000000000;
		return deployTransaction;
	}

	_signDeployTransaction(deployTransaction) {
		return connection.wallet.sign(deployTransaction);
	}

	_counterfactualizeSignedTransaction(signedTransaction) {
		const signedTransNoRSV = signedTransaction.substring(0, signedTransaction.length - 134);

		let randomS = utils.keccak256(utils.randomBytes(3));
		randomS = '0' + randomS.substring(3, randomS.length);

		const counterfactualMagic = `1ba079be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798a0`;

		return `${signedTransNoRSV}${counterfactualMagic}${randomS}`;
	}

	_extractCounterfactualParams(counterfactualTransaction) {
		const parsedTrans = Wallet.parseTransaction(counterfactualTransaction);

		const counterfactualDeploymentPayer = parsedTrans.from;

		// TODO check number of transactions of getTransactionCount for nonce
		const transaction = {
			from: counterfactualDeploymentPayer,
			nonce: 0
		};

		const counterfactualContractAddress = utils.getContractAddress(transaction)
		// TODO check funds of counterfactual address

		return {
			counterfactualContractAddress,
			counterfactualTransaction,
			counterfactualDeploymentPayer
		}
	}

	async deployProxy(counterfactualContractAddress) {
		const fullCounterfactualData = transactionsStorage.getData(counterfactualContractAddress);
		// TODO check Tx count
		// TODO check funds of counterfactual address

		const from = fullCounterfactualData.counterfactualDeploymentPayer;
		// TODO check funds from deployer

		const fundTransaction = await connection.wallet.send(from, utils.bigNumberify(566700).mul(100000000000)) // TODO change value passed
		await connection.provider.waitForTransaction(fundTransaction.hash);

		const deployTx = await connection.provider.sendTransaction(fullCounterfactualData.counterfactualTransaction);
		return {
			hash: deployTx
		};
	}

	async execute(identityAddress, serviceContractAddress, reward, wei, data, signedDataHash) {
		// TODO simulate the transaction and check result
		// TODO estimate transaction cost before executing and work out the reward
		// TODO rework the numbers into big numbers
		const identityContract = new ethers.Contract(identityAddress, IIdentityContract.abi, connection.wallet);

		const transaction = await identityContract.execute(serviceContractAddress, `${reward}`, `${wei}`, data, signedDataHash);

		return transaction.hash
	}

}

module.exports = RelayerService;
