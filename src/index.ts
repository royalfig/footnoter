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

  const { container, fnAnchor, refAnchor, text, background } = config;
  styles(text, background);

  const fnRE = new RegExp(`${fnAnchor}(\\d)`, "g");
  const refRE = new RegExp(`${refAnchor}(\\d)`, "g");
  console.log(fnRE);
  const article = document.querySelector(container);

  if (!article) throw Error("Content container not found");

  const ni = document.createNodeIterator(article, NodeFilter.SHOW_TEXT);

  if (!ni.referenceNode) throw Error("Reference node not found");

  let current;

  let nodes = [];

  while ((current = ni.nextNode())) {
    const parentEl = ni.referenceNode.parentElement;

    const str = ni.referenceNode.textContent;
    if (!parentEl) return;

    // console.log(str, current);

    if (typeof str !== "string" || !str) throw Error("Nothing to match");

    if (fnRE.test(str)) {
      const transformedText = parentEl?.innerText.replace(
        fnRE,
        "<a class='footnote' id='$1' href='#ref-$1'><sup>$1</sup></a>"
      );
      parentEl.innerHTML = transformedText;
    }

    if (refRE.test(str)) {
      // Need to encode/decode html entities in config
      const transformedText = parentEl.innerHTML.replaceAll(
        /&lt;&lt;(\d)/g,
        '<a href="#$1" id="ref-$1">$1</a>'
      );
      console.log(transformedText);
      parentEl.innerHTML = transformedText;
      const matches = str.match(refRE);

      matches.forEach((match) => {
        const [num] = /\d/.exec(match);

        const span = document.createElement("span");
        span.setAttribute("class", "reference-preview");
        span.innerHTML = parentEl.innerHTML.replace(num + " ", "");

        document.getElementById(num)?.append(span);
      });
    }
    nodes.push(current);
  }
  console.log(nodes);
}
