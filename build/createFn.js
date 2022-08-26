export default function createFn(fnRe, str, parentEl) {
    //   let count = [];
    if (fnRe.test(str)) {
        const matches = str.match(fnRe);
        const values = matches?.map((v) => v.replace(">>", ""));
        // count = [...count, ...values];
        // console.log(matches);
        const transformedText = parentEl?.innerText.replace(fnRe, `<a class='footnote' id='$1' href='#ref-$1'>$1</a>`);
        parentEl.innerHTML = transformedText;
        parentEl.setAttribute("style", "position:relative;");
        if (!values)
            return [];
        return values;
    }
    return [];
}
