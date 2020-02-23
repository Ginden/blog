[...document.querySelectorAll('.referencing')]
    .forEach(element => {
        const target = document.getElementById(element.dataset.target);
        if (target) {
            const parent = target.parentElement;
            let text = parent.textContent || '';
            if (parent.nextElementSibling && parent.nextElementSibling.tagName === "UL") {
                text = [...parent.nextElementSibling.querySelectorAll('li')]
                    .map(e => e.textContent.trim())
                    .join('\n');
            }
            element.setAttribute('title', text.trim());


            element.addEventListener('click', (e) => {
                window.history.pushState(null, '', `#${element.id}`);
            })
        }
    });
