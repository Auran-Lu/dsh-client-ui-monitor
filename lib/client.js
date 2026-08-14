window.__ModuleLoader__.load({
  id: "@auranlu/dsh-client-ui-monitor",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
    var React = require("react");
    var e = React.createElement;

    // ---- CSS injection (deduped by data-plugin-css) ----
    var css = ""
      + ".mnt{box-sizing:border-box;font-family:inherit;flex:1 1 100%;min-width:0;width:100%}"
      + ".mnt-rail{width:100%;height:36px;display:flex;justify-content:center;align-items:center}"
      + ".mnt-glyph{color:var(--dsw-alias-label-tertiary);font-size:13px;font-weight:600;line-height:1}"
      + ".mnt-card{box-sizing:border-box;margin:0 4px;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-specific-tip);border-radius:10px;padding:8px 10px;display:flex;flex-direction:column;gap:4px}"
      + ".mnt-head{display:flex;justify-content:space-between;align-items:center;gap:8px}"
      + ".mnt-title{font-size:11px;font-weight:600;color:var(--dsw-alias-label-caption);letter-spacing:.04em;flex:1;min-width:0}"
      + ".mnt-tools{display:flex;align-items:center;gap:4px;flex:none}"
      + ".mnt-select{background:transparent;border:1px solid var(--dsw-alias-border-l1);color:var(--dsw-alias-label-secondary);border-radius:4px;font-size:11px;height:18px;padding:0 2px;line-height:1;outline:none;flex:none}"
      + ".mnt-row{display:flex;justify-content:space-between;align-items:center;gap:8px;font-size:12px;line-height:18px}"
      + ".mnt-label{color:var(--dsw-alias-label-tertiary);white-space:nowrap}"
      + ".mnt-value{color:var(--dsw-alias-label-primary);font-variant-numeric:tabular-nums;text-align:right}"
      + ".mnt-value-dim{color:var(--dsw-alias-label-primary-dimmed);font-variant-numeric:tabular-nums;text-align:right}"
      + ".mnt-error{color:var(--dsw-alias-state-error-primary);font-size:11px;text-align:right}"
      + ".mnt-icon-btn{cursor:pointer;background:transparent;border:none;color:var(--dsw-alias-label-tertiary);height:18px;min-width:18px;padding:0 3px;border-radius:4px;display:inline-flex;justify-content:center;align-items:center;font-size:12px;line-height:1;flex:none}"
      + ".mnt-icon-btn:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-secondary)}"
      + ".mnt-icon-btn:disabled{opacity:.4;cursor:default}";
    var tagId = "@auranlu/dsh-client-ui-monitor/Monitor.module.css";
    if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
      var tag = document.createElement("style");
      tag.dataset.plugin = "@auranlu/dsh-client-ui-monitor";
      tag.dataset.pluginCss = tagId;
      tag.textContent = css;
      document.head.appendChild(tag);
    }

    // ---- DeepSeek pricing (USD per 1M tokens). Edit to match your model. ----
    var PRICING = {
      inputPerM: 0.27,       // prompt, cache miss
      cacheReadPerM: 0.07,   // prompt, cache hit
      cacheWritePerM: 0.07,  // prompt, cache write
      outputPerM: 1.10,      // completion
    };
    // USD -> CNY exchange rate (cost is USD-based; balance is CNY-based).
    var USD_TO_CNY = 7.2;

    var T = {
      zh: {
        title: "会话用量", input: "输入", cache: "缓存", output: "输出",
        cost: "预估费用", balance: "API 余额", unavailable: "不可用",
        refresh: "刷新余额", switchLang: "Switch to English", currency: "币种",
      },
      en: {
        title: "Session Usage", input: "Input", cache: "Cache", output: "Output",
        cost: "Est. Cost", balance: "API Balance", unavailable: "Unavailable",
        refresh: "Refresh balance", switchLang: "切换到中文", currency: "Currency",
      },
    };
    var CURRENCY = { CNY: { symbol: "\u00A5" }, USD: { symbol: "$" } };

    function fmt(n) {
      if (!Number.isFinite(n) || n <= 0) return "0";
      if (n < 1000) return String(Math.round(n));
      if (n < 1e6) return (n / 1e3).toFixed(n < 1e4 ? 1 : 0).replace(/\.0$/, "") + "K";
      return (n / 1e6).toFixed(2).replace(/\.?0+$/, "") + "M";
    }

    function costUSD(u) {
      if (!u) return 0;
      return (u.uncachedInputTokens || 0) / 1e6 * PRICING.inputPerM
        + (u.cacheReadTokens || 0) / 1e6 * PRICING.cacheReadPerM
        + (u.cacheWriteTokens || 0) / 1e6 * PRICING.cacheWritePerM
        + (u.outputTokens || 0) / 1e6 * PRICING.outputPerM;
    }

    function convert(value, base, currency) {
      if (base === currency) return value;
      if (base === "USD" && currency === "CNY") return value * USD_TO_CNY;
      if (base === "CNY" && currency === "USD") return value / USD_TO_CNY;
      return value;
    }

    function money(value, currency, decimals) {
      var c = CURRENCY[currency];
      return (c ? c.symbol : "") + value.toFixed(decimals);
    }

    function balanceCnyOf(data) {
      if (data && data.is_available !== false && data.balance_infos && data.balance_infos.length) {
        var v = parseFloat(data.balance_infos[0].total_balance);
        if (Number.isFinite(v)) return v;
      }
      return null;
    }

    function readPref(key, fallback) {
      try { return window.localStorage.getItem(key) || fallback; } catch (err) { return fallback; }
    }
    function writePref(key, value) {
      try { window.localStorage.setItem(key, value); } catch (err) {}
    }

    function MonitorDock(props) {
      var wide = props.wide;
      var useSessions = props.useSessions;

      var tokenUsage = useSessions(function (s) {
        var id = s.current;
        if (!id) return undefined;
        var row = s.byId[id];
        if (!row || !row.projectionValues) return undefined;
        return row.projectionValues.tokenUsage;
      });

      var langPair = React.useState(readPref("dsh-monitor-lang", "zh"));
      var lang = langPair[0];
      var setLang = langPair[1];

      var currencyPair = React.useState(readPref("dsh-monitor-currency", "CNY"));
      var currency = currencyPair[0];
      var setCurrency = currencyPair[1];

      var balancePair = React.useState({ loading: true, data: null, error: null });
      var balanceState = balancePair[0];
      var setBalanceState = balancePair[1];

      React.useEffect(function () { writePref("dsh-monitor-lang", lang); }, [lang]);
      React.useEffect(function () { writePref("dsh-monitor-currency", currency); }, [currency]);

      var loadBalance = React.useCallback(function () {
        setBalanceState(function (prev) { return { loading: true, data: prev.data, error: null }; });
        fetch("/api/deepseek-balance")
          .then(function (r) { return r.json(); })
          .then(function (d) {
            if (d && d.ok) setBalanceState({ loading: false, data: d.balance, error: null });
            else setBalanceState({ loading: false, data: null, error: (d && d.error) || "balance_error" });
          })
          .catch(function (err) {
            setBalanceState({ loading: false, data: null, error: (err && err.message) || String(err) });
          });
      }, []);

      React.useEffect(function () {
        loadBalance();
        var timer = setInterval(loadBalance, 30000);
        return function () { clearInterval(timer); };
      }, [loadBalance]);

      var t = T[lang] || T.zh;
      var u = tokenUsage;
      var input = (u && u.uncachedInputTokens) || 0;
      var cache = ((u && u.cacheReadTokens) || 0) + ((u && u.cacheWriteTokens) || 0);
      var output = (u && u.outputTokens) || 0;
      var costText = money(convert(costUSD(u), "USD", currency), currency, 4);
      var balanceCny = balanceCnyOf(balanceState.data);
      var balanceText = balanceCny === null ? null : money(convert(balanceCny, "CNY", currency), currency, 2);

      if (!wide) {
        return e("div", { className: "mnt mnt-rail", title: t.title },
          e("span", { className: "mnt-glyph" }, "\u25C8"));
      }

      return e("div", { className: "mnt" },
        e("div", { className: "mnt-card" },
          e("div", { className: "mnt-head" },
            e("div", { className: "mnt-title" }, t.title),
            e("div", { className: "mnt-tools" },
              e("select", {
                className: "mnt-select",
                value: currency,
                onChange: function (ev) { setCurrency(ev.target.value); },
                title: t.currency,
                "aria-label": t.currency,
              },
                e("option", { value: "CNY" }, "\u00A5 CNY"),
                e("option", { value: "USD" }, "$ USD")),
              e("button", {
                className: "mnt-icon-btn",
                type: "button",
                onClick: function () { setLang(lang === "zh" ? "en" : "zh"); },
                title: t.switchLang,
                "aria-label": t.switchLang,
              }, lang === "zh" ? "EN" : "\u4E2D"),
              e("button", {
                className: "mnt-icon-btn",
                type: "button",
                onClick: loadBalance,
                disabled: balanceState.loading,
                title: t.refresh,
                "aria-label": t.refresh,
              }, balanceState.loading ? "\u2026" : "\u21BB"))),
          e("div", { className: "mnt-row" },
            e("span", { className: "mnt-label" }, t.input),
            e("span", { className: "mnt-value" },
              fmt(input) + (cache > 0 ? " \u00B7 " + t.cache + " " + fmt(cache) : ""))),
          e("div", { className: "mnt-row" },
            e("span", { className: "mnt-label" }, t.output),
            e("span", { className: "mnt-value" }, fmt(output))),
          e("div", { className: "mnt-row" },
            e("span", { className: "mnt-label" }, t.cost),
            e("span", { className: "mnt-value" }, costText)),
          e("div", { className: "mnt-row" },
            e("span", { className: "mnt-label" }, t.balance),
            balanceText !== null ? e("span", { className: "mnt-value" }, balanceText)
              : balanceState.error ? e("span", { className: "mnt-error", title: balanceState.error }, t.unavailable)
              : e("span", { className: "mnt-value-dim" }, "\u2026"))
        )
      );
    }

    var inject = ["slots"];

    function apply(ctx) {
      ctx.slots.inject("sidebar.footer.action", function () {
        return ctx.slots.register({
          name: "sidebar.footer.action",
          id: "monitor",
          order: 0,
          inject: function () { return {}; },
        }, MonitorDock);
      });
    }

    exports.apply = apply;
    exports.inject = inject;
    return module.exports;
  }
});
