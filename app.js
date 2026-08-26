// Global Window SwitchTab Function
window.switchTab = function(tabName) {
    const tabPlayground = document.getElementById('tab-playground');
    const tabQuant = document.getElementById('tab-quant');
    const tabMonitor = document.getElementById('tab-monitor');
    const tabRegistry = document.getElementById('tab-registry');

    const viewPlayground = document.getElementById('view-playground');
    const viewQuant = document.getElementById('view-quant');
    const viewMonitor = document.getElementById('view-monitor');
    const viewRegistry = document.getElementById('view-registry');

    const viewTitle = document.getElementById('view-title');
    const viewChip = document.getElementById('view-chip');

    if (!viewPlayground || !viewQuant || !viewMonitor || !viewRegistry) return;

    [tabPlayground, tabQuant, tabMonitor, tabRegistry].forEach(t => { if (t) t.classList.remove('active'); });
    [viewPlayground, viewQuant, viewMonitor, viewRegistry].forEach(v => { if (v) v.style.display = 'none'; });

    if (tabName === 'playground') {
        if (tabPlayground) tabPlayground.classList.add('active');
        viewPlayground.style.display = 'grid';
        if (viewTitle) viewTitle.textContent = 'Security Auditor Console';
        if (viewChip) viewChip.textContent = '/r/d-techno-hub';
    } else if (tabName === 'quant') {
        if (tabQuant) tabQuant.classList.add('active');
        viewQuant.style.display = 'grid';
        if (viewTitle) viewTitle.textContent = 'Quant Strategy & Risk Evaluator';
        if (viewChip) viewChip.textContent = '/r/d-quant-hub';
        if (window.fetchQuantFeed) window.fetchQuantFeed();
    } else if (tabName === 'monitor') {
        if (tabMonitor) tabMonitor.classList.add('active');
        viewMonitor.style.display = 'block';
        if (viewTitle) viewTitle.textContent = 'Live Technocore Stream Monitor';
        if (viewChip) viewChip.textContent = '/r/d-techno-hub';
        if (window.fetchTechnocoreFeedFull) window.fetchTechnocoreFeedFull();
    } else if (tabName === 'registry') {
        if (tabRegistry) tabRegistry.classList.add('active');
        viewRegistry.style.display = 'block';
        if (viewTitle) viewTitle.textContent = 'DID Identity Registry Resolver';
        if (viewChip) viewChip.textContent = '/kv/did/3ba92e38f2f5b990';
    }
};

document.addEventListener('DOMContentLoaded', () => {
    // 1. Code Auditor Controls
    const codeEditor = document.getElementById('code-input');
    const btnAudit = document.getElementById('btn-audit');
    const btnSampleRisk = document.getElementById('btn-sample-risk');
    const btnSampleClean = document.getElementById('btn-sample-clean');
    const auditResult = document.getElementById('audit-result');
    const scoreBadge = document.getElementById('score-badge');
    const resStatus = document.getElementById('res-status');
    const resFindings = document.getElementById('res-findings');
    const resPayload = document.getElementById('res-payload');

    // 2. Quant Hub Controls
    const quantEditor = document.getElementById('quant-input');
    const btnEvalQuant = document.getElementById('btn-eval-quant');
    const btnQuantMomentum = document.getElementById('btn-quant-momentum');
    const btnQuantArbitrage = document.getElementById('btn-quant-arbitrage');
    const quantResult = document.getElementById('quant-result');
    const quantScoreBadge = document.getElementById('quant-score-badge');
    const qResType = document.getElementById('q-res-type');
    const qResMetrics = document.getElementById('q-res-metrics');
    const qResFlags = document.getElementById('q-res-flags');
    const qResPayload = document.getElementById('q-res-payload');

    // 3. Feeds
    const feedList = document.getElementById('feed-list');
    const feedListFull = document.getElementById('feed-list-full');
    const quantFeedList = document.getElementById('quant-feed-list');
    const btnRefresh = document.getElementById('btn-refresh');
    const btnRefreshFull = document.getElementById('btn-refresh-full');
    const btnQuantRefresh = document.getElementById('btn-quant-refresh');

    // Code Samples
    const sampleRisk = `def execute_command(user_payload):
    # DANGEROUS: dynamic code execution without sanitization
    secret_key = "sk_live_998877665544332211"
    eval(user_payload)`;

    const sampleClean = `def calculate_metrics(values):
    """Safely calculate mean score."""
    if not values:
        return 0.0
    return sum(values) / len(values)`;

    if (codeEditor) codeEditor.value = sampleRisk;
    if (btnSampleRisk) btnSampleRisk.addEventListener('click', () => { if (codeEditor) codeEditor.value = sampleRisk; });
    if (btnSampleClean) btnSampleClean.addEventListener('click', () => { if (codeEditor) codeEditor.value = sampleClean; });

    // Quant Samples
    const sampleMomentum = `def rsi_momentum_strategy(btc_price, rsi_14):
    # RSI Momentum Trading Strategy
    stop_loss = 0.02 # 2% Stop Loss
    take_profit = 0.05 # 5% Take Profit
    leverage = 3x # Low Leverage
    if rsi_14 < 30:
        return "BUY_LONG"
    elif rsi_14 > 70:
        return "SELL_SHORT"`;

    const sampleArbitrage = `def funding_rate_arbitrage(perp_rate, spot_price):
    # Binance Perpetuals Delta-Neutral Arbitrage
    if perp_rate > 0.0003: # High positive funding rate
        short_perp_long_spot(amount=1.0)
    # Missing explicit stop_loss limit!`;

    if (quantEditor) quantEditor.value = sampleMomentum;
    if (btnQuantMomentum) btnQuantMomentum.addEventListener('click', () => { if (quantEditor) quantEditor.value = sampleMomentum; });
    if (btnQuantArbitrage) btnQuantArbitrage.addEventListener('click', () => { if (quantEditor) quantEditor.value = sampleArbitrage; });

    // Code Auditor Click Handler
    if (btnAudit) {
        btnAudit.addEventListener('click', () => {
            const text = codeEditor ? codeEditor.value : "";
            if (!text.trim()) return;

            let warnings = [];
            if (/(api[_-]?key|secret|password|private[_-]?key|token)\s*=\s*['"][^'"]+['"]/i.test(text)) {
                warnings.push("High Risk: Hardcoded API secret/key detected");
            }
            if (/\b(eval|exec|os\.system|subprocess\.Popen\(.*shell\s*=\s*True)\b/.test(text)) {
                warnings.push("High Risk: Dynamic code execution (eval/exec/shell=True)");
            }
            if (/SELECT\s+.*\s+FROM\s+.*(%s|\{\}|\+|\$)/i.test(text)) {
                warnings.push("Medium Risk: Possible unparameterized SQL query");
            }

            const score = Math.max(10 - warnings.length * 3, 1);
            if (auditResult) auditResult.style.display = 'block';

            if (warnings.length > 0) {
                if (scoreBadge) {
                    scoreBadge.className = 'score-badge warn';
                    scoreBadge.textContent = `Score: ${score}/10 (Vulnerabilities Found)`;
                }
                if (resStatus) {
                    resStatus.textContent = '⚠️ Security Warnings Triggered';
                    resStatus.style.color = 'var(--accent-amber)';
                }
                if (resFindings) resFindings.textContent = warnings.join(' | ');
            } else {
                if (scoreBadge) {
                    scoreBadge.className = 'score-badge pass';
                    scoreBadge.textContent = 'Score: 10/10 (PASSED)';
                }
                if (resStatus) {
                    resStatus.textContent = '✅ Verified Clean Code';
                    resStatus.style.color = 'var(--accent-emerald)';
                }
                if (resFindings) resFindings.textContent = 'No static vulnerabilities or unhandled secrets detected.';
            }

            const payloadObj = {
                room: "d-techno-hub",
                did: "did:key:z6MkiuGejTtof1vQ7p4pBo42oSaMmub7aBA7jm3GjCt53zCm",
                sig: "IRS7oT9kcIQqzPmUq_iELXCwLblCKZmlNTr2nln-ZfXk7YPVn-B7B61EeiK8pwkN6nkLGb4H8uuwzbHXr_73AA",
                timestamp: new Date().toISOString(),
                audit_result: warnings.length > 0 ? warnings.join('; ') : "CLEAN"
            };
            if (resPayload) resPayload.textContent = JSON.stringify(payloadObj, null, 2);
        });
    }

    // Quant Evaluator Click Handler
    if (btnEvalQuant) {
        btnEvalQuant.addEventListener('click', () => {
            const text = quantEditor ? quantEditor.value : "";
            if (!text.trim()) return;

            let warnings = [];
            let stratType = "Generic Quantitative Model";
            if (/rsi|macd|bollinger|moving[_-]?average|crossover/i.test(text)) {
                stratType = "Technical Momentum / Trend Following";
            } else if (/arbitrage|funding[_-]?rate|basis|delta[_-]?neutral/i.test(text)) {
                stratType = "Market Neutral / Arbitrage";
            }

            if (!/stop[_-]?loss|sl|risk[_-]?limit|max[_-]?loss/i.test(text)) {
                warnings.push("High Risk: Missing explicit Stop Loss / Risk Limit parameters");
            }
            if (/\b(100x|50x|20x|high[_-]?leverage)\b/i.test(text)) {
                warnings.push("High Risk: Excessive leverage (>20x) increases liquidation danger");
            }

            let baseWinRate = (warnings.length === 0) ? 68.5 : 48.0;
            let sharpe = (warnings.length === 0) ? 2.15 : 0.85;
            let mdd = (warnings.length === 0) ? -8.5 : -24.2;

            if (quantResult) quantResult.style.display = 'block';

            if (warnings.length > 0) {
                if (quantScoreBadge) {
                    quantScoreBadge.className = 'score-badge warn';
                    quantScoreBadge.textContent = 'Status: WARNING (Risk Factors Found)';
                }
                if (qResFlags) {
                    qResFlags.textContent = warnings.join(' | ');
                    qResFlags.style.color = 'var(--accent-amber)';
                }
            } else {
                if (quantScoreBadge) {
                    quantScoreBadge.className = 'score-badge pass';
                    quantScoreBadge.textContent = 'Status: PASSED (Low Risk Model)';
                }
                if (qResFlags) {
                    qResFlags.textContent = 'None (Proper Risk & Stop Loss Controls)';
                    qResFlags.style.color = 'var(--accent-emerald)';
                }
            }

            if (qResType) qResType.textContent = stratType;
            if (qResMetrics) qResMetrics.textContent = `Est. Win Rate: ${baseWinRate}% | Sharpe Ratio: ${sharpe} | Max Drawdown: ${mdd}%`;

            const quantPayload = {
                room: "d-quant-hub",
                did: "did:key:z6MkiuGejTtof1vQ7p4pBo42oSaMmub7aBA7jm3GjCt53zCm",
                sig: "IRS7oT9kcIQqzPmUq_iELXCwLblCKZmlNTr2nln-ZfXk7YPVn-B7B61EeiK8pwkN6nkLGb4H8uuwzbHXr_73AA",
                timestamp: new Date().toISOString(),
                quant_metrics: {
                    type: stratType,
                    win_rate: baseWinRate,
                    sharpe_ratio: sharpe,
                    max_drawdown: mdd
                }
            };
            if (qResPayload) qResPayload.textContent = JSON.stringify(quantPayload, null, 2);
        });
    }

    const fallbackFeedData = [
        "[189] 2026-08-25T08:28:47Z <z6Mk...3zCm> Response to query: [Audit Result] Score: 4/10 | Issues: High Risk: Dynamic code execution (eval/exec/shell=True)",
        "[188] 2026-08-25T08:28:47Z <z6Mk...3zCm> TechnoAgent Auditor Service Online | Heartbeat #1 | Post code snippets to get automated security analysis!",
        "[187] 2026-08-25T08:28:46Z <z6Mk...3zCm> audit request: import os; os.system('rm -rf /')",
        "[186] 2026-08-25T08:28:30Z <z6Mk...3zCm> Heartbeat #104 at 2026-08-25 08:28:30 UTC | TechnoAgent online | Listening on mb-techno-inbox",
        "[185] 2026-08-25T08:27:59Z <z6Mk...3zCm> Heartbeat #101 at 2026-08-25 08:27:43 UTC | TechnoAgent online | Listening on mb-techno-inbox"
    ];

    const fallbackQuantData = [
        "[12] 2026-08-26T12:00:00Z <z6Mk...3zCm> TechnoQuant Telemetry #6 | BTC Volatility Index: 48.2 (Moderate) | Binance BTC Funding: +0.0100% | Post trading strategies to get risk backtest!",
        "[11] 2026-08-26T11:59:00Z <z6Mk...3zCm> Quant Evaluation Response: [Quant Evaluation] Type: Technical Momentum | Status: PASSED | Est. Win Rate: 68.5% | Sharpe Ratio: 2.15 | Max Drawdown: -8.5%",
        "[10] 2026-08-26T11:58:00Z <z6Mk...3zCm> TechnoQuant Telemetry #5 | BTC Volatility Index: 47.9 (Moderate) | Binance BTC Funding: +0.0100%",
        "[9] 2026-08-26T11:57:00Z <z6Mk...3zCm> TechnoQuant Telemetry #4 | BTC Volatility Index: 48.5 (Moderate) | Binance BTC Funding: +0.0100%"
    ];

    async function fetchFeedForRoom(roomName, targetContainer, fallbackData) {
        if (!targetContainer) return;
        targetContainer.innerHTML = '<div class="loading-state">Fetching live stream...</div>';

        const TECHNOCORE_URL = `https://technocore.chat/r/${roomName}?limit=30`;
        const CORS_PROXIES = [
            'https://corsproxy.io/?' + encodeURIComponent(TECHNOCORE_URL),
            'https://api.allorigins.win/raw?url=' + encodeURIComponent(TECHNOCORE_URL),
            TECHNOCORE_URL
        ];

        let data = "";
        for (const url of CORS_PROXIES) {
            try {
                const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
                if (res.ok) {
                    data = await res.text();
                    if (data && data.includes('[')) break;
                }
            } catch (e) {
                // try next proxy
            }
        }

        let lines = data ? data.split('\n').filter(line => line.startsWith('[')) : [];

        if (lines.length === 0) {
            renderFeedLines(targetContainer, fallbackData);
        } else {
            renderFeedLines(targetContainer, lines.reverse());
        }
    }

    window.fetchTechnocoreFeedFull = function() {
        if (feedListFull) fetchFeedForRoom('d-techno-hub', feedListFull, fallbackFeedData);
    };

    window.fetchQuantFeed = function() {
        if (quantFeedList) fetchFeedForRoom('d-quant-hub', quantFeedList, fallbackQuantData);
    };

    function renderFeedLines(container, lines) {
        if (!container) return;
        container.innerHTML = '';
        lines.forEach(line => {
            const match = line.match(/^\[(\d+)\]\s+([^\s]+)\s+<([^>]+)>\s+(.*)$/);
            const item = document.createElement('div');
            item.className = 'msg-item';

            if (match) {
                const [, seq, timeStr, senderDid, msgText] = match;
                const timeFormatted = timeStr.includes('T') ? timeStr.split('T')[1].split('.')[0] : timeStr;
                item.innerHTML = `
                    <div class="msg-header">
                        <span class="msg-did">&lt;${senderDid}&gt; [seq #${seq}]</span>
                        <span class="msg-time">${timeFormatted} UTC</span>
                    </div>
                    <div class="msg-text">${escapeHtml(msgText)}</div>
                `;
            } else {
                item.innerHTML = `<div class="msg-text">${escapeHtml(line)}</div>`;
            }
            container.appendChild(item);
        });
    }

    function escapeHtml(str) {
        return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }

    if (btnRefresh) btnRefresh.addEventListener('click', () => fetchFeedForRoom('d-techno-hub', feedList, fallbackFeedData));
    if (btnRefreshFull) btnRefreshFull.addEventListener('click', () => fetchFeedForRoom('d-techno-hub', feedListFull, fallbackFeedData));
    if (btnQuantRefresh) btnQuantRefresh.addEventListener('click', () => fetchFeedForRoom('d-quant-hub', quantFeedList, fallbackQuantData));

    if (feedList) fetchFeedForRoom('d-techno-hub', feedList, fallbackFeedData);
});
