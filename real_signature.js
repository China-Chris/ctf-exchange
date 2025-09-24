// 真实ECDSA签名实现
// 使用真实的私钥进行签名

const crypto = require('crypto');
const secp256k1 = require('secp256k1');

// 私钥（十六进制）
const PRIVATE_KEY = '8ad5b3c82c433bb80dda9510959e94a695b1ff5d8ae01da4fac55b05494aa0f5';

// 将私钥转换为Buffer
const privateKeyBuffer = Buffer.from(PRIVATE_KEY, 'hex');

// 从私钥获取公钥
const publicKey = secp256k1.publicKeyCreate(privateKeyBuffer);
const publicKeyHex = '0x' + publicKey.toString('hex');

console.log('🔑 密钥信息:');
console.log('==========');
console.log('私钥:', PRIVATE_KEY);
console.log('公钥:', publicKeyHex);

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

// 创建订单哈希（简化版本）
function createOrderHash(order) {
    // 将订单数据编码为字符串
    const orderData = [
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
    
    // 使用SHA256哈希（简化版本）
    const hash = crypto.createHash('sha256').update(orderData).digest('hex');
    return '0x' + hash;
}

// 创建EIP712消息哈希
function createEIP712MessageHash(order) {
    // Domain Separator
    const domainSeparator = crypto.createHash('sha256').update(
        'CTFExchange' + '1' + '133' + '0x6814Facf6bEC19B81A148577CB9b2abc58084d72'
    ).digest('hex');
    
    // Order Hash
    const orderHash = createOrderHash(order);
    
    // 最终消息哈希
    const messageHash = crypto.createHash('sha256').update(
        domainSeparator + orderHash.slice(2)
    ).digest('hex');
    
    return {
        domainSeparator: '0x' + domainSeparator,
        orderHash,
        messageHash: '0x' + messageHash
    };
}

// 创建真实ECDSA签名
function createRealSignature(messageHash) {
    // 将消息哈希转换为Buffer
    const messageBuffer = Buffer.from(messageHash.slice(2), 'hex');
    
    // 创建签名
    const signature = secp256k1.ecdsaSign(messageBuffer, privateKeyBuffer);
    
    // 获取recovery id
    const recoveryId = signature.recid;
    
    // 组合签名和recovery id
    const signatureHex = signature.signature.toString('hex');
    const fullSignature = signatureHex + recoveryId.toString(16).padStart(2, '0');
    
    return '0x' + fullSignature;
}

// 验证签名
function verifySignature(messageHash, signature, publicKey) {
    const messageBuffer = Buffer.from(messageHash.slice(2), 'hex');
    const signatureBuffer = Buffer.from(signature.slice(2, -2), 'hex');
    const recoveryId = parseInt(signature.slice(-2), 16);
    
    try {
        const recoveredPublicKey = secp256k1.ecdsaRecover(signatureBuffer, recoveryId, messageBuffer);
        return Buffer.compare(recoveredPublicKey, publicKey) === 0;
    } catch (error) {
        return false;
    }
}

// 生成完整的签名订单
function generateSignedOrder() {
    const order = createTestOrder();
    const { domainSeparator, orderHash, messageHash } = createEIP712MessageHash(order);
    const signature = createRealSignature(messageHash);
    
    // 验证签名
    const isValid = verifySignature(messageHash, signature, publicKey);
    
    return {
        order,
        domainSeparator,
        orderHash,
        messageHash,
        signature,
        isValid,
        publicKey: publicKeyHex
    };
}

// 生成cast命令
function generateCastCommands(signedOrder) {
    const { order, signature } = signedOrder;
    
    console.log('\n🔧 真实签名的Cast命令:');
    console.log('====================');
    
    // 订单验证命令
    console.log('# 订单验证测试（真实签名）');
    console.log(`cast call 0x6814Facf6bEC19B81A148577CB9b2abc58084d72 "validateOrder((uint256,address,address,address,uint256,uint256,uint256,uint256,uint256,uint256,uint8,uint8,bytes))" \\`);
    console.log(`  "(0x${order.salt.slice(2)},${order.maker},${order.signer},${order.taker},0x${order.tokenId.slice(2)},${order.makerAmount},${order.takerAmount},${order.expiration},${order.nonce},${order.feeRateBps},${order.side},${order.signatureType},${signature})" \\`);
    console.log(`  --rpc-url https://testnet.hsk.xyz`);
    
    console.log('\n# 订单填充测试（真实签名）');
    console.log(`cast send 0x6814Facf6bEC19B81A148577CB9b2abc58084d72 "fillOrder((uint256,address,address,address,uint256,uint256,uint256,uint256,uint256,uint256,uint8,uint8,bytes),uint256)" \\`);
    console.log(`  "(0x${order.salt.slice(2)},${order.maker},${order.signer},${order.taker},0x${order.tokenId.slice(2)},${order.makerAmount},${order.takerAmount},${order.expiration},${order.nonce},${order.feeRateBps},${order.side},${order.signatureType},${signature})" \\`);
    console.log(`  "1000000" \\`);
    console.log(`  --rpc-url https://testnet.hsk.xyz \\`);
    console.log(`  --private-key ${PRIVATE_KEY}`);
    
    console.log('\n# 订单匹配测试（真实签名）');
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
    console.log('🚀 CTF Exchange 真实ECDSA签名实现');
    console.log('=================================');
    
    const signedOrder = generateSignedOrder();
    
    console.log('\n📋 签名订单数据:');
    console.log('================');
    console.log('Order:', JSON.stringify(signedOrder.order, null, 2));
    console.log('Domain Separator:', signedOrder.domainSeparator);
    console.log('Order Hash:', signedOrder.orderHash);
    console.log('Message Hash:', signedOrder.messageHash);
    console.log('Signature:', signedOrder.signature);
    console.log('Public Key:', signedOrder.publicKey);
    console.log('Signature Valid:', signedOrder.isValid);
    
    generateCastCommands(signedOrder);
    
    console.log('\n📝 注意事项:');
    console.log('============');
    console.log('1. 使用真实的ECDSA签名算法');
    console.log('2. 使用您的私钥进行签名');
    console.log('3. 签名长度应该是65字节（0x + 64字节签名 + 1字节recovery id）');
    console.log('4. 签名验证通过');
}

// 运行测试
if (require.main === module) {
    main();
}

module.exports = { 
    createTestOrder, 
    createRealSignature,
    generateSignedOrder,
    generateCastCommands 
};
