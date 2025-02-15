class TNode {
    constructor() {
        this.isEOW = false;
        this.children = new Array(26).fill(null);
        this.character = ''; // Store the character at this node
    }
}

class Trie {
    constructor() {
        this.root = new TNode();
    }

    insertWord(word) {
        if (this.hasWord(word)) {
            return; // Word already exists, do nothing
        }
    
        let temp = this.root;
        for (let ch of word) {
            let ind = ch.charCodeAt(0) - 'a'.charCodeAt(0);
            if (temp.children[ind] === null) {
                let nn = new TNode();
                temp.children[ind] = nn;
            }
            temp = temp.children[ind];
            temp.character = ch;
        }
        temp.isEOW = true;
    }
    

    hasWord(word) {
        let temp = this.root;
        for (let ch of word) {
            let ind = ch.charCodeAt(0) - 'a'.charCodeAt(0);
            if (temp.children[ind] === null) {
                return false;
            }
            temp = temp.children[ind];
        }
        return temp.isEOW;
    }

    getWords() {
        let ans = [];
        this.getAllWords(this.root, "", ans);
        return ans;
    }

    getAllWords(root, path, word) {
        if (root.isEOW) {
            word.push(path);
        }
        for (let i = 0; i < 26; i++) {
            if (root.children[i] !== null) {
                this.getAllWords(root.children[i], path + root.children[i].character, word);
            }
        }
    }

    autoSuggest(prefix) {
        let temp = this.root;
        let ans = [];
        for (let ch of prefix) {
            let ind = ch.charCodeAt(0) - 'a'.charCodeAt(0);
            if (temp.children[ind] === null) {
                return ans;
            }
            temp = temp.children[ind];
        }
        this.getAllWords(temp, prefix, ans);
        return ans;
    }

    assignCoordinates(node, x, y, dx, level) {
        if (!node) return;
        node.x = x;
        node.y = y;
        node.level = level;

        const verticalGap = 100; // Increased vertical spacing
        const nextY = y + verticalGap;
        const nextDX = dx / 2.2; // Adjusted horizontal spacing

        for (let i = 0; i < 26; i++) {
            if (node.children[i]) {
                this.assignCoordinates(node.children[i], x + dx * (i - 12), nextY, nextDX, level + 1);
            }
        }
    }

    collectNodesAndEdges(node, nodes, edges) {
        if (!node) return;
        nodes.push(node);

        for (let i = 0; i < 26; i++) {
            if (node.children[i]) {
                edges.push({ x1: node.x, y1: node.y, x2: node.children[i].x, y2: node.children[i].y });
                this.collectNodesAndEdges(node.children[i], nodes, edges);
            }
        }
    }

    draw() {
        const container = document.getElementById("treeContainer");
        container.innerHTML = "";

        if (!this.root) return;

        this.assignCoordinates(this.root, 700, 50, 50, 0); // Adjusted root position for more space

        const nodes = [];
        const edges = [];
        this.collectNodesAndEdges(this.root, nodes, edges);

        const width = 1500;  // Increased width for better visualization
        const height = 1000; // Increased height for better visualization

        const svgNS = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(svgNS, "svg");
        svg.setAttribute("width", width);
        svg.setAttribute("height", height);

        edges.forEach((edge) => {
            const line = document.createElementNS(svgNS, "line");
            line.setAttribute("x1", edge.x1);
            line.setAttribute("y1", edge.y1);
            line.setAttribute("x2", edge.x2);
            line.setAttribute("y2", edge.y2);
            line.setAttribute("stroke", "#888");
            line.setAttribute("stroke-width", "2");
            svg.appendChild(line);
        });

        nodes.forEach((node) => {
            const circle = document.createElementNS(svgNS, "circle");
            circle.setAttribute("cx", node.x);
            circle.setAttribute("cy", node.y);
            circle.setAttribute("r", 20);
            circle.setAttribute("fill", "#8e44ad");
            circle.setAttribute("stroke", "#333");
            circle.setAttribute("stroke-width", "1");
            svg.appendChild(circle);

            const text = document.createElementNS(svgNS, "text");
            text.setAttribute("x", node.x);
            text.setAttribute("y", node.y + 5);
            text.setAttribute("fill", "#fff");
            text.setAttribute("font-size", "14");
            text.setAttribute("font-weight", "bold");
            text.setAttribute("text-anchor", "middle");
            text.textContent = node.character;
            svg.appendChild(text);
        });

        container.appendChild(svg);
    }
}

const trie = new Trie();

document.getElementById("insertBtn").addEventListener("click", () => {
    const word = document.getElementById("wordInput").value;
    trie.insertWord(word);
    document.getElementById("wordInput").value = "";
    trie.draw();
});

document.getElementById("checkBtn").addEventListener("click", () => {
    const word = document.getElementById("wordInput").value;
    const result = trie.hasWord(word);
    document.getElementById("wordResult").innerText = result ? `Word "${word}" exists in the Trie.` : `Word "${word}" does not exist in the Trie.`;
});

document.getElementById("suggestBtn").addEventListener("click", () => {
    const prefix = document.getElementById("wordInput").value;
    const result = trie.autoSuggest(prefix);
    document.getElementById("autoSuggestResult").innerText = result.length > 0 ? `Suggestions: ${result.join(', ')}` : "No suggestions found.";
});
