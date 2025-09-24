// SPDX-License-Identifier: MIT
pragma solidity ^0.8.15;

import { Script } from "forge-std/Script.sol";
import { console } from "forge-std/console.sol";
import { Deployer } from "dev/util/Deployer.sol";

/// @title DeployCTF
/// @notice 使用Deployer库部署CTF合约
/// @author Polymarket
contract DeployCTF is Script {
    
    function run() external {
        console.log("Deploying CTF contract using Deployer...");
        
        vm.startBroadcast();
        
        // 使用Deployer库部署CTF合约
        address ctf = Deployer.ConditionalTokens();
        
        vm.stopBroadcast();
        
        console.log("CTF contract deployed at:", ctf);
        console.log("Deployment completed successfully!");
        
        // 验证部署
        uint256 codeSize;
        assembly {
            codeSize := extcodesize(ctf)
        }
        console.log("CTF contract code size:", codeSize);
    }
}
