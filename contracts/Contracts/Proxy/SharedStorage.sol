pragma solidity ^0.4.21;

contract SharedStorage {
    address public contractImplementation;
    address public deployer;

    address public masterSigner;
    mapping (address => bool) isSigner;
}
