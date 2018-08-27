pragma solidity ^0.4.21;

contract SharedStorage {
    address public contractImplementation;
    address public deployer;

    mapping (address => bool) isSigner;

    // address public owner;

}
