from django.conf import settings
from django.urls import path, include
from django.conf.urls.static import static
import downloader.apis 

urlpatterns = [
    path('', include('web.urls')),
    path('api/downloader/', downloader.apis.api.urls)
]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)