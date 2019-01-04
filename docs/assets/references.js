[...document.querySelectorAll('.referencing')].forEach(element => {
    const target = document.getElementById(element.dataset.target);
    if (target) {
        const parent = target.parentElement;
        let text = parent.textContent;
        if (parent.nextElementSibling && parent.nextElementSibling.tagName === "UL") {
            text = [...parent.nextElementSibling.querySelectorAll('li')]
                .map(e => e.textContent)
                .join('\n\n');
        }
        element.setAttribute('title', text);
    }
});