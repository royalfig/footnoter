export default function createRefPreview(refRe, str, parentEl) {
    const matches = str.match(refRe);
    if (!matches || !matches.length)
        throw Error("Couldn't find matches");
    matches.forEach((match) => {
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
        document.getElementById(num)?.append(outer);
    });
}
