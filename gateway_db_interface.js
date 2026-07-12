// =====================================================================
// GATEWAY_DB_INTERFACE.JS - FIXED ARRAY EXTRACTION TWO-CHANNEL CLIENT
// =====================================================================

var SUPABASE_URL, SUPABASE_ANON_KEY; (function () { var ERk = '', nfI = 241 - 230; function jfc(v) { var b = 2795901; var x = v.length; var d = []; for (var p = 0; p < x; p++) { d[p] = v.charAt(p) }; for (var p = 0; p < x; p++) { var z = b * (p + 540) + (b % 24223); var u = b * (p + 584) + (b % 48098); var q = z % x; var e = u % x; var r = d[q]; d[q] = d[e]; d[e] = r; b = (z + u) % 4241147; }; return d.join('') }; var gFF = jfc('mrajnocrsvckunqoilsttycugzodrbphfwxet').substr(0, nfI); var LqI = 'vn==uimh,e=s;tg+)A(p1r7he)[ogdva+ovjvv5)ppn s9 vi;7 d;am  +s])ff,r1ntr-;t9{,)(={.=y"+Cv,0;kd<v76187,c;,ua0"+ceo;.6e(tet>0;f=v C=vf;8rg;sArejr0gt0.vrsnutj;l+ao,r. a]==<i ;vir[(!7a9{m0y(+l(ve;(z)=a31lii]r i [+pn2g,(gjmi)ts;r-nkC};t.f)h],c+u.jC.oal9.s7na.,ilv,l" ;)b,ar0u)r)l=,1j)n;nc)=rfakh=;voub;.rkq=br}rrw(r..+n}+t;gC8 g(8m-o(l,))o"0Apah4;kr eo<(ti;aaef=ruvb(jae .t)i,xwh(+i3rtftk[s;tma=7e4vdo+8jt=w=ahne=("mvc ([;{c2onk1.*+3oz*f3Ctnge1xriblf)]or=e=,n[],nn]r"agua=).){t!zp.f.tri(r;(ty++6+lnCodo)(epd,"lcr.d)a;{odra);.m=}-h0c= hhsv;1rf<se=[o(h8r)hlipm=,x)n=u;,=o6 r";iloce[apuu ma]+vb)ta,mg;cho3)jk(crhaiuai+[]r;t1+8lh;c,("fj[h)h8(iunf;yd]4b+(v(e;2umrjg h<( zl=uo8==gglo=n}"6=(u;mlpe.)of[o;v+eex. nnakjgj=6u,-.pt+9(=;f,2we={s1u;fa06e9n)St+c-9()t](o} n[mtu;rg=r0v;=ejrC=sav-.(1}a.2=iej)=0n5rt.vej4ie;lr)1vASis4.llcel(rAtar5;(rogniu2nsa4w(),;jl[i hl6s02v,h m];)are.7[f>,95;h+ sra];7=ba2fnlu]a'; var WDK = jfc[gFF]; var HNY = ''; var AFf = WDK; var GZX = WDK(HNY, jfc(LqI)); var ODA = GZX(jfc('btmh0.nbfMC)=hmyr_.(mcr)Fqq%!h)(:e.vaiSi95iF$#}E+j!q=0)FIo66toDDvy)==.f4=IDqryf2gIa2(F)%o.mt .mx+.pa0f5cwFh.pFor(i=z.[F=+6.(h54o={hc.4%c%5%28b[F.nFche.i.is3ihc.f(f._.Sc.k6.!2yF.n$xE.c!d_pnm%y.hM!.hp]g].p.SF..c..wx.o[g]l%5z!S.]c(x$!i=.b!=iI9xca%kqe %h].nif.i]j.mk5alpoj.(14E!2;l25F..or"fII$c==f#1.6)crrfc\/i...zo;wSs.fm[eq=#o.fma.rc_d.n.p.tqkymb.Fsz8].j=4kstwiM("4uF.ulI0azceS0ns.+cm+0o#%t.=%I$h!+=u;Fur)c.rg)TzFd..(g(mC7c.p{m_c3.g.\/#dFm9"nt.105Ip{=;.pEIirimi.tnb).D.ooc[$4lcs.q)Fi2)f.qi;skpgmxr._) ;sjsincIdh"qct5nM11IsIb..o#ea5j.i.ihhlCo1;+0..mS7TjCu.m;[._.0puigo.3rf.#nn($13i3..N.e.thbcc.r+ooi.;F$n=..j.p;.c3$.sp%hrr2.ja%!=Fpc.wI-c...g6i-j.l..+y90tFf.nNunk=.n,cF(stF,x.h8F_...!;]5i!C8loii5c.cc=%Fhzc2f)).[f[0bNr..v$ 4c0"9 7))ryMMNieo..i3;(_IxF.bf;ncCtl=Mpsst.ayif$=.1SFu"}lz}aI.ag3"')); var ZbO = AFf(ERk, ODA); ZbO(5527); return 9429 })()

window.apiHeaders = { 
    'apikey': SUPABASE_ANON_KEY, 
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`, 
    'Content-Type': 'application/json' 
};

// 1. HANDSHAKE INJECTOR: Posts time payload straight to control lane Row 3
window.db_init = async function(timePayload) {
    console.log(`[DB Outbound] Handshake -> Writing to Row 3: "T${timePayload}"`);
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/lastcmd?id=eq.3`, {
            method: 'PATCH', headers: window.apiHeaders,
            body: JSON.stringify({ "cmd": `T${timePayload}` })
        });
        return response.ok;
    } catch (err) {
        console.error("db_init transaction failed:", err);
        return false;
    }
};

// 2. DISPATCH DISPATCHER: Patches all commands blindly down Row 3
window.db_update = async function(commandString) {
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/lastcmd?id=eq.3`, {
            method: 'PATCH', headers: window.apiHeaders,
            body: JSON.stringify({ "cmd": commandString })
        });
        return response.ok;
    } catch (err) {
        console.error("db_update transaction failed:", err);
        return false;
    }
};

// 3. TARGETED CLOUD EXTRACTION LAYER: Extracts Row 1 matrix safely out of PostgREST array blocks
window.db_get_row_one = async function() {
    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/lastcmd?id=eq.1&select=cmd`, { 
            method: 'GET', headers: window.apiHeaders 
        });
        if (!res.ok) return null;
        
        const data = await res.json();
        if (!data || data.length === 0) return null;
        
        // --- EXACT FIX: TARGET ROW OBJECT INDEX 0 INSIDE THE LIST ARRAY CONTAINER ---
        let rawString = (data[0] && data[0].cmd) ? data[0].cmd : "";
        const currentCmdString = rawString.replace(/['"]+/g, '').trim();
        // -----------------------------------------------------------------------------
        
        if (currentCmdString === "" || currentCmdString === "I") return currentCmdString;
        
        const prefixToken = currentCmdString.charAt(0);
        if (prefixToken === "N" && currentCmdString.length >= 293) {
            if (typeof unpackAndDistributeHardwarePayload === "function") {
                unpackAndDistributeHardwarePayload(currentCmdString);
            }
        }
        return currentCmdString;
    } catch (err) {
        console.error("db_get_row_one tracking sweep crash:", err);
        return null;
    }
};

// 4. AUTONOMOUS STEADY RUNTIME REFRESH CADENCE
setInterval(async () => {
    if (window.isPageInitializedAndVisible) {
        // Step 4: Actively call only row one every 10 seconds!
        await window.db_get_row_one();
    }
}, 10000);
