

<div align="center">
<h2>Frappe Comment AGT</h2>
</div>

Frappe app that allows controlling comment visibility for tagged user and support multiple level replies. Helpful to add private comments in a discussion on any doc’s single view.
<div align="center">
<img src="https://github.com/user-attachments/assets/2dcd1421-aec5-4d2a-bd23-ecdad3ba3e49" alt="Multiple threaded replies" />
</div>
<br />

Select visibility for comments from:
1. Public - Visible to everyone.
2. Mentioned - Visible to mentioned users and user-groups.
3. Private - Visible to only the comment owner.

## Installation

1. Get the app

```bash
bench get-app https://github.com/AnyGridTech/frappe-comment-agt.git
```

2. Install the app on your site

```bash
bench --site [site-name] install-app frappe_comment_agt
```
## Planned Features

- Emoji reactions to comments
- Maximum time for edit and delete
- Role based comment view permission (eg. Everyone that is marked as 'Employee' can see the comment)

## Contribution Guide

Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

## License

This project is licensed under the [AGPLv3 License](./LICENSE).
