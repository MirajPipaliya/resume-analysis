from django.urls import path
from .views import PipelineListView, PipelineMoveView, PipelineStatsView

urlpatterns = [
    path('', PipelineListView.as_view(), name='pipeline-list'),
    path('move/', PipelineMoveView.as_view(), name='pipeline-move'),
    path('stats/', PipelineStatsView.as_view(), name='pipeline-stats'),
]
