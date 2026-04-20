from rest_framework import serializers


class DashboardMonthPointSerializer(serializers.Serializer):
    label = serializers.CharField()
    total = serializers.IntegerField(required=False)
    pending = serializers.IntegerField(required=False)
    users = serializers.IntegerField(required=False)
    properties = serializers.IntegerField(required=False)
    managed = serializers.IntegerField(required=False)


class AdminDashboardSerializer(serializers.Serializer):
    total_users = serializers.IntegerField()
    total_properties = serializers.IntegerField()
    total_bookings = serializers.IntegerField()
    pending_bookings = serializers.IntegerField()
    booking_trend = DashboardMonthPointSerializer(many=True)
    asset_trend = DashboardMonthPointSerializer(many=True)


class AgentDashboardSerializer(serializers.Serializer):
    managed_properties = serializers.IntegerField()
    pending_bookings = serializers.IntegerField()
    workload_trend = DashboardMonthPointSerializer(many=True)


class InvestorDashboardSerializer(serializers.Serializer):
    my_pending_bookings = serializers.IntegerField()
    my_accepted_bookings = serializers.IntegerField()
    my_rejected_bookings = serializers.IntegerField()
    kyc_status = serializers.CharField()
    kyc_requested_at = serializers.CharField(allow_blank=True)
