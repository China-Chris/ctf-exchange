#!/bin/bash

echo "🚀 快速启动预测市场Demo"
echo "========================"
echo ""

# 检查API服务器是否运行
if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
    echo "✅ USDC API服务器已运行 (端口3001)"
else
    echo "启动USDC API服务器..."
    node usdc_api.js &
    sleep 3
    
    if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
        echo "✅ USDC API服务器启动成功"
    else
        echo "❌ USDC API服务器启动失败，将使用模拟模式"
    fi
fi

echo ""
echo "启动网页服务器..."
echo "网页地址: http://localhost:8000/interactive_demo.html"
echo "按Ctrl+C停止服务器"
echo ""

# 启动网页服务器
python3 -m http.server 8000


