const { ethers } = require('ethers');

// 配置
const RPC_URL = 'https://testnet.hsk.xyz';
const PRIVATE_KEY = '8ad5b3c82c433bb80dda9510959e94a695b1ff5d8ae01da4fac55b05494aa0f5';
const USDC_ADDRESS = '0xC1C68E532E3F2e1F40e6b5EBC9D6c5f8c5e803D6';

// 创建provider和wallet
const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// USDC领取功能
class USDCClaimer {
    constructor() {
        // USDC使用6位小数，所以1000 USDC = 1000 * 10^6
        this.usdcAmount = ethers.parseUnits("1000", 6); // 1000 USDC (6位小数)
    }

    // 领取USDC到指定地址
    async claimUSDC(userAddress) {
        try {
            console.log(`\n💰 开始向地址 ${userAddress} 领取1000 USDC`);
            console.log("=====================================");
            
            // 验证地址格式
            if (!ethers.isAddress(userAddress)) {
                throw new Error('无效的以太坊地址');
            }
            
            // 检查用户地址是否与管理员地址相同
            if (userAddress.toLowerCase() === wallet.address.toLowerCase()) {
                console.log("✅ 用户地址与管理员地址相同，无需转账");
                return {
                    success: true,
                    message: "用户地址与管理员地址相同，无需转账",
                    transactionHash: null
                };
            }
            
            // 创建USDC合约实例
            const usdcAbi = [
                "function transfer(address to, uint256 amount) external returns (bool)",
                "function balanceOf(address account) external view returns (uint256)",
                "function decimals() external view returns (uint8)"
            ];
            
            const usdcContract = new ethers.Contract(USDC_ADDRESS, usdcAbi, wallet);
            
            // 检查管理员USDC余额
            const adminBalance = await usdcContract.balanceOf(wallet.address);
            const decimals = await usdcContract.decimals();
            console.log(`管理员USDC余额: ${ethers.formatUnits(adminBalance, decimals)} USDC`);
            
            if (adminBalance < this.usdcAmount) {
                throw new Error(`管理员USDC余额不足，需要 ${ethers.formatUnits(this.usdcAmount, decimals)} USDC`);
            }
            
            // 执行转账
            console.log(`正在向 ${userAddress} 转账 ${ethers.formatUnits(this.usdcAmount, decimals)} USDC...`);
            
            const tx = await usdcContract.transfer(userAddress, this.usdcAmount);
            console.log(`交易已发送，哈希: ${tx.hash}`);
            
            // 等待交易确认
            console.log("等待交易确认...");
            const receipt = await tx.wait();
            
            if (receipt.status === 1) {
                console.log("✅ USDC领取成功！");
                console.log(`交易哈希: ${tx.hash}`);
                console.log(`Gas消耗: ${receipt.gasUsed.toString()}`);
                
                // 检查用户余额
                const userBalance = await usdcContract.balanceOf(userAddress);
                console.log(`用户USDC余额: ${ethers.formatEther(userBalance)} USDC`);
                
                return {
                    success: true,
                    message: `成功向地址 ${userAddress} 领取1000 USDC`,
                    transactionHash: tx.hash,
                    userBalance: ethers.formatEther(userBalance)
                };
            } else {
                throw new Error('交易失败');
            }
            
        } catch (error) {
            console.error("❌ USDC领取失败:", error.message);
            return {
                success: false,
                message: error.message,
                transactionHash: null
            };
        }
    }

    // 检查地址余额
    async checkBalance(address) {
        try {
            const usdcAbi = [
                "function balanceOf(address account) external view returns (uint256)",
                "function decimals() external view returns (uint8)"
            ];
            
            const usdcContract = new ethers.Contract(USDC_ADDRESS, usdcAbi, provider);
            const balance = await usdcContract.balanceOf(address);
            const decimals = await usdcContract.decimals();
            
            return {
                success: true,
                balance: ethers.formatUnits(balance, decimals),
                address: address
            };
        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    }

    // 批量领取USDC
    async batchClaimUSDC(addresses) {
        console.log(`\n💰 开始批量领取USDC，共 ${addresses.length} 个地址`);
        console.log("=====================================");
        
        const results = [];
        
        for (let i = 0; i < addresses.length; i++) {
            const address = addresses[i];
            console.log(`\n处理第 ${i + 1}/${addresses.length} 个地址: ${address}`);
            
            const result = await this.claimUSDC(address);
            results.push({
                address: address,
                ...result
            });
            
            // 添加延迟避免网络拥堵
            if (i < addresses.length - 1) {
                console.log("等待3秒后处理下一个地址...");
                await new Promise(resolve => setTimeout(resolve, 3000));
            }
        }
        
        return results;
    }
}

// 命令行使用
async function main() {
    const claimer = new USDCClaimer();
    
    // 从命令行参数获取地址
    const userAddress = process.argv[2];
    
    if (!userAddress) {
        console.log("使用方法: node claim_usdc.js <用户地址>");
        console.log("示例: node claim_usdc.js 0x319749f49C884a2F0141e53187dd1454E217786f");
        return;
    }
    
    const result = await claimer.claimUSDC(userAddress);
    
    if (result.success) {
        console.log("\n🎉 领取完成！");
        console.log("=====================");
        console.log(`地址: ${userAddress}`);
        console.log(`金额: 1000 USDC`);
        if (result.transactionHash) {
            console.log(`交易哈希: ${result.transactionHash}`);
        }
        if (result.userBalance) {
            console.log(`用户余额: ${result.userBalance} USDC`);
        }
    } else {
        console.log("\n❌ 领取失败！");
        console.log("=====================");
        console.log(`错误: ${result.message}`);
    }
}

// 如果直接运行此文件
if (require.main === module) {
    main().catch(console.error);
}

module.exports = USDCClaimer;
