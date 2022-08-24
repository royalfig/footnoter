import options from "./options";
import styles from "./styles";

export default function init(userOptions: {
  container?: string;
  fnAnchor?: string;
  refAnchor?: string;
  text?: string;
  background?: string;
}): void {
  const config = { ...options, ...userOptions };
  console.log(config);
  const { container, fnAnchor, refAnchor, text, background } = config;

  const fnRE = new RegExp(`${fnAnchor}(\\d+)`, "g");
  const refRE = new RegExp(`${refAnchor}(\\d+)`, "g");

  const article = document.querySelector(container);

  if (!article) throw Error("No container found.");

  const containerSize = article?.querySelector("p")?.getBoundingClientRect();

  if (!containerSize) throw Error("Can't find container size");

  const { width, left, right } = containerSize;

  styles(text, background, width, left, right);

  if (!article) throw Error("Content container not found");

  const ni = document.createNodeIterator(article, NodeFilter.SHOW_TEXT);

  if (!ni.referenceNode) throw Error("Reference node not found");

  let current;
  let count;
  console.log(ni);
  while ((current = ni.nextNode())) {
    const parentEl = ni.referenceNode.parentElement;

    const str = ni.referenceNode.textContent;

    if (!parentEl) throw Error(`No parent el, ${current}`);

    if (typeof str !== "string" || !str) throw Error("Nothing to match");

    if (fnRE.test(str)) {
      const transformedText = parentEl?.innerText.replace(
        fnRE,
        `<a class='footnote' id='$1' href='#ref-$1'>$1</a>`
      );
      parentEl.innerHTML = transformedText;
      parentEl.setAttribute("style", "position:relative;");
    }

    if (refRE.test(str)) {
      // Need to encode/decode html entities in config
      const matches = str.match(refRE);

      if (!matches || !matches.length) throw Error("Couldn't find matches");

      matches.forEach((match) => {
        const number = /\d/.exec(match);

        if (!number) throw Error("Couldn`t extract number");

        const [num] = number;

        const outer = document.createElement("div");
        outer.setAttribute("class", "reference-preview");
        const inner = document.createElement("div");
        inner.setAttribute("class", "reference-content");

        inner.innerHTML = parentEl.innerHTML.replace(/&lt;&lt;(\d)/g, "$1 | ");
        outer.append(inner);

        document.getElementById(num)?.append(outer);
      });

      const transformedText = parentEl.innerHTML.replaceAll(
        /&lt;&lt;(\d)/g,
        "$1. "
      );
      const num = transformedText[0];
      parentEl.id = `ref-${num}`;

      parentEl.innerHTML = `${transformedText} <a href="#${num}">⮌</a>`;
    }

    console.log(current);
  }
}
