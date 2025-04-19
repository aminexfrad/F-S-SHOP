from django.contrib import admin
from django.urls import path
from strawberry.django.views import GraphQLView
from .schema import schema
from chowkidar.view import auth_enabled_view
from strawberry.django.views import GraphQLView
from django.conf import settings
from django.conf.urls.static import static

admin.site.site_header = "ShopifyFR"
admin.site.site_title = "ShopifyFR Admin Portal"
admin.site.index_title = "Welcome to ShopifyFR"

urlpatterns = [
    path('admin/', admin.site.urls),
    path("auth/", auth_enabled_view(GraphQLView.as_view(schema=schema))),
    path("graphql/", GraphQLView.as_view(schema=schema)),
]

if settings.DEBUG:  # Serve media files only in development
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

