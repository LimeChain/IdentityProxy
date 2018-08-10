pragma solidity ^0.4.24;

contract IIdentityContract {

    function() public payable;

    function init(bytes32 addressHash, bytes addressSig) public;

    function getNonce() public view returns(uint256);

    function addSigner(address _signer, bytes32 addressHash, bytes addressSig);

	function removeSigner(address _signer, bytes32 addressHash, bytes addressSig);

	function checkSigner(address _signer) public view returns(bool);

    function execute(address target, uint256 relayerReward, uint256 value, bytes data, bytes dataHashSignature) public payable returns (bool);

    function rewardMsgSender(uint256 reward) internal returns(bool);
  
}