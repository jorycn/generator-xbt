# xbt workflow generator

> 项目基于 Tencent/tmt-workflow 构建
> xbt是基于gulp构建的前端工作流, 其不限于以下功能：

## 功能特性

- 自动化流程
  - [Less/Sass -> CSS](https://github.com/Tencent/tmt-workflow/wiki/%E2%92%8C-Less-%E7%BC%96%E8%AF%91)
  - [CSS Autoprefixer 前缀自动补全](https://github.com/Tencent/tmt-workflow/wiki/%E2%92%8D-Autoprefixer)
  - [自动生成图片 CSS 属性，width & height 等](https://github.com/Tencent/gulp-lazyimagecss)
  - [自动内联 SVG 到 CSS](https://github.com/Tencent/gulp-svg-inline)
  - [CSS 压缩 cssnano](https://github.com/ben-eb/cssnano)
  - [CSS Sprite 雪碧图合成](https://github.com/Tencent/tmt-workflow/wiki/%E2%92%8E-CSS-Sprite)
  - [Retina @2x & @3x 自动生成适配](https://github.com/Tencent/tmt-workflow/wiki/%E2%92%8E-CSS-Sprite)
  - [imagemin 图片压缩](https://github.com/sindresorhus/gulp-imagemin)
  - [JS 合并压缩](https://github.com/Tencent/tmt-workflow/wiki/%E2%92%8F-JS-%E5%90%88%E5%B9%B6%E5%8E%8B%E7%BC%A9)
  - [EJS 模版语言](https://github.com/Tencent/tmt-workflow/wiki/%E2%92%90-EJS-%E6%A8%A1%E7%89%88%E8%AF%AD%E8%A8%80)  
- 调试 & 部署
  - [监听文件变动，自动刷新浏览器 (LiveReload)](https://github.com/Tencent/tmt-workflow/wiki/%E2%92%91-LiveReload)
  - [FTP 发布部署](https://github.com/Tencent/tmt-workflow/wiki/%E2%92%92-FTP-%E5%8F%91%E5%B8%83%E9%83%A8%E7%BD%B2)
  - [ZIP 项目打包](https://github.com/Tencent/tmt-workflow/wiki/%E2%92%93-ZIP-%E6%89%93%E5%8C%85)
- 解决方案集成
  - [px -> rem 兼容适配方案](https://github.com/Tencent/tmt-workflow/wiki/%E2%92%94-REM-%E8%A7%A3%E5%86%B3%E6%96%B9%E6%A1%88)
  - [智能 WebP 解决方案](https://github.com/Tencent/tmt-workflow/wiki/%E2%92%95-WEBP-%E8%A7%A3%E5%86%B3%E6%96%B9%E6%A1%88)
  - [SVG 整体解决方案](https://github.com/Tencent/tmt-workflow/wiki/%E2%92%9A-SVG%E6%95%B4%E4%BD%93%E8%A7%A3%E5%86%B3%E6%96%B9%E6%A1%88)
  - [去缓存文件 Reversion (MD5) 解决方案](https://github.com/Tencent/tmt-workflow/wiki/%E2%92%96-Reversion-%E8%A7%A3%E5%86%B3%E6%96%B9%E6%A1%88)

- 除以上官方功能支持外，继续支持
  - CDN解决方案
  - inline resource资源管理方案，包括：js,css

## 快速开始

```bash
  1. `npm install gulpjs/gulp#4.0 -g`
  2. `npm install -g yo`
  3. `npm install -g generator-xbt`
  4. `yo xbt`
```

## 配置文件 `.tmtworkflowrc`

`.tmtworkflowrc` 配置文件为**隐藏文件**，位于工作流根目录，可存放配置信息或开启相关功能，[详见WiKi](https://github.com/Tencent/tmt-workflow/wiki/%E2%92%8A-%E9%85%8D%E7%BD%AE%E6%96%87%E4%BB%B6%E8%AF%B4%E6%98%8E)。  
_如：FTP 配置信息、开启 WebP功能，开启 REM 支持等。_

```bash
{
  // FTP 发布配置
  "ftp": {
    "host": "xx.xx.xx.xx",
    "port": "8021",
    "user": "tmt",
    "pass": "password",
    "remotePath": "remotePath",         // 默认上传至根目录，此属性可指定子目录路径
    "includeHtml": true                 // FTP 上传时是否包含 .html 文件
  },

  // 浏览器自动刷新
  "livereload": {
     "available": true,                 // 开启
     "port": 8080,
     "startPath": "html/TmTIndex.html"  // 启动时自动打开的路径
  },

  // 插件功能

  // 路径相对于 tasks/plugins 目录
  "plugins": {
    "build_devAfter": ["TmTIndex"],     // build_dev 任务执行完成后，自动执行
    "build_distAfter": [],              // build_dist 任务执行完成后，自动执行
    "ftpAfter": ["ftp"]                 // ftp 任务执行完成后，自动执行
  },

  "lazyDir": ["../slice"],              // gulp-lazyImageCSS 启用目录
  
  "supportWebp": false,                 // 开启 WebP 解决方案

  "supportREM": false,                  // 开启 REM 适配方案，自动转换 px -> rem

  "supportChanged": false,              // 开启 只编译有变动的文件

  "reversion": false                    // 开启 新文件名 md5 功能
}
```

## License

所有代码采用 [MIT License](http://opensource.org/licenses/MIT)
