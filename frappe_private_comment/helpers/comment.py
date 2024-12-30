import frappe
from frappe.desk.notifications import extract_mentions


def get_mention_user(content):
    if not content:
        return []

    users = extract_mentions(content)
    mention_users = []

    for user in users:
        mention_users.append({"user": user})

    return mention_users


def add_comments_in_timeline(doc, docinfo):
    # divide comments into separate lists
    docinfo.comments = []
    docinfo.shared = []
    docinfo.assignment_logs = []
    docinfo.attachment_logs = []
    docinfo.info_logs = []
    docinfo.like_logs = []
    docinfo.workflow_logs = []

    # Get only parent comments
    comments = frappe.get_all(
        "Comment",
        fields="*",
        filters={
            "reference_doctype": doc.doctype,
            "reference_name": doc.name,
            "custom_reply_to": "",
        },
    )

    filtered_comments = filter_comments_by_visibility(comments, frappe.session.user)

    for c in filtered_comments:
        match c.comment_type:
            case "Comment":
                c.content = frappe.utils.markdown(c.content)
                docinfo.comments.append(c)
            case "Shared" | "Unshared":
                docinfo.shared.append(c)
            case "Assignment Completed" | "Assigned":
                docinfo.assignment_logs.append(c)
            case "Attachment" | "Attachment Removed":
                docinfo.attachment_logs.append(c)
            case "Info" | "Edit" | "Label":
                docinfo.info_logs.append(c)
            case "Like":
                docinfo.like_logs.append(c)
            case "Workflow":
                docinfo.workflow_logs.append(c)

    return comments


def filter_comments_by_visibility(comments, user):
    filtered_comments = []

    if user != "Administrator":
        for comment in comments:
            if comment.custom_visibility == "Visible to only you":
                if comment.owner == user:
                    filtered_comments.append(comment)

            elif comment.custom_visibility == "Visible to mentioned":
                member = frappe.db.get_all(
                    "User Group Member",
                    filters={
                        "user": user,
                        "parent": comment.name,
                        "parenttype": "Comment",
                    },
                )

                if comment.owner == user or (len(member) > 0):
                    filtered_comments.append(comment)

            else:
                filtered_comments.append(comment)
    else:
        filtered_comments = comments
    return filtered_comments
