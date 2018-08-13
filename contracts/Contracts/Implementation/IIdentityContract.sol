pragma solidity ^0.4.24;

contract IIdentityContract {

    event LogActionAuthorised(uint256 nonce, address signer);
    event LogActionExecuted(uint256 nonce, address target, uint256 relayerReward, uint256 value, bytes data, bytes dataHashSignature);
    event LogRewardsPaid(uint256 nonce, address relayer, uint256 rewardPaid, address deployer, uint256 deployerRewardPaid);

    function getSigner(bytes32 raw, bytes sig) public view returns(address signer);

    function getNonce() public view returns(uint256);

    function execute(address target, uint256 relayerReward, uint256 value, bytes data, bytes dataHashSignature) public payable returns (bool);

    function rewardMsgSender(uint256 reward) internal returns(bool);
  
}