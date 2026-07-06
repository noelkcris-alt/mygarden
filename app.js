// app.js - Core Routing & Logic Engine
// REPLACE THESE WITH YOUR EXACT SUPABASE CREDENTIALS FROM YOUR SETTINGS PANEL
const SUPABASE_URL = "https://tsalfqpvcxyauhhnonog.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRzYWxmcXB2Y3h5YXVoaG5vbm9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5MTc4MDcsImV4cCI6MjA5ODQ5MzgwN30.STlqr1DZcabM6wd0nJZc40QsMUjojqW-2a-yBYWZqqg";

const apiHeaders = {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json'
};

const HUB_NAMES = ["ESP01SA", "ESP01SB", "ESP01SC", "ESP01SX"];
let handshakeIntervalTimer = null;
let telemetryIntervalTimer = null;

document.addEventListener("DOMContentLoaded", async () => {
    // 1. Build the form framework frames programmatically
    generateDynamicHtmlLayoutStructure();
    
    // 2. Lock down the panel view with your loading prompt state
    showLoadingOverlay(true);
    
    logToTerminal("[Handshake] Dispatching 'N' request flag to Supabase...");
    
    // 3. STEP 1: Update cmd_flag to 'N' to notify the ESP master node
    const success = await patchSyncFlag('N');
    
    if (success) {
        // 4. Begin rapid 1-second polling loop checking for the ESP's 'R' (Ready) response
        handshakeIntervalTimer = setInterval(pollForEspHandshakeResponse, 1000);
    } else {
        logToTerminal("[Handshake] ❌ Failed to dispatch initialization request to cloud.");
    }
});

// =====================================================================
// STEP 1 & 3: HANDSHAKE COORDINATION MATRIX
// =====================================================================
async function patchSyncFlag(flagChar) {
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/system_sync?id=eq.1`, {
            method: 'PATCH',
            headers: apiHeaders,
            body: JSON.stringify({ cmd_flag: flagChar })
        });
        return response.ok;
    } catch (err) {
        console.error("Flag patch exception:", err);
        return false;
    }
}

async function pollForEspHandshakeResponse() {
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/system_sync?id=eq.1&select=cmd_flag`, {
            method: 'GET',
            headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data && data.length > 0) {
                const currentFlag = data[0].cmd_flag.trim();
                
                // STEP 3: If flag switches to 'R', the ESP has successfully posted all real field stats
                if (currentFlag === 'R') {
                    clearInterval(handshakeIntervalTimer); // Kill the startup poll loop
                    logToTerminal("[Handshake] ✔ ESP Master responded! Downloading actual field configurations...");
                    
                    // Fetch the true field state from the database columns
                    await downloadAndRenderLiveFieldData();
                    
                    // Unlock the user interface inputs on the user's screen
                    showLoadingOverlay(false);
                    
                    // Put the handshake system back to 'I' (Idle) state
                    await patchSyncFlag('I');
                    
                    // STEP 4: Launch passive 3-second lightweight telemetry monitor loops
                    telemetryIntervalTimer = setInterval(executeLightweightTelemetrySynchronizer, 3000);
                }
            }
        }
    } catch (err) {
        console.error("Handshake track dropped:", err);
    }
}

async function downloadAndRenderLiveFieldData() {
    const fetchUrl = `${SUPABASE_URL}/rest/v1/slaves?select=*&order=id_num.asc`;
    try {
        const response = await fetch(fetchUrl, { method: 'GET', headers: apiHeaders });
        if (response.ok) {
            const dataRows = await response.json();
            
            dataRows.forEach(row => {
                const hub = row.id_num;
                const modeStr = row.mode.trim();
                const schedules = [row.sk0.trim(), row.sk1.trim(), row.sk2.trim(), row.sk3.trim()];

                for (let ch = 0; ch < 4; ch++) {
                    const sliderVal = modeStr.charAt(ch) || "1";
                    const slider = document.getElementById(`E${hub}${ch}`);
                    if (slider) slider.value = sliderVal;
                    updateVisualSliderTextLabels(hub, ch, sliderVal);
                }

                for (let ch = 0; ch < 4; ch++) {
                    const chData = schedules[ch];
                    if (chData.length === 16) {
                        for (let sked = 0; sked < 4; sked++) {
                            const start = sked * 4;
                            const clockRaw = chData.substring(start, start + 4);
                            const formattedTime = `${clockRaw.substring(0, 2)}:${clockRaw.substring(2, 4)}`;
                            const timeInput = document.getElementById(`T${hub}${ch}${sked}`);
                            if (timeInput) timeInput.value = formattedTime;
                        }
                    }
                }
            });
            logToTerminal("[Sync] ✔ Web controls successfully initialized with actual hardware states.");
        }
    } catch (err) {
        console.error("Field parse failed:", err);
    }
}

// =====================================================================
// STEP 4: PASSIVE TELEMETRY POLL (GET FROM NEW SYSTEM_SYNC ROW)
// begin function executeLightweightTelemetrySynchronizer()
// =====================================================================
async function executeLightweightTelemetrySynchronizer() {
    // Queries only the active 16-character slave battery block
    const telemetryUrl = `${SUPABASE_URL}/rest/v1/system_sync?id=eq.1&select=all_batt`;
    try {
        const response = await fetch(telemetryUrl, { method: 'GET', headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` } });
        if (response.ok) {
            const data = await response.json();
            const ticker = document.getElementById("syncTicker");
            if (ticker) ticker.innerText = new Date().toLocaleTimeString();

            if (data && data.length > 0) {
                const hubString = data[0].all_batt.trim(); // Reads array index 0

                const combinedBox = document.getElementById("combinedBatteryDisplay");
                if (combinedBox) combinedBox.innerText = hubString;

                if (hubString.length === 16) {
                    for (let i = 0; i < 4; i++) {
                        const mElement = document.getElementById(`met${i}`);
                        if (mElement) mElement.value = parseInt(hubString.substring(i * 4, (i * 4) + 4), 10) || 0;
                    }
                }
            }
        }
    } catch (err) {
        console.error("Telemetry failed:", err);
    }
}


// end function executeLightweightTelemetrySynchronizer()


// =====================================================================
// CONTROL LAYER HOOK INTERACTION PIPELINES
// =====================================================================
function showLoadingOverlay(shouldShow) {
    const workspace = document.getElementById("hubTablesWorkspace");
    const logBox = document.getElementById("terminalLog");
    if (shouldShow) {
        workspace.style.opacity = "0.15";
        workspace.style.pointerEvents = "none";
        if (logBox) logToTerminal("[System Notice] Loading Data. Please wait...");
    } else {
        workspace.style.opacity = "1";
        workspace.style.pointerEvents = "auto";
    }
}

function generateDynamicHtmlLayoutStructure() {
    const tabsContainer = document.getElementById("tabBarContainer");
    const workspace = document.getElementById("hubTablesWorkspace");
    if (!tabsContainer || !workspace) return;
    
    let tabsHtml = ""; let workspaceHtml = "";
    workspaceHtml += `
        <div style="background: #1a1a1a; padding: 12px; border-radius: 6px; margin-bottom: 20px; border: 1px solid #2d2d2d; text-align: center; font-size: 13px; font-family: monospace;">
            🗲 Master Gateway Power: 
            <meter id="met99" min="740" low="800" optimum="900" high="1000" max="1023" value="0" style="width: 140px; height: 14px; vertical-align: middle;"></meter>
            <span id="txt_met99" style="color: #00ff66; font-weight: bold; margin-left: 5px;">0000 AD</span>
        </div>
        <div class="label" style="text-align:center;">🗲 Reconstructed 16-Char Spaceless Battery String</div>
        <p id="combinedBatteryDisplay" style="background:#1a231a; border:1px solid #2d4a2d; padding:12px; border-radius:5px; color:#49e449; font-family:monospace; font-size:16px; font-weight:bold; letter-spacing:2px; text-align:center; margin: 0 0 20px 0;">0000000000000000</p>
    `;

    for (let hub = 0; hub < 4; hub++) {
        const activeClass = (hub === 0) ? "active" : "";
        tabsHtml += `<button class="tab-btn ${activeClass}" id="btnHub${hub}" onclick="switchActiveHubPanel(${hub})">${HUB_NAMES[hub]}</button>`;
        workspaceHtml += `<div class="hub-content ${activeClass}" id="panelHub${hub}"><table id="table_hub_${hub}">`;
        for (let ch = 0; ch < 4; ch++) {
            workspaceHtml += `
                <tr><td colspan="4" class="channel-header">Channel ${ch + 1}</td></tr>
                <tr class="mode-row">
                    <td>ON</td><td>OFF</td>
                    <td colspan="2">
                        <span id="lbl_E${hub}${ch}" class="mode-lbl lbl-auto">Auto</span>
                        <input type="range" id="E${hub}${ch}" min="0" max="2" value="1" onchange="processInstantModeSliderAutoSubmit(${hub}, ${ch}, this.value)">
                    </td>
                </tr>
                <tr>
                    <td>S1</td><td><input type="time" id="T${hub}${ch}0"></td><td><input type="time" id="T${hub}${ch}1"></td>
                    <td rowspan="2" style="width: 85px;"><button class="submit-btn" id="S${hub}${ch}" onclick="processManualScheduleSubmission(${hub}, ${ch})">Submit</button></td>
                </tr>
                <tr><td>S2</td><td><input type="time" id="T${hub}${ch}2"></td><td><input type="time" id="T${hub}${ch}3"></td></tr>
            `;
        }
        workspaceHtml += `<tr><td colspan="4" class="batt">&nbsp;Batt&nbsp;<meter id="met${hub}" min="740" low="800" optimum="900" high="1000" max="1023" value="0"></meter></td></tr><tr><td colspan="3"><hr id="hr_met${hub}" /></td><td class="batt">&#x1F5F2;Batt</td></tr></table></div>`;
    }
    tabsContainer.innerHTML = tabsHtml; workspace.innerHTML = workspaceHtml;
}

window.switchActiveHubPanel = function(idx) {
    for (let i = 0; i < 4; i++) {
        const b = document.getElementById(`btnHub${i}`); const p = document.getElementById(`panelHub${i}`);
        if (b) b.classList.remove("active"); if (p) p.classList.remove("active");
    }
    const ab = document.getElementById(`btnHub${idx}`); const ap = document.getElementById(`panelHub${idx}`);
    if (ab) ab.classList.add("active"); if (ap) ap.classList.add("active");
};

window.processInstantModeSliderAutoSubmit = async function(hubId, channelId, val) {
    updateVisualSliderTextLabels(hubId, channelId, val);
    let modeString = "";
    for (let ch = 0; ch < 4; ch++) { modeString += document.getElementById(`E${hubId}${ch}`).value; }
    logToTerminal(`[Action] Auto-Submit: Updating modes to "${modeString}" for Hub #${hubId}...`);
    try {
        await fetch(`${SUPABASE_URL}/rest/v1/slaves?id_num=eq.${hubId}`, { method: 'PATCH', headers: apiHeaders, body: JSON.stringify({ mode: modeString }) });
    } catch (err) { console.error(err); }
};

function updateVisualSliderTextLabels(hub, ch, value) {
    const label = document.getElementById(`lbl_E${hub}${ch}`); if (!label) return;
    label.className = "mode-lbl";
    if (value === "0") { label.innerText = "OFF"; label.classList.add("lbl-off"); }
    else if (value === "1") { label.innerText = "Auto"; label.classList.add("lbl-auto"); }
    else if (value === "2") { label.innerText = "Always On"; label.classList.add("lbl-on"); }
}

window.processManualScheduleSubmission = async function(hubId, channelId) {
    let schedStr = "";
    for (let sked = 0; sked < 4; sked++) {
        const val = document.getElementById(`T${hubId}${channelId}${sked}`).value;
        if (!val) { logToTerminal("❌ Submission aborted: Time inputs cannot be blank."); return; }
        schedStr += val.replace(":", "");
    }
    logToTerminal(`[Action] Outbound Packet Layout: "${hubId}K${channelId}${schedStr}"`);
    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/slaves?id_num=eq.${hubId}`, { method: 'PATCH', headers: apiHeaders, body: JSON.stringify({ [`sk${channelId}`]: schedStr }) });
        if (res.ok) logToTerminal("✔ Schedule saved to cloud!");
    } catch (err) { console.error(err); }
};

function logToTerminal(msg) {
    const term = document.getElementById("terminalLog");
    if (term) term.innerHTML = msg + "\n" + term.innerHTML;
}
