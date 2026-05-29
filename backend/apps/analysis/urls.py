from django.urls import path
from .views import (
    AnalysisDetailView, CompareView, GenerateQuestionsView, 
    HistoryView, CoverLetterView, InterviewFeedbackView
)

urlpatterns = [
    path('history/', HistoryView.as_view(), name='analysis-history'),
    path('compare/', CompareView.as_view(), name='analysis-compare'),
    path('questions/', GenerateQuestionsView.as_view(), name='analysis-questions'),
    path('cover-letter/', CoverLetterView.as_view(), name='analysis-cover-letter'),
    path('interview-feedback/', InterviewFeedbackView.as_view(), name='analysis-interview-feedback'),
    path('<str:pk>/', AnalysisDetailView.as_view(), name='analysis-detail'),
]
