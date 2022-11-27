//---------------------------------------------------------------------
// uQRCode二维码生成插件 v4.0.1
// 
// uQRCode是一款基于Javascript环境开发的二维码生成插件，适用所有Javascript运行环境的前端应用和Node.js。
// 
// Copyright (c) Sansnn uQRCode All rights reserved.
// 
// Licensed under the Apache License, Version 2.0.
//   http://www.apache.org/licenses/LICENSE-2.0
// 
// github地址：
//   https://github.com/Sansnn/uQRCode
// 
// npm地址：
//   https://www.npmjs.com/package/uqrcodejs
// 
// uni-app插件市场地址：
//   https://ext.dcloud.net.cn/plugin?id=1287
// 
// 复制使用请保留本段注释，感谢支持开源！
// 
//---------------------------------------------------------------------

//---------------------------------------------------------------------
// 当前文件格式为 amd，异步模块定义，适用于 RequireJS 等模块加载器
// 如需在其他环境使用，请获取环境对应的格式文件
// 格式说明：
// amd - 异步模块定义，适用于 RequireJS 等模块加载器
// cjs - CommonJS，适用于 Node 环境和其他打包工具（别名：commonjs）
// es - 将 bundle 保留为 ES 模块文件，适用于其他打包工具以及支持 <script type=module> 标签的浏览器（别名: esm，module）
// umd - 通用模块定义，生成的包同时支持 amd、cjs 和 iife 三种格式
//---------------------------------------------------------------------

define((function () {
  function Plugin(UQRCode, options) {
    options.backgroundRadius = 1.0; // 背景码点圆角半径，系数：0.0-1.0
    options.foregroundRadius = 1.0; // 前景码点圆角半径，0.0-1.0

    options.drawRoundCanvas = function() {
      let {
        isMaked,
        canvasContext: ctx,
        dynamicSize: size,
        foregroundRadius,
        backgroundColor,
        backgroundRadius,
        drawReserve
      } = this;

      if (!isMaked) {
        console.error('[uQRCode]: please execute the make method first!');
        return Promise.reject(new UQRCode.Error('please execute the make method first!'));
      }

      let drawModules = this.getDrawModules();

      let draw = async (resolve, reject) => {
        try {
          ctx.clearRect(0, 0, size, size);
          ctx.draw(false);
          for (var i = 0; i < drawModules.length; i++) {
            var drawModule = drawModules[i];
            ctx.save();
            switch (drawModule.type) {
              case 'area':
                /* 绘制区域 */
                ctx.setFillStyle(drawModule.color);
                ctx.fillRect(drawModule.x, drawModule.y, drawModule.width, drawModule.height);
                break;
              case 'tile':
                /* 绘制码点 */
                var x = drawModule.x;
                var y = drawModule.y;
                var w = drawModule.width;
                var h = drawModule.height;
                var r = 0;
                if (drawModule.name == 'foreground' && foregroundRadius > 0) {
                  r = w / 2 * foregroundRadius;
                } else if (drawModule.name == 'background' && backgroundRadius > 0) {
                  r = w / 2 * backgroundRadius;
                }
                ctx.beginPath();
                ctx.moveTo(x + r, y);
                ctx.arcTo(x + w, y, x + w, y + h, r);
                ctx.arcTo(x + w, y + h, x, y + h, r);
                ctx.arcTo(x, y + h, x, y, r);
                ctx.arcTo(x, y, x + w, y, r);
                ctx.closePath();
                ctx.fillStyle = drawModule.color;
                ctx.fill();
                ctx.clip();
                break;
              case 'image':
                /* 绘制图像 */
                if (drawModule.name === 'backgroundImage') {
                  var x = drawModule.x;
                  var y = drawModule.y;
                  var w = drawModule.width;
                  var h = drawModule.height;
                  var r = drawModule.borderRadius;
                  if (w < 2 * r) {
                    r = w / 2;
                  }
                  if (h < 2 * r) {
                    r = h / 2;
                  }

                  /* 设置透明度 */
                  ctx.globalAlpha = drawModule.alpha;

                  /* 绘制圆角 */
                  ctx.beginPath();
                  ctx.moveTo(x + r, y);
                  ctx.arcTo(x + w, y, x + w, y + h, r);
                  ctx.arcTo(x + w, y + h, x, y + h, r);
                  ctx.arcTo(x, y + h, x, y, r);
                  ctx.arcTo(x, y, x + w, y, r);
                  ctx.closePath();
                  ctx.strokeStyle = 'rgba(0,0,0,0)';
                  ctx.stroke();
                  ctx.clip();

                  try {
                    /* 绘制图片前需要先加载图片，因为图片可能是异步资源，如果没有设置loadImage方法，则需要在上层先获取到图片再传入 */
                    var img = await this.loadImage(drawModule.imageSrc);
                    ctx.drawImage(img, drawModule.x, drawModule.y, drawModule.width, drawModule.height);
                  } catch (e) {
                    console.error(`[uQRCode]: ${drawModule.mappingName} invalid!`);
                    throw new UQRCode.Error(`${drawModule.mappingName} invalid!`);
                  }
                } else if (drawModule.name === 'foregroundImage') {
                  var x = drawModule.x;
                  var y = drawModule.y;
                  var w = drawModule.width;
                  var h = drawModule.height;
                  var r = drawModule.borderRadius;
                  if (w < 2 * r) {
                    r = w / 2;
                  }
                  if (h < 2 * r) {
                    r = h / 2;
                  }
                  var bx = drawModule.x - drawModule.padding;
                  var by = drawModule.y - drawModule.padding;
                  var bw = drawModule.width + drawModule.padding * 2;
                  var bh = drawModule.height + drawModule.padding * 2;
                  var br = (bw / w) * r;
                  if (bw < 2 * br) {
                    br = bw / 2;
                  }
                  if (bh < 2 * br) {
                    br = bh / 2;
                  }

                  /* 绘制阴影 */
                  ctx.save();
                  ctx.shadowOffsetX = drawModule.shadowOffsetX;
                  ctx.shadowOffsetY = drawModule.shadowOffsetY;
                  ctx.shadowBlur = drawModule.shadowBlur;
                  ctx.shadowColor = drawModule.shadowColor;
                  /* 阴影需要一个填充块作为载体 */
                  ctx.beginPath();
                  ctx.moveTo(bx + br, by);
                  ctx.arcTo(bx + bw, by, bx + bw, by + bh, br);
                  ctx.arcTo(bx + bw, by + bh, bx, by + bh, br);
                  ctx.arcTo(bx, by + bh, bx, by, br);
                  ctx.arcTo(bx, by, bx + bw, by, br);
                  ctx.closePath();
                  ctx.setFillStyle(drawModule.backgroundColor);
                  ctx.fill();
                  ctx.restore();

                  /* 绘制Padding */
                  ctx.beginPath();
                  ctx.moveTo(bx + br, by);
                  ctx.arcTo(bx + bw, by, bx + bw, by + bh, br);
                  ctx.arcTo(bx + bw, by + bh, bx, by + bh, br);
                  ctx.arcTo(bx, by + bh, bx, by, br);
                  ctx.arcTo(bx, by, bx + bw, by, br);
                  ctx.closePath();
                  ctx.setFillStyle(drawModule.padding > 0 ? drawModule.backgroundColor : 'rgba(0,0,0,0)');
                  ctx.fill();

                  /* 绘制圆角 */
                  ctx.beginPath();
                  ctx.moveTo(x + r, y);
                  ctx.arcTo(x + w, y, x + w, y + h, r);
                  ctx.arcTo(x + w, y + h, x, y + h, r);
                  ctx.arcTo(x, y + h, x, y, r);
                  ctx.arcTo(x, y, x + w, y, r);
                  ctx.closePath();
                  ctx.strokeStyle = 'rgba(0,0,0,0)';
                  ctx.stroke();
                  ctx.clip();

                  try {
                    /* 绘制图片前需要先加载图片，因为图片可能是异步资源，如果没有设置loadImage方法，则需要在上层先获取到图片再传入 */
                    var img = await this.loadImage(drawModule.imageSrc);
                    ctx.drawImage(img, drawModule.x, drawModule.y, drawModule.width, drawModule.height);
                  } catch (e) {
                    console.error(`[uQRCode]: ${drawModule.mappingName} invalid!`);
                    throw new UQRCode.Error(`${drawModule.mappingName} invalid!`);
                  }
                }
                break;
            }

            /* gcanvas需要每一阶段都draw一下，否则重绘有问题，例如uni-app nvue绘制图片会失败 */
            if (drawReserve) {
              ctx.draw(true);
            }

            ctx.restore();
          }
          ctx.draw(true);
          /* 某些平台的draw回调不一定会触发，故resolve不放在draw回调中 */
          setTimeout(resolve, 150);
        } catch (e) {
          if (e instanceof UQRCode.Error) {
            reject(e);
          } else {
            throw e;
          }
        }
      };

      return new Promise((resolve, reject) => {
        /* 完成绘制 */
        draw(resolve, reject);
      });
    };
  }

  Plugin.Type = 'style'; // 如果需要组件可用此扩展，那么该属性必需
  Plugin.Name = 'round'; // 如果需要组件可用此扩展，那么该属性必需
  Plugin.DrawCanvas = 'drawRoundCanvas'; // 如果需要组件可用此扩展，那么该属性必需

  return Plugin;

}));