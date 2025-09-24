// SPDX-License-Identifier: MIT
pragma solidity ^0.8.15;

import { Script } from "forge-std/Script.sol";
import { console } from "forge-std/console.sol";
import { CTFExchange } from "exchange/CTFExchange.sol";

/// @title HashKeyDeployment
/// @notice Script to deploy the CTF Exchange to HashKey testnet
/// @author Polymarket
contract HashKeyDeployment is Script {
    /// @notice Deploys the Exchange contract to HashKey testnet
    function run() external {
        // 使用新部署的合约地址
        address admin = 0x319749f49C884a2F0141e53187dd1454E217786f;
        address collateral = 0x2Ea1C00C8d9A4b4201bB58CA425BeE0aC15FE6B1;
        address ctf = 0x23Ce283468547e03587132e5a0abFd72CBbf2443;
        address proxyFactory = 0x4cC462cd1F2100DF596678780121bb09434d6C95;
        address safeFactory = 0xC5474381690D25Fa6F800ab90358aD2B7fCdFd9F;
        
        console.log("Deploying CTF Exchange to HashKey testnet...");
        console.log("Admin:", admin);
        console.log("Collateral:", collateral);
        console.log("CTF:", ctf);
        console.log("Proxy Factory:", proxyFactory);
        console.log("Safe Factory:", safeFactory);
        
        vm.startBroadcast();
        
        // 部署 CTF Exchange
        CTFExchange exchange = new CTFExchange(collateral, ctf, proxyFactory, safeFactory);
        
        // 授予管理员权限
        exchange.addAdmin(admin);
        exchange.addOperator(admin);
        
        // 注意：不撤销部署者的权限，因为部署者就是管理员
        
        vm.stopBroadcast();
        
        console.log("CTF Exchange deployed at:", address(exchange));
        console.log("Deployment completed successfully!");
    }
}
