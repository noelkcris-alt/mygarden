// Start of function unpackAndDistributeHardwarePayload(rawMailboxString)
function unpackAndDistributeHardwarePayload(rawMailboxString) {
    const cleanStream = rawMailboxString.replace(/\s+/g, '');
    
    // Validates the envelope scale explicitly against your true 73-character hardware schematics
    if (cleanStream.charAt(0) !== 'N' || cleanStream.length < 73) {
        console.error(`❌ Data Error: Inbound text packet layout length is invalid (${cleanStream.length}/73 chars). Parsing skipped.`);
        return false;
    }

    //console.log(`[Standalone Slicing Engine] Unpacking 73-char loop matrix: "${cleanStream}"`);

    try {
        // Slices out the 4 mode characters first directly following the 'N' header
        const mcuModeString = cleanStream.substring(1, 5);
        
        // Slices out your 64-character unspaced scheduling timeline hours frames
        const schedulesCode = cleanStream.substring(5, 69);
        
        // Extracts the final remaining 4 characters belonging to your battery at the end of the string
        const mcuBatteryADC = cleanStream.substring(69, 73);
        const adcValueInt = parseInt(mcuBatteryADC, 10) || 0;

        // A. Distribute Tri-State Sliders Controllers (Exactly 4 built-in channels processed)
        for (let ch = 0; ch < 4; ch++) {
            const digitValue = mcuModeString.charAt(ch) || "1";
            const sliderElement = document.getElementById("E" + ch);
            if (sliderElement && document.activeElement !== sliderElement) {
                sliderElement.value = digitValue;
            }
            if (typeof updateVisualSliderTextLabels === "function") {
                updateVisualSliderTextLabels(ch, digitValue);
            }
        }

        // B. Distribute Timing Input Box Grid Cells (S1 AM and S2 PM mapped symmetrically)
        for (let ch = 0; ch < 4; ch++) {
            let channelScheduleOffset = ch * 16;
            for (let sked = 0; sked < 4; sked++) {
                const startByteIndex = channelScheduleOffset + (sked * 4);
                const clockRaw = schedulesCode.substring(startByteIndex, startByteIndex + 4);
                
                if (clockRaw.length === 4) {
                    const hh = clockRaw.substring(0, 2);
                    const mm = clockRaw.substring(2, 4);
                    const formattedBrowserTime = `${hh}:${mm}`;

                    const targetID = `T${ch}${sked}`; 
                    const timeInputBox = document.getElementById(targetID);
                    
                    if (timeInputBox && document.activeElement !== timeInputBox) {
                        timeInputBox.value = formattedBrowserTime;
                    }
                }
            }
        }

        // C. Update Your Textless Tricolor Telemetry Progress Bar Module
        const batteryMeterGraphic = document.getElementById("mcuMeter");
        const batteryTextReadout  = document.getElementById("mcuAdcText"); 
        const telemetryContainerRow  = document.getElementById("mcuTelemetryRow");
        
        if (batteryMeterGraphic && batteryTextReadout && telemetryContainerRow) {
            batteryMeterGraphic.value = adcValueInt;
            batteryTextReadout.innerText = `${adcValueInt} ADC`;
            
            // Wipe dynamic classes cleanly before parsing tricolor levels
            batteryMeterGraphic.className = "";
            telemetryContainerRow.style.borderColor = "#3a3a3a"; 
            batteryTextReadout.style.color = "#e0e0e0"; 
            
            const mcuAdcOffset = adcValueInt - 790;
            let mcuCapacityPercent = 80 + Math.round((mcuAdcOffset / 233) * 20);
            mcuCapacityPercent = Math.max(0, Math.min(100, mcuCapacityPercent));

            if (mcuCapacityPercent < 81) {
                batteryMeterGraphic.classList.add("meter-red", "pulse-critical-bar");
                batteryTextReadout.style.color = "#ff3333";
                telemetryContainerRow.style.borderColor = "#ff3333";
            } else if (mcuCapacityPercent <= 90) {
                batteryMeterGraphic.classList.add("meter-yellow");
                batteryTextReadout.style.color = "#ffcc00";
                telemetryContainerRow.style.borderColor = "#ffcc00";
            } else {
                batteryMeterGraphic.classList.add("meter-green");
                batteryTextReadout.style.color = "#00ff66";
            }
        }

        // --- 🌟 Section 3: UNMASK CONTAINER ELEMENT VIEWPORT LAYOUT WRAPPERS ---
        const secureMainPortalWorkspace = document.getElementById("securedConsoleWorkspace");
        const telemetryBarDiv = document.getElementById("mcuTelemetryRow");
        const mainWorkspaceDiv = document.getElementById("hubTablesWorkspace");
        
        if (secureMainPortalWorkspace) {
            secureMainPortalWorkspace.style.setProperty("display", "block", "important"); 
            secureMainPortalWorkspace.style.opacity = "1";
        }
        if (telemetryBarDiv) telemetryBarDiv.style.setProperty("display", "flex", "important"); 
        if (mainWorkspaceDiv) mainWorkspaceDiv.style.setProperty("display", "block", "important"); 
        
        // PHYSICAL DESTRUCTION LAYER: Completely removes the loading splash screen node
        let splash = document.getElementById("loadingSplash");
        if (splash) {
            splash.style.setProperty("display", "none", "important");
            splash.remove(); 
            console.log("[UI Unmask] Splash screen removed from DOM.");
        }
        
        window.isPageInitializedAndVisible = true;
        return true;

    } catch (err) {
        console.warn("[Standalone Parser Exception] Matrix coordinate un-wrap halted:", err);
        return false;
    }
}
// End of function unpackAndDistributeHardwarePayload(rawMailboxString)
