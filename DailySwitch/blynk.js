// --Blynk Routines
var _0x6b_0xde8=(678402^678410)+(211408^211416);
const BLYNK_AUTH_TOKEN="\u0071\u0068\u0050\u0038\u0043\u0061\u002D\u0049\u006E\u0068\u0041\u0046\u002D\u0070\u0035\u0048\u0037\u007A\u004F\u006B\u0070\u0063\u0056\u0067\u0044\u0075\u0067\u0067\u0037\u0054\u0069\u0033";_0x6b_0xde8=(511846^511840)+(736362^736360);
//const BLYNK_AUTH_TOKEN = "qhP8Ca-InhAF-p5H7zOkpcVgDugg7Ti3";
const BLYNK_SERVER = "https://sgp1.blynk.cloud/external/api";
const get_url=BLYNK_SERVER+"/get?token="+BLYNK_AUTH_TOKEN;
const update_url=BLYNK_SERVER+"/update?token="+BLYNK_AUTH_TOKEN;


// 2. SEPARATED BACKGROUND NETWORK DATA STREAM LAYER
async function fetchLatestBlynkSchedules1(isStartupRun = false) {
    if (window.location.protocol.startsWith("http")) {
        try {
            console.log("🔄 Fetching latest schedules from Blynk V48...");
            
            // Sync local clock time up to V47 command channel line
            let time12 = TZGetTime(false); 
            let toSend = "T" + time12.replaceAll(":", "");
            await BlynkData("V47", toSend);  
            
            // Pull down the master string payload from V48
            BData = await BlynkData("V48");
            
            if (BData) {
                BData = BData.replace(/^"|"$/g, '').trim(); // Clear cloud quote wrappers
                let skeds = BData.replaceAll("-", "");
                
                let hubsA = skeds.split("|");
                // Remove trailing empty array items caused by split delimiters
                if (hubsA[hubsA.length - 1].trim() === "") {
                    hubsA.pop();
                }

                // ───> STEP 1: CALCULATE MATRIX DIMENSIONS DYNAMICALLY ON THE FLY <───
                // Hub 1 string length minus 4 battery digits divided by 10-char layout blocks
                numPins = Math.trunc((hubsA[0].trim().length - 4) / 10);
                numHubs = hubsA.length;

                console.log(`🎯 Matrix Detected via V48: ${numHubs} Hub(s), ${numPins} Channels per Hub.`);

                // ───> STEP 2: IF THIS IS THE STARTUP BOOT, DRAW THE UI ELEMENTS ONCE <───
                if (isStartupRun) {
                    let title = numPins + "-Channel Daily Switch Controller";
                    if (numHubs > 1) title = numHubs + "-Hub " + title;
                    document.getElementById("apptitle").innerText = title;

                    // Build the containers and forms dynamically matching the calculated bounds
                    createskeds(numHubs, numPins);
                    createtabs(numHubs);
                    createbats(numHubs);
	 			    document.getElementById("butt0").click(); // click the first hub
					document.getElementById("today").innerText=TZGetTime(true);


                // default tab here
				}

                // ───> STEP 3: POPULATE THE CHANNELS AND METERS WITH VALUES <───
                putSkeds(skeds);
                
                // Toggle connection indicators green
                toggleNetBadge('router', true);
                toggleNetBadge('blynk', true);
                let wsBadge = document.getElementById('dot-ws');
                if (wsBadge) wsBadge.classList.add('online');
                
                return true; // Complete success
            }
        } catch (error) {
            console.error('Network sync paused: Cloud did not respond.', error);
            toggleNetBadge('blynk', false);
        }
    } else {  // not http protocol
		
        // Local File Desktop Simulation Mockup (Triggers if double-clicking index.html offline)
        if (isStartupRun) {
            console.log("🤖 Local file offline test. Injecting seed payload to compute UI layout...");
            let fakeStringStream = 
                "0106000901110601060221060206033106030604410604060551060506060761|" +
                "0107001001110701070221070207033107030704410704070551080509060800|";
            
            let hubsA = fakeStringStream.split("|");
            if (hubsA[hubsA.length - 1].trim() === "") hubsA.pop();
            
            numPins = Math.trunc((hubsA[0].length - 4) / 10);
            numHubs = hubsA.length;

            createskeds(numHubs, numPins);
            createtabs(numHubs);
            createbats(numHubs);
            //itchHubView(0);
//			document.getElementById("butt0").click(); // click the first hub

            putSkeds(fakeStringStream);
            
            toggleNetBadge('router', true);
            toggleNetBadge('blynk', true);
            if (document.getElementById('dot-ws')) document.getElementById('dot-ws').classList.add('online');
        }
    }
    return false;
}



async function BlynkData(virtualPin,value ) {
   	if (value) url = `${update_url}&${virtualPin}=${value}`;
	else url = `${get_url}&${virtualPin}`;
	// console.log("URL=", url); 
	
	try {
        // 2. Use 'await' to pause execution until the network responds
        const response = await fetch(url);
        
        if (!response.ok) {
            alert("API Error: Cloud did not respond correctly.");
        
            return null; // Return null if the API failed
        }
        
        // 3. Use 'await' to wait for the text stream to finish reading
        const textData = await response.text();

        return textData; // This successfully returns the value back to the caller
        
    } catch (error) {
        console.error('Error:', error);
		alert("Network Error: Check Internet Connection");
        return null; // Return null if the network failed
    }
}



// Add this to the very bottom of common.js
function toggleNetBadge(id, isOnline) {
    let el = document.getElementById("dot-" + id);
    if (el) { 
        if (isOnline) {
            el.classList.add('online'); 
        } else {
            el.classList.remove('online'); 
        }
    }
}


let blynkPollingTimer = null; // Holds the active timer reference ID

function startBlynkPolling() {
    if (!blynkPollingTimer) {
        console.log("⏰ Polling Started: Fetching Blynk updates every 60s.");
        // Re-execute immediately on wakeup so the user doesn't wait a minute for updates
        //fetchLatestBlynkSchedules(false); 
        blynkPollingTimer = setInterval(() => { fetchLatestBlynkSchedules(false); }, pollingIntervalMs);
    }
}

function stopBlynkPolling() {
    if (blynkPollingTimer) {
        console.log("💤 Dashboard Backgrounded: Polling stopped to save Blynk messages.");
        clearInterval(blynkPollingTimer);
        blynkPollingTimer = null;
    }
}

// ───> THE AUTOMATED SLEEP/WAKE TRACKER <───
document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
        stopBlynkPolling(); // Suspends message hits instantly when tab is hidden
    } else {
        startBlynkPolling(); // Wakes up and updates the screen the moment you return
    }
});

