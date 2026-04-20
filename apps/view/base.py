from django.db import transaction
from rest_framework import status, viewsets
from rest_framework.response import Response

from apps.pagination import StandardPagePagination
from apps.utils.response_formatter import success_response


class ResponseEnvelopeMixin:
    def build_pagination(self):
        page = self.paginator.page
        return {
            "page": page.number,
            "page_size": page.paginator.per_page,
            "count": page.paginator.count,
            "total_pages": page.paginator.num_pages,
            "has_next": page.has_next(),
            "has_previous": page.has_previous(),
        }

    def respond(self, data=None, message=None, pagination=None, status_code=status.HTTP_200_OK):
        return Response(
            success_response(data=data, message=message, pagination=pagination),
            status=status_code,
        )


class StandardReadOnlyModelViewSet(ResponseEnvelopeMixin, viewsets.ReadOnlyModelViewSet):
    pagination_class = StandardPagePagination

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.respond(
                data=serializer.data,
                pagination=self.build_pagination(),
            )

        serializer = self.get_serializer(queryset, many=True)
        return self.respond(data=serializer.data)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return self.respond(data=serializer.data)


class StandardModelViewSet(StandardReadOnlyModelViewSet, viewsets.ModelViewSet):
    @transaction.atomic
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return self.respond(data=serializer.data, message="Created", status_code=status.HTTP_201_CREATED)

    @transaction.atomic
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return self.respond(data=serializer.data, message="Updated")

    def partial_update(self, request, *args, **kwargs):
        kwargs["partial"] = True
        return self.update(request, *args, **kwargs)

    @transaction.atomic
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return self.respond(data=None, message="Deleted")
