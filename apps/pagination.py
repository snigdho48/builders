from rest_framework.pagination import PageNumberPagination


class StandardPagePagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100

    def get_page_size(self, request):
        page_size = super().get_page_size(request)
        if page_size is None:
            return self.page_size
        try:
            # Allow client choice (e.g. 10 / 25 / 50) within [page_size, max_page_size].
            return max(self.page_size, min(int(page_size), self.max_page_size))
        except (TypeError, ValueError):
            return self.page_size
