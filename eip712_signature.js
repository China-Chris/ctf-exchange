// EIP712签名实现
// 用于CTF Exchange订单签名

const crypto = require('crypto');

// EIP712 Domain Separator
const DOMAIN_SEPARATOR = {
    name: "CTFExchange",
    version: "1",
    chainId: 133, // HashKey testnet
    verifyingContract: "0x6814Facf6bEC19B81A148577CB9b2abc58084d72"
};

// Order结构体类型定义
const ORDER_TYPE = {
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

// 将地址转换为小写
function toLowerCaseAddress(address) {
    return address.toLowerCase();
}

// 将数字转换为十六进制字符串
function toHexString(num) {
    return "0x" + BigInt(num).toString(16);
}

// 创建EIP712消息哈希
function createEIP712MessageHash(order) {
    // 构建Domain Separator
    const domainSeparator = createDomainSeparator();
    
    // 构建Order结构体哈希
    const orderHash = createOrderHash(order);
    
    // 构建最终消息
    const message = {
        domain: DOMAIN_SEPARATOR,
        types: ORDER_TYPE,
        primaryType: "Order",
        message: order
    };
    
    return {
        domainSeparator,
        orderHash,
        message
    };
}

// 创建Domain Separator
function createDomainSeparator() {
    const domainType = [
        { name: "name", type: "string" },
        { name: "version", type: "string" },
        { name: "chainId", type: "uint256" },
        { name: "verifyingContract", type: "address" }
    ];
    
    const domainHash = keccak256(
        "0x1901" + // EIP712 prefix
        keccak256(encodeType(domainType, DOMAIN_SEPARATOR))
    );
    
    return domainHash;
}

// 创建Order哈希
function createOrderHash(order) {
    const orderType = ORDER_TYPE.Order;
    const orderData = {
        salt: toHexString(order.salt),
        maker: toLowerCaseAddress(order.maker),
        signer: toLowerCaseAddress(order.signer),
        taker: toLowerCaseAddress(order.taker),
        tokenId: toHexString(order.tokenId),
        makerAmount: toHexString(order.makerAmount),
        takerAmount: toHexString(order.takerAmount),
        expiration: toHexString(order.expiration),
        nonce: toHexString(order.nonce),
        feeRateBps: toHexString(order.feeRateBps),
        side: toHexString(order.side),
        signatureType: toHexString(order.signatureType)
    };
    
    return keccak256(encodeType(orderType, orderData));
}

// 编码类型
function encodeType(type, data) {
    let result = "";
    
    for (const field of type) {
        result += field.type + " " + field.name + ",";
    }
    
    return result.slice(0, -1); // 移除最后的逗号
}

// 简单的Keccak256实现（用于演示）
function keccak256(data) {
    // 这里应该使用真正的Keccak256实现
    // 为了演示，我们使用SHA256
    const hash = crypto.createHash('sha256').update(data).digest('hex');
    return "0x" + hash;
}

// 创建私钥签名（模拟）
function createSignature(privateKey, messageHash) {
    // 这里应该使用真正的ECDSA签名
    // 为了演示，我们创建一个模拟签名
    const signature = crypto.createHmac('sha256', privateKey).update(messageHash).digest('hex');
    return "0x" + signature + "00"; // 添加recovery id
}

// 生成完整的测试订单和签名
function generateSignedOrder() {
    const order = createTestOrder();
    const { domainSeparator, orderHash, message } = createEIP712MessageHash(order);
    
    // 创建消息哈希
    const messageHash = keccak256(domainSeparator + orderHash.slice(2));
    
    // 创建签名（使用私钥）
    const privateKey = "8ad5b3c82c433bb80dda9510959e94a695b1ff5d8ae01da4fac55b05494aa0f5";
    const signature = createSignature(privateKey, messageHash);
    
    return {
        order,
        domainSeparator,
        orderHash,
        messageHash,
        signature,
        message
    };
}

// 生成cast命令
function generateCastCommands(signedOrder) {
    const { order, signature } = signedOrder;
    
    console.log('🔧 带签名的Cast命令:');
    console.log('==================');
    
    // 订单验证命令
    console.log('# 订单验证测试（带签名）');
    console.log(`cast call 0x6814Facf6bEC19B81A148577CB9b2abc58084d72 "validateOrder((uint256,address,address,address,uint256,uint256,uint256,uint256,uint256,uint256,uint8,uint8,bytes))" \\`);
    console.log(`  "(0x${order.salt.slice(2)},${order.maker},${order.signer},${order.taker},0x${order.tokenId.slice(2)},${order.makerAmount},${order.takerAmount},${order.expiration},${order.nonce},${order.feeRateBps},${order.side},${order.signatureType},${signature})" \\`);
    console.log(`  --rpc-url https://testnet.hsk.xyz`);
    
    console.log('\n# 订单填充测试（带签名）');
    console.log(`cast send 0x6814Facf6bEC19B81A148577CB9b2abc58084d72 "fillOrder((uint256,address,address,address,uint256,uint256,uint256,uint256,uint256,uint256,uint8,uint8,bytes),uint256)" \\`);
    console.log(`  "(0x${order.salt.slice(2)},${order.maker},${order.signer},${order.taker},0x${order.tokenId.slice(2)},${order.makerAmount},${order.takerAmount},${order.expiration},${order.nonce},${order.feeRateBps},${order.side},${order.signatureType},${signature})" \\`);
    console.log(`  "1000000" \\`);
    console.log(`  --rpc-url https://testnet.hsk.xyz \\`);
    console.log(`  --private-key 8ad5b3c82c433bb80dda9510959e94a695b1ff5d8ae01da4fac55b05494aa0f5`);
    
    console.log('\n# 订单匹配测试（带签名）');
    console.log(`cast send 0x6814Facf6bEC19B81A148577CB9b2abc58084d72 "matchOrders((uint256,address,address,address,uint256,uint256,uint256,uint256,uint256,uint256,uint8,uint8,bytes),(uint256,address,address,address,uint256,uint256,uint256,uint256,uint256,uint256,uint8,uint8,bytes)[],uint256,uint256[])" \\`);
    console.log(`  "(0x${order.salt.slice(2)},${order.maker},${order.signer},${order.taker},0x${order.tokenId.slice(2)},${order.makerAmount},${order.takerAmount},${order.expiration},${order.nonce},${order.feeRateBps},${order.side},${order.signatureType},${signature})" \\`);
    console.log(`  "[]" \\`);
    console.log(`  "1000000" \\`);
    console.log(`  "[]" \\`);
    console.log(`  --rpc-url https://testnet.hsk.xyz \\`);
    console.log(`  --private-key 8ad5b3c82c433bb80dda9510959e94a695b1ff5d8ae01da4fac55b05494aa0f5`);
}

// 主函数
function main() {
    console.log('🚀 CTF Exchange EIP712签名实现');
    console.log('==============================');
    
    const signedOrder = generateSignedOrder();
    
    console.log('📋 签名订单数据:');
    console.log('================');
    console.log('Order:', JSON.stringify(signedOrder.order, null, 2));
    console.log('Domain Separator:', signedOrder.domainSeparator);
    console.log('Order Hash:', signedOrder.orderHash);
    console.log('Message Hash:', signedOrder.messageHash);
    console.log('Signature:', signedOrder.signature);
    
    generateCastCommands(signedOrder);
    
    console.log('\n📝 注意事项:');
    console.log('============');
    console.log('1. 这是简化的EIP712实现，用于演示');
    console.log('2. 实际生产环境需要完整的Keccak256和ECDSA实现');
    console.log('3. 签名验证可能需要调整');
    console.log('4. 建议使用ethers.js或web3.js进行签名');
}

// 运行测试
if (require.main === module) {
    main();
}

module.exports = { 
    createTestOrder, 
    createEIP712MessageHash, 
    generateSignedOrder,
    generateCastCommands 
};
