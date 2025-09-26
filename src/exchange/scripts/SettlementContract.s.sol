// SPDX-License-Identifier: MIT
pragma solidity ^0.8.15;

import { Script } from "forge-std/Script.sol";
import { console } from "forge-std/console.sol";
import { ERC1155 } from "openzeppelin-contracts/token/ERC1155/ERC1155.sol";
import { Ownable } from "openzeppelin-contracts/access/Ownable.sol";
import { IERC20 } from "openzeppelin-contracts/token/ERC20/IERC20.sol";

/// @title SettlementContract
/// @notice 清算合约 - 处理预测市场的结果设置和资产兑换
/// @author Polymarket
contract SettlementContract is Ownable {
    
    // 事件定义
    event MarketSettled(bytes32 indexed conditionId, uint256 outcome);
    event TokensRedeemed(address indexed user, uint256 indexed tokenId, uint256 amount);
    
    // 状态变量
    mapping(bytes32 => uint256) public marketResults; // conditionId => outcome (0=YES, 1=NO)
    mapping(bytes32 => bool) public isSettled; // conditionId => settled
    mapping(uint256 => bool) public validTokens; // tokenId => valid
    
    address public ctfToken;
    address public collateralToken;
    
    constructor(address _ctfToken, address _collateralToken) Ownable() {
        ctfToken = _ctfToken;
        collateralToken = _collateralToken;
    }
    
    /// @notice 设置市场结果（只有owner可以调用）
    /// @param conditionId 事件ID
    /// @param outcome 结果 (0=YES, 1=NO)
    function setMarketResult(bytes32 conditionId, uint256 outcome) external onlyOwner {
        require(!isSettled[conditionId], "Market already settled");
        require(outcome == 0 || outcome == 1, "Invalid outcome");
        
        marketResults[conditionId] = outcome;
        isSettled[conditionId] = true;
        
        // 标记获胜代币为有效
        if (outcome == 0) {
            // YES获胜
            validTokens[uint256(conditionId)] = true;
        } else {
            // NO获胜
            validTokens[uint256(conditionId) ^ 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff] = true;
        }
        
        emit MarketSettled(conditionId, outcome);
    }
    
    /// @notice 兑换获胜代币为抵押品
    /// @param tokenId 代币ID
    /// @param amount 兑换数量
    function redeemTokens(uint256 tokenId, uint256 amount) external {
        require(validTokens[tokenId], "Token not valid for redemption");
        require(amount > 0, "Amount must be greater than 0");
        
        // 检查用户是否有足够的代币
        require(ERC1155(ctfToken).balanceOf(msg.sender, tokenId) >= amount, "Insufficient token balance");
        
        // 检查合约是否有足够的抵押品
        require(IERC20(collateralToken).balanceOf(address(this)) >= amount, "Insufficient collateral balance");
        
        // 转移代币到合约
        ERC1155(ctfToken).safeTransferFrom(msg.sender, address(this), tokenId, amount, "");
        
        // 转移抵押品给用户
        IERC20(collateralToken).transfer(msg.sender, amount);
        
        emit TokensRedeemed(msg.sender, tokenId, amount);
    }
    
    /// @notice 检查代币是否可以兑换
    /// @param tokenId 代币ID
    /// @return 是否可以兑换
    function canRedeem(uint256 tokenId) external view returns (bool) {
        return validTokens[tokenId];
    }
    
    /// @notice 获取市场结果
    /// @param conditionId 事件ID
    /// @return 结果 (0=YES, 1=NO)
    function getMarketResult(bytes32 conditionId) external view returns (uint256) {
        require(isSettled[conditionId], "Market not settled");
        return marketResults[conditionId];
    }
    
    /// @notice 检查市场是否已结算
    /// @param conditionId 事件ID
    /// @return 是否已结算
    function isMarketSettled(bytes32 conditionId) external view returns (bool) {
        return isSettled[conditionId];
    }
    
    /// @notice 向合约存入抵押品（用于兑换）
    /// @param amount 存入数量
    function depositCollateral(uint256 amount) external {
        IERC20(collateralToken).transferFrom(msg.sender, address(this), amount);
    }
    
    /// @notice 提取抵押品（只有owner可以调用）
    /// @param amount 提取数量
    function withdrawCollateral(uint256 amount) external onlyOwner {
        IERC20(collateralToken).transfer(owner(), amount);
    }
}

/// @title SettlementContractDeploy
/// @notice 部署清算合约的脚本
contract SettlementContractDeploy is Script {
    
    function run() external {
        console.log("Deploying Settlement Contract...");
        
        // 使用现有的合约地址
        address ctfToken = 0x3338E58FAFfE71F89b2Bcb48384C9424c36060c6;
        address collateralToken = 0xC1C68E532E3F2e1F40e6b5EBC9D6c5f8c5e803D6;
        
        console.log("CTF Token address:", ctfToken);
        console.log("Collateral Token address:", collateralToken);
        
        vm.startBroadcast();
        
        // 部署清算合约
        SettlementContract settlement = new SettlementContract(ctfToken, collateralToken);
        
        vm.stopBroadcast();
        
        console.log("Settlement Contract deployed at:", address(settlement));
        console.log("Deployment completed successfully!");
        
        // 验证部署
        uint256 codeSize;
        assembly {
            codeSize := extcodesize(settlement)
        }
        console.log("Settlement contract code size:", codeSize);
        
        if (codeSize > 0) {
            console.log("Settlement contract deployed successfully!");
        } else {
            console.log("Settlement contract deployment failed!");
        }
    }
}
