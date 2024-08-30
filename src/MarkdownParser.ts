const blogpostMarkdown = `# control

*humans should focus on bigger problems*

## Setup

\`\`\`bash
git clone git@github.com:anysphere/control
\`\`\`

\`\`\`bash
./init.sh
\`\`\`

## Folder structure

**The most important folders are:**

1. \`vscode\`: this is our fork of vscode, as a submodule.
2. \`milvus\`: this is where our Rust server code lives.
3. \`schema\`: this is our Protobuf definitions for communication between the client and the server.

Each of the above folders should contain fairly comprehensive README files; please read them. If something is missing, or not working, please add it to the README!

Some less important folders:

1. \`release\`: this is a collection of scripts and guides for releasing various things.
2. \`infra\`: infrastructure definitions for the on-prem deployment.
3. \`third_party\`: where we keep our vendored third party dependencies.

## Miscellaneous things that may or may not be useful

##### Where to find rust-proto definitions

They are in a file called \`aiserver.v1.rs\`. It might not be clear where that file is. Run \`rg --files --no-ignore bazel-out | rg aiserver.v1.rs\` to find the file.

## Releasing

Within \`vscode/\`:

- Bump the version
- Then:

\`\`\`
git checkout build-todesktop
git merge main
git push origin build-todesktop
\`\`\`

- Wait for 14 minutes for gulp and ~30 minutes for todesktop
- Go to todesktop.com, test the build locally and hit release
`;

let currentContainer: HTMLElement | null = null; 
let isInCodeBlock = false; // We added this to keep track of whether we're in a code block

// Do not edit this method
function runStream() {
    currentContainer = document.getElementById('markdownContainer')!;

    // this randomly split the markdown into tokens between 2 and 20 characters long
    // simulates the behavior of an ml model thats giving you weirdly chunked tokens
    const tokens: string[] = [];
    let remainingMarkdown = blogpostMarkdown;
    while (remainingMarkdown.length > 0) {
        const tokenLength = Math.floor(Math.random() * 18) + 2;
        const token = remainingMarkdown.slice(0, tokenLength);
        tokens.push(token);
        remainingMarkdown = remainingMarkdown.slice(tokenLength);
    }

    const toCancel = setInterval(() => {
        const token = tokens.shift();
        if (token) {
            addToken(token);
        } else {
            clearInterval(toCancel);
        }
    }, 20);
}

// dont be afraid of using globals for state

/*YOUR CODE HERE
this does token streaming with no styling right now
your job is to write the parsing logic to make the styling work
 */
let currentState = {
    inCodeBlock: false,
    inInlineCode: false,
    codeBlockBackticks: 0,
    buffer: '',
    codeLanguage: ''
};

function addToken(token: string) {
    if (!currentContainer) return;

    for (let i = 0; i < token.length; i++) {
        const char = token[i];
        
        if (char === '`') {
            handleBacktick();
        } else if (char === '\n') {
            handleNewline();
        } else {
            currentState.buffer += char;
            outputCurrentChar();
        }
    }
}

function handleBacktick() {
    if (currentState.inCodeBlock) {
        currentState.codeBlockBackticks++;
        if (currentState.codeBlockBackticks === 3) {
            endCodeBlock();
        } else {
            outputCurrentChar('`');
        }
    } else if (currentState.buffer.endsWith('``')) {
        startCodeBlock();
    } else {
        toggleInlineCode();
    }
}

function handleNewline() {
    if (currentState.inCodeBlock) {
        if (currentState.codeLanguage === '') {
            currentState.codeLanguage = currentState.buffer.trim();
            const codeElement = currentContainer!.lastElementChild!.lastElementChild as HTMLElement;
            codeElement.className = `language-${currentState.codeLanguage}`;
            currentState.buffer = '';
        } else {
            outputCurrentChar('\n');
        }
    } else {
        outputCurrentChar('\n');
        const br = document.createElement('br');
        currentContainer!.appendChild(br);
    }
    currentState.buffer = '';
}

function startCodeBlock() {
    currentState.inCodeBlock = true;
    currentState.codeBlockBackticks = 3;
    currentState.codeLanguage = '';
    const preElement = document.createElement('pre');
    const codeElement = document.createElement('code');
    preElement.appendChild(codeElement);
    currentContainer!.appendChild(preElement);
    currentState.buffer = '';
}

function endCodeBlock() {
    currentState.inCodeBlock = false;
    currentState.codeBlockBackticks = 0;
    currentState.codeLanguage = '';
}

function toggleInlineCode() {
    currentState.inInlineCode = !currentState.inInlineCode;
    if (currentState.inInlineCode) {
        const codeElement = document.createElement('code');
        currentContainer!.appendChild(codeElement);
    } else {
        const spanElement = document.createElement('span');
        currentContainer!.appendChild(spanElement);
    }
}

function outputCurrentChar(char = currentState.buffer) {
    if (!char) return;

    let element: HTMLElement;

    if (currentState.inCodeBlock) {
        element = currentContainer!.lastElementChild!.lastElementChild as HTMLElement;
    } else if (currentState.inInlineCode) {
        element = currentContainer!.lastElementChild as HTMLElement;
    } else {
        element = currentContainer!.lastElementChild as HTMLElement;
        if (!(element instanceof HTMLSpanElement)) {
            element = document.createElement('span');
            currentContainer!.appendChild(element);
        }
    }

    element.textContent += char;
    currentState.buffer = '';
}

// Add this at the beginning of the file
function addStyles() {
    const style = document.createElement('style');
    style.textContent = `
        pre {
            background-color: #f4f4f4;
            padding: 10px;
            border-radius: 5px;
        }
        code {
            background-color: #e0e0e0;
            padding: 2px 4px;
            border-radius: 3px;
        }
    `;
    document.head.appendChild(style);
}

// Call this function at the start of your script
addStyles();