(function () {
  const LANGUAGE_KEY = "campusplan_language";
  const translations = {
    en: {
      dashboard: "Dashboard",
      assignments: "Assignments",
      tests_exams: "Tests & Exams",
      presentations: "Presentations",
      timetable: "Timetable",
      calendar: "Calendar",
      messages: "Messages",
      groups: "Groups",
      group: "Group",
      tests: "Tests",
      day: "Day",
      profile: "Profile",
      settings: "Settings",
      logout: "Logout",
      login: "Login",
      register: "Register",
      create_account: "Create account",
      email: "Email",
      email_or_student_id: "Email or Student ID",
      password: "Password",
      confirm_password: "Confirm Password",
      full_name: "Full Name",
      student_id: "Student ID",
      institution: "Institution",
      university_institution: "University/Institution",
      program: "Program",
      course_program: "Course/Program",
      year_of_study: "Year of Study",
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      remove: "Remove",
      edit: "Edit",
      add: "Add",
      create: "Create",
      search: "Search",
      close: "Close",
      back: "Back",
      submit: "Submit",
      send: "Send",
      join: "Join",
      leave: "Leave",
      create_group: "Create group",
      group_info: "Group info",
      group_information: "Group information",
      members: "Members",
      contacts: "Contacts",
      chats: "Chats",
      new_chat: "New Chat",
      new_message: "New message",
      discover: "Discover",
      my_groups: "My Groups",
      new_message_button: "+ New message",
      create_group_button: "+ Create group",
      search_conversations_label: "Search conversations",
      search_contacts_label: "Search contacts",
      search_my_groups_label: "Search my groups",
      search_discoverable_groups: "Search discoverable groups",
      leave_group: "Leave group",
      weekly_schedule: "WEEKLY SCHEDULE",
      schedule_date_range: "16 – 20 September 2026",
      my_assigned_part: "My assigned part",
      previous_calendar: "← Previous",
      next_calendar: "Next →",
      notifications: "Notifications",
      no_messages_yet: "No messages yet.",
      no_groups_found: "No groups found.",
      no_assignments_yet: "No assignments yet",
      no_tests_yet: "No tests yet.",
      no_presentations_yet: "No presentations yet.",
      search_contacts: "Search contacts...",
      search_groups: "Search groups...",
      search_anything: "Search...",
      light: "Light",
      dark: "Dark",
      main_navigation: "Main navigation",
      open_navigation: "Open navigation",
      open_profile_menu: "Open profile menu",
      open_notifications: "Open notifications",
      mark_all_read: "Mark all as read",
      welcome_back: "WELCOME BACK",
      sign_in: "Sign in to CampusPlan",
      login_description: "Log in to manage your academic life.",
      login_identity_placeholder: "you@example.com or CP-1024",
      enter_password: "Enter your password",
      show_password: "Show password",
      hide_password: "Hide password",
      forgot_password: "Forgot password?",
      no_account: "Don't have an account?",
      create_one: "Create one",
      student_workspace: "Student workspace",
      plan_with_purpose: "PLAN WITH PURPOSE",
      login_promo_heading: "Your academic life, in one clear place.",
      login_promo_description:
        "Keep up with deadlines, classes, study groups, and the people you learn with.",
      login_promo_footer: "A practical home for your next step.",
      create_account_heading: "Create Your CampusPlan Account",
      create_account_description: "Set up your academic space in a few moments.",
      already_have_account: "Already have an account?",
      select_year: "Select year",
      year_1: "Year 1",
      year_2: "Year 2",
      year_3: "Year 3",
      year_4: "Year 4",
      create_account_button: "Create Account",
      please_log_in: "Please log in to access CampusPlan.",
      complete_registration:
        "Please complete every field, use a valid email, and ensure passwords match (6+ characters).",
      account_exists:
        "An account with this email or Student ID already exists.",
      account_created_redirect:
        "Account created successfully! Redirecting to login...",
      account_created: "Account created successfully.",
      required_fields: "Please complete every required field.",
      password_minimum: "Password must be at least 6 characters.",
      student_id_exists: "Student ID already exists.",
      email_exists: "Email already exists.",
      login_fields_required:
        "Email or Student ID and password are required.",
      invalid_credentials: "Invalid email/student ID or password.",
      login_unavailable: "Unable to log in right now.",
      registration_unavailable: "Unable to create the account right now.",
      password_recovery_later: "Password recovery will be implemented later.",
      page_dashboard: "CampusPlan | Dashboard",
      page_assignments: "Assignments | CampusPlan",
      page_tests: "Tests & Exams | CampusPlan",
      page_presentations: "Presentations | CampusPlan",
      page_timetable: "Timetable | CampusPlan",
      page_calendar: "Calendar | CampusPlan",
      page_messages: "Messages | CampusPlan",
      page_groups: "Groups | CampusPlan",
      page_profile: "Profile | CampusPlan",
      page_login: "Login | CampusPlan",
      page_register: "Create account | CampusPlan",
      student_dashboard: "STUDENT DASHBOARD",
      good_morning: "Good morning,",
      focus_today: "Here is what you need to focus on today.",
      manage_assignments: "Manage assignments",
      pending_assignments: "Pending Assignments",
      tasks_to_complete: "Tasks to complete",
      upcoming_tests: "Upcoming Tests",
      plan_revision: "Plan your revision",
      presentations_stat: "Presentations",
      in_schedule: "In your schedule",
      completed_tasks: "Completed Tasks",
      great_work: "Great work,",
      unread_messages: "Unread messages",
      unread_notifications: "Unread notifications",
      classes_today: "Classes today",
      upcoming_deadlines: "Upcoming deadlines",
      upcoming: "Upcoming",
      nearest_deadlines: "Your nearest academic deadlines.",
      see_all: "See all",
      todays_schedule: "Today's schedule",
      classes_today_description: "Your classes for today.",
      full_timetable: "Full timetable",
      now: "Now",
      academic_progress: "Academic progress",
      view_tasks: "View tasks",
      completed: "completed",
      coming_up: "Coming up",
      view_all: "View all",
      reminders: "Reminders",
      add_reminder: "Add Reminder",
      quick_calendar: "Quick Calendar",
      open_calendar: "Open calendar",
      recent_messages: "Recent messages",
      open_inbox: "Open inbox",
      recent_group_activity: "Recent group activity",
      open_groups: "Open groups",
      academic_overview: "Academic overview",
      communication_overview: "Communication overview",
      add_reminder_title: "Add reminder",
      reminder_title: "Reminder title",
      date: "Date",
      time: "Time",
      description: "Description",
      priority: "Priority",
      save_reminder: "Save reminder",
      assessments: "ASSESSMENTS",
      prepare_early: "Prepare early and feel confident on the day.",
      add_test: "Add test",
      add_test_exam: "Add test or exam",
      test_title: "Test title",
      course: "Course",
      room: "Room",
      status: "Status",
      upcoming_status: "Upcoming",
      completed_status: "Completed",
      missed: "Missed",
      save_test: "Save test",
      your_coursework: "YOUR COURSEWORK",
      track_tasks_deadlines: "Keep track of every task and deadline.",
      add_assignment: "Add assignment",
      search_assignments: "Search assignments",
      search_title_course: "Search by title or course",
      all_courses: "All courses",
      all_statuses: "All statuses",
      not_started: "Not Started",
      in_progress: "In Progress",
      all_priorities: "All priorities",
      high: "High",
      medium: "Medium",
      low: "Low",
      all_assignments: "All assignments",
      assignment_title: "Assignment title",
      due_date: "Due date",
      save_assignment: "Save assignment",
      no_assignments_match: "No assignments match these filters.",
      loading_assignments: "Loading assignments...",
      unable_server: "Unable to connect to CampusPlan server.",
      retry: "Retry",
      mark_completed: "Mark as completed",
      priority_suffix: "priority",
      due_today: "Due today",
      due_tomorrow: "Due tomorrow",
      days_overdue: "days overdue",
      delete_assignment_confirm: "Delete this assignment?",
      delete_assignment_question: "Delete this assignment?",
      edit_assignment: "Edit assignment",
      delete_test_question: "Delete this test?",
      delete_presentation_question: "Delete this presentation?",
      event_count_aria: "{count} events",
      event_count_aria_one: "{count} event",
      coming_soon_status: "Coming Soon",
      due_soon_status: "Due Soon",
      overdue_status: "Overdue",
      save_presentation: "Save presentation",
      add_presentation: "Add presentation",
      speaking_teamwork: "SPEAKING & TEAMWORK",
      plan_presentation: "Plan your preparation and presentation days.",
      presentation_title: "Presentation title",
      group_name: "Group name",
      my_part: "My part",
      preparation_status: "Preparation status",
      preparing: "Preparing",
      ready: "Ready",
      no_presentations: "No presentations yet.",
      loading_presentations: "Loading presentations...",
      delete_presentation_confirm: "Delete this presentation?",
      delete_test_confirm: "Delete this test?",
      add_class: "Add class",
      save_class: "Save class",
      add_event: "Add Event",
      today: "Today",
      previous: "Previous",
      next: "Next",
      academic_overview_eyebrow: "ACADEMIC OVERVIEW",
      weekdays: "Weekdays",
      assignment: "Assignment",
      test: "Test",
      presentation: "Presentation",
      reminder: "Reminder",
      personal: "Personal",
      academic_event: "Academic event",
      no_time_specified: "No time specified",
      add_personal_event: "Add personal event",
      event_type: "Event type",
      study: "Study",
      meeting: "Meeting",
      start_time: "Start time",
      end_time: "End time",
      save_event: "Save event",
      student_connections: "STUDENT CONNECTIONS",
      new_message_action: "New message",
      search_conversations: "Search conversations...",
      messages_views: "Messages views",
      search_contacts_placeholder: "Search contacts...",
      campusplan_student: "CampusPlan student",
      write_message: "Write a message...",
      message_text: "Message text",
      send_message: "Send message",
      back_to_messages: "Back to messages",
      no_conversations: "No conversations yet.",
      start_conversation: "Select Contacts to start one.",
      no_contacts: "No contacts found.",
      select_chat: "Select a chat or contact to start messaging.",
      start_conversation_with: "Start a conversation with",
      read: "Read",
      sent: "Sent",
      loading_contacts: "Loading contacts...",
      clear_history: "Conversation history is stored on the server.",
      learn_together: "LEARN TOGETHER",
      groups_description: "Course communities and focused study spaces.",
      search_my_groups: "Search my groups...",
      group_views: "Group views",
      discover_groups_placeholder: "Search groups...",
      no_groups_joined: "You have not joined any groups yet.",
      no_groups_match: "No groups match your search.",
      no_course_communities: "No Course Community groups found.",
      searching_groups: "Searching groups...",
      joining: "Joining...",
      open_group: "Open group",
      open_conversation: "Open conversation",
      members_count: "members",
      no_group_messages: "No group messages yet.",
      group_course: "Course",
      group_type: "Type",
      group_photo: "Group photo",
      group_name_label: "Group name",
      save_group_details: "Save group details",
      add_member: "Add member",
      group_type_label: "Group type",
      study_group: "Study Group",
      assignment_group: "Assignment Group",
      presentation_group: "Presentation Group",
      course_community: "Course Community",
      other: "Other",
      message_group_placeholder: "Message this group...",
      send_group_message: "Send group message",
      back_to_groups: "Back to groups",
      unable_read_photo: "Unable to read the selected group photo.",
      unable_save_photo: "Unable to save the group photo in this browser.",
      photo_size_error: "Please choose an image smaller than 2 MB.",
      profile_description: "Keep your CampusPlan information current.",
      your_account: "YOUR ACCOUNT",
      profile_photo: "Profile photo",
      photo_help: "Use a JPG, PNG, GIF, or WebP image under 2 MB.",
      change_photo: "Change photo",
      remove_photo: "Remove photo",
      save_profile: "Save profile",
      profile_updated: "Profile saved successfully.",
      photo_updated: "Profile photo updated.",
      photo_removed: "Profile photo removed.",
      invalid_photo: "Choose an image file smaller than 2 MB.",
      no_notifications: "No notifications yet.",
      no_reminders: "No reminders yet.",
      no_events: "No events yet.",
      notifications_panel: "Notifications",
      notification_toggle_unread_one: "Open notifications, {count} unread notification",
      notification_toggle_unread_other: "Open notifications, {count} unread notifications",
      notification_assignment_today: "{title} is due today.",
      notification_assignment_tomorrow: "{title} is due tomorrow.",
      notification_assignment_in_days: "{title} is due in {count} days.",
      notification_test_today: "{title} is today.",
      notification_test_tomorrow: "{title} is tomorrow.",
      notification_test_in_days: "{title} is in {count} days.",
      notification_presentation_today: "{title} is scheduled for today.",
      notification_presentation_tomorrow: "{title} is tomorrow.",
      notification_presentation_in_days: "{title} is coming up in {count} days.",
      notification_personal_today: "{title} is scheduled for today.",
      notification_personal_tomorrow: "{title} is tomorrow.",
      notification_personal_in_days: "{title} is coming up in {count} days.",
      notification_course: "Course",
      notification_date: "Date",
      notification_time: "Time",
      unread_notification_prefix: "Unread notification:",
      unread_notifications_count_one: "{count} unread notification",
      unread_notifications_count_other: "{count} unread notifications",
      no_group_search_results: "No Course Community groups found.",
      save_event_button: "Save event",
      edit_class: "Edit class",
      delete_class_confirm: "Delete this class from your timetable?",
      course_required: "Course or module name is required.",
      end_after_start: "End time must be after the start time.",
      start_time_required: "Add a start time before setting an end time.",
      open_calendar_action: "Open calendar",
      previous_month: "Previous month",
      next_month: "Next month",
      calendar_legends: "Calendar legends",
      close_form: "Close form",
      close_event_details: "Close event details",
      close_event_form: "Close event form",
      close_class_form: "Close class form",
      filter_assignments: "Filter assignments",
      add_class_action: "Add Class",
      save_test_action: "Save test",
      no_messages_empty: "No messages yet",
      save_test_modal: "Save test",
      no_test_items: "No tests yet.",
      loading_tests: "Loading tests...",
      invalid_image: "Please choose a valid image file.",
      student_id_label: "Student ID:",
      message_action: "Message",
      personal_event: "Personal",
      all_day: "All day",
      event: "Event",
      edit_action: "Edit",
      delete_action: "Delete",
      add_event_action: "Add event",
      save_changes: "Save changes",
      good_afternoon: "Good afternoon,",
      good_evening: "Good evening,",
      due_in_days: "Due in {count} days",
      unread_count: "{count} unread",
      days_due: "{count} days overdue",
      assignment_count_one: "{count} assignment",
      assignment_count_other: "{count} assignments",
      classes_count: "{count} classes",
      choose_language: "Choose language",
      english_language: "English",
      french_language: "French",
      tests_heading: "Tests & exams",
      add_test_button: "+ Add test",
      add_assignment_button: "+ Add assignment",
      add_presentation_button: "+ Add presentation",
      add_reminder_button: "+ Add Reminder",
      all_assignment_heading: "All assignments",
      add_event_title: "Add personal event",
      delete_event_confirm: "Delete this personal event?",
      no_date: "No date",
      no_description: "No description available.",
      no_room: "No room specified",
      scheduled: "Scheduled",
      managed_from: "Managed from",
      no_classes: "No classes added yet.",
      add_weekly_classes: "Add your weekly classes to build your timetable.",
      lecturer: "Lecturer:",
      loading_timetable: "Loading timetable...",
      group_joined: "You joined the group successfully.",
      already_group_member: "You are already a member of this group.",
      group_not_joinable: "This group is not available to join.",
      unable_load_groups: "Unable to load groups right now.",
      unable_discover_groups: "Unable to discover groups right now.",
      unable_join_group: "Unable to join the group right now.",
      unable_load_group: "Unable to load this group right now.",
      unable_load_group_messages: "Unable to load group messages right now.",
      unable_load_contacts: "Unable to load contacts right now.",
      no_description_provided: "No description provided.",
      days_remaining: "{count} days remaining",
      today_short: "Today",
      tomorrow: "Tomorrow",
      switch_to_light: "Switch to light mode",
      switch_to_dark: "Switch to dark mode",
      yes: "Yes",
      no: "No",
      monday: "Monday",
      tuesday: "Tuesday",
      wednesday: "Wednesday",
      thursday: "Thursday",
      friday: "Friday",
      saturday: "Saturday",
      sunday: "Sunday",
      mon: "Mon",
      tue: "Tue",
      wed: "Wed",
      thu: "Thu",
      fri: "Fri",
      sat: "Sat",
      sun: "Sun",
      see_calendar: "See calendar",
      assignments_add: "Add assignment",
      group_description_label: "Description",
      course_code: "Course code",
      course_module_name: "Course/Module name",
      lecturer_label: "Lecturer",
      notes: "Notes",
      close_navigation: "Close navigation",
      start_group_conversation: "Start collaborating with your group",
      new_group: "New group",
      server_session_expired: "Your session has expired. Please log in again.",
      invalid_email: "Please enter a valid email address.",
      unavailable: "Unavailable",
      admin: "Admin",
      member: "Member",
      group_member_count: "{count} members",
      unread_messages_aria: "{count} unread messages",
      progress_summary: "{done} of {total} assignments completed",
      progress_summary_one: "{done} assignment completed out of {total}",
      progress_summary_other: "{done} assignments completed out of {total}",
      edit_test_exam: "Edit test or exam",
      edit_personal_event: "Edit personal event",
      tests_page_heading: "Tests & exams",
      no_assignments_empty: "No assignments yet",
      no_presentations_empty: "No presentations yet.",
      student_id_colon: "Student ID:",
      add_personal_event_title: "Add personal event",
      quick_calendar_action: "Open calendar",
      manage_assignments_action: "Manage assignments",
      all_courses_filter: "All courses",
      no_upcoming_events: "No upcoming events.",
      show_password_action: "Show password",
      add_test_or_exam: "Add test or exam",
      message_this_group: "Message this group...",
      no_room_specified: "No room specified",
      preparation_status_label: "Preparation status",
      course_field_label: "Course",
      start_collaboration: "Start collaborating with your group",
      select_contacts: "Select Contacts to start one.",
      previous_month_label: "Previous month",
      next_month_label: "Next month",
      due_today_title: "Due today",
      due_tomorrow_title: "Due tomorrow",
      open_group_aria: "Open {name}",
      remove_member_aria: "Remove {name}",
      connection_error: "Unable to connect to CampusPlan server.",
      fetch_error: "Failed to fetch",
      no_recent_conversations: "No recent conversations.",
      no_recent_group_activity: "No recent group activity.",
      no_contacts_found: "No contacts found.",
      select_chat_prompt: "Select a chat or contact to start messaging.",
      start_conversation_prompt: "Start a conversation with",
      messages_length_error: "Messages must be 2000 characters or fewer.",
      group_photo_invalid: "Please choose an image smaller than 2 MB.",
      group_photo_save_error: "Unable to save the group photo in this browser.",
      group_photo_read_error: "Unable to read the selected group photo.",
      unable_load_students: "Unable to load students",
      api_valid_conversation_student: "A valid conversation student is required.",
      api_valid_group: "A valid group is required.",
      api_valid_receiver: "A valid receiver is required.",
      api_valid_student: "A valid student is required.",
      api_assignment_deleted: "Assignment deleted.",
      api_assignment_not_found: "Assignment not found.",
      api_calendar_event_deleted: "Calendar event deleted.",
      api_calendar_event_not_found: "Calendar event not found.",
      api_conversation_read: "Conversation marked as read.",
      api_group_member_not_found: "Group member not found.",
      api_group_messages_read: "Group messages marked as read.",
      api_group_not_found: "Group not found.",
      api_member_added: "Member added successfully.",
      api_member_removed: "Member removed successfully.",
      api_message_empty: "Message cannot be empty.",
      api_message_too_long: "Message is too long.",
      api_admin_required: "Only group administrators can perform this action.",
      api_presentation_deleted: "Presentation deleted.",
      api_presentation_not_found: "Presentation not found.",
      api_student_account_not_found: "Student account not found.",
      api_student_not_found: "Student not found.",
      api_test_deleted: "Test deleted.",
      api_test_not_found: "Test not found.",
      api_creator_must_leave: "The group creator must use Leave group instead.",
      api_last_member_cannot_leave: "The last group member cannot leave the group.",
      api_student_already_member: "This student is already a group member.",
      api_timetable_entry_deleted: "Timetable entry deleted.",
      api_timetable_entry_not_found: "Timetable entry not found.",
      api_add_student_error: "Unable to add the student right now.",
      api_create_assignment_error: "Unable to create the assignment right now.",
      api_create_calendar_event_error: "Unable to create the calendar event right now.",
      api_create_group_error: "Unable to create the group right now.",
      api_create_presentation_error: "Unable to create the presentation right now.",
      api_create_test_error: "Unable to create the test right now.",
      api_create_timetable_error: "Unable to create the timetable entry right now.",
      api_delete_assignment_error: "Unable to delete the assignment right now.",
      api_delete_calendar_event_error: "Unable to delete the calendar event right now.",
      api_delete_presentation_error: "Unable to delete the presentation right now.",
      api_delete_test_error: "Unable to delete the test right now.",
      api_delete_timetable_error: "Unable to delete the timetable entry right now.",
      api_leave_group_error: "Unable to leave the group right now.",
      api_load_assignments_error: "Unable to load assignments right now.",
      api_load_calendar_error: "Unable to load calendar events right now.",
      api_load_conversations_error: "Unable to load conversations right now.",
      api_load_presentations_error: "Unable to load presentations right now.",
      api_load_tests_error: "Unable to load tests right now.",
      api_load_assignment_error: "Unable to load the assignment right now.",
      api_load_calendar_event_error: "Unable to load the calendar event right now.",
      api_load_conversation_error: "Unable to load the conversation right now.",
      api_load_presentation_error: "Unable to load the presentation right now.",
      api_load_profile_error: "Unable to load the student profile.",
      api_load_test_error: "Unable to load the test right now.",
      api_load_timetable_entry_error: "Unable to load the timetable entry right now.",
      api_load_timetable_error: "Unable to load the timetable right now.",
      api_remove_student_error: "Unable to remove the student right now.",
      api_search_students_error: "Unable to search students right now.",
      api_send_message_error: "Unable to send the message right now.",
      api_update_group_messages_error: "Unable to update group messages right now.",
      api_update_message_status_error: "Unable to update message status right now.",
      api_update_assignment_error: "Unable to update the assignment right now.",
      api_update_calendar_event_error: "Unable to update the calendar event right now.",
      api_update_group_error: "Unable to update the group right now.",
      api_update_presentation_error: "Unable to update the presentation right now.",
      api_update_test_error: "Unable to update the test right now.",
      api_update_timetable_error: "Unable to update the timetable entry right now.",
      api_not_group_member: "You are not a member of this group.",
      api_left_group: "You have left the group.",
    },
    fr: {
      dashboard: "Tableau de bord",
      assignments: "Devoirs",
      tests_exams: "Tests et examens",
      presentations: "Présentations",
      timetable: "Emploi du temps",
      calendar: "Calendrier",
      messages: "Messages",
      groups: "Groupes",
      group: "Groupe",
      tests: "Tests",
      day: "Jour",
      profile: "Profil",
      settings: "Paramètres",
      logout: "Déconnexion",
      login: "Connexion",
      register: "Inscription",
      create_account: "Créer un compte",
      email: "E-mail",
      email_or_student_id: "E-mail ou identifiant étudiant",
      password: "Mot de passe",
      confirm_password: "Confirmer le mot de passe",
      full_name: "Nom complet",
      student_id: "Identifiant étudiant",
      institution: "Établissement",
      university_institution: "Université/Établissement",
      program: "Programme",
      course_program: "Cours/Programme",
      year_of_study: "Année d'études",
      save: "Enregistrer",
      cancel: "Annuler",
      delete: "Supprimer",
      remove: "Retirer",
      edit: "Modifier",
      add: "Ajouter",
      create: "Créer",
      search: "Rechercher",
      close: "Fermer",
      back: "Retour",
      submit: "Envoyer",
      send: "Envoyer",
      join: "Rejoindre",
      leave: "Quitter",
      create_group: "Créer un groupe",
      group_info: "Informations du groupe",
      group_information: "Informations du groupe",
      members: "Membres",
      contacts: "Contacts",
      chats: "Discussions",
      new_chat: "Nouvelle discussion",
      new_message: "Nouveau message",
      discover: "Découvrir",
      my_groups: "Mes groupes",
      new_message_button: "+ Nouveau message",
      create_group_button: "+ Créer un groupe",
      search_conversations_label: "Rechercher des conversations",
      search_contacts_label: "Rechercher des contacts",
      search_my_groups_label: "Rechercher dans mes groupes",
      search_discoverable_groups: "Rechercher des groupes à découvrir",
      leave_group: "Quitter le groupe",
      weekly_schedule: "EMPLOI DU TEMPS HEBDOMADAIRE",
      schedule_date_range: "16 – 20 septembre 2026",
      my_assigned_part: "Ma partie attribuée",
      previous_calendar: "← Précédent",
      next_calendar: "Suivant →",
      notifications: "Notifications",
      no_messages_yet: "Aucun message pour le moment",
      no_groups_found: "Aucun groupe trouvé",
      no_assignments_yet: "Aucun devoir pour le moment",
      no_tests_yet: "Aucun test pour le moment",
      no_presentations_yet: "Aucune présentation pour le moment",
      search_contacts: "Rechercher des contacts...",
      search_groups: "Rechercher des groupes...",
      search_anything: "Rechercher...",
      light: "Clair",
      dark: "Sombre",
      main_navigation: "Navigation principale",
      open_navigation: "Ouvrir la navigation",
      open_profile_menu: "Ouvrir le menu du profil",
      open_notifications: "Ouvrir les notifications",
      mark_all_read: "Tout marquer comme lu",
      welcome_back: "BON RETOUR",
      sign_in: "Se connecter à CampusPlan",
      login_description: "Connectez-vous pour gérer votre vie universitaire.",
      login_identity_placeholder: "vous@exemple.com ou CP-1024",
      enter_password: "Saisissez votre mot de passe",
      show_password: "Afficher le mot de passe",
      hide_password: "Masquer le mot de passe",
      forgot_password: "Mot de passe oublié ?",
      no_account: "Vous n'avez pas de compte ?",
      create_one: "Créer un compte",
      student_workspace: "Espace étudiant",
      plan_with_purpose: "PLANIFIEZ AVEC UN OBJECTIF",
      login_promo_heading: "Toute votre vie universitaire, au même endroit.",
      login_promo_description:
        "Suivez vos échéances, vos cours, vos groupes d'étude et les personnes avec qui vous apprenez.",
      login_promo_footer: "Un espace pratique pour votre prochaine étape.",
      create_account_heading: "Créer votre compte CampusPlan",
      create_account_description: "Configurez votre espace universitaire en quelques instants.",
      already_have_account: "Vous avez déjà un compte ?",
      select_year: "Sélectionnez l'année",
      year_1: "1re année",
      year_2: "2e année",
      year_3: "3e année",
      year_4: "4e année",
      create_account_button: "Créer un compte",
      please_log_in: "Veuillez vous connecter pour accéder à CampusPlan.",
      complete_registration:
        "Veuillez remplir tous les champs, saisir une adresse e-mail valide et vérifier que les mots de passe correspondent (6 caractères ou plus).",
      account_exists:
        "Un compte avec cet e-mail ou cet identifiant étudiant existe déjà.",
      account_created_redirect:
        "Compte créé avec succès ! Redirection vers la connexion...",
      account_created: "Compte créé avec succès.",
      required_fields: "Veuillez remplir tous les champs obligatoires.",
      password_minimum: "Le mot de passe doit contenir au moins 6 caractères.",
      student_id_exists: "Cet identifiant étudiant existe déjà.",
      email_exists: "Cette adresse e-mail existe déjà.",
      login_fields_required:
        "L'e-mail ou l'identifiant étudiant et le mot de passe sont obligatoires.",
      invalid_credentials: "E-mail, identifiant étudiant ou mot de passe invalide.",
      login_unavailable: "Impossible de se connecter pour le moment.",
      registration_unavailable: "Impossible de créer le compte pour le moment.",
      password_recovery_later: "La récupération du mot de passe sera bientôt disponible.",
      page_dashboard: "CampusPlan | Tableau de bord",
      page_assignments: "Devoirs | CampusPlan",
      page_tests: "Tests et examens | CampusPlan",
      page_presentations: "Présentations | CampusPlan",
      page_timetable: "Emploi du temps | CampusPlan",
      page_calendar: "Calendrier | CampusPlan",
      page_messages: "Messages | CampusPlan",
      page_groups: "Groupes | CampusPlan",
      page_profile: "Profil | CampusPlan",
      page_login: "Connexion | CampusPlan",
      page_register: "Créer un compte | CampusPlan",
      student_dashboard: "TABLEAU DE BORD ÉTUDIANT",
      good_morning: "Bonjour,",
      focus_today: "Voici les priorités du jour.",
      manage_assignments: "Gérer les devoirs",
      pending_assignments: "Devoirs en attente",
      tasks_to_complete: "Tâches à terminer",
      upcoming_tests: "Tests à venir",
      plan_revision: "Planifiez vos révisions",
      presentations_stat: "Présentations",
      in_schedule: "Dans votre planning",
      completed_tasks: "Tâches terminées",
      great_work: "Excellent travail,",
      unread_messages: "Messages non lus",
      unread_notifications: "Notifications non lues",
      classes_today: "Cours aujourd'hui",
      upcoming_deadlines: "Échéances à venir",
      upcoming: "À venir",
      nearest_deadlines: "Vos prochaines échéances universitaires.",
      see_all: "Tout voir",
      todays_schedule: "Programme du jour",
      classes_today_description: "Vos cours du jour.",
      full_timetable: "Emploi du temps complet",
      now: "En cours",
      academic_progress: "Progression universitaire",
      view_tasks: "Voir les tâches",
      completed: "terminé",
      coming_up: "Prochainement",
      view_all: "Tout voir",
      reminders: "Rappels",
      add_reminder: "Ajouter un rappel",
      quick_calendar: "Calendrier rapide",
      open_calendar: "Ouvrir le calendrier",
      recent_messages: "Messages récents",
      open_inbox: "Ouvrir la boîte de réception",
      recent_group_activity: "Activité récente des groupes",
      open_groups: "Ouvrir les groupes",
      academic_overview: "Aperçu universitaire",
      communication_overview: "Aperçu des communications",
      add_reminder_title: "Ajouter un rappel",
      reminder_title: "Titre du rappel",
      date: "Date",
      time: "Heure",
      description: "Description",
      priority: "Priorité",
      save_reminder: "Enregistrer le rappel",
      assessments: "ÉVALUATIONS",
      prepare_early: "Préparez-vous à l'avance et abordez vos examens sereinement.",
      add_test: "Ajouter un test",
      add_test_exam: "Ajouter un test ou un examen",
      test_title: "Titre du test",
      course: "Cours",
      room: "Salle",
      status: "Statut",
      upcoming_status: "À venir",
      completed_status: "Terminé",
      missed: "Manqué",
      save_test: "Enregistrer le test",
      your_coursework: "VOTRE TRAVAIL UNIVERSITAIRE",
      track_tasks_deadlines: "Suivez chaque tâche et chaque échéance.",
      add_assignment: "Ajouter un devoir",
      search_assignments: "Rechercher des devoirs",
      search_title_course: "Rechercher par titre ou cours",
      all_courses: "Tous les cours",
      all_statuses: "Tous les statuts",
      not_started: "Non commencé",
      in_progress: "En cours",
      all_priorities: "Toutes les priorités",
      high: "Élevée",
      medium: "Moyenne",
      low: "Faible",
      all_assignments: "Tous les devoirs",
      assignment_title: "Titre du devoir",
      due_date: "Date limite",
      save_assignment: "Enregistrer le devoir",
      no_assignments_match: "Aucun devoir ne correspond à ces filtres.",
      loading_assignments: "Chargement des devoirs...",
      unable_server: "Impossible de se connecter au serveur CampusPlan.",
      retry: "Réessayer",
      mark_completed: "Marquer comme terminé",
      priority_suffix: "priorité",
      due_today: "À rendre aujourd'hui",
      due_tomorrow: "À rendre demain",
      days_overdue: "jours de retard",
      delete_assignment_confirm: "Supprimer ce devoir ?",
      delete_assignment_question: "Supprimer ce devoir ?",
      edit_assignment: "Modifier le devoir",
      delete_test_question: "Supprimer ce test ?",
      delete_presentation_question: "Supprimer cette présentation ?",
      event_count_aria: "{count} événements",
      event_count_aria_one: "{count} événement",
      coming_soon_status: "Bientôt",
      due_soon_status: "À rendre bientôt",
      overdue_status: "En retard",
      save_presentation: "Enregistrer la présentation",
      add_presentation: "Ajouter une présentation",
      speaking_teamwork: "PRÉSENTATION ET TRAVAIL D'ÉQUIPE",
      plan_presentation: "Planifiez votre préparation et vos présentations.",
      presentation_title: "Titre de la présentation",
      group_name: "Nom du groupe",
      my_part: "Ma partie",
      preparation_status: "État de préparation",
      preparing: "En préparation",
      ready: "Prêt",
      no_presentations: "Aucune présentation pour le moment.",
      loading_presentations: "Chargement des présentations...",
      delete_presentation_confirm: "Supprimer cette présentation ?",
      delete_test_confirm: "Supprimer ce test ?",
      add_class: "Ajouter un cours",
      save_class: "Enregistrer le cours",
      add_event: "Ajouter un événement",
      today: "Aujourd'hui",
      previous: "Précédent",
      next: "Suivant",
      academic_overview_eyebrow: "APERÇU UNIVERSITAIRE",
      weekdays: "Jours de la semaine",
      assignment: "Devoir",
      test: "Test",
      presentation: "Présentation",
      reminder: "Rappel",
      personal: "Personnel",
      academic_event: "Événement universitaire",
      no_time_specified: "Aucun horaire indiqué",
      add_personal_event: "Ajouter un événement personnel",
      event_type: "Type d'événement",
      study: "Étude",
      meeting: "Réunion",
      start_time: "Heure de début",
      end_time: "Heure de fin",
      save_event: "Enregistrer l'événement",
      student_connections: "LIENS ENTRE ÉTUDIANTS",
      new_message_action: "Nouveau message",
      search_conversations: "Rechercher des conversations...",
      messages_views: "Vues des messages",
      search_contacts_placeholder: "Rechercher des contacts...",
      campusplan_student: "Étudiant CampusPlan",
      write_message: "Écrire un message...",
      message_text: "Texte du message",
      send_message: "Envoyer le message",
      back_to_messages: "Retour aux messages",
      no_conversations: "Aucune conversation pour le moment.",
      start_conversation: "Sélectionnez Contacts pour en démarrer une.",
      no_contacts: "Aucun contact trouvé.",
      select_chat: "Sélectionnez une discussion ou un contact pour commencer.",
      start_conversation_with: "Commencer une conversation avec",
      read: "Lu",
      sent: "Envoyé",
      loading_contacts: "Chargement des contacts...",
      clear_history: "L'historique des conversations est enregistré sur le serveur.",
      learn_together: "APPRENDRE ENSEMBLE",
      groups_description: "Des communautés de cours et des espaces d'étude dédiés.",
      search_my_groups: "Rechercher dans mes groupes...",
      group_views: "Vues des groupes",
      discover_groups_placeholder: "Rechercher des groupes...",
      no_groups_joined: "Vous n'avez encore rejoint aucun groupe.",
      no_groups_match: "Aucun groupe ne correspond à votre recherche.",
      no_course_communities: "Aucun groupe de communauté de cours trouvé.",
      searching_groups: "Recherche de groupes...",
      joining: "Inscription...",
      open_group: "Ouvrir le groupe",
      open_conversation: "Ouvrir la conversation",
      members_count: "membres",
      no_group_messages: "Aucun message dans ce groupe pour le moment.",
      group_course: "Cours",
      group_type: "Type",
      group_photo: "Photo du groupe",
      group_name_label: "Nom du groupe",
      save_group_details: "Enregistrer les détails du groupe",
      add_member: "Ajouter un membre",
      group_type_label: "Type de groupe",
      study_group: "Groupe d'étude",
      assignment_group: "Groupe de devoir",
      presentation_group: "Groupe de présentation",
      course_community: "Communauté de cours",
      other: "Autre",
      message_group_placeholder: "Écrire au groupe...",
      send_group_message: "Envoyer un message au groupe",
      back_to_groups: "Retour aux groupes",
      unable_read_photo: "Impossible de lire la photo sélectionnée.",
      unable_save_photo: "Impossible d'enregistrer la photo du groupe dans ce navigateur.",
      photo_size_error: "Choisissez une image de moins de 2 Mo.",
      profile_description: "Gardez vos informations CampusPlan à jour.",
      your_account: "VOTRE COMPTE",
      profile_photo: "Photo de profil",
      photo_help: "Utilisez une image JPG, PNG, GIF ou WebP de moins de 2 Mo.",
      change_photo: "Modifier la photo",
      remove_photo: "Supprimer la photo",
      save_profile: "Enregistrer le profil",
      profile_updated: "Profil enregistré.",
      photo_updated: "Photo de profil mise à jour.",
      photo_removed: "Photo de profil supprimée.",
      invalid_photo: "Choisissez une image de moins de 2 Mo.",
      no_notifications: "Aucune notification pour le moment.",
      no_reminders: "Aucun rappel pour le moment.",
      no_events: "Aucun événement pour le moment.",
      notifications_panel: "Notifications",
      notification_toggle_unread_one: "Ouvrir les notifications, {count} notification non lue",
      notification_toggle_unread_other: "Ouvrir les notifications, {count} notifications non lues",
      notification_assignment_today: "{title} est à rendre aujourd'hui.",
      notification_assignment_tomorrow: "{title} est à rendre demain.",
      notification_assignment_in_days: "{title} est à rendre dans {count} jours.",
      notification_test_today: "{title} a lieu aujourd'hui.",
      notification_test_tomorrow: "{title} a lieu demain.",
      notification_test_in_days: "{title} a lieu dans {count} jours.",
      notification_presentation_today: "{title} est prévue aujourd'hui.",
      notification_presentation_tomorrow: "{title} est prévue demain.",
      notification_presentation_in_days: "{title} est prévue dans {count} jours.",
      notification_personal_today: "À noter : {title} aujourd'hui.",
      notification_personal_tomorrow: "À noter : {title} demain.",
      notification_personal_in_days: "À noter : {title}, dans {count} jours.",
      notification_course: "Cours",
      notification_date: "Date",
      notification_time: "Heure",
      unread_notification_prefix: "Notification non lue :",
      unread_notifications_count_one: "{count} notification non lue",
      unread_notifications_count_other: "{count} notifications non lues",
      no_group_search_results: "Aucun groupe de communauté de cours trouvé.",
      save_event_button: "Enregistrer l'événement",
      edit_class: "Modifier le cours",
      delete_class_confirm: "Supprimer ce cours de votre emploi du temps ?",
      course_required: "Le nom du cours ou du module est obligatoire.",
      end_after_start: "L'heure de fin doit être après l'heure de début.",
      start_time_required: "Ajoutez une heure de début avant l'heure de fin.",
      open_calendar_action: "Ouvrir le calendrier",
      previous_month: "Mois précédent",
      next_month: "Mois suivant",
      calendar_legends: "Légende du calendrier",
      close_form: "Fermer le formulaire",
      close_event_details: "Fermer les détails de l'événement",
      close_event_form: "Fermer le formulaire d'événement",
      close_class_form: "Fermer le formulaire du cours",
      filter_assignments: "Filtrer les devoirs",
      add_class_action: "Ajouter un cours",
      save_test_action: "Enregistrer le test",
      no_messages_empty: "Aucun message pour le moment",
      save_test_modal: "Enregistrer le test",
      no_test_items: "Aucun test pour le moment.",
      loading_tests: "Chargement des tests...",
      invalid_image: "Veuillez choisir un fichier image valide.",
      student_id_label: "Identifiant étudiant :",
      message_action: "Message",
      personal_event: "Personnel",
      all_day: "Toute la journée",
      event: "Événement",
      edit_action: "Modifier",
      delete_action: "Supprimer",
      add_event_action: "Ajouter un événement",
      save_changes: "Enregistrer les modifications",
      good_afternoon: "Bonjour,",
      good_evening: "Bonsoir,",
      due_in_days: "À rendre dans {count} jours",
      unread_count: "{count} non lus",
      days_due: "{count} jours de retard",
      assignment_count_one: "{count} devoir",
      assignment_count_other: "{count} devoirs",
      classes_count: "{count} cours",
      choose_language: "Choisir la langue",
      english_language: "Anglais",
      french_language: "Français",
      tests_heading: "Tests et examens",
      add_test_button: "+ Ajouter un test",
      add_assignment_button: "+ Ajouter un devoir",
      add_presentation_button: "+ Ajouter une présentation",
      add_reminder_button: "+ Ajouter un rappel",
      all_assignment_heading: "Tous les devoirs",
      add_event_title: "Ajouter un événement personnel",
      delete_event_confirm: "Supprimer cet événement personnel ?",
      no_date: "Aucune date",
      no_description: "Aucune description disponible.",
      no_room: "Aucune salle indiquée",
      scheduled: "Planifié",
      managed_from: "Géré depuis",
      no_classes: "Aucun cours ajouté pour le moment.",
      add_weekly_classes: "Ajoutez vos cours hebdomadaires pour créer votre emploi du temps.",
      lecturer: "Enseignant :",
      loading_timetable: "Chargement de l'emploi du temps...",
      group_joined: "Vous avez rejoint le groupe.",
      already_group_member: "Vous êtes déjà membre de ce groupe.",
      group_not_joinable: "Ce groupe n'est pas ouvert aux inscriptions.",
      unable_load_groups: "Impossible de charger les groupes pour le moment.",
      unable_discover_groups: "Impossible de rechercher des groupes pour le moment.",
      unable_join_group: "Impossible de rejoindre le groupe pour le moment.",
      unable_load_group: "Impossible de charger ce groupe pour le moment.",
      unable_load_group_messages: "Impossible de charger les messages du groupe pour le moment.",
      unable_load_contacts: "Impossible de charger les contacts pour le moment.",
      no_description_provided: "Aucune description fournie.",
      days_remaining: "{count} jours restants",
      today_short: "Aujourd'hui",
      tomorrow: "Demain",
      switch_to_light: "Passer au mode clair",
      switch_to_dark: "Passer au mode sombre",
      yes: "Oui",
      no: "Non",
      monday: "Lundi",
      tuesday: "Mardi",
      wednesday: "Mercredi",
      thursday: "Jeudi",
      friday: "Vendredi",
      saturday: "Samedi",
      sunday: "Dimanche",
      mon: "Lun.",
      tue: "Mar.",
      wed: "Mer.",
      thu: "Jeu.",
      fri: "Ven.",
      sat: "Sam.",
      sun: "Dim.",
      see_calendar: "Voir le calendrier",
      assignments_add: "Ajouter un devoir",
      group_description_label: "Description",
      course_code: "Code du cours",
      course_module_name: "Nom du cours/module",
      lecturer_label: "Enseignant",
      notes: "Notes",
      close_navigation: "Fermer la navigation",
      start_group_conversation: "Commencez à collaborer avec votre groupe",
      new_group: "Nouveau groupe",
      server_session_expired: "Votre session a expiré. Veuillez vous reconnecter.",
      invalid_email: "Veuillez saisir une adresse e-mail valide.",
      unavailable: "Indisponible",
      admin: "Administrateur",
      member: "Membre",
      group_member_count: "{count} membres",
      unread_messages_aria: "{count} messages non lus",
      progress_summary: "{done} devoirs terminés sur {total}",
      progress_summary_one: "{done} devoir terminé sur {total}",
      progress_summary_other: "{done} devoirs terminés sur {total}",
      edit_test_exam: "Modifier le test ou l'examen",
      edit_personal_event: "Modifier l'événement personnel",
      tests_page_heading: "Tests et examens",
      no_assignments_empty: "Aucun devoir pour le moment",
      no_presentations_empty: "Aucune présentation pour le moment.",
      student_id_colon: "Identifiant étudiant :",
      add_personal_event_title: "Ajouter un événement personnel",
      quick_calendar_action: "Ouvrir le calendrier",
      manage_assignments_action: "Gérer les devoirs",
      all_courses_filter: "Tous les cours",
      no_upcoming_events: "Aucun événement à venir.",
      show_password_action: "Afficher le mot de passe",
      add_test_or_exam: "Ajouter un test ou un examen",
      message_this_group: "Écrire au groupe...",
      no_room_specified: "Aucune salle indiquée",
      preparation_status_label: "État de préparation",
      course_field_label: "Cours",
      start_collaboration: "Commencez à collaborer avec votre groupe",
      select_contacts: "Sélectionnez Contacts pour en démarrer une.",
      previous_month_label: "Mois précédent",
      next_month_label: "Mois suivant",
      due_today_title: "À rendre aujourd'hui",
      due_tomorrow_title: "À rendre demain",
      open_group_aria: "Ouvrir {name}",
      remove_member_aria: "Retirer {name}",
      connection_error: "Impossible de se connecter au serveur CampusPlan.",
      fetch_error: "Échec de la requête.",
      no_recent_conversations: "Aucune conversation récente.",
      no_recent_group_activity: "Aucune activité récente dans les groupes.",
      no_contacts_found: "Aucun contact trouvé.",
      select_chat_prompt: "Sélectionnez une discussion ou un contact pour commencer.",
      start_conversation_prompt: "Commencer une conversation avec",
      messages_length_error: "Les messages ne peuvent pas dépasser 2 000 caractères.",
      group_photo_invalid: "Veuillez choisir une image de moins de 2 Mo.",
      group_photo_save_error: "Impossible d'enregistrer la photo du groupe dans ce navigateur.",
      group_photo_read_error: "Impossible de lire la photo de groupe sélectionnée.",
      unable_load_students: "Impossible de charger les étudiants",
      api_valid_conversation_student: "Un étudiant valide est requis pour cette conversation.",
      api_valid_group: "Un groupe valide est requis.",
      api_valid_receiver: "Un destinataire valide est requis.",
      api_valid_student: "Un étudiant valide est requis.",
      api_assignment_deleted: "Devoir supprimé.",
      api_assignment_not_found: "Devoir introuvable.",
      api_calendar_event_deleted: "Événement du calendrier supprimé.",
      api_calendar_event_not_found: "Événement du calendrier introuvable.",
      api_conversation_read: "Conversation marquée comme lue.",
      api_group_member_not_found: "Membre du groupe introuvable.",
      api_group_messages_read: "Messages du groupe marqués comme lus.",
      api_group_not_found: "Groupe introuvable.",
      api_member_added: "Membre ajouté avec succès.",
      api_member_removed: "Membre retiré avec succès.",
      api_message_empty: "Le message ne peut pas être vide.",
      api_message_too_long: "Le message est trop long.",
      api_admin_required: "Seuls les administrateurs du groupe peuvent effectuer cette action.",
      api_presentation_deleted: "Présentation supprimée.",
      api_presentation_not_found: "Présentation introuvable.",
      api_student_account_not_found: "Compte étudiant introuvable.",
      api_student_not_found: "Étudiant introuvable.",
      api_test_deleted: "Test supprimé.",
      api_test_not_found: "Test introuvable.",
      api_creator_must_leave: "Le créateur du groupe doit utiliser l'option Quitter le groupe.",
      api_last_member_cannot_leave: "Le dernier membre du groupe ne peut pas le quitter.",
      api_student_already_member: "Cet étudiant est déjà membre du groupe.",
      api_timetable_entry_deleted: "Entrée de l'emploi du temps supprimée.",
      api_timetable_entry_not_found: "Entrée de l'emploi du temps introuvable.",
      api_add_student_error: "Impossible d'ajouter l'étudiant pour le moment.",
      api_create_assignment_error: "Impossible de créer le devoir pour le moment.",
      api_create_calendar_event_error: "Impossible de créer l'événement du calendrier pour le moment.",
      api_create_group_error: "Impossible de créer le groupe pour le moment.",
      api_create_presentation_error: "Impossible de créer la présentation pour le moment.",
      api_create_test_error: "Impossible de créer le test pour le moment.",
      api_create_timetable_error: "Impossible de créer l'entrée de l'emploi du temps pour le moment.",
      api_delete_assignment_error: "Impossible de supprimer le devoir pour le moment.",
      api_delete_calendar_event_error: "Impossible de supprimer l'événement du calendrier pour le moment.",
      api_delete_presentation_error: "Impossible de supprimer la présentation pour le moment.",
      api_delete_test_error: "Impossible de supprimer le test pour le moment.",
      api_delete_timetable_error: "Impossible de supprimer l'entrée de l'emploi du temps pour le moment.",
      api_leave_group_error: "Impossible de quitter le groupe pour le moment.",
      api_load_assignments_error: "Impossible de charger les devoirs pour le moment.",
      api_load_calendar_error: "Impossible de charger les événements du calendrier pour le moment.",
      api_load_conversations_error: "Impossible de charger les conversations pour le moment.",
      api_load_presentations_error: "Impossible de charger les présentations pour le moment.",
      api_load_tests_error: "Impossible de charger les tests pour le moment.",
      api_load_assignment_error: "Impossible de charger le devoir pour le moment.",
      api_load_calendar_event_error: "Impossible de charger l'événement du calendrier pour le moment.",
      api_load_conversation_error: "Impossible de charger la conversation pour le moment.",
      api_load_presentation_error: "Impossible de charger la présentation pour le moment.",
      api_load_profile_error: "Impossible de charger le profil étudiant.",
      api_load_test_error: "Impossible de charger le test pour le moment.",
      api_load_timetable_entry_error: "Impossible de charger l'entrée de l'emploi du temps pour le moment.",
      api_load_timetable_error: "Impossible de charger l'emploi du temps pour le moment.",
      api_remove_student_error: "Impossible de retirer l'étudiant pour le moment.",
      api_search_students_error: "Impossible de rechercher des étudiants pour le moment.",
      api_send_message_error: "Impossible d'envoyer le message pour le moment.",
      api_update_group_messages_error: "Impossible de mettre à jour les messages du groupe pour le moment.",
      api_update_message_status_error: "Impossible de mettre à jour l'état du message pour le moment.",
      api_update_assignment_error: "Impossible de mettre à jour le devoir pour le moment.",
      api_update_calendar_event_error: "Impossible de mettre à jour l'événement du calendrier pour le moment.",
      api_update_group_error: "Impossible de mettre à jour le groupe pour le moment.",
      api_update_presentation_error: "Impossible de mettre à jour la présentation pour le moment.",
      api_update_test_error: "Impossible de mettre à jour le test pour le moment.",
      api_update_timetable_error: "Impossible de mettre à jour l'entrée de l'emploi du temps pour le moment.",
      api_not_group_member: "Vous n'êtes pas membre de ce groupe.",
      api_left_group: "Vous avez quitté le groupe.",
    },
  };

  const phraseKeys = new Map();
  Object.keys(translations.en).forEach((key) => {
    phraseKeys.set(
      translations.en[key].replace(/\s+/g, " ").trim().toLocaleLowerCase(),
      key,
    );
  });
  const textNodes = [];
  const elementTexts = [];
  const attributes = [];
  const dynamicTextNodes = [];
  const dynamicElementTexts = [];
  const dynamicAttributes = [];
  const seenTextNodes = new WeakSet();
  const seenTextElements = new WeakSet();
  const seenAttributes = new WeakMap();
  let language = "en";
  let titleKey;

  function keyFor(value) {
    return phraseKeys.get(
      String(value).replace(/\s+/g, " ").trim().toLocaleLowerCase(),
    );
  }

  function t(key, values) {
    const translationKey =
      translations.en[key] !== undefined ? key : keyFor(key);
    if (!translationKey) return String(key);
    let phrase = translations[language][translationKey] || translations.en[translationKey];
    Object.keys(values || {}).forEach((name) => {
      phrase = phrase.replaceAll("{" + name + "}", values[name]);
    });
    return phrase;
  }

  function applyExplicitTranslations(root) {
    const matching = (selector) => {
      const elements = Array.from(root.querySelectorAll(selector));
      if (root.nodeType === Node.ELEMENT_NODE && root.matches(selector)) {
        elements.unshift(root);
      }
      return elements;
    };
    matching("[data-i18n]").forEach((element) => {
      const translation = t(element.dataset.i18n);
      if (element.textContent !== translation) element.textContent = translation;
    });
    matching("[data-i18n-placeholder]").forEach((element) => {
      const translation = t(element.dataset.i18nPlaceholder);
      if (element.getAttribute("placeholder") !== translation) {
        element.setAttribute("placeholder", translation);
      }
    });
    matching("[data-i18n-title]").forEach((element) => {
      const translation = t(element.dataset.i18nTitle);
      if (element.getAttribute("title") !== translation) {
        element.setAttribute("title", translation);
      }
    });
    matching("[data-i18n-aria-label]").forEach((element) => {
      const translation = t(element.dataset.i18nAriaLabel);
      if (element.getAttribute("aria-label") !== translation) {
        element.setAttribute("aria-label", translation);
      }
    });
  }

  function captureStaticTranslations() {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const node = walker.currentNode;
      const parent = node.parentElement;
      if (!parent || parent.closest("[data-no-translate]")) continue;
      if (["SCRIPT", "STYLE", "TEXTAREA", "OPTION"].includes(parent.tagName)) {
        if (parent.tagName !== "OPTION") continue;
      }
      const key = keyFor(node.nodeValue);
      if (key) textNodes.push({ node, original: node.nodeValue, key });
    }
    captureLeafTranslations(
      document.body,
      elementTexts,
      seenTextElements,
      false,
    );
    document.querySelectorAll("*").forEach((element) => {
      if (element.closest("[data-no-translate]")) return;
      ["placeholder", "title", "aria-label"].forEach((name) => {
        const key = keyFor(element.getAttribute(name));
        if (key) attributes.push({ element, name, original: element.getAttribute(name), key });
      });
    });
  }

  function captureLeafTranslations(root, list, seen, dynamic) {
    const elements = [];
    if (root.nodeType === Node.ELEMENT_NODE) elements.push(root);
    elements.push(...root.querySelectorAll("*"));
    elements.forEach((element) => {
      if (
        element.children.length ||
        element.closest(
          "[data-no-translate], .bubble, .message-preview, .conversation-copy, .contact-copy, .group-card-top h2, .group-card-top p, .group-last-message, .discover-group-description, .notification-item strong, .notification-item span, .course-tag, .assignment-card h2, .assignment-card > p, .test-card h2, .test-card > p, .presentation-card h2, .presentation-details dd, .timetable-class h3, .timetable-class p, .timetable-class small, .task h3, .task p, .event h3, .event p, .reminder-item strong, .reminder-item small, .member > span, .dashboard-mini-copy h3, .dashboard-mini-copy p, .profile-name, #student-name, #chat-name, #group-name, #group-description, #group-course, #group-info-course, #group-info-type, #group-edit-name, #group-edit-description, #calendar-event-title, #calendar-event-course, #calendar-event-description, #calendar-personal-title",
        ) ||
        (dynamic && element.tagName === "OPTION") ||
        seen.has(element)
      ) {
        return;
      }
      const key = keyFor(element.textContent);
      if (key) {
        seen.add(element);
        list.push({ element, original: element.textContent, key });
      }
    });
  }

  function updateLanguageButtons() {
    document.querySelectorAll(".language-selector").forEach((selector) => {
      selector.setAttribute("aria-label", t("choose_language"));
    });
    document.querySelectorAll("[data-language-choice]").forEach((button) => {
      const selected = button.dataset.languageChoice === language;
      button.setAttribute("aria-pressed", String(selected));
      button.classList.toggle("active", selected);
      button.setAttribute(
        "aria-label",
        t(button.dataset.languageChoice === "en" ? "english_language" : "french_language"),
      );
    });
  }

  function isUserContent(node) {
    const parent = node.parentElement;
    return (
      !parent ||
      parent.closest(
        "[data-no-translate], .bubble, .message-preview, .conversation-copy, .contact-copy, .group-card-top h2, .group-card-top p, .group-last-message, .discover-group-description, .notification-item strong, .notification-item span, .course-tag, .assignment-card h2, .assignment-card > p, .test-card h2, .test-card > p, .presentation-card h2, .presentation-details dd, .timetable-class h3, .timetable-class p, .timetable-class small, .task h3, .task p, .event h3, .event p, .reminder-item strong, .reminder-item small, .member > span, .dashboard-mini-copy h3, .dashboard-mini-copy p, .profile-name, #student-name, #chat-name, #group-name, #group-description, #group-course, #group-info-course, #group-info-type, #group-edit-name, #group-edit-description, #calendar-event-title, #calendar-event-course, #calendar-event-description, #calendar-personal-title",
      ) ||
      parent.closest("option")
    );
  }

  function captureDynamicTranslations(root) {
    captureLeafTranslations(
      root,
      dynamicElementTexts,
      seenTextElements,
      true,
    );
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (isUserContent(node)) continue;
      const key = keyFor(node.nodeValue);
      if (key && !seenTextNodes.has(node)) {
        seenTextNodes.add(node);
        dynamicTextNodes.push({ node, original: node.nodeValue, key });
      }
    }
    root.querySelectorAll("*").forEach((element) => {
      if (element.closest("[data-no-translate]") || element.closest("option")) return;
      ["placeholder", "title", "aria-label"].forEach((name) => {
        let names = seenAttributes.get(element);
        if (!names) {
          names = new Set();
          seenAttributes.set(element, names);
        }
        if (names.has(name)) return;
        const key = keyFor(element.getAttribute(name));
        if (key) {
          names.add(name);
          dynamicAttributes.push({ element, name, original: element.getAttribute(name), key });
        }
      });
    });
  }

  function applyLanguage(nextLanguage) {
    language = nextLanguage === "fr" ? "fr" : "en";
    try {
      localStorage.setItem(LANGUAGE_KEY, language);
    } catch (error) {
      console.warn("Unable to save the language preference.", error);
    }
    document.documentElement.lang = language;
    textNodes.forEach(({ node, original, key }) => {
      if (node.isConnected) {
        const leading = original.match(/^\s*/)[0];
        const trailing = original.match(/\s*$/)[0];
        node.nodeValue = leading + t(key) + trailing;
      }
    });
    dynamicTextNodes.forEach(({ node, original, key }) => {
      if (node.isConnected) {
        const leading = original.match(/^\s*/)[0];
        const trailing = original.match(/\s*$/)[0];
        node.nodeValue = leading + t(key) + trailing;
      }
    });
    [...elementTexts, ...dynamicElementTexts].forEach(
      ({ element, key }) => {
        if (element.isConnected && element.textContent !== t(key)) {
          element.textContent = t(key);
        }
      },
    );
    attributes.forEach(({ element, original, name, key }) => {
      if (element.isConnected) element.setAttribute(name, t(key) || original);
    });
    dynamicAttributes.forEach(({ element, original, name, key }) => {
      if (element.isConnected) element.setAttribute(name, t(key) || original);
    });
    applyExplicitTranslations(document);
    if (titleKey) document.title = t(titleKey);
    updateLanguageButtons();
    document.dispatchEvent(
      new CustomEvent("campusplan-language-change", { detail: { language } }),
    );
  }

  function createSelector(container) {
    if (container.querySelector(".language-selector")) return;
    const selector = document.createElement("div");
    selector.className = "language-selector";
    selector.setAttribute("role", "group");
    selector.setAttribute("aria-label", "Language / Langue");
    selector.innerHTML =
      '<button type="button" data-language-choice="en" aria-label="English" aria-pressed="true">EN</button>' +
      '<button type="button" data-language-choice="fr" aria-label="Français" aria-pressed="false">FR</button>';
    selector.addEventListener("click", (event) => {
      const button = event.target.closest("[data-language-choice]");
      if (button) applyLanguage(button.dataset.languageChoice);
    });
    container.appendChild(selector);
  }

  function initialize() {
    let saved = "en";
    try {
      saved = localStorage.getItem(LANGUAGE_KEY) || "en";
    } catch (error) {
      console.warn("Unable to load the saved language preference.", error);
    }
    captureStaticTranslations();
    titleKey = keyFor(document.title);
    const header = document.querySelector(".site-header");
    if (header) {
      const profile = header.querySelector(".profile");
      const selector = document.createElement("div");
      createSelector(selector);
      if (profile) header.insertBefore(selector.firstChild, profile);
      else header.appendChild(selector.firstChild);
    } else {
      const authCard =
        document.querySelector(".login-form-panel") ||
        document.querySelector(".auth-card.wide");
      if (authCard) {
        createSelector(authCard);
        const languageSelector = authCard.querySelector(".language-selector");
        const brand = authCard.querySelector(".brand");
        authCard.insertBefore(
          languageSelector,
          brand ? brand.nextSibling : authCard.firstChild,
        );
      }
    }
    applyLanguage(saved);
    const observer = new MutationObserver((records) => {
      records.forEach((record) => {
        record.addedNodes.forEach((node) => {
          if (node.nodeType === Node.TEXT_NODE) {
            if (isUserContent(node)) return;
            const key = keyFor(node.nodeValue);
            if (key && !seenTextNodes.has(node)) {
              seenTextNodes.add(node);
              dynamicTextNodes.push({ node, original: node.nodeValue, key });
            }
          } else if (node.nodeType === Node.ELEMENT_NODE) {
            captureDynamicTranslations(node);
            applyExplicitTranslations(node);
          }
        });
      });
      dynamicTextNodes.forEach(({ node, original, key }) => {
        if (!node.isConnected) return;
        const leading = original.match(/^\s*/)[0];
        const trailing = original.match(/\s*$/)[0];
        node.nodeValue = leading + t(key) + trailing;
      });
      dynamicElementTexts.forEach(({ element, key }) => {
        if (element.isConnected && element.textContent !== t(key)) {
          element.textContent = t(key);
        }
      });
      dynamicAttributes.forEach(({ element, original, name, key }) => {
        if (element.isConnected) element.setAttribute(name, t(key) || original);
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  window.CampusPlanI18n = {
    t,
    getLanguage: () => language,
    setLanguage: applyLanguage,
    formatLocale: () => (language === "fr" ? "fr-FR" : "en-GB"),
    apply: applyExplicitTranslations,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, { once: true });
  } else {
    initialize();
  }
})();
