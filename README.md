# Bachelor Thesis Topics Platform

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![Language: React](https://img.shields.io/badge/Language-React-61dafb.svg)
![Deployment: GitHub Pages](https://img.shields.io/badge/Deployment-GitHub%20Pages-blue.svg)

A React SPA for browsing, filtering, and comparing available Bachelor Thesis topics. Built to help students at the German University in Cairo efficiently explore supervisor offerings and shortlist topics for informed decision-making.

---

## Table of Contents

1. [Overview](#overview)
2. [Key Features](#key-features)
3. [Repository Structure](#repository-structure)
4. [Getting Started](#getting-started)
5. [Authors](#authors)
6. [Acknowledgments](#acknowledgments)
7. [License](#license)

---

## Overview

| Property | Value |
|----------|-------|
| Framework | React 18 |
| Styling | Tailwind CSS 3 |
| Search | Fuse.js (fuzzy search) |
| Animations | Framer Motion |
| Deployment | GitHub Pages |
| Live URL | [andrew-abdelmalak.github.io/Bachelor-Thesis-Topics-Platform](https://andrew-abdelmalak.github.io/Bachelor-Thesis-Topics-Platform/) |

---

## Key Features

| Feature | Details |
|---------|---------|
| **Fuzzy search** | Find topics by keyword, supervisor, or category using Fuse.js |
| **Filtering** | Filter by department, supervisor, or availability status |
| **Compare view** | Select and compare multiple thesis topics side-by-side |
| **Priority list** | Drag-and-drop shortlist with export to Excel |
| **Responsive UI** | Masonry card layout with animated transitions |
| **Tooltips & modals** | Inline details popup and confirmation modals |

---

## Repository Structure

```
.
├── public/
│   ├── index.html
│   ├── favicon.ico
│   ├── manifest.json
│   └── robots.txt
├── src/
│   ├── components/
│   │   ├── Card.js                 # Thesis topic card component
│   │   ├── ConfirmationModal.js    # Confirmation dialog
│   │   ├── FilterDropdown.js       # Multi-select filter dropdown
│   │   ├── HighlightedText.js      # Fuzzy match highlight renderer
│   │   ├── PriorityListModal.js    # Drag-and-drop shortlist modal
│   │   ├── ProjectDetailsPopup.js  # Full-detail topic popup
│   │   ├── SortableHeader.js       # Sortable table column header
│   │   ├── Toast.js                # Notification toast
│   │   ├── Tooltip.js              # Hover tooltip
│   │   └── useModalClose.js        # Hook: close modal on outside click
│   ├── App.js                      # Root component and routing logic
│   ├── Data.js                     # Static thesis topics data store
│   ├── ThesisComparison.js         # Side-by-side comparison view
│   ├── App.css
│   └── index.js
├── tailwind.config.js
├── package.json
├── .gitignore
├── LICENSE
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install & Run

```bash
git clone https://github.com/andrew-abdelmalak/bachelor-thesis-topics-platform.git
cd bachelor-thesis-topics-platform
npm install
npm start
```

The app will be available at `http://localhost:3000`.

### Build

```bash
npm run build
```

### Deploy to GitHub Pages

```bash
npm run deploy
```

---

## Authors

| Name | Affiliation |
|------|-------------|
| Andrew Abdelmalak | Mechatronics Engineering, German University in Cairo |

---

## Acknowledgments

Developed to support students at the **German University in Cairo** in navigating and shortlisting Bachelor Thesis topics offered by the Faculty of Engineering and Material Science.

---

## License

Distributed under the MIT License. See [LICENSE](LICENSE) for details.
