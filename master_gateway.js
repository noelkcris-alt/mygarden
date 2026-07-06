// app.js - Automated Layout Compilation & Cloud Synchronization Engine
// REPLACE THESE WITH YOUR EXACT SUPABASE CREDENTIALS FROM YOUR SETTINGS PANEL
const SUPABASE_URL = "https://tsalfqpvcxyauhhnonog.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRzYWxmcXB2Y3h5YXVoaG5vbm9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5MTc4MDcsImV4cCI6MjA5ODQ5MzgwN30.STlqr1DZcabM6wd0nJZc40QsMUjojqW-2a-yBYWZqqg";


// Standard direct table API routing headers
const apiHeaders = {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json'
};

const HUB_NAMES = ["ESP01SA", "ESP01SB", "ESP01SC", "ESP01SX"];
let activeHubTab = 0; // Tracking pointer variable for current visual panel focus index

// =====================================================================
// MAIN INITIALIZATION BAR (Fires safely on window load)
// =====================================================================
document.addEventListener("DOMContentLoaded", async () => {
    // Phase 1: Programmatically compile the HTML tab buttons and layout structures
    generateDynamicHtmlLayoutStructure();
    
    // Phase 2: Perform instant cloud pull to populate layout inputs on page open
    logToTerminal("[Init] Downloading operational master configurations from cloud...");
    await performDatabasePullSynchronization();

    // Phase 3: Launch persistent 3-second battery-only telemetry poll tracking loop
    setInterval(executeLightweightTelemetrySynchronizer, 3000);
});

// =====================================================================
// GLOBAL VISIBILITY FUNCTIONS (Placed outside wrappers to prevent scope errors)
// =====================================================================

function logToTerminal(msg) {
    const term = document.getElementById("terminalLog");
    if (term) {
        term.innerHTML = msg + "\n" + term.innerHTML;
    }
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
        
        workspaceHtml += `
            <div class="hub-content ${activeClass}" id="panelHub${hub}">
                <table id="table_hub_${hub}">
        `;

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

        workspaceHtml += `
                </table>
            </div>
        `;
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
                            if (timeInput) timeInput.value = formattedTime;
                        }
                    }
                }

                const meterElement = document.getElementById(`met${hub}`);
                if (meterElement) meterElement.value = parseInt(row.batt.trim(), 10) || 0;
            });
            logToTerminal("[Init] ✔ UI successfully built and synced from database settings.");
        }
    } catch (err) {
        logToTerminal(`[Error] Connection pull failure: ${err.message}`);
    }
}

window.processInstantModeSliderAutoSubmit = async function(hubId, channelId, updatedSliderValue) {
    const timestamp = new Date().toLocaleTimeString();
    updateVisualSliderTextLabels(hubId, channelId, updatedSliderValue);
    
    let completeModeString = "";
    for (let ch = 0; ch < 4; ch++) {
        const slider = document.getElementById(`E${hubId}${ch}`);
        completeModeString += slider ? slider.value : "1";
    }

    logToTerminal(`[${timestamp}] ⚙️ Auto-Submit: Patching Mode String to "${completeModeString}" for Hub #${hubId}...`);

    try {
        const patchUrl = `${SUPABASE_URL}/rest/v1/slaves?id_num=eq.${hubId}`;
        const response = await fetch(patchUrl, {
            method: 'PATCH',
            headers: apiHeaders,
            body: JSON.stringify({ mode: completeModeString })
        });
        if (response.ok) {
            logToTerminal(`[${new Date().toLocaleTimeString()}] ✔ Mode configurations saved to cloud! Packet broadcast ready.`);
        }
    } catch (err) {
        logToTerminal(`[Error] Auto-submit transaction exception: ${err.message}`);
    }
};

function updateVisualSliderTextLabels(hub, ch, value) {
    const label = document.getElementById(`lbl_E${hub}${ch}`);
    if (!label) return;
    
    label.className = "mode-lbl"; 
    if (value === "0") { label.innerText = "OFF"; label.classList.add("lbl-off"); }
    else if (value === "1") { label.innerText = "Auto"; label.classList.add("lbl-auto"); }
    else if (value === "2") { label.innerText = "Always On"; label.classList.add("lbl-on"); }
}

window.processManualScheduleSubmission = async function(hubId, channelId) {
    const timestamp = new Date().toLocaleTimeString();
    logToTerminal(`[${timestamp}] 📅 Compiling schedule string parameters for Hub #${hubId} Channel ${channelId + 1}...`);

    let combinedScheduleString = "";
    for (let sked = 0; sked < 4; sked++) {
        const input = document.getElementById(`T${hubId}${channelId}${sked}`);
        const inputVal = input ? input.value : "";
        if (!inputVal) {
            logToTerminal(`[${timestamp}] ❌ Submission cancelled: Time parameters cannot be blank.`);
            return;
        }
        combinedScheduleString += inputVal.replace(":", ""); 
    }

    const diagnosticOutputProtocolPacket = `${hubId}K${channelId}${combinedScheduleString}`;
    logToTerminal(`[${timestamp}] 📡 Outbound Packet: "${diagnosticOutputProtocolPacket}" (Length: ${diagnosticOutputProtocolPacket.length} chars)`);

    try {
        const patchUrl = `${SUPABASE_URL}/rest/v1/slaves?id_num=eq.${hubId}`;
        const targetColumnName = `sk${channelId}`;
        
        const response = await fetch(patchUrl, {
            method: 'PATCH',
            headers: apiHeaders,
            body: JSON.stringify({ [targetColumnName]: combinedScheduleString })
        });
        if (response.ok) {
            logToTerminal(`[${new Date().toLocaleTimeString()}] ✔ Schedule successfully synchronized to column [${targetColumnName}]!`);
        }
    } catch (err) {
        logToTerminal(`[Error] Schedule synchronization exception: ${err.message}`);
    }
};

async function executeLightweightTelemetrySynchronizer() {
    const telemetryUrl = `${SUPABASE_URL}/rest/v1/slaves?select=id_num,batt&order=id_num.asc`;
    try {
        const response = await fetch(telemetryUrl, { method: 'GET', headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` } });
        if (response.ok) {
            const telemetryRows = await response.json();
            const ticker = document.getElementById("syncTicker");
            if (ticker) ticker.innerText = new Date().toLocaleTimeString();

            telemetryRows.forEach(row => {
                const hub = row.id_num;
                const meterElement = document.getElementById(`met${hub}`);
                if (meterElement) {
                    meterElement.value = parseInt(row.batt.trim(), 10) || 0;
                }
            });
        }
    } catch (err) {
        console.error("Telemetry task dropped:", err.message);
    }
}
