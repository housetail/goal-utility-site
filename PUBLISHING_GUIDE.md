# GitLab Pages 发布操作手册

## 1. 新建仓库
1. 在 GitLab 上创建项目（推荐名称 `goal-utility-site`，可设为公开以便展示广告）：
   - `Project name`: goal-utility-site
   - `Visibility`: Public（广告审核更顺利）
2. 若项目默认分支非 `main`，在仓库设置中将默认分支改为 `main`。

## 2. 推送本地代码
```bash
git remote add origin git@gitlab.com:<username>/goal-utility-site.git
git branch -M main
git push -u origin main
```
> 如使用 HTTPS，可替换为 `https://gitlab.com/<username>/goal-utility-site.git`。

## 3. 启用 GitLab Pages
1. 进入仓库 **Settings → Pages**，确认 Pages 功能已启用。
2. 首次推送后 CI 会自动运行 `.gitlab-ci.yml` 中的 `pages` 任务。
3. 任务成功后会在 Pages 设置页看到部署的公共 URL，例如 `https://<username>.gitlab.io/goal-utility-site/`。

## 4. 广告脚本配置
1. 登录 Google AdSense，创建广告单元，获取 `data-ad-client`、`data-ad-slot`。
2. 编辑 `public/index.html` 中对应字段，提交并推送：
   ```html
   data-ad-client="ca-pub-xxxxxxxxxxxxxxxx"
   data-ad-slot="1234567890"
   ```
3. 推送后 GitLab Pages 会重新部署，广告脚本将随页面加载。

## 5. 测试与监控
- 推广前先通过 Pages URL 自测三款工具是否正常
- 在 AdSense 控制台监控填充率和收益
- 可接入 Google Analytics 或 Cloudflare Web Analytics 追踪访问

## 6. 常见问题
- **广告未显示**：需等待 AdSense 审核，或在 Page 中添加更多内容提升价值。
- **CI 失败**：确认仓库中 `public/` 目录存在且提交到了 `main`。
- **访问慢**：可配置自定义域名并开启 Cloudflare CDN 加速。
