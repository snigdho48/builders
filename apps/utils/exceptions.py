from rest_framework import status
from rest_framework.exceptions import ErrorDetail
from rest_framework.response import Response
from rest_framework.views import exception_handler as drf_exception_handler

from .response_formatter import error_response


def _stringify(value):
    if isinstance(value, ErrorDetail):
        return str(value)
    if isinstance(value, list):
        return [_stringify(item) for item in value]
    if isinstance(value, dict):
        return {key: _stringify(val) for key, val in value.items()}
    return value


def custom_exception_handler(exc, context):
    response = drf_exception_handler(exc, context)

    if response is None:
        return Response(
            error_response(
                error_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                error_message="Internal server error",
            ),
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    details = _stringify(response.data)
    message = "Request failed"
    if isinstance(details, dict):
        detail = details.get("detail")
        if detail:
            message = str(detail)
        elif details:
            message = "Validation error"
    elif isinstance(details, list) and details:
        message = str(details[0])
    elif details:
        message = str(details)

    response.data = error_response(
        error_code=response.status_code,
        error_message=message,
        details=details,
    )
    return response
