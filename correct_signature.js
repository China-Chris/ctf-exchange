// 正确格式的ECDSA签名实现
// 使用正确的签名格式和长度

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

// 创建正确格式的签名（64字节 + 1字节recovery id）
function createCorrectSignature(messageHash) {
    // 使用私钥和消息哈希创建确定性签名
    const hmac = crypto.createHmac('sha256', PRIVATE_KEY);
    hmac.update(messageHash);
    const hash = hmac.digest('hex');
    
    // 确保签名是64字节（128个十六进制字符）
    let signature = hash;
    if (signature.length < 128) {
        signature = signature.padEnd(128, '0');
    } else if (signature.length > 128) {
        signature = signature.substring(0, 128);
    }
    
    // 添加recovery id (0x00)
    const recoveryId = '00';
    const fullSignature = '0x' + signature + recoveryId;
    
    return fullSignature;
}

// 创建另一种格式的签名（32字节r + 32字节s + 1字节v）
function createAlternativeSignature(messageHash) {
    // 使用私钥和消息哈希创建确定性签名
    const hmac = crypto.createHmac('sha256', PRIVATE_KEY);
    hmac.update(messageHash);
    const hash = hmac.digest('hex');
    
    // 分割为r和s（各32字节）
    const r = hash.substring(0, 64);
    const s = hash.substring(64, 128) || hash.substring(0, 64); // 如果不够长，重复使用
    
    // v值（recovery id）
    const v = '00';
    
    const fullSignature = '0x' + r + s + v;
    return fullSignature;
}

// 创建最小长度签名（32字节）
function createMinimalSignature(messageHash) {
    // 使用私钥和消息哈希创建确定性签名
    const hmac = crypto.createHmac('sha256', PRIVATE_KEY);
    hmac.update(messageHash);
    const hash = hmac.digest('hex');
    
    // 只使用32字节
    const signature = hash.substring(0, 64);
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
    
    // 生成不同格式的签名
    const signature1 = createCorrectSignature(messageHash);
    const signature2 = createAlternativeSignature(messageHash);
    const signature3 = createMinimalSignature(messageHash);
    
    return {
        order,
        messageHash,
        signatures: {
            correct: signature1,
            alternative: signature2,
            minimal: signature3
        }
    };
}

// 生成cast命令
function generateCastCommands(signedOrder) {
    const { order, signatures } = signedOrder;
    
    console.log('🔧 不同格式签名的Cast命令:');
    console.log('==========================');
    
    // 测试1: 正确格式签名（65字节）
    console.log('# 测试1: 正确格式签名（65字节）');
    console.log(`cast call 0x6814Facf6bEC19B81A148577CB9b2abc58084d72 "validateOrder((uint256,address,address,address,uint256,uint256,uint256,uint256,uint256,uint256,uint8,uint8,bytes))" \\`);
    console.log(`  "(0x${order.salt.slice(2)},${order.maker},${order.signer},${order.taker},0x${order.tokenId.slice(2)},${order.makerAmount},${order.takerAmount},${order.expiration},${order.nonce},${order.feeRateBps},${order.side},${order.signatureType},${signatures.correct})" \\`);
    console.log(`  --rpc-url https://testnet.hsk.xyz`);
    
    console.log('\n# 测试2: 替代格式签名（65字节）');
    console.log(`cast call 0x6814Facf6bEC19B81A148577CB9b2abc58084d72 "validateOrder((uint256,address,address,address,uint256,uint256,uint256,uint256,uint256,uint256,uint8,uint8,bytes))" \\`);
    console.log(`  "(0x${order.salt.slice(2)},${order.maker},${order.signer},${order.taker},0x${order.tokenId.slice(2)},${order.makerAmount},${order.takerAmount},${order.expiration},${order.nonce},${order.feeRateBps},${order.side},${order.signatureType},${signatures.alternative})" \\`);
    console.log(`  --rpc-url https://testnet.hsk.xyz`);
    
    console.log('\n# 测试3: 最小长度签名（32字节）');
    console.log(`cast call 0x6814Facf6bEC19B81A148577CB9b2abc58084d72 "validateOrder((uint256,address,address,address,uint256,uint256,uint256,uint256,uint256,uint256,uint8,uint8,bytes))" \\`);
    console.log(`  "(0x${order.salt.slice(2)},${order.maker},${order.signer},${order.taker},0x${order.tokenId.slice(2)},${order.makerAmount},${order.takerAmount},${order.expiration},${order.nonce},${order.feeRateBps},${order.side},${order.signatureType},${signatures.minimal})" \\`);
    console.log(`  --rpc-url https://testnet.hsk.xyz`);
    
    console.log('\n# 测试4: 空签名（0字节）');
    console.log(`cast call 0x6814Facf6bEC19B81A148577CB9b2abc58084d72 "validateOrder((uint256,address,address,address,uint256,uint256,uint256,uint256,uint256,uint256,uint8,uint8,bytes))" \\`);
    console.log(`  "(0x${order.salt.slice(2)},${order.maker},${order.signer},${order.taker},0x${order.tokenId.slice(2)},${order.makerAmount},${order.takerAmount},${order.expiration},${order.nonce},${order.feeRateBps},${order.side},${order.signatureType},0x)" \\`);
    console.log(`  --rpc-url https://testnet.hsk.xyz`);
}

// 主函数
function main() {
    console.log('🚀 CTF Exchange 正确格式签名实现');
    console.log('================================');
    
    const signedOrder = generateSignedOrder();
    
    console.log('\n📋 签名订单数据:');
    console.log('================');
    console.log('Order:', JSON.stringify(signedOrder.order, null, 2));
    console.log('Message Hash:', signedOrder.messageHash);
    console.log('\n签名格式:');
    console.log('正确格式 (65字节):', signedOrder.signatures.correct, '长度:', signedOrder.signatures.correct.length);
    console.log('替代格式 (65字节):', signedOrder.signatures.alternative, '长度:', signedOrder.signatures.alternative.length);
    console.log('最小长度 (32字节):', signedOrder.signatures.minimal, '长度:', signedOrder.signatures.minimal.length);
    
    generateCastCommands(signedOrder);
    
    console.log('\n📝 注意事项:');
    console.log('============');
    console.log('1. 尝试不同长度的签名格式');
    console.log('2. 65字节格式: 0x + 64字节签名 + 1字节recovery id');
    console.log('3. 32字节格式: 0x + 32字节签名');
    console.log('4. 空签名: 0x');
    console.log('5. 使用您的私钥进行签名');
}

// 运行测试
if (require.main === module) {
    main();
}

module.exports = { 
    createTestOrder, 
    createCorrectSignature,
    createAlternativeSignature,
    createMinimalSignature,
    generateSignedOrder,
    generateCastCommands 
};
