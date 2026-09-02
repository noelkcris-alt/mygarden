// dashboard.js
let repeat=false;
let isAP = false;
var selectedHub = 0; 
var numPins = 6;  // Will be overwritten dynamically by V48
var numHubs = 2;  // Will be overwritten dynamically by V48
const pollingIntervalMs = 60000; // 1 Minute network polling interval

// 1. LIFECYCLE ENGINE: Runs once immediately when the page finishes loading
window.addEventListener('load', async () => {
    console.log("🚀 Initial page load complete. Initializing dynamic synchronization pipeline...");
    // Start local time tracking clocks immediately so the user sees the time
    getCurTime();

    // ───> THE DEPENDENCY FIX <───
    // First, fetch the data block from Blynk. The function returns true if it gets a valid layout string.
	let syncSuccess = await fetchLatestBlynkSchedules(true); // 'true' flags this as the startup run
	
    // Start your background loop to quietly update variables every 60 seconds from now on
    setInterval(() => { fetchLatestBlynkSchedules(false); }, pollingIntervalMs);
	 // ───> START THE INITIAL PROTECTED POLLER <───
    startBlynkPolling(); 
});

// 2. SEPARATED BACKGROUND NETWORK DATA STREAM LAYER
async function fetchLatestBlynkSchedules(isStartupRun = false) {
	console.log("🔄 Fetching latest schedules from Blynk V48...");

	if (window.location.protocol.startsWith("http")) {
        try {
//            console.log("🔄 Fetching latest schedules from Blynk V48...");
            
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
					document.getElementById("status_dot").innerText="🟢";
					document.getElementById("status_text").innerText="ONLINE";

                // default tab here
				}

                // ───> STEP 3: POPULATE THE CHANNELS AND METERS WITH VALUES <───
                putSkeds(skeds);
                
                // Toggle connection indicators green
				//document.getElementById("status_text").innerText="ONLINE";

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


// Add this compact event listener to your dashboard.js file
document.addEventListener('click', async function(event) {
    // 1. Identify if one of your master utility header buttons was clicked
    let button = event.target.closest('.action-btn');
    if (!button) return;

    let groupContainer = button.closest('.btn-group');
    if (!groupContainer) return;

    // 2. Extract only the Hub and Mode variables
    let targetHub  = groupContainer.getAttribute('data-hub');   // "0" or "1"
    let targetMode = button.getAttribute('data-mode');          // "0", "1", or "2"

    // 3. Compile your precise 3-character master string packet
    let payload = `H${targetHub}${targetMode}`; // Result: "H00", "H01", etc.

    console.log(`📤 Sending Master Batch Command to V47: ${payload}`);
    // 4. Fire directly up to Blynk V47
	if (isAP) Socket.send(payload);
	else BlynkData("V47",payload);  //works
	for (let p=0;p<6;p++){ // uppdate the channels
		let obj="E"+targetHub+p;
		let txtmode="ts"+targetHub+p;
		document.getElementById(obj).value=targetMode;
		let txt=(targetMode==0)?"Off":(targetMode==1)?"Auto":" On ";
		document.getElementById(txtmode).innerText=txt;
	}
		
});


function TZGetTime(isLong) {
    const ZT="Asia/Manila";
    const now = new Date();
    if (isLong) return new Intl.DateTimeFormat('en-GB', { timeZone: ZT, weekday: 'long', day: 'numeric', month: 'long', year: "numeric"}).format(now);
	else return new Intl.DateTimeFormat('en-GB', { timeZone: ZT, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(now);

}

//-------------------------
function getCurTime(){
// set the current time of the client from the web browser
// for use of web browser current time
//--------------------
let time12=TZGetTime(false);
//console.log("Time=",time12);
/*
if (time12.substr(0,2)=="24") {time12="00"+time12.substr(2,3);}
hh=time12.substr(0,2);
mm=time12.substr(3,2);
ss=time12.substr(6,2);
nss=parseInt(ss);
nhm=parseInt(hh)*60+parseInt(mm);
if (!started) {

}
*/
document.getElementById("ST").value=time12;
}

//--------------------------------
//--------------------------------
function createtabs(numHubs){
//--------------------------------
console.log("common:createtabs");
tab="&nbsp;\n"
for (var h=0;h<numHubs;h++){
  hub="Hub"+h;
  shub="HUB "+(h+1);
  tab+="<button id='butt"+h+"' ";
//  tab+="class='tablinks'";
  //tab+=" onclick='openTab(event,\""+hub+"\")'>";
  tab+="class='btn'";
  tab+=" onclick='setActive(this)'>";

  tab+=shub+"</button>";

}
tab+="&nbsp;&nbsp;\n";

//console.log(tab);
document.getElementById('tabcont').innerHTML=tab;
}


//--------------------------------
function createbats(numHubs){
//--------------------------------
let bat="";
for (var h=0;h<numHubs;h++){
    bat += "<div class='gauge-status-cell' id='cell_H"+h+"'>";
	bat += "<span>NODE "+h+"</span>";
	bat += "<b class='gauge-val-readout' id='txt_H"+h+"'>-- ADC</b>";
	bat += "<meter id='met"+h+"' min='740' max='1023' low='975' high='1009' optimum='1023' value='1023'></meter></div>\n";
}
bat+="&nbsp;&nbsp;\n";

//console.log(bat);
document.getElementById('subGaugesContainer').innerHTML=bat;
}

//------------------
function setChannel(el){
// the slide swutch
//------------------
elid=el.id;
toSend=el.id+el.value;
toSend=toSend.toUpperCase();
console.log("toSend=",toSend);
if (isAP) Socket.send(toSend);
else BlynkData("V47",toSend);  //works
}


//----------------------------
function sendChannelSked(el){
// cmd="K" out  √
//----------------------------
console.log(el.id);
//get trigger id
//console.log(el.id);
skeds="";
hub=el.id.substr(1,1);
r=el.id.substr(2,1);
indx=0;
lastnhm=0;
for (var s=0;s<2;s++){ //s
  obj="T"+hub+r+s;
  chhmm=document.getElementById(obj).value;
  chh=chhmm.substr(0,2);
  cmm=chhmm.substr(3,2);
  chh=chh.padStart(2,"0"); 
  cmm=cmm.padStart(2,"0"); 
  skeds+=chh+cmm;
}
toSend="K"+hub+r+skeds; 
console.log("sendChannelSked: Skeds=",toSend);
if (isAP) Socket.send(toSend);
else BlynkData("V47",toSend);  //works
} // eof sendChannelSked()


//------------------
function ranger(el){
// the slide swutch E000
//------------------
elid=el.id;
let tsid="ts"+elid.substr(1,2);
let nmode=parseInt(el.value);
let txt="";
txt=(nmode==0)?"Off":(nmode==1)?"Auto":"On";
//console.log("ELID=",elid,"ts=",tsid,"txt=",txt,"value=",nmode);
document.getElementById(tsid).innerText=txt;
toSend=el.id+el.value;
if (isAP) Socket.send(toSend);
else BlynkData("V47",toSend);  //works
}


//--------------------------------
function createskeds(numHubs,numPins){
// just create the skeds no default values
//--------------------------------
console.log("createskeds(numHubs,numPins)");
	sk="";
for (var h=0;h<numHubs;h++){
	sk+="<div id='Hub"+h+"' class='tabcontent'>\n";
	sk+="<table border=1 cellpadding=0 cellspacing=0> \n";
	//sk+="<caption>HUB "+(h+1)+"</caption>\n";
	sk+="<head>";
sk += "<tr><th colspan='4'>HUB " + (h+1) + "</th>";
sk += "<th class='control-cell'>";
// ───> THE STRING CONCATENATION FIX <───
// Break the string using quotes and append the variable 'h' with + signs
sk += "<div class='btn-group' data-hub='" + h + "'>";
sk += "<button type='button' class='action-btn' data-mode='0'>Off</button>";
sk += "<button type='button' class='action-btn' data-mode='1'>AUTO</button>";
sk += "<button type='button' class='action-btn' data-mode='2'>ON</button>";
sk += "</div></th></tr>\n";


//	sk+="<tr><td colspan='4'><hr class='special'/></td><td>BatT</td></tr>\n";	
	sk+="<tr align='center'><th class='channel-header'>Channel</th><th class=on>ON</th><th colspan=1 class=off>OFF</th><th>Update</th><th class='mode-row mode-lbl;'>Mode</th></tr>";

//	sk+="<th colspan=1><input type='range' class='slider' id='C"+h+"' min='0' max='2' value=1 onchange='ranger(this);'/>&nbsp;<span id='ts"+h+"'>Auto</span>";
//	sk+="</th></tr>\n";
	sk+="</head>";
	for (var p=0;p<numPins;p++){
		hp=""+h+p;
		tbid="tb"+hp;
		d="D"+hp;
		t="T"+hp;
		sk+="<tbody id='"+tbid+"'>\n";
		sk+="<tr>";
		sel="<th style='border-radius:10px;'><select id='g"+hp+"' onchange='setChannel(this);'>\n";
		for (var g=0;g<6;g++){
		 sel+="<option value="+g+">"+(g+1)+"</option>\n";
		}
		 sel+="</select></th>";
		sk+=sel;

//		<th colspan=3 id='"+d+"'>Channel "+(p+1)+"</th>";
		sk+="<th class='on'><input id='"+t+"0' type=time value='06:00' /></th><th class='off'><input id='"+t+"1' type=time value='06:01'  /></th>\n";
		sk+="<th rowspan=1><button class='btn submit-btn' id='S"+hp+"' onclick='sendChannelSked(this);'>Submit</th>\n";
		sk+="<th colspan='1'  class='tri-container'><input type='range' class='slider' id='E"+hp+"' min='0' max='2' value=0 onchange='ranger(this);'/>&nbsp;<span id='ts"+hp+"'>Auto</span></th>";
		
		sk+="</tbody>\n";
	}
//sk+="<tr><td colspan=4 class=batt>&nbsp;Batt&nbsp;<meter id='met"+h+"'  min='740' low='800' optimum='900' high='1000' max='1023' value=0></meter></td></tr>\n";
//sk+="<tr><td colspan=4><hr id='met"+h+"' /></td><td class=batt>&#x1F5F2;Batt</td></tr>\n";
sk+="</table>\n";
sk+="</div>\n";

}
//console.log(sk);
sk+="<p id='sketch' style='font-size:8px;vertical-align: top;color:white;'>sketch.ino</p>";
sk+="<img style='display:block; width:80px;height:80px;' id='img0'/>";
document.getElementById('skeds').innerHTML=sk;
document.getElementById('img0').src=icon;

} //createskeds()

//----------------------
function putSkeds(pskeds){
// chan-mode-on-off
// 0-1-0700-0800
//----------------------
console.log("putSkeds(pskeds)");
skeds=pskeds.replaceAll("-","");
//console.log("channels",numPins);
//console.log("skeds",skeds);
off=0;
hubsA = skeds.split("|");
//numPins=(hubsA[0].length-4)/10;
numHubs = skeds.split("|").length - 1;
for (var h=0;h<numHubs;h++){
	let line=hubsA[h];
	//console.log("line=",line);
	for (var p=0;p<numPins;p++){
		ch=line.substr(p*10,10);
		//console.log("h=",h,"ch:",p,ch);
		document.getElementById("g"+h+p).value=ch.substr(0,1);
		let mode="E"+h+p;
		let txtmode="ts"+h+p;
		let vmode=ch.substr(1,1);
		let nmode=vmode&3;
		let mod=document.getElementById(mode).value;
		document.getElementById(mode).value=nmode;
		let txt=(nmode==0)?"Off":(nmode==1)?"Auto":"On";
		//console.log(p,"mode=",mod,"vmode=",vmode,"txt=",txt);
		document.getElementById(txtmode).innerText=txt;

		ohm1="T"+h+p+"0";
		ohm2="T"+h+p+"1";
		vhm1=ch.substr(2,4);
		let t1 = `${vhm1.slice(0, 2)}:${vhm1.slice(2)}`;
		vhm2=ch.substr(6,4);
		let t2 = `${vhm2.slice(0, 2)}:${vhm2.slice(2)}`;
		//console.log("t1=",t1,"t2=",t2);
		document.getElementById(ohm1).value=t1;
		document.getElementById(ohm2).value=t2;
		//opar=document.getElementById("g"+j).parentElement;
		//console.log("parent",opar.tagName);
	}
//let randomADC = Math.floor(Math.random() * 1024); 
//let txtADC=randomADC.toString();
let maxVolts=12.6;
let randomADC = parseInt(line.substr(60,4));
let txtVolts=parseFloat(randomADC/1023*maxVolts).toFixed(1)+" V";
//console.log("volts=",txtVolts);
//let txtADC= Math.round(randomADC/1023*12.6)+"V";
let obj="txt_H"+h;
document.getElementById(obj).innerText=txtVolts;
document.getElementById("met"+h).value=randomADC;

// get the batt level

}
}

//-------------------------------------
function setActive(clickedButton) {
//-------------------------------------
  console.log("function setActive(clickedButton)");
  TabName=clickedButton.id;
  let letter = TabName.charAt(TabName.length-1);
  hubid="Hub"+letter;
  
  // Find the currently active button in the group
  const currentActive = document.querySelector('.btn.active');
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  
  
  // Remove the active class from it
  if (currentActive) {
    currentActive.classList.remove('active');
	document.getElementById(hubid).style.display = "none";

  }
  
  // Add the active class to the clicked button
  clickedButton.classList.add('active');
  document.getElementById(hubid).style.display = "block";

}


function init1(BlData){
console.log("function init(BlData)");
getCurTime(); // locally
let skeds=BlData.replaceAll("-","");
console.log('Init11: BlData =', skeds); 
let hubsA = skeds.split("|");
numPins=(hubsA[0].length-4)/10;
numHubs = skeds.split("|").length - 1;
let title=numPins+"-Channel Daily Switch Controller";
if (numHubs>1) title=numHubs+"-Hub "+title;
document.getElementById("apptitle").innerText=title;
document.getElementById("pagetitle").innerText=title;
createskeds(numHubs,numPins);
if (numHubs>1) {
createtabs(numHubs);
createbats(numHubs);
document.getElementById("butt0").click(); // click the first hub
}
putSkeds(skeds);
document.getElementById("today").innerText=TZGetTime(true);
}	


// --Blynk Routines
/*
const BLYNK_AUTH_TOKEN = "qhP8Ca-InhAF-p5H7zOkpcVgDugg7Ti3";
const BLYNK_SERVER = "https://sgp1.blynk.cloud/external/api";
const get_url=BLYNK_SERVER+"/get?token="+BLYNK_AUTH_TOKEN;
const update_url=BLYNK_SERVER+"/update?token="+BLYNK_AUTH_TOKEN;
*/
/*
virtual pin assignment
V50  Blynk ESPNOW 4 Hub 4 Channel Daily Switch controllers Status
V49  Blynk ESPNOW 4 Hub 4 Channel Daily Switch controllers Commands
V48  Blynk Alarm H Hub C Channel Status
V47  Blynk Alarm H Hub C Channel Commands
*/

//const TZ="America/New_York";
const TZ="Asia/Manila";
let  BData="";
/*
window.addEventListener('load', async () => {
    try {
        // Add "await" here to pause and wait for the actual value
	time12=TZGetTime(false); // Output: 13:33:45
//		time12 = dt12.toLocaleTimeString("en-US", {timeZone: "Asia/Manila" hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false});
		let toSend="T"+time12.replaceAll(":","");
		console.log(time12);
		await BlynkData("V47",toSend);  //works
		try {
        // Add "await" here to pause and wait for the actual value
		BData=await BlynkData("V48");
		init(BData);
		} catch (error) {
        console.error('Error fetching Blynk data:', error);
    }
    } catch (error) {
        console.error('Error sending Blynk data:', error);
    }
});
*/


vv=setInterval(getCurTime,1000);
//setInterval(putSkeds, 2000, skeds);


/*
let blynkPollingTimer = null; // Holds the active timer reference ID

function startBlynkPolling() {
    if (!blynkPollingTimer) {
        console.log("⏰ Polling Started: Fetching Blynk updates every 60s.");
        // Re-execute immediately on wakeup so the user doesn't wait a minute for updates
        fetchLatestBlynkSchedules(false); 
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
*/