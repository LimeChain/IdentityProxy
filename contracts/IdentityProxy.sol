pragma solidity ^0.4.24;

import "./ECTools.sol";

contract IdentityProxy {

	address public owner;

	uint256 public nonce;
    
	/**
	 * @dev sets the owner of this identity to the person that has signed this contract
	 * 
	 * @param addressHash - keccak256 of the address of the signer
	 * @param addressSig - signed addressHash by the signer
	 */
	constructor(bytes32 addressHash, bytes addressSig) public {
		address signer = ECTools.prefixedRecover(addressHash, addressSig);
		bytes32 signerHash = keccak256(signer);
		require(signerHash == addressHash);
		owner = signer;
	}

	modifier onlySigner(uint256 value, bytes data, bytes dataHashSignature) {
		bytes32 dataHash = keccak256(nonce, value, data);
		address signer = ECTools.prefixedRecover(dataHash, dataHashSignature);
		require(signer == owner);
		_;
	}

	/**
	 * @dev executes a transaction only if it is formatted and signed by the owner of this. Anyone can call execute. Nonce introduced as anti replay attack mechanism.
	 * 
	 * @param target - the contract to be called
	 * @param value - the value to be sent to the target
	 * @param data - the data to be sent to be target
	 * @param dataHashSignature - signed bytes of the keccak256 of nonce, value and data keccak256(nonce, value, data)
	 */
	function execute(address target, uint256 value, bytes data, bytes dataHashSignature) public payable onlySigner(value, data, dataHashSignature) returns (bool)  {
		 // solium-disable-next-line security/no-call-value
		nonce++;
    	require(target.call.value(value)(data));
	}
    
}