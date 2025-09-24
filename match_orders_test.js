const { ethers } = require('ethers');

// 配置
const RPC_URL = 'https://testnet.hsk.xyz';
const PRIVATE_KEY = '8ad5b3c82c433bb80dda9510959e94a695b1ff5d8ae01da4fac55b05494aa0f5';
const EXCHANGE_ADDRESS = '0x666DDb461FDb5E10BF6329513D609615C069E489';

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

// 创建taker订单 (买入订单, nonce=5)
function createTakerOrder() {
    const order = {
        salt: ethers.getBigInt(ethers.hexlify(ethers.randomBytes(32))),
        maker: wallet.address,
        taker: ethers.ZeroAddress,
        tokenId: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        makerAmount: ethers.parseEther("100"), // 100 USDC
        takerAmount: ethers.parseEther("50"),  // 50 YES tokens
        expiration: Math.floor(Date.now() / 1000) + 3600, // 1小时后过期
        nonce: 5,
        feeRateBps: 200, // 2%
        side: 0 // BUY
    };
    
    return order;
}

// 创建maker订单 (卖出订单, nonce=4)
function createMakerOrder() {
    const order = {
        salt: ethers.getBigInt(ethers.hexlify(ethers.randomBytes(32))),
        maker: wallet.address,
        taker: ethers.ZeroAddress,
        tokenId: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        makerAmount: ethers.parseEther("50"),  // 50 YES tokens
        takerAmount: ethers.parseEther("100"), // 100 USDC
        expiration: Math.floor(Date.now() / 1000) + 3600, // 1小时后过期
        nonce: 4,
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

// 生成matchOrders命令
async function generateMatchOrdersCommand() {
    console.log("🔍 生成订单匹配测试命令");
    console.log("==============================");
    
    const takerOrder = createTakerOrder();
    const makerOrder = createMakerOrder();
    
    console.log("Taker订单 (买入, nonce=5):");
    console.log("- makerAmount:", takerOrder.makerAmount.toString());
    console.log("- takerAmount:", takerOrder.takerAmount.toString());
    console.log("- side:", takerOrder.side);
    console.log("- nonce:", takerOrder.nonce.toString());
    
    console.log("\nMaker订单 (卖出, nonce=4):");
    console.log("- makerAmount:", makerOrder.makerAmount.toString());
    console.log("- takerAmount:", makerOrder.takerAmount.toString());
    console.log("- side:", makerOrder.side);
    console.log("- nonce:", makerOrder.nonce.toString());
    
    // 签名订单
    const takerSignature = await signOrder(takerOrder);
    const makerSignature = await signOrder(makerOrder);
    
    console.log("\n✅ 订单签名完成");
    console.log("Taker签名:", takerSignature);
    console.log("Maker签名:", makerSignature);
    
    // 生成cast命令
    const takerOrderData = `(${takerOrder.salt},${takerOrder.maker},${takerOrder.taker},${takerOrder.tokenId},${takerOrder.makerAmount},${takerOrder.takerAmount},${takerOrder.expiration},${takerOrder.nonce},${takerOrder.feeRateBps},${takerOrder.side},${takerSignature})`;
    
    const makerOrderData = `(${makerOrder.salt},${makerOrder.maker},${makerOrder.taker},${makerOrder.tokenId},${makerOrder.makerAmount},${makerOrder.takerAmount},${makerOrder.expiration},${makerOrder.nonce},${makerOrder.feeRateBps},${makerOrder.side},${makerSignature})`;
    
    console.log("\n📋 生成的cast命令:");
    console.log("cast send", EXCHANGE_ADDRESS, "matchOrders((uint256,address,address,uint256,uint256,uint256,uint256,uint256,uint256,uint8,bytes),(uint256,address,address,uint256,uint256,uint256,uint256,uint256,uint256,uint8,bytes)[],uint256,uint256[])" +
        " \\\n  " + takerOrderData +
        " \\\n  [" + makerOrderData + "]" +
        " \\\n  " + "1000000" + // takerFillAmount
        " \\\n  [" + "1000000" + "]" + // makerFillAmounts
        " \\\n  --rpc-url https://testnet.hsk.xyz" +
        " \\\n  --private-key 8ad5b3c82c433bb80dda9510959e94a695b1ff5d8ae01da4fac55b05494aa0f5" +
        " \\\n  --gas-limit 2000000");
}

// 运行
generateMatchOrdersCommand().catch(console.error);
