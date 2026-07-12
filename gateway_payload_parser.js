// =====================================================================
// GATEWAY_PAYLOAD_PARSER.JS - SYMMETRICAL CLASS-CLEARING PARSER ENGINE
// =====================================================================

function unpackAndDistributeHardwarePayload(rawMailboxString) {
    const cleanStream = rawMailboxString.replace(/\s+/g, '');
    
    // Safety check: verify structure parameter bounds matching your 293 character footprint format precisely
    if (cleanStream.charAt(0) !== 'N' || cleanStream.length < 293) {
        console.error(`❌ Data Error: Inbound text packet layout length is invalid (${cleanStream.length}/293 chars). Parsing skipped.`);
        return false;
    }

    console.log(`[Matrix Slicing Engine] Unpacking 293-char environment footprint...`);

    try {
        // Pull down names registry array from master scope window context natively
        const mcuNamesRegistry = window.HUB_NAMES || ["ESP01SA", "ESP01SB", "ESP01SC", "ESP01SX"];

        // --- 1. PROCESSING INDIVIDUAL FIELD HUBS (FOUR BLOCKS TOTAL) ---
        for (let hub = 0; hub < 4; hub++) {
            let offset = 1 + (hub * 72);
            
            const hubModeString = cleanStream.substring(offset, offset + 4);       
            const schedulesCode = cleanStream.substring(offset + 4, offset + 68);  
            const hubBatteryADC  = cleanStream.substring(offset + 68, offset + 72); 

            const adcValueInt = parseInt(hubBatteryADC, 10) || 0;

            // A. Distribute Tri-State Sliders Controllers
            for (let ch = 0; ch < 4; ch++) {
                const digitValue = hubModeString.charAt(ch) || "1";
                const sliderElement = document.getElementById("E" + hub + ch);
                if (sliderElement && document.activeElement !== sliderElement) {
                    sliderElement.value = digitValue;
                }
                if (typeof updateVisualSliderTextLabels === "function") {
                    updateVisualSliderTextLabels(hub, ch, digitValue);
                }
            }

            // B. Distribute Timing Input Box Grid Cells
            for (let ch = 0; ch < 4; ch++) {
                let channelScheduleOffset = ch * 16;
                for (let sked = 0; sked < 4; sked++) {
                    const startByteIndex = channelScheduleOffset + (sked * 4);
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

            // C. TRICOLOR & PULSATING INJECTION FOR FIELD HUB METER BARS
            const batteryMeterGraphic = document.getElementById("met" + hub);
            const batteryTextReadout  = document.getElementById("txt_H" + hub); 
            const gaugeContainerCell  = document.getElementById("cell_H" + hub);
            
            if (batteryMeterGraphic && batteryTextReadout && gaugeContainerCell) {
                batteryMeterGraphic.value = adcValueInt;
                batteryTextReadout.innerText = `${adcValueInt} ADC`;
                
                // --- 🌟 FIXED: EXPLICITLY SCRUB OLD CLASSES ENTIRELY TO FORCE CHROMAS RE-PAINT ---
                batteryMeterGraphic.className = ""; 
                batteryMeterGraphic.classList.remove("meter-green", "meter-yellow", "meter-red", "pulse-critical-bar");
                // ---------------------------------------------------------------------------------
                
                gaugeContainerCell.style.borderColor = "#2d2d2d"; 
                batteryTextReadout.style.color = "#e0e0e0"; // Default muted text color base
                
                // Calculate operational percentage levels matching your hardware limits
                const hubAdcOffset = adcValueInt - 790;
                let hubCapacityPercent = 80 + Math.round((hubAdcOffset / 233) * 20);
                hubCapacityPercent = Math.max(0, Math.min(100, hubCapacityPercent));

                if (hubCapacityPercent < 81) {
                    // BELOW 81% -> RED TEXT READOUT + INTERIOR PROGRESS VAL BAR FLASHS ACTIVE
                    batteryMeterGraphic.classList.add("meter-red", "pulse-critical-bar");
                    batteryTextReadout.style.color = "#ff3333";
                    gaugeContainerCell.style.borderColor = "#ff3333";
                } else if (hubCapacityPercent <= 90) {
                    // 81% to 90% -> SOLID AMBER WARNING STATE
                    batteryMeterGraphic.classList.add("meter-yellow");
                    batteryTextReadout.style.color = "#ffcc00";
                    gaugeContainerCell.style.borderColor = "#ffcc00";
                } else {
                    // 91% to 100% -> SOLID GREEN NORMAL STATE
                    batteryMeterGraphic.classList.add("meter-green");
                    batteryTextReadout.style.color = "#00ff66";
                }
            }
        }

        // --- 2. TRICOLOR & PULSATING INJECTION FOR THE BOXED MASTER METER BAR ---
        const masterGatewayADC = cleanStream.substring(289, 293);
        const masterAdcInt = parseInt(masterGatewayADC, 10) || 0;

        const masterCard       = document.getElementById("masterBatteryCard");
        const masterMeterBar   = document.getElementById("masterMeter");
        const masterTextLabels = document.getElementById("masterAdcText");

        if (masterCard && masterMeterBar && masterTextLabels) {
            masterMeterBar.value = masterAdcInt; 
            masterTextLabels.innerText = `${masterAdcInt} ADC`;
            
            // --- 🌟 FIXED: EXPLICITLY SCRUB OLD MASTER CLASSES ENTIRELY TO FORCE CHROMAS RE-PAINT ---
            masterMeterBar.className = ""; 
            masterMeterBar.classList.remove("meter-green", "meter-yellow", "meter-red", "pulse-critical-bar");
            // -----------------------------------------------------------------------------------------
            
            masterCard.style.borderColor = "#2d2d2d";

            const masterAdcOffset = masterAdcInt - 790;
            let masterCapacityPercent = 80 + Math.round((masterAdcOffset / 233) * 20);
            masterCapacityPercent = Math.max(0, Math.min(100, masterCapacityPercent));

            if (masterAdcInt >= 1023 || masterCapacityPercent > 90) {
                // HEALTHY OPERATION -> SOLID GREEN BAR
                masterMeterBar.classList.add("meter-green");
                masterTextLabels.style.color = "#00ff66";
            } else if (masterCapacityPercent <= 90 && masterCapacityPercent >= 81) {
                // CAUTION WARNING -> SOLID AMBER BAR
                masterMeterBar.classList.add("meter-yellow");
                masterTextLabels.style.color = "#ffcc00";
                masterCard.style.borderColor = "#ffcc00";
            } else {
                // CRITICAL ALARM -> RED INSIDE METER PROGRESS ELEMENT BAR AND PULSATES LOCALLY!
                masterMeterBar.classList.add("meter-red", "pulse-critical-bar");
                masterTextLabels.style.color = "#ff3333";
                masterCard.style.borderColor = "#ff3333"; 
            }
        }

        // Output successful sync traces to terminal log widget bar
        if (typeof logToTerminal === "function") {
            logToTerminal(`Mirror sync completed. 293 characters mapped completely.`);
        }

        // Unmask layout workspace wrappers
        const masterBatteryCardDiv = document.getElementById("masterBatteryCard");
        const tabContainerDiv = document.getElementById("tabBarContainer");
        const subGaugesDiv = document.getElementById("subGaugesContainer");
        const mainWorkspaceDiv = document.getElementById("hubTablesWorkspace");
        
        if (masterBatteryCardDiv) masterBatteryCardDiv.style.display = "flex"; 
        if (tabContainerDiv) tabContainerDiv.style.display = "flex";
        if (subGaugesDiv) subGaugesDiv.style.display = "flex"; 
        if (mainWorkspaceDiv) mainWorkspaceDiv.style.display = "block";
        
        // Hide initial overlay cover splashes nodes safely
        let splash = document.getElementById("loadingSplash");
        if (splash) splash.style.display = "none";
        
        window.isPageInitializedAndVisible = true;
        return true;

    } catch (err) {
        console.warn("[Parser Framework Core Drop Alert] Coordinate slice failed:", err);
        return false;
    }
}
