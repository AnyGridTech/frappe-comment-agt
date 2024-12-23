function addThreadedReply(commentSelector) {
  const $comment = $(commentSelector);
  const commentId = $comment.data("name");

  frappe.call({
    method: "frappe_private_comment.overrides.whitelist.comment.get_comment_replies",
    args: {
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

      const $prevContainer = $comment.next(".threaded-reply-container");
      $prevContainer && $prevContainer.remove();

      const $replyContainer = $(
        '<div class="threaded-reply-container " style="margin-left: 90px; position: relative;"></div>'
      );

      // Add vertical line
      $replyContainer.append(
        '<div class="vertical-line" style="position: absolute; left: -30px; top: 0; bottom: 0; width: 1px; background-color: #d1d8dd;"></div>'
      );

      res.message.forEach((reply) => {
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
    },
  });
}

/**Enable the HTML Editor field preview mode by default using the provided function */
const time_line_interval_loop = setInterval(() => {
  let html_time_line_item = document.querySelectorAll(".new-timeline > .timeline-items .timeline-item");

  if (html_time_line_item.length != 0) {
    update_comments_timeline();
  }
}, 500);

function get_comment_visibility_icons(visibility) {
  if (visibility == "Visible to everyone") {
    return `<i class="fa fa-globe visible-to-all"></i>
    `;
  }

  if (visibility == "Visible to mentioned") {
    return `<svg class="icon icon-md visible-to-mentioned">
        <use href="#icon-share"></use>
    </svg>`;
  }

  return `<svg class="icon icon-md visible-to-you">
        <use href="#icon-hide"></use>
    </svg>`;
}

function update_the_comment_visibility(visibility) {
  if (visibility) {
    return `
            <span class="visibility-container" title="${visibility}">
                <span class="visibility-info" data-visibility="${visibility}">
                    ${get_comment_visibility_icons(visibility)}
                </span>
            </span>`;
  }

  return `<span class="visibility-container">
                <span class="visibility-info"></span>
            </span>`;
}

function add_visibility_icons(time_line_item, visibility) {
  if (time_line_item.querySelector(".visibility-container")) {
    time_line_item.querySelector(".visibility-container").remove();
  }

  time_line_item.querySelector(".timeline-message-box > span > span > span").innerHTML +=
    update_the_comment_visibility(visibility);

  addThreadedReply(time_line_item);
}

function update_comments_timeline() {
  let html_time_line_items = document.querySelectorAll(".new-timeline > .timeline-items .timeline-item");

  for (let index = 0; index < html_time_line_items.length; index++) {
    if (html_time_line_items[index].querySelector(".visibility-info")) {
      return;
    }
    update_time_line(html_time_line_items[index]);
  }
}

function button_handle(event) {
  let html_time_line_items = document.querySelectorAll(".new-timeline > .timeline-items .timeline-item");

  for (let index = 0; index < html_time_line_items.length; index++) {
    if (html_time_line_items[index].dataset.name == event.target.dataset.name) {
      return button_override(html_time_line_items[index], event.target);
    }
  }
}

function update_time_line(time_line_item) {
  if (!("doctype" in time_line_item.dataset)) {
    return;
  }

  if (time_line_item.dataset.doctype != "Comment") {
    return;
  }

  frappe.call({
    method: "frappe_private_comment.overrides.whitelist.comment.get_comment_visibility",
    args: {
      name: time_line_item.dataset.name,
    },
    callback: (res) => {
      add_visibility_icons(time_line_item, res?.message?.custom_visibility);
    },
  });

  let button = time_line_item.querySelector(".custom-actions button");

  button.dataset.name = time_line_item.dataset.name;

  // Remove the event listener
  button.removeEventListener("click", button_handle, true);

  // Add the event listener
  button.addEventListener("click", button_handle, true);

  time_line_item.querySelector(".custom-actions").lastChild.addEventListener("click", () => {
    time_line_item.querySelector(".timeline-comment").remove();
    time_line_item.querySelector(".custom-actions").classList.remove("save-open");
  });

  // Add reply button
  add_reply_button(time_line_item);
}

function button_override(time_line_item, button) {
  if (time_line_item.querySelector(".custom-actions").classList.contains("save-open")) {
    handle_save(time_line_item, button);
  } else {
    handle_edit(time_line_item, button);
  }
}

function handle_save(time_line_item, button) {
  this.frm.comment_box.disable();
  frappe
    .xcall("frappe.desk.form.utils.add_comment", {
      reference_doctype: this.frm.doctype,
      reference_name: this.frm.docname,
      content: comment,
      comment_email: frappe.session.user,
      comment_by: frappe.session.user_fullname,
      custom_visibility: custom_visibility,
    })
    .then((comment) => {
      let comment_item = this.frm.timeline.get_comment_timeline_item(comment);
      this.frm.comment_box.set_value("");
      frappe.utils.play_sound("click");
      this.frm.timeline.add_timeline_item(comment_item);
      this.frm.sidebar.refresh_comments_count && this.frm.sidebar.refresh_comments_count();
    })
    .finally(() => {
      this.frm.comment_box.enable();
      update_comments_timeline();
    });
  this.refresh();
}

function handle_edit(time_line_item, button) {
  time_line_item.querySelector(".timeline-message-box").append(get_input_html(time_line_item));
  time_line_item.querySelector("#visibility").value =
    time_line_item.querySelector(".visibility-info").dataset.visibility;
  time_line_item.querySelector(".custom-actions").classList.add("save-open");
}

function get_input_html(time_line_item) {
  const div = document.createElement("div");
  div.className = "checkbox timeline-comment form-inline form-group";
  div.innerHTML = `
        <div class="comment-select-group">
            <label for="status" class="control-label text-muted small">Comment visibility:</label>
            <div class="select-input form-control">
                <select name="visibility" id="visibility" data-label="visibility" data-fieldtype="Select">
                    <option value="Visible to everyone" selected="selected">
                        Visible to everyone</option>
                    <option value="Visible to mentioned">
                        Visible to mentioned</option>
                    <option value="Visible to only you">
                        Visible to only you</option>
                </select>
                <div class="select-icon ">
                    <svg class="icon  icon-sm" style="">
                        <use class="" href="#icon-select"></use>
                    </svg>
                </div>
            </div>
        </div>
    `;

  div.querySelector("#visibility").addEventListener("change", (event) => {
    add_visibility_icons(time_line_item, event.target.value);
  });

  return div;
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
      reference_doctype: $(time_line_item).data("doctype"),
      reference_name: $(time_line_item).data("name"),
      content: content,
      comment_email: frappe.session.user,
      comment_by: frappe.session.user_fullname,
    },
    callback: (r) => {
      if (r.message) {
        $(time_line_item).find(".comment-edit-box").empty().css("display", "none");
        frappe.utils.play_sound("click");
        update_comments_timeline();
        addThreadedReply(time_line_item);
      }
    },
  });
}
