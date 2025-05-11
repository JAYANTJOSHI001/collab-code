---
title: Creating and Managing Pull Requests
description: Learn how to create, review, and manage pull requests effectively in Collab.
---
# Creating and Viewing Pull Requests

Pull Requests (PRs) are an essential part of modern collaborative development. They let you propose changes, review code, and safely merge updates into the main codebase. **Collab** provides built-in support to easily **create** and **view** PRs directly from your coding environment.

---

### 👀 Viewing Existing Pull Requests

To check open pull requests in your repository:

- 🔹Click the **"Git Operations"** button in the top toolbar.
- 🔹A panel will open on the **right-hand side** of the screen.
- 🔹Under the **Pull Requests** section, you'll see a list of existing PRs (if any), showing:
    - - 🔹 PR title
    - - 🔹Source and target branches
    - - 🔹Status (open/merged)

This provides a quick overview of ongoing collaboration in your repository.

---

### ✍️ Creating a New Pull Request

To submit your changes via a new PR:

- 🔹Open the **Git Operations** panel.
- 🔹Scroll down to the **"Create Pull Request"** section.
- 🔹Enter a meaningful **title** that summarizes your changes (e.g., `"Fix UI responsiveness on mobile"`).
- 🔹Click the **"Create Pull Request"** button.
- 🔹Your changes from the current branch will be proposed to merge into the `main` (or selected base) branch.

> ⚠️ Note: To avoid unintended changes to production code, you cannot create a PR from the main branch. Switch to a feature or development branch first.
> 

---

### ✅ Best Practices for PRs

- 🔹Always commit your changes before creating a PR.
- 🔹Use clear, descriptive titles and messages to help collaborators review your work.
- 🔹Avoid working directly on `main`; create feature-specific branches for safer version control.