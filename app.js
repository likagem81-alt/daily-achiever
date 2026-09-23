const TASKS=[["Polity","120 min"],["History + Geography","120 min"],["MCQ + PYQ Practice","90 min"],["Current Affairs","60 min"],["Revision","60 min"],["Test Analysis","30 min"]];
const $=id=>document.getElementById(id);let user=localStorage.getItem("da4_current")||null,mode="login",timer={phase:"study",remaining:1500,running:false,session:1,focus:0,xp:0};
const today=()=>new Date().toISOString().slice(0,10),key=k=>"da4_"+user+"_"+k,load=(k,f)=>{try{return JSON.parse(localStorage.getItem(key(k)))??f}catch{return f}},save=(k,v)=>localStorage.setItem(key(k),JSON.stringify(v));
const esc=s=>String(s??"").replace(/[&<>"\x27]/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","\x27":"&#039;"}[m]));
function showPage(id){document.querySelectorAll(".page").forEach(p=>p.classList.toggle("active",p.id===id));document.querySelectorAll(".side-link").forEach(b=>b.classList.toggle("active",b.dataset.page===id));$("sidebar")?.classList.remove("open");if(id==="tests")renderTests();if(id==="notes")renderNotes();if(id==="progress")renderProgress()}
function challengeCheck(){const d=load("tasks",{}),a=d[today()]||[],r=load("rewards",{});if(a.length===TASKS.length&&!r[today()]){r[today()]="foundation";save("rewards",r);timer.xp+=100;timerSave()}}
function initTasks(){const d=load("tasks",{}),a=d[today()]||[];$("tasks").innerHTML=TASKS.map((t,i)=>'<label class="task '+(a.includes(i)?"done":"")+'"><input type="checkbox" data-task="'+i+'" '+(a.includes(i)?"checked":"")+'><span>'+t[0]+'</span><small>'+t[1]+'</small></label>').join("");document.querySelectorAll("[data-task]").forEach(cb=>cb.onchange=()=>{const x=load("tasks",{}),aa=x[today()]||[],i=+cb.dataset.task;if(cb.checked&&!aa.includes(i))aa.push(i);if(!cb.checked)x[today()]=aa.filter(v=>v!==i);else x[today()]=aa;save("tasks",x);challengeCheck();renderAll()})}
function tests(){return load("tests",[])}function accuracy(){const ts=tests(),a=ts.reduce((s,t)=>s+Number(t.attempted||0),0),c=ts.reduce((s,t)=>s+Number(t.correct||0),0);return a?Math.round(c/a*100):null}function streak(){let d=load("tasks",{}),n=0,dt=new Date();for(;;){if((d[dt.toISOString().slice(0,10)]||[]).length<3)break;n++;dt.setDate(dt.getDate()-1)}return n}
function renderRewards(){const r=load("rewards",{}),keys=Object.values(r),count=keys.length,levels=[{key:"foundation",icon:"🏛️",title:"Foundation Service",sub:"Daily discipline completed"},{key:"service",icon:"⚖️",title:"Public Service",sub:"5 challenges completed"},{key:"civil",icon:"📜",title:"Civil Service",sub:"10 challenges completed"},{key:"admin",icon:"🦁",title:"Administrative Officer",sub:"20 challenges completed"},{key:"acs",icon:"🏅",title:"ACS Aspirant",sub:"30 challenges completed"},{key:"champion",icon:"🏆",title:"Civil Service Champion",sub:"50 challenges completed"}];const n=count;const unlocked=levels.filter((x,i)=>n>=[1,5,10,20,30,50][i]);$("rewardCount").textContent=unlocked.length+" unlocked";$("rewardCabinet").innerHTML=levels.map((x,i)=>{const ok=n>=[1,5,10,20,30,50][i];return '<div class="reward-symbol '+(ok?"unlocked":"locked")+'"><span>'+x.icon+'</span><div><b>'+x.title+'</b><small>'+x.sub+'</small></div></div>'}).join("");const done=!!r[today()];$("challengeTitle").textContent=done?"Challenge completed ✓":"Complete all 6 study tasks";$("challengeText").textContent=done?"Reward unlocked — keep building your service journey.":"Finish today's plan to unlock a Civil Service reward.";$("challengeIcon").textContent=done?"🏆":"🏛️";$("challengeReward").textContent=done?"+100 XP · UNLOCKED":"+100 XP"}
function renderStats(){const a=load("tasks",{})[today()]||[],mins=a.reduce((s,i)=>s+parseInt(TASKS[i][1]),0),acc=accuracy();$("todayProgress").textContent=Math.round(a.length/TASKS.length*100)+"%";$("studyTime").textContent=mins>=60?Math.floor(mins/60)+"h "+mins%60+"m":mins+"m";$("testCount").textContent=tests().length;$("accuracy").textContent=acc==null?"—":acc+"%";$("pTests").textContent=tests().length;$("pAccuracy").textContent=acc==null?"—":acc+"%";$("pNotes").textContent=load("notes",[]).length;$("pStreak").textContent=streak()+" days"}
function renderTests(){const box=$("testHistory"),ts=tests();box.innerHTML="";if(!ts.length){box.innerHTML="<div class=\"empty\">No tests recorded yet.</div>";return}ts.slice().reverse().forEach((t,r)=>{const i=ts.length-1-r,a=t.attempted?Math.round(t.correct/t.attempted*100):0,el=document.createElement("div");el.className="record";el.innerHTML='<button class="delete" data-del="'+i+'"><\/button><div class="record-head"><div><h3>'+esc(t.topic)+'</h3><small>'+esc(t.date)+" · "+esc(t.subject)+'</small></div><span class="pill">'+a+'% accuracy</span></div><p>'+t.correct+" correct · "+t.wrong+" wrong · "+t.attempted+"/"+t.total+" attempted</p>"+(t.learn?"<p><b>Learned:</b> "+esc(t.learn)+"</p>":"")+(t.weak?"<p><b>Revise:</b> "+esc(t.weak)+"</p>":"");box.appendChild(el)});document.querySelectorAll("[data-del]").forEach(b=>b.onclick=()=>{const x=tests();x.splice(+b.dataset.del,1);save("tests",x);renderAll()})}
function renderNotes(){const box=$("notesList"),ns=load("notes",[]);box.innerHTML="";if(!ns.length){box.innerHTML="<div class=\"empty\">No notes saved yet.</div>";return}ns.slice().reverse().forEach((n,r)=>{const i=ns.length-1-r,el=document.createElement("div");el.className="record";el.innerHTML='<button class="delete" data-ndel="'+i+'">Delete</button><span class="pill">'+esc(n.subject)+'</span><h3>'+esc(n.title)+'</h3><small>'+esc(n.date)+'</small><p>'+esc(n.body).replace(/\n/g,"<br>")+"</p>";box.appendChild(el)});document.querySelectorAll("[data-ndel]").forEach(b=>b.onclick=()=>{const x=load("notes",[]);x.splice(+b.dataset.ndel,1);save("notes",x);renderAll()})}
function renderProgress(){const ts=tests();$("recentPerformance").innerHTML=ts.length?ts.slice(-6).reverse().map(t=>"<div class=\"perf-row\"><b>"+esc(t.topic)+"</b><span>"+esc(t.date)+" · "+(t.attempted?Math.round(t.correct/t.attempted*100):0)+"%</span></div>").join(""):"<p class=\"muted\">No test data yet.</p>"}
function timerLoad(){timer=load("timer",timer)}function timerSave(){save("timer",timer)}function fmt(s){return String(Math.floor(s/60)).padStart(2,"0")+":"+String(s%60).padStart(2,"0")}
function renderTimer(){const total=timer.phase==="study"?1500:300,p=Math.max(0,Math.min(100,(1-timer.remaining/total)*100));$("bigClock").textContent=fmt(timer.remaining);$("dashClock").textContent=fmt(timer.remaining);$("timerStatus").textContent=timer.running?(timer.phase==="study"?"Focus — stay with the work.":"Rest — recover, then return."):"Ready. Start when you are prepared.";$("dashTimerStatus").textContent=timer.running?(timer.phase==="study"?"Study block in progress.":"Rest period in progress."):"Ready for a focused session.";$("timerBar").style.width=p+"%";$("sessionNo").textContent=timer.session;$("timerPhase").textContent=timer.phase.toUpperCase();$("studyMode").classList.toggle("active",timer.phase==="study");$("restMode").classList.toggle("active",timer.phase==="rest");$("startTimer").textContent=timer.running?"Running":"Start Focus";$("xp").textContent=timer.xp;$("xpBar").style.width=(timer.xp%500)/5+"%";$("buddyLevel").textContent="Level "+(Math.floor(timer.xp/500)+1);$("focusTotal").textContent=timer.focus>=60?Math.floor(timer.focus/60)+"h "+timer.focus%60+"m":timer.focus+"m";$("sessionTotal").textContent=timer.session-1;const pct=Math.min(100,Math.floor(timer.xp/500*100));$("journeyOverall").textContent=pct+"%";$("journeyOverallBar").style.width=pct+"%";$("journeyBar").style.width=pct+"%";$("journeyPct").textContent=pct+"%"}
let tick=null;function startTimer(){if(timer.running)return;timer.running=true;timerSave();renderTimer();clearInterval(tick);tick=setInterval(()=>{timer.remaining--;if(timer.remaining<=0){if(timer.phase==="study"){timer.focus+=25;timer.xp+=25;timer.phase="rest";timer.remaining=300;timer.session++}else{timer.phase="study";timer.remaining=1500}timerSave()}renderTimer()},1000)}
function updateClock(){const d=new Date();$("liveDate").textContent=d.toLocaleString("en-IN",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"});$("heroDay").textContent=d.toLocaleDateString("en-IN",{weekday:"long",day:"2-digit",month:"long"});$("heroTime").textContent=d.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",second:"2-digit"})}
function seedEmergencyProvisionTestResult(){const ts=tests();const exists=ts.some(t=>t.topic==="Emergency Provisions — UPSC Prelims"&&t.date==="2026-09-23"&&Number(t.correct)===20&&Number(t.total)===20);if(exists)return;ts.push({date:"2026-09-23",subject:"Polity",topic:"Emergency Provisions — UPSC Prelims",total:20,attempted:20,correct:20,wrong:0,learn:"Strong command of Articles 352, 355, 356, 358, 359 and 360; National Emergency approval and duration; Article 19 limitation under Article 358; Articles 20 and 21 safeguards; President's Rule; Financial Emergency; 44th Amendment safeguards.",weak:"No major weakness identified. Maintain precision on Article 358 vs Article 359, the one-month approval rule for National Emergency, and the conditions for extending President's Rule beyond one year.",analysis:"20/20 correct. Key distinctions: Article 358 concerns Article 19 and applies only to Emergency on grounds of war or external aggression; Article 359 concerns the right to move courts for specified Fundamental Rights, while Articles 20 and 21 cannot be suspended; President's Rule is under Article 356 and Financial Emergency under Article 360."});save("tests",ts)}\nfunction seedGeomorphologyResult(){const ts=tests();const exists=ts.some(t=>t.topic==="Geomorphology — UPSC Prelims"&&t.date==="2026-09-22"&&Number(t.correct)===15&&Number(t.total)===20);if(exists)return;ts.push({date:"2026-09-22",subject:"Geography",topic:"Geomorphology — UPSC Prelims",total:20,attempted:19,correct:15,wrong:4,learn:"Strong on exfoliation, glacial landforms, karst topography, mass wasting, pediplanation, isostasy, deltas, base level, faulting and differential erosion.",weak:"Revise weathering vs erosion, knickpoints, meander erosion/deposition, and aeolian erosional vs depositional landforms. Q14 was skipped.",analysis:"Q1: Weathering is in-situ breakdown; transportation belongs to erosion. Q4: Knickpoint means an abrupt change in river gradient. Q5: Outer meander bank is erosional and inner bank is depositional. Q12: Barchan is a depositional wind landform; yardang is erosional."});save("tests",ts)}
function seedJainismResult(){const ts=tests();const exists=ts.some(t=>t.topic==="Jainism — UPSC Prelims"&&t.date==="2026-09-22"&&Number(t.correct)===18&&Number(t.total)===20);if(exists)return;ts.push({date:"2026-09-22",subject:"History",topic:"Jainism — UPSC Prelims",total:20,attempted:20,correct:18,wrong:2,learn:"Strong on Tirthankaras, Mahavratas, Triratna, Anekantavada, Syadvada, Jainism vs Buddhism, Jiva/Ajiva and Moksha.",weak:"Revise Jain metaphysics: Jiva vs Ajiva, Pudgala, karmic matter and Jain cosmology."});save("tests",ts)}
function seedWeatheringNotes(){const ns=load("notes",[]);const title="Weathering — UPSC/APSC Notes";if(ns.some(n=>n.title===title))return;ns.push({title:title,subject:"Geography",date:"22/09/2026",body:`DEFINITION
Weathering is the in-situ disintegration or decomposition of rocks at or near the Earth's surface without transportation of the weathered material.

1. TYPES OF WEATHERING
A. PHYSICAL / MECHANICAL
• Frost action / freeze-thaw: Water enters cracks, freezes, expands and widens cracks. Water expands by about 9% on freezing.
• Exfoliation: Onion-skin peeling of rock layers; commonly linked with unloading/pressure release and thermal expansion, especially in massive rocks such as granite.
• Salt weathering: Saline water enters pores; evaporation causes salt-crystal growth and pressure. Common in arid and semi-arid regions.

B. CHEMICAL
• Solution: Minerals dissolve directly in water.
• Carbonation: CO2 + H2O forms weak carbonic acid; important in limestone and karst regions.
• Oxidation: Oxygen reacts with iron-bearing minerals, producing oxides/rusting.
• Hydration: Minerals absorb water, causing expansion or structural change.
• Hydrolysis: Water reacts with minerals such as feldspar and may produce clay minerals.

C. BIOLOGICAL
• Root wedging: Plant roots enter cracks and widen them.
• Burrowing animals: Disturb and loosen rock/material.
• Lichens and microorganisms: Produce organic acids and aid chemical weathering.

2. FACTORS CONTROLLING WEATHERING
Climate • Rock type • Organisms • Topography/relief • Time
Mnemonic: C-R-O-T-T

3. CLIMATE AND WEATHERING
• Warm + humid → strong chemical weathering.
• Cold environments with freeze-thaw → strong mechanical weathering.
• Hot + dry → physical weathering and salt weathering are important.
• Humid tropical regions → intense chemical weathering.
• High mountains → freeze-thaw action is important.

4. WEATHERING vs EROSION
Weathering = breakdown/alteration in place; transportation is not required.
Erosion = removal and transportation by rivers, wind, glaciers, waves, etc.
Golden line: "Weathering prepares material; erosion removes and transports it."

5. UPSC TRAPS
• Weathering involves transportation → FALSE.
• Chemical weathering is strongest in cold/dry climates → FALSE.
• Freeze-thaw is a chemical process → FALSE.
• Carbonation is important in limestone/karst regions → TRUE.
• Biological weathering is always purely physical → FALSE.

6. QUICK REVISION
Frost action → freezing + expansion
Exfoliation → unloading / thermal expansion
Salt weathering → crystal growth
Carbonation → limestone / karst
Oxidation → iron / rusting
Hydrolysis → feldspar / clay
Chemical weathering → warm + humid
Weathering → no transportation

PRELIMS MEMORY: Physical = frost, exfoliation, salt | Chemical = solution, carbonation, oxidation, hydration, hydrolysis | Biological = roots, burrowing, lichens.`});save("notes",ns)}
function seedWeatheringTestResult(){const ts=tests();const exists=ts.some(t=>t.topic==="Weathering — UPSC/APSC Concept Test"&&t.date==="2026-09-22"&&Number(t.correct)===19);if(exists)return;ts.push({date:"2026-09-22",subject:"Geography",topic:"Weathering — UPSC/APSC Concept Test",total:20,attempted:20,correct:19,wrong:1,learn:"Strong understanding of physical, chemical and biological weathering; frost action; exfoliation; salt weathering; carbonation; oxidation; hydrolysis; hydration; biological weathering; climate controls; and weathering vs erosion.",weak:"Revise the complete carbonation chain: CO2 + H2O → carbonic acid → limestone dissolution → karst features. Q5 was the only error.",analysis:"Q5: Carbonation involves carbon dioxide dissolved in water forming weak carbonic acid; it is especially important in limestone regions and contributes to karst features. Correct answer: D (1, 2 and 3)."});save("tests",ts)}
function seedAeolianNotes(){const ns=load("notes",[]);const title="Aeolian Processes & Landforms — UPSC/APSC Notes";if(ns.some(n=>n.title===title))return;ns.push({title:title,subject:"Geography",date:"22/09/2026",body:`DEFINITION
Aeolian processes are the processes of erosion, transportation and deposition by wind. They are most effective in deserts, semi-arid regions and areas with sparse vegetation.

1. MAJOR AEOLIAN PROCESSES
A. Deflation
• Removal of loose particles by wind.
• Can produce deflation hollows.
• Memory: Deflation → removal.

B. Abrasion / Corrasion
• Wind-blown sand strikes and scrapes rock surfaces.
• Produces features such as yardangs and ventifacts.
• Memory: Abrasion → sand attacks rock.

C. Attrition
• Wind-transported particles collide with one another.
• Particles become smaller, smoother and more rounded.
• Memory: Attrition → particles attack each other.

2. AEOLIAN EROSIONAL LANDFORMS
Yardang
• Streamlined ridge formed mainly by wind erosion.
• Softer rocks are eroded faster while harder material remains.
• UPSC trap: Yardang = erosion, NOT deposition.
• Memory: Yardang = wind cuts.

Deflation Hollow
• Depression formed when wind removes loose surface material.
• Deflation hollow = erosional/removal feature.

Ventifact
• Rock polished, faceted or shaped by wind-driven sand abrasion.

3. AEOLIAN DEPOSITIONAL LANDFORMS
Sand Dunes
• Form when wind loses energy and deposits sand.

Barchan
• Crescent-shaped dune.
• Usually associated with relatively consistent wind direction and limited sand supply.
• Horns point downwind.
• Barchan = deposition.

Transverse Dunes
• Generally oriented roughly perpendicular to prevailing wind.
• Common where sand supply is abundant.

Longitudinal / Seif Dunes
• Long, narrow ridges generally aligned roughly parallel to prevailing wind.

Star Dunes
• Multi-armed dunes formed where winds come from several directions.

Loess
• Wind-deposited accumulation of fine silt.
• Can occur over large areas and contribute to fertile soils after soil development.
• Loess = fine wind-blown deposit.

4. EROSION vs DEPOSITION
Erosional: Deflation, Yardang, Ventifact, rock abrasion, Deflation hollow.
Depositional: Barchan, transverse dune, longitudinal/seif dune, star dune, Loess.

Golden line:
Yardang removes; Barchan builds.

5. THREE PROCESSES — DO NOT CONFUSE
Deflation = wind removes loose particles.
Abrasion = wind-blown sand erodes rock.
Attrition = wind-blown particles collide with each other.

Memory: D-A-A = Dust removed → Attack rock → Attack each other.

6. UPSC CONCEPTUAL TRAPS
• Yardangs are primarily depositional → FALSE.
• Barchans are formed by wind deposition → TRUE.
• Deflation involves removal of loose particles → TRUE.
• Attrition means wind-blown sand abrades rock → FALSE; that is abrasion/corrasion.
• Loess is predominantly wind-deposited fine sediment → TRUE.

7. 30-SECOND REVISION
AEOLIAN = WIND
Erosion: Deflation → Yardang → Ventifact
Deposition: Barchan → Dunes → Loess
Deflation = removes particles
Abrasion = sand attacks rock
Attrition = particles attack each other

HIGH-YIELD MEMORY
YARDANG = EROSION
BARCHAN = DEPOSITION
DEFLATION HOLLOW = EROSION
LOESS = DEPOSITION
ABRASION = ROCK
ATTRITION = PARTICLES`});save("notes",ns)}
function seedAeolianTestResult(){const ts=tests();const exists=ts.some(t=>t.topic==="Aeolian Processes & Landforms — UPSC/APSC Test"&&t.date==="2026-09-22"&&Number(t.correct)===20&&Number(t.total)===20);if(exists)return;ts.push({date:"2026-09-22",subject:"Geography",topic:"Aeolian Processes & Landforms — UPSC/APSC Test",total:20,attempted:20,correct:20,wrong:0,learn:"Excellent command of deflation, abrasion/corrasion, attrition, yardang, deflation hollow, ventifact, barchan, transverse dunes, longitudinal/seif dunes, star dunes, loess, and erosion vs deposition.",weak:"No major weakness identified in this test. Maintain retention through mixed Geomorphology tests and delayed revision.",analysis:"20/20 correct. All key Aeolian distinctions were correctly applied, including yardang = erosion, barchan = deposition, deflation = removal of loose particles, abrasion = sand attacking rock, and attrition = particles colliding with one another."});save("tests",ts)}
function renderAll(){initTasks();challengeCheck();renderStats();renderRewards();renderTests();renderNotes();renderProgress();renderTimer();$("currentBrief").value=load("brief","");$("journeyDays").textContent=Math.max(1,Math.floor((Date.now()-load("startDate",Date.now()))/86400000)+1)+" days"}
function openApp(){user=localStorage.getItem("da4_current");if(!user)return;$("loginScreen").classList.add("hidden");$("app").classList.remove("hidden");if(!load("startDate",null))save("startDate",Date.now());seedGeomorphologyResult();seedJainismResult();seedEmergencyProvisionTestResult();seedWeatheringNotes();seedWeatheringTestResult();seedAeolianNotes();seedAeolianTestResult();timerLoad();renderAll();updateClock();setInterval(updateClock,1000)}
document.querySelectorAll(".auth-tab").forEach(b=>b.onclick=()=>{mode=b.dataset.mode;document.querySelectorAll(".auth-tab").forEach(x=>x.classList.toggle("active",x===b));$("authBtn").textContent=mode==="login"?"Login":"Create Account";$("authMsg").textContent=""});
$("authBtn").onclick=()=>{const email=$("email").value.trim().toLowerCase(),pass=$("password").value;if(!email||!pass){$("authMsg").textContent="Enter email and password.";return}const users=JSON.parse(localStorage.getItem("da4_users")||"{}");if(mode==="create"){if(users[email]){$("authMsg").textContent="Account already exists.";return}users[email]=pass;localStorage.setItem("da4_users",JSON.stringify(users))}else if(users[email]!==pass){$("authMsg").textContent="Incorrect details. Create the account first.";return}localStorage.setItem("da4_current",email);openApp()};
document.querySelectorAll("[data-page]").forEach(b=>b.onclick=()=>showPage(b.dataset.page));$("logout").onclick=()=>{localStorage.removeItem("da4_current");location.reload()};$("mobileMenu").onclick=()=>$("sidebar").classList.toggle("open");$("startTimer").onclick=startTimer;
$("saveTest").onclick=()=>{const ts=tests(),t={date:$("tDate").value||today(),subject:$("tSubject").value,topic:$("tTopic").value.trim(),total:+$("tTotal").value||0,attempted:+$("tAttempted").value||0,correct:+$("tCorrect").value||0,wrong:+$("tWrong").value||0,learn:$("tLearn").value.trim(),weak:$("tWeak").value.trim()};if(!t.topic){alert("Enter the test/topic.");return}ts.push(t);save("tests",ts);["tTopic","tTotal","tAttempted","tCorrect","tWrong","tLearn","tWeak"].forEach(id=>$(id).value="");renderAll();alert("Test saved.")};
$("saveNote").onclick=()=>{const ns=load("notes",[]),n={title:$("nTitle").value.trim(),subject:$("nSubject").value,body:$("nBody").value.trim(),date:new Date().toLocaleDateString("en-IN")};if(!n.title||!n.body){alert("Enter a title and note.");return}ns.push(n);save("notes",ns);$("nTitle").value="";$("nBody").value="";renderAll();alert("Note saved.")};
$("saveBrief").onclick=()=>{save("brief",$("currentBrief").value);alert("Today’s brief saved.")};$("themeBtn").onclick=()=>{document.body.classList.toggle("dark");localStorage.setItem("da4_dark",document.body.classList.contains("dark")?"1":"0")};
$("resetTasks").onclick=()=>{if(confirm("Reset today’s tasks?")){const d=load("tasks",{});delete d[today()];save("tasks",d);renderAll()}};$("resetTimer").onclick=()=>{if(confirm("Clear timer data?")){timer={phase:"study",remaining:1500,running:false,session:1,focus:0,xp:0};timerSave();clearInterval(tick);renderAll()}};if(localStorage.getItem("da4_dark")==="1")document.body.classList.add("dark");$("tDate").value=today();openApp();