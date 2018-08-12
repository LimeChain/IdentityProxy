pragma solidity ^0.4.24;

import "./IIdentityContract.sol";
import "./ECTools.sol";
import "../Proxy/SharedStorage.sol";

contract IdentityContract is IIdentityContract, SharedStorage {

	uint256 public nonce;

	function() public payable {}

	function getSigner(bytes32 raw, bytes sig) public view returns(address signer) {
		return ECTools.prefixedRecover(raw, sig);
	}

	modifier onlyValidSignature(uint256 relayerReward, address target, uint256 value, bytes data, bytes dataHashSignature) {
		bytes32 dataHash = keccak256(abi.encodePacked(data, relayerReward, value, target, nonce));
		address signer = getSigner(dataHash, dataHashSignature);
		require(signer == owner);
		_;
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
