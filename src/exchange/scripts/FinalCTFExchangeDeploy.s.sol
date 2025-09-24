// SPDX-License-Identifier: MIT
pragma solidity ^0.8.15;

import { Script } from "forge-std/Script.sol";
import { console } from "forge-std/console.sol";
import { CTFExchange } from "../CTFExchange.sol";

/// @title FinalCTFExchangeDeploy
/// @notice 使用OpenZeppelin ERC1155 CTF合约部署最终的CTF Exchange
/// @author Polymarket
contract FinalCTFExchangeDeploy is Script {
    
    function run() external {
        console.log("Deploying Final CTF Exchange with OpenZeppelin ERC1155 CTF...");
        
        // 使用新的OpenZeppelin ERC1155 CTF合约地址
        address ctf = 0x3338E58FAFfE71F89b2Bcb48384C9424c36060c6;
        address collateral = 0xC1C68E532E3F2e1F40e6b5EBC9D6c5f8c5e803D6; // USDC
        address proxyFactory = 0x1234567890123456789012345678901234567890; // Mock
        address safeFactory = 0x1234567890123456789012345678901234567891; // Mock
        
        console.log("CTF address:", ctf);
        console.log("Collateral address:", collateral);
        console.log("Proxy Factory address:", proxyFactory);
        console.log("Safe Factory address:", safeFactory);
        
        vm.startBroadcast();
        
        // 部署CTF Exchange
        CTFExchange exchange = new CTFExchange(collateral, ctf, proxyFactory, safeFactory);
        
        // 设置权限
        exchange.addAdmin(vm.addr(vm.envUint("PRIVATE_KEY")));
        exchange.addOperator(vm.addr(vm.envUint("PRIVATE_KEY")));
        
        vm.stopBroadcast();
        
        console.log("Final CTF Exchange deployed at:", address(exchange));
        console.log("Deployment completed successfully!");
        
        // 验证部署
        uint256 codeSize;
        assembly {
            codeSize := extcodesize(exchange)
        }
        console.log("Exchange contract code size:", codeSize);
        
        if (codeSize > 0) {
            console.log("Exchange contract deployed successfully!");
        } else {
            console.log("Exchange contract deployment failed!");
        }
    }
}
