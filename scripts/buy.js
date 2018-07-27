const IdentityProxy = require('../build/IdentityProxy.json');
const BillboardService = require('../build/BillboardService.json');

const ethers = require('ethers');
const providers = ethers.providers;
const Wallet = ethers.Wallet;
const utils = ethers.utils;

var provider;

(async function () {

	if (process.argv.length < 7) {
		throw new Error('Invalid arguments');
	}

	const serviceAddress = process.argv[2]; // 0xc9707E1e496C12f1Fa83AFbbA8735DA697cdBf64
	const identityAddress = process.argv[3]; // 0x4ad3F07BEFDC54511449A1f553E36A653c82eA57
	const signerPK = process.argv[4]; // fac0bc9325ad342033afe956e83f0bf8f1e863c1c3e956bc75d66961fe4cd186
	const deloyerPK = process.argv[5]; // fac0bc9325ad342033afe956e83f0bf8f1e863c1c3e956bc75d66961fe4cd186
	const slogan = process.argv[6];

	provider = new providers.JsonRpcProvider('http://localhost:8545', providers.networks.unspecified);

	const signerWallet = new Wallet('0x' + signerPK);
	signerWallet.provider = provider;

	const billboardContract = new ethers.Contract(serviceAddress, BillboardService.abi, signerWallet);
	const initialPrice = await billboardContract.price();

	console.log(`CurrentPrice: ${initialPrice}`);

	const buyDescriptor = (billboardContract.interface.functions.buy(slogan));
	const buyData = buyDescriptor.data;

	const buyDataHash = utils.solidityKeccak256(['bytes'], [utils.arrayify(buyData)]);
	var hashData = ethers.utils.arrayify(buyDataHash);
	const buyDataHashSignature = signerWallet.signMessage(hashData);

	const deployerWallet = new Wallet('0x' + deloyerPK);
	deployerWallet.provider = provider;

	const identityContract = new ethers.Contract(identityAddress, IdentityProxy.abi, deployerWallet);
	await identityContract.execute(billboardContract.address, buyData, buyDataHashSignature, {
		value: 100004
	});

	const finalPrice = await billboardContract.price();
	console.log(`Billboard Price: ${finalPrice}`);

	const billboardOwner = await billboardContract.billboardOwner();
	console.log(`Billboard Owner: ${billboardOwner}`);

	const billboardSlogan = await billboardContract.slogan();
	console.log(`Billboard Slogan: ${billboardSlogan}`);

})()