
  /**
   * @license
   * author: Ryan Feigenbaum
   * footnoter.js v1.0.0
   * Released under the MIT license.
   */

var footnoter = (function () {
    'use strict';

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

    function createRefPreview(refRe, str, parentEl) {
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

    function createRef(refRe, str, parentEl) {
        if (refRe.test(str)) {
            // Need to encode/decode html entities in config
            createRefPreview(refRe, str, parentEl);
            const transformedText = parentEl.innerHTML.replaceAll(/&lt;&lt;(\d+)/g, "$1. ");
            const number = /\d+/.exec(str);
            if (!number)
                throw Error("Couldn`t extract number");
            const [num] = number;
            parentEl.id = `ref-${num}`;
            parentEl.innerHTML = `${transformedText} <a class="reference-back" href="#${num}" aria-label="Back to footnote ${num}">⮌</a>`;
            return [num.toString()];
        }
        return [];
    }

    function init(userOptions) {
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

    return init;

})();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uL3NyYy9vcHRpb25zLnRzIiwiLi4vc3JjL3N0eWxlcy50cyIsIi4uL3NyYy9jcmVhdGVGbi50cyIsIi4uL3NyYy9jcmVhdGVSZWZQcmV2aWV3LnRzIiwiLi4vc3JjL2NyZWF0ZVJlZi50cyIsIi4uL3NyYy9pbmRleC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbnRlcmZhY2UgT3B0aW9ucyB7XG4gIGNvbnRhaW5lcjogc3RyaW5nO1xuICBmbkFuY2hvcjogc3RyaW5nO1xuICByZWZBbmNob3I6IHN0cmluZztcbiAgYmFja2dyb3VuZDogc3RyaW5nO1xuICB0ZXh0OiBzdHJpbmc7XG59XG5cbmNvbnN0IG9wdGlvbnM6IE9wdGlvbnMgPSB7XG4gIGNvbnRhaW5lcjogXCJhcnRpY2xlXCIsXG4gIGZuQW5jaG9yOiBcIj4+XCIsXG4gIHJlZkFuY2hvcjogXCI8PFwiLFxuICBiYWNrZ3JvdW5kOiBcIiNmZmZcIixcbiAgdGV4dDogXCIjMDAwXCIsXG59O1xuXG5leHBvcnQgZGVmYXVsdCBvcHRpb25zO1xuIiwiY29uc3Qgc3R5bGVzID0gKFxuICB0ZXh0OiBzdHJpbmcsXG4gIGJhY2tncm91bmQ6IHN0cmluZyxcbiAgd2lkdGg6IG51bWJlcixcbiAgbGVmdDogbnVtYmVyLFxuICByaWdodDogbnVtYmVyXG4pOiB2b2lkID0+IHtcbiAgY29uc3Qgc3R5bGVzID0gYFxuICAgIGJvZHkge1xuICAgIH1cblx0LmZvb3Rub3RlIHtcblx0XHRmb250LXNpemU6IDEycHg7XG5cdFx0dGV4dC1kZWNvcmF0aW9uOiBub25lO1xuICAgICAgICBib3JkZXItcmFkaXVzOiA1MCU7XG4gICAgICAgIHBhZGRpbmc6IDAgNHB4O1xuICAgICAgICBmb250LXZhcmlhbnQtbnVtZXJpYzogdGFidWxhci1udW1zO1xuICAgICAgICBsZWZ0OiAtNHB4O1xuICAgICAgICBmb250LXdlaWdodDogNzAwO1xuICAgICAgICB2ZXJ0aWNhbC1hbGlnbjogdGV4dC10b3A7XG4gICAgICAgIGNvbG9yOiBpbmhlcml0O1xuICAgICAgICBzY3JvbGwtcGFkZGluZzogMzBweDtcblx0fVxuXG4gICAgOnRhcmdldCB7XG4gICAgICAgIG1hcmdpbi10b3A6IDFlbTtcbiAgICB9XG5cbiAgICBcblxuICAgIC5mb290bm90ZTpob3ZlciB7XG4gICAgICAgIGJhY2tncm91bmQ6IHJnYmEoMCAwIDAgLyAuMTUpXG4gICAgfVxuXG5cdC5yZWZlcmVuY2UtcHJldmlldyB7XG5cdFx0cG9zaXRpb246IGFic29sdXRlO1xuXHRcdG9wYWNpdHk6IDA7XG5cdFx0dHJhbnNmb3JtOiB0cmFuc2xhdGVZKC0xcmVtKTtcblx0XHRsZWZ0OiAwO1xuICAgICAgICBmb250LXdlaWdodDogNDAwO1xuXHRcdFxuXHRcdHBvaW50ZXItZXZlbnRzOiBub25lO1xuXHRcdHBhZGRpbmc6IDNyZW0gLjVyZW07XG5cdFx0d2lkdGg6ICR7d2lkdGh9cHg7XG5cdFx0dHJhbnNpdGlvbjogLjRzO1xuXHRcdGJhY2tncm91bmQ6IGxpbmVhci1ncmFkaWVudCh0byB0b3AsIHRyYW5zcGFyZW50LCAke2JhY2tncm91bmR9LCAgJHtiYWNrZ3JvdW5kfSwgdHJhbnNwYXJlbnQpO1xuXHRcdFxuXG5cdH1cblxuXHQucmVmZXJlbmNlLWNvbnRlbnQge1xuXHRcdGZvbnQtc2l6ZTogMTVweDtcblx0XHRiYWNrZ3JvdW5kLWNvbG9yOiAke2JhY2tncm91bmR9O1xuXHRcdGNvbG9yOiAke3RleHR9O1xuXHRcdGJvcmRlci1yYWRpdXM6IDlweDtcblx0XHRwYWRkaW5nOiAxZW07XG5cdFx0Ym94LXNoYWRvdzogMCAxOXB4IDM4cHggcmdiYSgwLDAsMCwwLjMwKSwgMCAxNXB4IDEycHggcmdiYSgwLDAsMCwwLjIyKTtcblxuXG5cdH1cblx0XG5cdC5mb290bm90ZTpob3ZlciAucmVmZXJlbmNlLXByZXZpZXcge1xuXHRcdG9wYWNpdHk6IDE7XG5cdH1cblxuICAucmVmZXJlbmNlLWJhY2sge1xuICAgIHRleHQtZGVjb3JhdGlvbjogbm9uZTtcbiAgfVxuIFxuICAgYDtcbiAgY29uc3Qgc3R5bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3R5bGVcIik7XG4gIHN0eWxlLnRleHRDb250ZW50ID0gc3R5bGVzO1xuICBkb2N1bWVudC5oZWFkLmFwcGVuZChzdHlsZSk7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBzdHlsZXM7XG4iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBjcmVhdGVGbihcbiAgZm5SZTogUmVnRXhwLFxuICBzdHI6IHN0cmluZyxcbiAgcGFyZW50RWw6IEhUTUxFbGVtZW50XG4pOiBzdHJpbmdbXSB7XG4gIC8vICAgbGV0IGNvdW50ID0gW107XG5cbiAgaWYgKGZuUmUudGVzdChzdHIpKSB7XG4gICAgY29uc3QgbWF0Y2hlcyA9IHN0ci5tYXRjaChmblJlKTtcbiAgICBjb25zdCB2YWx1ZXMgPSBtYXRjaGVzPy5tYXAoKHYpID0+IHYucmVwbGFjZShcIj4+XCIsIFwiXCIpKTtcblxuICAgIC8vIGNvdW50ID0gWy4uLmNvdW50LCAuLi52YWx1ZXNdO1xuICAgIC8vIGNvbnNvbGUubG9nKG1hdGNoZXMpO1xuXG4gICAgY29uc3QgdHJhbnNmb3JtZWRUZXh0ID0gcGFyZW50RWw/LmlubmVyVGV4dC5yZXBsYWNlKFxuICAgICAgZm5SZSxcbiAgICAgIGA8YSBjbGFzcz0nZm9vdG5vdGUnIGlkPSckMScgaHJlZj0nI3JlZi0kMSc+JDE8L2E+YFxuICAgICk7XG4gICAgcGFyZW50RWwuaW5uZXJIVE1MID0gdHJhbnNmb3JtZWRUZXh0O1xuICAgIHBhcmVudEVsLnNldEF0dHJpYnV0ZShcInN0eWxlXCIsIFwicG9zaXRpb246cmVsYXRpdmU7XCIpO1xuICAgIGlmICghdmFsdWVzKSByZXR1cm4gW107XG4gICAgcmV0dXJuIHZhbHVlcztcbiAgfVxuXG4gIHJldHVybiBbXTtcbn1cbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGNyZWF0ZVJlZlByZXZpZXcoXG4gIHJlZlJlOiBSZWdFeHAsXG4gIHN0cjogc3RyaW5nLFxuICBwYXJlbnRFbDogSFRNTEVsZW1lbnRcbik6IHZvaWQge1xuICBjb25zdCBtYXRjaGVzID0gc3RyLm1hdGNoKHJlZlJlKTtcblxuICBpZiAoIW1hdGNoZXMgfHwgIW1hdGNoZXMubGVuZ3RoKSB0aHJvdyBFcnJvcihcIkNvdWxkbid0IGZpbmQgbWF0Y2hlc1wiKTtcblxuICBtYXRjaGVzLmZvckVhY2goKG1hdGNoKSA9PiB7XG4gICAgY29uc3QgbnVtYmVyID0gL1xcZCsvLmV4ZWMobWF0Y2gpO1xuICAgIGlmICghbnVtYmVyKSB0aHJvdyBFcnJvcihcIkNvdWxkbmB0IGV4dHJhY3QgbnVtYmVyXCIpO1xuXG4gICAgY29uc3QgW251bV0gPSBudW1iZXI7XG5cbiAgICBjb25zdCBvdXRlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgb3V0ZXIuc2V0QXR0cmlidXRlKFwiY2xhc3NcIiwgXCJyZWZlcmVuY2UtcHJldmlld1wiKTtcbiAgICBjb25zdCBpbm5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgaW5uZXIuc2V0QXR0cmlidXRlKFwiY2xhc3NcIiwgXCJyZWZlcmVuY2UtY29udGVudFwiKTtcblxuICAgIGlubmVyLmlubmVySFRNTCA9IHBhcmVudEVsLmlubmVySFRNTC5yZXBsYWNlKC8mbHQ7Jmx0OyhcXGQrKS9nLCBcIiQxIHwgXCIpO1xuICAgIG91dGVyLmFwcGVuZChpbm5lcik7XG5cbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChudW0pPy5hcHBlbmQob3V0ZXIpO1xuICB9KTtcbn1cbiIsImltcG9ydCBjcmVhdGVSZWZQcmV2aWV3IGZyb20gXCIuL2NyZWF0ZVJlZlByZXZpZXdcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gY3JlYXRlUmVmKFxuICByZWZSZTogUmVnRXhwLFxuICBzdHI6IHN0cmluZyxcbiAgcGFyZW50RWw6IEhUTUxFbGVtZW50XG4pOiBzdHJpbmdbXSB7XG4gIGlmIChyZWZSZS50ZXN0KHN0cikpIHtcbiAgICAvLyBOZWVkIHRvIGVuY29kZS9kZWNvZGUgaHRtbCBlbnRpdGllcyBpbiBjb25maWdcbiAgICBjcmVhdGVSZWZQcmV2aWV3KHJlZlJlLCBzdHIsIHBhcmVudEVsKTtcblxuICAgIGNvbnN0IHRyYW5zZm9ybWVkVGV4dCA9IHBhcmVudEVsLmlubmVySFRNTC5yZXBsYWNlQWxsKFxuICAgICAgLyZsdDsmbHQ7KFxcZCspL2csXG4gICAgICBcIiQxLiBcIlxuICAgICk7XG5cbiAgICBjb25zdCBudW1iZXIgPSAvXFxkKy8uZXhlYyhzdHIpO1xuXG4gICAgaWYgKCFudW1iZXIpIHRocm93IEVycm9yKFwiQ291bGRuYHQgZXh0cmFjdCBudW1iZXJcIik7XG5cbiAgICBjb25zdCBbbnVtXSA9IG51bWJlcjtcblxuICAgIHBhcmVudEVsLmlkID0gYHJlZi0ke251bX1gO1xuXG4gICAgcGFyZW50RWwuaW5uZXJIVE1MID0gYCR7dHJhbnNmb3JtZWRUZXh0fSA8YSBjbGFzcz1cInJlZmVyZW5jZS1iYWNrXCIgaHJlZj1cIiMke251bX1cIiBhcmlhLWxhYmVsPVwiQmFjayB0byBmb290bm90ZSAke251bX1cIj7irow8L2E+YDtcblxuICAgIHJldHVybiBbbnVtLnRvU3RyaW5nKCldO1xuICB9XG4gIHJldHVybiBbXTtcbn1cbiIsImltcG9ydCBvcHRpb25zIGZyb20gXCIuL29wdGlvbnNcIjtcbmltcG9ydCBzdHlsZXMgZnJvbSBcIi4vc3R5bGVzXCI7XG5pbXBvcnQgY3JlYXRlRm4gZnJvbSBcIi4vY3JlYXRlRm5cIjtcbmltcG9ydCBjcmVhdGVSZWYgZnJvbSBcIi4vY3JlYXRlUmVmXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGluaXQodXNlck9wdGlvbnM6IHtcbiAgY29udGFpbmVyPzogc3RyaW5nO1xuICBmbkFuY2hvcj86IHN0cmluZztcbiAgcmVmQW5jaG9yPzogc3RyaW5nO1xuICB0ZXh0Pzogc3RyaW5nO1xuICBiYWNrZ3JvdW5kPzogc3RyaW5nO1xufSk6IHZvaWQge1xuICB0cnkge1xuICAgIGNvbnN0IGNvbmZpZyA9IHsgLi4ub3B0aW9ucywgLi4udXNlck9wdGlvbnMgfTtcbiAgICBjb25zb2xlLmxvZyhjb25maWcpO1xuICAgIGNvbnN0IHsgY29udGFpbmVyLCBmbkFuY2hvciwgcmVmQW5jaG9yLCB0ZXh0LCBiYWNrZ3JvdW5kIH0gPSBjb25maWc7XG5cbiAgICBjb25zdCBmblJlID0gbmV3IFJlZ0V4cChgJHtmbkFuY2hvcn0oXFxcXGQrKWAsIFwiZ1wiKTtcbiAgICBjb25zdCByZWZSZSA9IG5ldyBSZWdFeHAoYCR7cmVmQW5jaG9yfShcXFxcZCspYCwgXCJnXCIpO1xuICAgIGNvbnN0IGNvbWJpbmVkUmUgPSBuZXcgUmVnRXhwKGAoJHtmbkFuY2hvcn18JHtyZWZBbmNob3J9KVxcXFxkK2ApO1xuICAgIGNvbnNvbGUubG9nKGNvbWJpbmVkUmUpO1xuICAgIGNvbnN0IGFydGljbGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGNvbnRhaW5lcik7XG5cbiAgICBpZiAoIWFydGljbGUpIHRocm93IEVycm9yKFwiTm8gY29udGFpbmVyIGZvdW5kLlwiKTtcblxuICAgIGNvbnN0IGNvbnRhaW5lclNpemUgPSBhcnRpY2xlPy5xdWVyeVNlbGVjdG9yKFwicFwiKT8uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG5cbiAgICBpZiAoIWNvbnRhaW5lclNpemUpIHRocm93IEVycm9yKFwiQ2FuJ3QgZmluZCBjb250YWluZXIgc2l6ZVwiKTtcblxuICAgIGNvbnN0IHsgd2lkdGgsIGxlZnQsIHJpZ2h0IH0gPSBjb250YWluZXJTaXplO1xuXG4gICAgc3R5bGVzKHRleHQsIGJhY2tncm91bmQsIHdpZHRoLCBsZWZ0LCByaWdodCk7XG5cbiAgICBjb25zdCBuaSA9IGRvY3VtZW50LmNyZWF0ZU5vZGVJdGVyYXRvcihcbiAgICAgIGFydGljbGUsXG4gICAgICBOb2RlRmlsdGVyLlNIT1dfRUxFTUVOVCxcbiAgICAgIChub2RlKSA9PiB7XG4gICAgICAgIGlmICghbm9kZSB8fCAhbm9kZS50ZXh0Q29udGVudCkgcmV0dXJuIE5vZGVGaWx0ZXIuRklMVEVSX1JFSkVDVDtcbiAgICAgICAgcmV0dXJuIGNvbWJpbmVkUmUudGVzdChub2RlLnRleHRDb250ZW50KVxuICAgICAgICAgID8gTm9kZUZpbHRlci5GSUxURVJfQUNDRVBUXG4gICAgICAgICAgOiBOb2RlRmlsdGVyLkZJTFRFUl9SRUpFQ1Q7XG4gICAgICAgIC8vIEFDQ0VQVCwgUkVKRUNUIE9SIFNLSVAgYmFzZWQgb25cbiAgICAgICAgLy8gY3VzdG9tIGNyaXRlcmlhXG4gICAgICB9XG4gICAgKTtcblxuICAgIGlmICghbmkucmVmZXJlbmNlTm9kZSkgdGhyb3cgRXJyb3IoXCJSZWZlcmVuY2Ugbm9kZSBub3QgZm91bmRcIik7XG5cbiAgICBsZXQgY3VycmVudDtcbiAgICBsZXQgZWxzID0gW107XG5cbiAgICB3aGlsZSAoKGN1cnJlbnQgPSBuaS5uZXh0Tm9kZSgpKSkge1xuICAgICAgZWxzLnB1c2goY3VycmVudCk7XG4gICAgICAvLyBjb25zdCBwYXJlbnRFbCA9IGN1cnJlbnQ7XG4gICAgICAvLyBjb25zdCBzdHIgPSBjdXJyZW50LnRleHRDb250ZW50O1xuXG4gICAgICAvLyBpZiAoIXBhcmVudEVsKSB0aHJvdyBFcnJvcihgTm8gcGFyZW50IGVsZW1lbnQsICR7Y3VycmVudH1gKTtcblxuICAgICAgLy8gaWYgKHR5cGVvZiBzdHIgIT09IFwic3RyaW5nXCIgfHwgIXN0cikgdGhyb3cgRXJyb3IoXCJOb3RoaW5nIHRvIG1hdGNoXCIpO1xuXG4gICAgICAvLyBjcmVhdGVGbihmblJlLCBzdHIsIHBhcmVudEVsKTtcblxuICAgICAgLy8gY3JlYXRlUmVmKHJlZlJlLCBzdHIsIHBhcmVudEVsKTtcbiAgICB9XG5cbiAgICBjb25zdCBub3RlcyA9IGVscy5zbGljZSgxKTtcbiAgICBsZXQgZm46IHN0cmluZ1tdID0gW10sXG4gICAgICByZWY6IHN0cmluZ1tdID0gW107XG4gICAgbm90ZXMuZm9yRWFjaCgobm90ZSkgPT4ge1xuICAgICAgY29uc3Qgc3RyID0gbm90ZS50ZXh0Q29udGVudDtcbiAgICAgIGNvbnN0IHBhcmVudEVsID0gbm90ZSBhcyBIVE1MRWxlbWVudDtcblxuICAgICAgaWYgKHR5cGVvZiBzdHIgIT09IFwic3RyaW5nXCIgfHwgIXN0cikgdGhyb3cgRXJyb3IoXCJOb3RoaW5nIHRvIG1hdGNoXCIpO1xuXG4gICAgICBpZiAoIXBhcmVudEVsKSB0aHJvdyBFcnJvcihgTm8gcGFyZW50IGVsZW1lbnQsICR7bm90ZX1gKTtcblxuICAgICAgbGV0IGZuQ2hlY2sgPSBjcmVhdGVGbihmblJlLCBzdHIsIHBhcmVudEVsKTtcblxuICAgICAgZm4gPSBbLi4uZm4sIC4uLmZuQ2hlY2tdO1xuXG4gICAgICBsZXQgcmVmQ2hlY2sgPSBjcmVhdGVSZWYocmVmUmUsIHN0ciwgcGFyZW50RWwpO1xuICAgICAgcmVmID0gWy4uLnJlZiwgLi4ucmVmQ2hlY2tdO1xuICAgIH0pO1xuXG4gICAgaWYgKGZuLmxlbmd0aCAhPT0gcmVmLmxlbmd0aCkge1xuICAgICAgY29uc3QgW21heCwgbWluXSA9IGZuLmxlbmd0aCA+IHJlZi5sZW5ndGggPyBbZm4sIHJlZl0gOiBbcmVmLCBmbl07XG5cbiAgICAgIGNvbnN0IG1pc3NpbmcgPSBtYXguZmlsdGVyKCh2YWwpID0+ICFtaW4uaW5jbHVkZXModmFsKSkuam9pbihcIiwgXCIpO1xuXG4gICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSAoXG4gICAgICAgIGZuOiBzdHJpbmdbXSxcbiAgICAgICAgcmVmOiBzdHJpbmdbXSxcbiAgICAgICAgbWlzc2luZzogc3RyaW5nXG4gICAgICApOiBzdHJpbmcgPT4ge1xuICAgICAgICByZXR1cm4gYEl0IGxvb2tzIGxpa2UgdGhlcmUgYXJlIG1vcmUgJHtcbiAgICAgICAgICBmbi5sZW5ndGggPiByZWYubGVuZ3RoXG4gICAgICAgICAgICA/IFwiZm9vdG5vdGVzIChcIiArXG4gICAgICAgICAgICAgIGZuLmxlbmd0aCArXG4gICAgICAgICAgICAgIFwiKVwiICtcbiAgICAgICAgICAgICAgXCIgdGhhbiByZWZlcmVuY2VzIChcIiArXG4gICAgICAgICAgICAgIHJlZi5sZW5ndGggK1xuICAgICAgICAgICAgICBcIilcIlxuICAgICAgICAgICAgOiBcInJlZmVyZW5jZXMgKFwiICtcbiAgICAgICAgICAgICAgcmVmLmxlbmd0aCArXG4gICAgICAgICAgICAgIFwiKVwiICtcbiAgICAgICAgICAgICAgXCIgdGhhbiBmb290bm90ZXMgKFwiICtcbiAgICAgICAgICAgICAgZm4ubGVuZ3RoICtcbiAgICAgICAgICAgICAgXCIpXCJcbiAgICAgICAgfS4gQ2hlY2sgJHtcbiAgICAgICAgICBmbi5sZW5ndGggPiByZWYubGVuZ3RoID8gXCJmb290bm90ZShzKVwiIDogXCJyZWZlcmVuY2UocylcIlxuICAgICAgICB9ICR7bWlzc2luZ31gO1xuICAgICAgfTtcbiAgICAgIHRocm93IEVycm9yKGVycm9yTWVzc2FnZShmbiwgcmVmLCBtaXNzaW5nKSk7XG4gICAgfVxuICB9IGNhdGNoIChlKSB7XG4gICAgY29uc29sZS5lcnJvcihlKTtcbiAgfVxufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0lBUUEsTUFBTSxPQUFPLEdBQVk7SUFDdkIsSUFBQSxTQUFTLEVBQUUsU0FBUztJQUNwQixJQUFBLFFBQVEsRUFBRSxJQUFJO0lBQ2QsSUFBQSxTQUFTLEVBQUUsSUFBSTtJQUNmLElBQUEsVUFBVSxFQUFFLE1BQU07SUFDbEIsSUFBQSxJQUFJLEVBQUUsTUFBTTtLQUNiOztJQ2RELE1BQU0sTUFBTSxHQUFHLENBQ2IsSUFBWSxFQUNaLFVBQWtCLEVBQ2xCLEtBQWEsRUFDYixJQUFZLEVBQ1osS0FBYSxLQUNMO0lBQ1IsSUFBQSxNQUFNLE1BQU0sR0FBRyxDQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztXQW1DTixLQUFLLENBQUE7O0FBRXFDLG1EQUFBLEVBQUEsVUFBVSxNQUFNLFVBQVUsQ0FBQTs7Ozs7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
