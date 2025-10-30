# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models
from django.contrib.postgres.fields import ArrayField


class AuthGroup(models.Model):
    name = models.CharField(unique=True, max_length=150)

    class Meta:
        managed = False
        db_table = 'auth_group'


class AuthGroupPermissions(models.Model):
    id = models.BigAutoField(primary_key=True)
    group = models.ForeignKey(AuthGroup, models.DO_NOTHING)
    permission = models.ForeignKey('AuthPermission', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'auth_group_permissions'
        unique_together = (('group', 'permission'),)


class AuthPermission(models.Model):
    name = models.CharField(max_length=255)
    content_type = models.ForeignKey('DjangoContentType', models.DO_NOTHING)
    codename = models.CharField(max_length=100)

    class Meta:
        managed = False
        db_table = 'auth_permission'
        unique_together = (('content_type', 'codename'),)


class AuthUser(models.Model):
    password = models.CharField(max_length=128)
    last_login = models.DateTimeField(blank=True, null=True)
    is_superuser = models.BooleanField()
    username = models.CharField(unique=True, max_length=150)
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    email = models.CharField(max_length=254)
    is_staff = models.BooleanField()
    is_active = models.BooleanField()
    date_joined = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'auth_user'


class AuthUserGroups(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(AuthUser, models.DO_NOTHING)
    group = models.ForeignKey(AuthGroup, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'auth_user_groups'
        unique_together = (('user', 'group'),)


class AuthUserUserPermissions(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(AuthUser, models.DO_NOTHING)
    permission = models.ForeignKey(AuthPermission, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'auth_user_user_permissions'
        unique_together = (('user', 'permission'),)


class DjangoAdminLog(models.Model):
    action_time = models.DateTimeField()
    object_id = models.TextField(blank=True, null=True)
    object_repr = models.CharField(max_length=200)
    action_flag = models.SmallIntegerField()
    change_message = models.TextField()
    content_type = models.ForeignKey('DjangoContentType', models.DO_NOTHING, blank=True, null=True)
    user = models.ForeignKey(AuthUser, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'django_admin_log'


class DjangoContentType(models.Model):
    app_label = models.CharField(max_length=100)
    model = models.CharField(max_length=100)

    class Meta:
        managed = False
        db_table = 'django_content_type'
        unique_together = (('app_label', 'model'),)


class DjangoMigrations(models.Model):
    id = models.BigAutoField(primary_key=True)
    app = models.CharField(max_length=255)
    name = models.CharField(max_length=255)
    applied = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'django_migrations'


class DjangoSession(models.Model):
    session_key = models.CharField(primary_key=True, max_length=40)
    session_data = models.TextField()
    expire_date = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'django_session'


class TblAvailability(models.Model):
    availability_id = models.AutoField(primary_key=True)
    day = models.DateField()
    time_slot = models.TextField()  # This field type is a guess.
    status = models.TextField()  # This field type is a guess.
    remarks = models.TextField(blank=True, null=True)
    user = models.ForeignKey('TblUsers', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'tbl_availability'


class TblBuildings(models.Model):
    building_id = models.CharField(primary_key=True, max_length=50)
    building_name = models.CharField(max_length=500)

    class Meta:
        managed = False
        db_table = 'tbl_buildings'


class TblCollege(models.Model):
    college_id = models.TextField(primary_key=True)
    college_name = models.CharField(max_length=50)

    class Meta:
        managed = True  # <-- change this to True
        db_table = 'tbl_college'

class TblCourse(models.Model):
    course_id = models.CharField(primary_key=True, max_length=50)
    course_name = models.CharField(max_length=255)
    term = models.ForeignKey('TblTerm', models.DO_NOTHING)

    class Meta:
        managed = True
        db_table = 'tbl_course'


class TblCourseUsers(models.Model):
    pk = models.CompositePrimaryKey('course_id', 'user_id')
    course = models.ForeignKey(TblCourse, models.DO_NOTHING)
    user = models.ForeignKey('TblUsers', models.DO_NOTHING)
    course_name = models.CharField(blank=True, null=True)
    is_bayanihan_leader = models.BooleanField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'tbl_course_users'


class TblDepartment(models.Model):
    department_id = models.TextField(primary_key=True)
    department_name = models.CharField(max_length=255, blank=True, null=True)
    college = models.ForeignKey(TblCollege, models.DO_NOTHING, blank=True, null=True)

    class Meta:
        managed = True
        db_table = 'tbl_department'


class TblExamdetails(models.Model):
    examdetails_id = models.AutoField(primary_key=True)
    course_id = models.CharField(max_length=50)
    program_id = models.TextField()
    room = models.ForeignKey('TblRooms', models.DO_NOTHING)
    modality = models.ForeignKey('TblModality', models.DO_NOTHING)
    proctor = models.ForeignKey('TblUsers', models.DO_NOTHING, blank=True, null=True)
    examperiod = models.ForeignKey('TblExamperiod', models.DO_NOTHING)
    exam_duration = models.DurationField(blank=True, null=True)
    exam_start_time = models.DateTimeField(blank=True, null=True)
    exam_end_time = models.DateTimeField(blank=True, null=True)
    proctor_timein = models.DateTimeField(blank=True, null=True)
    proctor_timeout = models.DateTimeField(blank=True, null=True)
    section_name = models.CharField(blank=True, null=True)
    academic_year = models.TextField(blank=True, null=True)
    semester = models.TextField(blank=True, null=True)
    exam_category = models.TextField(blank=True, null=True)
    exam_period = models.TextField(blank=True, null=True)
    exam_date = models.TextField(blank=True, null=True)
    college_name = models.TextField(blank=True, null=True)
    building_name = models.CharField(blank=True, null=True)
    instructor_id = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'tbl_examdetails'


class TblExamperiod(models.Model):
    examperiod_id = models.AutoField(primary_key=True)
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    academic_year = models.TextField()  # This field type is a guess.
    exam_category = models.TextField()  # This field type is a guess.
    term = models.ForeignKey('TblTerm', models.DO_NOTHING)
    department = models.ForeignKey(TblDepartment, models.DO_NOTHING, blank=True, null=True)
    college = models.ForeignKey(TblCollege, models.DO_NOTHING, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'tbl_examperiod'


class TblInbox(models.Model):
    message_id = models.AutoField(primary_key=True)
    subject = models.TextField(blank=True, null=True)
    message_body = models.TextField(blank=True, null=True)
    is_read = models.BooleanField(blank=True, null=True)
    is_deleted = models.BooleanField(blank=True, null=True)
    created_at = models.DateTimeField()
    receiver = models.ForeignKey('TblUsers', models.DO_NOTHING, blank=True, null=True)
    receiver_role = models.ForeignKey('TblUserRole', models.DO_NOTHING, db_column='receiver_role', blank=True, null=True)
    sender = models.ForeignKey('TblUsers', models.DO_NOTHING, related_name='tblinbox_sender_set', blank=True, null=True)
    sender_role = models.ForeignKey('TblUserRole', models.DO_NOTHING, db_column='sender_role', related_name='tblinbox_sender_role_set', blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)
    attachments = models.JSONField(blank=True, null=True)
    sender_uuid = models.UUIDField(blank=True, null=True)
    receiver_uuid = models.UUIDField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'tbl_inbox'


class TblModality(models.Model):
    modality_id = models.AutoField(primary_key=True)
    modality_type = models.TextField()
    room_type = models.TextField()
    modality_remarks = models.TextField(blank=True, null=True)
    course = models.ForeignKey(TblCourse, models.DO_NOTHING)
    program_id = models.TextField()
    room = models.ForeignKey('TblRooms', models.DO_NOTHING, blank=True, null=True)
    user = models.ForeignKey('TblUsers', models.DO_NOTHING)
    created_at = models.DateTimeField(blank=True, null=True)
    section_name = models.CharField(blank=True, null=True)
    
    # FIX: Change from TextField to ArrayField
    possible_rooms = ArrayField(
        models.TextField(),
        blank=True,
        null=True,
        default=list
    )

    class Meta:
        managed = False
        db_table = 'tbl_modality'


class TblNotifications(models.Model):
    id = models.BigAutoField(primary_key=True)
    sender = models.ForeignKey('TblUsers', models.DO_NOTHING, blank=True, null=True)
    sender_name = models.CharField(max_length=150)
    receiver = models.ForeignKey('TblUsers', models.DO_NOTHING, related_name='tblnotifications_receiver_set', blank=True, null=True)
    receiver_name = models.CharField(max_length=150)
    message = models.TextField()
    status = models.TextField(blank=True, null=True)  # This field type is a guess.
    file_url = models.TextField(blank=True, null=True)
    request_id = models.UUIDField(blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'tbl_notifications'


class TblProgram(models.Model):
    program_id = models.TextField(primary_key=True)
    program_name = models.TextField()
    department = models.ForeignKey(TblDepartment, models.DO_NOTHING)

    class Meta:
        managed = True
        db_table = 'tbl_program'


class TblReplies(models.Model):
    reply_id = models.BigAutoField(primary_key=True)
    message = models.ForeignKey(TblInbox, models.DO_NOTHING, blank=True, null=True)
    sender = models.ForeignKey('TblUsers', models.DO_NOTHING, blank=True, null=True)
    body = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)
    attachments = models.JSONField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'tbl_replies'

class TblRooms(models.Model):
    room_id = models.CharField(primary_key=True, max_length=500)
    room_name = models.CharField(max_length=500)
    room_type = models.CharField(max_length=500)
    room_capacity = models.IntegerField()
    building = models.ForeignKey(TblBuildings, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'tbl_rooms'


class TblScheduleapproval(models.Model):
    dean_user_id = models.IntegerField()
    submitted_at = models.DateTimeField(blank=True, null=True)
    status = models.TextField(blank=True, null=True)  # This field type is a guess.
    remarks = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField()
    file_url = models.TextField(blank=True, null=True)
    request_id = models.UUIDField(primary_key=True)
    submitted_by = models.ForeignKey('TblUsers', models.DO_NOTHING, db_column='submitted_by', blank=True, null=True)
    dean_college = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'tbl_scheduleapproval'


class TblSectioncourse(models.Model):
    id = models.AutoField(primary_key=True) 
    course = models.ForeignKey(TblCourse, models.DO_NOTHING)
    program = models.ForeignKey(TblProgram, models.DO_NOTHING)
    section_name = models.CharField(max_length=50)
    number_of_students = models.IntegerField()
    year_level = models.TextField()  # This field type is a guess.
    term = models.ForeignKey('TblTerm', models.DO_NOTHING)
    user = models.ForeignKey('TblUsers', models.DO_NOTHING, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'tbl_sectioncourse'


class TblSystemNotification(models.Model):
    notif_id = models.BigAutoField(primary_key=True)
    target_user = models.ForeignKey('TblUsers', models.DO_NOTHING)
    sender_user = models.ForeignKey('TblUsers', models.DO_NOTHING, related_name='tblsystemnotification_sender_user_set')
    examdetails = models.ForeignKey(TblExamdetails, models.DO_NOTHING)
    message = models.TextField()
    sms_alert_sent = models.BooleanField(blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'tbl_system_notification'


class TblTerm(models.Model):
    term_id = models.AutoField(primary_key=True)
    term_name = models.TextField()  # This field type is a guess.

    class Meta:
        managed = False
        db_table = 'tbl_term'

class TblRoles(models.Model):
    role_id = models.BigAutoField(primary_key=True)
    role_name = models.CharField(max_length=255) 

    class Meta:
        managed = True
        db_table = 'tbl_roles'

    def __str__(self):
        return self.role_name

class TblUserRole(models.Model):
    user_role_id = models.AutoField(primary_key=True)
    role = models.ForeignKey(TblRoles, models.DO_NOTHING, blank=True, null=True)
    user = models.ForeignKey('TblUsers', models.DO_NOTHING)
    college = models.ForeignKey(TblCollege, models.DO_NOTHING, blank=True, null=True)
    department = models.ForeignKey(TblDepartment, models.DO_NOTHING, blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)
    date_start = models.DateTimeField(blank=True, null=True)
    date_ended = models.DateTimeField(blank=True, null=True)
    status = models.TextField(blank=True, null=True)  # This field type is a guess.

    class Meta:
        managed = True
        db_table = 'tbl_user_role'


class TblUserRoleHistory(models.Model):
    history_id = models.BigAutoField(primary_key=True)
    user_role_id = models.BigIntegerField()
    user_id = models.BigIntegerField()
    role_id = models.IntegerField(blank=True, null=True)
    college_id = models.TextField(blank=True, null=True)
    department_id = models.TextField(blank=True, null=True)
    date_start = models.DateField(blank=True, null=True)
    date_ended = models.DateField(blank=True, null=True)
    status = models.TextField(blank=True, null=True)
    action = models.TextField(blank=True, null=True)
    changed_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'tbl_user_role_history'


class TblUsers(models.Model):
    user_id = models.IntegerField(primary_key=True)
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    middle_name = models.CharField(max_length=50, blank=True, null=True)
    email_address = models.CharField(unique=True, max_length=50)
    contact_number = models.CharField(max_length=20, blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)
    avatar_url = models.CharField(blank=True, null=True)
    status = models.TextField(blank=True, null=True)
    user_uuid = models.UUIDField(blank=True, null=True)

    class Meta:
        managed = False  # change to True if you want Django to manage it
        db_table = 'tbl_users'
