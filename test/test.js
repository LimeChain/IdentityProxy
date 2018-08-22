let BillboardService = require('./../build/BillboardService.json');
let IdentityContract = require('./../build/IdentityContract.json');
let IIdentityContract = require('./../build/IIdentityContract.json');
let IdentityProxy = require('./../build/IdentityProxy.json');
let ECTools = require('./../build/ECTools.json');

let settings = require('../relayer_api/config/blockchain-connection.js')
let utils = ethers.utils;
let Wallet = ethers.Wallet;
let etherlime = require('etherlime')

let expectThrow = require('./util').expectThrow;

let billboardService;
let identityContract;
let identityProxy;
let identityContractInstance;

let identityAddress;

let deployerWallet = new ethers.Wallet('0x7ab741b57e8d94dd7e1a29055646bafde7010f38a900f55bbd7647880faa6ee8');
deployerWallet.provider = settings.provider;
let signerWallet = new ethers.Wallet('0x2030b463177db2da82908ef90fa55ddfcef56e8183caf60db464bc398e736e6f')
signerWallet.provider = settings.provider;
let deployer = new etherlime.EtherlimeGanacheDeployer();

    describe('create identity', () => {
        beforeEach(async function() {
            let library = await deployer.deploy(ECTools);
	        let libraries = {
			"ECTools": library.contractAddress
		    }

            identityContract = await deployer.deploy(IdentityContract,libraries)
  
        });

        it('should create ID contract with address', async function() {

            let addressHash = utils.solidityKeccak256(['address'], [signerWallet.address]);
            var addressHashBytes = ethers.utils.arrayify(addressHash);
            let addressSig = signerWallet.signMessage(addressHashBytes);

            
            identityProxy = await deployer.deploy(IdentityProxy, {}, identityContract.contractAddress, deployerWallet.address, addressHash, addressSig);
            identityContractInstance = await deployer.wrapDeployedContract(IIdentityContract, identityProxy.contractAddress);
            
            assert.equal(identityContractInstance.contractAddress.length, 42)
            
        });

    })

    describe('execute service through ID contract', () => {
        beforeEach(async function() {

            billboardService = await deployer.deploy(BillboardService); 

            let library = await deployer.deploy(ECTools);
	        let libraries = {
			"ECTools": library.contractAddress
		    }

            identityContract = await deployer.deploy(IdentityContract,libraries);

            let addressHash = utils.solidityKeccak256(['address'], [signerWallet.address]);
            var addressHashBytes = ethers.utils.arrayify(addressHash);
            let addressSig = signerWallet.signMessage(addressHashBytes);


            identityProxy = await deployer.deploy(IdentityProxy, {}, identityContract.contractAddress, deployerWallet.address, addressHash, addressSig);
            identityContractInstance = await deployer.wrapDeployedContract(IIdentityContract, identityProxy.contractAddress);

            await deployerWallet.send(identityContractInstance.contractAddress, 1000000000000000000);
        
        });

        it('should execute service through identity', async function() {

            let reward = 100;
            let value = 20000;

            let service = new ethers.Contract(billboardService.contractAddress, BillboardService.abi, signerWallet);

            let serviceDescriptor = (service.interface.functions.buy('Dessy'));
	        let serviceData = serviceDescriptor.data;

           
            let nonce = await identityContractInstance.contract.getNonce();
            
            let serviceDataHash = utils.solidityKeccak256(['bytes', 'uint256', 'uint256', 'address','uint256'], [utils.arrayify(serviceData), reward, value, billboardService.contractAddress, nonce.toString()]);
            let hashData = ethers.utils.arrayify(serviceDataHash);
            let buyDataHashSignature = signerWallet.signMessage(hashData);

            let transaction = await identityContractInstance.contract.execute(billboardService.contractAddress, reward, value, serviceData, buyDataHashSignature);
            
            assert.equal(transaction.hash.length, 66)
        })

        it('should throw if change reward argument', async function() {
            let reward = 100;
            let value = 20000;

            let service = new ethers.Contract(billboardService.contractAddress, BillboardService.abi, signerWallet);

            let serviceDescriptor = (service.interface.functions.buy('Dessy'));
	        let serviceData = serviceDescriptor.data;

            let nonce = await identityContractInstance.contract.getNonce();
            
            let serviceDataHash = utils.solidityKeccak256(['bytes', 'uint256', 'uint256', 'address','uint256'], [utils.arrayify(serviceData), 200, value, billboardService.contractAddress, nonce.toString()]);
            let hashData = ethers.utils.arrayify(serviceDataHash);
            let buyDataHashSignature = signerWallet.signMessage(hashData);

            await expectThrow(identityContractInstance.contract.execute(billboardService.contractAddress, reward, value, serviceData, buyDataHashSignature));
        })

        it('should throw if change value argument', async function() {
            let reward = 100;
            let value = 20000;

            let service = new ethers.Contract(billboardService.contractAddress, BillboardService.abi, signerWallet);

            let serviceDescriptor = (service.interface.functions.buy('Dessy'));
	        let serviceData = serviceDescriptor.data;

            let nonce = await identityContractInstance.contract.getNonce();
            
            let serviceDataHash = utils.solidityKeccak256(['bytes', 'uint256', 'uint256', 'address','uint256'], [utils.arrayify(serviceData), reward, 50000, billboardService.contractAddress, nonce.toString()]);
            let hashData = ethers.utils.arrayify(serviceDataHash);
            let buyDataHashSignature = signerWallet.signMessage(hashData);

            await expectThrow(identityContractInstance.contract.execute(billboardService.contractAddress, reward, value, serviceData, buyDataHashSignature));
        })

        it('should throw if change the signiture of the buyDataHashSignature', async function() {
            let reward = 100;
            let value = 20000;

            let service = new ethers.Contract(billboardService.contractAddress, BillboardService.abi, signerWallet);

            let serviceDescriptor = (service.interface.functions.buy('Dessy'));
	        let serviceData = serviceDescriptor.data;

            let nonce = await identityContractInstance.contract.getNonce();
            
            let serviceDataHash = utils.solidityKeccak256(['bytes', 'uint256', 'uint256', 'address','uint256'], [utils.arrayify(serviceData), reward, value, billboardService.contractAddress, nonce.toString()]);
            let hashData = ethers.utils.arrayify(serviceDataHash);
            let buyDataHashSignature = deployerWallet.signMessage(hashData);

            await expectThrow(identityContractInstance.contract.execute(billboardService.contractAddress, reward, value, serviceData, buyDataHashSignature));
        })
    })
