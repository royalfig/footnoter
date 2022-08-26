import createRefPreview from "./createRefPreview";

export default function createRef(
  refRe: RegExp,
  str: string,
  parentEl: HTMLElement
): string[] {
  if (refRe.test(str)) {
    // Need to encode/decode html entities in config
    createRefPreview(refRe, str, parentEl);

    const transformedText = parentEl.innerHTML.replaceAll(
      /&lt;&lt;(\d+)/g,
      "$1. "
    );

    const number = /\d+/.exec(str);

    if (!number) throw Error("Couldn`t extract number for reference");

    const [num] = number;

    parentEl.id = `ref-${num}`;

    parentEl.innerHTML = `${transformedText} <a class="reference-back" href="#${num}" aria-label="Back to footnote ${num}">⮌</a>`;

    return [num.toString()];
  }

  return [];
}
