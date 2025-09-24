# CTF Exchange 业务使用指南

## 🎯 什么是预测市场交易所？

CTF Exchange 是一个**预测市场交易所**，允许用户交易各种事件的"结果代币"。简单来说，就像股票交易，但交易的是"某个事件是否会发生"。

### 举个例子 🌟
假设有一个预测市场："2024年比特币价格会超过10万美元吗？"
- **YES代币**：如果比特币超过10万美元，YES代币值1美元
- **NO代币**：如果比特币不超过10万美元，NO代币值1美元
- **抵押代币**：USDC（1个YES + 1个NO = 1个USDC）

## 📋 核心功能详解

### 1. ✅ 订单创建和填充

#### 业务场景
用户想要买入或卖出预测代币

#### 具体操作
```solidity
// 创建一个买入订单
Order memory buyOrder = Order({
    salt: 12345,                    // 随机数，确保订单唯一性
    maker: 0x用户地址,               // 订单创建者
    signer: 0x用户地址,              // 签名者
    taker: address(0),              // 0表示公开订单，任何人都可以成交
    tokenId: YES代币ID,             // 要买入的代币ID
    makerAmount: 1000,              // 最多卖出1000个USDC
    takerAmount: 100,               // 最少买入100个YES代币
    expiration: block.timestamp + 86400, // 24小时后过期
    nonce: 1,                       // 防重放攻击
    feeRateBps: 200,                // 2%的手续费
    side: Side.BUY,                 // 买入订单
    signatureType: SignatureType.EOA, // 签名类型
    signature: 签名数据
});
```

#### 实际例子
- 用户A：我想用1000 USDC买入"比特币会涨到10万美元"的YES代币
- 用户B：我想卖出50个"比特币会涨到10万美元"的YES代币，换500 USDC

### 2. ✅ 订单匹配和交易

#### 业务场景
系统自动匹配买卖订单，完成交易

#### 三种匹配模式

##### 模式1：NORMAL（正常交易）
```
用户A：买入100个YES代币 @ $0.50
用户B：卖出50个YES代币 @ $0.50
结果：用户A用25 USDC买入50个YES代币
```

##### 模式2：MINT（铸造）
```
用户A：买入100个YES代币 @ $0.50
用户B：买入50个NO代币 @ $0.50
结果：用75 USDC铸造100个代币对（50个YES + 50个NO）
```

##### 模式3：MERGE（合并）
```
用户A：卖出50个YES代币 @ $0.50
用户B：卖出50个NO代币 @ $0.50
结果：合并成50 USDC（50个YES + 50个NO = 50 USDC）
```

### 3. ✅ 费用管理

#### 业务场景
交易所收取手续费维持运营

#### 费用计算
```solidity
// 对称费用系统
// 买入时：从获得的代币中扣除费用
// 卖出时：从获得的USDC中扣除费用

// 费用公式：baseRate × min(price, 1-price) × size
// 例如：2% × min(0.5, 0.5) × 100 = 1个代币的费用
```

#### 实际例子
- 买入100个YES代币 @ $0.50：扣除2个YES代币作为手续费
- 卖出100个YES代币 @ $0.50：扣除1个USDC作为手续费

### 4. ✅ 权限控制

#### 业务场景
管理交易所的运营和安全

#### 角色权限

##### Admin（管理员）
```solidity
// 可以暂停交易（紧急情况）
exchange.pauseTrading();

// 可以注册新的代币对
exchange.registerToken(yesTokenId, noTokenId, conditionId);

// 可以设置费用接收者
exchange.setFeeReceiver(newFeeReceiver);

// 可以管理操作员
exchange.addOperator(operatorAddress);
```

##### Operator（操作员）
```solidity
// 可以执行交易
exchange.fillOrder(order, fillAmount);

// 可以匹配订单
exchange.matchOrders(takerOrder, makerOrders, takerFillAmount, makerFillAmounts);
```

### 5. ✅ 暂停/恢复功能

#### 业务场景
紧急情况下保护用户资金

#### 使用场景
- 发现安全漏洞
- 市场异常波动
- 系统维护
- 监管要求

```solidity
// 暂停所有交易
exchange.pauseTrading();

// 恢复交易
exchange.unpauseTrading();
```

### 6. ✅ 代币注册

#### 业务场景
添加新的预测市场

#### 注册过程
```solidity
// 注册一个新的预测市场
exchange.registerToken(
    yesTokenId,      // YES代币的ID
    noTokenId,       // NO代币的ID  
    conditionId      // 条件ID（描述预测事件）
);
```

#### 实际例子
```solidity
// 注册"2024年总统选举"预测市场
exchange.registerToken(
    0x1234,  // YES代币ID
    0x5678,  // NO代币ID
    0xabcd   // 条件ID："2024年总统选举"
);
```

## 🚀 完整业务流程示例

### 场景：创建一个"明天会下雨吗？"的预测市场

#### 步骤1：管理员注册代币
```solidity
// 管理员注册新的预测市场
exchange.registerToken(
    rainYesTokenId,   // 下雨YES代币
    rainNoTokenId,    // 下雨NO代币
    weatherConditionId // 天气条件ID
);
```

#### 步骤2：用户创建订单
```solidity
// 用户A：买入"会下雨"代币
Order memory buyOrder = Order({
    // ... 订单参数
    tokenId: rainYesTokenId,
    makerAmount: 1000,  // 最多花1000 USDC
    takerAmount: 100,   // 买入100个"会下雨"代币
    side: Side.BUY
});

// 用户B：卖出"会下雨"代币
Order memory sellOrder = Order({
    // ... 订单参数
    tokenId: rainYesTokenId,
    makerAmount: 50,    // 卖出50个"会下雨"代币
    takerAmount: 500,   // 换500 USDC
    side: Side.SELL
});
```

#### 步骤3：操作员匹配订单
```solidity
// 操作员匹配订单
exchange.matchOrders(
    buyOrder,           // 买入订单
    [sellOrder],        // 卖出订单数组
    50,                 // 买入50个代币
    [50]                // 卖出50个代币
);
```

#### 步骤4：结果结算
- 如果明天下雨：YES代币值1 USDC，NO代币值0 USDC
- 如果明天不下雨：YES代币值0 USDC，NO代币值1 USDC

## 💡 实际应用场景

### 1. 政治预测
- "2024年总统选举结果"
- "某个法案是否通过"
- "某个国家是否加入某个组织"

### 2. 体育预测
- "世界杯冠军"
- "NBA总冠军"
- "奥运会金牌数"

### 3. 经济预测
- "比特币价格是否超过10万美元"
- "股市是否上涨"
- "通胀率是否超过5%"

### 4. 科技预测
- "某个AI模型是否通过图灵测试"
- "某个技术是否商业化"
- "某个公司是否上市"

## 🔧 如何开始使用

### 1. 获取测试代币
- 从HashKey测试网水龙头获取HSK代币
- 从USDC模拟合约获取测试USDC

### 2. 创建预测市场
- 使用管理员权限注册新的代币对
- 设置合适的条件ID

### 3. 开始交易
- 创建买入或卖出订单
- 等待操作员匹配订单
- 观察市场变化

### 4. 监控结果
- 等待事件结果
- 自动结算代币价值
- 提取收益

这就是CTF Exchange的完整业务逻辑！它是一个强大的预测市场平台，让用户可以交易各种未来事件的概率。
