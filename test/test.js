let BillboardService = require('./../build/BillboardService.json');
let IdentityContract = require('./../build/IdentityContract.json');
let IIdentityContract = require('./../build/IIdentityContract.json');
let IIdentityContractAbi = require('./../build/IIdentityContract.json').abi;
let IdentityProxy = require('./../build/IdentityProxy.json');
let ECTools = require('./../build/ECTools.json');

let config = require('../relayer_api/config/config.js')
let utils = ethers.utils;
let Wallet = ethers.Wallet;

let expectThrow = require('./util').expectThrow;

let billboardService;
let identityContract;
let identityProxy;
let identityContractInstance;

let identityAddress;

let deployerWallet = new ethers.Wallet('0x7ab741b57e8d94dd7e1a29055646bafde7010f38a900f55bbd7647880faa6ee8');
deployerWallet.provider = config.provider;
let signerWallet = new ethers.Wallet('0x2030b463177db2da82908ef90fa55ddfcef56e8183caf60db464bc398e736e6f')
signerWallet.provider = config.provider;
let deployer = config.deployer;

    // describe('create identity', () => {
    //     beforeEach(async function() {
    //         let library = await deployer.deploy(ECTools);
	//         let libraries = {
	// 		"ECTools": library.contractAddress
	// 	    }

    //         identityContract = await deployer.deploy(IdentityContract,libraries)
  
    //     });

    //     it('should create ID contract with address', async function() {
            
    //         identityProxy = await deployer.deploy(IdentityProxy, {}, identityContract.contractAddress);
    //         identityContractInstance = await deployer.wrapDeployedContract(IIdentityContract, identityProxy.contractAddress);
            
    //         let addressHash = utils.solidityKeccak256(['address'], [signerWallet.address]);
    //         var addressHashBytes = ethers.utils.arrayify(addressHash);
    //         let addressSig = signerWallet.signMessage(addressHashBytes);

    //         await identityContractInstance.contract.init(addressHash, addressSig);
            
    //         console.log("The address of ID should be a valid address!", identityContractInstance.contractAddress)
    //     });

    //     it('should throw if try to execute init() second time', async function() {
    //         identityProxy = await deployer.deploy(IdentityProxy, {}, identityContract.contractAddress);
    //         identityContractInstance = await deployer.wrapDeployedContract(IIdentityContract, identityProxy.contractAddress);
            
    //         let addressHash = utils.solidityKeccak256(['address'], [signerWallet.address]);
    //         var addressHashBytes = ethers.utils.arrayify(addressHash);
    //         let addressSig = signerWallet.signMessage(addressHashBytes);

    //         await identityContractInstance.contract.init(addressHash, addressSig);

    //         await expectThrow(identityContractInstance.contract.init(addressHash, addressSig));
    //     })

    // })

    // describe('execute service through ID contract', () => {
    //     beforeEach(async function() {

    //         billboardService = await deployer.deploy(BillboardService); 

    //         let library = await deployer.deploy(ECTools);
	//         let libraries = {
	// 		"ECTools": library.contractAddress
	// 	    }

    //         identityContract = await deployer.deploy(IdentityContract,libraries);

    //         identityProxy = await deployer.deploy(IdentityProxy, {}, identityContract.contractAddress);
    //         identityContractInstance = await deployer.wrapDeployedContract(IIdentityContract, identityProxy.contractAddress);
            
    //         let addressHash = utils.solidityKeccak256(['address'], [signerWallet.address]);
    //         var addressHashBytes = ethers.utils.arrayify(addressHash);
    //         let addressSig = signerWallet.signMessage(addressHashBytes);

    //         identityAddress = await identityContractInstance.contract.init(addressHash, addressSig);

    //         await deployerWallet.send(identityContractInstance.contractAddress, 1000000000000000000);
        
    //     });

    //     it('should execute service through identity', async function() {

    //         let reward = 100;
    //         let value = 20000;

    //         let service = new ethers.Contract(billboardService.contractAddress, BillboardService.abi, signerWallet);

    //         let serviceDescriptor = (service.interface.functions.buy('Dessy'));
	//         let serviceData = serviceDescriptor.data;

           
    //         let nonce = await identityContractInstance.contract.getNonce();
            
    //         let serviceDataHash = utils.solidityKeccak256(['bytes', 'uint256', 'uint256', 'address','uint256'], [utils.arrayify(serviceData), reward, value, billboardService.contractAddress, nonce.toString()]);
    //         let hashData = ethers.utils.arrayify(serviceDataHash);
    //         let buyDataHashSignature = signerWallet.signMessage(hashData);

    //         let transaction = await identityContractInstance.contract.execute(billboardService.contractAddress, reward, value, serviceData, buyDataHashSignature);
            
    //         console.log("Succesfull transction hash:", transaction.hash)
    //     })

    //     it('should throw if change reward argument', async function() {
    //         let reward = 100;
    //         let value = 20000;

    //         let service = new ethers.Contract(billboardService.contractAddress, BillboardService.abi, signerWallet);

    //         let serviceDescriptor = (service.interface.functions.buy('Dessy'));
	//         let serviceData = serviceDescriptor.data;

    //         let nonce = await identityContractInstance.contract.getNonce();
            
    //         let serviceDataHash = utils.solidityKeccak256(['bytes', 'uint256', 'uint256', 'address','uint256'], [utils.arrayify(serviceData), 200, value, billboardService.contractAddress, nonce.toString()]);
    //         let hashData = ethers.utils.arrayify(serviceDataHash);
    //         let buyDataHashSignature = signerWallet.signMessage(hashData);

    //         await expectThrow(identityContractInstance.contract.execute(billboardService.contractAddress, reward, value, serviceData, buyDataHashSignature));
    //     })

    //     it('should throw if change value argument', async function() {
    //         let reward = 100;
    //         let value = 20000;

    //         let service = new ethers.Contract(billboardService.contractAddress, BillboardService.abi, signerWallet);

    //         let serviceDescriptor = (service.interface.functions.buy('Dessy'));
	//         let serviceData = serviceDescriptor.data;

    //         let nonce = await identityContractInstance.contract.getNonce();
            
    //         let serviceDataHash = utils.solidityKeccak256(['bytes', 'uint256', 'uint256', 'address','uint256'], [utils.arrayify(serviceData), reward, 50000, billboardService.contractAddress, nonce.toString()]);
    //         let hashData = ethers.utils.arrayify(serviceDataHash);
    //         let buyDataHashSignature = signerWallet.signMessage(hashData);

    //         await expectThrow(identityContractInstance.contract.execute(billboardService.contractAddress, reward, value, serviceData, buyDataHashSignature));
    //     })

    //     it('should throw if change the signiture of the buyDataHashSignature', async function() {
    //         let reward = 100;
    //         let value = 20000;

    //         let service = new ethers.Contract(billboardService.contractAddress, BillboardService.abi, signerWallet);

    //         let serviceDescriptor = (service.interface.functions.buy('Dessy'));
	//         let serviceData = serviceDescriptor.data;

    //         let nonce = await identityContractInstance.contract.getNonce();
            
    //         let serviceDataHash = utils.solidityKeccak256(['bytes', 'uint256', 'uint256', 'address','uint256'], [utils.arrayify(serviceData), reward, value, billboardService.contractAddress, nonce.toString()]);
    //         let hashData = ethers.utils.arrayify(serviceDataHash);
    //         let buyDataHashSignature = deployerWallet.signMessage(hashData);

    //         await expectThrow(identityContractInstance.contract.execute(billboardService.contractAddress, reward, value, serviceData, buyDataHashSignature));
    //     })
    // })

    describe('many identity owners', () => {
        beforeEach(async function() {

            billboardService = await deployer.deploy(BillboardService); 

            let library = await deployer.deploy(ECTools);
	        let libraries = {
			"ECTools": library.contractAddress
		    }

            identityContract = await deployer.deploy(IdentityContract,libraries);

            identityProxy = await deployer.deploy(IdentityProxy, {}, identityContract.contractAddress);
            identityContractInstance = await deployer.wrapDeployedContract(IIdentityContract, identityProxy.contractAddress);
            
            let addressHash = utils.solidityKeccak256(['address'], [signerWallet.address]);
            var addressHashBytes = ethers.utils.arrayify(addressHash);
            let addressSig = signerWallet.signMessage(addressHashBytes);

           await identityContractInstance.contract.init(addressHash, addressSig);

            await deployerWallet.send(identityContractInstance.contractAddress, 1000000000000000000);
        
        });

        it('should return signer as a owner', async function() {
            let isSigner = await identityContractInstance.contract.checkSigner(signerWallet.address);
            assert.equal(isSigner, true)
        });

        it('should add new signer', async function() {
            let newSigner = '0x56a32fff5e5a8b40d6a21538579fb8922df5258c'
        
            identityContractInstance = new ethers.Contract(identityContractInstance.contractAddress, IIdentityContractAbi, signerWallet)
            
            let addressHash = utils.solidityKeccak256(['address'], [signerWallet.address]);
            var addressHashBytes = ethers.utils.arrayify(addressHash);
            let addressSig = signerWallet.signMessage(addressHashBytes);

            await identityContractInstance.addSigner(newSigner, addressHash, addressSig)
            let isSigner = await identityContractInstance.checkSigner(newSigner);
            assert.equal(isSigner, true)
        });

        it('should revert if not signer try to add new signer', async function() {
            let newSigner = '0x56a32fff5e5a8b40d6a21538579fb8922df5258c'
        
            identityContractInstance = new ethers.Contract(identityContractInstance.contractAddress, IIdentityContractAbi, deployerWallet)
            
            let addressHash = utils.solidityKeccak256(['address'], [signerWallet.address]);
            var addressHashBytes = ethers.utils.arrayify(addressHash);
            let addressSig = signerWallet.signMessage(addressHashBytes);

            expectThrow(await identityContractInstance.addSigner(newSigner, addressHash, addressSig))
        });

        it('should remove signer', async function() {
            let newSigner = '0x56a32fff5e5a8b40d6a21538579fb8922df5258c'
        
            identityContractInstance = new ethers.Contract(identityContractInstance.contractAddress, IIdentityContractAbi, signerWallet)
            
            let addressHash = utils.solidityKeccak256(['address'], [signerWallet.address]);
            var addressHashBytes = ethers.utils.arrayify(addressHash);
            let addressSig = signerWallet.signMessage(addressHashBytes);

            await identityContractInstance.addSigner(newSigner, addressHash, addressSig)
            await identityContractInstance.removeSigner(newSigner, addressHash, addressSig);
            let isSigner = await identityContractInstance.checkSigner(newSigner);
            assert.equal(isSigner, false)
        });

        it('should revert if not signer try to remove new signer', async function() {
            let newSigner = '0x56a32fff5e5a8b40d6a21538579fb8922df5258c'
        
            identityContractInstance = new ethers.Contract(identityContractInstance.contractAddress, IIdentityContractAbi, signerWallet)
            
            let addressHash = utils.solidityKeccak256(['address'], [signerWallet.address]);
            var addressHashBytes = ethers.utils.arrayify(addressHash);
            let addressSig = signerWallet.signMessage(addressHashBytes);

            await identityContractInstance.addSigner(newSigner, addressHash, addressSig)
            
            identityContractInstance = new ethers.Contract(identityContractInstance.address, IIdentityContractAbi, deployerWallet)
            expectThrow(await identityContractInstance.removeSigner(newSigner, addressHash, addressSig))
        });

    })
