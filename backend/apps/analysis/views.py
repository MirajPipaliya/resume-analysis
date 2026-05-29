from rest_framework import views, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from config.mongodb import analyses_collection, candidates_collection, resumes_collection
from bson import ObjectId
from .tasks import generate_questions_task

def format_doc(doc):
    if not doc:
        return None
    doc['id'] = str(doc['_id'])
    del doc['_id']
    return doc

class AnalysisDetailView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        query = {'_id': ObjectId(pk)}
        if getattr(request.user, 'role', '') != 'Admin' and not request.user.is_superuser:
            query['created_by'] = request.user.id
            
        analysis = format_doc(analyses_collection.find_one(query))
        if not analysis:
            return Response({'success': False, 'message': 'Not found or unauthorized', 'errors': []}, status=404)
        
        # Merge resume parsed data
        resume = format_doc(resumes_collection.find_one({'_id': ObjectId(analysis['resume_id'])}))
        if resume:
            analysis['parsed_data'] = resume.get('parsed_data', {})
        
        return Response({'success': True, 'data': analysis, 'message': '', 'errors': []})

class CompareView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        ids = request.query_params.get('ids', '')
        if not ids:
            return Response({'success': False, 'message': 'Candidate IDs required', 'errors': []}, status=400)
        
        candidate_ids = [ObjectId(cid) for cid in ids.split(',') if cid]
        query = {'_id': {'$in': candidate_ids}}
        if getattr(request.user, 'role', '') != 'Admin' and not request.user.is_superuser:
            query['created_by'] = request.user.id
            
        candidates = list(candidates_collection.find(query))
        
        results = []
        for c in candidates:
            analysis = format_doc(analyses_collection.find_one({'_id': ObjectId(c['analysis_id'])}))
            resume = format_doc(resumes_collection.find_one({'_id': ObjectId(c['resume_id'])}))
            if analysis and resume:
                results.append({
                    'candidate': format_doc(c),
                    'analysis': analysis,
                    'parsed_data': resume.get('parsed_data', {})
                })
        
        return Response({'success': True, 'data': results, 'message': 'Comparison data', 'errors': []})

class GenerateQuestionsView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        candidate_id = request.data.get('candidate_id')
        if not candidate_id:
            return Response({'success': False, 'message': 'Candidate ID required', 'errors': []}, status=400)
            
        query = {'_id': ObjectId(candidate_id)}
        if getattr(request.user, 'role', '') != 'Admin' and not request.user.is_superuser:
            query['created_by'] = request.user.id
            
        candidate = candidates_collection.find_one(query)
        if not candidate:
            return Response({'success': False, 'message': 'Candidate not found or unauthorized', 'errors': []}, status=404)
        
        import threading
        threading.Thread(target=generate_questions_task, args=(candidate_id,)).start()
        return Response({'success': True, 'data': None, 'message': 'Question generation started', 'errors': []})

class HistoryView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        query = {}
        if getattr(request.user, 'role', '') != 'Admin' and not request.user.is_superuser:
            query['created_by'] = request.user.id
            
        candidates = list(candidates_collection.find(query).sort('added_at', -1))
        return Response({'success': True, 'data': [format_doc(c) for c in candidates], 'message': 'History retrieved', 'errors': []})

import google.generativeai as genai
import os
import json

genai.configure(api_key=os.environ.get('GEMINI_API_KEY'))
model = genai.GenerativeModel('gemini-flash-latest')

class CoverLetterView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        analysis_id = request.data.get('analysis_id')
        job_desc = request.data.get('job_description', '')
        if not analysis_id:
            return Response({'success': False, 'message': 'Analysis ID is required', 'errors': []}, status=400)
            
        query = {'_id': ObjectId(analysis_id)}
        if getattr(request.user, 'role', '') != 'Admin' and not request.user.is_superuser:
            query['created_by'] = request.user.id
            
        analysis = analyses_collection.find_one(query)
        if not analysis:
            return Response({'success': False, 'message': 'Analysis not found or unauthorized', 'errors': []}, status=404)
            
        resume = resumes_collection.find_one({'_id': ObjectId(analysis['resume_id'])})
        parsed_data = resume.get('parsed_data', {}) if resume else {}
        
        prompt = f"""
You are an expert career consultant. Write a professional, tailored, and persuasive cover letter for this candidate based on their resume details and the target job description. Make it sound human, highlight their achievements that match the job description, and follow a standard cover letter structure (Header, Salutation, Opening, Body Paragraphs, Call to Action, Sign-off).

Candidate Profile:
{json.dumps(parsed_data)[:4000]}

Target Job Description:
{job_desc[:4000]}

Target Role: {analysis.get('job_role', 'Professional')}
Target Field: {analysis.get('job_field', 'General')}

Return only the final cover letter text. Do not add any markdown block format wrapping. Just return the text.
"""
        try:
            resp = model.generate_content(prompt)
            letter_text = resp.text
            return Response({'success': True, 'data': {'cover_letter': letter_text}, 'message': 'Cover letter generated successfully', 'errors': []})
        except Exception as e:
            return Response({'success': False, 'message': f'Error generating cover letter: {str(e)}', 'errors': []}, status=500)

class InterviewFeedbackView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        analysis_id = request.data.get('analysis_id')
        question = request.data.get('question')
        answer = request.data.get('answer')
        
        if not all([analysis_id, question, answer]):
            return Response({'success': False, 'message': 'analysis_id, question, and answer are required', 'errors': []}, status=400)
            
        query = {'_id': ObjectId(analysis_id)}
        if getattr(request.user, 'role', '') != 'Admin' and not request.user.is_superuser:
            query['created_by'] = request.user.id
            
        analysis = analyses_collection.find_one(query)
        if not analysis:
            return Response({'success': False, 'message': 'Analysis not found or unauthorized', 'errors': []}, status=404)
            
        resume = resumes_collection.find_one({'_id': ObjectId(analysis['resume_id'])})
        parsed_data = resume.get('parsed_data', {}) if resume else {}

        prompt = f"""
You are an expert mock interviewer. Evaluate the candidate's answer to the given interview question based on their resume profile.
Analyze the answer for:
1. Strengths (what went well).
2. Areas of Improvement (missing context, unclear points).
3. STAR format alignment (Situation, Task, Action, Result). Did they structure it well?
Provide constructive and actionable feedback.

Candidate Profile:
{json.dumps(parsed_data)[:3000]}

Question: {question}
Candidate's Answer: {answer}

Return ONLY valid JSON:
{{
  "overall_critique": "A summary of how they performed",
  "strengths": ["string"],
  "improvements": ["string"],
  "star_score": 0,
  "star_feedback": "Critique of STAR format usage"
}}
"""
        try:
            resp = model.generate_content(prompt)
            text = resp.text
            if "```json" in text:
                text = text.split("```json")[1].split("```")[0]
            elif "```" in text:
                text = text.split("```")[1].split("```")[0]
            feedback_data = json.loads(text.strip())
            return Response({'success': True, 'data': feedback_data, 'message': 'Feedback generated', 'errors': []})
        except Exception as e:
            return Response({'success': False, 'message': f'Error generating feedback: {str(e)}', 'errors': []}, status=500)
