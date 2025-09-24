// SPDX-License-Identifier: MIT
pragma solidity ^0.8.15;

import { Script } from "forge-std/Script.sol";
import { console } from "forge-std/console.sol";
import { ERC1155 } from "openzeppelin-contracts/token/ERC1155/ERC1155.sol";
import { Ownable } from "openzeppelin-contracts/access/Ownable.sol";

/// @title OpenZeppelinERC1155CTF
/// @notice 使用OpenZeppelin ERC1155实现的CTF合约
/// @author Polymarket
contract OpenZeppelinERC1155CTF is ERC1155, Ownable {
    
    constructor() ERC1155("") Ownable() {
        console.log("OpenZeppelin ERC1155 CTF contract deployed");
    }
    
    /// @notice 铸造代币
    /// @param to 接收者地址
    /// @param id 代币ID
    /// @param amount 数量
    function mint(address to, uint256 id, uint256 amount) external onlyOwner {
        _mint(to, id, amount, "");
    }
    
    /// @notice 批量铸造代币
    /// @param to 接收者地址
    /// @param ids 代币ID数组
    /// @param amounts 数量数组
    function mintBatch(address to, uint256[] memory ids, uint256[] memory amounts) external onlyOwner {
        _mintBatch(to, ids, amounts, "");
    }
    
    /// @notice 销毁代币
    /// @param from 持有者地址
    /// @param id 代币ID
    /// @param amount 数量
    function burn(address from, uint256 id, uint256 amount) external onlyOwner {
        _burn(from, id, amount);
    }
    
    /// @notice 批量销毁代币
    /// @param from 持有者地址
    /// @param ids 代币ID数组
    /// @param amounts 数量数组
    function burnBatch(address from, uint256[] memory ids, uint256[] memory amounts) external onlyOwner {
        _burnBatch(from, ids, amounts);
    }
}

/// @title OpenZeppelinERC1155CTFDeploy
/// @notice 部署OpenZeppelin ERC1155 CTF合约的脚本
contract OpenZeppelinERC1155CTFDeploy is Script {
    
    function run() external {
        console.log("Deploying OpenZeppelin ERC1155 CTF contract...");
        
        vm.startBroadcast();
        
        // 部署OpenZeppelin ERC1155 CTF合约
        OpenZeppelinERC1155CTF ctf = new OpenZeppelinERC1155CTF();
        
        vm.stopBroadcast();
        
        console.log("OpenZeppelin ERC1155 CTF contract deployed at:", address(ctf));
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
}
