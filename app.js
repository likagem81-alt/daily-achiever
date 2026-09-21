const TASKS=[
{id:"ancient",name:"Ancient History — Main Study",mins:180},
{id:"geo",name:"Geography — Main Study",mins:150},
{id:"mcq",name:"MCQs + PYQs",mins:90},
{id:"ca",name:"Current Affairs",mins:60},
{id:"revision",name:"History + Geography Revision",mins:60},
{id:"recall",name:"Daily Revision + Recall",mins:30},
{id:"extra",name:"Extra Study",mins:60}
];
let mode="login";
const $=x=>document.getElementById(x), today=()=>new Date().toISOString().slice(0,10);
function accountKey(){return "da_account_"+localStorage.getItem("da_current")}
function user(){let x=localStorage.getItem(accountKey());return x?JSON.parse(x):null}
function saveUser(u){localStorage.setItem(accountKey(),JSON.stringify(u))}
function day(u){return u.days[today()]||{done:{},achievement:"",attempted:0,correct:0}}
function showApp(){ $("auth").classList.add("hidden");$("app").classList.remove("hidden");renderAll()}
$("loginTab").onclick=()=>{mode="login";$("loginTab").classList.add("active");$("registerTab").classList.remove("active");$("authSubmit").textContent="Login"}
$("registerTab").onclick=()=>{mode="register";$("registerTab").classList.add("active");$("loginTab").classList.remove("active");$("authSubmit").textContent="Create account"}
$("authForm").onsubmit=e=>{e.preventDefault();let email=$("email").value.trim().toLowerCase(),pass=$("password").value,key="da_account_"+email;
if(mode==="register"){if(localStorage.getItem(key)){$("authMsg").textContent="Account already exists.";return}localStorage.setItem(key,JSON.stringify({email,password:pass,days:{},tests:[],notes:[]}));localStorage.setItem("da_current",email);showApp()}
else{let a;try{a=JSON.parse(localStorage.getItem(key))}catch{}if(!a||a.password!==pass){$("authMsg").textContent="Incorrect email or password.";return}localStorage.setItem("da_current",email);showApp()}};
$("logout").onclick=()=>{localStorage.removeItem("da_current");location.reload()};
document.querySelectorAll(".nav").forEach(b=>b.onclick=()=>{document.querySelectorAll(".nav").forEach(x=>x.classList.remove("active"));b.classList.add("active");document.querySelectorAll(".view").forEach(v=>v.classList.add("hidden"));$(b.dataset.view).classList.remove("hidden");renderAll()});
function updateDay(fn){let u=user();let d=day(u);fn(d);u.days[today()]=d;saveUser(u);renderAll()}
function renderDashboard(){let u=user(),d=day(u);$("tasks").innerHTML=TASKS.map(t=>`<div class="task ${d.done[t.id]?"done":""}"><input type="checkbox" data-t="${t.id}" ${d.done[t.id]?"checked":""}><span class="task-name">${t.name}</span><span class="task-duration">${t.mins/60}h</span></div>`).join("");
document.querySelectorAll("[data-t]").forEach(x=>x.onchange=()=>updateDay(d=>d.done[x.dataset.t]=x.checked));
let mins=TASKS.reduce((s,t)=>s+(d.done[t.id]?t.mins:0),0),done=TASKS.filter(t=>d.done[t.id]).length,p=Math.min(100,Math.round(mins/540*100)),acc=d.attempted?Math.round(d.correct/d.attempted*100):0;
$("studyTime").textContent=`${Math.floor(mins/60)}h ${mins%60}m`;$("tasksDone").textContent=`${done} / ${TASKS.length}`;$("percent").textContent=p+"%";$("dashAccuracy").textContent=acc+"%";$("achievement").value=d.achievement||"";$("streak").textContent=streak(u)+" days";
$("saveAchievement").onclick=()=>updateDay(d=>d.achievement=$("achievement").value);
$("reset").onclick=()=>{if(confirm("Reset today's checklist?")){u.days[today()]={done:{},achievement:"",attempted:0,correct:0};saveUser(u);renderAll()}}}
function streak(u){let n=0,d=new Date();while(true){let k=d.toISOString().slice(0,10),x=u.days[k];if(!x||!Object.values(x.done||{}).some(Boolean))break;n++;d.setDate(d.getDate()-1)}return n}
function renderTests(){let u=user();$("testHistory").innerHTML=u.tests.length?u.tests.slice().reverse().map((t,i)=>`<div class="test-item"><button class="danger" data-deltest="${u.tests.length-1-i}">Delete</button><b>${t.name||"Untitled test"}</b><div class="meta">${t.date} • ${t.subject} • ${t.attempted}/${t.total} attempted</div><span class="score">${t.attempted?Math.round(t.correct/t.attempted*100):0}% accuracy</span><p><b>Learning:</b> ${esc(t.learned)}</p><p><b>Weak areas:</b> ${esc(t.weak)}</p></div>`).join(""):"<div class='empty'>No test records yet.</div>";
document.querySelectorAll("[data-deltest]").forEach(b=>b.onclick=()=>{u.tests.splice(+b.dataset.deltest,1);saveUser(u);renderAll()})}
function renderNotes(){let u=user();$("noteHistory").innerHTML=u.notes.length?u.notes.slice().reverse().map((n,i)=>`<div class="note-item"><button class="danger" data-delnote="${u.notes.length-1-i}">Delete</button><b>${esc(n.title)}</b><div class="meta">${esc(n.subject)} • ${n.date}</div><p>${esc(n.body)}</p></div>`).join(""):"<div class='empty'>No notes saved yet.</div>";document.querySelectorAll("[data-delnote]").forEach(b=>b.onclick=()=>{u.notes.splice(+b.dataset.delnote,1);saveUser(u);renderAll()})}
function renderProgress(){let u=user(),avg=u.tests.length?Math.round(u.tests.reduce((s,t)=>s+(t.attempted?t.correct/t.attempted:0),0)/u.tests.length*100):0;$("testCount").textContent=u.tests.length;$("avgAccuracy").textContent=avg+"%";$("noteCount").textContent=u.notes.length;$("progressStreak").textContent=streak(u)+" days";$("progressTests").innerHTML=u.tests.length?u.tests.slice(-8).reverse().map(t=>{let a=t.attempted?Math.round(t.correct/t.attempted*100):0;return `<div class="test-item"><b>${esc(t.name)}</b><div class="meta">${t.subject} • ${t.date}</div><div class="progressbar"><i style="width:${a}%"></i></div><small>${a}% accuracy</small></div>`}).join(""):"<div class='empty'>Add test results to see progress.</div>"}
function esc(s){return String(s||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
$("saveTest").onclick=()=>{let u=user();u.tests.push({date:$("testDate").value||today(),subject:$("testSubject").value,name:$("testName").value,total:+$("totalQ").value||0,attempted:+$("attempted").value||0,correct:+$("correct").value||0,wrong:+$("wrong").value||0,learned:$("learned").value,weak:$("weak").value});saveUser(u);clearTest();renderAll();alert("Test result saved.")};
function clearTest(){["testName","totalQ","attempted","correct","wrong","learned","weak"].forEach(id=>$(id).value="");$("testDate").value=today()}
$("clearTest").onclick=clearTest;$("newNote").onclick=()=>{["noteTitle","noteSubject","noteBody"].forEach(id=>$(id).value="")};
$("saveNote").onclick=()=>{let u=user();u.notes.push({date:today(),title:$("noteTitle").value,subject:$("noteSubject").value,body:$("noteBody").value});saveUser(u);$("newNote").click();renderAll();alert("Note saved.")};
function renderAll(){if(!user())return;renderDashboard();renderTests();renderNotes();renderProgress();if(!$("testDate").value)$("testDate").value=today()}
if(localStorage.getItem("da_current"))showApp();else $("auth").classList.remove("hidden");
