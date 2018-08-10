pragma solidity ^0.4.24;

import "./IIdentityContract.sol";
import "./ECTools.sol";
import "../Proxy/SharedStorage.sol";

contract IdentityContract is IIdentityContract, SharedStorage{
	
	uint256 public nonce;

	bool isInited;

	mapping(address => bool) public isSigner;

	function() public payable {}

	modifier onlyNotInited() {
		require(isInited == false);
		_;
	}

	/**
     * @dev sets the owner of this identity to the person that has signed this contract
     * 
     * @param addressHash - keccak256 of the address of the signer
     * @param addressSig - signed addressHash by the signer
     */

	function init(bytes32 addressHash, bytes addressSig) public onlyNotInited {
		address signer = ECTools.prefixedRecover(addressHash, addressSig);
		bytes32 signerHash = keccak256(abi.encodePacked(signer));
		require(signerHash == addressHash);

		isSigner[signer] = true;
		isInited = true;
	}

	modifier onlyValidSignature(uint256 relayerReward, address target, uint256 value, bytes data, bytes dataHashSignature) {
		bytes32 dataHash = keccak256(abi.encodePacked(data, relayerReward, value, target, nonce));
		address signer = ECTools.prefixedRecover(dataHash, dataHashSignature);
		require(isSigner[signer]);
		_;
	}

	modifier onliSigner(bytes32 addressHash, bytes addressSig) {
		address signer = ECTools.prefixedRecover(addressHash, addressSig);
		bytes32 signerHash = keccak256(abi.encodePacked(signer));
		require(signerHash == addressHash);
		_;
	}

	//create modifier for  next two functions similar to Init function

	function addSigner(address _signer, bytes32 addressHash, bytes addressSig) public onliSigner(addressHash, addressSig) {
		isSigner[_signer] = true;
	}

	function removeSigner(address _signer, bytes32 addressHash, bytes addressSig) public onliSigner(addressHash, addressSig) {
		isSigner[_signer] = false;
	}

	function checkSigner(address _signer) public view returns(bool){
		return isSigner[_signer];
	}

	function getNonce() public view returns(uint256) {
		return nonce;
	}

	/**
     * @dev executes a transaction only if it is formatted and signed by the owner of this. Anyone can call execute. Nonce introduced as anti replay attack mechanism.
     * 
     * @param relayerReward - the value to be sent back to the relayer
     * @param target - the contract to be called
     * @param value - the value to be sent to the target
     * @param data - the data to be sent to be target
     * @param dataHashSignature - signed bytes of the keccak256 of target, nonce, value and data keccak256(target, nonce, value, data)
     */

	function execute(address target, uint256 relayerReward, uint256 value, bytes data, bytes dataHashSignature) public payable onlyValidSignature(relayerReward, target, value, data, dataHashSignature) returns (bool) {
		// solium-disable-next-line security/no-call-value
		nonce++;
		require(target.call.value(value)(data));
		require(rewardMsgSender(relayerReward));
		return true;
	}

	function rewardMsgSender(uint256 reward) internal returns(bool) {
		// Override this to make your reward logic work
		msg.sender.transfer(reward);
		return true;
	}
    
}
