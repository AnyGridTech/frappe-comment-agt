function render_replies(commentSelector, replies) {
  const $comment = $(commentSelector);
  const $prevContainer = $comment.next(".threaded-reply-container");
  $prevContainer && $prevContainer.remove();

  const $replyContainer = $(
    '<div class="threaded-reply-container " style="margin-left: 90px; position: relative;"></div>'
  );

  // Add vertical line
  $replyContainer.append(
    '<div class="vertical-line" style="position: absolute; left: -30px; top: 0; bottom: 0; width: 1px; background-color: #d1d8dd;"></div>'
  );

  replies.forEach((reply) => {
    const $replyContent = $(`
          <div style="position: relative;">
            <div class="timeline-badge" style="position: absolute; left: -43px; top: 10px; background-color: #F3F3F3; padding: 5px; border-radius: 999px;">
                <svg class="icon icon-md">
                    <use href="#icon-small-message"></use>
                </svg>
            </div>
            <div class="timeline-item frappe-card" data-doctype="Comment" style="position: relative; background-color: #F7F7F7; max-width: 700px">
                <div class="timeline-content">
                    <div class="timeline-message-box">
                        <span class="text-muted">
                            ${frappe.avatar(frappe.session.user, "avatar-medium")}
                            <span class="timeline-user">${
                              reply.comment_by === frappe.session.user ? "You" : reply.comment_by
                            } commented . </span>
                            <span>&nbsp; ${frappe.datetime.comment_when(reply.creation)}</span>
                        </span>
                    <span>${update_the_comment_visibility(true)}</span><hr />
                        <div class="read-mode">
                            <p>${reply.content}</p>
                        </div>
                    </div>
                </div>
            </div>
          </div>
                `);

    $replyContainer.append($replyContent);

    const replyButton = $("<button>")
      .addClass("btn btn-xs btn-link reply-btn")
      .css({
        float: "right",
        marginLeft: "auto",
      })
      .html('<i class="fa fa-reply"></i> Reply')
      .on("click", () => handle_reply(commentSelector));

    $replyContent.find(".text-muted").append(replyButton);
  });
  $comment.after($replyContainer);
}

function addThreadedReply(commentSelector, doctype) {
  const $comment = $(commentSelector);
  const commentId = $comment.data("name");

  frappe.call({
    method: "frappe_private_comment.overrides.whitelist.comment.get_comment_replies",
    args: {
      reference_doctype: doctype,
      comment_id: commentId,
    },
    callback: (res) => {
      if (res.exc) {
        console.error(res.exc);
        return;
      }

      if (!res.message || !res.message.length) {
        // No replies found
        return;
      }

      render_replies(commentSelector, res.message);
    },
  });
}

function add_reply_button(time_line_item) {
  const replyButton = $("<button>")
    .addClass("btn btn-xs btn-link reply-btn")
    .html('<i class="fa fa-reply"></i> Reply')
    .on("click", () => handle_reply(time_line_item));

  $(time_line_item).find(".custom-actions").prepend(replyButton);
}

function handle_reply(time_line_item) {
  const commentBox = $(time_line_item).find(".comment-edit-box");

  if (!commentBox.length) {
    console.error("Comment box not found");
    return;
  }

  commentBox.css("display", "block");
  commentBox.empty();

  const replyEditBox = $("<div>").addClass("reply-edit-box").html(`
      <div class="ql-container ql-snow">
        <div class="ql-editor" contenteditable="true" style="max-height: 40px;">
        </div>
      </div>
      <div class="reply-actions" style="background-color: white; padding: 4px;">
        <button class="btn btn-sm btn-primary submit-reply">Submit</button>
        <button class="btn btn-sm btn-default cancel-reply">Cancel</button>
      </div>
    `);

  commentBox.append(replyEditBox);

  replyEditBox.find(".ql-editor").focus();

  replyEditBox.find(".submit-reply").on("click", () => {
    const replyContent = replyEditBox.find(".ql-editor").html();
    submit_reply(time_line_item, replyContent);
  });

  replyEditBox.find(".cancel-reply").on("click", () => {
    commentBox.empty().css("display", "none");
  });

  // Scroll to the comment box
  $("html, body").animate(
    {
      scrollTop: commentBox.offset().top - $(window).height() / 2,
    },
    1000
  );
}

function submit_reply(time_line_item, content) {
  frappe.call({
    method: "frappe.desk.form.utils.add_comment",
    args: {
      reference_doctype: this.cur_frm.doctype,
      reference_name: this.cur_frm.docname,
      custom_reply_to: $(time_line_item).data("name") || null,
      content: content,
      comment_email: frappe.session.user,
      comment_by: frappe.session.user_fullname,
    },
    callback: (r) => {
      if (r.message) {
        $(time_line_item).find(".comment-edit-box").empty().css("display", "none");
        frappe.utils.play_sound("click");
        update_comments_timeline();
        addThreadedReply(time_line_item, this.cur_frm.doctype);
      }
    },
  });
}
