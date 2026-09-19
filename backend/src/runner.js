const fs=require("fs"),os=require("os"),path=require("path"),{spawn}=require("child_process");
const configs={
 javascript:{file:"main.js",cmd:process.execPath,args:f=>[f]},
 python:{file:"main.py",cmd:process.platform==="win32"?"python":"python3",args:f=>[f]},
 java:{file:"Main.java",cmd:"java",compile:true},
 c:{file:"main.c",cmd:"gcc",compile:true},
 cpp:{file:"main.cpp",cmd:"g++",compile:true}
};
function exec(cmd,args,cwd,input,timeout=4000){
 return new Promise(resolve=>{
  let out="",err="",done=false;const p=spawn(cmd,args,{cwd,windowsHide:true});
  const timer=setTimeout(()=>{if(!done){done=true;p.kill();resolve({status:"timeout",output:"Execution timed out.",passed:false})}},timeout);
  if(input!=null){try{p.stdin.write(String(input));p.stdin.end()}catch{}}
  p.stdout.on("data",d=>out+=d);p.stderr.on("data",d=>err+=d);
  p.on("close",code=>{if(done)return;done=true;clearTimeout(timer);resolve({status:code===0?"completed":"runtime_error",output:(out||err).trim(),exitCode:code})});
  p.on("error",e=>{if(done)return;done=true;clearTimeout(timer);resolve({status:"runner_error",output:e.message,passed:false})});
 });
}
async function run(language,code,input,expected){
 const c=configs[language];if(!c)return {status:"unsupported",output:`${language} is not enabled on this installation.`,expected,passed:false};
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),"ai-interview-"));
 try{
  if(language==="java"){
   fs.writeFileSync(path.join(dir,c.file),code||"");
   const comp=await exec("javac",[c.file],dir,null,5000);if(comp.status!=="completed")return {...comp,expected,passed:false};
   const r=await exec("java",["Main"],dir,input);return {...r,expected,passed:expected==null?r.exitCode===0:r.output===String(expected).trim()};
  }
  if(language==="c"||language==="cpp"){
   fs.writeFileSync(path.join(dir,c.file),code||"");const exe=path.join(dir,process.platform==="win32"?"program.exe":"program");
   const comp=await exec(c.cmd,[c.file,"-O2","-o",exe],dir,null,5000);if(comp.status!=="completed")return {...comp,expected,passed:false};
   const r=await exec(exe,[],dir,input);return {...r,expected,passed:expected==null?r.exitCode===0:r.output===String(expected).trim()};
  }
  fs.writeFileSync(path.join(dir,c.file),code||"");const r=await exec(c.cmd,c.args(dir+"/"+c.file),dir,input);return {...r,expected,passed:expected==null?r.exitCode===0:r.output===String(expected).trim()};
 } finally {setTimeout(()=>fs.rmSync(dir,{recursive:true,force:true}),100)}
}
module.exports={run};
