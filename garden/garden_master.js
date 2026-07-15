// =====================================================================
// GATEWAY_MASTER.JS - STANDALONE 4-CHANNEL PRODUCTION GRAPHICS ENGINE
// =====================================================================
const numChannels=4;
window.isPageInitializedAndVisible = false;

// 🔒 SECURITY RESTORED: Default state blocks unauthorized web writing updates natively!
const isLocalhost=window.location.hostname=="localhost"; // buttons are clickable
window.isAdminAuthenticated = isLocalhost;
window.userInteractionLockActive = false;
window.interactionLockTimerReference = null;

// Start of function getCleanLocalFormattedTimeString()
window.getCleanLocalFormattedTimeString = function() {
    const localDeviceDate = new Date();
    const utcTimeMilliseconds = localDeviceDate.getTime() + (localDeviceDate.getTimezoneOffset() * 60000);
    
    // TARGET OFFSET LOCK: Set your Batangas garden location's real-world hours offset here permanently (+8 UTC)
    const gardenTimeZoneOffsetHours = 8; 
    const gardenHomeDate = new Date(utcTimeMilliseconds + (3600000 * gardenTimeZoneOffsetHours));
    
    const hours24 = gardenHomeDate.getHours();
    const mm = String(gardenHomeDate.getMinutes()).padStart(2, '0');
    const ss = String(gardenHomeDate.getSeconds()).padStart(2, '0');
    
    const clockElement = document.getElementById("liveClockDisplay");
    if (clockElement) {
        const ampm = hours24 >= 12 ? 'PM' : 'AM';
        const displayHours = String(hours24 % 12 || 12).padStart(2, '0');
        clockElement.innerText = `${displayHours}:${mm}:${ss} ${ampm} (Garden Time)`;
    }
    return `${String(hours24).padStart(2, '0')}${mm}${ss}`;
};
// End of function getCleanLocalFormattedTimeString()

// Start of function activateShieldRaceGuard()
window.activateShieldRaceGuard = function() {
    window.userInteractionLockActive = true;
    if (window.interactionLockTimerReference) clearTimeout(window.interactionLockTimerReference);
    window.interactionLockTimerReference = setTimeout(() => {
        window.userInteractionLockActive = false;
        console.log("[Race Shield] Safety guard dropped. Browser resumed normal cloud mirroring.");
    }, 4000);
};
// End of function activateShieldRaceGuard()

// LIFECYCLE INITIALIZER HANDSHAKE: AUTOMATICALLY MOUNTS RE-READ CHANNELS ON BOOT
document.addEventListener("DOMContentLoaded", async () => {
	document.getElementById("terminalLog").style.display=isLocalhost?'block':'none';
    console.log(window.location.hostname);
	window.generateDynamicHtmlLayoutStructure();
    window.getCleanLocalFormattedTimeString();
    setInterval(window.getCleanLocalFormattedTimeString, 1000);
    
    const timePayload = window.getCleanLocalFormattedTimeString();
    
    if (typeof window.db_init === "function") {
        await window.db_init(timePayload);
    }

    // Initial manual sweep loop checks Row 1 for incoming hardware data blocks
    const bootCheckTimer = setInterval(async () => {
        if (window.isPageInitializedAndVisible) {
            clearInterval(bootCheckTimer); 
            console.log("[Standalone Boot Sync] Connected successfully. Continuous polling active.");
        } else {
            if (typeof window.db_get_row_one === "function") {
                await window.db_get_row_one();
            }
        }
    }, 1500);
});

// Start of function triggerAdminLoginPopupPrompt()
window.triggerAdminLoginPopupPrompt = function() {
    const user = prompt("Enter Admin Username:");
    const pass = prompt("Enter Admin Security Password:");
    
    if (user === "admin" && pass === "admin1234") {
        window.isAdminAuthenticated = true;
        alert("🔓 Access Granted! Admin write permissions unlocked.");
        
        const authBtn = document.getElementById("globalAuthActionHeaderBtn");
        if (authBtn) {
            authBtn.innerText = "🔒 LOGOUT";
            authBtn.style.background = "#ff3333";
            authBtn.setAttribute("onclick", "window.triggerAdminLogoutSecure()");
        }
    } else {
        alert("❌ Invalid credentials. System locked in Read-Only state.");
    }
    
    // Refresh structural form states to actively unmask or gray-out range sliders
    window.generateDynamicHtmlLayoutStructure();
    if (typeof window.db_get_row_one === "function") window.db_get_row_one();
};
// End of function triggerAdminLoginPopupPrompt()

// Start of function triggerAdminLogoutSecure()
window.triggerAdminLogoutSecure = function() {
    window.isAdminAuthenticated = false;
    alert("🔒 Logged out. Terminal returned to Read-Only mode.");
    window.location.reload();
};
// End of function triggerAdminLogoutSecure()

window.logToTerminal = function(msg) {
    const term = document.getElementById("terminalLog");
    if (term) term.innerText = `Last command: ${msg}`;
};

// TRI-STATE SLIDER INPUT TRANS-MISSION DISPATCH PIPELINE
window.processInstantModeSliderAutoSubmit = async function(channelId, val) {
    if (!window.isAdminAuthenticated) { alert("Access Denied: Read-Only Mode"); return; }
    window.updateVisualSliderTextLabels(channelId, val);
    if (!window.isPageInitializedAndVisible) return;
    
    window.activateShieldRaceGuard();
    
    const sliderCommandPayload = `E${channelId}${val}`; 
    window.logToTerminal(sliderCommandPayload);

    if (typeof window.db_update === "function") {
        await window.db_update(sliderCommandPayload);
    }
};

// CALENDAR TIMELINE INPUT TRANS-MISSION DISPATCH PIPELINE
window.processManualScheduleSubmission = async function(channelId) {
    if (!window.isAdminAuthenticated) { alert("Access Denied: Read-Only Mode"); return; }
    if (!window.isPageInitializedAndVisible) return;
    
    let compiledSchedStr = "";
    for (let sked = 0; sked < 4; sked++) {
        const inputElement = document.getElementById(`T${channelId}${sked}`);
        const val = inputElement ? inputElement.value : "";
        if (!val) { window.logToTerminal("Error: Empty Field"); return; }
        compiledSchedStr += val.replace(":", "");
    }

    window.activateShieldRaceGuard();

    const scheduleCommandPayload = `K${channelId}${compiledSchedStr}`; 
    window.logToTerminal(scheduleCommandPayload);

    if (typeof window.db_update === "function") {
        await window.db_update(scheduleCommandPayload);
    }
};

// Start of function generateDynamicHtmlLayoutStructure()
window.generateDynamicHtmlLayoutStructure = function() {
    const workspace = document.getElementById("hubTablesWorkspace");
    if (!workspace) return;
    
    const disabledStateConstraintTag = window.isAdminAuthenticated ? "" : "disabled";
    
    let workspaceHtml = `<table style="width:100%; border-collapse:collapse; table-layout:fixed; word-wrap:break-word;"><tbody>`;
            
    for (let ch = 0; ch < numChannels; ch++) {
        // 🌟 RIGID COLUMN MATRIX PERCENTAGES SPECIFICATION:
        // Column 1 (S1/S2/Spacer) -> 6% (Ultra-Narrow Spacer)
        // Column 2 (ON / Time 1)   -> 22% (Narrow Input)
        // Column 3 (OFF / Time 2)  -> 22% (Narrow Input)
        // Column 4 (Sliders & Lbl) -> 50% (Maximized wide breathing room!)
        workspaceHtml += `
            <tr><td colspan="4" class="channel-header">Channel ${ch + 1}</td></tr>
            <tr class="mode-row">
                <td style="width: 6%;"></td>
                <td style="width: 22%; font-weight: bold; color: #aaa;">ON</td>
                <td style="width: 22%; font-weight: bold; color: #aaa;">OFF</td>
                <td style="width: 50%; text-align: left; padding-left: 10px;">
                    <span id="lbl_E${ch}" class="mode-lbl lbl-auto">Auto</span>
                    <input type="range" id="E${ch}" min="0" max="2" value="1" ${disabledStateConstraintTag} onchange="window.processInstantModeSliderAutoSubmit(${ch}, this.value)">
                </td>
            </tr>
            <tr>
                <td style="width: 6%; font-weight: bold; color: #666; text-align: center;">S1</td>
                <td style="width: 22%;"><input type="time" id="T${ch}0" ${disabledStateConstraintTag} style="width: 90%; max-width: 70px;"></td>
                <td style="width: 22%;"><input type="time" id="T${ch}1" ${disabledStateConstraintTag} style="width: 90%; max-width: 70px;"></td>
                <td rowspan="2" style="width: 50%; padding: 4px 8px; text-align: left;">
                    <!-- 🌟 REDUCED SUBMIT BUTTON: Scaled down cleanly to 75% of column layout footprint -->
                    <button class="submit-btn" id="S${ch}" ${disabledStateConstraintTag} style="width: 75%; max-width: 100px; display: block; margin: 0 auto 0 10px;">Submit</button>
                </td>
            </tr>
            <tr>
                <td style="width: 6%; font-weight: bold; color: #666; text-align: center;">S2</td>
                <td style="width: 22%;"><input type="time" id="T${ch}2" ${disabledStateConstraintTag} style="width: 90%; max-width: 70px;"></td>
                <td style="width: 22%;"><input type="time" id="T${ch}3" ${disabledStateConstraintTag} style="width: 90%; max-width: 70px;"></td>
            </tr>`;
    }
    workspaceHtml += `</tbody></table>`;
    workspace.innerHTML = workspaceHtml;
};
// End of function generateDynamicHtmlLayoutStructure()


window.updateVisualSliderTextLabels = function(ch, value) {
    const label = document.getElementById("lbl_E" + ch); if (!label) return;
    label.className = "mode-lbl";
    if (value === "0") { label.innerText = "OFF"; label.classList.add("lbl-off"); }
    else if (value === "1") { label.innerText = "Auto"; label.classList.add("lbl-auto"); }
    else if (value === "2") { label.innerText = "ON"; label.classList.add("lbl-on"); }
};

document.addEventListener('contextmenu', e => e.preventDefault());
