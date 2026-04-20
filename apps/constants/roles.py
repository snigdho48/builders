ROLE_ADMIN = "admin"
ROLE_INVESTOR = "investor"
ROLE_AGENT = "agent"

ROLES = (ROLE_ADMIN, ROLE_INVESTOR, ROLE_AGENT)

STAFF_ADMIN_ROLES = frozenset({ROLE_ADMIN})


def is_staff_admin(role: str | None) -> bool:
    return role in STAFF_ADMIN_ROLES
