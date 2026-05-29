from celery import shared_task
from config.mongodb import resumes_collection, candidates_collection, analyses_collection
from bson import ObjectId
import google.generativeai as genai
import os
import json
import datetime

genai.configure(api_key=os.environ.get('GEMINI_API_KEY'))
model = genai.GenerativeModel('gemini-flash-latest')


def parse_json(text):
    try:
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0]
        elif "```" in text:
            text = text.split("```")[1].split("```")[0]
        return json.loads(text.strip())
    except Exception as e:
        print(f"JSON parse error: {e}\nRaw: {text[:300]}")
        return {}


@shared_task
def process_resume_task(resume_id, job_role="General Professional", job_field="General", user_id=None):
    resume = resumes_collection.find_one({'_id': ObjectId(resume_id)})
    if not resume:
        return

    raw_text = resume.get('raw_text', '')

    try:
        # ── 1. PARSE RESUME ────────────────────────────────────────────────────
        resumes_collection.update_one(
            {'_id': ObjectId(resume_id)},
            {'$set': {'status': 'Parsing'}}
        )

        parse_prompt = f"""
You are an expert HR analyst. Parse this resume and return ONLY valid JSON with no extra text:
{{
  "name": "string",
  "email": "string",
  "phone": "string",
  "location": "string",
  "summary": "2-3 sentence professional summary",
  "experience_years": 0,
  "skills": [{{"name": "string", "level": "beginner|intermediate|advanced|expert", "years": 0}}],
  "work_history": [{{"company": "string", "title": "string", "start": "string", "end": "string", "highlights": ["string"]}}],
  "education": [{{"degree": "string", "field": "string", "institution": "string", "year": 0}}],
  "certifications": ["string"],
  "languages": ["string"]
}}

Resume Text:
{raw_text[:6000]}
"""
        parse_resp  = model.generate_content(parse_prompt)
        parsed_data = parse_json(parse_resp.text)

        resumes_collection.update_one(
            {'_id': ObjectId(resume_id)},
            {'$set': {'parsed_data': parsed_data, 'status': 'AI Analysis'}}
        )

        # ── 2. AI SCORING against job_role + job_field ─────────────────────────
        score_prompt = f"""
You are a senior recruiter evaluating a candidate who wants to be a "{job_role}" in the "{job_field}" field.
Analyse the resume data and return ONLY valid JSON:
{{
  "overall_score": 0,
  "breakdown": {{
    "skills_match":       {{"score": 0, "matched": ["string"], "missing": ["string"]}},
    "experience_fit":     {{"score": 0, "reasoning": "string"}},
    "education_fit":      {{"score": 0, "reasoning": "string"}},
    "culture_indicators": {{"score": 0, "signals": ["string"]}}
  }},
  "strengths":      ["string"],
  "gaps":           ["string"],
  "ats_optimization": {{
    "missing_keywords": ["string"],
    "actionable_tips":  ["string"]
  }},
  "recommendation": "strong_yes|yes|maybe|no",
  "summary":        "3-4 sentence evaluation"
}}

Target Role:  {job_role}
Target Field: {job_field}
Candidate:    {json.dumps(parsed_data)[:4000]}
"""
        score_resp = model.generate_content(score_prompt)
        score_data = parse_json(score_resp.text)

        # ── 3. SAVE ANALYSIS + CANDIDATE ───────────────────────────────────────
        analysis_record = {
            'resume_id':  str(resume_id),
            'job_role':   job_role,
            'job_field':  job_field,
            'score_data': score_data,
            'created_at': datetime.datetime.utcnow(),
            'created_by': user_id,
        }
        ar_res = analyses_collection.insert_one(analysis_record)

        candidate = {
            'resume_id':   str(resume_id),
            'analysis_id': str(ar_res.inserted_id),
            'name':        parsed_data.get('name', 'Unknown'),
            'email':       parsed_data.get('email', ''),
            'job_role':    job_role,
            'job_field':   job_field,
            'score':       score_data.get('overall_score', 0),
            'stage':       'Applied',
            'added_at':    datetime.datetime.utcnow(),
            'created_by':  user_id,
        }
        candidates_collection.insert_one(candidate)

        resumes_collection.update_one(
            {'_id': ObjectId(resume_id)},
            {'$set': {'status': 'Done'}}
        )
        return str(ar_res.inserted_id)

    except Exception as e:
        import traceback
        print(f"CRITICAL ERROR IN PROCESS_RESUME_TASK: {str(e)}")
        traceback.print_exc()
        resumes_collection.update_one(
            {'_id': ObjectId(resume_id)},
            {'$set': {'status': 'Failed', 'error': str(e)}}
        )
        return None


@shared_task
def generate_questions_task(candidate_id):
    candidate = candidates_collection.find_one({'_id': ObjectId(candidate_id)})
    if not candidate:
        return

    analyses_collection.update_one(
        {'_id': ObjectId(candidate['analysis_id'])},
        {'$set': {'interview_questions_error': None}}
    )

    resume     = resumes_collection.find_one({'_id': ObjectId(candidate['resume_id'])})
    parsed     = resume.get('parsed_data', {}) if resume else {}
    job_role   = candidate.get('job_role',  'the target role')
    job_field  = candidate.get('job_field', 'the field')

    prompt = f"""
Generate 9 targeted interview questions for a candidate applying as a "{job_role}" in "{job_field}".
Return ONLY valid JSON:
{{
  "technical":   [{{"question": "string", "why": "string", "look_for": "string"}}],
  "behavioral":  [{{"question": "string", "competency": "string"}}],
  "situational": [{{"question": "string", "scenario": "string"}}]
}}

Candidate profile: {json.dumps(parsed)[:3000]}
Target role:  {job_role}
Target field: {job_field}
"""
    try:
        resp   = model.generate_content(prompt)
        q_data = parse_json(resp.text)

        analyses_collection.update_one(
            {'_id': ObjectId(candidate['analysis_id'])},
            {'$set': {'interview_questions': q_data, 'interview_questions_error': None}}
        )
        return True
    except Exception as e:
        print(f"Error in generate_questions_task: {str(e)}")
        analyses_collection.update_one(
            {'_id': ObjectId(candidate['analysis_id'])},
            {'$set': {'interview_questions_error': str(e)}}
        )
        return False
