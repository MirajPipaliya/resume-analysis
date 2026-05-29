from rest_framework import views, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from django.core.files.storage import FileSystemStorage
from config.mongodb import resumes_collection, candidates_collection
from bson import ObjectId
import fitz
import docx
import datetime
from apps.analysis.tasks import process_resume_task


def extract_text(file_path):
    ext = file_path.split('.')[-1].lower()
    text = ""
    try:
        if ext == 'pdf':
            doc = fitz.open(file_path)
            for page in doc:
                text += page.get_text()
        elif ext == 'docx':
            doc = docx.Document(file_path)
            text = "\n".join([para.text for para in doc.paragraphs])
    except Exception as e:
        print(f"Extraction error: {e}")
    return text


def format_doc(doc):
    doc['id'] = str(doc['_id'])
    del doc['_id']
    return doc


class ResumeUploadView(views.APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request):
        file_obj  = request.FILES.get('file')
        job_role  = request.data.get('job_role', 'General Professional')
        job_field = request.data.get('job_field', 'General')

        if not file_obj:
            return Response(
                {'success': False, 'message': 'No file provided.', 'errors': []},
                status=400
            )

        fs = FileSystemStorage()
        filename  = fs.save(file_obj.name, file_obj)
        file_path = fs.path(filename)

        text = extract_text(file_path)

        resume_data = {
            'filename':    filename,
            'job_role':    job_role,
            'job_field':   job_field,
            'raw_text':    text,
            'upload_date': datetime.datetime.utcnow(),
            'created_by':  request.user.id,
            'status':      'Parsing',
        }
        result    = resumes_collection.insert_one(resume_data)
        resume_id = str(result.inserted_id)

        import threading
        threading.Thread(
            target=process_resume_task, 
            args=(resume_id, job_role, job_field, request.user.id)
        ).start()

        return Response({
            'success': True,
            'data':    {'resume_id': resume_id},
            'message': 'Resume uploaded. AI analysis started.',
            'errors':  [],
        })


class ResumeListView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        query = {}
        if getattr(request.user, 'role', '') != 'Admin' and not request.user.is_superuser:
            query['created_by'] = request.user.id
            
        resumes = list(resumes_collection.find(query))
        return Response({
            'success': True,
            'data':    [format_doc(r) for r in resumes],
            'message': '',
            'errors':  [],
        })


class ResumeDetailView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            query = {'_id': ObjectId(pk)}
            if getattr(request.user, 'role', '') != 'Admin' and not request.user.is_superuser:
                query['created_by'] = request.user.id
                
            resume = resumes_collection.find_one(query)
            if not resume:
                return Response(
                    {'success': False, 'message': 'Not found or unauthorized', 'errors': []},
                    status=404
                )
            return Response({'success': True, 'data': format_doc(resume), 'message': '', 'errors': []})
        except Exception:
            return Response(
                {'success': False, 'message': 'Invalid ID', 'errors': []},
                status=400
            )

    def delete(self, request, pk):
        query = {'_id': ObjectId(pk)}
        if getattr(request.user, 'role', '') != 'Admin' and not request.user.is_superuser:
            query['created_by'] = request.user.id
            
        result = resumes_collection.delete_one(query)
        if result.deleted_count == 0:
            return Response({'success': False, 'message': 'Not found or unauthorized'}, status=404)
            
        candidates_collection.delete_one({'resume_id': pk})
        return Response({'success': True, 'data': None, 'message': 'Deleted', 'errors': []})
