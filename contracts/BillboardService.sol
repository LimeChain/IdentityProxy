pragma solidity ^0.4.24;

contract BillboardService {
    uint256 public price = 50 wei;
    address public billboardOwner;
    string public slogan;
    
    modifier onlyPositive(uint256 newPrice) {
        require(newPrice > 0, "The price cannot be 0");
        _;
    }
    
    function buy(string inSlogan) public payable {
        require(msg.value > price, "The ether sent was too low");
        billboardOwner = msg.sender;
        price = msg.value;
        slogan = inSlogan;
    }
    
}