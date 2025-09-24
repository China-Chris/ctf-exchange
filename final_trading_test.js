// 最终交易功能测试 - 使用正确的nonce值
const { ethers } = require('ethers');

// 私钥和地址
const PRIVATE_KEY = '8ad5b3c82c433bb80dda9510959e94a695b1ff5d8ae01da4fac55b05494aa0f5';
const wallet = new ethers.Wallet(PRIVATE_KEY);

// 合约地址
const EXCHANGE_ADDRESS = '0x666DDb461FDb5E10BF6329513D609615C069E489';

// EIP712 Domain
const DOMAIN = {
    name: "Polymarket CTF Exchange",
    version: "1",
    chainId: 133,
    verifyingContract: EXCHANGE_ADDRESS
};

// Order结构体类型
const TYPES = {
    Order: [
        { name: "salt", type: "uint256" },
        { name: "maker", type: "address" },
        { name: "signer", type: "address" },
        { name: "taker", type: "address" },
        { name: "tokenId", type: "uint256" },
        { name: "makerAmount", type: "uint256" },
        { name: "takerAmount", type: "uint256" },
        { name: "expiration", type: "uint256" },
        { name: "nonce", type: "uint256" },
        { name: "feeRateBps", type: "uint256" },
        { name: "side", type: "uint8" },
        { name: "signatureType", type: "uint8" }
    ]
};

// 创建测试订单 - 使用正确的nonce值
function createTestOrder(nonce = 1, side = 0) {
    const currentTime = Math.floor(Date.now() / 1000);
    
    return {
        salt: ethers.getBigInt(ethers.hexlify(ethers.randomBytes(32))),
        maker: wallet.address,
        signer: wallet.address,
        taker: "0x0000000000000000000000000000000000000000",
        tokenId: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        makerAmount: ethers.parseUnits("100", 6), // 100 USDC
        takerAmount: ethers.parseUnits("50", 6),  // 50 YES代币
        expiration: BigInt(currentTime + 86400), // 24小时后过期
        nonce: nonce,
        feeRateBps: 200, // 2%
        side: side, // 0=BUY, 1=SELL
        signatureType: 0 // EOA
    };
}

// 创建EIP712签名
async function createEIP712Signature(order) {
    try {
        const signature = await wallet.signTypedData(DOMAIN, TYPES, order);
        return signature;
    } catch (error) {
        console.error('EIP712签名错误:', error);
        return null;
    }
}

// 生成最终测试命令
async function generateFinalTestCommands() {
    console.log('🎯 最终交易功能测试命令');
    console.log('=======================');
    
    // 1. 创建买入订单 (nonce = 1)
    const buyOrder = createTestOrder(1, 0); // BUY
    const buySignature = await createEIP712Signature(buyOrder);
    
    console.log('\n📋 买入订单数据 (nonce=1):');
    console.log('==========================');
    console.log('Salt:', buyOrder.salt.toString(16));
    console.log('Maker:', buyOrder.maker);
    console.log('TokenId:', buyOrder.tokenId);
    console.log('MakerAmount:', buyOrder.makerAmount.toString());
    console.log('TakerAmount:', buyOrder.takerAmount.toString());
    console.log('Nonce:', buyOrder.nonce);
    console.log('Side:', buyOrder.side, '(0=BUY)');
    console.log('Signature:', buySignature);
    
    // 2. 创建卖出订单 (nonce = 2)
    const sellOrder = createTestOrder(2, 1); // SELL
    const sellSignature = await createEIP712Signature(sellOrder);
    
    console.log('\n📋 卖出订单数据 (nonce=2):');
    console.log('==========================');
    console.log('Salt:', sellOrder.salt.toString(16));
    console.log('Maker:', sellOrder.maker);
    console.log('TokenId:', sellOrder.tokenId);
    console.log('MakerAmount:', sellOrder.makerAmount.toString());
    console.log('TakerAmount:', sellOrder.takerAmount.toString());
    console.log('Nonce:', sellOrder.nonce);
    console.log('Side:', sellOrder.side, '(1=SELL)');
    console.log('Signature:', sellSignature);
    
    // 生成测试命令
    console.log('\n🔧 最终测试命令:');
    console.log('===============');
    
    // 1. 订单验证测试
    console.log('\n# 1. 买入订单验证测试 (nonce=1)');
    console.log(`cast call ${EXCHANGE_ADDRESS} "validateOrder((uint256,address,address,address,uint256,uint256,uint256,uint256,uint256,uint256,uint8,uint8,bytes))" \\`);
    console.log(`  "(0x${buyOrder.salt.toString(16)},${buyOrder.maker},${buyOrder.signer},${buyOrder.taker},0x${buyOrder.tokenId.slice(2)},${buyOrder.makerAmount.toString()},${buyOrder.takerAmount.toString()},${buyOrder.expiration},${buyOrder.nonce},${buyOrder.feeRateBps},${buyOrder.side},${buyOrder.signatureType},${buySignature})" \\`);
    console.log(`  --rpc-url https://testnet.hsk.xyz`);
    
    console.log('\n# 2. 卖出订单验证测试 (nonce=2)');
    console.log(`cast call ${EXCHANGE_ADDRESS} "validateOrder((uint256,address,address,address,uint256,uint256,uint256,uint256,uint256,uint256,uint8,uint8,bytes))" \\`);
    console.log(`  "(0x${sellOrder.salt.toString(16)},${sellOrder.maker},${sellOrder.signer},${sellOrder.taker},0x${sellOrder.tokenId.slice(2)},${sellOrder.makerAmount.toString()},${sellOrder.takerAmount.toString()},${sellOrder.expiration},${sellOrder.nonce},${sellOrder.feeRateBps},${sellOrder.side},${sellOrder.signatureType},${sellSignature})" \\`);
    console.log(`  --rpc-url https://testnet.hsk.xyz`);
    
    // 2. 订单填充测试
    console.log('\n# 3. 买入订单填充测试');
    console.log(`cast send ${EXCHANGE_ADDRESS} "fillOrder((uint256,address,address,address,uint256,uint256,uint256,uint256,uint256,uint256,uint8,uint8,bytes),uint256)" \\`);
    console.log(`  "(0x${buyOrder.salt.toString(16)},${buyOrder.maker},${buyOrder.signer},${buyOrder.taker},0x${buyOrder.tokenId.slice(2)},${buyOrder.makerAmount.toString()},${buyOrder.takerAmount.toString()},${buyOrder.expiration},${buyOrder.nonce},${buyOrder.feeRateBps},${buyOrder.side},${buyOrder.signatureType},${buySignature})" \\`);
    console.log(`  "1000000" \\`);
    console.log(`  --rpc-url https://testnet.hsk.xyz \\`);
    console.log(`  --private-key ${PRIVATE_KEY}`);
    
    console.log('\n# 4. 卖出订单填充测试');
    console.log(`cast send ${EXCHANGE_ADDRESS} "fillOrder((uint256,address,address,address,uint256,uint256,uint256,uint256,uint256,uint256,uint8,uint8,bytes),uint256)" \\`);
    console.log(`  "(0x${sellOrder.salt.toString(16)},${sellOrder.maker},${sellOrder.signer},${sellOrder.taker},0x${sellOrder.tokenId.slice(2)},${sellOrder.makerAmount.toString()},${sellOrder.takerAmount.toString()},${sellOrder.expiration},${sellOrder.nonce},${sellOrder.feeRateBps},${sellOrder.side},${sellOrder.signatureType},${sellSignature})" \\`);
    console.log(`  "50000000" \\`);
    console.log(`  --rpc-url https://testnet.hsk.xyz \\`);
    console.log(`  --private-key ${PRIVATE_KEY}`);
    
    // 3. 订单匹配测试
    console.log('\n# 5. 订单匹配测试（买入 vs 卖出）');
    console.log(`cast send ${EXCHANGE_ADDRESS} "matchOrders((uint256,address,address,address,uint256,uint256,uint256,uint256,uint256,uint256,uint8,uint8,bytes),(uint256,address,address,address,uint256,uint256,uint256,uint256,uint256,uint256,uint8,uint8,bytes)[],uint256,uint256[])" \\`);
    console.log(`  "(0x${buyOrder.salt.toString(16)},${buyOrder.maker},${buyOrder.signer},${buyOrder.taker},0x${buyOrder.tokenId.slice(2)},${buyOrder.makerAmount.toString()},${buyOrder.takerAmount.toString()},${buyOrder.expiration},${buyOrder.nonce},${buyOrder.feeRateBps},${buyOrder.side},${buyOrder.signatureType},${buySignature})" \\`);
    console.log(`  "[(0x${sellOrder.salt.toString(16)},${sellOrder.maker},${sellOrder.signer},${sellOrder.taker},0x${sellOrder.tokenId.slice(2)},${sellOrder.makerAmount.toString()},${sellOrder.takerAmount.toString()},${sellOrder.expiration},${sellOrder.nonce},${sellOrder.feeRateBps},${sellOrder.side},${sellOrder.signatureType},${sellSignature})]" \\`);
    console.log(`  "1000000" \\`);
    console.log(`  "[50000000]" \\`);
    console.log(`  --rpc-url https://testnet.hsk.xyz \\`);
    console.log(`  --private-key ${PRIVATE_KEY}`);
    
    console.log('\n📝 测试说明:');
    console.log('===========');
    console.log('1. 使用正确的nonce值 (1和2)');
    console.log('2. 包含完整的EIP712签名');
    console.log('3. 支持买入和卖出订单');
    console.log('4. 实现订单验证、填充、匹配功能');
    console.log('5. 所有命令都使用真实的合约地址');
}

// 运行测试
if (require.main === module) {
    generateFinalTestCommands().catch(console.error);
}

module.exports = { 
    createTestOrder, 
    createEIP712Signature,
    generateFinalTestCommands 
};
