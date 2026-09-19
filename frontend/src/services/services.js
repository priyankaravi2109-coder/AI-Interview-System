import api from "./api";
export const auth={login:data=>api.post("/auth/login",data),setPassword:data=>api.post("/auth/set-password",data)};
export const admin={dashboard:()=>api.get("/admin/dashboard"),createJob:data=>api.post("/admin/jobs",data),createCandidate:data=>api.post("/admin/candidates",data),reports:()=>api.get("/admin/reports"),jobCandidates:id=>api.get(`/admin/jobs/${id}/candidates`)};
export const candidate={
 dashboard:()=>api.get("/candidate/profile"),
 profile:()=>api.get("/candidate/profile"),
 update:data=>api.put("/candidate/profile",data),
 resume:file=>{
   const f=new FormData();
   f.append("resume",file);
   return api.post("/candidate/resume",f);
 },
 photo:file=>{
   const f=new FormData();
   f.append("photo",file);
   return api.post("/candidate/profile-photo",f);
 },
 jobs:()=>api.get("/candidate/jobs")
};
export const interview={
 start:jobId=>api.post("/interviews/start",{jobId}),
 questions:id=>api.get(`/interviews/${id}/questions`),
 answer:(id,data)=>api.post(`/interviews/${id}/answer`,data),
 followUp:(id,data)=>api.post(`/interviews/${id}/follow-up`,data),
 complete:id=>api.post(`/interviews/${id}/complete`),
 verificationStart:interviewId=>api.post("/verification/start",{interviewId}),
 verificationComplete:data=>api.post("/verification/complete",data),
 integrity:data=>api.post("/integrity/event",data),
 communication:data=>api.post("/communication/evaluate",data)
};
export const coding={run:data=>api.post("/coding/run",data),submit:data=>api.post("/coding/submit",data)};
export const reports={mine:()=>api.get("/reports/mine"),one:id=>api.get(`/reports/${id}`)};
