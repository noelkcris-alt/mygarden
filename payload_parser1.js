// =====================================================================
// PAYLOAD_PARSER.JS - UNIFIED METER CHANNELS & PULSATING ENGINE
// =====================================================================

(function injectPulsatingStyles() {
    if (document.getElementById("pulsingAlarmStyleLayer")) return;
    const styleBlock = document.createElement("style");
    styleBlock.id = "pulsingAlarmStyleLayer";
    styleBlock.innerHTML = `
        @keyframes batteryCriticalPulse {
            0% { opacity: 1.0; box-shadow: 0 0 4px rgba(255, 51, 53, 0.2); }
            50% { opacity: 0.4; box-shadow: 0 0 16px rgba(255, 51, 53, 0.7); }
            100% { opacity: 1.0; box-shadow: 0 0 4px rgba(255, 51, 53, 0.2); }
        }
        .pulse-critical-battery {
            animation: batteryCriticalPulse 1.4s infinite ease-in-out !important;
        }
    `;
    document.head.appendChild(styleBlock);
})();
// start  function unpackAndDistributeHardwarePayload(rawMailboxString) 
function unpackAndDistributeHardwarePayload(rawMailboxString) {
    const cleanStream = rawMailboxString.replace(/\s+/g, '');
    
    if (cleanStream.charAt(0) !== 'N' || cleanStream.length < 97) {
        console.error(`❌ Data Error: Inbound text packet layout length is invalid (${cleanStream.length}/97 chars). Parsing skipped.`);
        return false;
    }

    console.log(`[Unified Meter Parser] Processing 97-char stream: "${cleanStream}"`);

    let cursor = 1; 

    for (let hub = 0; hub < 4; hub++) {
        const hubBlockStart = cursor;

        const hubModeString = cleanStream.substring(hubBlockStart, hubBlockStart + 3); 
        const schedulesCode = cleanStream.substring(hubBlockStart + 3, hubBlockStart + 19);
        const hubBatteryADC  = cleanStream.substring(hubBlockStart + 19, hubBlockStart + 23);

        const adcValueInt = parseInt(hubBatteryADC, 10) || 0;
        console.log(` -> Hub #${hub} Map | Modes: ${hubModeString} | Volts: ${adcValueInt} ADC | Time Block: [${schedulesCode}]`);

        for (let ch = 0; ch < 3; ch++) {
            const digitValue = hubModeString.charAt(ch) || "1";
            const sliderElement = document.getElementById("E" + hub + ch);
            if (sliderElement && document.activeElement !== sliderElement) {
                sliderElement.value = digitValue;
            }
            if (typeof updateVisualSliderTextLabels === "function") {
                updateVisualSliderTextLabels(hub, ch, digitValue);
            }
        }

        for (let ch = 0; ch < 4; ch++) {
            for (let sked = 0; sked < 4; sked++) {
                const startByteIndex = sked * 4;
                const clockRaw = schedulesCode.substring(startByteIndex, startByteIndex + 4);
                
                if (clockRaw.length === 4) {
                    const hh = clockRaw.substring(0, 2);
                    const mm = clockRaw.substring(2, 4);
                    const formattedBrowserTime = `${hh}:${mm}`;

                    const targetID = `T${hub}${ch}${sked}`; 
                    const timeInputBox = document.getElementById(targetID);
                    
                    if (timeInputBox && document.activeElement !== timeInputBox) {
                        timeInputBox.value = formattedBrowserTime;
                    }
                }
            }
        }

        // UPDATE INDIVIDUAL FIELD HUB BATTERY METER SLIDERS AND READOUTS
        const batteryMeterGraphic = document.getElementById("met" + hub);
        const batteryTextReadout  = document.getElementById("battText" + hub);
        
        if (batteryMeterGraphic) batteryMeterGraphic.value = adcValueInt;
        if (batteryTextReadout) batteryTextReadout.innerText = `${adcValueInt} ADC`;

        cursor += 23;
    }

    // 3. EXTRACTION: PARSE MASTER BATTERY PARAMETERS AND MAP TO COMPATIBLE METER
    const masterGatewayADC = cleanStream.substring(93, 97);
    const masterAdcInt = parseInt(masterGatewayADC, 10) || 0;
    console.log(` -> Master Gateway Power Cell ADC Level: ${masterAdcInt}`);

    const masterCard       = document.getElementById("masterBatteryCard");
    const masterTitle      = document.getElementById("masterAdcTitle");
    const masterMeterBar   = document.getElementById("masterMeter");
    const masterTextLabels = document.getElementById("masterAdcText");

    if (masterCard && masterMeterBar && masterTextLabels && masterTitle) {
        masterCard.classList.remove("pulse-critical-battery");
        masterMeterBar.value = masterAdcInt; // Sets the horizontal slider bar value directly from 0 to 1023
        masterTextLabels.innerText = `${masterAdcInt} ADC`;

        if (masterAdcInt >= 1023) {
            masterTitle.innerText = "🔌 Master Node: Running on Main Line Power Grid [100%]";
            masterCard.style.color = "#00ff66";
            masterCard.style.borderColor = "#00ff66";
            masterTextLabels.style.color = "#00ff66";
        } else {
            const adcRangeSpan = 1023 - 790; 
            const capacityUnitsOffset = masterAdcInt - 790;
            let calculatedCapacityPercentage = 80 + Math.round((capacityUnitsOffset / adcRangeSpan) * 20);
            calculatedCapacityPercentage = Math.max(0, Math.min(100, calculatedCapacityPercentage));

            masterTitle.innerText = `🔋 Master Power Cell (Backup Battery) [${calculatedCapacityPercentage}% Capacity]`;
            
            // TRICOLOR STATE CONDITIONAL SPLIT ENGINE RULES MATCH
            if (calculatedCapacityPercentage < 81) {
                // BELOW 81% -> CRITICAL STATE (RED BORDER AND TEXT + PULSATING EFFECT)
                masterTitle.innerText = `🪫 CRITICAL ALARM: Battery Below 81% (${calculatedCapacityPercentage}%) - Recharging Required!`;
                masterCard.style.color = "#ff3333";
                masterCard.style.borderColor = "#ff3333";
                masterTextLabels.style.color = "#ff3333";
                masterCard.classList.add("pulse-critical-battery");
            } else if (calculatedCapacityPercentage <= 90) {
                // 81% to 90% -> CAUTION STATE (SOLID YELLOW TEXT AND BORDERS)
                masterCard.style.color = "#ffcc00";
                masterCard.style.borderColor = "#ffcc00";
                masterTextLabels.style.color = "#ffcc00";
            } else {
                // 91% to 100% -> HEALTHY STATE (SOLID GREEN TEXT AND BORDERS)
                masterCard.style.color = "#00ff66";
                masterCard.style.borderColor = "#00ff66";
                masterTextLabels.style.color = "#00ff66";
            }
        }
    }

    // =====================================================================
    // --- AUTOMATICALLY UNMASK AND UNCOVER THE USER PANEL LAYOUTS ---
    // =====================================================================
    console.log("✔ Value mapping completed successfully. Revealing user panel...");
    
    // 1. Hide the orange loading text box message status indicator bar
    const loadingMaskBox = document.getElementById("terminalLog");
    if (loadingMaskBox) loadingMaskBox.style.display = "block";

     const terminalWindowElement = document.getElementById("terminalLog");
    if (terminalWindowElement) {
        // Instead of hiding it, we simply append a clean, verified login success string line!
        logToTerminal(`[System] Initial 'N' payload verified. Opening full user interface grids control...`);
    }
	
	// 2. --- NEW REVEAL SWITCH: Snap the Master Battery Card Live ---
	
    const masterBatteryCardDiv = document.getElementById("masterBatteryCard");
    if (masterBatteryCardDiv) masterBatteryCardDiv.style.display = "block";

    // 3. Unhide your control grids tables and interactive tab buttons 
    const tabContainerDiv = document.getElementById("tabBarContainer");
    const mainWorkspaceDiv = document.getElementById("hubTablesWorkspace");
    if (tabContainerDiv) tabContainerDiv.style.display = "block";
    if (mainWorkspaceDiv) mainWorkspaceDiv.style.display = "block";
    
    window.isPageInitializedAndVisible = true;
    return true; 
}
