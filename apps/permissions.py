from rest_framework.permissions import BasePermission

from apps.constants import ROLE_ADMIN, ROLE_AGENT, ROLE_INVESTOR, ROLES, is_staff_admin


def get_user_role(request):
    if not request.user or not request.user.is_authenticated:
        return None
    return getattr(request.user.profile, "role", None)


class IsAuthenticatedAndKnownRole(BasePermission):
    def has_permission(self, request, view):
        role = get_user_role(request)
        return bool(role in ROLES)


class IsAdminRole(BasePermission):
    def has_permission(self, request, view):
        return is_staff_admin(get_user_role(request))


class CanAccessProperties(BasePermission):
    """
    list/retrieve: public
    create/destroy: admin
    update/partial_update: admin (any) or agent (only assigned lands)
    """

    def has_permission(self, request, view):
        role = get_user_role(request)
        action = getattr(view, "action", None)

        if action in ["list", "retrieve"]:
            return True
        if is_staff_admin(role):
            return True
        if role == ROLE_AGENT and action in ["update", "partial_update"]:
            return True
        return False

    def has_object_permission(self, request, view, obj):
        role = get_user_role(request)
        if is_staff_admin(role):
            return True
        if role == ROLE_AGENT:
            return getattr(obj, "assigned_agent_id", None) == request.user.id
        return request.method in ["GET", "HEAD", "OPTIONS"]


class CanAccessLandBookings(BasePermission):
    """
    Investor: create, list/retrieve own.
    Admin: all + accept/reject.
    Agent: create (for assigned listings + optional investor), list/retrieve, accept/reject.
    """

    def has_permission(self, request, view):
        role = get_user_role(request)
        action = getattr(view, "action", None)

        if role == ROLE_INVESTOR:
            return action in [
                "list",
                "retrieve",
                "create",
                "application_attachments",
                "money_receipt",
            ]
        if is_staff_admin(role):
            return True
        if role == ROLE_AGENT:
            return action in ["list", "retrieve", "create", "accept", "reject", "application_attachments"]
        return False


class CanManageAgents(BasePermission):
    def has_permission(self, request, view):
        return is_staff_admin(get_user_role(request))


class CanAccessInvestors(BasePermission):
    """
    Admin: list, retrieve, create, partial_update (KYC + directory).
    Agent: list, retrieve, partial_update (KYC only — same serializer restricts fields).
    """

    def has_permission(self, request, view):
        role = get_user_role(request)
        action = getattr(view, "action", None)
        if action in ["list", "retrieve", "partial_update"]:
            return is_staff_admin(role) or role == ROLE_AGENT
        if action == "create":
            return is_staff_admin(role)
        return False


class CanAccessLandShareListings(BasePermission):
    """
    Same rules as properties: public list/retrieve;
    create/update/partial_update allowed for admin and agent;
    delete admin only.
    """

    def has_permission(self, request, view):
        role = get_user_role(request)
        action = getattr(view, "action", None)

        if action in ["list", "retrieve"]:
            return True
        if is_staff_admin(role):
            return True
        if role == ROLE_AGENT and action in ["create", "update", "partial_update"]:
            return True
        return False

    def has_object_permission(self, request, view, obj):
        role = get_user_role(request)
        if is_staff_admin(role):
            return True
        if role == ROLE_AGENT:
            return getattr(obj, "assigned_agent_id", None) == request.user.id
        return request.method in ["GET", "HEAD", "OPTIONS"]


class CanAccessPlots(BasePermission):
    """
    list/retrieve: public
    create/update/delete: admin or agent
    """

    def has_permission(self, request, view):
        action = getattr(view, "action", None)
        if action in ["list", "retrieve"]:
            return True
        role = get_user_role(request)
        return is_staff_admin(role) or role == ROLE_AGENT
