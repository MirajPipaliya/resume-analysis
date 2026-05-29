from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.accounts.urls')),
    path('api/jobs/', include('apps.jobs.urls')),
    path('api/resumes/', include('apps.resumes.urls')),
    path('api/analysis/', include('apps.analysis.urls')),
    path('api/pipeline/', include('apps.pipeline.urls')),
]
