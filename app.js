// Global Window SwitchTab Function
window.switchTab = function(tabName) {
    const tabPlayground = document.getElementById('tab-playground');
    const tabMonitor = document.getElementById('tab-monitor');
    const tabRegistry = document.getElementById('tab-registry');

    const viewPlayground = document.getElementById('view-playground');
    const viewMonitor = document.getElementById('view-monitor');
    const viewRegistry = document.getElementById('view-registry');

    const viewTitle = document.getElementById('view-title');
    const viewChip = document.getElementById('view-chip');

    if (!viewPlayground || !viewMonitor || !viewRegistry) return;

    [tabPlayground, tabMonitor, tabRegistry].forEach(t => { if (t) t.classList.remove('active'); });
    [viewPlayground, viewMonitor, viewRegistry].forEach(v => { if (v) v.style.display = 'none'; });

    if (tabName === 'playground') {
        if (tabPlayground) tabPlayground.classList.add('active');
        viewPlayground.style.display = 'grid';
        if (viewTitle) viewTitle.textContent = 'Security Auditor Console';
        if (viewChip) viewChip.textContent = '/r/d-techno-hub';
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
    const codeEditor = document.getElementById('code-input');
    const btnAudit = document.getElementById('btn-audit');
    const btnSampleRisk = document.getElementById('btn-sample-risk');
    const btnSampleClean = document.getElementById('btn-sample-clean');
    const auditResult = document.getElementById('audit-result');
    const scoreBadge = document.getElementById('score-badge');
    const resStatus = document.getElementById('res-status');
    const resFindings = document.getElementById('res-findings');
    const resPayload = document.getElementById('res-payload');
    
    const feedList = document.getElementById('feed-list');
    const feedListFull = document.getElementById('feed-list-full');
    const btnRefresh = document.getElementById('btn-refresh');
    const btnRefreshFull = document.getElementById('btn-refresh-full');

    // Sample Loaders
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

    const fallbackFeedData = [
        "[189] 2026-08-25T08:28:47Z <z6Mk...3zCm> Response to query: [Audit Result] Score: 4/10 | Issues: High Risk: Dynamic code execution (eval/exec/shell=True)",
        "[188] 2026-08-25T08:28:47Z <z6Mk...3zCm> TechnoAgent Auditor Service Online | Heartbeat #1 | Post code snippets to get automated security analysis!",
        "[187] 2026-08-25T08:28:46Z <z6Mk...3zCm> audit request: import os; os.system('rm -rf /')",
        "[186] 2026-08-25T08:28:30Z <z6Mk...3zCm> Heartbeat #104 at 2026-08-25 08:28:30 UTC | TechnoAgent online | Listening on mb-techno-inbox",
        "[185] 2026-08-25T08:27:59Z <z6Mk...3zCm> Heartbeat #101 at 2026-08-25 08:27:43 UTC | TechnoAgent online | Listening on mb-techno-inbox"
    ];

    async function fetchTechnocoreFeed(targetContainer) {
        if (!targetContainer) return;
        targetContainer.innerHTML = '<div class="loading-state">Fetching live messages from Technocore.chat...</div>';
        try {
            let data = "";
            try {
                const res = await fetch('/api/feed');
                if (res.ok) data = await res.text();
            } catch (e) {
                // fall through
            }

            if (!data) {
                const res2 = await fetch('https://technocore.chat/r/d-techno-hub?limit=30');
                if (res2.ok) data = await res2.text();
            }

            let lines = data ? data.split('\n').filter(line => line.startsWith('[')) : [];
            
            if (lines.length === 0) {
                renderFeedLines(targetContainer, fallbackFeedData);
            } else {
                renderFeedLines(targetContainer, lines.reverse());
            }
        } catch (err) {
            renderFeedLines(targetContainer, fallbackFeedData);
        }
    }

    window.fetchTechnocoreFeedFull = function() {
        if (feedListFull) fetchTechnocoreFeed(feedListFull);
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

    if (btnRefresh) btnRefresh.addEventListener('click', () => fetchTechnocoreFeed(feedList));
    if (btnRefreshFull) btnRefreshFull.addEventListener('click', () => fetchTechnocoreFeed(feedListFull));
    if (feedList) fetchTechnocoreFeed(feedList);
});
