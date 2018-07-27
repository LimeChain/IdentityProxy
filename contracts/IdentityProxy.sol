pragma solidity ^0.4.24;

import "./ECTools.sol";

contract IdentityProxy {

	address public owner;
    
	constructor(bytes32 addressHash, bytes addressSig) public {
		address signer = ECTools.prefixedRecover(addressHash, addressSig);
		bytes32 signerHash = keccak256(signer);
		require(signerHash == addressHash);
		owner = signer;
	}

	modifier onlySigner(bytes data, bytes dataHashSignature) {
		bytes32 dataHash = keccak256(data);
		address signer = ECTools.prefixedRecover(dataHash, dataHashSignature);
		require(signer == owner);
		_;
	}

	function execute(address target, bytes data, bytes dataHashSignature) public payable onlySigner(data, dataHashSignature) returns (bool)  {
		 // solium-disable-next-line security/no-call-value
    	return target.call.value(msg.value)(data);
	}
    
}