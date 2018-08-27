pragma solidity ^0.4.24;

contract IIdentityContract {

    event LogActionAuthorised(uint256 nonce, address signer);
    event LogActionExecuted(uint256 nonce, address target, uint256 relayerReward, uint256 value, bytes data, bytes dataHashSignature);
    event LogRewardsPaid(uint256 nonce, address relayer, uint256 rewardPaid, address deployer, uint256 deployerRewardPaid);
    event LogSignerAdded(address addedSigner);
    event LogSignerRemoved(address removedSigner);

    function getSigner(bytes32 raw, bytes sig) public view returns(address signer);

    function addSigner(address _signer, bytes32 addressHash, bytes addressSig) public;

	function removeSigner(address _signer, bytes32 addressHash, bytes addressSig) public;

	function checkSigner(address _signer) public view returns(bool);

    function getNonce() public view returns(uint256);

    function execute(address target, uint256 relayerReward, uint256 value, bytes data, bytes dataHashSignature) public payable returns (bool);

    function rewardMsgSender(uint256 reward) internal returns(bool);
  
}