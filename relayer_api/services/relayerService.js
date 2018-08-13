const IdentityProxy = require('./../../build/IdentityProxy.json');
const IIdentityContract = require('./../../build/IIdentityContract.json');
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

		this.deploymentGasNeeded = utils.bigNumberify(settings.deploymentGas);
		this.deploymentGasPrice = utils.bigNumberify(settings.deploymentGasPrice);
		this.deploymentValue = this.deploymentGasNeeded.mul(this.deploymentGasPrice);
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
		deployTransaction.gasLimit = this.deploymentGasNeeded;
		deployTransaction.gasPrice = this.deploymentGasPrice;
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

		const existingValue = await connection.provider.getBalance(from);

		const valueToBeSent = this.deploymentValue.sub(existingValue);

		const fundTransaction = await connection.wallet.send(from, valueToBeSent);
		await connection.provider.waitForTransaction(fundTransaction.hash);

		const deployTx = await connection.provider.sendTransaction(fullCounterfactualData.counterfactualTransaction);

		transactionsStorage.removeData(counterfactualContractAddress);
		return {
			hash: deployTx
		};
	}

	async execute(identityAddress, serviceContractAddress, reward, wei, data, signedDataHash) {
		// TODO rework the numbers into big numbers

		const counterfactualData = transactionsStorage.getData(identityAddress);

		if (counterfactualData) {
			// TODO figure out a way not to be drained by failing of the next TX
			const deployTx = await this.deployProxy(identityAddress);
			await connection.provider.waitForTransaction(deployTx.hash);
		}

		// TODO estimate transaction cost before executing and work out the reward
		// TODO simulate the transaction and check result
		const identityContract = new ethers.Contract(identityAddress, IIdentityContract.abi, connection.wallet);

		const transaction = await identityContract.execute(serviceContractAddress, `${reward}`, `${wei}`, data, signedDataHash);

		return transaction.hash
	}

}

module.exports = RelayerService;
