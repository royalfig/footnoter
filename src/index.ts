import options from "./options";
import styles from "./styles";

export default function init() {
    const article = document.querySelector('article')

    if (!article) throw Error('Content container not found');

    const ni = document.createNodeIterator(article, NodeFilter.SHOW_TEXT)

    if (!ni.referenceNode) return;

    let current = ni.nextNode()

    let nodes = []

    while (current) {
        const str = ni.referenceNode.textContent;

        if (typeof str !== "string" || !str) throw Error('Nothing to match');

        if (/>>/.test(str)) {

            const matchResults = str.match(/>>(\d)/);
            
            if (matchResults) {
                
                const [whole, group] = matchResults;
                const extract = str.replace(/>>\d/, "")
                const fn = document.createElement('a')
                const sup = document.createElement('sup')
                fn.setAttribute('href', `#${group}`)
                sup.textContent = group;
                fn.setAttribute('style', 'padding: 5px')
                fn.classList.add('footnote')
                fn.id = `ref-${group}`;
                fn.append(sup)
                ni.referenceNode.parentElement && ni.referenceNode.parentElement.append(fn)

                ni.referenceNode.textContent = extract;


                nodes.push(ni.referenceNode)
            }
        }

        if (/<</.test(ni.referenceNode.textContent)) {

            const t = ni.referenceNode.textContent.match(/<<(\d)/, "FOOTNOTE $1")[1]
            const extract = ni.referenceNode.textContent.replace(/<<\d/, "")


            const reference = ni.referenceNode.parentElement.textContent.replace(/<<\d/, "");
            document.getElementById(`ref-${t}`).setAttribute('data-reference', reference)
            const fn = document.createElement('a')
            const sup = document.createElement('sup')
            fn.setAttribute('href', `#ref-${t}`)
            sup.textContent = t;
            fn.setAttribute('style', 'padding: 5px')
            fn.id = t;
            fn.append(sup)
            ni.referenceNode.parentElement.prepend(fn)

            ni.referenceNode.textContent = extract;


        }

        current = ni.nextNode()
    }


    const style = document.createElement('style')
    style.textContent = styles;
    document.head.append(style)
    console.log(nodes)
}