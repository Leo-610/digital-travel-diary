#!/bin/bash
# 数字旅行记忆馆 - GitHub上传脚本

echo "开始初始化Git仓库..."
git init

echo "添加所有文件..."
git add .

echo "创建首次提交..."
git commit -m "Initial commit - Digital Travel Diary with cloud sharing features"

echo "设置主分支..."
git branch -M main

echo "请将以下命令中的YOUR_USERNAME替换为您的GitHub用户名："
echo "git remote add origin https://github.com/YOUR_USERNAME/digital-travel-diary.git"
echo "git push -u origin main"

echo ""
echo "或者复制以下命令并替换YOUR_USERNAME："
echo "git remote add origin https://github.com/YOUR_USERNAME/digital-travel-diary.git && git push -u origin main"
