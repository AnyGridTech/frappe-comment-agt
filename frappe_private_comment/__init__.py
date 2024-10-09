# flake8: noqa

__version__ = "0.0.1"


def patch_add_comments_in_timeline():
    import frappe.desk.form.load as frappe_load

    from frappe_private_comment.helpers.comment import add_comments_in_timeline

    # A monkey patch was written for this function as it is used in many places within Frappe. Care was taken to avoid breaking existing code.

    frappe_load.add_comments = add_comments_in_timeline


try:
    patch_add_comments_in_timeline()
except Exception:
    pass
