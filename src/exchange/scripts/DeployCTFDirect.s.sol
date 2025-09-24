// SPDX-License-Identifier: MIT
pragma solidity ^0.8.15;

import { Script } from "forge-std/Script.sol";
import { console } from "forge-std/console.sol";

/// @title DeployCTFDirect
/// @notice 使用create2直接部署完整的CTF合约
/// @author Polymarket
contract DeployCTFDirect is Script {
    
    function run() external {
        console.log("Deploying CTF contract using create2...");
        
        vm.startBroadcast();
        
        // 使用create2部署CTF合约
        address ctf = deployCTFWithCreate2();
        
        vm.stopBroadcast();
        
        console.log("CTF contract deployed at:", ctf);
        console.log("Deployment completed successfully!");
        
        // 验证部署
        uint256 codeSize;
        assembly {
            codeSize := extcodesize(ctf)
        }
        console.log("CTF contract code size:", codeSize);
        
        if (codeSize > 0) {
            console.log("CTF contract deployed successfully!");
        } else {
            console.log("CTF contract deployment failed!");
        }
    }
    
    function deployCTFWithCreate2() internal returns (address) {
        // 从artifacts文件读取bytecode
        string memory jsonPath = "artifacts/ConditionalTokens.json";
        bytes memory bytecode = vm.getCode(jsonPath);
        
        console.log("Bytecode length:", bytecode.length);
        
        // 使用create2部署
        bytes32 salt = keccak256("CTF-ConditionalTokens-2024");
        address ctf;
        
        assembly {
            ctf := create2(0, add(bytecode, 0x20), mload(bytecode), salt)
        }
        
        require(ctf != address(0), "CTF deployment failed");
        return ctf;
    }
}
