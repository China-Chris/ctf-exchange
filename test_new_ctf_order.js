const { ethers } = require('ethers');

// 配置
const RPC_URL = 'https://testnet.hsk.xyz';
const PRIVATE_KEY = '8ad5b3c82c433bb80dda9510959e94a695b1ff5d8ae01da4fac55b05494aa0f5';
const EXCHANGE_ADDRESS = '0x666DDb461FDb5E10BF6329513D609615C069E489';
const NEW_CTF_ADDRESS = '0x3338E58FAFfE71F89b2Bcb48384C9424c36060c6';

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
function createTestOrder() {
    const order = {
        salt: ethers.getBigInt(ethers.hexlify(ethers.randomBytes(32))),
        maker: wallet.address,
        taker: ethers.ZeroAddress,
        tokenId: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        makerAmount: ethers.parseEther("50"),  // 50 YES tokens
        takerAmount: ethers.parseEther("100"), // 100 USDC
        expiration: Math.floor(Date.now() / 1000) + 3600, // 1小时后过期
        nonce: 6, // 使用新的nonce
        feeRateBps: 200, // 2%
        side: 1 // SELL
    };
    
    return order;
}

// 签名订单
async function signOrder(order) {
    const signature = await wallet.signTypedData(domain, orderType, order);
    return signature;
}

// 生成测试命令
async function generateTestCommands() {
    console.log("🔍 生成新CTF合约测试命令");
    console.log("==============================");
    
    const order = createTestOrder();
    
    console.log("测试订单 (卖出, nonce=6):");
    console.log("- makerAmount:", order.makerAmount.toString());
    console.log("- takerAmount:", order.takerAmount.toString());
    console.log("- side:", order.side);
    console.log("- nonce:", order.nonce.toString());
    
    // 签名订单
    const signature = await signOrder(order);
    
    console.log("\n✅ 订单签名完成");
    console.log("签名:", signature);
    
    // 生成cast命令
    const orderData = `(${order.salt},${order.maker},${order.taker},${order.tokenId},${order.makerAmount},${order.takerAmount},${order.expiration},${order.nonce},${order.feeRateBps},${order.side},${signature})`;
    
    console.log("\n📋 生成的测试命令:");
    console.log("\n1. 增加nonce到6:");
    console.log("cast send", EXCHANGE_ADDRESS, "incrementNonce()" +
        " \\\n  --rpc-url https://testnet.hsk.xyz" +
        " \\\n  --private-key 8ad5b3c82c433bb80dda9510959e94a695b1ff5d8ae01da4fac55b05494aa0f5" +
        " \\\n  --gas-limit 100000");
    
    console.log("\n2. 测试订单验证:");
    console.log("cast call", EXCHANGE_ADDRESS, "validateOrder((uint256,address,address,uint256,uint256,uint256,uint256,uint256,uint256,uint8,bytes))" +
        " \\\n  " + orderData +
        " \\\n  --rpc-url https://testnet.hsk.xyz");
    
    console.log("\n3. 测试订单填充:");
    console.log("cast send", EXCHANGE_ADDRESS, "fillOrder((uint256,address,address,uint256,uint256,uint256,uint256,uint256,uint256,uint8,bytes),uint256)" +
        " \\\n  " + orderData +
        " \\\n  " + "1000000" + // fillAmount
        " \\\n  --rpc-url https://testnet.hsk.xyz" +
        " \\\n  --private-key 8ad5b3c82c433bb80dda9510959e94a695b1ff5d8ae01da4fac55b05494aa0f5" +
        " \\\n  --gas-limit 2000000");
    
    console.log("\n4. 检查新CTF合约的代币余额:");
    console.log("cast call", NEW_CTF_ADDRESS, "balanceOf(address,uint256)" +
        " \\\n  " + wallet.address +
        " \\\n  " + order.tokenId +
        " \\\n  --rpc-url https://testnet.hsk.xyz");
}

// 运行
generateTestCommands().catch(console.error);
