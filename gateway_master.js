// =====================================================================
// GATEWAY_MASTER.JS - ADMIN GAURD VIEWPORT CONTROL MATRIX ENGINE
// =====================================================================

const HUB_NAMES = ["ESP01SA", "ESP01SB", "ESP01SC", "ESP01SX"];
let activeHubTab = 0;
window.isPageInitializedAndVisible = false;

// 🔒 FAMILY OPTIMIZATION TRACKING STATES
window.isAdminAuthenticated = false;

window.userInteractionLockActive = false;
window.interactionLockTimerReference = null;


// Start of function getCleanLocalFormattedTimeString()
window.getCleanLocalFormattedTimeString = function() {
    // 1. Create a dynamic date footprint from the active device
    const localDeviceDate = new Date();
    
    // 2. Convert the device's clock to pure universal greenwich time (UTC) milliseconds
    const utcTimeMilliseconds = localDeviceDate.getTime() + (localDeviceDate.getTimezoneOffset() * 60000);
    
    // 3. TARGET OFFSET LOCK: Set your garden's real-world hours offset here permanently!
    // Since your garden sits right here in the Philippines (Batangas), the offset is exactly +8 hours.
    const gardenTimeZoneOffsetHours = 8; 
    
    // 4. Construct a new target date anchored exclusively to your garden's coordinate zone
    const gardenHomeDate = new Date(utcTimeMilliseconds + (3600000 * gardenTimeZoneOffsetHours));
    
    // 5. Extract time parameters from the location-locked anchor object
    const hours24 = gardenHomeDate.getHours();
    const mm = String(gardenHomeDate.getMinutes()).padStart(2, '0');
    const ss = String(gardenHomeDate.getSeconds()).padStart(2, '0');
    
    // Update your visible dashboard live clock container widget symmetrically
    const clockElement = document.getElementById("liveClockDisplay");
    if (clockElement) {
        const ampm = hours24 >= 12 ? 'PM' : 'AM';
        const displayHours = String(hours24 % 12 || 12).padStart(2, '0');
        
        // --- 🌟 FIXED: RENAMED TO displayHours TO MATCH THE DECLARED CONSTANT ELEMENT ---
        clockElement.innerText = `${displayHours}:${mm}:${ss} ${ampm} (Garden Time)`;
        // -------------------------------------------------------------------------------
    }
    
    // Returns the authoritative, location-locked 24-hour timestamp string frame (e.g., "173045")
    return `${String(hours24).padStart(2, '0')}${mm}${ss}`;
};
// End of function getCleanLocalFormattedTimeString()


function getCleanLocalFormattedTimeString2() {
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
}

window.activateShieldRaceGuard = function() {
    window.userInteractionLockActive = true;
    if (window.interactionLockTimerReference) clearTimeout(window.interactionLockTimerReference);
    window.interactionLockTimerReference = setTimeout(() => {
        window.userInteractionLockActive = false;
    }, 4000);
};

// 🌟 LIFECYCLE HANDSHAKE LAUNCHES AUTOMATICALLY ON PAGE LOAD (PUBLIC READ VIEW ACTIVE)
document.addEventListener("DOMContentLoaded", async () => {
    generateDynamicHtmlLayoutStructure();
    
    getCleanLocalFormattedTimeString();
    setInterval(getCleanLocalFormattedTimeString, 1000);
    
    const timePayload = getCleanLocalFormattedTimeString();
    
    if (typeof window.db_init === "function") {
        await window.db_init(timePayload);
    }

    const bootCheckTimer = setInterval(async () => {
        if (window.isPageInitializedAndVisible) {
            clearInterval(bootCheckTimer); 
            console.log("[Boot Sync] Public Read View mounted successfully.");
        } else {
            if (typeof window.db_get_row_one === "function") await window.db_get_row_one();
        }
    }, 1500);
});

// 🔒 POPUP WINDOW AUTHENTICATION PIPELINE
window.triggerAdminLoginPopupPrompt = function() {
    const user = prompt("Enter Admin Username:");
    const pass = prompt("Enter Admin Security Password:");
    
    if (user === "admin" && pass == "admin1234") {
        window.isAdminAuthenticated = true;
        alert("🔓 Access Granted! Admin permissions unlocked.");
        
        // Change button text dynamically to logout indicator
        const authBtn = document.getElementById("globalAuthActionHeaderBtn");
        if (authBtn) {
            authBtn.innerText = "🔒 LOGOUT";
            authBtn.style.background = "#ff3333";
            authBtn.setAttribute("onclick", "window.triggerAdminLogoutSecure()");
        }
    } else {
        alert("❌ Invalid credentials. System locked in Read-Only state.");
    }
    
    // Force a dynamic HTML layout refresh pass to apply or strip the 'disabled' attribute blocks
    generateDynamicHtmlLayoutStructure();
    if (typeof window.db_get_row_one === "function") window.db_get_row_one();
};

window.triggerAdminLogoutSecure = function() {
    window.isAdminAuthenticated = false;
    alert("🔒 Logged out. Terminal returned to Read-Only mode.");
    window.location.reload();
};

function logToTerminal(msg) {
    const term = document.getElementById("terminalLog");
    if (term) term.innerText = `Last command: ${msg}`;
}

window.processInstantModeSliderAutoSubmit = async function(hubId, channelId, val) {
    if (!window.isAdminAuthenticated) { alert("Access Denied: Read-Only Mode"); return; }
    updateVisualSliderTextLabels(hubId, channelId, val);
    if (!window.isPageInitializedAndVisible) return;
    window.activateShieldRaceGuard();
    const sliderCommandPayload = `${hubId}E${channelId}${val}`; 
    logToTerminal(sliderCommandPayload);
    if (typeof window.db_update === "function") await window.db_update(sliderCommandPayload);
};

window.processManualScheduleSubmission = async function(hubId, channelId) {
    if (!window.isAdminAuthenticated) { alert("Access Denied: Read-Only Mode"); return; }
    if (!window.isPageInitializedAndVisible) return;
    let compiledSchedStr = "";
    for (let sked = 0; sked < 4; sked++) {
        const inputElement = document.getElementById(`T${hubId}${channelId}${sked}`);
        const val = inputElement ? inputElement.value : "";
        if (!val) { logToTerminal("Error: Empty Field"); return; }
        compiledSchedStr += val.replace(":", "");
    }
    window.activateShieldRaceGuard();
    const scheduleCommandPayload = `${hubId}K${channelId}${compiledSchedStr}`; 
    logToTerminal(scheduleCommandPayload);
    if (typeof window.db_update === "function") await window.db_update(scheduleCommandPayload);
};

function generateDynamicHtmlLayoutStructure() {
    const tabsContainer = document.getElementById("tabBarContainer");
    const workspace = document.getElementById("hubTablesWorkspace");
    if (!tabsContainer || !workspace) return;
    
    // Inject the top right login button dynamically if it doesn't exist yet
    if (!document.getElementById("globalAuthActionHeaderBtn")) {
        const titleContainer = document.querySelector(".panel");
        if (titleContainer) {
            const btnHtml = `<button id="globalAuthActionHeaderBtn" onclick="window.triggerAdminLoginPopupPrompt()" style="position: absolute; top: 15px; right: 15px; background: #00ff66; color: #000; border: none; padding: 6px 12px; font-weight: bold; border-radius: 4px; cursor: pointer; font-size: 11px;">🔑 LOGIN</button>`;
            titleContainer.style.position = "relative";
            titleContainer.insertAdjacentHTML("afterbegin", btnHtml);
        }
    }

    // Determine lock state constraint dynamically
    const disabledStateConstraintTag = window.isAdminAuthenticated ? "" : "disabled";
    
    let tabsHtml = ""; let workspaceHtml = "";
    for (let hub = 0; hub < 4; hub++) {
        const activeClass = (hub === 0) ? "active" : "";
        tabsHtml += `<button class="tab-btn ${activeClass}" id="btnHub${hub}" onclick="window.switchActiveHubPanel(${hub})">${HUB_NAMES[hub]}</button>`;
        
        workspaceHtml += `
            <div class="hub-content ${activeClass}" id="panelHub${hub}">
                <table id="table_hub_${hub}">`;
                
        for (let ch = 0; ch < 4; ch++) {
            workspaceHtml += `
                <tr><td colspan="4" class="channel-header">Channel ${ch + 1}</td></tr>
                <tr class="mode-row">
                    <td>&nbsp;</td><td>ON</td><td>OFF</td>
                    <td colspan="1">
                        <span id="lbl_E${hub}${ch}" class="mode-lbl lbl-auto">Auto</span>
                        <input type="range" id="E${hub}${ch}" min="0" max="2" value="1" ${disabledStateConstraintTag} onchange="window.processInstantModeSliderAutoSubmit(${hub}, ${ch}, this.value)">
                    </td>
                </tr>
                <tr>
                    <td>S1</td>
                    <td><input type="time" id="T${hub}${ch}0" ${disabledStateConstraintTag}></td>
                    <td><input type="time" id="T${hub}${ch}1" ${disabledStateConstraintTag}></td>
                    <td rowspan="2" style="width: 85px;"><button class="submit-btn" id="S${hub}${ch}" ${disabledStateConstraintTag} onclick="window.processManualScheduleSubmission(${hub}, ${ch})">Submit</button></td>
                </tr>
                <tr>
                    <td>S2</td>
                    <td><input type="time" id="T${hub}${ch}2" ${disabledStateConstraintTag}></td>
                    <td><input type="time" id="T${hub}${ch}3" ${disabledStateConstraintTag}></td>
                </tr>`;
        }
        workspaceHtml += `</table></div>`;
    }
    tabsContainer.innerHTML = tabsHtml;
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
