(()=>{
const $=id=>document.getElementById(id); const key=k=>`da3_${localStorage.getItem("da3_current")||"guest"}_${k}`;
function save(k,v){localStorage.setItem(key(k),JSON.stringify(v))} function load(k,f){try{return JSON.parse(localStorage.getItem(key(k)))??f}catch{return f}}
function mount(){
 if(document.getElementById("studyCompanion") || document.querySelector(".executive-dashboard")) return;
 const dash=$("dashboard"); if(!dash) return;
 const wrap=document.createElement("div"); wrap.id="studyCompanion"; wrap.className="study-companion";
 wrap.innerHTML=`<div class="sc-card sc-timer"><div class="sc-head"><div><span class="sc-kicker">FOCUS SYSTEM</span><h3>Focus Timer</h3><div class="sc-muted">Automatic study → rest cycle • No Pause</div></div><strong id="scSession">Session 1</strong></div><div class="sc-mode"><span id="scStudyMode" class="active">Study · 25 min</span><span id="scRestMode">Rest · 5 min</span></div><div id="scClock" class="sc-clock">25:00</div><div id="scStatus" class="sc-status">Ready. Start your first focused session.</div><div class="sc-progress"><i id="scProgress"></i></div><div id="scTask" class="sc-note">Current focus: APSC preparation</div><div class="sc-actions"><button id="scStart" class="primary">Start Focus</button></div></div>
 <div><div class="sc-card"><div class="sc-head"><div><span class="sc-kicker">YOUR COMPANION</span><h3>APSC Buddy</h3></div><b id="scLevel">Level 1</b></div><div class="sc-pet"><div id="scPetIcon" class="sc-pet-icon">◈</div><div style="flex:1"><h4 id="scPetMsg">Stay consistent.</h4><div class="sc-muted">Focus XP <b id="scXp">0</b> / 100</div><div class="sc-bar"><i id="scXpBar"></i></div><div class="sc-muted" style="margin-top:8px">Streak <b id="scStreak">0 days</b></div></div></div></div>
 <div class="sc-card sc-journey"><div class="sc-head"><div><span class="sc-kicker">LONG-TERM VIEW</span><h3>My APSC Journey</h3></div><b id="scJourneyPct">0%</b></div><div class="sc-journey-line" id="scJourneyLine"></div><div class="sc-journey-stats"><div class="sc-mini"><span>Journey Time</span><b id="scJourneyDays">0 days</b></div><div class="sc-mini"><span>Focus Time</span><b id="scFocusTime">0m</b></div><div class="sc-mini"><span>Sessions</span><b id="scSessions">0</b></div></div><div class="sc-reminder" id="scReminder">Morning focus: start with one 25-minute block.</div></div></div>`;
 dash.appendChild(wrap); render();
}
const stages=["Foundation","Core Subjects","Practice","Revision","Mock Tests","APSC Goal"];
function state(){let s=load("companion",{xp:0,sessions:0,focusMinutes:0,journeyDays:0,startedAt:null,streak:0});if(!s.startedAt)s.startedAt=Date.now();s.journeyDays=Math.max(1,Math.floor((Date.now()-s.startedAt)/86400000)+1);return s}
let timer=null, phase="study", remaining=1500;
function render(){const s=state(); const level=Math.floor(s.xp/100)+1; $("scLevel").textContent="Level "+level; $("scXp").textContent=s.xp%100; $("scXpBar").style.width=(s.xp%100)+"%"; $("scStreak").textContent=s.streak+" days"; $("scSessions").textContent=s.sessions; $("scFocusTime").textContent=s.focusMinutes>=60?Math.floor(s.focusMinutes/60)+"h "+s.focusMinutes%60+"m":s.focusMinutes+"m"; $("scJourneyDays").textContent=s.journeyDays+" days"; const pct=Math.min(100,Math.round(s.sessions/60*100)); $("scJourneyPct").textContent=pct+"%"; if($("scJourneyLine")) $("scJourneyLine").dataset.progress=pct; if($("scPetIcon")) $("scPetIcon").dataset.level=level; const msgs=["Stay consistent. One session at a time.","Good morning. Start before motivation fades.","Strong work. Protect your focus.","Session complete. Take the break seriously.","Small disciplined steps build your APSC journey."]; $("scPetMsg").textContent=msgs[Math.min(msgs.length-1,s.sessions%msgs.length)]; $("scReminder").textContent=new Date().getHours()<9?"Good morning. Begin with one focused block.":new Date().getHours()>=22?"You've worked enough today. Rest and return tomorrow.":"Keep the next block simple: focus, finish, recover."}
function clock(){const m=Math.floor(remaining/60),sec=remaining%60;$("scClock").textContent=String(m).padStart(2,"0")+":"+String(sec).padStart(2,"0");$("scProgress").style.width=((phase==="study"?1500:300)-remaining)/(phase==="study"?1500:300)*100+"%";$("scStudyMode").classList.toggle("active",phase==="study");$("scRestMode").classList.toggle("active",phase==="rest")}
function start(){if(timer)return; $("scStart").disabled=true; $("scStart").textContent="Focus in progress"; $("scStatus").textContent=phase==="study"?"Focus. No pause.":"Rest. Reset your mind."; timer=setInterval(()=>{remaining--;clock();if(remaining<=0)finish()},1000)}
function finish(){clearInterval(timer);timer=null;const s=state(); if(phase==="study"){s.sessions++;s.xp+=25;s.focusMinutes+=25;save("companion",s);phase="rest";remaining=300;$("scStatus").textContent="Study complete. 5-minute rest starts now."; $("scTask").textContent="Rest: step away from the screen, breathe, hydrate."; $("scStart").textContent="Rest in progress"; $("scStart").disabled=true; setTimeout(()=>{if(!timer){timer=setInterval(()=>{remaining--;clock();if(remaining<=0)finish()},1000)}},50)}else{phase="study";remaining=1500;$("scStatus").textContent="Break complete. Next focus session starts automatically."; $("scTask").textContent="Current focus: APSC preparation"; $("scStart").disabled=true;$("scStart").textContent="Focus in progress"; clock(); setTimeout(()=>{if(!timer){timer=setInterval(()=>{remaining--;clock();if(remaining<=0)finish()},1000)}},700)} clock();render();}
function init(){mount();const b=$("scStart");if(b)b.onclick=start;clock();window.initStudyCompanion=()=>{mount();const x=$("scStart");if(x)x.onclick=start;clock();};}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();


function updateExecutiveClock(){
  const el=document.getElementById("execDate");
  if(!el) return;
  const d=new Date();
  const date=d.toLocaleDateString("en-IN",{weekday:"short",day:"2-digit",month:"short",year:"numeric"});
  const time=d.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",hour12:true});
  el.innerHTML=date+"<br><b>"+time+"</b>";
}
setInterval(updateExecutiveClock,1000);
document.addEventListener("DOMContentLoaded",updateExecutiveClock);
updateExecutiveClock();
