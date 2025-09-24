// SPDX-License-Identifier: MIT
pragma solidity ^0.8.15;

import { Script } from "forge-std/Script.sol";
import { console } from "forge-std/console.sol";
import { Deployer } from "dev/util/Deployer.sol";

/// @title TestCTFDeploy
/// @notice 测试CTF合约部署
/// @author Polymarket
contract TestCTFDeploy is Script {
    
    function run() external {
        console.log("Testing CTF deployment...");
        
        vm.startBroadcast();
        
        // 尝试部署CTF合约
        address ctf = Deployer.ConditionalTokens();
        console.log("CTF deployed at:", ctf);
        
        vm.stopBroadcast();
        
        console.log("CTF deployment test completed!");
    }
}
