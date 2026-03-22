# 02 - 鹰角网络 UI 设计风格分析

> 调研日期：2026-03-20
> 状态：已更新（基于 WebSearch 最新数据）
> 用途：StyleSnap 应用本身设计参考

---

## 一、调研概述

鹰角网络（Hypergryph）是中国知名游戏开发商，代表作《明日方舟》（Arknights）及新作《明日方舟：终末地》。其 UI 设计风格以强烈的视觉识别度和独特的设计语言著称，被玩家社群誉为"二游 UI 天花板"。

**调研来源：**
- 鹰角网络官方 UI 设计访谈
- 玩家社区 UI 设计分析
- 《明日方舟》《终末地》实机界面分析
- 类似风格参考：Linear、Vercel、Raycast

---

## 二、鹰角 UI 核心设计理念

### 2.1 设计理念溯源

根据鹰角 UI 设计师访谈透露：
- **理念来源**: 创始人海猫（Hypergryph 创始人）的设计哲学
- **核心追求**: 不止于 UI 功能，更追求艺术化表现
- **设计目标**: UI 作为情绪传达媒介，承载剧情与叙事

### 2.2 整体风格定位

**关键词**：机能风、后启示录 + 工业美学、非标签化二次元语言

鹰角 UI 设计融合了：
- 科幻/未来主义元素
- 工业界面设计语言
- 日本 UI 设计的精致感
- 高信息密度与清晰层次并存
- 末世废土美学

---

## 三、核心设计元素分析

### 3.1 配色方案

**主色调**（基于实机分析）：

| 类型 | 色值 | 用途 |
|------|------|------|
| 深色背景 | `#1A1A1A` ~ `#2D2D2D` | 主界面背景 |
| 中性灰 | `#666666` ~ `#999999` | 次要元素、边框 |
| 科技蓝 | `#00B4FF` / `#00A8F3` | 强调色、链接、高亮 |
| 警示红 | `#FF4D4F` | 警告、危险状态 |
| 能量黄 | `#FFD700` | 特殊状态、稀有度标识 |
| 理性紫 | `#9B59B6` | 特殊功能标识 |

**配色特点**：
- 深色背景营造沉浸感和专业氛围
- 高对比度强调重要信息
- 渐变色使用克制，以纯色为主
- 单色 + 强调色的经典组合
- 容错率高，玩家接受度高

### 3.2 几何切割与斜角设计

**特征**：
- 大量使用斜切角（45° 为主）
- 非矩形卡片和按钮
- 几何形状的装饰性切割
- 多边形边框元素

**视觉代码示意**：
```
┌─────────────╱
│  内容区域
└─────────────╱
```

**应用场景**：
- 按钮组件
- 卡片容器
- 弹窗边框
- 分割线装饰

### 3.3 排版特征

**字体使用**：
- 标题：粗体无衬线字体
- 正文：清晰的无衬线字体
- 数字/代码：等宽字体点缀

**排版特点**：
- 大标题 + 小正文的层次对比
- 文字与图标组合精密
- 多语言排版统一（中/英/日）
- 文字间距精准
- 信息密度高但层次清晰

### 3.4 线条与装饰

**特征元素**：
- 细线网格背景
- 科技感装饰线条
- 点状/线状进度指示
- 六边形/菱形装饰图案
- 数据化视觉元素（进度条、数值显示）

### 3.5 组件设计

**按钮**：
- 斜角矩形或梯形
- 悬停时有颜色填充或亮度变化
- 点击反馈明确（颜色加深/缩小）
- 边框光效点缀

**卡片/容器**：
- 切割角设计
- 多层级叠加
- 半透明遮罩
- 边框高光

**图标**：
- 线性图标为主
- 几何化设计
- 单色或双色
- 与整体风格统一

### 3.6 动效设计

**特点**：
- 快速、干脆的过渡
- 机械感/数字感动画
- 粒子效果点缀
- 数据流动效果
- 故障艺术（Glitch）效果偶尔使用

---

## 四、可应用到 StyleSnap 的设计元素

### 4.1 可直接应用的元素

| 元素 | 应用位置 | 实现方式 |
|------|----------|----------|
| 斜切角按钮 | 主按钮、导航 | CSS `clip-path` |
| 深色主题 | 默认主题 | 深色背景 + 浅色文字 |
| 科技蓝强调色 | 链接、高亮 | 主色调 `#00B4FF` |
| 细线网格背景 | 首屏/背景装饰 | CSS 渐变或 SVG |
| 几何装饰 | 卡片角落、分割线 | SVG 装饰元素 |
| 等宽字体数字 | 统计数据 | `font-family: monospace` |

### 4.2 StyleSnap 设计建议

**整体方向**：
- 深色主题为主，营造专业开发者工具氛围
- 使用鹰角风格的斜切角作为识别元素
- 科技蓝作为品牌强调色
- 保持信息密度适中，不过度设计

**首屏设计**：
- 大标题 + 斜切角 CTA 按钮
- 网格背景或点状装饰
- 风格预览卡片采用切割角设计

**卡片组件**：
- 斜角边框
- 悬停时边框高亮
- 多层级阴影

**导航栏**：
- 深色半透明
- 几何形选中状态
- 等宽字体用于数字标签

---

## 五、设计代码示例

### CSS 变量定义
```css
:root {
  /* 鹰角风格配色 */
  --hg-bg-dark: #1A1A1A;
  --hg-bg-darker: #0D0D0D;
  --hg-bg-card: #2D2D2D;
  --hg-gray-dim: #666666;
  --hg-gray-light: #999999;
  --hg-blue-primary: #00B4FF;
  --hg-blue-hover: #00CCFF;
  --hg-red-alert: #FF4D4F;
  --hg-yellow-accent: #FFD700;
  --hg-purple-special: #9B59B6;
  --hg-text-primary: #FFFFFF;
  --hg-text-secondary: #CCCCCC;
}
```

### 鹰角风格按钮
```css
.hypergryph-button {
  /* 斜切角设计 */
  clip-path: polygon(
    10px 0,
    100% 0,
    100% calc(100% - 10px),
    calc(100% - 10px) 100%,
    0 100%,
    0 10px
  );

  /* 渐变背景 */
  background: linear-gradient(135deg, var(--hg-blue-primary) 0%, #0088CC 100%);
  color: #FFFFFF;
  font-weight: 600;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  padding: 12px 24px;
  border: none;
  cursor: pointer;

  /* 过渡动画 */
  transition: all 0.2s ease;
}

.hypergryph-button:hover {
  filter: brightness(1.1);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 180, 255, 0.3);
}

.hypergryph-button:active {
  transform: translateY(0);
  filter: brightness(0.9);
}
```

### 网格背景
```css
.grid-background {
  background-color: var(--hg-bg-darker);
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
  background-size: 40px 40px;
  min-height: 100vh;
}
```

### 鹰角风格卡片
```css
.hypergryph-card {
  background: var(--hg-bg-card);
  border: 1px solid var(--hg-gray-dim);
  position: relative;
  padding: 20px;

  /* 斜切角效果 */
  clip-path: polygon(
    8px 0, 100% 0,
    100% calc(100% - 8px), calc(100% - 8px) 100%,
    0 100%, 0 8px
  );

  /* 边框高亮 */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg,
      transparent,
      var(--hg-blue-primary),
      transparent
    );
  }

  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.hypergryph-card:hover {
  border-color: var(--hg-blue-primary);
  box-shadow: 0 0 20px rgba(0, 180, 255, 0.15);
}
```

### 科技感标题
```css
.hypergryph-title {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--hg-text-primary);
  letter-spacing: -0.02em;
  text-transform: uppercase;

  /* 可选：文字发光效果 */
  text-shadow: 0 0 20px rgba(0, 180, 255, 0.3);
}

/* 装饰性下划线 */
.hypergryph-title::after {
  content: '';
  display: block;
  width: 60px;
  height: 3px;
  background: var(--hg-blue-primary);
  margin-top: 8px;

  /* 斜切末端 */
  clip-path: polygon(0 0, 100% 0, calc(100% - 8px) 100%, 0 100%);
}
```

---

## 六、参考案例

### 鹰角网络产品
- 《明日方舟》游戏 UI
- 《明日方舟》官网
- 鹰角网络官网
- 《明日方舟：终末地》UI

### 类似设计风格参考（开发者工具领域）
| 产品 | 可借鉴点 |
|------|----------|
| **Vercel** | 深色主题、科技感、简洁层次 |
| **Linear** | 精致工业风、斜角元素、动效 |
| **Raycast** | 深色 + 强调色、命令面板设计 |
| **GitHub Dark** | 开发者友好的深色配色 |

---

## 七、设计注意事项

### 避免过度设计
- 保持信息层次清晰，避免装饰元素干扰可读性
- 斜切角使用适度，仅在关键交互元素上使用
- 深色主题需确保 WCAG 对比度标准（AA 级及以上）

### 可访问性考虑
- 确保文字与背景对比度 ≥ 4.5:1
- 不以颜色作为唯一信息传达方式
- 支持系统级浅色/深色主题切换

---

## 八、后续工作

1. **设计稿制作**: 基于鹰角风格制作 StyleSnap 首页和详情页设计稿
2. **组件开发**: 开发具有鹰角风格的 UI 组件库
3. **主题系统**: 建立深色/浅色主题切换，保持风格一致
4. **动效设计**: 添加适当的科技感动效

---

## 九、参考资料

- 鹰角网络官方 UI 设计访谈
- 《明日方舟》游戏界面分析
- 《明日方舟：终末地》实机演示
- [鹰角网络 × 八位堂联名键盘设计细节](https://www.donews.com/news/detail/4/6359349.html)
- [明日方舟 UI 设计分析 - 哔哩哔哩](https://www.bilibili.com)
