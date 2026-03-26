-- 初始风格案例数据导入
-- 创建时间：2026-03-26
-- 说明：为 10 个风格分类各创建一个示例风格案例

-- ===========================================
-- 1. 风格案例数据
-- ===========================================

-- 风格 1: 极简主义 - "Clean SaaS Landing"
INSERT INTO styles (title, description, category_id, color_palette, fonts, spacing, border_radius, shadows, code_html, code_css, status)
SELECT
    'Clean SaaS Landing',
    '一个极简主义的 SaaS 产品落地页，强调清晰的信息层次和大量的留白空间。适合现代软件产品官网。',
    c.id,
    -- 色板
    '{"primary": "#000000", "secondary": "#666666", "background": "#FFFFFF", "surface": "#F5F5F5", "accent": "#0066FF"}'::jsonb,
    -- 字体
    '{"heading": "Inter, system-ui, sans-serif", "body": "Inter, system-ui, sans-serif", "headingSize": "clamp(2rem, 5vw, 4rem)", "bodySize": "1rem", "lineHeight": "1.6"}'::jsonb,
    -- 间距
    '{"base": "8px", "scale": "1.5", "section": "clamp(64px, 10vw, 128px)"}'::jsonb,
    -- 圆角
    '{"sm": "4px", "md": "8px", "lg": "12px"}'::jsonb,
    -- 阴影
    '{"sm": "0 1px 2px rgba(0,0,0,0.05)", "md": "0 4px 12px rgba(0,0,0,0.1)", "lg": "0 16px 48px rgba(0,0,0,0.15)"}'::jsonb,
    -- HTML 代码
    '<section class="hero">
  <div class="container">
    <h1>构建更智能的工作流程</h1>
    <p class="subtitle">一体化平台，让团队协作更高效</p>
    <div class="actions">
      <button class="btn-primary">免费开始</button>
      <button class="btn-secondary">观看演示</button>
    </div>
  </div>
</section>',
    -- CSS 代码
    '.hero {
  padding: clamp(64px, 10vw, 128px) 0;
  text-align: center;
  background: #FFFFFF;
}

.hero h1 {
  font-size: clamp(2rem, 5vw, 4rem);
  font-weight: 700;
  letter-spacing: -0.02em;
  margin-bottom: 16px;
  color: #000000;
}

.subtitle {
  font-size: 1.25rem;
  color: #666666;
  max-width: 540px;
  margin: 0 auto 32px;
}

.actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.btn-primary {
  background: #000000;
  color: #FFFFFF;
  padding: 12px 24px;
  border-radius: 8px;
  border: none;
  font-weight: 500;
}

.btn-secondary {
  background: transparent;
  color: #000000;
  padding: 12px 24px;
  border-radius: 8px;
  border: 1px solid #E0E0E0;
  font-weight: 500;
}',
    'published'
FROM categories c WHERE c.name_en = 'Minimalist'
ON CONFLICT DO NOTHING;

-- 风格 2: 科技未来 - "Neon Cyberpunk Dashboard"
INSERT INTO styles (title, description, category_id, color_palette, fonts, spacing, border_radius, shadows, code_html, code_css, status)
SELECT
    'Neon Cyberpunk Dashboard',
    '深色科技风格的数据仪表板，采用霓虹色点缀和发光效果。适合 Web3、AI 产品和游戏类应用。',
    c.id,
    '{"primary": "#00F0FF", "secondary": "#BD00FF", "background": "#0A0A0F", "surface": "#12121A", "accent": "#FF006E"}'::jsonb,
    '{"heading": "Orbitron, monospace", "body": "JetBrains Mono, monospace", "headingSize": "clamp(2.5rem, 6vw, 5rem)", "bodySize": "0.9rem", "lineHeight": "1.7"}'::jsonb,
    '{"base": "4px", "scale": "1.414", "section": "clamp(80px, 12vw, 160px)"}'::jsonb,
    '{"sm": "2px", "md": "4px", "lg": "8px"}'::jsonb,
    '{"sm": "0 0 10px rgba(0,240,255,0.3)", "md": "0 0 20px rgba(0,240,255,0.5)", "lg": "0 0 40px rgba(0,240,255,0.7)"}'::jsonb,
    '<section class="cyber-hero">
  <div class="grid-bg"></div>
  <div class="container">
    <h1 class="glitch" data-text="NEXT GEN">NEXT GEN</h1>
    <p class="tagline">构建去中心化未来</p>
    <div class="cyber-button">
      <span>启动应用</span>
      <div class="glow"></div>
    </div>
  </div>
</section>',
    '.cyber-hero {
  position: relative;
  min-height: 100vh;
  background: #0A0A0F;
  display: flex;
  align-items: center;
  overflow: hidden;
}

.grid-bg {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(0,240,255,0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0,240,255,0.03) 1px, transparent 1px);
  background-size: 40px 40px;
  animation: gridMove 20s linear infinite;
}

@keyframes gridMove {
  0% { transform: translateY(0); }
  100% { transform: translateY(40px); }
}

.cyber-hero h1 {
  font-size: clamp(2.5rem, 6vw, 5rem);
  font-weight: 900;
  color: #FFFFFF;
  text-transform: uppercase;
  text-shadow:
    0 0 10px #00F0FF,
    0 0 20px #00F0FF,
    0 0 40px #00F0FF;
  letter-spacing: 0.1em;
}

.tagline {
  font-family: "JetBrains Mono", monospace;
  color: #BD00FF;
  font-size: 1.1rem;
  margin-top: 16px;
}

.cyber-button {
  position: relative;
  margin-top: 32px;
  padding: 16px 32px;
  background: transparent;
  border: 1px solid #00F0FF;
  color: #00F0FF;
  font-family: "Orbitron", sans-serif;
  text-transform: uppercase;
  cursor: pointer;
  overflow: hidden;
}

.cyber-button .glow {
  position: absolute;
  inset: 0;
  background: rgba(0,240,255,0.1);
  box-shadow: 0 0 20px rgba(0,240,255,0.5);
}',
    'published'
FROM categories c WHERE c.name_en = 'Tech/Futuristic'
ON CONFLICT DO NOTHING;

-- 风格 3: 玻璃拟态 - "Glassmorphism Card"
INSERT INTO styles (title, description, category_id, color_palette, fonts, spacing, border_radius, shadows, code_html, code_css, status)
SELECT
    'Glassmorphism Card',
    '玻璃拟态风格的卡片组件，采用半透明背景和毛玻璃效果。适合现代化应用和科技产品展示。',
    c.id,
    '{"primary": "#6366F1", "secondary": "#8B5CF6", "background": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", "surface": "rgba(255,255,255,0.1)", "accent": "#F472B6"}'::jsonb,
    '{"heading": "Inter, sans-serif", "body": "Inter, sans-serif", "headingSize": "2rem", "bodySize": "1rem", "lineHeight": "1.6"}'::jsonb,
    '{"base": "8px", "scale": "1.5", "section": "80px"}'::jsonb,
    '{"sm": "8px", "md": "12px", "lg": "20px"}'::jsonb,
    '{"sm": "0 2px 8px rgba(0,0,0,0.1)", "md": "0 8px 32px rgba(0,0,0,0.15)", "lg": "0 16px 64px rgba(0,0,0,0.2)"}'::jsonb,
    '<div class="glass-card">
  <div class="glass-header">
    <div class="icon">✨</div>
    <h3>高级功能</h3>
  </div>
  <p>探索无限可能，释放创造力</p>
  <button class="glass-btn">了解更多</button>
</div>',
    '.glass-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 32px;
  color: #FFFFFF;
  max-width: 360px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
}

.glass-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.glass-header .icon {
  font-size: 2rem;
}

.glass-header h3 {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
}

.glass-card p {
  font-size: 1rem;
  opacity: 0.9;
  margin-bottom: 24px;
  line-height: 1.6;
}

.glass-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #FFFFFF;
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.glass-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 16px rgba(255, 255, 255, 0.2);
}',
    'published'
FROM categories c WHERE c.name_en = 'Glassmorphism'
ON CONFLICT DO NOTHING;

-- 风格 4: 粗野主义 - "Brutalist Portfolio"
INSERT INTO styles (title, description, category_id, color_palette, fonts, spacing, border_radius, shadows, code_html, code_css, status)
SELECT
    'Brutalist Portfolio',
    '粗野主义风格的个人作品集，采用高对比度配色和大胆的视觉表达。适合创意人士和独立项目。',
    c.id,
    '{"primary": "#000000", "secondary": "#FF0000", "background": "#FFFFFF", "surface": "#FFFF00", "accent": "#0000FF"}'::jsonb,
    '{"heading": "Arial Black, sans-serif", "body": "Courier New, monospace", "headingSize": "clamp(3rem, 10vw, 8rem)", "bodySize": "1rem", "lineHeight": "1.4"}'::jsonb,
    '{"base": "4px", "scale": "1.618", "section": "96px"}'::jsonb,
    '{"sm": "0px", "md": "0px", "lg": "0px"}'::jsonb,
    '{"sm": "none", "md": "none", "lg": "none"}'::jsonb,
    '<main class="brutalist">
  <header class="brutal-header">
    <h1>DESIGNER</h1>
    <p class="brutal-tagline">[ 创造 • 破坏 • 重建 ]</p>
  </header>
  <section class="brutal-work">
    <h2>精选作品</h2>
    <div class="brutal-grid">
      <article class="brutal-card">
        <h3>PROJECT_01</h3>
        <p>品牌设计 / 2024</p>
      </article>
    </div>
  </section>
</main>',
    '.brutalist {
  background: #FFFFFF;
  color: #000000;
  font-family: "Courier New", monospace;
}

.brutal-header {
  padding: 96px 24px;
  border-bottom: 4px solid #000000;
}

.brutal-header h1 {
  font-family: "Arial Black", sans-serif;
  font-size: clamp(3rem, 10vw, 8rem);
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: -0.05em;
  margin: 0;
  line-height: 0.9;
}

.brutal-tagline {
  font-size: 1.25rem;
  margin-top: 24px;
  font-weight: 700;
}

.brutal-work {
  padding: 96px 24px;
}

.brutal-work h2 {
  font-family: "Arial Black", sans-serif;
  font-size: 3rem;
  text-transform: uppercase;
  margin-bottom: 48px;
}

.brutal-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 0;
  border: 4px solid #000000;
}

.brutal-card {
  border: 4px solid #000000;
  padding: 32px;
  background: #FFFF00;
  transition: transform 0.2s;
}

.brutal-card:hover {
  transform: translate(-4px, -4px);
  box-shadow: 8px 8px 0 #000000;
}

.brutal-card h3 {
  font-family: "Arial Black", sans-serif;
  font-size: 1.5rem;
  margin: 0 0 8px 0;
}

.brutal-card p {
  font-size: 0.9rem;
  opacity: 0.7;
}',
    'published'
FROM categories c WHERE c.name_en = 'Brutalist'
ON CONFLICT DO NOTHING;

-- 风格 5: 企业专业 - "Corporate Enterprise"
INSERT INTO styles (title, description, category_id, color_palette, fonts, spacing, border_radius, shadows, code_html, code_css, status)
SELECT
    'Corporate Enterprise',
    '企业级专业风格，采用稳重的蓝色系和清晰的信息架构。适合企业官网、B2B SaaS 和金融服务平台。',
    c.id,
    '{"primary": "#0066CC", "secondary": "#003366", "background": "#FFFFFF", "surface": "#F8F9FA", "accent": "#00AA55"}'::jsonb,
    '{"heading": "Source Sans Pro, sans-serif", "body": "Open Sans, sans-serif", "headingSize": "clamp(2rem, 4vw, 3.5rem)", "bodySize": "1rem", "lineHeight": "1.7"}'::jsonb,
    '{"base": "8px", "scale": "1.25", "section": "clamp(64px, 8vw, 96px)"}'::jsonb,
    '{"sm": "4px", "md": "8px", "lg": "12px"}'::jsonb,
    '{"sm": "0 1px 3px rgba(0,0,0,0.1)", "md": "0 4px 12px rgba(0,0,0,0.1)", "lg": "0 12px 48px rgba(0,0,0,0.12)"}'::jsonb,
    '<section class="enterprise">
  <div class="container">
    <nav class="trust-badges">
      <span>🏢 服务 500+ 企业客户</span>
      <span>🔒 企业级安全</span>
      <span>📈 平均效率提升 40%</span>
    </nav>
    <h1>值得信赖的企业解决方案</h1>
    <p>为大型组织提供可扩展、安全可靠的技术平台</p>
    <div class="cta-group">
      <button class="btn-primary">联系销售</button>
      <button class="btn-outline">查看案例</button>
    </div>
  </div>
</section>',
    '.enterprise {
  background: #FFFFFF;
  padding: clamp(64px, 8vw, 96px) 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.trust-badges {
  display: flex;
  gap: 32px;
  flex-wrap: wrap;
  margin-bottom: 48px;
  font-size: 0.9rem;
  color: #666666;
}

.enterprise h1 {
  font-family: "Source Sans Pro", sans-serif;
  font-size: clamp(2rem, 4vw, 3.5rem);
  font-weight: 600;
  color: #003366;
  margin-bottom: 16px;
  line-height: 1.2;
}

.enterprise > .container > p {
  font-size: 1.25rem;
  color: #555555;
  max-width: 640px;
  margin-bottom: 32px;
}

.cta-group {
  display: flex;
  gap: 16px;
}

.btn-primary {
  background: #0066CC;
  color: #FFFFFF;
  padding: 14px 28px;
  border-radius: 8px;
  border: none;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
}

.btn-outline {
  background: transparent;
  color: #0066CC;
  padding: 14px 28px;
  border-radius: 8px;
  border: 2px solid #0066CC;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
}',
    'published'
FROM categories c WHERE c.name_en = 'Corporate/Professional'
ON CONFLICT DO NOTHING;

-- 风格 6: 深色优先 - "Dark Mode Developer Tools"
INSERT INTO styles (title, description, category_id, color_palette, fonts, spacing, border_radius, shadows, code_html, code_css, status)
SELECT
    'Dark Mode Developer Tools',
    '深色优先设计的开发者工具界面，采用高对比度强调色和等宽字体。适合开发者工具、API 文档和技术产品。',
    c.id,
    '{"primary": "#58A6FF", "secondary": "#1F6FEB", "background": "#0D1117", "surface": "#161B22", "accent": "#3FB950"}'::jsonb,
    '{"heading": "-apple-system, BlinkMacSystemFont, sans-serif", "body": "-apple-system, BlinkMacSystemFont, sans-serif", "code": "JetBrains Mono, monospace", "headingSize": "2.5rem", "bodySize": "14px"}'::jsonb,
    '{"base": "4px", "scale": "1.2", "section": "64px"}'::jsonb,
    '{"sm": "6px", "md": "8px", "lg": "12px"}'::jsonb,
    '{"sm": "0 1px 2px rgba(0,0,0,0.3)", "md": "0 4px 12px rgba(0,0,0,0.4)", "lg": "0 12px 24px rgba(0,0,0,0.5)"}'::jsonb,
    '<section class="dev-tools">
  <div class="code-preview">
    <div class="code-header">
      <span class="filename">example.ts</span>
      <button class="copy-btn">Copy</button>
    </div>
    <pre><code>import { Client } from ''@api/sdk'';

const client = new Client({
  apiKey: process.env.API_KEY
});

const result = await client.query(``
  SELECT * FROM users
  WHERE status = ''active''
``);</code></pre>
  </div>
  <h1>为开发者打造的 API 平台</h1>
  <p>简洁、快速、可靠的 API 基础设施</p>
</section>',
    '.dev-tools {
  background: #0D1117;
  color: #C9D1D9;
  padding: 64px 24px;
}

.code-preview {
  max-width: 700px;
  margin: 0 auto 48px;
  background: #161B22;
  border: 1px solid #30363D;
  border-radius: 8px;
  overflow: hidden;
}

.code-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #0D1117;
  border-bottom: 1px solid #30363D;
  font-size: 12px;
}

.filename {
  color: #8B949E;
  font-family: "JetBrains Mono", monospace;
}

.copy-btn {
  background: transparent;
  border: 1px solid #30363D;
  color: #C9D1D9;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
}

.copy-btn:hover {
  border-color: #58A6FF;
}

pre {
  padding: 16px;
  overflow-x: auto;
}

code {
  font-family: "JetBrains Mono", monospace;
  font-size: 13px;
  line-height: 1.6;
  color: #C9D1D9;
}

code .keyword { color: #FF7B72; }
code .string { color: #A5D6FF; }
code .function { color: #D2A8FF; }

.dev-tools h1 {
  text-align: center;
  font-size: 2.5rem;
  font-weight: 600;
  color: #F0F6FC;
  margin-bottom: 16px;
}

.dev-tools > p {
  text-align: center;
  color: #8B949E;
  font-size: 1.1rem;
}',
    'published'
FROM categories c WHERE c.name_en = 'Dark Mode First'
ON CONFLICT DO NOTHING;

-- 风格 7: 活泼多彩 - "Playful SaaS"
INSERT INTO styles (title, description, category_id, color_palette, fonts, spacing, border_radius, shadows, code_html, code_css, status)
SELECT
    'Playful SaaS',
    '活泼多彩的 SaaS 产品风格，采用鲜艳配色、圆角和 3D 插画。适合面向消费者的工具和创意产品。',
    c.id,
    '{"primary": "#FF6B6B", "secondary": "#4ECDC4", "background": "#FFFFFF", "surface": "#FFE66D", "accent": "#95E1D3"}'::jsonb,
    '{"heading": "Poppins, sans-serif", "body": "Inter, sans-serif", "headingSize": "clamp(2.5rem, 5vw, 4.5rem)", "bodySize": "1.1rem", "lineHeight": "1.6"}'::jsonb,
    '{"base": "8px", "scale": "1.5", "section": "80px"}'::jsonb,
    '{"sm": "8px", "md": "12px", "lg": "20px", "xl": "32px"}'::jsonb,
    '{"sm": "0 2px 8px rgba(255,107,107,0.2)", "md": "0 8px 24px rgba(78,205,196,0.3)", "lg": "0 16px 48px rgba(255,107,107,0.4)"}'::jsonb,
    '<section class="playful-hero">
  <div class="container">
    <div class="illustration">🎨✨🚀</div>
    <h1>让工作变得更有趣</h1>
    <p>创意工具，让想法变为现实</p>
    <div class="playful-buttons">
      <button class="btn-gradient">开始创作</button>
      <button class="btn-bubble">观看视频</button>
    </div>
  </div>
</section>',
    '.playful-hero {
  background: linear-gradient(180deg, #FFE66D 0%, #FFFFFF 100%);
  padding: 80px 24px;
  overflow: hidden;
}

.container {
  max-width: 1000px;
  margin: 0 auto;
  text-align: center;
}

.illustration {
  font-size: 5rem;
  margin-bottom: 24px;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.playful-hero h1 {
  font-family: "Poppins", sans-serif;
  font-size: clamp(2.5rem, 5vw, 4.5rem);
  font-weight: 700;
  background: linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 16px;
}

.playful-hero > p {
  font-size: 1.25rem;
  color: #555555;
  margin-bottom: 32px;
}

.playful-buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-gradient {
  background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%);
  color: #FFFFFF;
  padding: 16px 32px;
  border-radius: 32px;
  border: none;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(255,107,107,0.3);
  transition: transform 0.2s;
}

.btn-gradient:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(255,107,107,0.4);
}

.btn-bubble {
  background: #FFFFFF;
  color: #4ECDC4;
  padding: 16px 32px;
  border-radius: 32px;
  border: 2px solid #4ECDC4;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-bubble:hover {
  background: #4ECDC4;
  color: #FFFFFF;
}',
    'published'
FROM categories c WHERE c.name_en = 'Playful/Colorful'
ON CONFLICT DO NOTHING;

-- 风格 8: 杂志编辑 - "Editorial Blog"
INSERT INTO styles (title, description, category_id, color_palette, fonts, spacing, border_radius, shadows, code_html, code_css, status)
SELECT
    'Editorial Blog',
    '杂志编辑风格的博客/内容平台，采用大标题、精美排版和图文混排。适合内容创作者和出版物。',
    c.id,
    '{"primary": "#1A1A1A", "secondary": "#4A4A4A", "background": "#FFFEF7", "surface": "#F5F5F0", "accent": "#C92A2A"}'::jsonb,
    '{"heading": "Playfair Display, serif", "body": "Source Serif Pro, serif", "headingSize": "clamp(2.5rem, 6vw, 5rem)", "bodySize": "1.1rem", "lineHeight": "1.8"}'::jsonb,
    '{"base": "8px", "scale": "1.414", "section": "clamp(64px, 10vw, 128px)"}'::jsonb,
    '{"sm": "0px", "md": "0px", "lg": "0px"}'::jsonb,
    '{"sm": "none", "md": "none", "lg": "none"}'::jsonb,
    '<article class="editorial-article">
  <header>
    <span class="category">设计思考</span>
    <h1>好设计的七个原则</h1>
    <div class="meta">
      <span class="author">张三</span>
      <span class="date">2024 年 3 月 15 日</span>
      <span class="read-time">8 分钟阅读</span>
    </div>
  </header>
  <div class="featured-image">
    <img src="/image.jpg" alt="Featured" />
  </div>
  <div class="content">
    <p class="lead">设计不仅仅是外观，更是内在的逻辑和情感...</p>
  </div>
</article>',
    '.editorial-article {
  background: #FFFEF7;
  max-width: 800px;
  margin: 0 auto;
  padding: clamp(64px, 10vw, 128px) 24px;
}

.editorial-article header {
  text-align: center;
  margin-bottom: 48px;
}

.category {
  display: inline-block;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #C92A2A;
  margin-bottom: 16px;
}

.editorial-article h1 {
  font-family: "Playfair Display", serif;
  font-size: clamp(2.5rem, 6vw, 5rem);
  font-weight: 700;
  line-height: 1.1;
  color: #1A1A1A;
  margin: 0 0 24px 0;
}

.meta {
  display: flex;
  justify-content: center;
  gap: 24px;
  font-family: "Source Serif Pro", serif;
  font-size: 0.9rem;
  color: #666666;
}

.featured-image {
  margin: 48px 0;
}

.featured-image img {
  width: 100%;
  height: auto;
  display: block;
}

.content {
  font-family: "Source Serif Pro", serif;
  font-size: 1.1rem;
  line-height: 1.8;
  color: #333333;
}

.lead {
  font-size: 1.25rem;
  font-weight: 400;
  margin-bottom: 32px;
}',
    'published'
FROM categories c WHERE c.name_en = 'Editorial'
ON CONFLICT DO NOTHING;

-- 风格 9: 复古网络 - "Web 1.0 Retro"
INSERT INTO styles (title, description, category_id, color_palette, fonts, spacing, border_radius, shadows, code_html, code_css, status)
SELECT
    'Web 1.0 Retro',
    '致敬早期互联网风格的复古设计，采用像素艺术、鲜艳色彩和可见边框。适合创意项目和个性化网站。',
    c.id,
    '{"primary": "#0000AA", "secondary": "#FF00FF", "background": "#008080", "surface": "#C0C0C0", "accent": "#FFFF00"}'::jsonb,
    '{"heading": "Courier New, monospace", "body": "Times New Roman, serif", "headingSize": "2.5rem", "bodySize": "1rem", "lineHeight": "1.5"}'::jsonb,
    '{"base": "8px", "scale": "1.5", "section": "48px"}'::jsonb,
    '{"sm": "0px", "md": "0px", "lg": "0px"}'::jsonb,
    '{"sm": "none", "md": "none", "lg": "none"}'::jsonb,
    '<main class="retro-web">
  <table class="layout-table" border="2" cellpadding="10">
    <tr>
      <td bgcolor="#0000AA" width="200">
        <font color="#FFFF00" face="Arial"><b>📁 导航</b></font><br>
        <a href="#">首页</a><br>
        <a href="#">关于</a><br>
        <a href="#">链接</a>
      </td>
      <td bgcolor="#C0C0C0">
        <marquee behavior="scroll" scrollamount="5">
          ★ 欢迎访问我的主页 ★ 最佳浏览分辨率 800x600 ★
        </marquee>
        <h1>🔮 欢迎来到我的空间</h1>
        <p>这是一个怀旧的网页...</p>
        <hr>
        <p align="center">
          <img src="construction.gif" alt="Under Construction">
          <br>🚧 页面建设中... 🚧
        </p>
      </td>
    </tr>
  </table>
</main>',
    '.retro-web {
  background: #008080;
  padding: 24px;
  font-family: "Times New Roman", serif;
}

.layout-table {
  border: 3px ridge #FFFFFF;
  background: #C0C0C0;
  margin: 0 auto;
  max-width: 800px;
}

.retro-web a {
  color: #0000AA;
  text-decoration: underline;
}

.retro-web a:visited {
  color: #800080;
}

.retro-web a:hover {
  background: #0000AA;
  color: #FFFFFF;
}

.retro-web h1 {
  font-size: 2rem;
  color: #0000AA;
  text-shadow: 2px 2px #FF00FF;
}

.retro-web hr {
  border: none;
  border-top: 3px ridge #FF00FF;
  margin: 24px 0;
}

.under-construction {
  text-align: center;
  font-weight: bold;
  color: #FF0000;
}',
    'published'
FROM categories c WHERE c.name_en = 'Retro/Web 1.0'
ON CONFLICT DO NOTHING;

-- 风格 10: 排版驱动 - "Typography Studio"
INSERT INTO styles (title, description, category_id, color_palette, fonts, spacing, border_radius, shadows, code_html, code_css, status)
SELECT
    'Typography Studio',
    '排版驱动的设计工作室风格，以大胆字体和文字作为主要视觉元素。适合设计工作室和创意出版物。',
    c.id,
    '{"primary": "#000000", "secondary": "#FF4400", "background": "#F8F5F0", "surface": "#FFFFFF", "accent": "#0066FF"}'::jsonb,
    '{"heading": "Archivo Black, sans-serif", "body": "IBM Plex Sans, sans-serif", "headingSize": "clamp(4rem, 15vw, 12rem)", "bodySize": "1.1rem", "lineHeight": "1.7"}'::jsonb,
    '{"base": "8px", "scale": "1.333", "section": "clamp(80px, 12vw, 160px)"}'::jsonb,
    '{"sm": "0px", "md": "0px", "lg": "0px"}'::jsonb,
    '{"sm": "none", "md": "none", "lg": "none"}'::jsonb,
    '<section class="typography-hero">
  <div class="container">
    <h1 class="mega-text">STUDIO</h1>
    <p class="subtitle">我们创造<br/>有意义的品牌体验</p>
    <div class="services">
      <div class="service-item">
        <span class="service-num">01</span>
        <span class="service-name">品牌策略</span>
      </div>
      <div class="service-item">
        <span class="service-num">02</span>
        <span class="service-name">视觉设计</span>
      </div>
      <div class="service-item">
        <span class="service-num">03</span>
        <span class="service-name">数字体验</span>
      </div>
    </div>
  </div>
</section>',
    '.typography-hero {
  background: #F8F5F0;
  min-height: 100vh;
  padding: clamp(80px, 12vw, 160px) 24px;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
}

.mega-text {
  font-family: "Archivo Black", sans-serif;
  font-size: clamp(4rem, 15vw, 12rem);
  font-weight: 900;
  line-height: 0.8;
  letter-spacing: -0.03em;
  color: #000000;
  margin: 0;
  text-transform: uppercase;
}

.subtitle {
  font-family: "IBM Plex Sans", sans-serif;
  font-size: clamp(1.25rem, 3vw, 2rem);
  font-weight: 300;
  color: #333333;
  margin-top: 32px;
  line-height: 1.4;
}

.subtitle br {
  display: block;
}

.services {
  margin-top: 64px;
  border-top: 2px solid #000000;
}

.service-item {
  display: flex;
  border-bottom: 1px solid #E0E0E0;
  padding: 24px 0;
  transition: padding 0.3s;
}

.service-item:hover {
  padding-left: 16px;
}

.service-num {
  font-family: "IBM Plex Mono", monospace;
  font-size: 0.9rem;
  color: #999999;
  width: 60px;
}

.service-name {
  font-family: "IBM Plex Sans", sans-serif;
  font-size: 1.5rem;
  font-weight: 500;
  color: #000000;
}',
    'published'
FROM categories c WHERE c.name_en = 'Typography-Driven'
ON CONFLICT DO NOTHING;

-- ===========================================
-- 2. 关联风格与标签
-- ===========================================

-- 为每个风格添加标签关联（示例）
-- 注意：实际使用中需要根据生成的 style_id 和 tag_id 进行关联
-- 这里使用简化方式，实际导入时可通过程序生成

-- ===========================================
-- 3. 验证查询
-- ===========================================

-- 检查风格总数
DO $$
DECLARE
    style_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO style_count FROM styles;
    RAISE NOTICE '风格案例总数：%', style_count;

    IF style_count = 10 THEN
        RAISE NOTICE '✅ 成功导入 10 个风格案例';
    ELSE
        RAISE WARNING '⚠️ 风格案例数量不是 10 个，请检查导入脚本';
    END IF;
END $$;

-- 按分类查看风格
SELECT
    c.name as category,
    COUNT(s.id) as style_count
FROM categories c
LEFT JOIN styles s ON s.category_id = c.id
GROUP BY c.id, c.name, c.sort_order
ORDER BY c.sort_order;
