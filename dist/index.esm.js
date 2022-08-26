const options = {
    container: "article",
    fnAnchor: ">>",
    refAnchor: "<<",
    background: "#fff",
    text: "#000",
};

const styles = (text, background, width, left, right) => {
    const styles = `
    body {
    }
	.footnote {
		font-size: 12px;
		text-decoration: none;
        border-radius: 50%;
        padding: 0 4px;
        font-variant-numeric: tabular-nums;
        left: -4px;
        font-weight: 700;
        vertical-align: text-top;
        color: inherit;
        scroll-padding: 30px;
	}

    :target {
        margin-top: 1em;
    }

    

    .footnote:hover {
        background: rgba(0 0 0 / .15)
    }

	.reference-preview {
		position: absolute;
		opacity: 0;
		transform: translateY(-1rem);
		left: 0;
        font-weight: 400;
		
		pointer-events: none;
		padding: 3rem .5rem;
		width: ${width}px;
		transition: .4s;
		background: linear-gradient(to top, transparent, ${background},  ${background}, transparent);
		

	}

	.reference-content {
		font-size: 15px;
		background-color: ${background};
		color: ${text};
		border-radius: 9px;
		padding: 1em;
		box-shadow: 0 19px 38px rgba(0,0,0,0.30), 0 15px 12px rgba(0,0,0,0.22);


	}
	
	.footnote:hover .reference-preview {
		opacity: 1;
	}

  .reference-back {
    text-decoration: none;
  }
 
   `;
    const style = document.createElement("style");
    style.textContent = styles;
    document.head.append(style);
};

function createFn(fnRe, str, parentEl) {
    //   let count = [];
    if (fnRe.test(str)) {
        const matches = str.match(fnRe);
        const values = matches === null || matches === void 0 ? void 0 : matches.map((v) => v.replace(">>", ""));
        // count = [...count, ...values];
        // console.log(matches);
        const transformedText = parentEl === null || parentEl === void 0 ? void 0 : parentEl.innerText.replace(fnRe, `<a class='footnote' id='$1' href='#ref-$1'>$1</a>`);
        parentEl.innerHTML = transformedText;
        parentEl.setAttribute("style", "position:relative;");
        if (!values)
            return [];
        return values;
    }
    return [];
}

function createRefPreview(refRe, str, parentEl) {
    const matches = str.match(refRe);
    if (!matches || !matches.length)
        throw Error("Couldn't find matches");
    matches.forEach((match) => {
        var _a;
        const number = /\d+/.exec(match);
        if (!number)
            throw Error("Couldn`t extract number");
        const [num] = number;
        const outer = document.createElement("div");
        outer.setAttribute("class", "reference-preview");
        const inner = document.createElement("div");
        inner.setAttribute("class", "reference-content");
        inner.innerHTML = parentEl.innerHTML.replace(/&lt;&lt;(\d+)/g, "$1 | ");
        outer.append(inner);
        (_a = document.getElementById(num)) === null || _a === void 0 ? void 0 : _a.append(outer);
    });
}

function createRef(refRe, str, parentEl) {
    if (refRe.test(str)) {
        // Need to encode/decode html entities in config
        createRefPreview(refRe, str, parentEl);
        const transformedText = parentEl.innerHTML.replaceAll(/&lt;&lt;(\d+)/g, "$1. ");
        const number = /\d+/.exec(str);
        if (!number)
            throw Error("Couldn`t extract number for reference");
        const [num] = number;
        parentEl.id = `ref-${num}`;
        parentEl.innerHTML = `${transformedText} <a class="reference-back" href="#${num}" aria-label="Back to footnote ${num}">⮌</a>`;
        return [num.toString()];
    }
    return [];
}

function init(userOptions) {
    var _a;
    try {
        const config = Object.assign(Object.assign({}, options), userOptions);
        console.log(config);
        const { container, fnAnchor, refAnchor, text, background } = config;
        const fnRe = new RegExp(`${fnAnchor}(\\d+)`, "g");
        const refRe = new RegExp(`${refAnchor}(\\d+)`, "g");
        const combinedRe = new RegExp(`(${fnAnchor}|${refAnchor})\\d+`);
        console.log(combinedRe);
        const article = document.querySelector(container);
        if (!article)
            throw Error("No container found.");
        const containerSize = (_a = article === null || article === void 0 ? void 0 : article.querySelector("p")) === null || _a === void 0 ? void 0 : _a.getBoundingClientRect();
        if (!containerSize)
            throw Error("Can't find container size");
        const { width, left, right } = containerSize;
        styles(text, background, width, left, right);
        const ni = document.createNodeIterator(article, NodeFilter.SHOW_ELEMENT, (node) => {
            if (!node || !node.textContent)
                return NodeFilter.FILTER_REJECT;
            return combinedRe.test(node.textContent)
                ? NodeFilter.FILTER_ACCEPT
                : NodeFilter.FILTER_REJECT;
            // ACCEPT, REJECT OR SKIP based on
            // custom criteria
        });
        if (!ni.referenceNode)
            throw Error("Reference node not found");
        let current;
        let els = [];
        while ((current = ni.nextNode())) {
            els.push(current);
            // const parentEl = current;
            // const str = current.textContent;
            // if (!parentEl) throw Error(`No parent element, ${current}`);
            // if (typeof str !== "string" || !str) throw Error("Nothing to match");
            // createFn(fnRe, str, parentEl);
            // createRef(refRe, str, parentEl);
        }
        const notes = els.slice(1);
        let fn = [], ref = [];
        notes.forEach((note) => {
            const str = note.textContent;
            const parentEl = note;
            if (typeof str !== "string" || !str)
                throw Error("Nothing to match");
            if (!parentEl)
                throw Error(`No parent element, ${note}`);
            let fnCheck = createFn(fnRe, str, parentEl);
            fn = [...fn, ...fnCheck];
            let refCheck = createRef(refRe, str, parentEl);
            ref = [...ref, ...refCheck];
        });
        if (fn.length !== ref.length) {
            const [max, min] = fn.length > ref.length ? [fn, ref] : [ref, fn];
            const missing = max.filter((val) => !min.includes(val)).join(", ");
            const errorMessage = (fn, ref, missing) => {
                return `It looks like there are more ${fn.length > ref.length
                    ? "footnotes (" +
                        fn.length +
                        ")" +
                        " than references (" +
                        ref.length +
                        ")"
                    : "references (" +
                        ref.length +
                        ")" +
                        " than footnotes (" +
                        fn.length +
                        ")"}. Check ${fn.length > ref.length ? "footnote(s)" : "reference(s)"} ${missing}`;
            };
            throw Error(errorMessage(fn, ref, missing));
        }
    }
    catch (e) {
        console.error(e);
    }
}

export { init as default };
