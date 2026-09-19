CREATE TABLE IF NOT EXISTS app_users(
 id SERIAL PRIMARY KEY,email VARCHAR(255) UNIQUE NOT NULL,password_hash TEXT,
 role VARCHAR(20) NOT NULL CHECK(role IN('admin','candidate')),
 must_set_password BOOLEAN DEFAULT FALSE,setup_code VARCHAR(100),
 last_login_at TIMESTAMP,created_at TIMESTAMP DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS jobs(
 id SERIAL PRIMARY KEY,title VARCHAR(255) NOT NULL,description TEXT,
 required_skills TEXT[] DEFAULT '{}',secondary_skills TEXT[] DEFAULT '{}',
 experience_min NUMERIC DEFAULT 0,experience_max NUMERIC,education TEXT DEFAULT '',
 certifications TEXT[] DEFAULT '{}',location VARCHAR(255),status VARCHAR(30) DEFAULT 'open',
 created_by INT REFERENCES app_users(id),created_at TIMESTAMP DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS candidates(
 id SERIAL PRIMARY KEY,user_id INT UNIQUE REFERENCES app_users(id) ON DELETE CASCADE,
 name VARCHAR(255),phone VARCHAR(50),education TEXT,experience_years NUMERIC DEFAULT 0,
 resume_url TEXT,resume_text TEXT,resume_analysis JSONB DEFAULT '{}',
 profile_photo_url TEXT,skills TEXT[] DEFAULT '{}',secondary_skills TEXT[] DEFAULT '{}',
 technical_skills TEXT[] DEFAULT '{}',soft_skills TEXT[] DEFAULT '{}',
 certifications TEXT[] DEFAULT '{}',updated_at TIMESTAMP DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS job_candidates(
 id SERIAL PRIMARY KEY,job_id INT REFERENCES jobs(id) ON DELETE CASCADE,
 candidate_id INT REFERENCES candidates(id) ON DELETE CASCADE,status VARCHAR(40) DEFAULT 'invited',
 invited_at TIMESTAMP DEFAULT NOW(),updated_at TIMESTAMP DEFAULT NOW(),
 UNIQUE(job_id,candidate_id)
);
CREATE TABLE IF NOT EXISTS interview_configs(
 id SERIAL PRIMARY KEY,job_id INT UNIQUE REFERENCES jobs(id) ON DELETE CASCADE,
 question_count INT DEFAULT 20,duration_minutes INT DEFAULT 45,difficulty VARCHAR(30) DEFAULT 'intermediate',
 technical_pct NUMERIC DEFAULT 20,behavioral_pct NUMERIC DEFAULT 20,scenario_pct NUMERIC DEFAULT 20,
 communication_pct NUMERIC DEFAULT 20,experience_pct NUMERIC DEFAULT 20,
 technical_question_count INT DEFAULT 4,coding_question_count INT DEFAULT 4,
 communication_question_count INT DEFAULT 4,behavioral_question_count INT DEFAULT 4,scenario_question_count INT DEFAULT 4,
 technical_pass_score NUMERIC DEFAULT 60,coding_pass_score NUMERIC DEFAULT 60,
 communication_pass_score NUMERIC DEFAULT 60,behavioral_pass_score NUMERIC DEFAULT 60,scenario_pass_score NUMERIC DEFAULT 60,
 coding_enabled BOOLEAN DEFAULT TRUE,sql_enabled BOOLEAN DEFAULT TRUE,debugging_enabled BOOLEAN DEFAULT TRUE,
 output_prediction_enabled BOOLEAN DEFAULT TRUE,communication_enabled BOOLEAN DEFAULT TRUE,
 language VARCHAR(30) DEFAULT 'en-IN',personality TEXT DEFAULT 'professional and encouraging',
 passing_score NUMERIC DEFAULT 60,updated_at TIMESTAMP DEFAULT NOW(),created_at TIMESTAMP DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS interviews(
 id SERIAL PRIMARY KEY,job_id INT REFERENCES jobs(id),candidate_id INT REFERENCES candidates(id),
 status VARCHAR(30) DEFAULT 'not_started',current_stage VARCHAR(40),difficulty VARCHAR(30),
 started_at TIMESTAMP,completed_at TIMESTAMP,expires_at TIMESTAMP,
 integrity_score NUMERIC DEFAULT 100,verification_status VARCHAR(40) DEFAULT 'not_started',
 UNIQUE(job_id,candidate_id)
);
CREATE TABLE IF NOT EXISTS questions(
 id SERIAL PRIMARY KEY,interview_id INT REFERENCES interviews(id) ON DELETE CASCADE,
 stage VARCHAR(40) NOT NULL,sequence_no INT NOT NULL,type VARCHAR(40),skill VARCHAR(255),
 difficulty VARCHAR(30),prompt TEXT NOT NULL,options JSONB DEFAULT '[]',correct_answer TEXT,
 rubric JSONB DEFAULT '{}',metadata JSONB DEFAULT '{}',generated_by VARCHAR(100),
 UNIQUE(interview_id,sequence_no)
);
CREATE TABLE IF NOT EXISTS answers(
 id SERIAL PRIMARY KEY,interview_id INT REFERENCES interviews(id) ON DELETE CASCADE,
 question_id INT REFERENCES questions(id) ON DELETE CASCADE,answer_text TEXT,answer_json JSONB DEFAULT '{}',
 score NUMERIC DEFAULT 0,evaluation JSONB DEFAULT '{}',feedback TEXT,submitted_at TIMESTAMP DEFAULT NOW(),
 UNIQUE(interview_id,question_id)
);
CREATE TABLE IF NOT EXISTS answer_evaluations(
 id SERIAL PRIMARY KEY,answer_id INT UNIQUE REFERENCES answers(id) ON DELETE CASCADE,
 correctness NUMERIC DEFAULT 0,relevance NUMERIC DEFAULT 0,technical_knowledge NUMERIC DEFAULT 0,
 problem_solving NUMERIC DEFAULT 0,communication NUMERIC DEFAULT 0,confidence NUMERIC DEFAULT 0,
 depth NUMERIC DEFAULT 0,practical_knowledge NUMERIC DEFAULT 0,overall NUMERIC DEFAULT 0,
 feedback TEXT,evidence JSONB DEFAULT '[]',model VARCHAR(100)
);
CREATE TABLE IF NOT EXISTS generated_questions(
 id SERIAL PRIMARY KEY,interview_id INT REFERENCES interviews(id) ON DELETE CASCADE,
 question_id INT REFERENCES questions(id) ON DELETE CASCADE,model VARCHAR(100),prompt_version VARCHAR(50),
 context JSONB DEFAULT '{}'
);
CREATE TABLE IF NOT EXISTS verification_events(
 id SERIAL PRIMARY KEY,interview_id INT REFERENCES interviews(id) ON DELETE CASCADE,
 event_type VARCHAR(80),severity VARCHAR(20),details JSONB DEFAULT '{}',created_at TIMESTAMP DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS integrity_events(
 id SERIAL PRIMARY KEY,interview_id INT REFERENCES interviews(id) ON DELETE CASCADE,
 event_type VARCHAR(80),severity VARCHAR(20),details JSONB DEFAULT '{}',created_at TIMESTAMP DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS face_verifications(
 id SERIAL PRIMARY KEY,interview_id INT UNIQUE REFERENCES interviews(id) ON DELETE CASCADE,
 provider VARCHAR(100),status VARCHAR(40),similarity NUMERIC,live_photo_hash TEXT,
 consented_at TIMESTAMP,completed_at TIMESTAMP
);
CREATE TABLE IF NOT EXISTS communication_attempts(
 id SERIAL PRIMARY KEY,interview_id INT REFERENCES interviews(id) ON DELETE CASCADE,
 question_id INT REFERENCES questions(id),transcript TEXT,duration_seconds NUMERIC DEFAULT 0,
 metrics JSONB DEFAULT '{}',score NUMERIC DEFAULT 0,created_at TIMESTAMP DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS coding_assessments(
 id SERIAL PRIMARY KEY,interview_id INT REFERENCES interviews(id) ON DELETE CASCADE,
 question_id INT REFERENCES questions(id),kind VARCHAR(30),language VARCHAR(30),code TEXT,
 test_results JSONB DEFAULT '[]',correctness NUMERIC DEFAULT 0,score NUMERIC DEFAULT 0,created_at TIMESTAMP DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS interview_transcripts(
 id SERIAL PRIMARY KEY,interview_id INT REFERENCES interviews(id) ON DELETE CASCADE,
 question_id INT REFERENCES questions(id),speaker VARCHAR(30),text TEXT,created_at TIMESTAMP DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS reports(
 id SERIAL PRIMARY KEY,interview_id INT UNIQUE REFERENCES interviews(id) ON DELETE CASCADE,
 selection_status VARCHAR(30) DEFAULT 'under_review',technical_score NUMERIC DEFAULT 0,
 behavioral_score NUMERIC DEFAULT 0,coding_score NUMERIC DEFAULT 0,communication_score NUMERIC DEFAULT 0,
 situation_score NUMERIC DEFAULT 0,experience_score NUMERIC DEFAULT 0,overall_score NUMERIC DEFAULT 0,
 duration_seconds INT DEFAULT 0,questions_total INT DEFAULT 0,questions_answered INT DEFAULT 0,questions_skipped INT DEFAULT 0,
 skill_scores JSONB DEFAULT '{}',stage_results JSONB DEFAULT '{}',summary TEXT,strengths JSONB DEFAULT '[]',
 improvements JSONB DEFAULT '[]',recommendation_note TEXT,recommendation TEXT,created_at TIMESTAMP DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS interview_scores(
 id SERIAL PRIMARY KEY,interview_id INT UNIQUE REFERENCES interviews(id) ON DELETE CASCADE,
 technical_knowledge NUMERIC DEFAULT 0,practical_knowledge NUMERIC DEFAULT 0,problem_solving NUMERIC DEFAULT 0,
 communication NUMERIC DEFAULT 0,behavioral NUMERIC DEFAULT 0,role_fit NUMERIC DEFAULT 0,
 final_score NUMERIC DEFAULT 0,skill_scores JSONB DEFAULT '{}'
);
CREATE TABLE IF NOT EXISTS ai_evaluations(
 id SERIAL PRIMARY KEY,interview_id INT UNIQUE REFERENCES interviews(id) ON DELETE CASCADE,
 summary TEXT,strengths JSONB DEFAULT '[]',improvements JSONB DEFAULT '[]',
 recommendation TEXT,rationale TEXT,model VARCHAR(100)
);
CREATE TABLE IF NOT EXISTS audit_logs(
 id SERIAL PRIMARY KEY,user_id INT REFERENCES app_users(id) ON DELETE SET NULL,action VARCHAR(120),
 entity_type VARCHAR(80),entity_id VARCHAR(80),details JSONB DEFAULT '{}',ip VARCHAR(100),created_at TIMESTAMP DEFAULT NOW()
);
-- Upgrade older installations without destroying existing data.
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS secondary_skills TEXT[] DEFAULT '{}';
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS education TEXT DEFAULT '';
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS certifications TEXT[] DEFAULT '{}';
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS secondary_skills TEXT[] DEFAULT '{}';
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS technical_skills TEXT[] DEFAULT '{}';
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS soft_skills TEXT[] DEFAULT '{}';
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS certifications TEXT[] DEFAULT '{}';
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS resume_analysis JSONB DEFAULT '{}';
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS profile_photo_url TEXT;
ALTER TABLE interviews ADD COLUMN IF NOT EXISTS difficulty VARCHAR(30);
ALTER TABLE interviews ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP;
ALTER TABLE interviews ADD COLUMN IF NOT EXISTS verification_status VARCHAR(40) DEFAULT 'not_started';
ALTER TABLE questions ADD COLUMN IF NOT EXISTS skill VARCHAR(255);
ALTER TABLE questions ADD COLUMN IF NOT EXISTS difficulty VARCHAR(30);
ALTER TABLE questions ADD COLUMN IF NOT EXISTS rubric JSONB DEFAULT '{}';
ALTER TABLE questions ADD COLUMN IF NOT EXISTS generated_by VARCHAR(100);
ALTER TABLE answers ADD COLUMN IF NOT EXISTS evaluation JSONB DEFAULT '{}';
ALTER TABLE job_candidates ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();
ALTER TABLE reports ADD COLUMN IF NOT EXISTS experience_score NUMERIC DEFAULT 0;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS duration_seconds INT DEFAULT 0;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS questions_total INT DEFAULT 0;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS questions_answered INT DEFAULT 0;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS questions_skipped INT DEFAULT 0;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS skill_scores JSONB DEFAULT '{}';
ALTER TABLE reports ADD COLUMN IF NOT EXISTS stage_results JSONB DEFAULT '{}';
ALTER TABLE reports ADD COLUMN IF NOT EXISTS recommendation TEXT;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS recommendation_note TEXT;

ALTER TABLE face_verifications ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP;
ALTER TABLE face_verifications ADD COLUMN IF NOT EXISTS details JSONB DEFAULT '{}';
