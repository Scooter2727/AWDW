"use strict";

const searchForm = document.querySelector("#site-search");
const searchInput = document.querySelector("#search-query");
const searchStatus = document.querySelector("#search-status");
let announcementTimer;

// Search only the text already present on the original page. Keep its DOM order.
const searchableElements = [...document.querySelectorAll(".original-copy h2, .original-copy p, .right-bar h2, .news a, .news time")];

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

// This form is a demonstration. It never submits a request or writes storage.
const mockForm = document.querySelector("#mock-form");
const mockName = document.querySelector("#mock-name");
const mockEmail = document.querySelector("#mock-email");
const mockAcknowledgement = document.querySelector("#mock-acknowledgement");
const mockErrors = document.querySelector("#mock-errors");
const mockErrorList = mockErrors.querySelector("ul");
const mockStatus = document.querySelector("#mock-status");
const mockSuccess = document.querySelector("#mock-success");
let mockValidationStarted = false;
let mockStatusTimer;
const mockFields = [
    { input: mockName, error: document.querySelector("#mock-name-error"), message: () => mockName.value.trim() ? "" : "Enter a full name for the demo." },
    { input: mockEmail, error: document.querySelector("#mock-email-error"), message: () => !mockEmail.value.trim() ? "Enter an email address for the demo." : mockEmail.validity.typeMismatch ? "Enter an email address like alex@example.com." : "" },
    { input: mockAcknowledgement, error: document.querySelector("#mock-acknowledgement-error"), message: () => mockAcknowledgement.checked ? "" : "Confirm that you understand this is a demonstration." }
];

function announceMockStatus(message) {
    clearTimeout(mockStatusTimer);
    mockStatus.textContent = "";
    if (message) mockStatusTimer = setTimeout(() => { mockStatus.textContent = message; }, 100);
}

function clearMockSuccess() {
    mockSuccess.hidden = true;
    for (const value of mockSuccess.querySelectorAll("dd")) value.textContent = "";
    announceMockStatus("");
}

function validateMockForm() {
    mockErrorList.replaceChildren();
    for (const field of mockFields) {
        const message = field.message();
        field.error.textContent = message;
        field.error.hidden = !message;
        if (message) {
            field.input.setAttribute("aria-invalid", "true");
            const item = document.createElement("li");
            const link = document.createElement("a");
            link.href = `#${field.input.id}`;
            link.textContent = message;
            link.addEventListener("click", event => {
                event.preventDefault();
                field.input.focus();
            });
            item.append(link);
            mockErrorList.append(item);
        } else field.input.removeAttribute("aria-invalid");
    }
    mockErrors.hidden = !mockErrorList.children.length;
    return mockErrors.hidden;
}

mockForm.reset();
mockForm.addEventListener("input", () => {
    clearMockSuccess();
    if (mockValidationStarted) validateMockForm();
});
mockForm.addEventListener("submit", event => {
    event.preventDefault();
    mockValidationStarted = true;
    clearMockSuccess();
    if (!validateMockForm()) {
        mockErrors.focus();
        return;
    }
    document.querySelector("#mock-review-name").textContent = mockName.value.trim();
    document.querySelector("#mock-review-email").textContent = mockEmail.value.trim();
    document.querySelector("#mock-review-participation").textContent = new FormData(mockForm).get("participation") || "Not selected";
    mockSuccess.hidden = false;
    announceMockStatus("Mock submission complete. No information was sent or saved. Your demo details are shown below.");
});
mockForm.addEventListener("reset", () => {
    mockValidationStarted = false;
    clearMockSuccess();
    mockErrors.hidden = true;
    mockErrorList.replaceChildren();
    for (const field of mockFields) {
        field.input.removeAttribute("aria-invalid");
        field.error.hidden = true;
        field.error.textContent = "";
    }
    mockName.focus();
    announceMockStatus("Mock form cleared.");
});
mockForm.noValidate = true;
mockForm.hidden = false;
document.querySelector("#mock-form-fallback").hidden = true;
