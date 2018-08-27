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
var orverrideOptions = {gasLimit: 4700000};

function hash (wallet) {
    const addressHash = utils.solidityKeccak256(['address'], [wallet.address]);
    var addressHashBytes = ethers.utils.arrayify(addressHash);
    const addressSig = wallet.signMessage(addressHashBytes);
    return { addressHash, addressSig }
  }

    describe('create identity', () => {
        let deployer;
        beforeEach(async function() {
            deployer = new etherlime.EtherlimeGanacheDeployer(accounts[0].secretKey, 8545, orverrideOptions);
            
            let library = await deployer.deploy(ECTools);
	        let libraries = {
			"ECTools": library.contractAddress
		    }

            identityContract = await deployer.deploy(IdentityContract,libraries)
  
        });

        it('should create ID contract with valid address', async function() {

            let hashData = hash(signerWallet);
            
            identityProxy = await deployer.deploy(IdentityProxy, {}, identityContract.contractAddress, deployerWallet.address, hashData.addressHash, hashData.addressSig);
            identityContractInstance = await deployer.wrapDeployedContract(IIdentityContract, identityProxy.contractAddress);
            
            assert.equal(identityContractInstance.contractAddress.length, 42)
            
        });
    })

    describe('execute service through ID contract', () => {
        let deployer;
        beforeEach(async function() {
            deployer = new etherlime.EtherlimeGanacheDeployer(accounts[0].secretKey, 8545, orverrideOptions);
            billboardService = await deployer.deploy(BillboardService); 

            let library = await deployer.deploy(ECTools);
	        let libraries = {
			"ECTools": library.contractAddress
		    }

            identityContract = await deployer.deploy(IdentityContract,libraries);

            let hashData = hash(signerWallet);

            identityProxy = await deployer.deploy(IdentityProxy, {}, identityContract.contractAddress, deployerWallet.address, hashData.addressHash, hashData.addressSig);
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

        it('should throw if reward argument is changed', async function() {
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

        it('should throw if value argument is changed', async function() {
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

        it('should throw if the signiture of the buyDataHashSignature is changed', async function() {
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

        it('should emit action authorisation', async function() {
            let reward = 100;
            let value = 20000;

            let service = new ethers.Contract(billboardService.contractAddress, BillboardService.abi, signerWallet);
            identityContractInstance = new ethers.Contract(identityContractInstance.contractAddress, IIdentityContract.abi, signerWallet)

            let serviceDescriptor = (service.interface.functions.buy('Dessy'));
	        let serviceData = serviceDescriptor.data;

            let nonce = await identityContractInstance.getNonce();
            
            let serviceDataHash = utils.solidityKeccak256(['bytes', 'uint256', 'uint256', 'address','uint256'], [utils.arrayify(serviceData), reward, value, billboardService.contractAddress, nonce.toString()]);
            let hashData = ethers.utils.arrayify(serviceDataHash);
            let buyDataHashSignature = signerWallet.signMessage(hashData);

            let transaction = await identityContractInstance.execute(billboardService.contractAddress, reward, value, serviceData, buyDataHashSignature);
            const txReceipt = await settings.provider.getTransactionReceipt(transaction.hash);
        
            let event = identityContractInstance.interface.events.LogActionAuthorised;
            const log = event.parse(txReceipt.logs[0].data)
            assert.equal(log.signer.toLowerCase(), signerWallet.address.toLowerCase()) 

                    
        })

        it('should emit action executed', async function() {
            let reward = 100;
            let value = 20000;

            let service = new ethers.Contract(billboardService.contractAddress, BillboardService.abi, signerWallet);
            identityContractInstance = new ethers.Contract(identityContractInstance.contractAddress, IIdentityContract.abi, signerWallet)

            let serviceDescriptor = (service.interface.functions.buy('Dessy'));
	        let serviceData = serviceDescriptor.data;

            let nonce = await identityContractInstance.getNonce();
            
            let serviceDataHash = utils.solidityKeccak256(['bytes', 'uint256', 'uint256', 'address','uint256'], [utils.arrayify(serviceData), reward, value, billboardService.contractAddress, nonce.toString()]);
            let hashData = ethers.utils.arrayify(serviceDataHash);
            let buyDataHashSignature = signerWallet.signMessage(hashData);

            let transaction = await identityContractInstance.execute(billboardService.contractAddress, reward, value, serviceData, buyDataHashSignature);
            const txReceipt = await settings.provider.getTransactionReceipt(transaction.hash);

            let event = identityContractInstance.interface.events.LogActionExecuted;

            const log = event.parse(txReceipt.logs[1].data)
            assert.equal(log.target, billboardService.contractAddress)
           
        })           

        it('should emit reward payed', async function() {
            let reward = 100;
            let value = 20000;

            let service = new ethers.Contract(billboardService.contractAddress, BillboardService.abi, signerWallet);
            identityContractInstance = new ethers.Contract(identityContractInstance.contractAddress, IIdentityContract.abi, signerWallet)

            let serviceDescriptor = (service.interface.functions.buy('Dessy'));
	        let serviceData = serviceDescriptor.data;

            let nonce = await identityContractInstance.getNonce();
            
            let serviceDataHash = utils.solidityKeccak256(['bytes', 'uint256', 'uint256', 'address','uint256'], [utils.arrayify(serviceData), reward, value, billboardService.contractAddress, nonce.toString()]);
            let hashData = ethers.utils.arrayify(serviceDataHash);
            let buyDataHashSignature = signerWallet.signMessage(hashData);

            let transaction = await identityContractInstance.execute(billboardService.contractAddress, reward, value, serviceData, buyDataHashSignature);
            const txReceipt = await settings.provider.getTransactionReceipt(transaction.hash);

            let event = identityContractInstance.interface.events.LogRewardsPaid;

            const log = event.parse(txReceipt.logs[2].data)
            assert.equal(log.rewardPaid, reward) 
                 
        })

    })


    describe('many identity owners', () => {
        let deployer;
        beforeEach(async function() {
            deployer = new etherlime.EtherlimeGanacheDeployer(accounts[0].secretKey, 8545, orverrideOptions);
            let library = await deployer.deploy(ECTools);
	        let libraries = {
			"ECTools": library.contractAddress
		    }

            identityContract = await deployer.deploy(IdentityContract,libraries);

            let hashData = hash(signerWallet);

            identityProxy = await deployer.deploy(IdentityProxy, {}, identityContract.contractAddress, deployerWallet.address, hashData.addressHash, hashData.addressSig);
            identityContractInstance = await deployer.wrapDeployedContract(IIdentityContract, identityProxy.contractAddress);

            await deployerWallet.send(identityContractInstance.contractAddress, 1000000000000000000);
        
        });

        it('should return signerWallet as a signer', async function() {
            let isSigner = await identityContractInstance.contract.checkSigner(signerWallet.address);
            assert.equal(isSigner, true)
        });

        it('should add new signer', async function() {
            let newSigner = '0x56a32fff5e5a8b40d6a21538579fb8922df5258c'
        
            let hashData = hash(signerWallet)

            await identityContractInstance.contract.addSigner(newSigner, hashData.addressHash, hashData.addressSig)
            let firstSigner = await identityContractInstance.contract.checkSigner(signerWallet.address);
            let secondSigner = await identityContractInstance.contract.checkSigner(newSigner);
            assert.equal(firstSigner, true)
            assert.equal(secondSigner, true)
        });

        it('should revert if new signer is invalid address', async function() {
            let newSigner = '0x0000000000000000000000000000000000000000'
        
            let hashData = hash(signerWallet)

            await expectThrow(identityContractInstance.contract.addSigner(newSigner, hashData.addressHash, hashData.addressSig))
        });

        it('should revert if not a signer tries to add new signer', async function() {
            let newSigner = '0x56a32fff5e5a8b40d6a21538579fb8922df5258c'

            let hashData = hash(deployerWallet)

            await expectThrow(identityContractInstance.contract.addSigner(newSigner, hashData.addressHash, hashData.addressSig))
        });

        it('should remove signer', async function() {
            let newSigner = '0x56a32fff5e5a8b40d6a21538579fb8922df5258c'
            
            let hashData = hash(signerWallet)

            await identityContractInstance.contract.addSigner(newSigner, hashData.addressHash, hashData.addressSig)
            await identityContractInstance.contract.removeSigner(newSigner, hashData.addressHash, hashData.addressSig);
            let isSigner = await identityContractInstance.contract.checkSigner(newSigner);
            assert.equal(isSigner, false)
        });

        it('should revert if not signer try to remove new signer', async function() {
            let newSigner = '0x56a32fff5e5a8b40d6a21538579fb8922df5258c'
            
            let hashData = hash(signerWallet)

            await identityContractInstance.contract.addSigner(newSigner, hashData.addressHash, hashData.addressSig);

            hashData = hash(deployerWallet);
            
            await expectThrow(identityContractInstance.contract.removeSigner(newSigner, hashData.addressHash, hashData.addressSig))
        });

        it('should emit new signer added', async function() {
            let newSigner = '0x56a32fff5e5a8b40d6a21538579fb8922df5258c'
        
            let hashData = hash(signerWallet)

            identityContractInstance = new ethers.Contract(identityContractInstance.contractAddress, IIdentityContract.abi, signerWallet)

            let transaction = await identityContractInstance.addSigner(newSigner, hashData.addressHash, hashData.addressSig)
            let txReceipt = await settings.provider.getTransactionReceipt(transaction.hash);
        
            let event = identityContractInstance.interface.events.LogSignerAdded;
            let log = event.parse(txReceipt.logs[0].data)
            assert.equal(log.addedSigner.toLowerCase(), newSigner)        
        })


        it('should emit removed signer', async function() {
            let newSigner = '0x56a32fff5e5a8b40d6a21538579fb8922df5258c'
        
            let hashData = hash(signerWallet)

            identityContractInstance = new ethers.Contract(identityContractInstance.contractAddress, IIdentityContract.abi, signerWallet)

            await identityContractInstance.addSigner(newSigner, hashData.addressHash, hashData.addressSig)
            let transaction = await identityContractInstance.removeSigner(newSigner, hashData.addressHash, hashData.addressSig);
            let txReceipt = await settings.provider.getTransactionReceipt(transaction.hash);
        
        
            let event = identityContractInstance.interface.events.LogSignerRemoved;
            let log = event.parse(txReceipt.logs[0].data)
            assert.equal(log.removedSigner.toLowerCase(), newSigner)  
                    
        })

    })
