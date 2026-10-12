/**
 * Adds a copy button to all <code><pre></code> blocks on the page.
 */
export function addCopyButtonsForCodeBlocks() {
  const codeBlocks = document.querySelectorAll('pre');

  codeBlocks.forEach((codeBlock) => {
    // Avoid duplicates
    if (codeBlock.querySelector('.copy-button')) return;

    const button = document.createElement('button');
    button.className = 'copy-button';
    button.type = 'button';
    button.ariaLabel = 'Copy code to clipboard';
    button.title = 'Copy code';
    button.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;

    codeBlock.appendChild(button);

    button.addEventListener('click', async () => {
      const code = codeBlock.querySelector('code');
      const text = code ? code.innerText : codeBlock.innerText;

      try {
        await navigator.clipboard.writeText(text);

        // Success state
        button.classList.add('copied');
        button.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;

        setTimeout(() => {
          button.classList.remove('copied');
          button.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
        }, 2000);
      } catch (err) {
        console.error('Failed to copy text: ', err);
      }
    });
  });
}
