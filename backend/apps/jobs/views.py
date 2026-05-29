from rest_framework import views, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from config.mongodb import jobs_collection, candidates_collection
from bson import ObjectId
import datetime

def format_job(job):
    job['id'] = str(job['_id'])
    del job['_id']
    return job

class JobListCreateView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        query = {'archived': {'$ne': True}}
        if getattr(request.user, 'role', '') != 'Admin' and not request.user.is_superuser:
            query['created_by'] = request.user.id
            
        jobs = list(jobs_collection.find(query))
        jobs = [format_job(j) for j in jobs]
        # Calculate candidates count for each job
        for j in jobs:
            j['candidate_count'] = candidates_collection.count_documents({'job_id': j['id']})
        return Response({
            'success': True,
            'data': jobs,
            'message': 'Jobs retrieved successfully',
            'errors': []
        })

    def post(self, request):
        data = request.data
        new_job = {
            'title': data.get('title'),
            'department': data.get('department'),
            'location': data.get('location'),
            'type': data.get('type'),
            'description': data.get('description'),
            'required_skills': data.get('required_skills', []),
            'created_at': datetime.datetime.utcnow(),
            'created_by': request.user.id,
            'archived': False
        }
        result = jobs_collection.insert_one(new_job)
        new_job['id'] = str(result.inserted_id)
        del new_job['_id']
        return Response({
            'success': True,
            'data': new_job,
            'message': 'Job created successfully',
            'errors': []
        }, status=status.HTTP_201_CREATED)

class JobDetailView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            query = {'_id': ObjectId(pk)}
            if getattr(request.user, 'role', '') != 'Admin' and not request.user.is_superuser:
                query['created_by'] = request.user.id
                
            job = jobs_collection.find_one(query)
            if not job:
                return Response({'success': False, 'message': 'Job not found', 'errors': ['Not found']}, status=404)
            job = format_job(job)
            job['candidate_count'] = candidates_collection.count_documents({'job_id': job['id']})
            return Response({'success': True, 'data': job, 'message': '', 'errors': []})
        except Exception as e:
            return Response({'success': False, 'message': str(e), 'errors': [str(e)]}, status=400)

    def put(self, request, pk):
        data = request.data
        update_data = {
            'title': data.get('title'),
            'required_skills': data.get('required_skills', []),
            'description': data.get('description'),
            'department': data.get('department'),
            'location': data.get('location'),
            'type': data.get('type')
        }
        # Remove None values
        update_data = {k: v for k, v in update_data.items() if v is not None}
        
        query = {'_id': ObjectId(pk)}
        if getattr(request.user, 'role', '') != 'Admin' and not request.user.is_superuser:
            query['created_by'] = request.user.id
            
        result = jobs_collection.update_one(query, {'$set': update_data})
        if result.matched_count == 0:
            return Response({'success': False, 'message': 'Not found or unauthorized', 'errors': []}, status=404)
            
        job = jobs_collection.find_one({'_id': ObjectId(pk)})
        return Response({'success': True, 'data': format_job(job), 'message': 'Job updated', 'errors': []})

    def delete(self, request, pk):
        query = {'_id': ObjectId(pk)}
        if getattr(request.user, 'role', '') != 'Admin' and not request.user.is_superuser:
            query['created_by'] = request.user.id
            
        result = jobs_collection.update_one(query, {'$set': {'archived': True}})
        if result.matched_count == 0:
            return Response({'success': False, 'message': 'Not found or unauthorized', 'errors': []}, status=404)
            
        return Response({'success': True, 'data': None, 'message': 'Job archived', 'errors': []})
