const etherlime = require('etherlime');
const IdentityProxy = require('../build/IdentityProxy.json');

const ethers = require('ethers');
const providers = ethers.providers;
const Wallet = ethers.Wallet;
const utils = ethers.utils;

var provider;

(async function () {

	if (process.argv.length < 5) {
		throw new Error('Invalid arguments');
	}

	const ectoolsAddress = process.argv[2];
	const deployerPK = process.argv[3];
	const signerPK = process.argv[4];

	provider = new providers.JsonRpcProvider('http://localhost:8545', providers.networks.unspecified);

	const signerWallet = new Wallet('0x' + signerPK);
	signerWallet.provider = provider;

	const addressHash = utils.solidityKeccak256(['address'], [signerWallet.address]);
	var addressHashBytes = ethers.utils.arrayify(addressHash);
	const addressSig = signerWallet.signMessage(addressHashBytes);

	console.log('local verify: ', Wallet.verifyMessage(addressHashBytes, addressSig));

	const deployer = new etherlime.EtherlimeGanacheDeployer(deployerPK);
	const libraries = {
		ECTools: ectoolsAddress
	}
	const result = await deployer.deploy(IdentityProxy, libraries, addressHash, addressSig);

	const proxyContract = result.contract;

	const owner = await proxyContract.owner();

	console.log(owner);
})()