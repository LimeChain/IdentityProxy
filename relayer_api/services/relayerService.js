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

		const fullCounterfactualData = await this._extractCounterfactualParams(counterfactualTransaction);

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

	async _extractCounterfactualParams(counterfactualTransaction) {
		const parsedTrans = Wallet.parseTransaction(counterfactualTransaction);
		
		const counterfactualDeploymentPayer = parsedTrans.from;
		
		let nonce = await connection.provider.getTransactionCount(counterfactualDeploymentPayer);

		const transaction = {
			from: counterfactualDeploymentPayer,
			nonce: nonce
		};

		const counterfactualContractAddress = utils.getContractAddress(transaction);

		let counterfactualBalance = await connection.provider.getBalance(counterfactualContractAddress);
		if(utils.bigNumberify(counterfactualBalance).gt(0)){
			throw new Error ("Contract with such address has already been used")
		}

		return {
			counterfactualContractAddress,
			counterfactualTransaction,
			counterfactualDeploymentPayer
		}
	}

	async deployProxy(counterfactualContractAddress) {
		const fullCounterfactualData = transactionsStorage.getData(counterfactualContractAddress);
		// TODO check Tx count
		
		const counterfactualBalance = await connection.provider.getBalance(counterfactualContractAddress);
		
		if(utils.bigNumberify(counterfactualBalance).eq(0)){
			throw new Error("Counterfactual contract should have ethers")
		}
		const from = fullCounterfactualData.counterfactualDeploymentPayer;
	
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

	async execute(identityAddress, serviceContractAddress, _reward, _wei, data, signedDataHash) {
		let reward = utils.bigNumberify(_reward);
		let wei = utils.bigNumberify(_wei);

		const counterfactualData = transactionsStorage.getData(identityAddress);

		if (counterfactualData) {
			// TODO figure out a way not to be drained by failing of the next TX
			const deployTx = await this.deployProxy(identityAddress);
			await connection.provider.waitForTransaction(deployTx.hash);
		}

		const identityContract = new ethers.Contract(identityAddress, IIdentityContract.abi, connection.wallet);

		let estimateGas = await identityContract.estimate.execute(serviceContractAddress, reward, wei, data, signedDataHash);
		if(utils.bigNumberify(estimateGas).gt(reward)){
			throw new Error("The reward to the relayer should be bigger than transaction costs")
		}

		const transaction = await identityContract.execute(serviceContractAddress, reward, wei, data, signedDataHash);

		return transaction.hash
	}

	async authorizeSigner(identityAddress, newSigner, addressHash, addressSig) {
		const identityContract = new ethers.Contract(identityAddress, IIdentityContract.abi, connection.wallet);
		const transaction = await identityContract.addSigner(newSigner, addressHash, addressSig);
		return transaction.hash
	}

	async removeAuthorizedSigner(identityAddress, signerToRemove, addressHash, addressSig){
		const identityContract = new ethers.Contract(identityAddress, IIdentityContract.abi, connection.wallet);
		const transaction = await identityContract.removeSigner(signerToRemove, addressHash, addressSig);
		return transaction.hash
	}

}

module.exports = RelayerService;
