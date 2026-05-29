from django.test import TestCase
from rest_framework.test import APITestCase
from unittest.mock import patch, MagicMock
from bson import ObjectId
import json
import datetime
from django.contrib.auth import get_user_model

from .tasks import process_resume_task, generate_questions_task, parse_json

User = get_user_model()

class WhiteBoxTasksTests(TestCase):
    @patch('apps.analysis.tasks.resumes_collection')
    @patch('apps.analysis.tasks.analyses_collection')
    @patch('apps.analysis.tasks.candidates_collection')
    @patch('apps.analysis.tasks.model')
    def test_process_resume_task_success(self, mock_model, mock_candidates, mock_analyses, mock_resumes):
        # Setup mock data
        resume_id = ObjectId()
        mock_resumes.find_one.return_value = {
            '_id': resume_id,
            'raw_text': 'This is a sample resume.'
        }
        
        # Mock Gemini AI response
        mock_parse_resp = MagicMock()
        mock_parse_resp.text = '```json\n{"name": "John Doe", "email": "john@example.com"}\n```'
        
        mock_score_resp = MagicMock()
        mock_score_resp.text = '```json\n{"overall_score": 85, "recommendation": "yes"}\n```'
        
        mock_model.generate_content.side_effect = [mock_parse_resp, mock_score_resp]
        
        mock_analyses.insert_one.return_value = MagicMock(inserted_id=ObjectId())
        
        # Execute
        result = process_resume_task(str(resume_id), "Software Engineer", "IT")
        
        # Assertions
        self.assertIsNotNone(result)
        
        # Ensure status updates are made
        mock_resumes.update_one.assert_any_call(
            {'_id': resume_id},
            {'$set': {'status': 'Parsing'}}
        )
        
        # Ensure AI was called twice
        self.assertEqual(mock_model.generate_content.call_count, 2)
        
        # Ensure insertions are called
        self.assertTrue(mock_analyses.insert_one.called)
        self.assertTrue(mock_candidates.insert_one.called)

    def test_parse_json_resilient(self):
        # Valid JSON
        res = parse_json('{"key": "value"}')
        self.assertEqual(res, {"key": "value"})
        
        # JSON with markdown
        res = parse_json('```json\n{"key": "value2"}\n```')
        self.assertEqual(res, {"key": "value2"})
        
        # Malformed JSON (should return empty dict without crashing)
        res = parse_json('{"key": "value"')
        self.assertEqual(res, {})


class BlackBoxAPITests(APITestCase):
    def setUp(self):
        # Create a test user
        self.user = User.objects.create_user(username='testuser', password='password123', email='test@example.com')
        self.client.force_authenticate(user=self.user)
    
    @patch('apps.analysis.views.analyses_collection')
    @patch('apps.analysis.views.resumes_collection')
    @patch('apps.analysis.views.model')
    def test_cover_letter_generation(self, mock_model, mock_resumes, mock_analyses):
        # Setup mock db responses
        analysis_id = ObjectId()
        resume_id = ObjectId()
        
        mock_analyses.find_one.return_value = {
            '_id': analysis_id,
            'resume_id': str(resume_id),
            'job_role': 'Developer',
            'created_by': self.user.id
        }
        
        mock_resumes.find_one.return_value = {
            '_id': resume_id,
            'parsed_data': {'name': 'John'}
        }
        
        # Setup mock AI
        mock_resp = MagicMock()
        mock_resp.text = "Dear Hiring Manager, ..."
        mock_model.generate_content.return_value = mock_resp
        
        # Request
        data = {
            "analysis_id": str(analysis_id),
            "job_description": "Looking for a React developer."
        }
        response = self.client.post('/api/analysis/cover-letter/', data, format='json')
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['success'], True)
        self.assertIn("cover_letter", response.data['data'])
        self.assertEqual(response.data['data']['cover_letter'], "Dear Hiring Manager, ...")

    def test_cover_letter_missing_fields(self):
        # Test 400 when analysis_id is missing
        response = self.client.post('/api/analysis/cover-letter/', {}, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertFalse(response.data['success'])

    @patch('apps.analysis.views.analyses_collection')
    @patch('apps.analysis.views.resumes_collection')
    @patch('apps.analysis.views.model')
    def test_interview_feedback_generation(self, mock_model, mock_resumes, mock_analyses):
        # Setup mock db responses
        analysis_id = ObjectId()
        resume_id = ObjectId()
        
        mock_analyses.find_one.return_value = {
            '_id': analysis_id,
            'resume_id': str(resume_id),
            'created_by': self.user.id
        }
        
        mock_resumes.find_one.return_value = {
            '_id': resume_id,
            'parsed_data': {'name': 'John'}
        }
        
        # Setup mock AI
        mock_resp = MagicMock()
        mock_resp.text = '```json\n{"overall_critique": "Good", "star_score": 8}\n```'
        mock_model.generate_content.return_value = mock_resp
        
        # Request
        data = {
            "analysis_id": str(analysis_id),
            "question": "Tell me about yourself.",
            "answer": "I am a dev."
        }
        response = self.client.post('/api/analysis/interview-feedback/', data, format='json')
        
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data['success'])
        self.assertEqual(response.data['data']['overall_critique'], "Good")
