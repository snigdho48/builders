def error_response(error_code: int, error_message: str, details: dict | list | str | None = None) -> dict:
    return {
        "success": False,
        "error": {
            "code": error_code,
            "message": error_message,
            "details": details,
        },
        "data": None,
    }


def success_response(data=None, message: str | None = None, pagination=None) -> dict:
    out = {
        "success": True,
        "error": None,
        "data": data,
    }
    if message is not None:
        out["message"] = message
    if pagination is not None:
        out["pagination"] = pagination
    return out
