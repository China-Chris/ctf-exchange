const { ethers } = require('ethers');

// 配置
const RPC_URL = 'https://testnet.hsk.xyz';
const PRIVATE_KEY = '8ad5b3c82c433bb80dda9510959e94a695b1ff5d8ae01da4fac55b05494aa0f5';
const EXCHANGE_ADDRESS = '0x666DDb461FDb5E10BF6329513D609615C069E489';
const NEW_CTF_ADDRESS = '0x3338E58FAFfE71F89b2Bcb48384C9424c36060c6';
const USDC_ADDRESS = '0xC1C68E532E3F2e1F40e6b5EBC9D6c5f8c5e803D6';

// 创建provider和wallet
const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// EIP712 domain
const domain = {
    name: "Polymarket CTF Exchange",
    version: "1",
    chainId: 133,
    verifyingContract: EXCHANGE_ADDRESS
};

// Order类型定义
const orderType = {
    Order: [
        { name: "salt", type: "uint256" },
        { name: "maker", type: "address" },
        { name: "taker", type: "address" },
        { name: "tokenId", type: "uint256" },
        { name: "makerAmount", type: "uint256" },
        { name: "takerAmount", type: "uint256" },
        { name: "expiration", type: "uint256" },
        { name: "nonce", type: "uint256" },
        { name: "feeRateBps", type: "uint256" },
        { name: "side", type: "uint8" }
    ]
};

// 创建测试订单
function createTestOrder(nonce, side, makerAmount, takerAmount) {
    const order = {
        salt: ethers.getBigInt(ethers.hexlify(ethers.randomBytes(32))),
        maker: wallet.address,
        taker: ethers.ZeroAddress,
        tokenId: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        makerAmount: ethers.parseEther(makerAmount.toString()),
        takerAmount: ethers.parseEther(takerAmount.toString()),
        expiration: Math.floor(Date.now() / 1000) + 3600, // 1小时后过期
        nonce: nonce,
        feeRateBps: 200, // 2%
        side: side // 0=BUY, 1=SELL
    };
    
    return order;
}

// 签名订单
async function signOrder(order) {
    const signature = await wallet.signTypedData(domain, orderType, order);
    return signature;
}

// 生成完整的测试命令
async function generateCompleteTestCommands() {
    console.log("🚀 完整CTF Exchange功能测试");
    console.log("==============================");
    
    // 创建测试订单
    const buyOrder = createTestOrder(7, 0, 100, 50);  // 买入订单：100 USDC -> 50 YES
    const sellOrder = createTestOrder(8, 1, 50, 100); // 卖出订单：50 YES -> 100 USDC
    
    console.log("买入订单 (nonce=7):");
    console.log("- makerAmount:", buyOrder.makerAmount.toString());
    console.log("- takerAmount:", buyOrder.takerAmount.toString());
    console.log("- side:", buyOrder.side);
    
    console.log("\n卖出订单 (nonce=8):");
    console.log("- makerAmount:", sellOrder.makerAmount.toString());
    console.log("- takerAmount:", sellOrder.takerAmount.toString());
    console.log("- side:", sellOrder.side);
    
    // 签名订单
    const buySignature = await signOrder(buyOrder);
    const sellSignature = await signOrder(sellOrder);
    
    console.log("\n✅ 订单签名完成");
    
    // 生成订单数据
    const buyOrderData = `(${buyOrder.salt},${buyOrder.maker},${buyOrder.taker},${buyOrder.tokenId},${buyOrder.makerAmount},${buyOrder.takerAmount},${buyOrder.expiration},${buyOrder.nonce},${buyOrder.feeRateBps},${buyOrder.side},${buySignature})`;
    const sellOrderData = `(${sellOrder.salt},${sellOrder.maker},${sellOrder.taker},${sellOrder.tokenId},${sellOrder.makerAmount},${sellOrder.takerAmount},${sellOrder.expiration},${sellOrder.nonce},${sellOrder.feeRateBps},${sellOrder.side},${sellSignature})`;
    
    console.log("\n📋 完整测试命令序列:");
    
    console.log("\n=== 第一阶段：基础功能测试 ===");
    console.log("\n1. 增加nonce到7:");
    console.log("cast send", EXCHANGE_ADDRESS, "incrementNonce()" +
        " \\\n  --rpc-url https://testnet.hsk.xyz" +
        " \\\n  --private-key 8ad5b3c82c433bb80dda9510959e94a695b1ff5d8ae01da4fac55b05494aa0f5" +
        " \\\n  --gas-limit 100000");
    
    console.log("\n2. 增加nonce到8:");
    console.log("cast send", EXCHANGE_ADDRESS, "incrementNonce()" +
        " \\\n  --rpc-url https://testnet.hsk.xyz" +
        " \\\n  --private-key 8ad5b3c82c433bb80dda9510959e94a695b1ff5d8ae01da4fac55b05494aa0f5" +
        " \\\n  --gas-limit 100000");
    
    console.log("\n=== 第二阶段：新CTF合约功能测试 ===");
    console.log("\n3. 检查新CTF合约代币余额:");
    console.log("cast call", NEW_CTF_ADDRESS, "balanceOf(address,uint256)" +
        " \\\n  " + wallet.address +
        " \\\n  " + buyOrder.tokenId +
        " \\\n  --rpc-url https://testnet.hsk.xyz");
    
    console.log("\n4. 铸造更多代币到新CTF合约:");
    console.log("cast send", NEW_CTF_ADDRESS, "mint(address,uint256,uint256)" +
        " \\\n  " + wallet.address +
        " \\\n  " + buyOrder.tokenId +
        " \\\n  " + "50000000" +
        " \\\n  --rpc-url https://testnet.hsk.xyz" +
        " \\\n  --private-key 8ad5b3c82c433bb80dda9510959e94a695b1ff5d8ae01da4fac55b05494aa0f5" +
        " \\\n  --gas-limit 1000000");
    
    console.log("\n=== 第三阶段：订单验证测试 ===");
    console.log("\n5. 验证买入订单:");
    console.log("cast call", EXCHANGE_ADDRESS, "validateOrder((uint256,address,address,uint256,uint256,uint256,uint256,uint256,uint256,uint8,bytes))" +
        " \\\n  " + buyOrderData +
        " \\\n  --rpc-url https://testnet.hsk.xyz");
    
    console.log("\n6. 验证卖出订单:");
    console.log("cast call", EXCHANGE_ADDRESS, "validateOrder((uint256,address,address,uint256,uint256,uint256,uint256,uint256,uint256,uint8,bytes))" +
        " \\\n  " + sellOrderData +
        " \\\n  --rpc-url https://testnet.hsk.xyz");
    
    console.log("\n=== 第四阶段：订单填充测试 ===");
    console.log("\n7. 测试买入订单填充:");
    console.log("cast send", EXCHANGE_ADDRESS, "fillOrder((uint256,address,address,uint256,uint256,uint256,uint256,uint256,uint256,uint8,bytes),uint256)" +
        " \\\n  " + buyOrderData +
        " \\\n  " + "1000000" +
        " \\\n  --rpc-url https://testnet.hsk.xyz" +
        " \\\n  --private-key 8ad5b3c82c433bb80dda9510959e94a695b1ff5d8ae01da4fac55b05494aa0f5" +
        " \\\n  --gas-limit 2000000");
    
    console.log("\n8. 测试卖出订单填充:");
    console.log("cast send", EXCHANGE_ADDRESS, "fillOrder((uint256,address,address,uint256,uint256,uint256,uint256,uint256,uint256,uint8,bytes),uint256)" +
        " \\\n  " + sellOrderData +
        " \\\n  " + "1000000" +
        " \\\n  --rpc-url https://testnet.hsk.xyz" +
        " \\\n  --private-key 8ad5b3c82c433bb80dda9510959e94a695b1ff5d8ae01da4fac55b05494aa0f5" +
        " \\\n  --gas-limit 2000000");
    
    console.log("\n=== 第五阶段：订单匹配测试 ===");
    console.log("\n9. 测试订单匹配:");
    console.log("cast send", EXCHANGE_ADDRESS, "matchOrders((uint256,address,address,uint256,uint256,uint256,uint256,uint256,uint256,uint8,bytes),(uint256,address,address,uint256,uint256,uint256,uint256,uint256,uint256,uint8,bytes)[],uint256,uint256[])" +
        " \\\n  " + buyOrderData +
        " \\\n  [" + sellOrderData + "]" +
        " \\\n  " + "1000000" +
        " \\\n  [" + "1000000" + "]" +
        " \\\n  --rpc-url https://testnet.hsk.xyz" +
        " \\\n  --private-key 8ad5b3c82c433bb80dda9510959e94a695b1ff5d8ae01da4fac55b05494aa0f5" +
        " \\\n  --gas-limit 3000000");
    
    console.log("\n=== 第六阶段：验证测试结果 ===");
    console.log("\n10. 检查最终代币余额:");
    console.log("cast call", NEW_CTF_ADDRESS, "balanceOf(address,uint256)" +
        " \\\n  " + wallet.address +
        " \\\n  " + buyOrder.tokenId +
        " \\\n  --rpc-url https://testnet.hsk.xyz");
    
    console.log("\n11. 检查USDC余额:");
    console.log("cast call", USDC_ADDRESS, "balanceOf(address)" +
        " \\\n  " + wallet.address +
        " \\\n  --rpc-url https://testnet.hsk.xyz");
    
    console.log("\n🎯 测试目标：");
    console.log("- 验证所有ERC1155功能正常工作");
    console.log("- 测试订单验证、填充、匹配功能");
    console.log("- 验证完整的交易流程");
    console.log("- 确认TRANSFER_FROM_FAILED问题已解决");
}

// 运行
generateCompleteTestCommands().catch(console.error);
