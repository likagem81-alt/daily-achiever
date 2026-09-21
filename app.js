const TASKS=[
["Ancient History","180 min"],["Geography","150 min"],["MCQ + PYQ Practice","90 min"],["Current Affairs","60 min"],["Revision","60 min"],["Test Analysis","30 min"],["Daily Achievement","30 min"]
];
const $=id=>document.getElementById(id);
let mode="login", user=null;
function key(k){return `da3_${user}_${k}`}
function load(k,f){try{return JSON.parse(localStorage.getItem(key(k)))??f}catch{return f}}
function save(k,v){localStorage.setItem(key(k),JSON.stringify(v))}
function initTasks(){
 const box=$("tasks");box.innerHTML="";
 TASKS.forEach((t,i)=>{let row=document.createElement("label");row.className="task";
 let checked=load("tasks",{})[new Date().toISOString().slice(0,10)]?.includes(i);
 row.innerHTML=`<input type="checkbox" ${checked?"checked":""}><span>${t[0]}</span><small>${t[1]}</small>`;
 row.querySelector("input").onchange=()=>{let d=load("tasks",{}),day=new Date().toISOString().slice(0,10),arr=d[day]||[];checked=row.querySelector("input").checked;if(checked&&!arr.includes(i))arr.push(i);if(!checked)arr=arr.filter(x=>x!==i);d[day]=arr;save("tasks",d);row.classList.toggle("done",checked);refresh();};row.classList.toggle("done",checked);box.appendChild(row);
 });
}
function tests(){return load("tests",[])}
function refresh(){
 let arr=load("tasks",{})[new Date().toISOString().slice(0,10)]||[], pct=Math.round(arr.length/TASKS.length*100);
 $("todayProgress").textContent=pct+"%";$("taskPct").textContent=pct+"%";
 let mins=arr.reduce((s,i)=>s+parseInt(TASKS[i][1]),0);$("studyTime").textContent=mins>=60?`${Math.floor(mins/60)}h ${mins%60}m`:`${mins}m`;
 let ts=tests(), correct=ts.reduce((s,t)=>s+Number(t.correct||0),0), attempted=ts.reduce((s,t)=>s+Number(t.attempted||0),0),acc=attempted?Math.round(correct/attempted*100):null;
 $("testCount").textContent=ts.length;$("accuracy").textContent=acc===null?"—":acc+"%";
 $("pTests").textContent=ts.length;$("pAccuracy").textContent=acc===null?"—":acc+"%";$("pNotes").textContent=load("notes",[]).length;$("pStreak").textContent=streak()+" days";
}
function streak(){let d=load("tasks",{}),n=0,dt=new Date();while(true){let k=dt.toISOString().slice(0,10),a=d[k]||[];if(a.length<3)break;n++;dt.setDate(dt.getDate()-1)}return n}
function renderTests(){
 let box=$("testHistory"),ts=tests();box.innerHTML=ts.length?"":"<div class='record'><p>No tests yet. Add your first MCQ/PYQ test above.</p></div>";
 ts.slice().reverse().forEach((t,idx)=>{let real=ts.length-1-idx,acc=t.attempted?Math.round(t.correct/t.attempted*100):0;
 let el=document.createElement("div");el.className="record";el.innerHTML=`<button class="delete">Delete</button><div class="record-head"><div><h3>${esc(t.topic||"Untitled Test")}</h3><small>${esc(t.date)} • ${esc(t.subject)}</small></div><span class="pill">${acc}% accuracy</span></div><p><b>${t.correct}</b> correct • <b>${t.wrong}</b> wrong • ${t.attempted}/${t.total} attempted</p>${t.learn?`<p><b>Learned:</b> ${esc(t.learn)}</p>`:""}${t.weak?`<p><b>Revise:</b> ${esc(t.weak)}</p>`:""}`;
 el.querySelector(".delete").onclick=()=>{ts.splice(real,1);save("tests",ts);renderTests();refresh();renderProgress()};box.appendChild(el)})
}
function renderNotes(){
 let box=$("notesList"),ns=load("notes",[]);box.innerHTML=ns.length?"":"<div class='record'><p>No notes yet. Save your first study note.</p></div>";
 ns.slice().reverse().forEach((n,idx)=>{let real=ns.length-1-idx,el=document.createElement("div");el.className="record";el.innerHTML=`<button class="delete">Delete</button><span class="pill">${esc(n.subject)}</span><h3>${esc(n.title)}</h3><small>${esc(n.date)}</small><p>${esc(n.body).replace(/\n/g,"<br>")}</p>`;el.querySelector(".delete").onclick=()=>{ns.splice(real,1);save("notes",ns);renderNotes();refresh();renderProgress()};box.appendChild(el)})
}
function renderProgress(){let ts=tests();$("recentPerformance").innerHTML=ts.length?ts.slice(-5).reverse().map(t=>{let a=t.attempted?Math.round(t.correct/t.attempted*100):0;return `<div class='task'><span>${esc(t.topic)}</span><small>${esc(t.date)} • ${a}%</small></div>`}).join(""):"<p>No test data yet.</p>"}
function esc(s=""){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function show(v){document.querySelectorAll(".view").forEach(x=>x.classList.add("hidden"));$(v).classList.remove("hidden");document.querySelectorAll("nav button").forEach(b=>b.classList.toggle("active",b.dataset.view===v));if(v==="tests")renderTests();if(v==="notes")renderNotes();if(v==="progress")renderProgress();refresh()}
function login(){
 let email=$("email").value.trim().toLowerCase(),pass=$("password").value;
 if(!email||!pass){$("authMsg").textContent="Enter email and password.";return}
 let users=JSON.parse(localStorage.getItem("da3_users")||"{}");
 if(mode==="create"){if(users[email]){$("authMsg").textContent="Account already exists.";return}users[email]=pass;localStorage.setItem("da3_users",JSON.stringify(users));}
 else if(users[email]!==pass){$("authMsg").textContent="Incorrect login details. Create an account first.";return}
 user=email;localStorage.setItem("da3_current",email);$("loginScreen").classList.add("hidden");$("app").classList.remove("hidden");$("achievement").value=load("achievement","");initTasks();refresh();
}
document.querySelectorAll(".tab").forEach(b=>b.onclick=()=>{mode=b.dataset.auth;document.querySelectorAll(".tab").forEach(x=>x.classList.toggle("active",x===b));$("authBtn").textContent=mode==="login"?"Login":"Create Account";$("authMsg").textContent=""});
$("authBtn").onclick=login;
document.querySelectorAll("nav button").forEach(b=>b.onclick=()=>show(b.dataset.view));
$("logout").onclick=()=>{localStorage.removeItem("da3_current");location.reload()};
$("saveAchievement").onclick=()=>{save("achievement",$("achievement").value);alert("Achievement saved ✓")};
$("saveTest").onclick=()=>{let ts=tests(),t={date:$("tDate").value||new Date().toISOString().slice(0,10),subject:$("tSubject").value,topic:$("tTopic").value,total:+$("tTotal").value||0,attempted:+$("tAttempted").value||0,correct:+$("tCorrect").value||0,wrong:+$("tWrong").value||0,learn:$("tLearn").value,weak:$("tWeak").value};if(!t.topic){alert("Enter test/topic.");return}ts.push(t);save("tests",ts);["tTopic","tTotal","tAttempted","tCorrect","tWrong","tLearn","tWeak"].forEach(x=>$(x).value="");renderTests();refresh();alert("Test saved ✓")};
$("saveNote").onclick=()=>{let ns=load("notes",[]),n={title:$("nTitle").value,subject:$("nSubject").value,body:$("nBody").value,date:new Date().toLocaleDateString("en-IN")};if(!n.title||!n.body){alert("Enter title and note.");return}ns.push(n);save("notes",ns);$("nTitle").value="";$("nBody").value="";renderNotes();refresh();alert("Note saved ✓")};
$("themeBtn").onclick=()=>{document.body.classList.toggle("dark");localStorage.setItem("da3_dark",document.body.classList.contains("dark"))};
if(localStorage.getItem("da3_dark")==="true")document.body.classList.add("dark");

function normalizeImported(x){
  return {
    date:x.date||new Date().toISOString().slice(0,10),
    subject:x.subject||"Mixed GS",
    topic:x.topic||"Imported Test",
    total:Number(x.total||0),
    attempted:Number(x.attempted||0),
    correct:Number(x.correct||0),
    wrong:Number(x.wrong||0),
    learn:x.learn||x.whatDidILearn||"",
    weak:x.weak||x.weakAreas||""
  };
}
function importResults(data){
  let incoming=Array.isArray(data)?data:(Array.isArray(data.tests)?data.tests:[data]);
  incoming=incoming.map(normalizeImported).filter(x=>x.topic);
  if(!incoming.length){alert("No valid test result found.");return}
  let ts=tests(); ts.push(...incoming); save("tests",ts);
  renderTests(); refresh(); renderProgress();
  alert(`${incoming.length} test result${incoming.length>1?"s":""} imported ✓`);
}
$("importBtn").onclick=()=>$("importFile").click();
$("importFile").onchange=async e=>{
  const f=e.target.files[0]; if(!f)return;
  try{const text=await f.text(); importResults(JSON.parse(text))}
  catch{alert("Invalid import file. Use the JSON template.")}
  e.target.value="";
};
$("downloadTemplate").onclick=()=>{
 const example={tests:[{date:new Date().toISOString().slice(0,10),subject:"Geography",topic:"Plate Tectonics",total:35,attempted:35,correct:30,wrong:5,learn:"Plate boundaries and fold mountains",weak:"Transform boundaries"}]};
 const blob=new Blob([JSON.stringify(example,null,2)],{type:"application/json"});
 const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="daily_achiever_test_import.json";a.click();URL.revokeObjectURL(a.href);
};

let current=localStorage.getItem("da3_current");if(current){user=current;$("loginScreen").classList.add("hidden");$("app").classList.remove("hidden");$("achievement").value=load("achievement","");initTasks();refresh()}
$("tDate").value=new Date().toISOString().slice(0,10);
