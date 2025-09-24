// 完整的交易功能测试
// 实现订单创建、验证、填充、匹配

const { ethers } = require('ethers');

// 私钥和地址
const PRIVATE_KEY = '8ad5b3c82c433bb80dda9510959e94a695b1ff5d8ae01da4fac55b05494aa0f5';
const wallet = new ethers.Wallet(PRIVATE_KEY);

// 合约地址
const EXCHANGE_ADDRESS = '0x666DDb461FDb5E10BF6329513D609615C069E489';
const USDC_ADDRESS = '0xC1C68E532E3F2e1F40e6b5EBC9D6c5f8c5e803D6';
const CTF_ADDRESS = '0x3431D37cEF4E795eb43db8E35DBD291Fc1db57f3';

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

// 创建测试订单
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

// 生成完整的交易测试命令
async function generateTradingCommands() {
    console.log('🚀 完整交易功能测试命令');
    console.log('========================');
    
    // 1. 创建买入订单
    const buyOrder = createTestOrder(1, 0); // BUY
    const buySignature = await createEIP712Signature(buyOrder);
    
    console.log('\n📋 买入订单数据:');
    console.log('================');
    console.log('Order:', {
        salt: buyOrder.salt.toString(16),
        maker: buyOrder.maker,
        signer: buyOrder.signer,
        taker: buyOrder.taker,
        tokenId: buyOrder.tokenId,
        makerAmount: buyOrder.makerAmount.toString(),
        takerAmount: buyOrder.takerAmount.toString(),
        expiration: buyOrder.expiration.toString(),
        nonce: buyOrder.nonce,
        feeRateBps: buyOrder.feeRateBps,
        side: buyOrder.side,
        signatureType: buyOrder.signatureType
    });
    console.log('Signature:', buySignature);
    
    // 2. 创建卖出订单
    const sellOrder = createTestOrder(2, 1); // SELL
    const sellSignature = await createEIP712Signature(sellOrder);
    
    console.log('\n📋 卖出订单数据:');
    console.log('================');
    console.log('Order:', {
        salt: sellOrder.salt.toString(16),
        maker: sellOrder.maker,
        signer: sellOrder.signer,
        taker: sellOrder.taker,
        tokenId: sellOrder.tokenId,
        makerAmount: sellOrder.makerAmount.toString(),
        takerAmount: sellOrder.takerAmount.toString(),
        expiration: sellOrder.expiration.toString(),
        nonce: sellOrder.nonce,
        feeRateBps: sellOrder.feeRateBps,
        side: sellOrder.side,
        signatureType: sellOrder.signatureType
    });
    console.log('Signature:', sellSignature);
    
    // 生成测试命令
    console.log('\n🔧 交易测试命令:');
    console.log('===============');
    
    // 1. 订单验证测试
    console.log('\n# 1. 买入订单验证测试');
    console.log(`cast call ${EXCHANGE_ADDRESS} "validateOrder((uint256,address,address,address,uint256,uint256,uint256,uint256,uint256,uint256,uint8,uint8,bytes))" \\`);
    console.log(`  "(0x${buyOrder.salt.toString(16)},${buyOrder.maker},${buyOrder.signer},${buyOrder.taker},0x${buyOrder.tokenId.slice(2)},${buyOrder.makerAmount.toString()},${buyOrder.takerAmount.toString()},${buyOrder.expiration},${buyOrder.nonce},${buyOrder.feeRateBps},${buyOrder.side},${buyOrder.signatureType},${buySignature})" \\`);
    console.log(`  --rpc-url https://testnet.hsk.xyz`);
    
    console.log('\n# 2. 卖出订单验证测试');
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
    
    // 4. 其他测试命令
    console.log('\n# 6. 检查订单状态');
    console.log(`cast call ${EXCHANGE_ADDRESS} "getOrderStatus(bytes32)" "0x$(ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(['uint256','address','address','address','uint256','uint256','uint256','uint256','uint256','uint256','uint8','uint8'], [${buyOrder.salt},'${buyOrder.maker}','${buyOrder.signer}','${buyOrder.taker}',${buyOrder.tokenId},${buyOrder.makerAmount},${buyOrder.takerAmount},${buyOrder.expiration},${buyOrder.nonce},${buyOrder.feeRateBps},${buyOrder.side},${buyOrder.signatureType}])))" --rpc-url https://testnet.hsk.xyz`);
    
    console.log('\n# 7. 检查nonce状态');
    console.log(`cast call ${EXCHANGE_ADDRESS} "isValidNonce(address,uint256)" ${wallet.address} 1 --rpc-url https://testnet.hsk.xyz`);
    
    console.log('\n# 8. 检查代币注册状态');
    console.log(`cast call ${EXCHANGE_ADDRESS} "getComplement(uint256)" 0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef --rpc-url https://testnet.hsk.xyz`);
    
    console.log('\n📝 测试说明:');
    console.log('===========');
    console.log('1. 这些命令实现了完整的交易功能测试');
    console.log('2. 包括订单创建、验证、填充、匹配');
    console.log('3. 支持买入和卖出两种订单类型');
    console.log('4. 使用EIP712签名确保安全性');
    console.log('5. 所有命令都使用真实的合约地址');
}

// 运行测试
if (require.main === module) {
    generateTradingCommands().catch(console.error);
}

module.exports = { 
    createTestOrder, 
    createEIP712Signature,
    generateTradingCommands 
};
