"use strict";

const searchForm = document.querySelector("#site-search");
const searchInput = document.querySelector("#search-query");
const searchStatus = document.querySelector("#search-status");
let announcementTimer;

// Search only the text already present on the original page. Keep its DOM order.
const searchableElements = [...document.querySelectorAll(".content h2, .content p, .right-bar h2, .news a, .news time")];

function announce(message) {
    clearTimeout(announcementTimer);
    searchStatus.textContent = "";
    announcementTimer = setTimeout(() => { searchStatus.textContent = message; }, 100);
}

function clearHighlights() {
    for (const element of searchableElements) {
        for (const mark of element.querySelectorAll("mark")) mark.replaceWith(document.createTextNode(mark.textContent));
        element.normalize();
    }
}

searchForm.noValidate = true;
searchForm.addEventListener("submit", event => {
    event.preventDefault();
    clearHighlights();
    const query = searchInput.value.trim();
    if (!query) {
        searchInput.setAttribute("aria-invalid", "true");
        announce("Enter a search term.");
        searchInput.focus();
        return;
    }
    searchInput.removeAttribute("aria-invalid");
    let matches = 0;
    for (const element of searchableElements) {
        const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
        const nodes = [];
        while (walker.nextNode()) nodes.push(walker.currentNode);
        for (const node of nodes) {
            // Escape regex characters so user input is always a literal search.
            const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/gu, "\\s+");
            const pattern = new RegExp(escaped, "giu");
            const fragment = document.createDocumentFragment();
            let position = 0;
            let match;
            while ((match = pattern.exec(node.textContent)) !== null) {
                fragment.append(document.createTextNode(node.textContent.slice(position, match.index)));
                const mark = document.createElement("mark");
                mark.textContent = match[0];
                fragment.append(mark);
                position = match.index + match[0].length;
                matches += 1;
            }
            if (position) {
                fragment.append(document.createTextNode(node.textContent.slice(position)));
                node.replaceWith(fragment);
            }
        }
    }
    announce(matches ? `${matches} ${matches === 1 ? "match" : "matches"} found. Matching text is highlighted on this page.` : "No matches found.");
});
searchInput.addEventListener("input", () => {
    searchInput.removeAttribute("aria-invalid");
    clearHighlights();
    clearTimeout(announcementTimer);
    searchStatus.textContent = "";
});
