// SPDX-License-Identifier: MIT
pragma solidity ^0.8.15;

import { Script } from "forge-std/Script.sol";
import { console } from "forge-std/console.sol";
import { CTFExchange } from "exchange/CTFExchange.sol";

/// @title RealCTFExchangeDeploy
/// @notice 使用真正的CTF合约部署CTF Exchange
/// @author Polymarket
contract RealCTFExchangeDeploy is Script {
    /// @notice Deploys the CTF Exchange with real CTF contract
    function run() external {
        // 使用新部署的真正合约地址
        address admin = 0x319749f49C884a2F0141e53187dd1454E217786f;
        address collateral = 0xC1C68E532E3F2e1F40e6b5EBC9D6c5f8c5e803D6; // 真正的USDC
        address ctf = 0x3431D37cEF4E795eb43db8E35DBD291Fc1db57f3; // 真正的CTF
        address proxyFactory = 0xdd097cA2089293a1b25cc6c9b1810E5784745EB4; // 代理工厂
        address safeFactory = 0xc197a5D3956b8d0aaDe25E35ae9C115cf935f6AB; // 安全工厂
        
        console.log("Deploying CTF Exchange with real CTF contract...");
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
        
        vm.stopBroadcast();
        
        console.log("CTF Exchange deployed at:", address(exchange));
        console.log("Deployment completed successfully!");
    }
}
