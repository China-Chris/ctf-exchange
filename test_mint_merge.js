// 测试铸造和合并功能
const { ethers } = require('ethers');

// 私钥和地址
const PRIVATE_KEY = '8ad5b3c82c433bb80dda9510959e94a695b1ff5d8ae01da4fac55b05494aa0f5';
const wallet = new ethers.Wallet(PRIVATE_KEY);

// 合约地址
const EXCHANGE_ADDRESS = '0x666DDb461FDb5E10BF6329513D609615C069E489';
const USDC_ADDRESS = '0xC1C68E532E3F2e1F40e6b5EBC9D6c5f8c5e803D6';
const CTF_ADDRESS = '0x3431D37cEF4E795eb43db8E35DBD291Fc1db57f3';

// 代币ID
const YES_TOKEN_ID = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
const NO_TOKEN_ID = '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890';

async function testMintAndMerge() {
    console.log('🔧 测试铸造和合并功能');
    console.log('====================');
    
    // 1. 检查CTF合约状态
    console.log('\n1. 检查CTF合约状态:');
    console.log('CTF地址:', CTF_ADDRESS);
    
    // 2. 测试铸造功能 (splitPosition)
    console.log('\n2. 测试铸造功能 (splitPosition):');
    console.log('铸造100个YES代币和100个NO代币');
    
    const mintCommand = `cast send ${CTF_ADDRESS} "splitPosition(address,bytes32,uint256,uint256[])" \\
  ${USDC_ADDRESS} \\
  "0x0000000000000000000000000000000000000000000000000000000000000001" \\
  "100000000" \\
  "[${YES_TOKEN_ID},${NO_TOKEN_ID}]" \\
  --rpc-url https://testnet.hsk.xyz \\
  --private-key ${PRIVATE_KEY}`;
    
    console.log('铸造命令:');
    console.log(mintCommand);
    
    // 3. 测试合并功能 (mergePositions)
    console.log('\n3. 测试合并功能 (mergePositions):');
    console.log('合并50个YES代币和50个NO代币');
    
    const mergeCommand = `cast send ${CTF_ADDRESS} "mergePositions(address,bytes32,uint256,uint256[])" \\
  ${USDC_ADDRESS} \\
  "0x0000000000000000000000000000000000000000000000000000000000000001" \\
  "50000000" \\
  "[${YES_TOKEN_ID},${NO_TOKEN_ID}]" \\
  --rpc-url https://testnet.hsk.xyz \\
  --private-key ${PRIVATE_KEY}`;
    
    console.log('合并命令:');
    console.log(mergeCommand);
    
    // 4. 检查余额
    console.log('\n4. 检查代币余额:');
    const balanceCommand = `cast call ${CTF_ADDRESS} "balanceOf(address,uint256)" \\
  ${wallet.address} \\
  ${YES_TOKEN_ID} \\
  --rpc-url https://testnet.hsk.xyz`;
    
    console.log('检查YES代币余额:');
    console.log(balanceCommand);
    
    // 5. 测试交易功能
    console.log('\n5. 测试交易功能:');
    console.log('如果铸造成功，可以测试订单填充');
    
    const fillOrderCommand = `cast send ${EXCHANGE_ADDRESS} "fillOrder((uint256,address,address,address,uint256,uint256,uint256,uint256,uint256,uint256,uint8,uint8,bytes),uint256)" \\
  "[订单数据]" \\
  "1000000" \\
  --rpc-url https://testnet.hsk.xyz \\
  --private-key ${PRIVATE_KEY}`;
    
    console.log('订单填充命令:');
    console.log(fillOrderCommand);
    
    console.log('\n📝 测试说明:');
    console.log('===========');
    console.log('1. 铸造功能：将USDC转换为YES和NO代币');
    console.log('2. 合并功能：将YES和NO代币转换回USDC');
    console.log('3. 这些功能是预测市场的核心机制');
    console.log('4. 如果CTF合约部署失败，这些功能将不可用');
}

// 运行测试
if (require.main === module) {
    testMintAndMerge().catch(console.error);
}

module.exports = { testMintAndMerge };
