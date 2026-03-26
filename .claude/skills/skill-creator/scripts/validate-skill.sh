#!/bin/bash

# Skill 验证脚本
# 用法：./validate-skill.sh <skill-name>

set -e

SKILL_NAME=$1
SKILL_DIR=".claude/skills/$SKILL_NAME"
SKILL_FILE="$SKILL_DIR/SKILL.md"

echo "=== Skill 验证工具 ==="
echo ""

# 检查参数
if [ -z "$SKILL_NAME" ]; then
    echo "错误：请提供 Skill 名称"
    echo "用法：./validate-skill.sh <skill-name>"
    exit 1
fi

# 检查目录是否存在
if [ ! -d "$SKILL_DIR" ]; then
    echo "错误：Skill 目录不存在：$SKILL_DIR"
    exit 1
fi

# 检查 SKILL.md 是否存在
if [ ! -f "$SKILL_FILE" ]; then
    echo "错误：SKILL.md 文件不存在：$SKILL_FILE"
    exit 1
fi

echo "验证 Skill: $SKILL_NAME"
echo "目录：$SKILL_DIR"
echo ""

# 检查 YAML Frontmatter
echo "1. 检查 YAML Frontmatter..."

# 检查 name 字段
if grep -q "^name:" "$SKILL_FILE"; then
    NAME=$(grep "^name:" "$SKILL_FILE" | head -1 | cut -d':' -f2- | xargs)
    echo "   ✓ name: $NAME"
else
    echo "   ✗ 缺少 name 字段"
    exit 1
fi

# 检查 description 字段
if grep -q "^description:" "$SKILL_FILE"; then
    DESC=$(grep "^description:" "$SKILL_FILE" | head -1 | cut -d':' -f2- | xargs)
    echo "   ✓ description: $DESC"
else
    echo "   ✗ 缺少 description 字段"
    exit 1
fi

# 检查 Frontmatter 结束标记
if ! head -20 "$SKILL_FILE" | grep -q "^---$"; then
    echo "   ✗ YAML Frontmatter 格式不正确（缺少结束标记 ---）"
    exit 1
fi
echo "   ✓ Frontmatter 格式正确"

echo ""

# 检查必需章节
echo "2. 检查必需章节..."

REQUIRED_SECTIONS=("## 用途" "## .*流程" "## 输出格式" "## 注意事项")
for section in "${REQUIRED_SECTIONS[@]}"; do
    if grep -qE "$section" "$SKILL_FILE"; then
        echo "   ✓ 包含章节：$section"
    else
        echo "   ⚠ 缺少章节：$section（推荐添加）"
    fi
done

echo ""

# 检查章节编号
echo "3. 检查章节编号..."

CHAPTERS=$(grep -E "^## [0-9]+\." "$SKILL_FILE" | wc -l)
if [ "$CHAPTERS" -gt 0 ]; then
    echo "   ✓ 发现 $CHAPTERS 个编号章节"
else
    echo "   ℹ 未使用编号章节（可接受）"
fi

echo ""

# 检查重复标题
echo "4. 检查重复标题..."

DUPLICATES=$(grep "^## " "$SKILL_FILE" | sort | uniq -d)
if [ -n "$DUPLICATES" ]; then
    echo "   ✗ 发现重复标题："
    echo "$DUPLICATES"
    exit 1
else
    echo "   ✓ 无重复标题"
fi

echo ""

# 检查代码块
echo "5. 检查代码块..."

CODE_BLOCKS=$(grep -E "^\\`\\`\\`[a-z]*$" "$SKILL_FILE" | wc -l)
if [ "$CODE_BLOCKS" -gt 0 ]; then
    echo "   ✓ 发现 $CODE_BLOCKS 个代码块"
else
    echo "   ℹ 未发现代码块"
fi

# 检查代码块语言标注
LANG_BLOCKS=$(grep -E "^\\`\\`\\`[a-z]+$" "$SKILL_FILE" | wc -l)
if [ "$LANG_BLOCKS" -gt 0 ]; then
    echo "   ✓ 发现 $LANG_BLOCKS 个带语言标注的代码块"
fi

echo ""

# 检查文件统计
echo "6. 文件统计..."

LINE_COUNT=$(wc -l < "$SKILL_FILE")
echo "   文件行数：$LINE_COUNT"

if [ "$LINE_COUNT" -gt 500 ]; then
    echo "   ⚠ 文件超过 500 行，建议精简或移至 resources"
else
    echo "   ✓ 文件大小适中"
fi

echo ""

# 检查目录结构
echo "7. 检查目录结构..."

if [ -d "$SKILL_DIR/templates" ]; then
    echo "   ✓ 包含 templates/ 目录"
fi
if [ -d "$SKILL_DIR/references" ]; then
    echo "   ✓ 包含 references/ 目录"
fi
if [ -d "$SKILL_DIR/scripts" ]; then
    echo "   ✓ 包含 scripts/ 目录"
fi
if [ -d "$SKILL_DIR/checklists" ]; then
    echo "   ✓ 包含 checklists/ 目录"
fi

echo ""
echo "=== 验证完成 ==="
echo ""
echo "Skill 名称：$NAME"
echo "描述：$DESC"
echo "文件行数：$LINE_COUNT"
echo ""
echo "建议："
if [ "$LINE_COUNT" -lt 50 ]; then
    echo "- 文件较短，考虑添加更多用例和示例"
fi
if [ "$LINE_COUNT" -gt 500 ]; then
    echo "- 文件较长，考虑将部分内容移至 resources/"
fi
