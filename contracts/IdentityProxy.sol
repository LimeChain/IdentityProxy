pragma solidity ^0.4.24;

import "./ECTools.sol";

contract IdentityProxy {

	address public owner;

	uint256 public nonce;
    
	// /**
	//  * @dev sets the owner of this identity to the person that has signed this contract
	//  * 
	//  * @param addressHash - keccak256 of the address of the signer
	//  * @param addressSig - signed addressHash by the signer
	//  */

	function() public payable {}

	
	constructor(bytes32 addressHash, bytes addressSig) public {
		address signer = ECTools.prefixedRecover(addressHash, addressSig);
		bytes32 signerHash = keccak256(abi.encodePacked(signer));
		require(signerHash == addressHash);
		owner = signer;
	}

	modifier onlyValidDataAndSigner(uint256 relayerReward, address target, uint256 value, bytes data, bytes dataHashSignature) {
		bytes32 dataHash = keccak256(abi.encodePacked(data, relayerReward, value, target, nonce));
		address signer = ECTools.prefixedRecover(dataHash, dataHashSignature);
		require(signer == owner);
		_;
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

	function execute(address target, uint256 relayerReward, uint256 value, bytes data, bytes dataHashSignature) public payable onlyValidDataAndSigner(relayerReward, target, value, data, dataHashSignature) returns (bool) {
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