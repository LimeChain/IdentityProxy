const IdentityProxy = require('../build/IdentityProxy.json');
const BillboardService = require('../build/BillboardService.json');

const ethers = require('ethers');
const providers = ethers.providers;
const Wallet = ethers.Wallet;
const utils = ethers.utils;

var provider;

(async function () {

	if (process.argv.length < 9) {
		throw new Error('Invalid arguments');
	}

	const serviceAddress = process.argv[2];
	const identityAddress = process.argv[3];
	const signerPK = process.argv[4];
	const deloyerPK = process.argv[5];
	const slogan = process.argv[6];
	const wei = Number.parseInt(process.argv[7]);
	const reward = Number.parseInt(process.argv[8]);


	provider = new providers.JsonRpcProvider('http://localhost:8545', providers.networks.unspecified);

	const signerWallet = new Wallet('0x' + signerPK);
	signerWallet.provider = provider;

	const nonceContract = new ethers.Contract(identityAddress, IdentityProxy.abi, provider);
	let nonce = await nonceContract.nonce();

	console.log(nonce.toString())

	const billboardContract = new ethers.Contract(serviceAddress, BillboardService.abi, signerWallet);

	const initialPrice = await billboardContract.price();

	console.log(`CurrentPrice: ${initialPrice}`);

	const buyDescriptor = (billboardContract.interface.functions.buy(slogan));
	const buyData = buyDescriptor.data;

	const buyDataHash = utils.solidityKeccak256(['uint256', 'address', 'uint256', 'uint256', 'bytes'], [reward, billboardContract.address, nonce.toString(), wei, utils.arrayify(buyData)]);
	var hashData = ethers.utils.arrayify(buyDataHash);
	const buyDataHashSignature = signerWallet.signMessage(hashData);

	const deployerWallet = new Wallet('0x' + deloyerPK);
	deployerWallet.provider = provider;

	const identityContract = new ethers.Contract(identityAddress, IdentityProxy.abi, deployerWallet);
	await identityContract.execute(reward, billboardContract.address, wei, buyData, buyDataHashSignature);

	const finalPrice = await billboardContract.price();
	console.log(`Billboard Price: ${finalPrice}`);

	const billboardOwner = await billboardContract.billboardOwner();
	console.log(`Billboard Owner: ${billboardOwner}`);

	const billboardSlogan = await billboardContract.slogan();
	console.log(`Billboard Slogan: ${billboardSlogan}`);
	const balance = await provider.getBalance(deployerWallet.address);
	console.log(balance.toString());
	const balance2 = await provider.getBalance(signerWallet.address);
	console.log(balance2.toString());

})()