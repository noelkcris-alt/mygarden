// =====================================================================
// GATEWAY_MASTER.JS - EXTENDED LIFECYCLE EVENT CONTROLLER Engine
// =====================================================================

window.HUB_NAMES = ["ESP01SA", "ESP01SB", "ESP01SC", "ESP01SX"];
let activeHubTab = 0;
window.isPageInitializedAndVisible = false;

// Global locking parameters protect phone sliders from data race snaps
window.userInteractionLockActive = false;
window.interactionLockTimerReference = null;

window.getCleanLocalFormattedTimeString = function() {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    const clockElement = document.getElementById("liveClockDisplay");
    if (clockElement) {
        const ampm = now.getHours() >= 12 ? 'PM' : 'AM';
        let displayHours = now.getHours() % 12 || 12;
        const paddedDisplayHours = String(displayHours).padStart(2, '0');
        clockElement.innerText = `${paddedDisplayHours}:${mm}:${ss} ${ampm}`;
    }
    return `${hh}${mm}${ss}`;
};

// 🌟 INTERACTION PROTECTION GUARD HOOK
window.activateShieldRaceGuard = function() {
    window.userInteractionLockActive = true;
    if (window.interactionLockTimerReference) {
        clearTimeout(window.interactionLockTimerReference);
    }
    window.interactionLockTimerReference = setTimeout(() => {
        window.userInteractionLockActive = false;
        console.log("[Race Shield] Safety guard dropped. Browser resumed normal cloud mirroring.");
    }, 4000);
};

// 🌟 INITIALIZE LIFECYCLE CHANNELS UPON SECURE USER AUTHENTICATION MATCH
window.startSystemRuntimeClockLifecycle = function() {
    console.log("[Authorized Launch] Firing system clock pipelines and network tracking sweeps...");
    
    window.getCleanLocalFormattedTimeString();
    setInterval(window.getCleanLocalFormattedTimeString, 1000);
    
    const timePayload = window.getCleanLocalFormattedTimeString();
    
    // Hide panels until the ESP registers its reply check string on Row 1
    document.getElementById("hubTablesWorkspace").style.display = "none";
    document.getElementById("tabBarContainer").style.display = "none";
    document.getElementById("subGaugesContainer").style.display = "none";
    
    if (typeof window.db_init === "function") {
        window.db_init(timePayload);
    }

    // Sweep Row 1 for incoming hardware check-in reply data blocks
    const bootCheckTimer = setInterval(async () => {
        if (window.isPageInitializedAndVisible) {
            clearInterval(bootCheckTimer); 
            console.log("[Boot Sync] Connected successfully. Shifted loops to 10-second structural cadence.");
        } else {
            if (typeof window.db_get_row_one === "function") {
                await window.db_get_row_one();
            }
        }
    }, 1500);
};

function logToTerminal(msg) {
    const term = document.getElementById("terminalLog");
    if (term) term.innerText = `Last command: ${msg}`;
}

// TRI-STATE SLIDER INPUT TRANS-MISSION DISPATCH PIPELINE
window.processInstantModeSliderAutoSubmit = async function(hubId, channelId, val) {
    updateVisualSliderTextLabels(hubId, channelId, val);
    if (!window.isPageInitializedAndVisible) return;

    // Trigger your 4-second race shield protection guard rule parameter live
    window.activateShieldRaceGuard();

    const sliderCommandPayload = `${hubId}E${channelId}${val}`; 
    logToTerminal(sliderCommandPayload);

    if (typeof window.db_update === "function") {
        await window.db_update(sliderCommandPayload);
    }
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

    // Trigger your 4-second race shield protection guard rule parameter live
    window.activateShieldRaceGuard();

    const scheduleCommandPayload = `${hubId}K${channelId}${compiledSchedStr}`; 
    logToTerminal(scheduleCommandPayload);

    if (typeof window.db_update === "function") {
        await window.db_update(scheduleCommandPayload);
    }
};

window.generateDynamicHtmlLayoutStructure = function() {
    const tabsContainer = document.getElementById("tabBarContainer");
    const workspace = document.getElementById("hubTablesWorkspace");
    if (!tabsContainer || !workspace) return;
    
    let tabsHtml = ""; let workspaceHtml = "";
    for (let hub = 0; hub < 4; hub++) {
        const activeClass = (hub === 0) ? "active" : "";
        tabsHtml += `<button class="tab-btn ${activeClass}" id="btnHub${hub}" onclick="window.switchActiveHubPanel(${hub})">${window.HUB_NAMES[hub]}</button>`;
        
        workspaceHtml += `
            <div class="hub-content ${activeClass}" id="panelHub${hub}">
                <table id="table_hub_${hub}">`;
                
        for (let ch = 0; ch < 4; ch++) {
            workspaceHtml += `
                <tr><td colspan="4" class="channel-header">Channel ${ch + 1}</td></tr>
                <tr class="mode-row">
                    <td>ON</td><td>OFF</td>
                    <td colspan="2">
                        <span id="lbl_E${hub}${ch}" class="mode-lbl lbl-auto">Auto</span>
                        <input type="range" id="E${hub}${ch}" min="0" max="2" value="1" onchange="window.processInstantModeSliderAutoSubmit(${hub}, ${ch}, this.value)">
                    </td>
                </tr>
                <tr>
                    <td>S1</td><td><input type="time" id="T${hub}${ch}0"></td><td><input type="time" id="T${hub}${ch}1"></td>
                    <td rowspan="2" style="width: 85px;"><button class="submit-btn" id="S${hub}${ch}" onclick="window.processManualScheduleSubmission(${hub}, ${ch})">Submit</button></td>
                </tr>
                <tr><td>S2</td><td><input type="time" id="T${hub}${ch}2"></td><td><input type="time" id="T${hub}${ch}3"></td></tr>`;
        }
        workspaceHtml += `</table></div>`;
    }
    tabsContainer.innerHTML = tabsHtml;
    workspace.innerHTML = workspaceHtml;
};

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
