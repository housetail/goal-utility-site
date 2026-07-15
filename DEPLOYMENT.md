# 部署与广告接入指南

## 1. 仓库结构
```
work/goal_site/
├── public/
│   ├── index.html
│   ├── styles.css
│   └── main.js
├── README.md
└── DEPLOYMENT.md
```

## 2. 发布到 Cloudflare Pages
1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/) 并选择 **Pages**。
2. 点击 **Create a project** → 选择 **Upload assets**。
3. 将 `public/` 目录内容打包压缩（或直接逐个上传）。
4. 档案上传完成后，指定自定义域名或使用 Cloudflare 提供的默认域。
5. 部署完成后即可通过生成的 URL 访问网站。

### 使用 Git 仓库自动部署
1. 将 `work/goal_site` 目录推送到 Git 仓库。
2. 在 Cloudflare Pages 选择 **Connect to Git**，授权后选择对应仓库。
3. 构建设置：
   - `Framework preset`: **None**（纯静态）
   - `Build command`: 留空
   - `Build output directory`: `public`
4. 保存后自动部署，后续每次 `git push` 都会触发重新部署。

## 3. Google AdSense 配置
1. 在 [Google AdSense](https://www.google.com/adsense/) 注册并获取审核通过的发布者 ID（示例：`ca-pub-1234567890123456`）。
2. 登录后台 → **广告** → **按单元** → 创建广告单元。
3. 记录生成的 `data-ad-client` 和 `data-ad-slot`。
4. 在 `public/index.html` 中替换占位符：
   ```html
   data-ad-client="ca-pub-实际ID"
   data-ad-slot="广告位ID"
   ```
5. 广告脚本全局仅需添加一次 `<script src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?...">`。
6. 部署后等待审核通过，即可在访客访问时展示广告。

## 4. 其他广告服务备选
- **国内站点**：可使用穿山甲联盟、腾讯广告、百度联盟等，替换对应 `<script>`。
- **统计分析**：建议集成 Google Analytics 或百度统计监测广告转化。

## 5. 部署检验清单
- [ ] 网站可通过公开 URL 访问。
- [ ] 三个工具均能成功交互：
  - 汇率换算：加载汇率列表并正确计算。
  - 房贷计算：输入参数后展示月供与总利息。
  - 旅行预算：输出基础预算、应急金、人均费用。
- [ ] 广告位显示占位（审核完成后显示真实广告）。
- [ ] 响应式布局在桌面与移动端显示正常。

## 6. 常见问题
- **汇率 API 限制**：若出现跨域或访问慢，可考虑在本地部署代理或使用备用 API，例如 `https://open.er-api.com/v6/latest`。
- **广告未展示**：确保广告位尺寸符合要求，并等待审核通过。
- **部署失败**：确认 `Build output directory` 设置为 `public`，并重新触发部署。
