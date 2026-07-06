// REPLACE THESE WITH YOUR EXACT SUPABASE CREDENTIALS FROM YOUR SETTINGS PANEL
const SUPABASE_URL = "https://tsalfqpvcxyauhhnonog.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRzYWxmcXB2Y3h5YXVoaG5vbm9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5MTc4MDcsImV4cCI6MjA5ODQ5MzgwN30.STlqr1DZcabM6wd0nJZc40QsMUjojqW-2a-yBYWZqqg";
// =====================================================================
// SECURITY INTERCEPTION LAYER (PREVENTS RIGHT-CLICK CONTEXT MENU)
// =====================================================================
document.addEventListener('contextmenu', function(event) {
    event.preventDefault(); // Blocks the default context menu from popping up
});
// =====================================================================
// FRONT-END GLOBAL CONFIGURATIONS & API ACCESS CHANNELS
// =====================================================================
const apiHeaders = {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json'
};

const HUB_NAMES = ["HUB1", "ESP01SB", "ESP01SC", "ESP01SX"];
let activeHubTab = 0;

// =====================================================================
// UI DIGITAL CLOCK ENGINE & CLOUD TIME HANDSHAKE
// =====================================================================
function getCleanLocalFormattedTimeString() {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    
    const clockElement = document.getElementById("liveClockDisplay");
    if (clockElement) {
        const ampm = now.getHours() >= 12 ? 'PM' : 'AM';
        const displayHours = String(now.getHours() % 12 || 12).padStart(2, '0');
        clockElement.innerText = `${displayHours}:${mm}:${ss} ${ampm}`;
    }
    return `${hh}${mm}${ss}`;
}

async function transmitWebStartupHandshake() {
    const timePayload = getCleanLocalFormattedTimeString();
    console.log(`[Handshake] Dispatching Web Open Event 'N' with clock: "${timePayload}"`);
    
    try {
        await fetch(`${SUPABASE_URL}/rest/v1/system_sync?id=eq.1`, {
            method: 'PATCH',
            headers: apiHeaders,
            body: JSON.stringify({ 
                cmd_flag: 'N',
                system_time: timePayload
            }) 
        });
    } catch (err) { 
        console.error("Startup handshake failed:", err); 
    }
}

async function executeRoutineGlobalTimeSync() {
    const timePayload = getCleanLocalFormattedTimeString();
    console.log(`[Time Sync] Blasting Global Clock 'T' with clock: "${timePayload}"`);
    
    try {
        await fetch(`${SUPABASE_URL}/rest/v1/system_sync?id=eq.1`, {
            method: 'PATCH',
            headers: apiHeaders,
            body: JSON.stringify({ 
                cmd_flag: 'T',
                system_time: timePayload 
            })
        });
    } catch (err) { 
        console.error("Global clock sync failed:", err); 
    }
}

// =====================================================================
// APPLICATION LIFECYCLE INITIALIZATION
// =====================================================================
document.addEventListener("DOMContentLoaded", async () => {
    generateDynamicHtmlLayoutStructure();
    setInterval(getCleanLocalFormattedTimeString, 1000);
    await transmitWebStartupHandshake();
    logToTerminal(`[Init] Downloading operational master configurations from cloud...`);
    await performDatabasePullSynchronization();
    setInterval(performDatabasePullSynchronization, 4000);
    setInterval(executeRoutineGlobalTimeSync, 300000);
});

// =====================================================================
// DATA SYNC AND UI GENERATION PIPELINES
// =====================================================================
function logToTerminal(msg) {
    const term = document.getElementById("terminalLog");
    if (term) term.innerHTML = msg + "\n" + term.innerHTML;
}

function generateDynamicHtmlLayoutStructure() {
    const tabsContainer = document.getElementById("tabBarContainer");
    const workspace = document.getElementById("hubTablesWorkspace");
    if (!tabsContainer || !workspace) return;
    
    let tabsHtml = "";
    let workspaceHtml = "";

    for (let hub = 0; hub < 4; hub++) {
        const activeClass = (hub === 0) ? "active" : "";
        tabsHtml += `<button class="tab-btn ${activeClass}" id="btnHub${hub}" onclick="switchActiveHubPanel(${hub})">${HUB_NAMES[hub]}</button>`;
        workspaceHtml += `<div class="hub-content ${activeClass}" id="panelHub${hub}"><table id="table_hub_${hub}">`;

        for (let ch = 0; ch < 4; ch++) {
            workspaceHtml += `
                <tr><td colspan="4" class="channel-header">Channel ${ch + 1}</td></tr>
                <tr class="mode-row">
                    <td>ON</td>
                    <td>OFF</td>
                    <td colspan="2">
                        <span id="lbl_E${hub}${ch}" class="mode-lbl lbl-auto">Auto</span>
                        <input type="range" id="E${hub}${ch}" min="0" max="2" value="1" 
                               onchange="processInstantModeSliderAutoSubmit(${hub}, ${ch}, this.value)">
                    </td>
                </tr>
                <tr>
                    <td>S1</td>
                    <td><input type="time" id="T${hub}${ch}0"></td>
                    <td><input type="time" id="T${hub}${ch}1"></td>
                    <td rowspan="2" style="width: 85px;">
                        <button class="submit-btn" id="S${hub}${ch}" onclick="processManualScheduleSubmission(${hub}, ${ch})">Submit</button>
                    </td>
                </tr>
                <tr>
                    <td>S2</td>
                    <td><input type="time" id="T${hub}${ch}2"></td>
                    <td><input type="time" id="T${hub}${ch}3"></td>
                </tr>
            `;
        }
        workspaceHtml += `</table></div>`;
    }
    tabsContainer.innerHTML = tabsHtml;
    workspace.innerHTML = workspaceHtml;
}

window.switchActiveHubPanel = function(selectedHubIndex) {
    activeHubTab = selectedHubIndex;
    for (let i = 0; i < 4; i++) {
        const btn = document.getElementById(`btnHub${i}`);
        const panel = document.getElementById(`panelHub${i}`);
        if (btn) btn.classList.remove("active");
        if (panel) panel.classList.remove("active");
    }
    const activeBtn = document.getElementById(`btnHub${selectedHubIndex}`);
    const activePanel = document.getElementById(`panelHub${selectedHubIndex}`);
    if (activeBtn) activeBtn.classList.add("active");
    if (activePanel) activePanel.classList.add("active");
};

async function performDatabasePullSynchronization() {
    const fetchUrl = `${SUPABASE_URL}/rest/v1/slaves?select=*&order=id_num.asc`;
    try {
        const response = await fetch(fetchUrl, { method: 'GET', headers: apiHeaders });
        if (response.ok) {
            const dataRows = await response.json();
            const ticker = document.getElementById("syncTicker");
            if (ticker) ticker.innerText = new Date().toLocaleTimeString();

            dataRows.forEach(row => {
                const hub = row.id_num;
                const modeStr = row.mode.trim();
                const schedules = [row.sk0.trim(), row.sk1.trim(), row.sk2.trim(), row.sk3.trim()];

                for (let ch = 0; ch < 4; ch++) {
                    const sliderVal = modeStr.charAt(ch) || "1";
                    const sliderElement = document.getElementById(`E${hub}${ch}`);
                    if (sliderElement) sliderElement.value = sliderVal;
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
if (timeInput && document.activeElement !== timeInput) timeInput.value = formattedTime;}}}});
}
}
 catch (err) {
	 console.error("Database sync pull failed:", err);}
}
// eof  performDatabasePullSynchronization()
window.processInstantModeSliderAutoSubmit = async function(hubId, channelId, val) {
    updateVisualSliderTextLabels(hubId, channelId, val);
    let compiledModeString = "";
    for (let ch = 0; ch < 4; ch++) {
        // FIX: Wrapped the dynamic element ID selector inside standard string quotes
        const sliderElement = document.getElementById("E" + hubId + ch); 
        compiledModeString += sliderElement ? sliderElement.value : "1";
    }
    
    const cleanStringValue = String(compiledModeString).trim();
    // FIX: Wrapped the console string template inside clean backticks (``)
    logToTerminal(`[Cloud] Patching Modes: "${cleanStringValue}" for Hub #${hubId}...`);
    
    // FIX: Wrapped the dynamic query path URL inside clean backticks (``)
    const targetUrl = `${SUPABASE_URL}/rest/v1/slaves?id_num=eq.${hubId}`;
    
    try {
        await fetch(targetUrl, {
            method: 'PATCH',
            headers: apiHeaders,
            body: JSON.stringify({ mode: cleanStringValue })
        });
    } catch (err) {
        console.error("Slider save failed:", err);
    }
};

// eof
window.processManualScheduleSubmission = async function(hubId, channelId) {
    let compiledSchedStr = "";
    for (let sked = 0; sked < 4; sked++) {
        // FIX: Replaced broken syntax with direct string concatenation for the element ID
        const inputElement = document.getElementById("T" + hubId + channelId + sked);
        const val = inputElement ? inputElement.value : "";
        if (!val) {
            logToTerminal(`❌ Input Error: Time fields cannot be blank.`);
            return;
        }
        compiledSchedStr += val.replace(":", "");
    }
    
    const cleanSchedValue = String(compiledSchedStr).trim();
    // FIX: Replaced bare token with a clean concatenated string identifier
    const targetColumnName = "sk" + channelId;
    
    logToTerminal(`[Cloud] Patching Column [${targetColumnName}] for Hub #${hubId}...`);
    
    // FIX: Enclosed the dynamic endpoint string template inside backticks (``)
    const targetUrl = `${SUPABASE_URL}/rest/v1/system_sync?id=eq.${hubId}`;
    
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/slaves?id_num=eq.${hubId}`, {
            method: 'PATCH',
            headers: apiHeaders,
            body: JSON.stringify({ [targetColumnName]: cleanSchedValue })
        });
        if (response.ok) logToTerminal(`✔ Schedule saved to cloud!`);
    } catch (err) {
        console.error("Schedule save failed:", err);
    }
};

function updateVisualSliderTextLabels(hub, ch, value) {
    const label = document.getElementById("lbl_E" + hub + ch); 
    if (!label) return;
    label.className = "mode-lbl";
    if (value === "0") { 
        label.innerText = "OFF"; 
        label.classList.add("lbl-off"); 
    } else if (value === "1") { 
        label.innerText = "Auto"; 
        label.classList.add("lbl-auto"); 
    } else if (value === "2") { 
        label.innerText = "Always On"; 
        label.classList.add("lbl-on"); 
    }
}
