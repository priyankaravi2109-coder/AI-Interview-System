import React,{useEffect,useRef,useState}from"react";
import{Navigate,Route,Routes,useNavigate,useParams}from"react-router-dom";
import api from"./services/api";
import{auth,admin,candidate,interview,coding,reports}from"./services/services";
import{useAuth}from"./context/AuthContext";
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-webgl";
import "@tensorflow/tfjs-backend-cpu";

const TEST_MODE=(import.meta.env.VITE_SECURE_MODE||"false").toLowerCase()!=="true";
const STAGES=["technical","coding","communication","behavioral","scenario"];

const stageName=s=>({
 technical:"Technical MCQ",
 coding:"Technical Coding",
 communication:"Communication",
 behavioral:"Behavioral",
 scenario:"Scenario-based"
}[s]||s);

async function ensureTensorflowBackend(){
 try{
  if(tf.getBackend()) return tf.getBackend();

  try{
   await tf.setBackend("webgl");
  }catch{
   await tf.setBackend("cpu");
  }

  await tf.ready();
  return tf.getBackend();
 }catch(e){
  throw new Error(
   `TensorFlow.js backend initialization failed: ${e.message||e}`
  );
 }
}

function Layout({title,children}){
 const{user,logout}=useAuth();

 return <div className="shell">
  <header className="topbar">
   <div className="brand">
    <div className="logo">AI</div>
    <div>
     <strong>InterviewOS</strong>
     <small>AI Interview & Assessment</small>
    </div>
   </div>

   {user&&
    <div className="userbar">
     <span>{user.email}</span>
     <b>{user.role}</b>
     <button className="ghost" onClick={logout}>Sign out</button>
    </div>
   }
  </header>

  <main>
   <div className="pageHead">
    <div>
     <span className="eyebrow">ASSESSMENT PLATFORM</span>
     <h1>{title}</h1>
    </div>

    {user&&<span className="liveDot">● Live workspace</span>}
   </div>

   {children}
  </main>
 </div>
}

function Login(){
 const{login}=useAuth();

 const[mode,setMode]=useState("candidate");
 const[form,setForm]=useState({email:"",password:""});
 const[setup,setSetup]=useState(false);
 const[setupForm,setSetupForm]=useState({
  email:"",
  setupCode:"",
  password:""
 });
 const[msg,setMsg]=useState("");
 const[busy,setBusy]=useState(false);

 const nav=useNavigate();

 async function go(e){
  e.preventDefault();
  setBusy(true);
  setMsg("");

  try{
   const u=await login(form);
   nav(u.role==="admin"?"/admin":"/candidate");
  }catch(x){
   const d=x.response?.data;

   if(d?.mustSetPassword){
    setMsg(
     "This candidate account is waiting for first-time password setup."
    );
   }else{
    setMsg(
     d?.message||"Login failed. Check your credentials."
    );
   }
  }finally{
   setBusy(false);
  }
 }

 async function setPw(e){
  e.preventDefault();
  setBusy(true);
  setMsg("");

  try{
   await auth.setPassword(setupForm);

   setMsg("Password created. You can now sign in.");

   setSetup(false);

   setForm({
    email:setupForm.email,
    password:""
   });
  }catch(x){
   setMsg(
    x.response?.data?.message||"Unable to create password."
   );
  }finally{
   setBusy(false);
  }
 }

 return <div className="loginPage">

  <section className="loginHero">
   <div className="heroBadge">
    AI-POWERED HIRING WORKSPACE
   </div>

   <h1>
    Structured interviews.<br/>
    <span>Evidence-based reports.</span>
   </h1>

   <p>
    Run configurable five-stage assessments with AI-assisted
    evaluation, coding, communication analysis, candidate
    verification and integrity monitoring.
   </p>

   <div className="featureRow">
    <span>✓ Five assessment stages</span>
    <span>✓ Live camera verification</span>
    <span>✓ HR decision dashboard</span>
   </div>
  </section>

  <section className="loginCard">

   <div className="loginTabs">
    <button
     className={mode==="admin"?"active":""}
     onClick={()=>{
      setMode("admin");
      setForm({
       email:"admin@aiinterview.com",
       password:"Admin@12345"
      });
      setMsg("");
     }}
    >
     Admin / HR
    </button>

    <button
     className={mode==="candidate"?"active":""}
     onClick={()=>{
      setMode("candidate");
      setForm({
       email:"",
       password:""
      });
      setMsg("");
     }}
    >
     Candidate
    </button>
   </div>

   {!setup?
    <>
     <div className="cardTitle">
      <span className="miniIcon">↪</span>

      <div>
       <h2>Welcome back</h2>

       <p>
        {mode==="admin"
         ?"Sign in to manage roles, assessments and reports."
         :"Sign in to your assigned assessment."
        }
       </p>
      </div>
     </div>

     <form className="form" onSubmit={go}>

      <label>
       Email

       <input
        type="email"
        required
        value={form.email}
        onChange={e=>
         setForm({
          ...form,
          email:e.target.value
         })
        }
        placeholder="you@company.com"
       />
      </label>

      <label>
       Password

       <input
        type="password"
        required
        value={form.password}
        onChange={e=>
         setForm({
          ...form,
          password:e.target.value
         })
        }
        placeholder="Enter password"
       />
      </label>

      <button
       className="primary wide"
       disabled={busy}
      >
       {busy?"Signing in…":"Sign in"}
      </button>

     </form>

     {mode==="candidate"&&
      <button
       className="linkBtn"
       onClick={()=>setSetup(true)}
      >
       First time? Create your password
      </button>
     }

     {mode==="admin"&&
      <div className="credentialBox">
       <b>Demo HR account</b>
       <span>admin@aiinterview.com</span>
       <span>Admin@12345</span>
      </div>
     }

    </>
    :
    <>
     <div className="cardTitle">
      <span className="miniIcon">✦</span>

      <div>
       <h2>Create candidate password</h2>
       <p>Use the setup code supplied by HR.</p>
      </div>
     </div>

     <form className="form" onSubmit={setPw}>

      <label>
       Email

       <input
        type="email"
        required
        value={setupForm.email}
        onChange={e=>
         setSetupForm({
          ...setupForm,
          email:e.target.value
         })
        }
       />
      </label>

      <label>
       Setup code

       <input
        required
        value={setupForm.setupCode}
        onChange={e=>
         setSetupForm({
          ...setupForm,
          setupCode:e.target.value
         })
        }
        placeholder="Example: A1B2C3D4E5"
       />
      </label>

      <label>
       New password

       <input
        type="password"
        minLength="8"
        required
        value={setupForm.password}
        onChange={e=>
         setSetupForm({
          ...setupForm,
          password:e.target.value
         })
        }
       />
      </label>

      <button
       className="primary wide"
       disabled={busy}
      >
       {busy?"Creating…":"Create password"}
      </button>

     </form>

     <button
      className="linkBtn"
      onClick={()=>setSetup(false)}
     >
      Back to sign in
     </button>
    </>
   }

   {msg&&<div className="alert">{msg}</div>}

  </section>
 </div>
}

const initialJob={
 title:"",
 description:"",
 requiredSkills:"Python, SQL",
 secondarySkills:"Git, REST APIs",
 experienceMin:0,
 experienceMax:"",
 technicalQuestionCount:5,
 codingQuestionCount:3,
 communicationQuestionCount:3,
 behavioralQuestionCount:3,
 scenarioQuestionCount:3,
 technicalPassScore:60,
 codingPassScore:60,
 communicationPassScore:60,
 behavioralPassScore:60,
 scenarioPassScore:60,
 durationMinutes:45,
 difficulty:"intermediate",
 passingScore:60,
 codingEnabled:true,
 sqlEnabled:true,
 debuggingEnabled:true,
 outputPredictionEnabled:true,
 communicationEnabled:true
};

function Admin(){

 const[data,setData]=useState(null);
 const[rows,setRows]=useState([]);
 const[job,setJob]=useState(initialJob);

 const[invite,setInvite]=useState({
  email:"",
  name:"",
  jobId:""
 });

 const[msg,setMsg]=useState("");
 const[busy,setBusy]=useState(false);
 const[section,setSection]=useState("overview");
 const[search,setSearch]=useState("");
 const[filter,setFilter]=useState("all");

 const load=async()=>{
  try{
   const[a,b]=await Promise.all([
    admin.dashboard(),
    admin.reports()
   ]);

   setData(a.data);
   setRows(b.data?.reports||[]);
  }catch(e){
   setMsg(
    e.response?.data?.message||
    "Unable to load admin data."
   );
  }
 };

 useEffect(()=>{
  load();
 },[]);

 const update=(k,v)=>
  setJob(x=>({
   ...x,
   [k]:v
  }));

 async function create(e){
  e.preventDefault();

  setBusy(true);
  setMsg("");

  const counts=STAGES.map(
   s=>Number(job[`${s}QuestionCount`]||0)
  );

  if(counts.reduce((a,b)=>a+b,0)<1){
   setMsg(
    "Add at least one question across the five stages."
   );
   setBusy(false);
   return;
  }

  try{

   const payload={
    ...job,
    questionCount:counts.reduce((a,b)=>a+b,0),

    requiredSkills:
     job.requiredSkills
      .split(",")
      .map(x=>x.trim())
      .filter(Boolean),

    secondarySkills:
     job.secondarySkills
      .split(",")
      .map(x=>x.trim())
      .filter(Boolean)
   };

   const r=await admin.createJob(payload);

   setInvite(x=>({
    ...x,
    jobId:String(r.data.job.id)
   }));

   setMsg(
    `Job #${r.data.job.id} created successfully.`
   );

   setJob(initialJob);

   await load();

  }catch(e){

   setMsg(
    e.response?.data?.message||
    "Job creation failed. Restart the backend and try again if the API was just changed."
   );

  }finally{
   setBusy(false);
  }
 }

 async function inviteCandidate(e){
  e.preventDefault();

  setBusy(true);

  try{

   const r=await admin.createCandidate(invite);

   setMsg(
    r.data.setupCode
     ?`Candidate invited. Setup code: ${r.data.setupCode}`
     :"Candidate invited successfully."
   );

   setInvite({
    email:"",
    name:"",
    jobId:""
   });

   await load();

  }catch(e){

   setMsg(
    e.response?.data?.message||
    "Invitation failed."
   );

  }finally{
   setBusy(false);
  }
 }

 async function status(id,value){

  try{

   await api.patch(
    `/admin/reports/${id}/selection`,
    {status:value}
   );

   setMsg(
    `HR decision updated to ${value.replaceAll("_"," ")}.`
   );

   await load();

  }catch(e){

   setMsg(
    e.response?.data?.message||
    "Unable to update HR status."
   );
  }
 }

 const filtered=rows.filter(r=>
  (filter==="all"||
   ((r.selection_status||"under_review")===filter))
  &&
  (
   (r.candidate_name||"")+" "+
   (r.candidate_email||"")+" "+
   (r.job_title||"")
  )
   .toLowerCase()
   .includes(search.toLowerCase())
 );

 const nav=[
  ["overview","Overview","⌂"],
  ["jobs","Jobs & assessments","▣"],
  ["candidates","Candidates","♙"],
  ["reports","Reports & decisions","◫"]
 ];

 return <div className="appShell">

  <aside className="sideNav">

   <div className="sideBrand">
    <div className="logo">AI</div>

    <div>
     <strong>InterviewOS</strong>
     <small>HR workspace</small>
    </div>
   </div>

   <div className="navGroup">
    {nav.map(([id,label,icon])=>
     <button
      key={id}
      className={
       section===id
        ?"navItem active"
        :"navItem"
      }
      onClick={()=>setSection(id)}
     >
      <span>{icon}</span>
      {label}
     </button>
    )}
   </div>

   <div className="sideBottom">

    <div className="sideStatus">
     <i/>
     System operational
     <small>API · Database · AI ready</small>
    </div>

    <button
     className="navItem"
     onClick={load}
    >
     ↻ Refresh data
    </button>

   </div>

  </aside>

  <div className="workspace">

   <header className="workspaceTop">

    <div>
     <span className="eyebrow">
      ASSESSMENT PLATFORM
     </span>

     <h1>
      {
       section==='overview'
        ?"HR Command Center"
        :section==='jobs'
        ?"Jobs & Assessments"
        :section==='candidates'
        ?"Candidate Pipeline"
        :"Reports & Decisions"
      }
     </h1>
    </div>

    <div className="topActions">

     <span className="liveDot">
      ● Live workspace
     </span>

     <span className="userChip">
      admin@aiinterview.com · Admin
     </span>

     <button
      className="ghost"
      onClick={()=>{
       localStorage.clear();
       location.href="/";
      }}
     >
      Sign out
     </button>

    </div>

   </header>

   {section==="overview"&&
    <>
     <div className="welcome">

      <div>
       <span className="eyebrow">
        TODAY'S WORKSPACE
       </span>

       <h2>
        Monitor your hiring pipeline in real time.
       </h2>

       <p>
        Jobs, assessments, candidates and HR decisions
        are separated into dedicated workspaces.
       </p>
      </div>

      <button
       className="primary"
       onClick={()=>setSection("jobs")}
      >
       ＋ Create assessment
      </button>

     </div>

     <div className="stats">

      <Stat
       label="Total interviews"
       value={data?.stats?.total??0}
       icon="◉"
      />

      <Stat
       label="Completed"
       value={data?.stats?.completed??0}
       icon="✓"
      />

      <Stat
       label="In progress"
       value={data?.stats?.in_progress??0}
       icon="◌"
      />

      <Stat
       label="Average score"
       value={`${data?.stats?.average_score??0}%`}
       icon="↗"
      />

     </div>

     <div className="overviewGrid">

      <section className="panel">

       <div className="panelHead">

        <div>
         <span className="eyebrow">
          PIPELINE
         </span>

         <h2>
          Recent candidate activity
         </h2>
        </div>

        <button
         className="linkBtn"
         onClick={()=>setSection("reports")}
        >
         View all →
        </button>

       </div>

       {rows.slice(0,5).map(r=>
        <CandidateMini
         key={r.interview_id}
         row={r}
        />
       )}

      </section>

      <section className="panel">

       <div className="panelHead">

        <div>
         <span className="eyebrow">
          OPEN ROLES
         </span>

         <h2>
          Assessment roles
         </h2>
        </div>

        <button
         className="linkBtn"
         onClick={()=>setSection("jobs")}
        >
         Manage →
        </button>

       </div>

       {(data?.jobs||[]).slice(0,5).map(j=>
        <div
         className="jobCard"
         key={j.id}
        >

         <div className="jobAvatar">
          {j.title?.slice(0,2).toUpperCase()}
         </div>

         <div>
          <b>{j.title}</b>

          <small>
           {j.candidate_count||0} candidates ·{" "}
           {j.completed_count||0} completed
          </small>
         </div>

         <span className="pill">
          {j.status||"open"}
         </span>

        </div>
       )}

      </section>

     </div>
    </>
   }

   {section==="jobs"&&
    <div className="contentGrid">

     <section className="panel">

      <div className="panelHead">

       <div>
        <span className="eyebrow">
         ROLE SETUP
        </span>

        <h2>
         Create a job & assessment
        </h2>

        <p>
         Build a five-stage assessment with configurable
         skills, difficulty, timing and pass criteria.
        </p>
       </div>

      </div>

      <form
       onSubmit={create}
       className="form"
      >

       <div className="formGrid two">

        <label>
         Job role

         <input
          required
          value={job.title}
          onChange={e=>
           update("title",e.target.value)
          }
          placeholder="e.g. Software Developer"
         />
        </label>

        <label>
         Minimum experience

         <input
          type="number"
          min="0"
          step=".5"
          value={job.experienceMin}
          onChange={e=>
           update("experienceMin",e.target.value)
          }
         />
        </label>

       </div>

       <label>
        Job description

        <textarea
         required
         value={job.description}
         onChange={e=>
          update("description",e.target.value)
         }
         placeholder="Responsibilities, technologies and expectations…"
        />
       </label>

       <div className="formGrid two">

        <label>
         Required skills

         <input
          value={job.requiredSkills}
          onChange={e=>
           update("requiredSkills",e.target.value)
          }
         />
        </label>

        <label>
         Additional skills

         <input
          value={job.secondarySkills}
          onChange={e=>
           update("secondarySkills",e.target.value)
          }
         />
        </label>

       </div>

       <div className="sectionLabel">
        Five-stage blueprint
       </div>

       <div className="stageConfig">

        {STAGES.map(s=>
         <div
          className="stageBox"
          key={s}
         >

          <b>{stageName(s)}</b>

          <small>
           {
            s==="technical"
             ?"MCQ"
             :s==="coding"
             ?"Code runner"
             :s==="communication"
             ?"Speech + transcript"
             :"AI evaluation"
           }
          </small>

          <label>
           Questions

           <input
            type="number"
            min="0"
            max="50"
            value={job[`${s}QuestionCount`]}
            onChange={e=>
             update(
              `${s}QuestionCount`,
              e.target.value
             )
            }
           />
          </label>

          <label>
           Pass %

           <input
            type="number"
            min="0"
            max="100"
            value={job[`${s}PassScore`]}
            onChange={e=>
             update(
              `${s}PassScore`,
              e.target.value
             )
            }
           />
          </label>

         </div>
        )}

       </div>

       <div className="formGrid three">

        <label>
         Time (min)

         <input
          type="number"
          min="5"
          max="180"
          value={job.durationMinutes}
          onChange={e=>
           update("durationMinutes",e.target.value)
          }
         />
        </label>

        <label>
         Difficulty

         <select
          value={job.difficulty}
          onChange={e=>
           update("difficulty",e.target.value)
          }
         >
          <option>beginner</option>
          <option>intermediate</option>
          <option>advanced</option>
          <option>expert</option>
         </select>
        </label>

        <label>
         Overall pass %

         <input
          type="number"
          min="0"
          max="100"
          value={job.passingScore}
          onChange={e=>
           update("passingScore",e.target.value)
          }
         />
        </label>

       </div>

       <div className="toggleRow">

        <span>
         <b>Testing mode</b>

         <small>
          Development mode permits tab switching and copy/paste.
         </small>
        </span>

        <span
         className={`modeBadge ${TEST_MODE?"test":"secure"}`}
        >
         {TEST_MODE?"TEST MODE":"SECURE MODE"}
        </span>

       </div>

       <button
        className="primary wide"
        disabled={busy}
       >
        {busy
         ?"Creating…"
         :"＋ Create job & assessment"
        }
       </button>

      </form>

     </section>

     <section className="panel">

      <div className="panelHead">

       <div>
        <span className="eyebrow">
         ACTIVE ROLES
        </span>

        <h2>
         Open roles
        </h2>
       </div>

      </div>

      {(data?.jobs||[]).map(j=>
       <div
        className="jobCard"
        key={j.id}
       >

        <div className="jobAvatar">
         {j.title?.slice(0,2).toUpperCase()}
        </div>

        <div>
         <b>
          #{j.id} {j.title}
         </b>

         <small>
          {j.candidate_count||0} candidates ·{" "}
          {j.completed_count||0} completed
         </small>
        </div>

        <span className="pill">
         {j.status||"open"}
        </span>

       </div>
      )}

     </section>

    </div>
   }

   {section==="candidates"&&
    <div className="contentGrid">

     <section className="panel">

      <div className="panelHead">

       <div>
        <span className="eyebrow">
         CANDIDATE ACCESS
        </span>

        <h2>
         Invite candidate
        </h2>

        <p>
         Generate a one-time setup code for a candidate.
        </p>
       </div>

      </div>

      <form
       onSubmit={inviteCandidate}
       className="form"
      >

       <label>
        Candidate name

        <input
         required
         value={invite.name}
         onChange={e=>
          setInvite({
           ...invite,
           name:e.target.value
          })
         }
        />
       </label>

       <label>
        Candidate email

        <input
         type="email"
         required
         value={invite.email}
         onChange={e=>
          setInvite({
           ...invite,
           email:e.target.value
          })
         }
        />
       </label>

       <label>
        Assign job

        <select
         required
         value={invite.jobId}
         onChange={e=>
          setInvite({
           ...invite,
           jobId:e.target.value
          })
         }
        >
         <option value="">
          Select job
         </option>

         {(data?.jobs||[]).map(j=>
          <option
           key={j.id}
           value={j.id}
          >
           #{j.id} — {j.title}
          </option>
         )}

        </select>

       </label>

       <button
        className="primary wide"
        disabled={busy}
       >
        ＋ Invite candidate
       </button>

      </form>

     </section>

     <section className="panel">

      <div className="panelHead">

       <div>
        <span className="eyebrow">
         PIPELINE
        </span>

        <h2>
         Candidate activity
        </h2>
       </div>

      </div>

      {rows.length
       ?rows.map(r=>
        <CandidateMini
         key={r.interview_id}
         row={r}
        />
       )
       :<div className="emptyBlock">
        No interview activity yet.
       </div>
      }

     </section>

    </div>
   }

   {section==="reports"&&
    <section className="panel">

     <div className="panelHead">

      <div>
       <span className="eyebrow">
        DECISION SUPPORT
       </span>

       <h2>
        Candidate reports
       </h2>

       <p>
        Review assessment evidence before recording an HR decision.
       </p>
      </div>

      <button
       className="secondary"
       onClick={load}
      >
       ↻ Refresh
      </button>

     </div>

     <div className="reportTools">

      <input
       placeholder="Search candidate, email or role…"
       value={search}
       onChange={e=>setSearch(e.target.value)}
      />

      <div className="filterTabs">

       {[
        ["all","All"],
        ["under_review","Pending"],
        ["selected","Selected"],
        ["not_selected","Rejected"],
        ["on_hold","On hold"]
       ].map(([v,l])=>
        <button
         key={v}
         className={filter===v?"active":""}
         onClick={()=>setFilter(v)}
        >
         {l}
        </button>
       )}

      </div>

     </div>

     <div className="reportGrid">

      {filtered.length
       ?filtered.map(r=>
        <ReportCard
         key={r.id||r.interview_id}
         row={r}
         onStatus={status}
        />
       )
       :<div className="emptyBlock">
        No candidates match this filter.
       </div>
      }

     </div>

    </section>
   }

   {msg&&
    <div className="alert toast">
     {msg}
    </div>
   }

  </div>
 </div>
}

function CandidateMini({row}){

 const status=row.selection_status||"under_review";

 return <div className="candidateMini">

  <div className="avatar">
   {(row.candidate_name||"?")
    .split(" ")
    .map(x=>x[0])
    .slice(0,2)
    .join("")
   }
  </div>

  <div className="miniMain">

   <b>
    {row.candidate_name||"Candidate"}
   </b>

   <small>
    {row.job_title} ·{" "}
    {row.interview_status||"pending"}
   </small>

  </div>

  <div className="miniScore">

   {row.overall_score==null
    ?"—"
    :`${row.overall_score}/100`
   }

   <small>
    {status.replaceAll("_"," ")}
   </small>

  </div>

 </div>
}

function ReportCard({row,onStatus}){

 const status=row.selection_status||"under_review";

 const scores=[
  ["T",row.technical_score],
  ["C",row.coding_score],
  ["Com",row.communication_score],
  ["B",row.behavioral_score],
  ["S",row.scenario_score]
 ].filter(x=>x[1]!=null);

 return <article className="reportCard">

  <div className="reportTop">

   <div className="avatar large">
    {(row.candidate_name||"?")
     .split(" ")
     .map(x=>x[0])
     .slice(0,2)
     .join("")
    }
   </div>

   <div>
    <h3>
     {row.candidate_name||"Candidate"}
    </h3>

    <p>
     {row.candidate_email} · {row.job_title}
    </p>
   </div>

   <span
    className={`statusBadge ${status}`}
   >
    {
     status==="under_review"
      ?"Pending review"
      :status.replaceAll("_"," ")
    }
   </span>

  </div>

  <div className="reportMetrics">

   <div>
    <small>Overall</small>
    <strong>
     {row.overall_score??0}
     <em>/100</em>
    </strong>
   </div>

   <div>
    <small>Integrity</small>
    <strong>
     {row.integrity_score??0}
     <em>/100</em>
    </strong>
   </div>

   <div>
    <small>Interview</small>
    <strong>
     {row.interview_status||"—"}
    </strong>
   </div>

   <div>
    <small>Verification</small>
    <strong>
     {row.verification_status||"—"}
    </strong>
   </div>

  </div>

  <div className="scoreLine">

   {scores.length
    ?scores.map(([k,v])=>
     <span key={k}>
      {k} <b>{v}</b>
     </span>
    )
    :<span>
     No stage scores recorded yet
    </span>
   }

  </div>

  <div className="decisionRow">

   <span>
    HR decision
   </span>

   <div>

    <button
     className="decisionBtn approve"
     onClick={()=>onStatus(row.id,"selected")}
    >
     ✓ Approve
    </button>

    <button
     className="decisionBtn hold"
     onClick={()=>onStatus(row.id,"on_hold")}
    >
     ◷ Hold
    </button>

    <button
     className="decisionBtn reject"
     onClick={()=>onStatus(row.id,"not_selected")}
    >
     × Reject
    </button>

   </div>

  </div>

 </article>
}

function Stat({label,value,icon}){

 return <div className="stat">

  <span className="statIcon">
   {icon}
  </span>

  <div>
   <small>{label}</small>
   <strong>{value}</strong>
  </div>

 </div>
}

function Candidate(){

 const[p,setP]=useState(null);
 const[jobs,setJobs]=useState([]);
 const[rs,setRs]=useState([]);

 const[form,setForm]=useState({
  name:"",
  phone:"",
  education:"",
  experienceYears:0,
  skills:"",
  technicalSkills:"",
  softSkills:"",
  certifications:""
 });

 const[msg,setMsg]=useState("");
 const[section,setSection]=useState("home");

 const load=()=>
  Promise.all([
   candidate.profile(),
   candidate.jobs(),
   reports.mine()
  ])
   .then(([a,b,c])=>{
    setP(a.data.profile);
    setJobs(b.data.jobs||[]);
    setRs(c.data.reports||[]);

    const x=a.data.profile||{};

    setForm({
     name:x.name||"",
     phone:x.phone||"",
     education:x.education||"",
     experienceYears:x.experience_years||0,
     skills:(x.skills||[]).join(", "),
     technicalSkills:(x.technical_skills||[]).join(", "),
     softSkills:(x.soft_skills||[]).join(", "),
     certifications:(x.certifications||[]).join(", ")
    });
   })
   .catch(e=>
    setMsg(
     e.response?.data?.message||
     "Unable to load workspace."
    )
   );

 useEffect(()=>{
  load();
 },[]);

 const nav=useNavigate();

 async function save(e){
  e.preventDefault();

  try{

   await candidate.update({
    ...form,

    skills:
     form.skills
      .split(",")
      .map(x=>x.trim())
      .filter(Boolean),

    technicalSkills:
     form.technicalSkills
      .split(",")
      .map(x=>x.trim())
      .filter(Boolean),

    softSkills:
     form.softSkills
      .split(",")
      .map(x=>x.trim())
      .filter(Boolean),

    certifications:
     form.certifications
      .split(",")
      .map(x=>x.trim())
      .filter(Boolean)
   });

   setMsg("Profile saved successfully.");

  }catch(e){

   setMsg(
    e.response?.data?.message||
    "Save failed."
   );
  }
 }

 async function resume(e){

  try{

   const r=await candidate.resume(
    e.target.files[0]
   );

   setP(r.data.profile);

   setMsg(
    "Resume uploaded and analyzed."
   );

  }catch(x){

   setMsg(
    x.response?.data?.message||
    "Resume upload failed."
   );
  }
 }

 async function photo(e){

  try{

   const r=await candidate.photo(
    e.target.files[0]
   );

   setP(r.data.profile);

   setMsg(
    "Verification photo registered."
   );

  }catch(x){

   setMsg(
    x.response?.data?.message||
    "Photo upload failed."
   );
  }
 }

 const navItems=[
  ["home","Overview","⌂"],
  ["assessments","My assessments","▣"],
  ["profile","Profile & resume","♙"],
  ["results","My results","◫"]
 ];

 const ready=
  jobs.filter(
   j=>j.interview_status!=="completed"
  ).length;

 return <div className="appShell">

  <aside className="sideNav candidateSide">

   <div className="sideBrand">

    <div className="logo">
     AI
    </div>

    <div>
     <strong>InterviewOS</strong>
     <small>Candidate workspace</small>
    </div>

   </div>

   <div className="navGroup">

    {navItems.map(([id,label,icon])=>
     <button
      key={id}
      className={
       section===id
        ?"navItem active"
        :"navItem"
      }
      onClick={()=>setSection(id)}
     >
      <span>{icon}</span>
      {label}
     </button>
    )}

   </div>

   <div className="sideBottom">

    <div className="sideStatus">
     <i/>
     Workspace ready

     <small>
      {ready} assessment
      {ready===1?"":"s"} available
     </small>
    </div>

    <button
     className="navItem"
     onClick={load}
    >
     ↻ Refresh
    </button>

   </div>

  </aside>

  <div className="workspace">

   <header className="workspaceTop">

    <div>

     <span className="eyebrow">
      CANDIDATE PORTAL
     </span>

     <h1>
      {
       section==="home"
        ?"Candidate overview"
        :section==="assessments"
        ?"My assessments"
        :section==="profile"
        ?"Profile & resume"
        :"My results"
      }
     </h1>

    </div>

    <div className="topActions">

     <span className="liveDot">
      ● Live workspace
     </span>

     <span className="userChip">
      {p?.email||"Candidate"} · Candidate
     </span>

     <button
      className="ghost"
      onClick={()=>{
       localStorage.clear();
       location.href="/";
      }}
     >
      Sign out
     </button>

    </div>

   </header>

   {section==="home"&&
    <>

     <div className="welcome">

      <div>

       <span className="eyebrow">
        WELCOME BACK
       </span>

       <h2>
        {p?.name||"Candidate"},
        {" "}your assessment journey is here.
       </h2>

       <p>
        Complete your profile, verify your identity
        and take assigned assessments from one workspace.
       </p>

      </div>

      {ready>0&&
       <button
        className="primary"
        onClick={()=>setSection("assessments")}
       >
        View assessments →
       </button>
      }

     </div>

     <div className="stats">

      <Stat
       label="Assigned"
       value={jobs.length}
       icon="▣"
      />

      <Stat
       label="Ready"
       value={ready}
       icon="→"
      />

      <Stat
       label="Completed"
       value={
        jobs.filter(
         j=>j.interview_status==="completed"
        ).length
       }
       icon="✓"
      />

      <Stat
       label="Reports"
       value={rs.length}
       icon="◫"
      />

     </div>

     <div className="overviewGrid">

      <section className="panel">

       <div className="panelHead">

        <div>

         <span className="eyebrow">
          NEXT STEP
         </span>

         <h2>
          Assessment readiness
         </h2>

        </div>

       </div>

       <div className="readiness">

        <Readiness
         ok={!!p?.name}
         label="Candidate profile"
        />

        <Readiness
         ok={!!p?.resume_path}
         label="Resume uploaded"
        />

        <Readiness
         ok={!!p?.profile_photo_path}
         label="Verification photo"
        />

        <Readiness
         ok={jobs.length>0}
         label="Assessment assigned"
        />

       </div>

      </section>

      <section className="panel">

       <div className="panelHead">

        <div>

         <span className="eyebrow">
          LATEST RESULT
         </span>

         <h2>
          Assessment reports
         </h2>

        </div>

        <button
         className="linkBtn"
         onClick={()=>setSection("results")}
        >
         View all →
        </button>

       </div>

       {rs[0]
        ?<ResultCard r={rs[0]}/>
        :<div className="emptyBlock">
         Your report will appear after an assessment is completed.
        </div>
       }

      </section>

     </div>

    </>
   }

   {section==="assessments"&&
    <section className="panel">

     <div className="panelHead">

      <div>

       <span className="eyebrow">
        ASSIGNED ASSESSMENTS
       </span>

       <h2>
        Available roles
       </h2>

       <p>
        Start only when your profile and verification
        requirements are ready.
       </p>

      </div>

     </div>

     {jobs.length===0
      ?<div className="emptyBlock">
       No assessment has been assigned yet.
      </div>

      :jobs.map(j=>
       <div
        className="assessmentCard interactive"
        key={j.id}
       >

        <div className="jobAvatar">
         {j.title?.slice(0,2).toUpperCase()}
        </div>

        <div className="assessmentInfo">

         <span className="pill">
          Assigned
         </span>

         <h3>
          {j.title}
         </h3>

         <small>
          {(j.required_skills||[]).join(" · ")}
         </small>

         <p>
          {j.interview_status==="completed"
           ?"Completed"
           :`Ready · Verification ${j.verification_status||"not started"}`
          }
         </p>

        </div>

        {j.interview_status!=="completed"
         ?<button
          className="primary"
          onClick={()=>
           nav(`/interview/${j.id}`)
          }
         >
          Start assessment →
         </button>

         :<span className="statusBadge selected">
          Completed
         </span>
        }

       </div>
      )
     }

    </section>
   }

   {section==="profile"&&
    <div className="contentGrid">

     <section className="panel">

      <div className="panelHead">

       <div>

        <span className="eyebrow">
         PROFILE
        </span>

        <h2>
         Your candidate profile
        </h2>

       </div>

      </div>

      <form
       onSubmit={save}
       className="form"
      >

       <div className="formGrid two">

        <label>
         Full name

         <input
          value={form.name}
          onChange={e=>
           setForm({
            ...form,
            name:e.target.value
           })
          }
         />
        </label>

        <label>
         Phone

         <input
          value={form.phone}
          onChange={e=>
           setForm({
            ...form,
            phone:e.target.value
           })
          }
         />
        </label>

       </div>

       <label>
        Education

        <input
         value={form.education}
         onChange={e=>
          setForm({
           ...form,
           education:e.target.value
          })
         }
        />
       </label>

       <label>
        Experience years

        <input
         type="number"
         min="0"
         step=".1"
         value={form.experienceYears}
         onChange={e=>
          setForm({
           ...form,
           experienceYears:e.target.value
          })
         }
        />
       </label>

       <label>
        Skills

        <input
         value={form.skills}
         onChange={e=>
          setForm({
           ...form,
           skills:e.target.value
          })
         }
        />
       </label>

       <div className="formGrid two">

        <label>
         Technical skills

         <input
          value={form.technicalSkills}
          onChange={e=>
           setForm({
            ...form,
            technicalSkills:e.target.value
           })
          }
         />
        </label>

        <label>
         Soft skills

         <input
          value={form.softSkills}
          onChange={e=>
           setForm({
            ...form,
            softSkills:e.target.value
           })
          }
         />
        </label>

       </div>

       <label>
        Certifications

        <input
         value={form.certifications}
         onChange={e=>
          setForm({
           ...form,
           certifications:e.target.value
          })
         }
        />
       </label>

       <button className="primary">
        Save profile
       </button>

      </form>

     </section>

     <section className="panel">

      <div className="panelHead">

       <div>

        <span className="eyebrow">
         DOCUMENTS
        </span>

        <h2>
         Verification & resume
        </h2>

       </div>

      </div>

      <div className="uploadStack">

       <label className="upload">

        <b>
         📷 Verification photo
        </b>

        <input
         type="file"
         accept="image/jpeg,image/png"
         onChange={photo}
        />

        <small>
         Used for the interview verification flow.
        </small>

       </label>

       <label className="upload">

        <b>
         📄 Resume
        </b>

        <input
         type="file"
         accept=".pdf,.doc,.docx,.txt,.md"
         onChange={resume}
        />

        <small>
         Resume information can be used for
         personalized interview questions.
        </small>

       </label>

      </div>

     </section>

    </div>
   }

   {section==="results"&&
    <section className="panel">

     <div className="panelHead">

      <div>

       <span className="eyebrow">
        MY RESULTS
       </span>

       <h2>
        Assessment reports
       </h2>

       <p>
        Results become available after your assessment is completed.
       </p>

      </div>

     </div>

     {rs.length
      ?rs.map(r=>
       <ResultCard
        key={r.id}
        r={r}
       />
      )
      :<div className="emptyBlock">
       No completed assessment reports yet.
      </div>
     }

    </section>
   }

   {msg&&
    <div className="alert toast">
     {msg}
    </div>
   }

  </div>
 </div>
}

function Readiness({ok,label}){

 return <div className="readinessItem">

  <span className={ok?"check ok":"check"}>
   {ok?"✓":"○"}
  </span>

  <b>{label}</b>

  <small>
   {ok?"Complete":"Needs attention"}
  </small>

 </div>
}


/* =========================================================
   CANDIDATE RESULT CARD
   ========================================================= */

function ResultCard({r}){

 const scores=[
  ["Technical",r.technical_score],
  ["Coding",r.coding_score],
  ["Communication",r.communication_score],
  ["Behavioral",r.behavioral_score],
  ["Scenario",r.scenario_score]
 ].filter(([,v])=>v!==null&&v!==undefined);

 return <div className="resultCard">

  <div className="reportTop">

   <div>

    <span className="eyebrow">
     {r.title}
    </span>

    <h3>
     Assessment report
    </h3>

    <p>
     Overall score{" "}
     <b>
      {r.overall_score??0}/100
     </b>
     {" · "}
     Integrity{" "}
     <b>
      {r.integrity_score??0}/100
     </b>
    </p>

   </div>

   <span className="statusBadge">
    {(r.selection_status||"under_review")
     .replaceAll("_"," ")
    }
   </span>

  </div>

  {scores.length>0&&
   <div className="candidateScoreGrid">

    {scores.map(([label,value])=>
     <div
      className="candidateScoreCard"
      key={label}
     >

      <span>
       {label}
      </span>

      <strong>
       {value}/100
      </strong>

      <div className="candidateScoreBar">
       <i
        style={{
         width:`${Math.max(
          0,
          Math.min(
           100,
           Number(value)||0
          )
         )}%`
        }}
       />
      </div>

     </div>
    )}

   </div>
  }

 </div>
}


/* =========================================================
   IDENTITY VERIFICATION
   ========================================================= */

function Verification({interviewId,onVerified}){

 const video=useRef(null);
 const canvas=useRef(null);

 const[stream,setStream]=useState(null);
 const[status,setStatus]=useState("Camera not started");
 const[busy,setBusy]=useState(false);
 const[error,setError]=useState("");

 useEffect(()=>
  ()=>stream?.getTracks().forEach(t=>t.stop()),
 [stream]
 );

 async function verify(){

  setBusy(true);
  setError("");

  try{

   await interview.verificationStart(
    interviewId
   );

   const s=
    await navigator.mediaDevices.getUserMedia({
     video:true,
     audio:false
    });

   setStream(s);

   video.current.srcObject=s;

   await new Promise(
    r=>setTimeout(r,1000)
   );

   const c=canvas.current;

   c.width=video.current.videoWidth;
   c.height=video.current.videoHeight;

   c.getContext("2d").drawImage(
    video.current,
    0,
    0
   );

   const data=
    c.toDataURL(
     "image/jpeg",
     .7
    );

   const hash=
    await crypto.subtle.digest(
     "SHA-256",
     new TextEncoder().encode(data)
    );

   const hex=[
    ...new Uint8Array(hash)
   ]
    .map(b=>b.toString(16).padStart(2,"0"))
    .join("");

   await ensureTensorflowBackend();

   const blazeface=
    await import("@tensorflow-models/blazeface");

   const model=
    await blazeface.load();

   const faces=
    await model.estimateFaces(
     video.current,
     false
    );

   if(faces.length!==1){
    throw new Error(
     "Exactly one face must be visible."
    );
   }

   await interview.verificationComplete({
    interviewId,
    status:"verified",
    similarity:.75,
    livePhotoHash:hex,
    note:
     "Local development verifier: camera presence + one visible face."
   });

   setStatus("Verified");

   onVerified();

  }catch(e){

   setError(
    e.response?.data?.message||
    e.message||
    "Camera verification failed"
   );

   setStatus("Verification failed");

  }finally{
   setBusy(false);
  }
 }

 return <div className="verifyPanel">

  <div className="verifyText">

   <span className="eyebrow">
    IDENTITY CHECK
   </span>

   <h2>
    Camera verification required
   </h2>

   <p>
    Your camera remains active during the assessment.
    In production, connect an approved identity-verification
    provider for biometric matching.
   </p>

   <div className="checkList">

    <span>
     ✓ Camera permission
    </span>

    <span>
     ✓ One visible face
    </span>

    <span>
     ✓ Verification event logged
    </span>

   </div>

  </div>

  <video
   ref={video}
   autoPlay
   muted
   playsInline
  />

  <canvas
   ref={canvas}
   hidden
  />

  <div className="verifyActions">

   <b>
    {status}
   </b>

   <button
    className="primary"
    disabled={busy}
    onClick={verify}
   >
    {busy
     ?"Verifying…"
     :"Start verification"
    }
   </button>

  </div>

  {error&&
   <div className="alert">
    {error}
   </div>
  }

 </div>
}


/* =========================================================
   LIVE CAMERA / INTEGRITY MONITOR
   ========================================================= */

function Monitor({interviewId,stage}){

 const video=useRef(null);
 const streamRef=useRef(null);

 const[faces,setFaces]=useState(0);
 const[status,setStatus]=useState("Starting camera…");

 useEffect(()=>{

  let stop=false;
  let timer=null;

  async function go(){

   try{

    const s=
     await navigator.mediaDevices.getUserMedia({
      video:true,
      audio:false
     });

    if(stop){
     return s
      .getTracks()
      .forEach(t=>t.stop());
    }

    streamRef.current=s;

    if(video.current){
     video.current.srcObject=s;
    }

    setStatus("Camera active");

    await ensureTensorflowBackend();

    const blazeface=
     await import("@tensorflow-models/blazeface");

    const model=
     await blazeface.load();

    timer=setInterval(
     async()=>{
      if(stop||!video.current)return;

      try{

       const f=
        await model.estimateFaces(
         video.current,
         false
        );

       setFaces(f.length);

       if(f.length===0){
        interview.integrity({
         interviewId,
         eventType:"face_not_detected",
         severity:"warning",
         details:{stage}
        });
       }

       if(f.length>1){
        interview.integrity({
         interviewId,
         eventType:"multiple_faces",
         severity:"critical",
         details:{
          stage,
          count:f.length
         }
        });
       }

      }catch{}

     },
     2500
    );

   }catch(e){

    setStatus("Camera unavailable");

    interview.integrity({
     interviewId,
     eventType:"camera_denied",
     severity:"critical",
     details:{
      stage,
      message:e.message
     }
    }).catch(()=>{});

   }
  }

  go();

  return()=>{
   stop=true;

   if(timer){
    clearInterval(timer);
   }

   streamRef.current
    ?.getTracks()
    .forEach(t=>t.stop());
  };

 },[interviewId,stage]);

 return <div className="monitor">

  <div className="cameraFrame">
   <video
    ref={video}
    autoPlay
    muted
    playsInline
   />
  </div>

  <div>
   <b>{status}</b>

   <small>
    Face monitor · {faces} detected
   </small>
  </div>

  <span
   className={`modeBadge ${TEST_MODE?"test":"secure"}`}
  >
   {TEST_MODE?"TEST":"SECURE"}
  </span>

 </div>
}


/* =========================================================
   INTERVIEW
   ========================================================= */

function Interview(){

 const{jobId}=useParams();

 const[id,setId]=useState(null);
 const[qs,setQs]=useState([]);
 const[idx,setIdx]=useState(0);

 const[answer,setAnswer]=useState("");
 const[followUp,setFollowUp]=useState("");
 const[followSaved,setFollowSaved]=useState(false);

 const[result,setResult]=useState("");
 const[code,setCode]=useState("");
 const[language,setLanguage]=useState("python");
 const[test,setTest]=useState([]);

 const[verified,setVerified]=useState(false);
 const[message,setMessage]=useState("");
 const[done,setDone]=useState(false);

 const[recording,setRecording]=useState(false);
 const[recordSeconds,setRecordSeconds]=useState(0);

 const nav=useNavigate();

 const recognition=useRef(null);
 const recordTimer=useRef(null);

 useEffect(()=>{

  interview.start(Number(jobId))
   .then(a=>{
    setId(a.data.interviewId);

    return interview.questions(
     a.data.interviewId
    );
   })
   .then(b=>{
    setQs(
     b.data.questions||[]
    );
   })
   .catch(e=>
    setMessage(
     e.response?.data?.message||
     "Unable to start assessment."
    )
   );

 },[jobId]);

 useEffect(()=>{

  if(!id)return;

  const handler=()=>{

   if(
    document.visibilityState==="hidden"&&
    !TEST_MODE
   ){

    interview.integrity({
     interviewId:id,
     eventType:"tab_switch",
     severity:"critical",
     details:{
      stage:qs[idx]?.stage||"unknown"
     }
    }).catch(()=>{});
   }
  };

  document.addEventListener(
   "visibilitychange",
   handler
  );

  return()=>
   document.removeEventListener(
    "visibilitychange",
    handler
   );

 },[id,idx,qs]);

 const q=qs[idx];

 function startSpeech(){

  const SR=
   window.SpeechRecognition||
   window.webkitSpeechRecognition;

  if(!SR){

   setMessage(
    "Speech recognition is not supported in this browser. You can type or paste the answer in testing mode."
   );

   return;
  }

  const r=new SR();

  recognition.current=r;

  r.continuous=true;
  r.interimResults=true;
  r.lang="en-IN";

  r.onresult=e=>{

   let finalText="";

   for(
    let i=e.resultIndex;
    i<e.results.length;
    i++
   ){

    if(e.results[i].isFinal){
     finalText+=
      e.results[i][0].transcript+
      " ";
    }
   }

   if(finalText){

    setAnswer(
     a=>
      (
       a+
       " "+
       finalText
      ).trim()
    );
   }
  };

  r.onerror=()=>
   setRecording(false);

  r.onend=()=>
   setRecording(false);

  r.start();

  setRecording(true);
  setRecordSeconds(0);

  recordTimer.current=
   setInterval(
    ()=>setRecordSeconds(x=>x+1),
    1000
   );
 }

 function stopSpeech(){

  recognition.current?.stop();

  clearInterval(
   recordTimer.current
  );

  setRecording(false);
 }

 async function save(){

  try{

   if(
    !answer.trim()&&
    !["coding"].includes(q.type)
   ){

    setResult(
     "Enter an answer before saving."
    );

    return;
   }

   if(q.type==="coding"){

    const r=
     await coding.submit({
      interviewId:id,
      questionId:q.id,
      language,
      code,
      testResults:test
     });

    setResult(
     `Code saved · ${r.data.score}/100`
    );

   }else if(q.type==="communication"){

    const r=
     await interview.communication({
      interviewId:id,
      questionId:q.id,
      transcript:answer,
      durationSeconds:
       Math.max(recordSeconds,1)
     });

    setResult(
     `Communication score · ${r.data.score}/100 · ${r.data.metrics.wpm} WPM`
    );

   }else{

    const r=
     await interview.answer(
      id,
      {
       questionId:q.id,
       answer
      }
     );

    setResult(
     `${r.data.score}/100 · ${r.data.feedback}`
    );

    if(!followUp){

     const f=
      await interview.followUp(
       id,
       {
        questionId:q.id,
        answer
       }
      );

     if(f.data.followUp){

      setFollowUp(
       f.data.followUp
      );

      setFollowSaved(false);
      setAnswer("");
     }
    }
   }

  }catch(e){

   setMessage(
    e.response?.data?.message||
    "Unable to save answer."
   );
  }
 }

 async function runCode(){

  try{

   setTest([]);

   const r=
    await coding.run({
     interviewId:id,
     questionId:q.id,
     language,
     code
    });

   setTest(
    r.data.results||[]
   );

  }catch(e){

   setMessage(
    e.response?.data?.message||
    "Code runner failed."
   );
  }
 }

 async function next(){

  if(followUp&&!followSaved){

   if(!answer.trim()){

    setResult(
     "Please answer the adaptive follow-up."
    );

    return;
   }

   try{

    await interview.answer(
     id,
     {
      questionId:q.id,
      answer,
      answerJson:{
       followUp:true
      }
     }
    );

    setFollowSaved(true);

   }catch(e){

    setMessage(
     e.response?.data?.message||
     "Unable to save follow-up."
    );

    return;
   }
  }

  if(idx===qs.length-1){

   try{

    const r=
     await interview.complete(id);

    setDone(true);

    setResult(
     `Assessment completed · final score ${r.data.report.overall_score}%`
    );

   }catch(e){

    setMessage(
     e.response?.data?.message||
     "Unable to complete assessment."
    );
   }

   return;
  }

  setIdx(x=>x+1);
  setAnswer("");
  setFollowUp("");
  setFollowSaved(false);
  setCode("");
  setLanguage("python");
  setTest([]);
  setResult("");
  setRecordSeconds(0);
 }

 if(!id||!q){

  return <Layout title="Preparing assessment">

   <div className="panel loading">

    <div className="spinner"/>

    <h2>
     Building your personalized assessment…
    </h2>

    <p>
     {message||
      "Questions are being prepared from the job configuration and candidate profile."
     }
    </p>

   </div>

  </Layout>
 }

 if(done){

  return <Layout title="Assessment complete">

   <div className="panel complete">

    <div className="completeIcon">
     ✓
    </div>

    <h2>
     Assessment submitted
    </h2>

    <p>
     {result}
    </p>

    <button
     className="primary"
     onClick={()=>nav("/candidate")}
    >
     Return to workspace
    </button>

   </div>

  </Layout>
 }

 if(!verified){

  return <Layout title="Identity verification">

   <Verification
    interviewId={id}
    onVerified={()=>setVerified(true)}
   />

  </Layout>
 }

 const stageIndex=
  STAGES.indexOf(q.stage);

 const isReadingCommunication=
  q.type==="communication"&&
  q.metadata?.promptType==="reading"&&
  q.metadata?.passage;

 return <Layout title={stageName(q.stage)}>

  <Monitor
   interviewId={id}
   stage={q.stage}
  />

  <div className="interviewTop">

   <div>

    <b>
     Stage {stageIndex+1} of 5
    </b>

    <span>
     {
      q.stage==="technical"
       ?"MCQ"
       :q.type==="coding"
       ?"Coding editor"
       :q.type==="communication"
       ?"Interactive communication"
       :"AI-assisted response"
     }
    </span>

   </div>

   <div className="progressBar">

    <i
     style={{
      width:`${((idx+1)/qs.length)*100}%`
     }}
    />

   </div>

   <b>
    {idx+1}/{qs.length}
   </b>

  </div>

  <section className="panel questionPanel">

   <div className="integrityBanner">

    {TEST_MODE
     ?"Testing mode: tab switching and copy/paste are intentionally allowed."
     :"Secure mode: tab switching is monitored and logged."
    }

   </div>

   <span className="eyebrow">
    {q.skill||stageName(q.stage)}
   </span>

   <h2>
    {followUp||q.prompt}
   </h2>

   {followUp&&
    <div className="followBanner">
     Adaptive follow-up generated from your previous response.
    </div>
   }


   {/* =====================================================
       TECHNICAL MCQ
       ===================================================== */}

   {q.type==="mcq"&&
    <div className="options">

     {(q.options||[]).map((o,i)=>
      <label
       key={i}
       className={
        answer===String(i)
         ?"selected"
         :""
       }
      >

       <input
        type="radio"
        name="answer"
        checked={answer===String(i)}
        onChange={()=>
         setAnswer(String(i))
        }
       />

       <span>
        {o}
       </span>

      </label>
     )}

    </div>
   }


   {/* =====================================================
       CODING
       ===================================================== */}

   {q.type==="coding"&&
    <>
     <div className="codeToolbar">

      <label>
       Language

       <select
        value={language}
        onChange={e=>{
         setLanguage(e.target.value);
         setTest([]);
        }}
       >
        <option value="python">
         Python
        </option>

        <option value="java">
         Java
        </option>

        <option value="c">
         C
        </option>

        <option value="cpp">
         C++
        </option>

        <option value="javascript">
         JavaScript
        </option>

       </select>

      </label>

      <button
       className="secondary"
       onClick={runCode}
      >
       ▶ Run tests
      </button>

     </div>

     <textarea
      className="codeEditor"
      value={code}
      onChange={e=>setCode(e.target.value)}
      placeholder={
       q.metadata?.starter||
       "Write your solution here…"
      }
     />

     {test.map((x,i)=>
      <div
       className={
        x.passed
         ?"testPass"
         :"testFail"
       }
       key={i}
      >
       Test {i+1}:{" "}
       {x.passed
        ?"PASS"
        :"FAIL"
       }
       {" · "}
       {x.output||"(no output)"}
       {" · expected "}
       {x.expected}
      </div>
     )}

    </>
   }


   {/* =====================================================
       COMMUNICATION
       READING PASSAGE + SPEECH
       ===================================================== */}

   {q.type==="communication"&&
    <>

     {isReadingCommunication&&
      <div
       className="readingPassage"
       onCopy={e=>e.preventDefault()}
       onCut={e=>e.preventDefault()}
       onContextMenu={e=>e.preventDefault()}
       onDragStart={e=>e.preventDefault()}
      >

       <div className="passageHeader">

        <span className="eyebrow">
         READ ALOUD
        </span>

        <span className="passageLock">
         🔒 Reading passage
        </span>

       </div>

       <p>
        {q.metadata.passage}
       </p>

      </div>
     }

     <div className="speechBar">

      <button
       className={
        recording
         ?"danger"
         :"secondary"
       }
       onClick={
        recording
         ?stopSpeech
         :startSpeech
       }
      >
       {recording
        ?"■ Stop recording"
        :"● Start microphone"
       }
      </button>

      <span>
       {recording
        ?`Recording ${recordSeconds}s…`
        :"Speech transcript will appear below."
       }
      </span>

     </div>

     <textarea
      className="answerBox"
      value={answer}
      onChange={e=>setAnswer(e.target.value)}
      readOnly={!!isReadingCommunication}
      placeholder={
       isReadingCommunication
        ?"Your speech transcript will appear here…"
        :"Speak your answer or type/paste it here…"
      }
     />

    </>
   }


   {/* =====================================================
       BEHAVIORAL / SCENARIO / OTHER AI QUESTIONS
       ===================================================== */}

   {!["mcq","coding","communication"].includes(q.type)&&
    <textarea
     className="answerBox"
     value={answer}
     onChange={e=>setAnswer(e.target.value)}
     placeholder="Type or paste your answer here…"
    />
   }


   <div className="questionActions">

    <button
     className="secondary"
     onClick={save}
    >
     Save answer
    </button>

    <button
     className="primary"
     onClick={next}
    >
     {idx===qs.length-1
      ?"Finish assessment"
      :"Next question →"
     }
    </button>

   </div>

   {result&&
    <div className="resultBanner">
     {result}
    </div>
   }

   {message&&
    <div className="alert">
     {message}
    </div>
   }

  </section>

 </Layout>
}

function App(){

 const{user}=useAuth();

 return <Routes>

  <Route
   path="/"
   element={
    user
     ?<Navigate
       to={
        user.role==="admin"
         ?"/admin"
         :"/candidate"
       }
      />
     :<Login/>
   }
  />

  <Route
   path="/admin"
   element={
    user?.role==="admin"
     ?<Admin/>
     :<Navigate to="/"/>
   }
  />

  <Route
   path="/candidate"
   element={
    user?.role==="candidate"
     ?<Candidate/>
     :<Navigate to="/"/>
   }
  />

  <Route
   path="/interview/:jobId"
   element={
    user?.role==="candidate"
     ?<Interview/>
     :<Navigate to="/"/>
   }
  />

  <Route
   path="*"
   element={<Navigate to="/"/>}
  />

 </Routes>
}

export default App;