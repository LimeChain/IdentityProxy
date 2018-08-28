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
		require(isSigner[signer]);
		emit LogActionAuthorised(nonce, signer);
		_;
	}

	modifier onlyMasterSigner(bytes32 addressHash, bytes addressSig){
		address signer = getSigner(addressHash, addressSig);
		require(masterSigner == signer);
		_;
	}

	function addSigner(address _signer, bytes32 addressHash, bytes addressSig) public onlyMasterSigner(addressHash, addressSig){
		require(_signer != address(0));
		isSigner[_signer] = true;
		emit LogSignerAdded(_signer);
	}

	function removeSigner(address _signer, bytes32 addressHash, bytes addressSig) public onlyMasterSigner(addressHash, addressSig){
		isSigner[_signer] = false;
		emit LogSignerRemoved(_signer);
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
		emit LogActionExecuted(nonce-1, target, relayerReward, value, data, dataHashSignature);
		require(rewardMsgSender(relayerReward));
		return true;
	}

	function rewardMsgSender(uint256 reward) internal returns(bool) {
		// Override this to make your reward logic work
		msg.sender.transfer(reward);

		if(nonce != 1) {
			emit LogRewardsPaid(nonce-1, msg.sender, reward, deployer, 0x0);
			return true;
		}

		deployer.transfer(10000);
		emit LogRewardsPaid(nonce-1, msg.sender, reward, deployer, 10000);
		return true;
	}

}
