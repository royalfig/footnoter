import options from "./options";
import styles from "./styles";
import createFn from "./createFn";
import createRef from "./createRef";
export default function init(userOptions) {
    try {
        const config = { ...options, ...userOptions };
        console.log(config);
        const { container, fnAnchor, refAnchor, text, background } = config;
        const fnRe = new RegExp(`${fnAnchor}(\\d+)`, "g");
        const refRe = new RegExp(`${refAnchor}(\\d+)`, "g");
        const combinedRe = new RegExp(`(${fnAnchor}|${refAnchor})\\d+`);
        console.log(combinedRe);
        const article = document.querySelector(container);
        if (!article)
            throw Error("No container found.");
        const containerSize = article?.querySelector("p")?.getBoundingClientRect();
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
