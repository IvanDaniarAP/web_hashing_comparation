// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyTestUSD is ERC20, Ownable {
    uint256 public constant INITIAL_SUPPLY = 100 * 10**18; // 100 SUSD per user
    
    mapping(address => bool) public hasReceivedInitialSupply;
    mapping(string => address) public emailToAddress;
    mapping(address => string) public addressToEmail;
    
    event InitialSupplyMinted(address indexed user, uint256 amount);
    event TransactionWithHash(
        address indexed from,
        address indexed to,
        uint256 amount,
        string hashMethod,
        string transactionHash,
        uint256 executionTime
    );
    
    constructor() ERC20("Stable USD", "SUSD") Ownable(msg.sender) {}
    
    function registerUser(string memory email, address userAddress) external onlyOwner {
        require(bytes(email).length > 0, "Email cannot be empty");
        require(userAddress != address(0), "Invalid address");
        require(emailToAddress[email] == address(0), "Email already registered");
        require(bytes(addressToEmail[userAddress]).length == 0, "Address already registered");
        
        emailToAddress[email] = userAddress;
        addressToEmail[userAddress] = email;
        
        // Mint initial supply if not already received
        if (!hasReceivedInitialSupply[userAddress]) {
            _mint(userAddress, INITIAL_SUPPLY);
            hasReceivedInitialSupply[userAddress] = true;
            emit InitialSupplyMinted(userAddress, INITIAL_SUPPLY);
        }
    }
    
    function getAddressByEmail(string memory email) external view returns (address) {
        return emailToAddress[email];
    }
    
    function getEmailByAddress(address userAddress) external view returns (string memory) {
        return addressToEmail[userAddress];
    }
    
    function transferByEmail(
        string memory toEmail,
        uint256 amount,
        string memory hashMethod,
        string memory transactionHash,
        uint256 executionTime
    ) external {
        address toAddress = emailToAddress[toEmail];
        require(toAddress != address(0), "Email not registered");
        require(amount > 0, "Amount must be greater than 0");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");
        
        _transfer(msg.sender, toAddress, amount);
        
        emit TransactionWithHash(
            msg.sender,
            toAddress,
            amount,
            hashMethod,
            transactionHash,
            executionTime
        );
    }
    
    function mintInitialSupply() external {
        require(!hasReceivedInitialSupply[msg.sender], "Initial supply already received");
        require(bytes(addressToEmail[msg.sender]).length > 0, "Address not registered");
        
        _mint(msg.sender, INITIAL_SUPPLY);
        hasReceivedInitialSupply[msg.sender] = true;
        emit InitialSupplyMinted(msg.sender, INITIAL_SUPPLY);
    }
    
    function decimals() public view virtual override returns (uint8) {
        return 18;
    }
}