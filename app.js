const TASKS=[
 {id:"ancient",name:"Ancient History — Main Study",duration:150},
 {id:"geo",name:"Geography — Main Study",duration:120},
 {id:"mcq",name:"MCQs + PYQs",duration:90},
 {id:"ca",name:"Current Affairs",duration:60},
 {id:"revision",name:"History + Geography Revision",duration:30},
 {id:"dailyrev",name:"Daily Revision + Recall",duration:60},
 {id:"extra",name:"Extra Study",duration:60}
];

let mode="login";
const $=id=>document.getElementById(id);
const today=()=>new Date().toISOString().slice(0,10);
const userKey=()=>`da_user_${localStorage.getItem("da_current")||""}`;
function getUser(){try{return JSON.parse(localStorage.getItem(userKey()))||null}catch{return null}}
function saveUser(u){localStorage.setItem(userKey(),JSON.stringify(u))}
function blankDay(){return {date:today(),done:{},mcqAttempted:0,mcqCorrect:0,achievement:""}}

function showAuth(){ $("auth").classList.remove("hidden"); $("dashboard").classList.add("hidden"); }
function showDash(){ $("auth").classList.add("hidden"); $("dashboard").classList.remove("hidden"); render(); }

$("loginTab").onclick=()=>{mode="login";$("loginTab").classList.add("active");$("registerTab").classList.remove("active");$("authSubmit").textContent="Login";$("authMsg").textContent=""};
$("registerTab").onclick=()=>{mode="register";$("registerTab").classList.add("active");$("loginTab").classList.remove("active");$("authSubmit").textContent="Create account";$("authMsg").textContent=""};

$("authForm").onsubmit=e=>{
 e.preventDefault(); const email=$("email").value.trim().toLowerCase(), password=$("password").value;
 const key=`da_account_${email}`;
 if(mode==="register"){
   if(localStorage.getItem(key)){ $("authMsg").textContent="Account already exists. Please log in."; return; }
   localStorage.setItem(key,JSON.stringify({email,password,days:{}}));
   localStorage.setItem("da_current",email); showDash();
 }else{
   let a; try{a=JSON.parse(localStorage.getItem(key))}catch{}
   if(!a||a.password!==password){$("authMsg").textContent="Incorrect email or password.";return}
   localStorage.setItem("da_current",email);showDash();
 }
};

$("logout").onclick=()=>{localStorage.removeItem("da_current");showAuth()};

function getDay(){
 const u=getUser(); const d=u.days[today()]||blankDay(); if(d.date!==today())return blankDay(); return d;
}
function updateDay(fn){
 const email=localStorage.getItem("da_current"); const key=`da_account_${email}`; let u=JSON.parse(localStorage.getItem(key));
 u.days[today()]=fn(u.days[today()]||blankDay()); localStorage.setItem(key,JSON.stringify(u)); render();
}
function render(){
 const u=getUser(); if(!u)return;
 $("dateLabel").textContent=new Date().toLocaleDateString(undefined,{weekday:"short",day:"numeric",month:"short",year:"numeric"});
 const d=u.days[today()]||blankDay();
 $("tasks").innerHTML=TASKS.map(t=>`<div class="task ${d.done[t.id]?"done":""}">
   <input type="checkbox" ${d.done[t.id]?"checked":""} data-task="${t.id}">
   <span class="task-name">${t.name}</span><span class="task-duration">${t.duration/60} hr${t.duration===60?"":"s"}</span>
 </div>`).join("");
 document.querySelectorAll("[data-task]").forEach(x=>x.onchange=()=>updateDay(d=>({...d,done:{...d.done,[x.dataset.task]:x.checked}})));
 $("mcqAttempted").value=d.mcqAttempted||0;$("mcqCorrect").value=d.mcqCorrect||0;$("achievement").value=d.achievement||"";
 $("mcqAttempted").oninput=()=>updateDay(d=>({...d,mcqAttempted:+$("mcqAttempted").value||0}));
 $("mcqCorrect").oninput=()=>updateDay(d=>({...d,mcqCorrect:+$("mcqCorrect").value||0}));
 $("achievement").oninput=()=>updateDay(d=>({...d,achievement:$("achievement").value}));
 const done=TASKS.filter(t=>d.done[t.id]).length;
 const minutes=TASKS.reduce((s,t)=>s+(d.done[t.id]?t.duration:0),0);
 $("tasksDone").textContent=`${done} / ${TASKS.length}`;
 $("studyTotal").textContent=`${Math.floor(minutes/60)}h ${minutes%60}m`;
 const pct=Math.min(100,Math.round(minutes/540*100)); $("progressPercent").textContent=pct+"%";
 const a=+d.mcqAttempted||0,c=+d.mcqCorrect||0;$("accuracy").textContent=a?Math.round(c/a*100)+"%":"0%";
 $("streak").textContent=calcStreak(u)+" days";
 renderLog(u);
}
function calcStreak(u){
 let n=0, dt=new Date();
 while(true){let k=dt.toISOString().slice(0,10),d=u.days[k];if(!d||!Object.values(d.done||{}).some(Boolean))break;n++;dt.setDate(dt.getDate()-1)}return n;
}
function renderLog(u){
 const entries=Object.entries(u.days).sort((a,b)=>b[0].localeCompare(a[0])).slice(0,10);
 $("log").innerHTML=entries.length?entries.map(([date,d])=>{
   const mins=TASKS.reduce((s,t)=>s+(d.done?.[t.id]?t.duration:0),0);
   return `<div class="log-row"><strong>${date}</strong><span>${Math.floor(mins/60)}h ${mins%60}m</span><span>${d.mcqAttempted?Math.round(d.mcqCorrect/d.mcqAttempted*100):0}% MCQ</span></div>`
 }).join(""):`<div class="muted">Your completed days will appear here.</div>`;
}
$("resetToday").onclick=()=>{if(confirm("Reset today's checklist and results?"))updateDay(()=>blankDay())};

if(localStorage.getItem("da_current"))showDash();else showAuth();
