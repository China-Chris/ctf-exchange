// SPDX-License-Identifier: MIT
pragma solidity ^0.8.15;

import { Script } from "forge-std/Script.sol";
import { console } from "forge-std/console.sol";
import { ERC20 } from "openzeppelin/token/ERC20/ERC20.sol";

/// @title SimpleDeploy
/// @notice 简化的部署脚本，部署基本的依赖合约
/// @author Polymarket
contract SimpleDeploy is Script {
    
    function run() external {
        console.log("Starting to deploy simplified dependencies...");
        
        vm.startBroadcast();
        
        // 1. Deploy a simple ERC20 token as collateral
        console.log("Deploying collateral token (USDC mock)...");
        ERC20Mock usdc = new ERC20Mock("USD Coin", "USDC", 6);
        usdc.mint(msg.sender, 1000000 * 10**6); // Mint 1M USDC
        
        // 2. Deploy a simplified conditional tokens contract
        console.log("Deploying conditional tokens contract...");
        ConditionalTokensMock ctf = new ConditionalTokensMock();
        
        // 3. Deploy simplified proxy factory
        console.log("Deploying proxy factory...");
        ProxyFactoryMock proxyFactory = new ProxyFactoryMock();
        
        // 4. Deploy simplified safe factory
        console.log("Deploying safe factory...");
        SafeFactoryMock safeFactory = new SafeFactoryMock();
        
        vm.stopBroadcast();
        
        console.log("Simplified dependencies deployed successfully!");
        console.log("Please update the following addresses in .env.hashkey file:");
        console.log("COLLATERAL=", address(usdc));
        console.log("CTF=", address(ctf));
        console.log("PROXY_FACTORY=", address(proxyFactory));
        console.log("SAFE_FACTORY=", address(safeFactory));
    }
}

// 简化的 ERC20 代币
contract ERC20Mock is ERC20 {
    uint8 private _decimals;
    
    constructor(string memory name, string memory symbol, uint8 decimals_) ERC20(name, symbol) {
        _decimals = decimals_;
    }
    
    function decimals() public view override returns (uint8) {
        return _decimals;
    }
    
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

// 简化的条件代币合约
contract ConditionalTokensMock {
    function mint(address to, uint256 id, uint256 amount, bytes memory data) external {
        // 简化实现
    }
    
    function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes memory data) external {
        // 简化实现
    }
}

// 简化的代理工厂
contract ProxyFactoryMock {
    function createProxy(address implementation, bytes memory data) external returns (address) {
        return address(0);
    }
}

// 简化的安全工厂
contract SafeFactoryMock {
    function createProxy(address singleton, bytes memory data) external returns (address) {
        return address(0);
    }
}
