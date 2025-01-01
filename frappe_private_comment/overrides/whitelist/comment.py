from typing import TYPE_CHECKING

import frappe
from frappe.core.doctype.file.utils import extract_images_from_html
from frappe.desk.form.document_follow import follow_document

from frappe_private_comment.helpers.comment import filter_comments_by_visibility, get_mention_user

if TYPE_CHECKING:
    from frappe.core.doctype.comment.comment import Comment


@frappe.whitelist(methods=["POST", "PUT"])
def add_comment_override(
    reference_doctype: str,
    reference_name: str,
    content: str,
    comment_email: str,
    comment_by: str,
    custom_visibility: str = "Visible to everyone",
    custom_reply_to: str | None = None,
) -> "Comment":
    """Allow logged user with permission to read document to add a comment"""
    reference_doc = frappe.get_doc(reference_doctype, reference_name)
    reference_doc.check_permission()

    comment = frappe.new_doc("Comment")
    comment.update(
        {
            "comment_type": "Comment",
            "reference_doctype": reference_doctype,
            "reference_name": reference_name,
            "comment_email": comment_email,
            "comment_by": comment_by,
            "content": extract_images_from_html(reference_doc, content, is_private=True),
            "custom_visibility": custom_visibility,
            "custom_mentions": get_mention_user(content),
            "custom_reply_to": custom_reply_to,
        }
    )
    comment.insert(ignore_permissions=True)

    if frappe.get_cached_value("User", frappe.session.user, "follow_commented_documents"):
        follow_document(comment.reference_doctype, comment.reference_name, frappe.session.user)

    return comment


@frappe.whitelist()
def update_comment_override(name: str, content: str, custom_visibility: str = ""):
    """allow only owner to update comment"""

    # We are overriding the default Frappe update call because there's no way to store this information with a JavaScript override.

    if not custom_visibility:
        return None

    doc = frappe.get_doc("Comment", name)

    if frappe.session.user not in ["Administrator", doc.owner]:
        frappe.throw(frappe._("Comment can only be edited by the owner"), frappe.PermissionError)

    if doc.reference_doctype and doc.reference_name:
        reference_doc = frappe.get_doc(doc.reference_doctype, doc.reference_name)
        reference_doc.check_permission()

        doc.content = extract_images_from_html(reference_doc, content, is_private=True)
    else:
        doc.content = content

    doc.set("custom_mentions", get_mention_user(doc.content))
    doc.set("custom_visibility", custom_visibility)

    doc.save(ignore_permissions=True)


@frappe.whitelist()
def get_comment_visibility(name: str):
    """allow only owner to update comment"""

    doc = frappe.get_doc("Comment", name)

    if frappe.session.user not in ["Administrator", doc.owner]:
        return None

    return {"custom_visibility": doc.custom_visibility}


@frappe.whitelist()
def get_comment_replies(reference_doctype: str, comment_id: str):
    """Get comment replies"""
    replies = frappe.get_all(
        "Comment",
        filters={
            "reference_doctype": reference_doctype,
            "custom_reply_to": comment_id,
        },
        fields="*",
        order_by="creation DESC",
    )
    return filter_comments_by_visibility(replies, frappe.session.user)


@frappe.whitelist()
def get_all_replies(reference_doctype: str, reference_name: str):
    """Get all replies for a comment in a structured format"""
    replies = frappe.get_all(
        "Comment",
        filters={
            "reference_doctype": reference_doctype,
            "reference_name": reference_name,
        },
        fields="*",
        order_by="creation DESC",
    )
    filtered_replies = filter_comments_by_visibility(replies, frappe.session.user)

    # Create a dictionary to store the structured comments
    structured_comments = dict()

    for reply in filtered_replies:
        if reply["custom_reply_to"]:
            structured_comments.setdefault(reply["custom_reply_to"], [])
            structured_comments[reply["custom_reply_to"]].append(reply)

    return structured_comments
