// =====================================================================
// MASTER_GATEWAY.JS - STREAMLINED INTERFACE COMPONENT CONTROLLER
// =====================================================================

const HUB_NAMES = ["ESP01SA", "ESP01SB", "ESP01SC", "ESP01SX"];
let activeHubTab = 0;
window.isPageInitializedAndVisible = false;

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

// LIFECYCLE INITIALIZER HANDSHAKE
// =====================================================================
// INTERFACE RENDERING GENERATORS & LIFECYCLE INITIALIZER
// =====================================================================
document.addEventListener("DOMContentLoaded", async () => {
    // 1. Generate HTML grid structures inside your browser window
    generateDynamicHtmlLayoutStructure();
    
    // 2. Start your live system clock ticking immediately
    getCleanLocalFormattedTimeString();
    setInterval(getCleanLocalFormattedTimeString, 1000);
    
    // Mask and hide layout tables while waiting for the hardware handshake
    document.getElementById("hubTablesWorkspace").style.display = "none";
    document.getElementById("tabBarContainer").style.display = "none";
    
    // 3. PHASE 1: Send the 'T' command payload straight to the cloud mailbox
    const timePayload = getCleanLocalFormattedTimeString();
    await db_init(timePayload);

    // 4. PHASE 2: Start a targeted boot loop monitoring EXCLUSIVELY for the 'N' response
    const bootCheckTimer = setInterval(async () => {
        if (window.isPageInitializedAndVisible) {
            // Once payload_parser.js decodes 'N' and sets this flag true, kill the boot loop
            clearInterval(bootCheckTimer); 
            console.log("[Lifecycle] Handshake complete. Boot check loop terminated.");
        } else {
            // Actively look ONLY for the 'N' command prefix to populate and reveal the page
            await db_get("N");
        }
    }, 1500);
});


function logToTerminal(msg) {
    const term = document.getElementById("terminalLog");
    if (term) term.innerText = `Last command: ${msg}`;
}

// TRI-STATE SLIDER INPUT TRANS-MISSION DISPATCH PIPELINE
window.processInstantModeSliderAutoSubmit = async function(hubId, channelId, val) {
    // Target Format: Hub ID + "E" + Channel ID + Slider Value
    const sliderCommandPayload = `${hubId}E${channelId}${val}`;
    
    // --- THIS LINE ECHOES DISSYNC LOG LINES IMMEDIATELY ---
    console.log(`[DB Outbound] Patching Mailbox Command Slot... Sending: "${sliderCommandPayload}"`);
    logToTerminal(sliderCommandPayload);

    await db_update(sliderCommandPayload);
};


// CALENDAR TIMELINE INPUT TRANS-MISSION DISPATCH PIPELINE
window.processManualScheduleSubmission = async function(hubId, channelId) {
    if (!window.isPageInitializedAndVisible) return;
    
    let compiledSchedStr = "";
    for (let sked = 0; sked < 4; sked++) {
        const inputElement = document.getElementById(`T${hubId}${channelId}${sked}`);
        const val = inputElement ? inputElement.value : "";
        if (!val) { logToTerminal("Error: Empty Field"); return; }
        compiledSchedStr += val.replace(":", "");
    }

    const scheduleCommandPayload = `${hubId}K${channelId}${compiledSchedStr}`; // e.g., "0K10600070017001800"
    logToTerminal(scheduleCommandPayload);

    // CALL ISOLATED DB INTERFACE FUNCTION: Patches the new schedule string blindly
    await db_update(scheduleCommandPayload);
};

function generateDynamicHtmlLayoutStructure() {
    const tabsContainer = document.getElementById("tabBarContainer");
    const workspace = document.getElementById("hubTablesWorkspace");
    if (!tabsContainer || !workspace) return;
    
    let tabsHtml = ""; let workspaceHtml = "";
    for (let hub = 0; hub < 4; hub++) {
        const activeClass = (hub === 0) ? "active" : "";
        tabsHtml += `<button class="tab-btn ${activeClass}" id="btnHub${hub}" onclick="switchActiveHubPanel(${hub})">${HUB_NAMES[hub]}</button>`;
        
        workspaceHtml += `
            <div class="hub-content ${activeClass}" id="panelHub${hub}">
                <div style="background: #222; border: 1px solid #333; padding: 10px; border-radius: 4px; margin-bottom: 15px; display: flex; align-items: center; justify-content: space-between; font-family: monospace;">
                    <span style="color: #aaa; font-size: 13px;">🔋 Power Level:</span>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <meter id="met${hub}" min="0" max="1023" value="0" style="width: 120px; height: 16px;"></meter>
                        <span id="battText${hub}" style="color: #00bcff; font-weight: bold; font-size: 13px;">0000 ADC</span>
                    </div>
                </div>
                <table id="table_hub_${hub}">`;
                
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
                <tr><td>S2</td><td><input type="time" id="T${hub}${ch}2"></td><td><input type="time" id="T${hub}${ch}3"></td></tr>`;
        }
        workspaceHtml += `</table></div>`;
    }
    tabsContainer.innerHTML = '<div style="display: flex; gap: 5px; margin-bottom: 15px;">' + tabsHtml + '</div>';
    workspace.innerHTML = workspaceHtml;
}

window.switchActiveHubPanel = function(idx) {
    activeHubTab = idx;
    for (let i = 0; i < 4; i++) {
        document.getElementById("btnHub" + i)?.classList.remove("active");
        document.getElementById("panelHub" + i)?.classList.remove("active");
    }
    document.getElementById("btnHub" + idx)?.classList.add("active");
    document.getElementById("panelHub" + idx)?.classList.add("active");
};

function updateVisualSliderTextLabels(hub, ch, value) {
    const label = document.getElementById("lbl_E" + hub + ch); if (!label) return;
    label.className = "mode-lbl";
    if (value === "0") { label.innerText = "OFF"; label.classList.add("lbl-off"); }
    else if (value === "1") { label.innerText = "Auto"; label.classList.add("lbl-auto"); }
    else if (value === "2") { label.innerText = "Always On"; label.classList.add("lbl-on"); }
}





document.addEventListener('contextmenu', e => e.preventDefault());
