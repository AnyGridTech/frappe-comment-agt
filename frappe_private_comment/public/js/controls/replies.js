function add_reply_button(time_line_item) {
  if ($(time_line_item).find(".custom-actions .reply-btn").length) {
    return;
  }
  const replyButton = $("<button>")
    .addClass("btn btn-xs btn-link reply-btn")
    .css({ "font-size": "12px" })
    .html('<i class="fa fa-reply"></i> Reply')
    .on("click", () => handle_reply(time_line_item));

  $(time_line_item).find(".custom-actions").append(replyButton);
}

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
                <div class="timeline-item frappe-card" data-doctype="Comment" id="comment-${reply.name}" data-name="${
      reply.name
    }" style="position: relative; background-color: #F7F7F7; max-width: 700px">
                    <div class="timeline-content">
                        <div class="timeline-message-box">
                            <div>
                              <div>
                                <span class="text-muted">
                                    ${frappe.avatar(reply.comment_email, "avatar-medium")}
                                    <span class="timeline-user">${
                                      reply.comment_by === frappe.session.user_fullname ? "You" : reply.comment_by
                                    } commented . </span>
                                    <span>&nbsp; ${frappe.datetime.comment_when(reply.creation)}</span>
                                </span>
                              </div>
                            </div>
                            <hr />
                            <div class="read-mode">
                                <p>${reply.content}</p>
                            </div>
                            <div class="edit-mode" style="display: none;">
                            <textarea class="form-control edit-textarea" rows="3">${reply.content}</textarea>
                            <div class="mt-2">
                              <button class="btn btn-sm btn-primary save-edit">Save</button>
                              <button class="btn btn-sm btn-default cancel-edit">Cancel</button>
                            </div>
                          </div>
                        </div>
                    </div>
                </div>
            </div>
        `);

    $replyContainer.append($replyContent);

    const actionButtons = $("<div>").addClass("comment-actions").css({
      float: "right",
      marginLeft: "auto",
    });

    const moreButton = $("<div>")
      .addClass("dropdown")
      .css({ display: "inline-block" })
      .append(
        $("<button>")
          .addClass("btn btn-xs btn-link dropdown-toggle")
          .attr({
            "data-toggle": "dropdown",
            "aria-haspopup": "true",
            "aria-expanded": "false",
          })
          .html('<svg class="icon icon-sm"><use href="#icon-dot-horizontal"></use></svg>')
      );

    const dropdownMenu = $("<div>")
      .addClass("dropdown-menu small dropdown-menu-right")
      .append(
        $("<a>")
          .addClass("dropdown-item")
          .html("Copy Link")
          .on("click", () => handle_reply_copy("#comment-" + reply.name))
      );

    // if owner or administrator, add the delete button
    if (
      frappe.model.can_delete("Comment") &&
      (frappe.session.user === "Administrator" || reply.comment_email === frappe.session.user)
    ) {
      dropdownMenu.append(
        $("<a>")
          .addClass("dropdown-item")
          .html("Delete")
          .on("click", () => handle_reply_delete("#comment-" + reply.name))
      );
    }

    const editButton = $("<button>")
      .addClass("btn btn-xs btn-link small")
      .html("Edit")
      .on("click", () => handle_reply_edit(commentSelector, "#comment-" + reply.name));

    moreButton.append(dropdownMenu);
    actionButtons.append(editButton, moreButton);
    $replyContent.find(".text-muted").append(actionButtons);
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

function handle_reply(time_line_item) {
  // if on Edit Mode, click on `Dismiss` button
  const dismissButton = $(time_line_item).find(".custom-actions.save-open > button:nth-child(2)");
  if (dismissButton.length) {
    dismissButton.click();
  }
  const $timeLineItem = $(time_line_item);
  const replyingToName = $timeLineItem.find(".avatar.avatar-medium").attr("title");
  if ($timeLineItem.find(".reply-container").length) {
    return;
  }

  const replyContainer = $(`
    <div class="reply-container" style="margin-top: 14px; maximum-width: fit-content; margin-left: 40px; margin-right: 20px;">
      <div class="small text-muted mb-2">Replying to ${replyingToName}</div>
    </div>
`).appendTo($timeLineItem.find(".timeline-content"));

  replyContainer.css("display", "block");

  const replyControl = frappe.ui.form.make_control({
    parent: replyContainer,
    df: {
      fieldtype: "Comment",
      fieldname: "comment",
      placeholder: __("Add a reply..."),
    },
    render_input: true,
    enable_mentions: true,
    only_input: true,
    no_wrapper: true,
  });

  replyControl.refresh();

  const visibilitySelect = $(`
    <div class="checkbox comment-visibility-input form-inline form-group mt-3 ml-1 mb-2" >
      <div class="comment-select-group">
        <span class="text-muted small">Comment Visibility:</span>
        <label for="status" class="visibility-label control-label text-muted small">
          ${get_comment_visibility_icons("Visible to everyone")}
        </label>
        <div class="select-input form-control">
          <select name="visibility" id="visibility" data-label="visibility" data-fieldtype="Select">
            <option value="Visible to everyone" selected="selected">Visible to everyone</option>
            <option value="Visible to mentioned">Visible to mentioned</option>
            <option value="Visible to only you">Visible to only you</option>
          </select>
          <div class="select-icon">
            <svg class="icon icon-sm" style="">
              <use class="" href="#icon-select"></use>
            </svg>
          </div>
        </div>
      </div>
    </div>
  `).appendTo(replyContainer);

  visibilitySelect.find("select").on("change", function () {
    const selectedValue = $(this).val();
    const newIcon = get_comment_visibility_icons(selectedValue);
    visibilitySelect.find(".visibility-label").html(newIcon);
  });

  const actionButtons = $(`
    <div class="reply-actions" style="margin-top: 3px; margin-bottom: 12px;">
      <button class="btn btn-sm btn-primary submit-reply">${__("Submit")}</button>
      <button class="btn btn-sm btn-default cancel-reply">${__("Cancel")}</button>
    </div>
  `).appendTo(replyContainer);

  actionButtons.find(".submit-reply").on("click", () => {
    const replyContent = replyControl.get_value();
    const visibility = visibilitySelect.find("select").val();
    if (strip_html(replyContent).trim() != "" || replyContent.includes("img")) {
      submit_reply($timeLineItem, replyContent, visibility);
    }
  });

  actionButtons.find(".cancel-reply").on("click", () => {
    replyContainer.remove();
  });

  // Scroll to the reply container
  $("html, body").animate(
    {
      scrollTop: replyContainer.offset().top - $(window).height() / 2,
    },
    1000
  );
}

function submit_reply(time_line_item, content, visibility) {
  frappe.call({
    method: "frappe.desk.form.utils.add_comment",
    args: {
      reference_doctype: this.cur_frm.doctype,
      reference_name: this.cur_frm.docname,
      custom_reply_to: $(time_line_item).data("name") || null,
      content: content,
      custom_visibility: visibility,
      comment_email: frappe.session.user,
      comment_by: frappe.session.user_fullname,
    },
    callback: (r) => {
      if (r.message) {
        $(time_line_item).find(".reply-container").remove();
        frappe.utils.play_sound("click");
        update_comments_timeline();
        addThreadedReply(time_line_item, this.cur_frm.doctype);
      }
    },
  });
}

function handle_reply_copy(commentSelector) {
  const $comment = $(commentSelector);
  const commentId = $comment.data("name");
  const currentUrl =
    frappe.urllib.get_base_url() + frappe.utils.get_form_link(this.cur_frm.doctype, this.cur_frm.docname);
  const commentUrl = `${currentUrl}#comment-${commentId}`;
  frappe.utils.copy_to_clipboard(commentUrl);
}

function handle_reply_delete(commentSelector) {
  const $comment = $(commentSelector);
  const commentId = $comment.data("name");

  frappe.confirm(__("Are you sure you want to delete this comment?"), () => {
    frappe.call({
      method: "frappe.client.delete",
      args: {
        doctype: "Comment",
        name: commentId,
      },
      callback: (r) => {
        if (r.exc) {
          frappe.msgprint(__("There was an error deleting the comment"));
        } else {
          $comment.closest(".timeline-item").remove();
          this.cur_frm?.footer.refresh();
          frappe.show_alert({
            message: __("Comment deleted"),
            indicator: "green",
          });
        }
      },
    });
  });
}

function handle_reply_edit(parentComment, commentSelector) {
  const $comment = $(commentSelector);
  const $readMode = $comment.find(".read-mode");
  const $editMode = $comment.find(".edit-mode");
  const commentId = $comment.data("name");
  const doctype = this.cur_frm.doctype;

  $readMode.hide();
  $editMode.show().empty();

  const editControl = frappe.ui.form.make_control({
    parent: $editMode,
    df: {
      fieldtype: "Comment",
      fieldname: "edit_comment",
      placeholder: __("Edit your reply..."),
    },
    render_input: true,
    enable_mentions: true,
    only_input: true,
    no_wrapper: true,
  });

  editControl.set_value($readMode.find(".ql-editor.read-mode").html());
  editControl.refresh();

  // FIXME: Duplicate code from `handle_reply`
  const visibilitySelect = $(`
    <div class="checkbox comment-visibility-input form-inline form-group mt-3 ml-1 mb-2">
      <div class="comment-select-group">
        <span class="text-muted small">Comment Visibility:</span>
        <label for="status" class="visibility-label control-label text-muted small">
          ${get_comment_visibility_icons($comment.data("visibility") || "Visible to everyone")}
        </label>
        <div class="select-input form-control">
          <select name="visibility" id="visibility" data-label="visibility" data-fieldtype="Select">
            <option value="Visible to everyone" ${
              $comment.data("visibility") === "Visible to everyone" ? "selected" : ""
            }>Visible to everyone</option>
            <option value="Visible to mentioned" ${
              $comment.data("visibility") === "Visible to mentioned" ? "selected" : ""
            }>Visible to mentioned</option>
            <option value="Visible to only you" ${
              $comment.data("visibility") === "Visible to only you" ? "selected" : ""
            }>Visible to only you</option>
          </select>
          <div class="select-icon">
            <svg class="icon icon-sm" style="">
              <use class="" href="#icon-select"></use>
            </svg>
          </div>
        </div>
      </div>
    </div>
  `).appendTo($editMode);

  visibilitySelect.find("select").on("change", function () {
    const selectedValue = $(this).val();
    const newIcon = get_comment_visibility_icons(selectedValue);
    visibilitySelect.find(".visibility-label").html(newIcon);
  });

  const actionButtons = $(`
    <div class="reply-actions mt-2">
      <button class="btn btn-sm btn-primary save-edit">${__("Save")}</button>
      <button class="btn btn-sm btn-default cancel-edit">${__("Cancel")}</button>
    </div>
  `).appendTo($editMode);

  actionButtons.find(".save-edit").on("click", function () {
    const newContent = editControl.get_value();
    frappe.call({
      method: "frappe.desk.form.utils.update_comment",
      args: {
        name: commentId,
        content: newContent,
        custom_visibility: visibilitySelect.find("select").val(),
      },
      callback: function (r) {
        if (!r.exc) {
          $comment.find(".comment-content").html(newContent);
          $editMode.hide();
          $readMode.show();

          addThreadedReply(parentComment, doctype);
          frappe.show_alert({
            message: __("Comment updated"),
            indicator: "green",
          });
        } else {
          frappe.msgprint(__("There was an error updating the comment"));
        }
      },
    });
  });

  actionButtons.find(".cancel-edit").on("click", function () {
    $editMode.hide();
    $readMode.show();
  });
}
