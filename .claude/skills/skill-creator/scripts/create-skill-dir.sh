#!/bin/bash

# Skill 目录创建脚本
# 用法：./create-skill-dir.sh <skill-name> [额外目录...]

set -e

SKILL_NAME=$1
SKILL_DIR=".claude/skills/$SKILL_NAME"
EXTRA_DIRS="${@:2}"

# 检查参数
if [ -z "$SKILL_NAME" ]; then
    echo "错误：请提供 Skill 名称"
    echo "用法：./create-skill-dir.sh <skill-name> [额外目录...]"
    exit 1
fi

# 验证 Skill 名称格式
if ! [[ "$SKILL_NAME" =~ ^[a-z0-9]+(-[a-z0-9]+)*$ ]]; then
    echo "错误：Skill 名称格式不正确"
    echo "要求：小写字母、数字、连字符，如：code-review"
    exit 1
fi

# 检查目录是否已存在
if [ -d "$SKILL_DIR" ]; then
    echo "警告：Skill 目录已存在：$SKILL_DIR"
    read -p "是否继续？(y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 0
    fi
fi

# 创建基础目录结构
echo "创建 Skill 目录：$SKILL_DIR"
mkdir -p "$SKILL_DIR"

# 创建可选目录
for dir in $EXTRA_DIRS; do
    mkdir -p "$SKILL_DIR/$dir"
    echo "  - 创建子目录：$dir"
done

# 输出结果
echo ""
echo "Skill 目录结构："
echo "$SKILL_DIR/"

# 列出创建的目录
if [ -d "$SKILL_DIR" ]; then
    ls -la "$SKILL_DIR"
fi

echo ""
echo "下一步：在 $SKILL_DIR/SKILL.md 中编写 Skill 指令"
