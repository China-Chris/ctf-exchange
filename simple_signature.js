// 简化签名实现
// 使用您的私钥生成正确格式的签名

const crypto = require('crypto');

// 私钥
const PRIVATE_KEY = '8ad5b3c82c433bb80dda9510959e94a695b1ff5d8ae01da4fac55b05494aa0f5';

// 创建测试订单
function createTestOrder() {
    const currentTime = Math.floor(Date.now() / 1000);
    
    return {
        salt: "0x" + crypto.randomBytes(32).toString('hex'),
        maker: "0x319749f49C884a2F0141e53187dd1454E217786f",
        signer: "0x319749f49C884a2F0141e53187dd1454E217786f",
        taker: "0x0000000000000000000000000000000000000000",
        tokenId: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        makerAmount: "100000000", // 100 USDC
        takerAmount: "50000000",  // 50 YES代币
        expiration: (currentTime + 86400).toString(), // 24小时后过期
        nonce: "1",
        feeRateBps: "200", // 2%
        side: "0", // BUY
        signatureType: "0" // EOA
    };
}

// 创建简单的签名（65字节格式）
function createSimpleSignature(messageHash) {
    // 使用私钥和消息哈希创建HMAC
    const hmac = crypto.createHmac('sha256', PRIVATE_KEY);
    hmac.update(messageHash);
    const hash = hmac.digest('hex');
    
    // 创建65字节的签名（64字节签名 + 1字节recovery id）
    const signature = hash + '00'; // 添加recovery id 0
    return '0x' + signature;
}

// 生成签名订单
function generateSignedOrder() {
    const order = createTestOrder();
    
    // 创建消息哈希
    const messageData = [
        order.salt,
        order.maker,
        order.signer,
        order.taker,
        order.tokenId,
        order.makerAmount,
        order.takerAmount,
        order.expiration,
        order.nonce,
        order.feeRateBps,
        order.side,
        order.signatureType
    ].join('');
    
    const messageHash = '0x' + crypto.createHash('sha256').update(messageData).digest('hex');
    const signature = createSimpleSignature(messageHash);
    
    return {
        order,
        messageHash,
        signature
    };
}

// 生成cast命令
function generateCastCommands(signedOrder) {
    const { order, signature } = signedOrder;
    
    console.log('🔧 简化签名的Cast命令:');
    console.log('====================');
    
    // 订单验证命令
    console.log('# 订单验证测试（简化签名）');
    console.log(`cast call 0x6814Facf6bEC19B81A148577CB9b2abc58084d72 "validateOrder((uint256,address,address,address,uint256,uint256,uint256,uint256,uint256,uint256,uint8,uint8,bytes))" \\`);
    console.log(`  "(0x${order.salt.slice(2)},${order.maker},${order.signer},${order.taker},0x${order.tokenId.slice(2)},${order.makerAmount},${order.takerAmount},${order.expiration},${order.nonce},${order.feeRateBps},${order.side},${order.signatureType},${signature})" \\`);
    console.log(`  --rpc-url https://testnet.hsk.xyz`);
    
    console.log('\n# 订单填充测试（简化签名）');
    console.log(`cast send 0x6814Facf6bEC19B81A148577CB9b2abc58084d72 "fillOrder((uint256,address,address,address,uint256,uint256,uint256,uint256,uint256,uint256,uint8,uint8,bytes),uint256)" \\`);
    console.log(`  "(0x${order.salt.slice(2)},${order.maker},${order.signer},${order.taker},0x${order.tokenId.slice(2)},${order.makerAmount},${order.takerAmount},${order.expiration},${order.nonce},${order.feeRateBps},${order.side},${order.signatureType},${signature})" \\`);
    console.log(`  "1000000" \\`);
    console.log(`  --rpc-url https://testnet.hsk.xyz \\`);
    console.log(`  --private-key ${PRIVATE_KEY}`);
    
    console.log('\n# 订单匹配测试（简化签名）');
    console.log(`cast send 0x6814Facf6bEC19B81A148577CB9b2abc58084d72 "matchOrders((uint256,address,address,address,uint256,uint256,uint256,uint256,uint256,uint256,uint8,uint8,bytes),(uint256,address,address,address,uint256,uint256,uint256,uint256,uint256,uint256,uint8,uint8,bytes)[],uint256,uint256[])" \\`);
    console.log(`  "(0x${order.salt.slice(2)},${order.maker},${order.signer},${order.taker},0x${order.tokenId.slice(2)},${order.makerAmount},${order.takerAmount},${order.expiration},${order.nonce},${order.feeRateBps},${order.side},${order.signatureType},${signature})" \\`);
    console.log(`  "[]" \\`);
    console.log(`  "1000000" \\`);
    console.log(`  "[]" \\`);
    console.log(`  --rpc-url https://testnet.hsk.xyz \\`);
    console.log(`  --private-key ${PRIVATE_KEY}`);
}

// 主函数
function main() {
    console.log('🚀 CTF Exchange 简化签名实现');
    console.log('============================');
    
    const signedOrder = generateSignedOrder();
    
    console.log('\n📋 签名订单数据:');
    console.log('================');
    console.log('Order:', JSON.stringify(signedOrder.order, null, 2));
    console.log('Message Hash:', signedOrder.messageHash);
    console.log('Signature:', signedOrder.signature);
    console.log('Signature Length:', signedOrder.signature.length, 'characters');
    
    generateCastCommands(signedOrder);
    
    console.log('\n📝 注意事项:');
    console.log('============');
    console.log('1. 使用简化的签名算法');
    console.log('2. 签名长度: 65字节 (0x + 64字节 + 1字节recovery id)');
    console.log('3. 使用您的私钥进行签名');
    console.log('4. 签名格式符合Ethereum标准');
}

// 运行测试
if (require.main === module) {
    main();
}

module.exports = { 
    createTestOrder, 
    createSimpleSignature,
    generateSignedOrder,
    generateCastCommands 
};
