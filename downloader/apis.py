import os
from wsgiref.util import FileWrapper
from django.conf import settings
from django.http import HttpRequest, FileResponse, StreamingHttpResponse
from ninja import NinjaAPI

api = NinjaAPI()

@api.api_operation(['GET', 'HEAD'], '/download/metadata')
def get_metadata(request: HttpRequest):
  file_path = settings.STORAGE_ROOT / '10G_DUMMY'
  file_size = os.path.getsize(file_path)
  return file_size

@api.get('/download/file')
def get_download_file(request: HttpRequest):
  
  return FileResponse(
    open(settings.STORAGE_ROOT / '10G_DUMMY', 'rb'), 
    as_attachment=True,
    filename="10G_DUMMY",
  )

@api.get('/download/stream')
def get_download_stream(request: HttpRequest):

  response = StreamingHttpResponse(streaming_content=FileWrapper(open(settings.STORAGE_ROOT / '10G_DUMMY', 'rb')), content_type='application/octet-stream')
  response['Content-Disposition'] = 'attachment; filename=10G_DUMMY'

  return response

@api.get('/download/chunk')
def get_download_chunk(request: HttpRequest):

  file_path = settings.STORAGE_ROOT / '10G_DUMMY'
  file_size = os.path.getsize(file_path)

  start, end = request.headers.get('Range').split('=')[-1].split('-')
  start = int(start)
  end = int(end) if end else file_size - 1
  chunk_size = end - start + 1

  file = open(file_path, 'rb')
  file.seek(start)

  response = FileResponse(file, status=206, content_type='application/octet-stream')
  response['Content-Range'] = f'bytes {start}-{end}/{file_size}'
  response['Content-Length'] = chunk_size
  response.streaming_content = iter(lambda: file.read(chunk_size), b'')

  return response

