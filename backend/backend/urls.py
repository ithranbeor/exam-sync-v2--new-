from django.urls import path, re_path
from django.views.generic import RedirectView
from api import views

urlpatterns = [
    # User API
    path('api/login/', views.login_faculty, name='login_faculty'),
    path('api/users/', views.users_list, name='users_list'),
    path('api/users/<int:user_id>/', views.user_detail, name='user_detail'),
    path('api/user-roles/<int:user_id>/roles/', views.user_roles, name='user_roles'),
    path('api/auth/request-password-change/', views.request_password_change, name='request_password_change'),
    path('api/auth/confirm-password-change/', views.confirm_password_change, name='confirm_password_change'),
    path('api/request-password-change/', views.request_password_change, name='request_password_change'),
    path('api/confirm-password-change/', views.confirm_password_change, name='confirm_password_change'),


    # Tables
    path('api/tbl_examperiod', views.tbl_examperiod_list, name='tbl_examperiod_list'),
    path('api/tbl_examperiod/<int:pk>/', views.tbl_examperiod_detail, name='tbl_examperiod_detail'),
    path('api/tbl_examperiod/bulk_update/', views.tbl_examperiod_bulk_update),
    path('api/tbl_user_role', views.tbl_user_role_list, name='tbl_user_role_list'),
    path('api/tbl_user_role/<int:user_role_id>/', views.tbl_user_role_detail, name='tbl_user_role_detail'),
    path('api/tbl_user_role/CRUD/', views.tbl_user_role_list, name='tbl_user_role_list'),
    path('api/inbox', views.inbox_list),
    path('api/tbl_term', views.tbl_term_list, name='tbl_term_list'),
    path('api/tbl_term/<int:pk>/', views.tbl_term_detail, name='tbl_term_detail'),
    path('api/tbl_college/', views.tbl_college_list),
    path('api/tbl_college/<str:pk>/', views.tbl_college_detail),
    path('api/departments/', views.department_list, name='department_list'),
    path('api/departments/<str:pk>/', views.department_detail, name='department_detail'),
    path('api/programs/', views.program_list, name='program_list'),
    path('api/programs/<str:pk>/', views.program_detail, name='program_detail'),
    path('api/courses/', views.courses_list, name='courses_list'),
    path('api/courses/<str:pk>/', views.course_detail, name='course_detail'),
    path('api/tbl_buildings', views.tbl_buildings_list, name='tbl_buildings_list'),
    path('api/tbl_buildings/<str:pk>', views.tbl_buildings_detail, name='tbl_buildings_detail'),
    path('api/tbl_rooms', views.tbl_rooms_list, name='tbl_rooms_list'),
    path('api/tbl_rooms/<str:pk>/', views.tbl_rooms_detail, name='tbl_rooms_detail'),
    path('api/accounts/', views.accounts_list, name='accounts_list'),
    path('api/accounts/<int:pk>/', views.accounts_detail, name='accounts_detail'),
    path('api/tbl_roles/', views.tbl_roles_list, name='tbl_roles_list'),
    path('api/tbl_roles/<int:role_id>/', views.tbl_roles_detail, name='tbl_roles_detail'),
    path('api/user-role-history/', views.user_role_history_list, name='user_role_history_list'),
    path('api/user-role-history/create/', views.user_role_history_create, name='user_role_history_create'),
    path('api/tbl_sectioncourse/', views.tbl_sectioncourse_list, name='tbl_sectioncourse_list'),
    path('api/tbl_sectioncourse/<int:pk>/', views.tbl_sectioncourse_detail, name='tbl_sectioncourse_detail'),
    path('api/tbl_course_users/', views.tbl_course_users_list, name='tbl_course_users_list'),
    path('api/tbl_course_users/<str:course_id>/<int:user_id>/', views.tbl_course_users_detail, name='tbl_course_users_detail'),
    path('api/tbl_availability/', views.tbl_availability_list, name='tbl_availability_list'),
    path('api/tbl_availability/<int:availability_id>/', views.tbl_availability_detail, name='tbl_availability_detail'),
    path('api/tbl_modality/', views.tbl_modality_list, name='tbl_modality_list'),
    path('api/tbl_modality/<int:pk>/', views.tbl_modality_detail, name='tbl_modality_detail'),
    path('api/tbl_examdetails', views.tbl_examdetails_list, name='tbl_examdetails_list'),
    path('api/tbl_examdetails/<int:pk>/', views.tbl_examdetails_detail, name='tbl_examdetails_detail'),

    # Redirect frontend routes to React
    re_path(r'^(?!api/).*$', RedirectView.as_view(url='http://localhost:5173/', permanent=False)),
]