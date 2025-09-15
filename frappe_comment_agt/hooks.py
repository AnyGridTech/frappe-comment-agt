app_name = "frappe_comment_agt"
app_title = "Frappe Comment Xt"
app_publisher = "rtCamp"
app_description = "Enhancing the default comments function in Frappe"
app_email = "frappe@rtcamp.com"
app_license = "GNU AFFERO GENERAL PUBLIC LICENSE (v3)"

# required_apps = []

# Includes in <head>
# ------------------

# include js, css files in header of desk.html
app_include_css = [
    "/assets/frappe_comment_agt/css/frappe_comment_agt.css",
    "/assets/frappe_comment_agt/css/replies.css",
]
app_include_js = [
    "/assets/frappe_comment_agt/js/frappe_comment_agt.js",
    "footer.bundle.js",
]

# include js, css files in header of web template
# web_include_css = "/assets/frappe_comment_agt/css/frappe_comment_agt.css"
# web_include_js = "/assets/frappe_comment_agt/js/frappe_comment_agt.js"

# include custom scss in every website theme (without file extension ".scss")
# website_theme_scss = "frappe_comment_agt/public/scss/website"

# include js, css files in header of web form
# webform_include_js = {"doctype": "public/js/doctype.js"}
# webform_include_css = {"doctype": "public/css/doctype.css"}

# include js in page
# page_js = {"page" : "public/js/file.js"}

# include js in doctype views
# doctype_js = {"doctype" : "public/js/doctype.js"}
# doctype_list_js = {"doctype" : "public/js/doctype_list.js"}
# doctype_tree_js = {"doctype" : "public/js/doctype_tree.js"}
# doctype_calendar_js = {"doctype" : "public/js/doctype_calendar.js"}

# Svg Icons
# ------------------
# include app icons in desk
# app_include_icons = "frappe_comment_agt/public/icons.svg"

# Home Pages
# ----------

# application home page (will override Website Settings)
# home_page = "login"

# website user home page (by Role)
# role_home_page = {
# 	"Role": "home_page"
# }

# Generators
# ----------

# automatically create page for each record of this doctype
# website_generators = ["Web Page"]

# Jinja
# ----------

# add methods and filters to jinja environment
# jinja = {
# 	"methods": "frappe_comment_agt.utils.jinja_methods",
# 	"filters": "frappe_comment_agt.utils.jinja_filters"
# }

# Installation
# ------------

# before_install = "frappe_comment_agt.install.before_install"
# after_install = "frappe_comment_agt.install.after_install"

# Uninstallation
# ------------

# before_uninstall = "frappe_comment_agt.uninstall.before_uninstall"
# after_uninstall = "frappe_comment_agt.uninstall.after_uninstall"

# Integration Setup
# ------------------
# To set up dependencies/integrations with other apps
# Name of the app being installed is passed as an argument

# before_app_install = "frappe_comment_agt.utils.before_app_install"
# after_app_install = "frappe_comment_agt.utils.after_app_install"

# Integration Cleanup
# -------------------
# To clean up dependencies/integrations with other apps
# Name of the app being uninstalled is passed as an argument

# before_app_uninstall = "frappe_comment_agt.utils.before_app_uninstall"
# after_app_uninstall = "frappe_comment_agt.utils.after_app_uninstall"

# Desk Notifications
# ------------------
# See frappe.core.notifications.get_notification_config

# notification_config = "frappe_comment_agt.notifications.get_notification_config"

# Permissions
# -----------
# Permissions evaluated in scripted ways

# permission_query_conditions = {
# 	"Event": "frappe.desk.doctype.event.event.get_permission_query_conditions",
# }
#
# has_permission = {
# 	"Event": "frappe.desk.doctype.event.event.has_permission",
# }

# DocType Class
# ---------------
# Override standard doctype classes

override_doctype_class = {
    "Notification Log": "frappe_comment_agt.overrides.notification_log_override.NotificationLogOverride"
}

# Document Events
# ---------------
# Hook on document methods and events

# doc_events = {
# 	"*": {
# 		"on_update": "method",
# 		"on_cancel": "method",
# 		"on_trash": "method"
# 	}
# }

# Scheduled Tasks
# ---------------

# scheduler_events = {
# 	"all": [
# 		"frappe_comment_agt.tasks.all"
# 	],
# 	"daily": [
# 		"frappe_comment_agt.tasks.daily"
# 	],
# 	"hourly": [
# 		"frappe_comment_agt.tasks.hourly"
# 	],
# 	"weekly": [
# 		"frappe_comment_agt.tasks.weekly"
# 	],
# 	"monthly": [
# 		"frappe_comment_agt.tasks.monthly"
# 	],
# }

# Fixtures
# ----------
fixtures = [
    {
        "dt": "Custom Field",
        "filters": [
            [
                "dt",
                "in",
                ["Comment"],
            ]
        ],
    },
]

# Testing
# -------

# before_tests = "frappe_comment_agt.install.before_tests"

# Overriding Methods
# ------------------------------
#
override_whitelisted_methods = {
    "frappe.desk.form.utils.add_comment": "frappe_comment_agt.overrides.whitelist.comment.add_comment_override",
    "frappe.desk.form.utils.update_comment": "frappe_comment_agt.overrides.whitelist.comment.update_comment_override",
}
#
# each overriding function accepts a `data` argument;
# generated from the base implementation of the doctype dashboard,
# along with any modifications made in other Frappe apps
# override_doctype_dashboards = {
# }

# exempt linked doctypes from being automatically cancelled
#
# auto_cancel_exempted_doctypes = ["Auto Repeat"]

# Ignore links to specified DocTypes when deleting documents
# -----------------------------------------------------------

# ignore_links_on_delete = ["Communication", "ToDo"]

# Request Events
# ----------------
# before_request = ["frappe_comment_agt.utils.before_request"]
# after_request = ["frappe_comment_agt.utils.after_request"]

# Job Events
# ----------
# before_job = ["frappe_comment_agt.utils.before_job"]
# after_job = ["frappe_comment_agt.utils.after_job"]

# User Data Protection
# --------------------

# user_data_fields = [
# 	{
# 		"doctype": "{doctype_1}",
# 		"filter_by": "{filter_by}",
# 		"redact_fields": ["{field_1}", "{field_2}"],
# 		"partial": 1,
# 	},
# 	{
# 		"doctype": "{doctype_2}",
# 		"filter_by": "{filter_by}",
# 		"partial": 1,
# 	},
# 	{
# 		"doctype": "{doctype_3}",
# 		"strict": False,
# 	},
# 	{
# 		"doctype": "{doctype_4}"
# 	}
# ]

# Authentication and authorization
# --------------------------------

# auth_hooks = [
# 	"frappe_comment_agt.auth.validate"
# ]

# Automatically update python controller files with type annotations for this app.
# export_python_type_annotations = True

# default_log_clearing_doctypes = {
# 	"Logging DocType Name": 30  # days to retain logs
# }
