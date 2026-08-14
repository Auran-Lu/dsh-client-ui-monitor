# @auranlu/dsh-client-ui-monitor

一个 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) 的 Web 插件，在左侧栏底部固定显示一个用量仪表盘。

[English](README.md)

实时显示当前会话的：

- **Token 用量** —— 输入（含缓存读写）、输出。
- **预估费用** —— 按 DeepSeek 官方定价折算，可显示人民币（CNY）或美元（USD）。
- **API 余额** —— 通过 `GET https://api.deepseek.com/user/balance` 查询你的 DeepSeek 账户余额。

功能：中英文切换、币种自选（CNY/USD）、手动刷新余额、每 30 秒自动刷新。

## 前置条件

- DeepSeek Harness 的 `web` profile。
- 已在 **设置 → 模型** 中配置 DeepSeek API key（即 `DEEPSEEK_API_KEY` 凭据）。

## 安装

### 方式一 —— GitHub 安装

```bash
dsh plugin --profile web add github:Auran-Lu/dsh-client-ui-monitor
```

**安装完成后**，还需注册插件并重启：

编辑 `~/.dsh/profiles/web/cordis.patch.yml`，在顶层数组中加入：

```yaml
- insert:
    - id: ui-monitor
      name: '@auranlu/dsh-client-ui-monitor'
```

然后重启服务（`dsh web`），展开左侧栏即可看到仪表盘。

### 方式二 —— 一句话安装（发给大模型智能体自动安装）

把下面整段提示词复制给一个能操作你机器的编程智能体即可：

> 从 GitHub 安装 DeepSeek Harness 客户端插件：执行 `dsh plugin --profile web add github:Auran-Lu/dsh-client-ui-monitor`，然后在 `~/.dsh/profiles/web/cordis.patch.yml` 的顶层数组中追加：
>
> ```yaml
> - insert:
>     - id: ui-monitor
>       name: '@auranlu/dsh-client-ui-monitor'
> ```
>
> 最后重启 `dsh web` 服务使插件生效，并确认左侧栏底部出现用量仪表盘。

## 配置

在安装/发布前，可编辑 `lib/client.js`：

| 常量 | 默认值 | 含义 |
|---|---|---|
| `PRICING.inputPerM` | `0.27` | 每 1M 输入 token 的价格（美元，缓存未命中） |
| `PRICING.cacheReadPerM` | `0.07` | 每 1M 输入 token 的价格（美元，缓存命中） |
| `PRICING.cacheWritePerM` | `0.07` | 每 1M 输入 token 的价格（美元，缓存写入） |
| `PRICING.outputPerM` | `1.10` | 每 1M 输出 token 的价格（美元） |
| `USD_TO_CNY` | `7.2` | 美元 → 人民币汇率 |

## 工作原理

- **客户端半**（`lib/client.js`）把组件注册进 `sidebar.footer.action` 插槽，并读取当前会话的 `tokenUsage` 投影。
- **宿主半**（`lib/index.js`）注册 `GET /api/deepseek-balance` 路由，用已保存的 key 代理 DeepSeek 的余额接口。

## 许可证

MIT
