from rest_framework import views, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from config.mongodb import candidates_collection
from bson import ObjectId

def format_doc(doc):
    doc['id'] = str(doc['_id'])
    del doc['_id']
    return doc

class PipelineListView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        job_id = request.query_params.get('job_id')
        query = {}
        if job_id:
            query['job_id'] = job_id
            
        if getattr(request.user, 'role', '') != 'Admin' and not request.user.is_superuser:
            query['created_by'] = request.user.id
            
        candidates = list(candidates_collection.find(query).sort('score', -1))
        
        stages = {
            'Applied': [],
            'Screening': [],
            'Interview': [],
            'Offer': [],
            'Hired': []
        }
        
        for c in candidates:
            c = format_doc(c)
            stage = c.get('stage', 'Applied')
            if stage in stages:
                stages[stage].append(c)
                
        return Response({
            'success': True,
            'data': stages,
            'message': 'Pipeline retrieved',
            'errors': []
        })

class PipelineMoveView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        candidate_id = request.data.get('candidate_id')
        new_stage = request.data.get('stage')
        
        if not candidate_id or not new_stage:
            return Response({'success': False, 'message': 'Missing data', 'errors': []}, status=400)
            
        query = {'_id': ObjectId(candidate_id)}
        if getattr(request.user, 'role', '') != 'Admin' and not request.user.is_superuser:
            query['created_by'] = request.user.id
            
        result = candidates_collection.update_one(query, {'$set': {'stage': new_stage}})
        if result.matched_count == 0:
            return Response({'success': False, 'message': 'Not found or unauthorized', 'errors': []}, status=404)
            
        return Response({'success': True, 'data': None, 'message': f'Moved to {new_stage}', 'errors': []})

class PipelineStatsView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        job_id = request.query_params.get('job_id')
        query = {}
        if job_id:
            query['job_id'] = job_id
            
        if getattr(request.user, 'role', '') != 'Admin' and not request.user.is_superuser:
            query['created_by'] = request.user.id
            
        pipeline_aggr = list(candidates_collection.aggregate([
            {'$match': query},
            {'$group': {'_id': '$stage', 'count': {'$sum': 1}}}
        ]))
        
        stats = {item['_id']: item['count'] for item in pipeline_aggr}
        
        return Response({
            'success': True,
            'data': stats,
            'message': 'Funnel metrics',
            'errors': []
        })
