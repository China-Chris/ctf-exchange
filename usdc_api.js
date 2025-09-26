const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const USDCClaimer = require('./claim_usdc.js');
const MarketCreator = require('./market_creator.js');

const app = express();
const port = 3001;

// 中间件
app.use(cors());
app.use(express.json());

// 创建实例
const claimer = new USDCClaimer();
const marketCreator = new MarketCreator();

// 市场数据存储
let markets = [];

// 订单数据存储
let orders = [];

// 数据文件路径
const DATA_FILE = path.join(__dirname, 'markets_data.json');
const ORDERS_FILE = path.join(__dirname, 'orders_data.json');

// 加载市场数据
function loadMarkets() {
    try {
        if (fs.existsSync(DATA_FILE)) {
            const data = fs.readFileSync(DATA_FILE, 'utf8');
            markets = JSON.parse(data);
            console.log(`📁 已加载 ${markets.length} 个市场数据`);
        } else {
            console.log('📁 未找到市场数据文件，将创建新文件');
        }
    } catch (error) {
        console.error('❌ 加载市场数据失败:', error.message);
        markets = [];
    }
}

// 保存市场数据
function saveMarkets() {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(markets, null, 2));
        console.log(`💾 已保存 ${markets.length} 个市场数据到文件`);
    } catch (error) {
        console.error('❌ 保存市场数据失败:', error.message);
    }
}

// 加载订单数据
function loadOrders() {
    try {
        if (fs.existsSync(ORDERS_FILE)) {
            const data = fs.readFileSync(ORDERS_FILE, 'utf8');
            orders = JSON.parse(data);
            console.log(`📁 已加载 ${orders.length} 个订单数据`);
        } else {
            console.log('📁 未找到订单数据文件，将创建新文件');
        }
    } catch (error) {
        console.error('❌ 加载订单数据失败:', error.message);
        orders = [];
    }
}

// 保存订单数据
function saveOrders() {
    try {
        fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
        console.log(`💾 已保存 ${orders.length} 个订单数据到文件`);
    } catch (error) {
        console.error('❌ 保存订单数据失败:', error.message);
    }
}

// 启动时加载数据
loadMarkets();
loadOrders();

// 领取USDC API
app.post('/api/claim-usdc', async (req, res) => {
    try {
        const { address } = req.body;
        
        if (!address) {
            return res.status(400).json({
                success: false,
                message: '请提供钱包地址'
            });
        }
        
        console.log(`收到USDC领取请求: ${address}`);
        
        const result = await claimer.claimUSDC(address);
        
        if (result.success) {
            res.json({
                success: true,
                message: result.message,
                transactionHash: result.transactionHash,
                userBalance: result.userBalance
            });
        } else {
            res.status(400).json({
                success: false,
                message: result.message
            });
        }
        
    } catch (error) {
        console.error('API错误:', error);
        res.status(500).json({
            success: false,
            message: '服务器内部错误'
        });
    }
});

// 检查余额API
app.get('/api/balance/:address', async (req, res) => {
    try {
        const { address } = req.params;
        
        if (!address) {
            return res.status(400).json({
                success: false,
                message: '请提供钱包地址'
            });
        }
        
        const result = await claimer.checkBalance(address);
        
        if (result.success) {
            res.json({
                success: true,
                balance: result.balance,
                address: result.address
            });
        } else {
            res.status(400).json({
                success: false,
                message: result.message
            });
        }
        
    } catch (error) {
        console.error('API错误:', error);
        res.status(500).json({
            success: false,
            message: '服务器内部错误'
        });
    }
});

// 创建预测市场API
app.post('/api/create-market', async (req, res) => {
    try {
        const { question } = req.body;
        
        if (!question) {
            return res.status(400).json({
                success: false,
                message: '请提供市场问题'
            });
        }
        
        console.log(`收到创建市场请求: "${question}"`);
        
        const result = await marketCreator.createMarket(question);
        
        if (result.success) {
            // 保存市场信息
            const marketInfo = {
                id: result.conditionId,
                question: result.question,
                conditionId: result.conditionId,
                yesTokenId: result.yesTokenId,
                noTokenId: result.noTokenId,
                transactions: result.transactions,
                balances: result.balances,
                createdAt: new Date().toISOString(),
                status: 'active'
            };
            
            markets.push(marketInfo);
            saveMarkets(); // 保存到文件
            
            console.log(`市场已保存: ${marketInfo.question} (ID: ${marketInfo.conditionId})`);
            console.log(`当前市场总数: ${markets.length}`);
            
            res.json({
                success: true,
                question: result.question,
                conditionId: result.conditionId,
                yesTokenId: result.yesTokenId,
                noTokenId: result.noTokenId,
                transactions: result.transactions,
                balances: result.balances,
                marketId: result.conditionId
            });
        } else {
            res.status(400).json({
                success: false,
                message: result.message
            });
        }
        
    } catch (error) {
        console.error('API错误:', error);
        res.status(500).json({
            success: false,
            message: '服务器内部错误'
        });
    }
});

// 检查市场状态API
app.get('/api/market-status/:conditionId', async (req, res) => {
    try {
        const { conditionId } = req.params;
        
        if (!conditionId) {
            return res.status(400).json({
                success: false,
                message: '请提供条件ID'
            });
        }
        
        const result = await marketCreator.checkMarketStatus(conditionId);
        
        if (result.success) {
            res.json({
                success: true,
                yesBalance: result.yesBalance,
                noBalance: result.noBalance,
                yesTokenId: result.yesTokenId,
                noTokenId: result.noTokenId
            });
        } else {
            res.status(400).json({
                success: false,
                message: result.message
            });
        }
        
    } catch (error) {
        console.error('API错误:', error);
        res.status(500).json({
            success: false,
            message: '服务器内部错误'
        });
    }
});

// 查看USDC余额API
app.get('/api/balance/:address', async (req, res) => {
    try {
        const { address } = req.params;
        
        if (!address) {
            return res.status(400).json({
                success: false,
                message: '请提供地址'
            });
        }
        
        console.log(`查询地址 ${address} 的USDC余额`);
        
        const result = await claimer.checkBalance(address);
        
        if (result.success) {
            res.json({
                success: true,
                address: result.address,
                balance: result.balance
            });
        } else {
            res.status(400).json({
                success: false,
                message: result.message
            });
        }
        
    } catch (error) {
        console.error('API错误:', error);
        res.status(500).json({
            success: false,
            message: '服务器内部错误'
        });
    }
});

// 获取所有市场API
app.get('/api/markets', (req, res) => {
    try {
        res.json({
            success: true,
            markets: markets,
            total: markets.length,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('API错误:', error);
        res.status(500).json({
            success: false,
            message: '服务器内部错误'
        });
    }
});

// 获取特定市场API
app.get('/api/markets/:marketId', (req, res) => {
    try {
        const { marketId } = req.params;
        
        const market = markets.find(m => m.id === marketId || m.conditionId === marketId);
        
        if (market) {
            res.json({
                success: true,
                market: market
            });
        } else {
            res.status(404).json({
                success: false,
                message: '市场未找到'
            });
        }
    } catch (error) {
        console.error('API错误:', error);
        res.status(500).json({
            success: false,
            message: '服务器内部错误'
        });
    }
});

// 铸造代币API
app.post('/api/mint-tokens', async (req, res) => {
    try {
        const { userAddress, tokenId, amount, tokenType, marketId } = req.body;
        
        if (!userAddress || !tokenId || !amount) {
            return res.status(400).json({
                success: false,
                message: '缺少必要参数'
            });
        }
        
        console.log(`收到铸造代币请求: ${tokenType} ${amount}个 -> ${userAddress}`);
        
        const { ethers } = require('ethers');
        const RPC_URL = 'https://testnet.hsk.xyz';
        const PRIVATE_KEY = '8ad5b3c82c433bb80dda9510959e94a695b1ff5d8ae01da4fac55b05494aa0f5';
        const CTF_ADDRESS = '0x3338E58FAFfE71F89b2Bcb48384C9424c36060c6';
        
        const provider = new ethers.JsonRpcProvider(RPC_URL);
        const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
        
        const ctfContract = new ethers.Contract(CTF_ADDRESS, [
            'function mint(address to, uint256 id, uint256 amount) public'
        ], wallet);
        
        const amountWei = ethers.parseUnits(amount.toString(), 0);
        const mintTx = await ctfContract.mint(userAddress, tokenId, amountWei);
        const receipt = await mintTx.wait();
        
        console.log(`代币铸造成功: ${tokenType} ${amount}个 -> ${userAddress}`);
        console.log(`交易哈希: ${receipt.hash}`);
        
        res.json({
            success: true,
            message: `成功铸造${amount}个${tokenType}代币`,
            transactionHash: receipt.hash,
            tokenType: tokenType,
            amount: amount,
            userAddress: userAddress
        });
        
    } catch (error) {
        console.error('铸造代币失败:', error);
        res.status(500).json({
            success: false,
            message: '铸造代币失败: ' + error.message
        });
    }
});

// 创建订单API
app.post('/api/create-order', async (req, res) => {
    try {
        const { userAddress, tokenId, amount, tokenType, marketId, action, price } = req.body;
        
        if (!userAddress || !tokenId || !amount || !action) {
            return res.status(400).json({
                success: false,
                message: '缺少必要参数'
            });
        }
        
        console.log(`收到创建订单请求: ${action} ${tokenType} ${amount}个 @ ${price} USDC`);
        
        // 生成订单ID
        const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // 创建订单对象
        const order = {
            id: orderId,
            userAddress: userAddress,
            tokenId: tokenId,
            tokenType: tokenType,
            marketId: marketId,
            amount: amount,
            price: price,
            action: action, // 'buy' or 'sell'
            status: 'pending', // 'pending', 'matched', 'completed', 'cancelled'
            createdAt: new Date().toISOString(),
            matchedAt: null,
            completedAt: null,
            transactionHash: null
        };
        
        // 保存订单
        orders.push(order);
        saveOrders();
        
        // 尝试匹配订单
        const matchResult = await tryMatchOrders(order);
        
        if (matchResult.matched) {
            order.status = 'matched';
            order.matchedAt = new Date().toISOString();
            order.transactionHash = matchResult.transactionHash;
            saveOrders();
            
            console.log(`订单匹配成功: ${orderId} -> ${matchResult.transactionHash}`);
        }
        
        res.json({
            success: true,
            message: `成功创建${action}单`,
            orderId: orderId,
            status: order.status,
            transactionHash: order.transactionHash || 'pending'
        });
        
    } catch (error) {
        console.error('创建订单失败:', error);
        res.status(500).json({
            success: false,
            message: '创建订单失败: ' + error.message
        });
    }
});

// 尝试匹配订单
async function tryMatchOrders(newOrder) {
    try {
        // 查找匹配的订单
        const oppositeAction = newOrder.action === 'buy' ? 'sell' : 'buy';
        const matchingOrder = orders.find(order => 
            order.tokenId === newOrder.tokenId &&
            order.action === oppositeAction &&
            order.status === 'pending' &&
            order.userAddress !== newOrder.userAddress
        );
        
        if (!matchingOrder) {
            return { matched: false };
        }
        
        // 执行匹配交易
        const { ethers } = require('ethers');
        const RPC_URL = 'https://testnet.hsk.xyz';
        const PRIVATE_KEY = '8ad5b3c82c433bb80dda9510959e94a695b1ff5d8ae01da4fac55b05494aa0f5';
        const CTF_ADDRESS = '0x3338E58FAFfE71F89b2Bcb48384C9424c36060c6';
        const USDC_ADDRESS = '0xC1C68E532E3F2e1F40e6b5EBC9D6c5f8c5e803D6';
        
        const provider = new ethers.JsonRpcProvider(RPC_URL);
        const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
        
        // 计算交易数量（取较小值）
        const tradeAmount = Math.min(parseInt(newOrder.amount), parseInt(matchingOrder.amount));
        const tradeAmountWei = ethers.parseUnits(tradeAmount.toString(), 0);
        const usdcAmount = ethers.parseUnits((tradeAmount * parseFloat(newOrder.price)).toString(), 6);
        
        // 执行链上交易
        const ctfContract = new ethers.Contract(CTF_ADDRESS, [
            'function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes calldata data) external'
        ], wallet);
        
        const usdcContract = new ethers.Contract(USDC_ADDRESS, [
            'function transfer(address to, uint256 amount) external returns (bool)'
        ], wallet);
        
        // 如果是买单匹配卖单
        if (newOrder.action === 'buy') {
            // 从卖单用户转移代币给买单用户
            await ctfContract.safeTransferFrom(matchingOrder.userAddress, newOrder.userAddress, newOrder.tokenId, tradeAmountWei, "0x");
            // 从买单用户转移USDC给卖单用户（这里简化处理，实际应该通过Exchange合约）
            console.log(`模拟USDC转账: ${newOrder.userAddress} -> ${matchingOrder.userAddress}, 金额: ${ethers.formatUnits(usdcAmount, 6)} USDC`);
        } else {
            // 如果是卖单匹配买单
            // 从卖单用户转移代币给买单用户
            await ctfContract.safeTransferFrom(newOrder.userAddress, matchingOrder.userAddress, newOrder.tokenId, tradeAmountWei, "0x");
            // 从买单用户转移USDC给卖单用户
            console.log(`模拟USDC转账: ${matchingOrder.userAddress} -> ${newOrder.userAddress}, 金额: ${ethers.formatUnits(usdcAmount, 6)} USDC`);
        }
        
        // 更新订单状态
        matchingOrder.status = 'completed';
        matchingOrder.completedAt = new Date().toISOString();
        
        return { 
            matched: true, 
            transactionHash: `0x${Math.random().toString(16).substr(2, 64)}` // 模拟交易哈希
        };
        
    } catch (error) {
        console.error('订单匹配失败:', error);
        return { matched: false, error: error.message };
    }
}

// 销毁代币API
app.post('/api/burn-tokens', async (req, res) => {
    try {
        const { userAddress, tokenId, amount, tokenType, marketId } = req.body;
        
        if (!userAddress || !tokenId || !amount) {
            return res.status(400).json({
                success: false,
                message: '缺少必要参数'
            });
        }
        
        console.log(`收到销毁代币请求: ${tokenType} ${amount}个 <- ${userAddress}`);
        
        const { ethers } = require('ethers');
        const RPC_URL = 'https://testnet.hsk.xyz';
        const PRIVATE_KEY = '8ad5b3c82c433bb80dda9510959e94a695b1ff5d8ae01da4fac55b05494aa0f5';
        const CTF_ADDRESS = '0x3338E58FAFfE71F89b2Bcb48384C9424c36060c6';
        
        const provider = new ethers.JsonRpcProvider(RPC_URL);
        const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
        
        const ctfContract = new ethers.Contract(CTF_ADDRESS, [
            'function burn(address from, uint256 id, uint256 amount) public'
        ], wallet);
        
        const amountWei = ethers.parseUnits(amount.toString(), 0);
        const burnTx = await ctfContract.burn(userAddress, tokenId, amountWei);
        const receipt = await burnTx.wait();
        
        console.log(`代币销毁成功: ${tokenType} ${amount}个 <- ${userAddress}`);
        console.log(`交易哈希: ${receipt.hash}`);
        
        res.json({
            success: true,
            message: `成功销毁${amount}个${tokenType}代币`,
            transactionHash: receipt.hash,
            tokenType: tokenType,
            amount: amount,
            userAddress: userAddress
        });
        
    } catch (error) {
        console.error('销毁代币失败:', error);
        res.status(500).json({
            success: false,
            message: '销毁代币失败: ' + error.message
        });
    }
});

// 健康检查API
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: '预测市场API服务正常运行',
        timestamp: new Date().toISOString(),
        marketsCount: markets.length
    });
});

// 启动服务器
app.listen(port, () => {
    console.log(`🚀 预测市场API服务器已启动`);
    console.log(`===============================`);
    console.log(`端口: ${port}`);
    console.log(`API地址: http://localhost:${port}`);
    console.log(`健康检查: http://localhost:${port}/api/health`);
    console.log(`领取USDC: POST http://localhost:${port}/api/claim-usdc`);
    console.log(`查看余额: GET http://localhost:${port}/api/balance/:address`);
    console.log(`创建市场: POST http://localhost:${port}/api/create-market`);
    console.log(`获取所有市场: GET http://localhost:${port}/api/markets`);
    console.log(`获取特定市场: GET http://localhost:${port}/api/markets/:marketId`);
    console.log(`市场状态: GET http://localhost:${port}/api/market-status/:conditionId`);
    console.log(`铸造代币: POST http://localhost:${port}/api/mint-tokens`);
    console.log(`销毁代币: POST http://localhost:${port}/api/burn-tokens`);
    console.log(`创建订单: POST http://localhost:${port}/api/create-order`);
    console.log(`===============================`);
});

module.exports = app;
