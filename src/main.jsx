import React,{useEffect,useMemo,useState} from "react";
import {createRoot} from "react-dom/client";
import {Search,BriefcaseBusiness,MapPin,Clock3,Code2,Plus,RefreshCw,Edit3,Trash2,X,ChevronRight,ArrowRight,Database,UploadCloud,CheckCircle2,AlertCircle,Menu,LayoutDashboard,ShieldCheck} from "lucide-react";
import "./styles.css";

const API="https://jobapp-backend-esk4.onrender.com";

async function api(path,options={}){
  const res=await fetch(API+path,{headers:{"Content-Type":"application/json",...(options.headers||{})},...options});
  const text=await res.text();
  let data=null; try{data=text?JSON.parse(text):null}catch{data=text}
  if(!res.ok) throw new Error(typeof data==="string"?data:`Request failed (${res.status})`);
  return data;
}

const empty={postId:"",postProfile:"",postDesc:"",reqExperience:0,postTechStack:[]};

function App(){
 const [jobs,setJobs]=useState([]),[loading,setLoading]=useState(true),[error,setError]=useState("");
 const [search,setSearch]=useState(""),[query,setQuery]=useState(""),[selected,setSelected]=useState(null);
 const [admin,setAdmin]=useState(false),[mobile,setMobile]=useState(false),[form,setForm]=useState(null);
 const [notice,setNotice]=useState(null),[busy,setBusy]=useState(false),[sort,setSort]=useState("default");

 const loadAll=async()=>{setLoading(true);setError("");try{setJobs(await api("/JobPosts")||[])}catch(e){setError(e.message)}finally{setLoading(false)}};
 useEffect(()=>{loadAll()},[]);
 const runSearch=async term=>{
   const t=term.trim(); if(!t){setQuery("");return loadAll()}
   setLoading(true);setError("");
   try{setJobs(await api("/search/"+encodeURIComponent(t))||[]);setQuery(t)}
   catch(e){setJobs([]);setError(e.message);setQuery(t)}
   finally{setLoading(false)}
 };
 const visible=useMemo(()=>{let a=[...jobs];if(sort==="title")a.sort((x,y)=>(x.postProfile||"").localeCompare(y.postProfile||""));if(sort==="low")a.sort((x,y)=>(x.reqExperience||0)-(y.reqExperience||0));if(sort==="high")a.sort((x,y)=>(y.reqExperience||0)-(x.reqExperience||0));return a},[jobs,sort]);
 const toast=(type,text)=>{setNotice({type,text});setTimeout(()=>setNotice(null),3500)};
 const save=async payload=>{
   setBusy(true);try{
    const isEdit=!!form?.editing;
    await api("/JobPost",{method:isEdit?"PUT":"POST",body:JSON.stringify({...payload,postId:Number(payload.postId),reqExperience:Number(payload.reqExperience),postTechStack:Array.isArray(payload.postTechStack)?payload.postTechStack:[]})});
    setForm(null);await loadAll();toast("ok",isEdit?"Job updated successfully":"Job added successfully");
   }catch(e){toast("error",e.message)}finally{setBusy(false)}
 };
 const remove=async job=>{
   if(!confirm(`Delete "${job.postProfile}"?`))return;
   setBusy(true);try{await api("/JobPost",{method:"DELETE",body:JSON.stringify(job)});await loadAll();toast("ok","Job deleted successfully")}catch(e){toast("error",e.message)}finally{setBusy(false)}
 };
 const seed=async()=>{
   setBusy(true);try{await api("/load",{method:"POST"});await loadAll();toast("ok","Sample jobs loaded successfully")}catch(e){toast("error",e.message)}finally{setBusy(false)}
 };

 return <div className="app">
  <header className="top"><div className="nav">
   <button className="brand" onClick={()=>{setAdmin(false);document.getElementById("home")?.scrollIntoView({behavior:"smooth"})}}><span><BriefcaseBusiness size={18}/></span>Job<span>App</span></button>
   <nav><button className={!admin?"active":""} onClick={()=>setAdmin(false)}>Find Jobs</button><button className={admin?"active":""} onClick={()=>setAdmin(true)}><ShieldCheck size={14}/> Manage</button></nav>
   <div className="right"><div className="live"><i/> API Online</div><button className="menu" onClick={()=>setMobile(!mobile)}><Menu/></button></div>
  </div></header>
  {mobile&&<div className="mobileNav"><button onClick={()=>{setAdmin(false);setMobile(false)}}>Find Jobs</button><button onClick={()=>{setAdmin(true);setMobile(false)}}>Manage Jobs</button></div>}

  {!admin?<main id="home">
   <section className="hero"><div className="heroIn">
    <div className="pill"><Code2 size={13}/> SKILL-FIRST JOB DISCOVERY</div>
    <h1>Find work that<br/><em>fits your skills.</em></h1>
    <p>Explore opportunities from your JobApp backend. Search job descriptions, inspect requirements, and discover the technology stack.</p>
    <form className="search" onSubmit={e=>{e.preventDefault();runSearch(search)}}><Search size={19}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search job descriptions or skills..."/>{search&&<button type="button" onClick={()=>{setSearch("");runSearch("")}}><X size={15}/></button>}<button className="go">Search <ArrowRight size={15}/></button></form>
    <div className="quick"><span>Try</span>{["Java","Spring Boot","React","Python"].map(x=><button key={x} onClick={()=>{setSearch(x);runSearch(x)}}>{x}</button>)}</div>
   </div></section>
   <section className="stats"><div><b>{loading?"—":visible.length}</b><small>{query?"Search results":"Available jobs"}</small></div><div><b>7</b><small>API operations</small></div><div><b>100%</b><small>Backend connected</small></div><div className="connected"><CheckCircle2 size={17}/> Spring Boot REST API</div></section>

   <section className="content">
    <div className="heading"><div><label>OPPORTUNITIES</label><h2>{query?`Results for “${query}”`:"Latest opportunities"}</h2><p>{loading?"Loading...":`${visible.length} role${visible.length===1?"":"s"} found`}</p></div><div className="sort">Sort <select value={sort} onChange={e=>setSort(e.target.value)}><option value="default">Default</option><option value="title">Title</option><option value="low">Experience ↑</option><option value="high">Experience ↓</option></select></div></div>
    {error&&<div className="error"><AlertCircle/><div><b>Backend request failed</b><p>{error}</p></div><button onClick={()=>query?runSearch(query):loadAll()}><RefreshCw size={14}/> Retry</button></div>}
    {loading?<Loading/>:visible.length===0?<div className="empty"><Search size={25}/><h3>No jobs found</h3><p>Try another keyword or view all opportunities.</p><button onClick={()=>{setSearch("");runSearch("")}}>View all jobs</button></div>:
    <div className="grid">{visible.map((j,i)=><Card key={j.postId??i} job={j} onOpen={()=>setSelected(j)}/>)}</div>}
   </section>
  </main>:
  <Admin jobs={jobs} onAdd={()=>setForm({...empty,editing:false})} onEdit={j=>setForm({...j,editing:true,postTechStack:j.postTechStack||[]})} onDelete={remove} onLoad={seed} busy={busy} refresh={loadAll}/>
  }

  <footer><div className="footBrand"><span><BriefcaseBusiness size={14}/></span>JobApp</div><p>Professional job discovery powered by your Spring Boot API.</p><small>© 2026 JobApp</small></footer>
  {selected&&<Details job={selected} close={()=>setSelected(null)}/>}
  {form&&<JobForm data={form} setData={setForm} close={()=>setForm(null)} save={save} busy={busy}/>}
  {notice&&<div className={"toast "+notice.type}>{notice.type==="ok"?<CheckCircle2/>:<AlertCircle/>}{notice.text}</div>}
 </div>
}

function Card({job,onOpen}){
 const tags=Array.isArray(job.postTechStack)?job.postTechStack:[];
 const initials=(job.postProfile||"Job").split(" ").slice(0,2).map(x=>x[0]).join("").toUpperCase();
 return <article className="card"><div className="logoBox">{initials}</div><div className="cardMain">
  <div className="cardTitle"><div><label>OPEN ROLE</label><h3>{job.postProfile||"Untitled role"}</h3></div><button onClick={onOpen}><ChevronRight/></button></div>
  <div className="meta"><span><BriefcaseBusiness size={13}/> JobApp</span><span><MapPin size={13}/> India · Flexible</span><span><Clock3 size={13}/> {job.reqExperience} years</span></div>
  <p>{job.postDesc||"No description provided."}</p>
  <div className="bottom"><div className="tags">{tags.map(t=><span key={t}>{t}</span>)}</div><button className="view" onClick={onOpen}>View details <ArrowRight size={14}/></button></div>
 </div></article>
}
function Details({job,close}){const tags=Array.isArray(job.postTechStack)?job.postTechStack:[];return <div className="overlay" onMouseDown={close}><div className="modal" onMouseDown={e=>e.stopPropagation()}><button className="close" onClick={close}><X/></button><div className="bigLogo">{(job.postProfile||"Job").slice(0,2).toUpperCase()}</div><label>JOB DETAILS</label><h2>{job.postProfile}</h2><div className="modalMeta"><BriefcaseBusiness size={14}/> JobApp <span>•</span><MapPin size={14}/> India · Flexible</div><div className="info"><div><small>Job ID</small><b>{job.postId}</b></div><div><small>Experience</small><b>{job.reqExperience} years</b></div></div><h4>Description</h4><p>{job.postDesc}</p><h4>Technology stack</h4><div className="tags modalTags">{tags.map(t=><span key={t}>{t}</span>)}</div><button className="darkBtn" onClick={close}>Close</button></div></div>}

function Admin({jobs,onAdd,onEdit,onDelete,onLoad,busy,refresh}){return <main className="admin"><div className="adminHero"><div><label>ADMINISTRATION</label><h1>Manage opportunities.</h1><p>Use the endpoints already implemented in your Spring Boot controller to create, update, delete and seed jobs.</p></div><button className="primary" onClick={onAdd}><Plus size={17}/> Add job</button></div><div className="adminTools"><div><Database size={18}/><div><b>Job inventory</b><span>{jobs.length} jobs currently returned by GET /JobPosts</span></div></div><div className="toolBtns"><button onClick={refresh}><RefreshCw size={14}/> Refresh</button><button onClick={onLoad} disabled={busy}><UploadCloud size={14}/> Load sample jobs</button></div></div><div className="tableWrap"><table><thead><tr><th>ID</th><th>ROLE</th><th>EXPERIENCE</th><th>TECH STACK</th><th>ACTION</th></tr></thead><tbody>{jobs.map(j=><tr key={j.postId}><td>#{j.postId}</td><td><b>{j.postProfile}</b><small>{j.postDesc}</small></td><td>{j.reqExperience} yrs</td><td><div className="tags">{(j.postTechStack||[]).slice(0,4).map(t=><span key={t}>{t}</span>)}</div></td><td><div className="actions"><button onClick={()=>onEdit(j)} title="Edit"><Edit3 size={15}/></button><button className="danger" onClick={()=>onDelete(j)} title="Delete"><Trash2 size={15}/></button></div></td></tr>)}</tbody></table>{!jobs.length&&<div className="tableEmpty">No jobs available.</div>}</div></main>}

function JobForm({data,setData,close,save,busy}){const [tech,setTech]=useState((data.postTechStack||[]).join(", "));const update=(k,v)=>setData({...data,[k]:v});return <div className="overlay" onMouseDown={close}><div className="formModal" onMouseDown={e=>e.stopPropagation()}><div className="formHead"><div><label>{data.editing?"EDIT JOB":"ADD JOB"}</label><h2>{data.editing?"Update opportunity":"Create opportunity"}</h2></div><button className="close" onClick={close}><X/></button></div><div className="formGrid"><label>Job ID<input type="number" value={data.postId} onChange={e=>update("postId",e.target.value)} disabled={data.editing}/></label><label>Required experience<input type="number" min="0" value={data.reqExperience} onChange={e=>update("reqExperience",e.target.value)}/></label></div><label>Job profile<input value={data.postProfile} onChange={e=>update("postProfile",e.target.value)} placeholder="e.g. Java Backend Developer"/></label><label>Job description<textarea rows="5" value={data.postDesc} onChange={e=>update("postDesc",e.target.value)} placeholder="Describe the role and requirements..."/></label><label>Technology stack <span className="hint">comma separated</span><input value={tech} onChange={e=>{setTech(e.target.value);update("postTechStack",e.target.value.split(",").map(x=>x.trim()).filter(Boolean))}} placeholder="Java, Spring Boot, MySQL"/></label><div className="formActions"><button onClick={close}>Cancel</button><button className="primary" disabled={busy||!data.postId||!data.postProfile} onClick={()=>save(data)}>{busy?"Saving...":data.editing?"Update job":"Add job"}</button></div></div></div>}

function Loading(){return <div className="loading"><div></div><h3>Loading opportunities</h3><p>Connecting to your backend...</p></div>}
createRoot(document.getElementById("root")).render(<App/>);
