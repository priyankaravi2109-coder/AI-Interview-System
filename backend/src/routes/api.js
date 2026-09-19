const express=require('express');
const multer=require('multer');
const path=require('path');
const fs=require('fs');
const crypto=require('crypto');
const rateLimit=require('express-rate-limit');
const {pool}=require('../db');
const {sign,auth,bcrypt,role}=require('../auth');
const {generateQuestions,evaluateAnswer,followUp,summarize,gemini}=require('../ai');
const {run}=require('../runner');

const r=express.Router();

const q=async(sql,p=[])=>{
  const x=await pool.query(sql,p);
  return x.rows;
};

const audit=async(req,action,entityType=null,entityId=null,details={})=>{
  try{
    await q(
      'INSERT INTO audit_logs(user_id,action,entity_type,entity_id,details,ip) VALUES($1,$2,$3,$4,$5,$6)',
      [
        req.user?.id||null,
        action,
        entityType,
        entityId?String(entityId):null,
        JSON.stringify(details),
        req.ip
      ]
    );
  }catch(e){
    console.error('audit',e.message);
  }
};

const aiLimiter=rateLimit({
  windowMs:60*1000,
  max:30,
  standardHeaders:true,
  legacyHeaders:false,
  message:{
    success:false,
    message:'Too many assessment requests. Please wait a moment.'
  }
});

const allowedResume=['.pdf','.doc','.docx','.txt','.md'];

const storage=multer.diskStorage({
  destination:(req,file,cb)=>{
    const d=path.join(__dirname,'../../uploads');
    fs.mkdirSync(d,{recursive:true});
    cb(null,d);
  },
  filename:(req,file,cb)=>{
    cb(
      null,
      crypto.randomUUID()+path.extname(file.originalname).toLowerCase()
    );
  }
});

const upload=multer({
  storage,
  limits:{
    fileSize:(Number(process.env.MAX_RESUME_MB)||8)*1024*1024
  },
  fileFilter:(req,file,cb)=>
    allowedResume.includes(
      path.extname(file.originalname).toLowerCase()
    )
      ?cb(null,true)
      :cb(new Error(
        'Only PDF, DOC, DOCX, TXT or MD resumes are allowed.'
      ))
});

const photoUpload=multer({
  storage,
  limits:{
    fileSize:5*1024*1024
  },
  fileFilter:(req,file,cb)=>
    ['.jpg','.jpeg','.png'].includes(
      path.extname(file.originalname).toLowerCase()
    )
      ?cb(null,true)
      :cb(new Error('Only JPG or PNG photos are allowed.'))
});


/* =========================================================
   AUTH
========================================================= */

r.post('/auth/login',async(req,res)=>{
  const email=String(req.body.email||'').trim();
  const password=String(req.body.password||'');

  if(!email||!password){
    return res.status(400).json({
      success:false,
      message:'Email and password are required'
    });
  }

  const u=(await q(
    'SELECT * FROM app_users WHERE lower(email)=lower($1)',
    [email]
  ))[0];

  if(
    !u||
    u.must_set_password||
    !u.password_hash||
    !(await bcrypt.compare(password,u.password_hash))
  ){
    return res.status(
      u?.must_set_password?409:401
    ).json({
      success:false,
      mustSetPassword:!!u?.must_set_password,
      message:u?.must_set_password
        ?'Candidate account needs first-time password setup.'
        :'Invalid email or password'
    });
  }

  await q(
    'UPDATE app_users SET last_login_at=NOW() WHERE id=$1',
    [u.id]
  );

  res.json({
    success:true,
    token:sign(u),
    user:{
      id:u.id,
      email:u.email,
      role:u.role
    }
  });
});


r.post('/auth/set-password',async(req,res)=>{
  const {email,setupCode,password}=req.body;

  if(
    !email||
    !setupCode||
    !password||
    String(password).length<8
  ){
    return res.status(400).json({
      message:'Email, setup code and an 8+ character password are required'
    });
  }

  const u=(await q(
    'SELECT * FROM app_users WHERE lower(email)=lower($1) AND setup_code=$2 AND must_set_password=true',
    [email,setupCode]
  ))[0];

  if(!u){
    return res.status(400).json({
      message:'Invalid setup code'
    });
  }

  await q(
    'UPDATE app_users SET password_hash=$1,must_set_password=false,setup_code=null WHERE id=$2',
    [
      await bcrypt.hash(password,12),
      u.id
    ]
  );

  res.json({
    success:true
  });
});


/* =========================================================
   ADMIN DASHBOARD
========================================================= */

r.get('/admin/dashboard',auth,role('admin'),async(req,res)=>{
  const stats=(await q(`
    SELECT
      COUNT(*) FILTER(
        WHERE status='completed'
      )::int completed,

      COUNT(*) FILTER(
        WHERE status='in_progress'
      )::int in_progress,

      COUNT(*)::int total,

      COALESCE(
        AVG(
          (
            SELECT overall_score
            FROM reports rr
            WHERE rr.interview_id=i.id
          )
        ),
        0
      )::numeric(6,2) average_score

    FROM interviews i
  `))[0];

  const jobs=await q(`
    SELECT
      j.*,
      COUNT(DISTINCT jc.id)::int candidate_count,
      COUNT(DISTINCT i.id)
        FILTER(
          WHERE i.status='completed'
        )::int completed_count

    FROM jobs j

    LEFT JOIN job_candidates jc
      ON jc.job_id=j.id

    LEFT JOIN interviews i
      ON i.job_id=j.id

    GROUP BY j.id

    ORDER BY j.created_at DESC
  `);

  res.json({
    success:true,
    stats,
    jobs
  });
});


/* =========================================================
   ADMIN JOBS
========================================================= */

r.post('/admin/jobs',auth,role('admin'),async(req,res)=>{
  const b=req.body;

  const required=
    Array.isArray(b.requiredSkills)
      ?b.requiredSkills
      :[];

  const secondary=
    Array.isArray(b.secondarySkills)
      ?b.secondarySkills
      :[];

  if(!b.title||!b.description){
    return res.status(400).json({message:'Job title and description are required'});
  }
  const stageCounts={
    technical:Number(b.technicalQuestionCount)||0,
    coding:Number(b.codingQuestionCount)||0,
    communication:Number(b.communicationQuestionCount)||0,
    behavioral:Number(b.behavioralQuestionCount)||0,
    scenario:Number(b.scenarioQuestionCount)||0
  };
  const stagePass={
    technical:Number(b.technicalPassScore??60),
    coding:Number(b.codingPassScore??60),
    communication:Number(b.communicationPassScore??60),
    behavioral:Number(b.behavioralPassScore??60),
    scenario:Number(b.scenarioPassScore??60)
  };
  const totalStageQuestions=Object.values(stageCounts).reduce((a,v)=>a+v,0);
  if(totalStageQuestions<1){
    return res.status(400).json({message:'Configure at least one question across the five assessment stages.'});
  }
  if(Object.values(stagePass).some(v=>v<0||v>100)){
    return res.status(400).json({message:'Stage pass criteria must be between 0 and 100.'});
  }

  const job=(await q(`
    INSERT INTO jobs(
      title,
      description,
      required_skills,
      secondary_skills,
      experience_min,
      experience_max,
      education,
      certifications,
      created_by
    )
    VALUES(
      $1,$2,$3,$4,$5,$6,$7,$8,$9
    )
    RETURNING *
  `,[
    String(b.title).slice(0,255),
    String(b.description).slice(0,15000),
    required,
    secondary,
    Number(b.experienceMin)||0,
    b.experienceMax===''
      ?null
      :Number(b.experienceMax)||null,
    b.education||'',
    Array.isArray(b.certifications)
      ?b.certifications
      :[],
    req.user.id
  ]))[0];

  await q(`
    INSERT INTO interview_configs(
      job_id,
      question_count,
      duration_minutes,
      difficulty,
      technical_pct,
      behavioral_pct,
      scenario_pct,
      communication_pct,
      experience_pct,
      technical_question_count,
      coding_question_count,
      communication_question_count,
      behavioral_question_count,
      scenario_question_count,
      technical_pass_score,
      coding_pass_score,
      communication_pass_score,
      behavioral_pass_score,
      scenario_pass_score,
      coding_enabled,
      sql_enabled,
      debugging_enabled,
      output_prediction_enabled,
      communication_enabled,
      language,
      personality,
      passing_score
    )
    VALUES(
      $1,$2,$3,$4,$5,$6,$7,$8,$9,
      $10,$11,$12,$13,$14,
      $15,$16,$17,$18,$19,
      $20,$21,$22,$23,$24,
      $25,$26,$27
    )
  `,[
    job.id,
    Number(b.questionCount)||20,
    Number(b.durationMinutes)||30,
    b.difficulty||'intermediate',
    Number(b.technicalPct)||50,
    Number(b.behavioralPct)||15,
    Number(b.scenarioPct)||15,
    Number(b.communicationPct)||10,
    Number(b.experiencePct)||20,
    stageCounts.technical,
    stageCounts.coding,
    stageCounts.communication,
    stageCounts.behavioral,
    stageCounts.scenario,
    stagePass.technical,
    stagePass.coding,
    stagePass.communication,
    stagePass.behavioral,
    stagePass.scenario,
    b.codingEnabled!==false,
    b.sqlEnabled!==false,
    b.debuggingEnabled!==false,
    b.outputPredictionEnabled!==false,
    b.communicationEnabled!==false,
    b.language||'en-IN',
    b.personality||'professional and encouraging',
    Number(b.passingScore)||60
  ]);

  await audit(
    req,
    'job.created',
    'job',
    job.id,
    {title:job.title}
  );

  res.json({
    success:true,
    job
  });
});


r.put('/admin/jobs/:id/config',auth,role('admin'),async(req,res)=>{
  const b=req.body;

  const total=[
    'technicalPct',
    'behavioralPct',
    'scenarioPct',
    'communicationPct',
    'experiencePct'
  ].reduce(
    (a,k)=>a+(Number(b[k])||0),
    0
  );

  if(total!==100){
    return res.status(400).json({
      message:
        `Question percentages must total 100%. Current total: ${total}%`
    });
  }

  const cfg=(await q(`
    UPDATE interview_configs

    SET
      question_count=$1,
      duration_minutes=$2,
      difficulty=$3,
      technical_pct=$4,
      behavioral_pct=$5,
      scenario_pct=$6,
      communication_pct=$7,
      experience_pct=$8,
      coding_enabled=$9,
      sql_enabled=$10,
      debugging_enabled=$11,
      output_prediction_enabled=$12,
      communication_enabled=$13,
      language=$14,
      personality=$15,
      passing_score=$16,
      updated_at=NOW()

    WHERE job_id=$17

    RETURNING *
  `,[
    Number(b.questionCount)||20,
    Number(b.durationMinutes)||30,
    b.difficulty,
    Number(b.technicalPct),
    Number(b.behavioralPct),
    Number(b.scenarioPct),
    Number(b.communicationPct),
    Number(b.experiencePct),
    b.codingEnabled!==false,
    b.sqlEnabled!==false,
    b.debuggingEnabled!==false,
    b.outputPredictionEnabled!==false,
    b.communicationEnabled!==false,
    b.language||'en-IN',
    b.personality||'professional and encouraging',
    Number(b.passingScore)||60,
    req.params.id
  ]))[0];

  res.json({
    success:true,
    config:cfg
  });
});


r.get('/admin/jobs/:id/config',auth,role('admin'),async(req,res)=>{
  res.json({
    success:true,
    config:
      (await q(
        'SELECT * FROM interview_configs WHERE job_id=$1',
        [req.params.id]
      ))[0]
  });
});


/* =========================================================
   ADMIN CANDIDATES
========================================================= */

r.post('/admin/candidates',auth,role('admin'),async(req,res)=>{
  const {email,name,jobId}=req.body;

  if(!email||!jobId){
    return res.status(400).json({
      message:'Email and job are required'
    });
  }

  let u=(await q(
    'SELECT * FROM app_users WHERE lower(email)=lower($1)',
    [email]
  ))[0];

  let setupCode=null;

  if(!u){
    setupCode=
      crypto
        .randomBytes(5)
        .toString('hex')
        .toUpperCase();

    u=(await q(`
      INSERT INTO app_users(
        email,
        role,
        must_set_password,
        setup_code
      )
      VALUES(
        $1,
        'candidate',
        true,
        $2
      )
      RETURNING *
    `,[
      email,
      setupCode
    ]))[0];
  }

  if(u.role!=='candidate'){
    return res.status(409).json({
      message:'That email belongs to an admin account'
    });
  }

  let c=(await q(
    'SELECT * FROM candidates WHERE user_id=$1',
    [u.id]
  ))[0];

  if(!c){
    c=(await q(`
      INSERT INTO candidates(
        user_id,
        name
      )
      VALUES($1,$2)
      RETURNING *
    `,[
      u.id,
      name||''
    ]))[0];
  }

  await q(`
    INSERT INTO job_candidates(
      job_id,
      candidate_id,
      status
    )
    VALUES(
      $1,$2,'invited'
    )

    ON CONFLICT(
      job_id,
      candidate_id
    )

    DO UPDATE
      SET updated_at=NOW()
  `,[
    jobId,
    c.id
  ]);

  await audit(
    req,
    'candidate.invited',
    'candidate',
    c.id,
    {jobId}
  );

  res.json({
    success:true,
    candidate:c,
    setupCode:setupCode||null
  });
});


/* =========================================================
   ADMIN REPORTS
   FIXED:
   candidates table does NOT contain email.
   Email comes from app_users.
========================================================= */

r.get('/admin/reports',auth,role('admin'),async(req,res)=>{
  try{
    const reports=await q(`
      SELECT

        i.id AS interview_id,
        i.status AS interview_status,
        i.started_at,
        i.completed_at,
        i.integrity_score,
        i.verification_status,

        j.id AS job_id,
        j.title AS job_title,

        c.id AS candidate_id,
        c.name AS candidate_name,

        u.email AS candidate_email,

        r.*,

        jc.status AS candidate_status

      FROM interviews i

      JOIN jobs j
        ON j.id=i.job_id

      JOIN candidates c
        ON c.id=i.candidate_id

      JOIN app_users u
        ON u.id=c.user_id

      LEFT JOIN reports r
        ON r.interview_id=i.id

      LEFT JOIN job_candidates jc
        ON jc.job_id=i.job_id
        AND jc.candidate_id=i.candidate_id

      ORDER BY
        i.completed_at DESC NULLS LAST,
        i.started_at DESC
    `);

    res.json({
      success:true,
      reports:reports||[]
    });

  }catch(error){

    console.error(
      'ADMIN REPORTS ERROR:',
      error
    );

    res.status(500).json({
      success:false,
      message:'Failed to load interview reports'
    });
  }
});


r.get('/admin/jobs/:id/candidates',auth,role('admin'),async(req,res)=>{
  res.json({
    success:true,
    candidates:await q(`
      SELECT
        c.*,
        u.email,
        jc.status,
        i.status interview_status,
        i.verification_status,
        r.overall_score,
        r.selection_status

      FROM job_candidates jc

      JOIN candidates c
        ON c.id=jc.candidate_id

      JOIN app_users u
        ON u.id=c.user_id

      LEFT JOIN interviews i
        ON i.job_id=jc.job_id
        AND i.candidate_id=c.id

      LEFT JOIN reports r
        ON r.interview_id=i.id

      WHERE jc.job_id=$1

      ORDER BY
        r.overall_score DESC NULLS LAST
    `,[req.params.id])
  });
});


r.patch('/admin/reports/:id/selection',auth,role('admin'),async(req,res)=>{
  const allowed=[
    'under_review',
    'selected',
    'not_selected',
    'on_hold'
  ];

  if(!allowed.includes(req.body.status)){
    return res.status(400).json({
      message:'Invalid HR status'
    });
  }

  const x=(await q(`
    UPDATE reports
    SET selection_status=$1
    WHERE id=$2
    RETURNING *
  `,[
    req.body.status,
    req.params.id
  ]))[0];

  await audit(
    req,
    'report.status_changed',
    'report',
    req.params.id,
    {status:req.body.status}
  );

  res.json({
    success:true,
    report:x
  });
});


r.get(
  '/admin/verification-events/:interviewId',
  auth,
  role('admin'),
  async(req,res)=>{
    res.json({
      success:true,
      events:await q(`
        SELECT *
        FROM verification_events
        WHERE interview_id=$1
        ORDER BY created_at
      `,[req.params.interviewId])
    });
  }
);


/* =========================================================
   CANDIDATE PROFILE
========================================================= */

r.get('/candidate/profile',auth,role('candidate'),async(req,res)=>{
  res.json({
    success:true,
    profile:(await q(`
      SELECT
        c.*,
        u.email

      FROM candidates c

      JOIN app_users u
        ON u.id=c.user_id

      WHERE c.user_id=$1
    `,[req.user.id]))[0]
  });
});


r.put('/candidate/profile',auth,role('candidate'),async(req,res)=>{
  const b=req.body;

  const x=(await q(`
    UPDATE candidates

    SET
      name=$1,
      phone=$2,
      education=$3,
      experience_years=$4,
      skills=$5,
      secondary_skills=$6,
      technical_skills=$7,
      soft_skills=$8,
      certifications=$9,
      updated_at=NOW()

    WHERE user_id=$10

    RETURNING *
  `,[
    String(b.name||''),
    b.phone||'',
    b.education||'',
    Number(b.experienceYears)||0,
    b.skills||[],
    b.secondarySkills||[],
    b.technicalSkills||[],
    b.softSkills||[],
    b.certifications||[],
    req.user.id
  ]))[0];

  res.json({
    success:true,
    profile:x
  });
});


/* =========================================================
   RESUME
========================================================= */

r.post(
  '/candidate/resume',
  auth,
  role('candidate'),
  upload.single('resume'),
  async(req,res)=>{
    if(!req.file){
      return res.status(400).json({
        message:'Resume is required'
      });
    }

    let text='';

    const ext=
      path.extname(
        req.file.originalname
      ).toLowerCase();

    try{

      if(['.txt','.md'].includes(ext)){

        text=
          fs.readFileSync(
            req.file.path,
            'utf8'
          );

      }else if(ext==='.pdf'){

        try{
          const pdfParse=require('pdf-parse');
          text=(await pdfParse(fs.readFileSync(req.file.path))).text||'';
        }catch{ text='PDF stored successfully. Install pdf-parse for local text extraction.'; }

      }else if(ext==='.docx'){

        try{
          const mammoth=require('mammoth');
          text=(await mammoth.extractRawText({path:req.file.path})).value||'';
        }catch{ text='DOCX stored successfully. Install mammoth for local text extraction.'; }

      }else{

        text=
          'Legacy .doc uploaded; convert to DOCX/PDF/TXT for text extraction.';
      }

    }catch(e){

      text=
        `Text extraction unavailable for ${ext}. File is stored for HR review.`;
    }

    const url=
      '/uploads/'+req.file.filename;

    let analysis={
      textExtracted:!!text,
      characterCount:text.length
    };

    if(text){

      const raw=await gemini(`
Analyze this resume as reference data only.

Extract:
- skills
- technologies
- projects
- experience
- certifications
- job history

Do not infer protected traits.

Return JSON with:
skills[],
technologies[],
projects[],
experience[],
certifications[],
jobHistory[].

Resume text:

${text.slice(0,30000)}
`,true);

      if(raw){

        try{
          analysis={
            ...analysis,
            ...JSON.parse(raw)
          };
        }catch{}
      }
    }

    const extractedSkills=Array.isArray(analysis.skills)
  ? analysis.skills.map(x=>String(x).trim()).filter(Boolean)
  : [];

const extractedTechnologies=Array.isArray(analysis.technologies)
  ? analysis.technologies.map(x=>String(x).trim()).filter(Boolean)
  : [];

const extractedCertifications=Array.isArray(analysis.certifications)
  ? analysis.certifications.map(x=>String(x).trim()).filter(Boolean)
  : [];

const c=(await q(`
  UPDATE candidates

  SET
    resume_url=$1,
    resume_text=$2,
    resume_analysis=$3,
    skills=$4,
    technical_skills=$5,
    certifications=$6,
    updated_at=NOW()

  WHERE user_id=$7

  RETURNING *
`,[
  url,
  text.slice(0,50000),
  JSON.stringify(analysis),
  extractedSkills,
  extractedTechnologies,
  extractedCertifications,
  req.user.id
]))[0];

    res.json({
      success:true,
      profile:c,
      resumeAnalysis:analysis
    });
  }
);


/* =========================================================
   PROFILE PHOTO
========================================================= */

r.post(
  '/candidate/profile-photo',
  auth,
  role('candidate'),
  photoUpload.single('photo'),
  async(req,res)=>{

    if(!req.file){
      return res.status(400).json({
        message:'Profile photo is required'
      });
    }

    const ext=
      path.extname(
        req.file.originalname
      ).toLowerCase();

    if(
      !['.jpg','.jpeg','.png']
        .includes(ext)
    ){
      return res.status(400).json({
        message:'Use JPG or PNG for the verification photo'
      });
    }

    const buf=
      fs.readFileSync(
        req.file.path
      );

    const hash=
      crypto
        .createHash('sha256')
        .update(buf)
        .digest('hex');

    const c=(await q(`
      UPDATE candidates

      SET
        profile_photo_url=$1,
        updated_at=NOW()

      WHERE user_id=$2

      RETURNING *
    `,[
      `/uploads/${req.file.filename}`,
      req.user.id
    ]))[0];

    await q(`
      INSERT INTO audit_logs(
        user_id,
        action,
        entity_type,
        entity_id,
        details
      )
      VALUES(
        $1,$2,$3,$4,$5
      )
    `,[
      req.user.id,
      'profile_photo_registered',
      'candidate',
      c.id,
      JSON.stringify({
        sha256:hash
      })
    ]);

    res.json({
      success:true,
      profile:c,
      photoHash:hash
    });
  }
);


/* =========================================================
   CANDIDATE JOBS
========================================================= */

r.get('/candidate/jobs',auth,role('candidate'),async(req,res)=>{
  res.json({
    success:true,
    jobs:await q(`
      SELECT
        j.*,
        jc.status,
        i.id interview_id,
        i.status interview_status,
        i.verification_status

      FROM job_candidates jc

      JOIN candidates c
        ON c.id=jc.candidate_id

      JOIN jobs j
        ON j.id=jc.job_id

      LEFT JOIN interviews i
        ON i.job_id=j.id
        AND i.candidate_id=c.id

      WHERE c.user_id=$1

      ORDER BY
        j.created_at DESC
    `,[req.user.id])
  });
});


/* =========================================================
   INTERVIEW START
========================================================= */

r.post(
  '/interviews/start',
  auth,
  role('candidate'),
  aiLimiter,
  async(req,res)=>{

    const jobId=
      Number(req.body.jobId);

    const c=(await q(
      'SELECT * FROM candidates WHERE user_id=$1',
      [req.user.id]
    ))[0];

    if(!c){
      return res.status(404).json({
        message:'Candidate profile not found'
      });
    }

    const jc=(await q(`
      SELECT *
      FROM job_candidates
      WHERE job_id=$1
      AND candidate_id=$2
    `,[
      jobId,
      c.id
    ]))[0];

    if(!jc){
      return res.status(403).json({
        message:'You are not assigned to this job'
      });
    }

    const job=(await q(
      'SELECT * FROM jobs WHERE id=$1',
      [jobId]
    ))[0];

    const cfg=(await q(
      'SELECT * FROM interview_configs WHERE job_id=$1',
      [jobId]
    ))[0];

    let i=(await q(`
      SELECT *
      FROM interviews
      WHERE job_id=$1
      AND candidate_id=$2
    `,[
      jobId,
      c.id
    ]))[0];

    if(!i){

      i=(await q(`
        INSERT INTO interviews(
          job_id,
          candidate_id,
          status,
          current_stage,
          difficulty,
          started_at,
          expires_at,
          verification_status
        )
        VALUES(
          $1,
          $2,
          'in_progress',
          'technical',
          $3,
          NOW(),
          NOW()+($4||' minutes')::interval,
          'not_started'
        )
        RETURNING *
      `,[
        jobId,
        c.id,
        cfg?.difficulty||'intermediate',
        String(cfg?.duration_minutes||30)
      ]))[0];
    }

    let count=
      Number(
        (
          await q(`
            SELECT
              count(*)::int n
            FROM questions
            WHERE interview_id=$1
          `,[i.id])
        )[0].n
      );

    if(!count){

      const generated=
        await generateQuestions({
          job,
          candidate:c,
          cfg:cfg||{
            question_count:20
          }
        });

      for(const x of generated.questions){

        const z=(await q(`
          INSERT INTO questions(
            interview_id,
            stage,
            sequence_no,
            type,
            skill,
            difficulty,
            prompt,
            options,
            correct_answer,
            rubric,
            metadata,
            generated_by
          )
          VALUES(
            $1,$2,$3,$4,$5,$6,
            $7,$8,$9,$10,$11,$12
          )
          RETURNING id
        `,[
          i.id,
          x.stage,
          x.sequence_no,
          x.type,
          x.skill||null,
          x.difficulty||
            cfg?.difficulty||
            'intermediate',
          String(x.prompt).slice(0,10000),
          JSON.stringify(x.options||[]),
          x.correct_answer??null,
          JSON.stringify(x.rubric||{}),
          JSON.stringify(x.metadata||{}),
          generated.model
        ]))[0];

        await q(`
          INSERT INTO generated_questions(
            interview_id,
            question_id,
            model,
            prompt_version,
            context
          )
          VALUES(
            $1,$2,$3,$4,$5
          )
        `,[
          i.id,
          z.id,
          generated.model,
          'v2',
          JSON.stringify({
            jobId,
            candidateId:c.id
          })
        ]);
      }

      await audit(
        req,
        'interview.questions_generated',
        'interview',
        i.id,
        {
          model:generated.model,
          count:generated.questions.length
        }
      );
    }

    res.json({
      success:true,
      interviewId:i.id,
      verificationRequired:
        !['verified'].includes(
          i.verification_status
        )
    });
  }
);


/* =========================================================
   QUESTIONS
========================================================= */

r.get(
  '/interviews/:id/questions',
  auth,
  async(req,res)=>{

    const i=(await q(`
      SELECT
        i.*,
        c.user_id,
        j.title,
        j.description,
        j.required_skills,
        ic.*

      FROM interviews i

      JOIN candidates c
        ON c.id=i.candidate_id

      JOIN jobs j
        ON j.id=i.job_id

      LEFT JOIN interview_configs ic
        ON ic.job_id=i.job_id

      WHERE i.id=$1
    `,[req.params.id]))[0];

    if(
      !i||
      (
        req.user.role==='candidate'&&
        i.user_id!==req.user.id
      )
    ){
      return res.status(403).json({
        message:'Forbidden'
      });
    }

    res.json({
      success:true,
      interview:i,
      questions:await q(`
        SELECT
          id,
          stage,
          sequence_no,
          type,
          skill,
          difficulty,
          prompt,
          options,
          metadata

        FROM questions

        WHERE interview_id=$1

        ORDER BY sequence_no
      `,[req.params.id])
    });
  }
);


/* =========================================================
   VERIFICATION START
========================================================= */

r.post(
  '/verification/start',
  auth,
  role('candidate'),
  async(req,res)=>{

    const i=(await q(`
      SELECT
        i.*,
        c.user_id,
        c.profile_photo_url

      FROM interviews i

      JOIN candidates c
        ON c.id=i.candidate_id

      WHERE i.id=$1
    `,[req.body.interviewId]))[0];

    if(
      !i||
      i.user_id!==req.user.id
    ){
      return res.status(403).json({
        message:'Forbidden'
      });
    }

    if(!i.profile_photo_url){
      return res.status(400).json({
        message:'Register a profile photo before verification'
      });
    }

    await q(`
      INSERT INTO face_verifications(
        interview_id,
        provider,
        status,
        consented_at
      )
      VALUES(
        $1,$2,'pending',NOW()
      )

      ON CONFLICT(interview_id)

      DO UPDATE
        SET
          status='pending',
          consented_at=NOW()
    `,[
      i.id,
      process.env.FACE_VERIFICATION_MODE||
        'local_demo'
    ]);

    await q(`
      INSERT INTO verification_events(
        interview_id,
        event_type,
        severity,
        details
      )
      VALUES(
        $1,$2,$3,$4
      )
    `,[
      i.id,
      'verification_started',
      'info',
      JSON.stringify({
        provider:
          process.env.FACE_VERIFICATION_MODE||
          'local_demo'
      })
    ]);

    res.json({
      success:true,
      profilePhotoUrl:i.profile_photo_url,
      mode:
        process.env.FACE_VERIFICATION_MODE||
        'local_demo'
    });
  }
);


/* =========================================================
   VERIFICATION COMPLETE
========================================================= */

r.post(
  '/verification/complete',
  auth,
  role('candidate'),
  async(req,res)=>{

    const i=(await q(`
      SELECT
        i.*,
        c.user_id

      FROM interviews i

      JOIN candidates c
        ON c.id=i.candidate_id

      WHERE i.id=$1
    `,[req.body.interviewId]))[0];

    if(
      !i||
      i.user_id!==req.user.id
    ){
      return res.status(403).json({
        message:'Forbidden'
      });
    }

    const status=
      req.body.status||
      'manual_review_required';

    const similarity=
      req.body.similarity==null
        ?null
        :Number(req.body.similarity);

    await q(`
      UPDATE face_verifications

      SET
        live_photo_hash=$1,
        similarity=$2,
        status=$3::varchar,
        verified_at=
          CASE
            WHEN $3::varchar='verified'
            THEN NOW()
            ELSE verified_at
          END,
        details=$4

      WHERE interview_id=$5
    `,[
      req.body.livePhotoHash||null,
      similarity,
      status,
      JSON.stringify({
        note:req.body.note||'',
        mode:
          process.env.FACE_VERIFICATION_MODE||
          'local_demo'
      }),
      i.id
    ]);

    await q(`
      UPDATE interviews
      SET verification_status=$1
      WHERE id=$2
    `,[
      status,
      i.id
    ]);

    await q(`
      INSERT INTO verification_events(
        interview_id,
        event_type,
        severity,
        details
      )
      VALUES(
        $1,$2,$3,$4
      )
    `,[
      i.id,
      status==='verified'
        ?'initial_face_verification_success'
        :'initial_face_verification_failed',
      status==='verified'
        ?'info'
        :'warning',
      JSON.stringify({
        similarity
      })
    ]);

    await audit(
      req,
      'face_verification.completed',
      'interview',
      i.id,
      {
        status,
        similarity
      }
    );

    res.json({
      success:true,
      status,
      similarity
    });
  }
);


/* =========================================================
   ANSWER EVALUATION
========================================================= */

r.post(
  '/interviews/:id/answer',
  auth,
  role('candidate'),
  aiLimiter,
  async(req,res)=>{

    const i=(await q(`
      SELECT
        i.*,
        c.user_id,
        c.id candidate_id

      FROM interviews i

      JOIN candidates c
        ON c.id=i.candidate_id

      WHERE i.id=$1
    `,[req.params.id]))[0];

    if(
      !i||
      i.user_id!==req.user.id
    ){
      return res.status(403).json({
        message:'Forbidden'
      });
    }

    if(
      i.expires_at&&
      new Date(i.expires_at)<new Date()
    ){
      return res.status(410).json({
        message:'Interview time has expired'
      });
    }

    const qu=(await q(`
      SELECT *
      FROM questions
      WHERE id=$1
      AND interview_id=$2
    `,[
      req.body.questionId,
      req.params.id
    ]))[0];

    if(!qu){
      return res.status(404).json({
        message:'Question not found'
      });
    }

    const job=(await q(
      'SELECT * FROM jobs WHERE id=$1',
      [i.job_id]
    ))[0];

    const candidate=(await q(
      'SELECT * FROM candidates WHERE id=$1',
      [i.candidate_id]
    ))[0];

    let evaluation;

    if(qu.type==='mcq'){

      const ok=
        String(req.body.answer)===
        String(qu.correct_answer);

      evaluation={
        correctness:ok?100:0,
        relevance:ok?100:0,
        technicalKnowledge:ok?100:0,
        problemSolving:ok?70:20,
        communication:100,
        confidence:100,
        depth:ok?80:20,
        practicalKnowledge:ok?80:20,
        overall:ok?100:0,
        feedback:
          ok
            ?'Correct.'
            :'Incorrect. Review the concept.',
        evidence:[
          ok
            ?'Selected option matches the answer key.'
            :'Selected option does not match the answer key.'
        ],
        model:'answer-key'
      };

    }else{

      evaluation=
        await evaluateAnswer({
          question:qu,
          answer:req.body.answer,
          candidate,
          job
        });
    }

    const score=
      Number(evaluation.overall)||0;

    const a=(await q(`
      INSERT INTO answers(
        interview_id,
        question_id,
        answer_text,
        answer_json,
        score,
        evaluation,
        feedback
      )
      VALUES(
        $1,$2,$3,$4,$5,$6,$7
      )

      ON CONFLICT(
        interview_id,
        question_id
      )

      DO UPDATE SET
        answer_text=EXCLUDED.answer_text,
        answer_json=EXCLUDED.answer_json,
        score=EXCLUDED.score,
        evaluation=EXCLUDED.evaluation,
        feedback=EXCLUDED.feedback,
        submitted_at=NOW()

      RETURNING id
    `,[
      i.id,
      qu.id,
      String(req.body.answer||'').slice(0,20000),
      JSON.stringify(req.body.answerJson||{}),
      score,
      JSON.stringify(evaluation),
      evaluation.feedback||''
    ]))[0];

    await q(`
      INSERT INTO answer_evaluations(
        answer_id,
        correctness,
        relevance,
        technical_knowledge,
        problem_solving,
        communication,
        confidence,
        depth,
        practical_knowledge,
        overall,
        feedback,
        evidence,
        model
      )
      VALUES(
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
        $11,$12,$13
      )

      ON CONFLICT(answer_id)

      DO UPDATE SET
        correctness=EXCLUDED.correctness,
        relevance=EXCLUDED.relevance,
        technical_knowledge=EXCLUDED.technical_knowledge,
        problem_solving=EXCLUDED.problem_solving,
        communication=EXCLUDED.communication,
        confidence=EXCLUDED.confidence,
        depth=EXCLUDED.depth,
        practical_knowledge=EXCLUDED.practical_knowledge,
        overall=EXCLUDED.overall,
        feedback=EXCLUDED.feedback,
        evidence=EXCLUDED.evidence,
        model=EXCLUDED.model
    `,[
      a.id,
      evaluation.correctness||0,
      evaluation.relevance||0,
      evaluation.technicalKnowledge||0,
      evaluation.problemSolving||0,
      evaluation.communication||0,
      evaluation.confidence||0,
      evaluation.depth||0,
      evaluation.practicalKnowledge||0,
      evaluation.overall||0,
      evaluation.feedback||'',
      JSON.stringify(evaluation.evidence||[]),
      evaluation.model||'fallback'
    ]);

    await q(`
      INSERT INTO interview_transcripts(
        interview_id,
        question_id,
        speaker,
        text
      )
      VALUES(
        $1,$2,'candidate',$3
      )
    `,[
      i.id,
      qu.id,
      String(req.body.answer||'').slice(0,20000)
    ]);

    const levels=[
      'beginner',
      'intermediate',
      'advanced',
      'expert'
    ];

    const li=
      levels.indexOf(
        i.difficulty||'intermediate'
      );

    const nextLevel=
      score>=80
        ?levels[Math.min(3,li+1)]
        :score<50
          ?levels[Math.max(0,li-1)]
          :levels[li];

    if(nextLevel!==i.difficulty){

      await q(`
        UPDATE interviews
        SET difficulty=$1
        WHERE id=$2
      `,[
        nextLevel,
        i.id
      ]);

      await q(`
        UPDATE questions

        SET difficulty=$1

        WHERE interview_id=$2
        AND sequence_no>$3

        AND NOT EXISTS(
          SELECT 1
          FROM answers a
          WHERE a.question_id=questions.id
          AND a.interview_id=$2
        )
      `,[
        nextLevel,
        i.id,
        qu.sequence_no
      ]).catch(()=>{});
    }

    res.json({
      success:true,
      score,
      feedback:evaluation.feedback,
      evaluation
    });
  }
);


/* =========================================================
   FOLLOW-UP
========================================================= */

r.post(
  '/interviews/:id/follow-up',
  auth,
  role('candidate'),
  aiLimiter,
  async(req,res)=>{

    const i=(await q(`
      SELECT
        i.*,
        c.user_id

      FROM interviews i

      JOIN candidates c
        ON c.id=i.candidate_id

      WHERE i.id=$1
    `,[req.params.id]))[0];

    if(
      !i||
      i.user_id!==req.user.id
    ){
      return res.status(403).json({
        message:'Forbidden'
      });
    }

    const qu=(await q(`
      SELECT *
      FROM questions
      WHERE id=$1
      AND interview_id=$2
    `,[
      req.body.questionId,
      req.params.id
    ]))[0];

    if(!qu){
      return res.status(404).json({
        message:'Question not found'
      });
    }

    const previous=await q(`
      SELECT prompt
      FROM questions
      WHERE interview_id=$1
      ORDER BY sequence_no
    `,[i.id]);

    res.json({
      success:true,
      followUp:
        await followUp({
          question:qu,
          answer:req.body.answer,
          previousQuestions:previous
        })
    });
  }
);


/* =========================================================
   COMMUNICATION
========================================================= */

r.post(
  '/communication/evaluate',
  auth,
  role('candidate'),
  aiLimiter,
  async(req,res)=>{

    const text=
      String(
        req.body.transcript||''
      ).slice(0,20000);

    const words=
      text
        .trim()
        .split(/\s+/)
        .filter(Boolean);

    const fillers=
      (
        text.match(
          /\b(um|uh|like|you know|actually|basically)\b/gi
        )||[]
      ).length;

    const duration=
      Number(
        req.body.durationSeconds
      )||1;

    const wpm=
      Math.round(
        words.length/
        (duration/60)
      );

    const score=
      Math.max(
        0,
        Math.min(
          100,
          Math.round(
            50+
            Math.min(words.length,120)/120*25+
            Math.min(
              new Set(
                words.map(
                  x=>x.toLowerCase()
                )
              ).size,
              70
            )/70*20-
            Math.min(fillers,8)*2
          )
        )
      );

    await q(`
      INSERT INTO communication_attempts(
        interview_id,
        question_id,
        transcript,
        duration_seconds,
        metrics,
        score
      )
      VALUES(
        $1,$2,$3,$4,$5,$6
      )
    `,[
      req.body.interviewId,
      req.body.questionId,
      text,
      duration,
      JSON.stringify({
        wpm,
        fillers,
        wordCount:words.length
      }),
      score
    ]);

    const a=(await q(`
      INSERT INTO answers(
        interview_id,
        question_id,
        answer_text,
        answer_json,
        score,
        feedback
      )
      VALUES(
        $1,$2,$3,$4,$5,$6
      )

      ON CONFLICT(
        interview_id,
        question_id
      )

      DO UPDATE SET
        answer_text=EXCLUDED.answer_text,
        answer_json=EXCLUDED.answer_json,
        score=EXCLUDED.score,
        feedback=EXCLUDED.feedback

      RETURNING id
    `,[
      req.body.interviewId,
      req.body.questionId,
      text,
      JSON.stringify({
        wpm,
        fillers
      }),
      score,
      'Communication response recorded.'
    ]))[0];

    await q(`
      INSERT INTO interview_transcripts(
        interview_id,
        question_id,
        speaker,
        text
      )
      VALUES(
        $1,$2,'candidate',$3
      )
    `,[
      req.body.interviewId,
      req.body.questionId,
      text
    ]);

    res.json({
      success:true,
      score,
      metrics:{
        wpm,
        fillers,
        wordCount:words.length
      },
      feedback:
        'Communication score combines transcript structure and delivery metrics. Human review should consider the full response.'
    });
  }
);


/* =========================================================
   CODING RUN
========================================================= */

r.post(
  '/coding/run',
  auth,
  role('candidate'),
  aiLimiter,
  async(req,res)=>{

    const i=(await q(`
      SELECT
        i.*,
        c.user_id

      FROM interviews i

      JOIN candidates c
        ON c.id=i.candidate_id

      WHERE i.id=$1
    `,[req.body.interviewId]))[0];

    if(
      !i||
      i.user_id!==req.user.id
    ){
      return res.status(403).json({
        message:'Forbidden'
      });
    }

    const qu=(await q(`
      SELECT *
      FROM questions
      WHERE id=$1
      AND interview_id=$2
    `,[
      req.body.questionId,
      req.body.interviewId
    ]))[0];

    const tests=
      qu?.metadata?.tests||
      [
        {
          input:'10,5,8,10,3',
          expected:'8'
        },
        {
          input:'1,2,3',
          expected:'2'
        }
      ];

    const results=[];

    for(const t of tests){

      results.push(
        await run(
          req.body.language,
          req.body.code,
          t.input,
          t.expected
        )
      );
    }

    res.json({
      success:true,
      results
    });
  }
);


/* =========================================================
   CODING SUBMIT
========================================================= */

r.post(
  '/coding/submit',
  auth,
  role('candidate'),
  async(req,res)=>{

    const i=(await q(`
      SELECT
        i.*,
        c.user_id

      FROM interviews i

      JOIN candidates c
        ON c.id=i.candidate_id

      WHERE i.id=$1
    `,[req.body.interviewId]))[0];

    if(
      !i||
      i.user_id!==req.user.id
    ){
      return res.status(403).json({
        message:'Forbidden'
      });
    }

    const tr=
      req.body.testResults||[];

    const correctness=
      tr.length
        ?tr.filter(
          x=>x.passed
        ).length/tr.length*100
        :0;

    const score=
      Math.round(correctness);

    await q(`
      INSERT INTO coding_assessments(
        interview_id,
        question_id,
        kind,
        language,
        code,
        test_results,
        correctness,
        score
      )
      VALUES(
        $1,$2,'coding',$3,$4,$5,$6,$7
      )
    `,[
      i.id,
      req.body.questionId,
      req.body.language,
      req.body.code,
      JSON.stringify(tr),
      correctness,
      score
    ]);

    await q(`
      INSERT INTO answers(
        interview_id,
        question_id,
        answer_text,
        score,
        feedback,
        evaluation
      )
      VALUES(
        $1,$2,$3,$4,$5,$6
      )

      ON CONFLICT(
        interview_id,
        question_id
      )

      DO UPDATE SET
        answer_text=EXCLUDED.answer_text,
        score=EXCLUDED.score,
        feedback=EXCLUDED.feedback,
        evaluation=EXCLUDED.evaluation
    `,[
      i.id,
      req.body.questionId,
      req.body.code,
      score,
      'Code evaluated against configured tests.',
      JSON.stringify({
        correctness,
        codeQuality:0,
        timeComplexity:0,
        spaceComplexity:0,
        edgeCases:0
      })
    ]);

    res.json({
      success:true,
      score
    });
  }
);


/* =========================================================
   INTEGRITY EVENT
========================================================= */

r.post(
  '/integrity/event',
  auth,
  async(req,res)=>{

    const i=(await q(`
      SELECT
        i.*,
        c.user_id

      FROM interviews i

      JOIN candidates c
        ON c.id=i.candidate_id

      WHERE i.id=$1
    `,[req.body.interviewId]))[0];

    if(
      !i||
      i.user_id!==req.user.id
    ){
      return res.status(403).json({
        message:'Forbidden'
      });
    }

    const severity=
      [
        'info',
        'warning',
        'critical'
      ].includes(req.body.severity)
        ?req.body.severity
        :'warning';

    await q(`
      INSERT INTO verification_events(
        interview_id,
        event_type,
        severity,
        details
      )
      VALUES(
        $1,$2,$3,$4
      )
    `,[
      i.id,
      req.body.eventType,
      severity,
      JSON.stringify(
        req.body.details||{}
      )
    ]);

    const n=
      Number(
        (
          await q(`
            SELECT
              count(*)::int n

            FROM verification_events

            WHERE interview_id=$1

            AND severity IN(
              'warning',
              'critical'
            )
          `,[i.id])
        )[0].n
      );

    await q(`
      UPDATE interviews

      SET integrity_score=
        GREATEST(
          0,
          100-$1*3
        )

      WHERE id=$2
    `,[
      n,
      i.id
    ]);

    res.json({
      success:true,
      integrityScore:
        Math.max(
          0,
          100-n*3
        )
    });
  }
);


/* =========================================================
   COMPLETE INTERVIEW + REPORT
========================================================= */

r.post(
  '/interviews/:id/complete',
  auth,
  role('candidate'),
  async(req,res)=>{

    const i=(await q(`
      SELECT
        i.*,
        c.user_id,
        c.id candidate_id

      FROM interviews i

      JOIN candidates c
        ON c.id=i.candidate_id

      WHERE i.id=$1
    `,[req.params.id]))[0];

    if(
      !i||
      i.user_id!==req.user.id
    ){
      return res.status(403).json({
        message:'Forbidden'
      });
    }

    if(
      i.verification_status!=='verified'&&
      process.env.FACE_VERIFICATION_MODE!=='local_demo'
    ){
      return res.status(409).json({
        message:
          'Identity verification is required before completion'
      });
    }

    const rows=await q(`
      SELECT
        q.stage,
        AVG(a.score) score

      FROM questions q

      LEFT JOIN answers a
        ON a.question_id=q.id
        AND a.interview_id=q.interview_id

      WHERE q.interview_id=$1

      GROUP BY q.stage
    `,[i.id]);

    const s={
      technical:0,
      behavioral:0,
      coding:0,
      communication:0,
      situation:0,
      experience:0
    };

    rows.forEach(x=>{
      if(Object.prototype.hasOwnProperty.call(s,x.stage)) s[x.stage]=Number(x.score||0);
    });

    const answers=await q(`
      SELECT
        q.stage,
        q.skill,
        q.prompt,
        a.answer_text,
        a.evaluation,
        a.score

      FROM questions q

      LEFT JOIN answers a
        ON a.question_id=q.id
        AND a.interview_id=q.interview_id

      WHERE q.interview_id=$1

      ORDER BY q.sequence_no
    `,[i.id]);

    const stageValues=[s.technical,s.coding,s.communication,s.behavioral,s.situation];
    const overall=Math.round(stageValues.reduce((a,v)=>a+v,0)/stageValues.length);

    const duration=
      i.started_at
        ?Math.max(
          0,
          Math.round(
            (
              Date.now()-
              new Date(
                i.started_at
              ).getTime()
            )/1000
          )
        )
        :0;

    const total=
      answers.length;

    const answered=
      answers.filter(
        x=>
          x.answer_text&&
          String(
            x.answer_text
          ).trim()
      ).length;

    const skillTotals={};
    const skillCounts={};

    for(const a of answers){

      if(a.skill){

        skillTotals[a.skill]=
          (
            skillTotals[a.skill]||0
          )+
          Number(a.score||0);

        skillCounts[a.skill]=
          (
            skillCounts[a.skill]||0
          )+1;
      }
    }

    const skillScores={};

    for(
      const k of Object.keys(skillTotals)
    ){

      skillScores[k]=
        Math.round(
          skillTotals[k]/
          skillCounts[k]
        );
    }

    const score={

      technical_knowledge:
        s.technical,

      practical_knowledge:
        Math.round(
          (
            s.experience+
            s.situation+
            s.coding
          )/3
        ),

      problem_solving:
        Math.round(
          (
            s.situation+
            s.coding+
            s.technical
          )/3
        ),

      communication:
        s.communication,

      behavioral:
        s.behavioral,

      role_fit:
        Math.round(
          (
            s.technical+
            s.experience+
            s.situation
          )/3
        ),

      final_score:
        overall,

      skill_scores:
        skillScores
    };

    const ai=
      await summarize({
        job:
          (
            await q(
              'SELECT * FROM jobs WHERE id=$1',
              [i.job_id]
            )
          )[0],

        candidate:
          (
            await q(
              'SELECT * FROM candidates WHERE id=$1',
              [i.candidate_id]
            )
          )[0],

        score,
        answers
      });

    await q(`
      UPDATE interviews

      SET
        status='completed',
        completed_at=NOW(),
        current_stage='complete'

      WHERE id=$1
    `,[i.id]);

    const rep=(await q(`
      INSERT INTO reports(
        interview_id,
        technical_score,
        behavioral_score,
        coding_score,
        communication_score,
        situation_score,
        experience_score,
        overall_score,
        duration_seconds,
        questions_total,
        questions_answered,
        questions_skipped,
        skill_scores,
        summary,
        strengths,
        improvements,
        recommendation_note,
        recommendation
      )

      VALUES(
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
        $11,$12,$13,$14,$15,$16,$17,$18
      )

      ON CONFLICT(interview_id)

      DO UPDATE SET

        technical_score=
          EXCLUDED.technical_score,

        behavioral_score=
          EXCLUDED.behavioral_score,

        coding_score=
          EXCLUDED.coding_score,

        communication_score=
          EXCLUDED.communication_score,

        situation_score=
          EXCLUDED.situation_score,

        experience_score=
          EXCLUDED.experience_score,

        overall_score=
          EXCLUDED.overall_score,

        duration_seconds=
          EXCLUDED.duration_seconds,

        questions_total=
          EXCLUDED.questions_total,

        questions_answered=
          EXCLUDED.questions_answered,

        questions_skipped=
          EXCLUDED.questions_skipped,

        skill_scores=
          EXCLUDED.skill_scores,

        summary=
          EXCLUDED.summary,

        strengths=
          EXCLUDED.strengths,

        improvements=
          EXCLUDED.improvements,

        recommendation_note=
          EXCLUDED.recommendation_note,

        recommendation=
          EXCLUDED.recommendation

      RETURNING *
    `,[
      i.id,
      s.technical,
      s.behavioral,
      s.coding,
      s.communication,
      s.situation,
      s.experience,
      overall,
      duration,
      total,
      answered,
      total-answered,
      JSON.stringify(skillScores),
      ai.summary,
      JSON.stringify(ai.strengths||[]),
      JSON.stringify(ai.improvements||[]),
      'Decision support only; HR must make the final hiring decision.',
      ai.recommendation||
        'Needs Human Review'
    ]))[0];

    await q(`
      INSERT INTO interview_scores(
        interview_id,
        technical_knowledge,
        practical_knowledge,
        problem_solving,
        communication,
        behavioral,
        role_fit,
        final_score,
        skill_scores
      )
      VALUES(
        $1,$2,$3,$4,$5,$6,$7,$8,$9
      )

      ON CONFLICT(interview_id)

      DO UPDATE SET

        technical_knowledge=
          EXCLUDED.technical_knowledge,

        practical_knowledge=
          EXCLUDED.practical_knowledge,

        problem_solving=
          EXCLUDED.problem_solving,

        communication=
          EXCLUDED.communication,

        behavioral=
          EXCLUDED.behavioral,

        role_fit=
          EXCLUDED.role_fit,

        final_score=
          EXCLUDED.final_score,

        skill_scores=
          EXCLUDED.skill_scores
    `,[
      i.id,
      score.technical_knowledge,
      score.practical_knowledge,
      score.problem_solving,
      score.communication,
      score.behavioral,
      score.role_fit,
      score.final_score,
      JSON.stringify(skillScores)
    ]);

    await q(`
      INSERT INTO ai_evaluations(
        interview_id,
        summary,
        strengths,
        improvements,
        recommendation,
        rationale,
        model
      )
      VALUES(
        $1,$2,$3,$4,$5,$6,$7
      )

      ON CONFLICT(interview_id)

      DO UPDATE SET

        summary=
          EXCLUDED.summary,

        strengths=
          EXCLUDED.strengths,

        improvements=
          EXCLUDED.improvements,

        recommendation=
          EXCLUDED.recommendation,

        rationale=
          EXCLUDED.rationale,

        model=
          EXCLUDED.model
    `,[
      i.id,
      ai.summary,
      JSON.stringify(
        ai.strengths||[]
      ),
      JSON.stringify(
        ai.improvements||[]
      ),
      ai.recommendation||
        'Needs Human Review',
      ai.rationale||'',
      process.env.GEMINI_API_KEY
        ?(
          process.env.GEMINI_MODEL||
          'gemini-2.5-flash'
        )
        :'fallback'
    ]);

    await q(`
      UPDATE job_candidates

      SET
        status='interview_completed',
        updated_at=NOW()

      WHERE job_id=$1
      AND candidate_id=$2
    `,[
      i.job_id,
      i.candidate_id
    ]);

    await audit(
      req,
      'interview.completed',
      'interview',
      i.id,
      {overall}
    );

    res.json({
      success:true,
      report:rep
    });
  }
);


/* =========================================================
   CANDIDATE REPORTS
========================================================= */

r.get(
  '/reports/mine',
  auth,
  role('candidate'),
  async(req,res)=>{

    res.json({
      success:true,
      reports:await q(`
        SELECT
          r.*,
          i.job_id,
          j.title,
          i.integrity_score

        FROM reports r

        JOIN interviews i
          ON i.id=r.interview_id

        JOIN jobs j
          ON j.id=i.job_id

        JOIN candidates c
          ON c.id=i.candidate_id

        WHERE c.user_id=$1

        ORDER BY
          r.created_at DESC
      `,[req.user.id])
    });
  }
);


/* =========================================================
   SINGLE REPORT
========================================================= */

r.get(
  '/reports/:id',
  auth,
  async(req,res)=>{

    const x=(await q(`
      SELECT

        r.*,

        i.candidate_id,
        i.job_id,

        j.title,

        c.name,

        u.email,

        i.integrity_score,
        i.status interview_status

      FROM reports r

      JOIN interviews i
        ON i.id=r.interview_id

      JOIN jobs j
        ON j.id=i.job_id

      JOIN candidates c
        ON c.id=i.candidate_id

      JOIN app_users u
        ON u.id=c.user_id

      WHERE r.id=$1
    `,[req.params.id]))[0];

    if(!x){
      return res.status(404).json({
        message:'Report not found'
      });
    }

    if(req.user.role==='candidate'){

      const u=(await q(
        'SELECT user_id FROM candidates WHERE id=$1',
        [x.candidate_id]
      ))[0];

      if(
        !u||
        u.user_id!==req.user.id
      ){
        return res.status(403).json({
          message:'Forbidden'
        });
      }
    }

    res.json({
      success:true,
      report:x
    });
  }
);


module.exports=r;



