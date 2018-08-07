pragma solidity ^0.4.24;

contract IIdentityProxy {

    function init(bytes32 addressHash, bytes addressSig) public;

    function execute(address target, uint256 relayerReward, uint256 value, bytes data, bytes dataHashSignature) public payable returns (bool);
  
}