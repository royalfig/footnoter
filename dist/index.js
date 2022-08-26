
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
                throw Error("Couldn`t extract number for reference");
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uL3NyYy9vcHRpb25zLnRzIiwiLi4vc3JjL3N0eWxlcy50cyIsIi4uL3NyYy9jcmVhdGVGbi50cyIsIi4uL3NyYy9jcmVhdGVSZWZQcmV2aWV3LnRzIiwiLi4vc3JjL2NyZWF0ZVJlZi50cyIsIi4uL3NyYy9pbmRleC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbnRlcmZhY2UgT3B0aW9ucyB7XG4gIGNvbnRhaW5lcjogc3RyaW5nO1xuICBmbkFuY2hvcjogc3RyaW5nO1xuICByZWZBbmNob3I6IHN0cmluZztcbiAgYmFja2dyb3VuZDogc3RyaW5nO1xuICB0ZXh0OiBzdHJpbmc7XG59XG5cbmNvbnN0IG9wdGlvbnM6IE9wdGlvbnMgPSB7XG4gIGNvbnRhaW5lcjogXCJhcnRpY2xlXCIsXG4gIGZuQW5jaG9yOiBcIj4+XCIsXG4gIHJlZkFuY2hvcjogXCI8PFwiLFxuICBiYWNrZ3JvdW5kOiBcIiNmZmZcIixcbiAgdGV4dDogXCIjMDAwXCIsXG59O1xuXG5leHBvcnQgZGVmYXVsdCBvcHRpb25zO1xuIiwiY29uc3Qgc3R5bGVzID0gKFxuICB0ZXh0OiBzdHJpbmcsXG4gIGJhY2tncm91bmQ6IHN0cmluZyxcbiAgd2lkdGg6IG51bWJlcixcbiAgbGVmdDogbnVtYmVyLFxuICByaWdodDogbnVtYmVyXG4pOiB2b2lkID0+IHtcbiAgY29uc3Qgc3R5bGVzID0gYFxuICAgIGJvZHkge1xuICAgIH1cblx0LmZvb3Rub3RlIHtcblx0XHRmb250LXNpemU6IDEycHg7XG5cdFx0dGV4dC1kZWNvcmF0aW9uOiBub25lO1xuICAgICAgICBib3JkZXItcmFkaXVzOiA1MCU7XG4gICAgICAgIHBhZGRpbmc6IDAgNHB4O1xuICAgICAgICBmb250LXZhcmlhbnQtbnVtZXJpYzogdGFidWxhci1udW1zO1xuICAgICAgICBsZWZ0OiAtNHB4O1xuICAgICAgICBmb250LXdlaWdodDogNzAwO1xuICAgICAgICB2ZXJ0aWNhbC1hbGlnbjogdGV4dC10b3A7XG4gICAgICAgIGNvbG9yOiBpbmhlcml0O1xuICAgICAgICBzY3JvbGwtcGFkZGluZzogMzBweDtcblx0fVxuXG4gICAgOnRhcmdldCB7XG4gICAgICAgIG1hcmdpbi10b3A6IDFlbTtcbiAgICB9XG5cbiAgICBcblxuICAgIC5mb290bm90ZTpob3ZlciB7XG4gICAgICAgIGJhY2tncm91bmQ6IHJnYmEoMCAwIDAgLyAuMTUpXG4gICAgfVxuXG5cdC5yZWZlcmVuY2UtcHJldmlldyB7XG5cdFx0cG9zaXRpb246IGFic29sdXRlO1xuXHRcdG9wYWNpdHk6IDA7XG5cdFx0dHJhbnNmb3JtOiB0cmFuc2xhdGVZKC0xcmVtKTtcblx0XHRsZWZ0OiAwO1xuICAgICAgICBmb250LXdlaWdodDogNDAwO1xuXHRcdFxuXHRcdHBvaW50ZXItZXZlbnRzOiBub25lO1xuXHRcdHBhZGRpbmc6IDNyZW0gLjVyZW07XG5cdFx0d2lkdGg6ICR7d2lkdGh9cHg7XG5cdFx0dHJhbnNpdGlvbjogLjRzO1xuXHRcdGJhY2tncm91bmQ6IGxpbmVhci1ncmFkaWVudCh0byB0b3AsIHRyYW5zcGFyZW50LCAke2JhY2tncm91bmR9LCAgJHtiYWNrZ3JvdW5kfSwgdHJhbnNwYXJlbnQpO1xuXHRcdFxuXG5cdH1cblxuXHQucmVmZXJlbmNlLWNvbnRlbnQge1xuXHRcdGZvbnQtc2l6ZTogMTVweDtcblx0XHRiYWNrZ3JvdW5kLWNvbG9yOiAke2JhY2tncm91bmR9O1xuXHRcdGNvbG9yOiAke3RleHR9O1xuXHRcdGJvcmRlci1yYWRpdXM6IDlweDtcblx0XHRwYWRkaW5nOiAxZW07XG5cdFx0Ym94LXNoYWRvdzogMCAxOXB4IDM4cHggcmdiYSgwLDAsMCwwLjMwKSwgMCAxNXB4IDEycHggcmdiYSgwLDAsMCwwLjIyKTtcblxuXG5cdH1cblx0XG5cdC5mb290bm90ZTpob3ZlciAucmVmZXJlbmNlLXByZXZpZXcge1xuXHRcdG9wYWNpdHk6IDE7XG5cdH1cblxuICAucmVmZXJlbmNlLWJhY2sge1xuICAgIHRleHQtZGVjb3JhdGlvbjogbm9uZTtcbiAgfVxuIFxuICAgYDtcbiAgY29uc3Qgc3R5bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3R5bGVcIik7XG4gIHN0eWxlLnRleHRDb250ZW50ID0gc3R5bGVzO1xuICBkb2N1bWVudC5oZWFkLmFwcGVuZChzdHlsZSk7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBzdHlsZXM7XG4iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBjcmVhdGVGbihcbiAgZm5SZTogUmVnRXhwLFxuICBzdHI6IHN0cmluZyxcbiAgcGFyZW50RWw6IEhUTUxFbGVtZW50XG4pOiBzdHJpbmdbXSB7XG4gIC8vICAgbGV0IGNvdW50ID0gW107XG5cbiAgaWYgKGZuUmUudGVzdChzdHIpKSB7XG4gICAgY29uc3QgbWF0Y2hlcyA9IHN0ci5tYXRjaChmblJlKTtcbiAgICBjb25zdCB2YWx1ZXMgPSBtYXRjaGVzPy5tYXAoKHYpID0+IHYucmVwbGFjZShcIj4+XCIsIFwiXCIpKTtcblxuICAgIC8vIGNvdW50ID0gWy4uLmNvdW50LCAuLi52YWx1ZXNdO1xuICAgIC8vIGNvbnNvbGUubG9nKG1hdGNoZXMpO1xuXG4gICAgY29uc3QgdHJhbnNmb3JtZWRUZXh0ID0gcGFyZW50RWw/LmlubmVyVGV4dC5yZXBsYWNlKFxuICAgICAgZm5SZSxcbiAgICAgIGA8YSBjbGFzcz0nZm9vdG5vdGUnIGlkPSckMScgaHJlZj0nI3JlZi0kMSc+JDE8L2E+YFxuICAgICk7XG4gICAgcGFyZW50RWwuaW5uZXJIVE1MID0gdHJhbnNmb3JtZWRUZXh0O1xuICAgIHBhcmVudEVsLnNldEF0dHJpYnV0ZShcInN0eWxlXCIsIFwicG9zaXRpb246cmVsYXRpdmU7XCIpO1xuICAgIGlmICghdmFsdWVzKSByZXR1cm4gW107XG4gICAgcmV0dXJuIHZhbHVlcztcbiAgfVxuXG4gIHJldHVybiBbXTtcbn1cbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGNyZWF0ZVJlZlByZXZpZXcoXG4gIHJlZlJlOiBSZWdFeHAsXG4gIHN0cjogc3RyaW5nLFxuICBwYXJlbnRFbDogSFRNTEVsZW1lbnRcbik6IHZvaWQge1xuICBjb25zdCBtYXRjaGVzID0gc3RyLm1hdGNoKHJlZlJlKTtcblxuICBpZiAoIW1hdGNoZXMgfHwgIW1hdGNoZXMubGVuZ3RoKSB0aHJvdyBFcnJvcihcIkNvdWxkbid0IGZpbmQgbWF0Y2hlc1wiKTtcblxuICBtYXRjaGVzLmZvckVhY2goKG1hdGNoKSA9PiB7XG4gICAgY29uc3QgbnVtYmVyID0gL1xcZCsvLmV4ZWMobWF0Y2gpO1xuICAgIGlmICghbnVtYmVyKSB0aHJvdyBFcnJvcihcIkNvdWxkbmB0IGV4dHJhY3QgbnVtYmVyXCIpO1xuXG4gICAgY29uc3QgW251bV0gPSBudW1iZXI7XG5cbiAgICBjb25zdCBvdXRlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgb3V0ZXIuc2V0QXR0cmlidXRlKFwiY2xhc3NcIiwgXCJyZWZlcmVuY2UtcHJldmlld1wiKTtcbiAgICBjb25zdCBpbm5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgaW5uZXIuc2V0QXR0cmlidXRlKFwiY2xhc3NcIiwgXCJyZWZlcmVuY2UtY29udGVudFwiKTtcblxuICAgIGlubmVyLmlubmVySFRNTCA9IHBhcmVudEVsLmlubmVySFRNTC5yZXBsYWNlKC8mbHQ7Jmx0OyhcXGQrKS9nLCBcIiQxIHwgXCIpO1xuICAgIG91dGVyLmFwcGVuZChpbm5lcik7XG5cbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChudW0pPy5hcHBlbmQob3V0ZXIpO1xuICB9KTtcbn1cbiIsImltcG9ydCBjcmVhdGVSZWZQcmV2aWV3IGZyb20gXCIuL2NyZWF0ZVJlZlByZXZpZXdcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gY3JlYXRlUmVmKFxuICByZWZSZTogUmVnRXhwLFxuICBzdHI6IHN0cmluZyxcbiAgcGFyZW50RWw6IEhUTUxFbGVtZW50XG4pOiBzdHJpbmdbXSB7XG4gIGlmIChyZWZSZS50ZXN0KHN0cikpIHtcbiAgICAvLyBOZWVkIHRvIGVuY29kZS9kZWNvZGUgaHRtbCBlbnRpdGllcyBpbiBjb25maWdcbiAgICBjcmVhdGVSZWZQcmV2aWV3KHJlZlJlLCBzdHIsIHBhcmVudEVsKTtcblxuICAgIGNvbnN0IHRyYW5zZm9ybWVkVGV4dCA9IHBhcmVudEVsLmlubmVySFRNTC5yZXBsYWNlQWxsKFxuICAgICAgLyZsdDsmbHQ7KFxcZCspL2csXG4gICAgICBcIiQxLiBcIlxuICAgICk7XG5cbiAgICBjb25zdCBudW1iZXIgPSAvXFxkKy8uZXhlYyhzdHIpO1xuXG4gICAgaWYgKCFudW1iZXIpIHRocm93IEVycm9yKFwiQ291bGRuYHQgZXh0cmFjdCBudW1iZXIgZm9yIHJlZmVyZW5jZVwiKTtcblxuICAgIGNvbnN0IFtudW1dID0gbnVtYmVyO1xuXG4gICAgcGFyZW50RWwuaWQgPSBgcmVmLSR7bnVtfWA7XG5cbiAgICBwYXJlbnRFbC5pbm5lckhUTUwgPSBgJHt0cmFuc2Zvcm1lZFRleHR9IDxhIGNsYXNzPVwicmVmZXJlbmNlLWJhY2tcIiBocmVmPVwiIyR7bnVtfVwiIGFyaWEtbGFiZWw9XCJCYWNrIHRvIGZvb3Rub3RlICR7bnVtfVwiPuKujDwvYT5gO1xuXG4gICAgcmV0dXJuIFtudW0udG9TdHJpbmcoKV07XG4gIH1cblxuICByZXR1cm4gW107XG59XG4iLCJpbXBvcnQgb3B0aW9ucyBmcm9tIFwiLi9vcHRpb25zXCI7XG5pbXBvcnQgc3R5bGVzIGZyb20gXCIuL3N0eWxlc1wiO1xuaW1wb3J0IGNyZWF0ZUZuIGZyb20gXCIuL2NyZWF0ZUZuXCI7XG5pbXBvcnQgY3JlYXRlUmVmIGZyb20gXCIuL2NyZWF0ZVJlZlwiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBpbml0KHVzZXJPcHRpb25zOiB7XG4gIGNvbnRhaW5lcj86IHN0cmluZztcbiAgZm5BbmNob3I/OiBzdHJpbmc7XG4gIHJlZkFuY2hvcj86IHN0cmluZztcbiAgdGV4dD86IHN0cmluZztcbiAgYmFja2dyb3VuZD86IHN0cmluZztcbn0pOiB2b2lkIHtcbiAgdHJ5IHtcbiAgICBjb25zdCBjb25maWcgPSB7IC4uLm9wdGlvbnMsIC4uLnVzZXJPcHRpb25zIH07XG4gICAgY29uc29sZS5sb2coY29uZmlnKTtcbiAgICBjb25zdCB7IGNvbnRhaW5lciwgZm5BbmNob3IsIHJlZkFuY2hvciwgdGV4dCwgYmFja2dyb3VuZCB9ID0gY29uZmlnO1xuXG4gICAgY29uc3QgZm5SZSA9IG5ldyBSZWdFeHAoYCR7Zm5BbmNob3J9KFxcXFxkKylgLCBcImdcIik7XG4gICAgY29uc3QgcmVmUmUgPSBuZXcgUmVnRXhwKGAke3JlZkFuY2hvcn0oXFxcXGQrKWAsIFwiZ1wiKTtcbiAgICBjb25zdCBjb21iaW5lZFJlID0gbmV3IFJlZ0V4cChgKCR7Zm5BbmNob3J9fCR7cmVmQW5jaG9yfSlcXFxcZCtgKTtcbiAgICBjb25zb2xlLmxvZyhjb21iaW5lZFJlKTtcbiAgICBjb25zdCBhcnRpY2xlID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcihjb250YWluZXIpO1xuXG4gICAgaWYgKCFhcnRpY2xlKSB0aHJvdyBFcnJvcihcIk5vIGNvbnRhaW5lciBmb3VuZC5cIik7XG5cbiAgICBjb25zdCBjb250YWluZXJTaXplID0gYXJ0aWNsZT8ucXVlcnlTZWxlY3RvcihcInBcIik/LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXG4gICAgaWYgKCFjb250YWluZXJTaXplKSB0aHJvdyBFcnJvcihcIkNhbid0IGZpbmQgY29udGFpbmVyIHNpemVcIik7XG5cbiAgICBjb25zdCB7IHdpZHRoLCBsZWZ0LCByaWdodCB9ID0gY29udGFpbmVyU2l6ZTtcblxuICAgIHN0eWxlcyh0ZXh0LCBiYWNrZ3JvdW5kLCB3aWR0aCwgbGVmdCwgcmlnaHQpO1xuXG4gICAgY29uc3QgbmkgPSBkb2N1bWVudC5jcmVhdGVOb2RlSXRlcmF0b3IoXG4gICAgICBhcnRpY2xlLFxuICAgICAgTm9kZUZpbHRlci5TSE9XX0VMRU1FTlQsXG4gICAgICAobm9kZSkgPT4ge1xuICAgICAgICBpZiAoIW5vZGUgfHwgIW5vZGUudGV4dENvbnRlbnQpIHJldHVybiBOb2RlRmlsdGVyLkZJTFRFUl9SRUpFQ1Q7XG4gICAgICAgIHJldHVybiBjb21iaW5lZFJlLnRlc3Qobm9kZS50ZXh0Q29udGVudClcbiAgICAgICAgICA/IE5vZGVGaWx0ZXIuRklMVEVSX0FDQ0VQVFxuICAgICAgICAgIDogTm9kZUZpbHRlci5GSUxURVJfUkVKRUNUO1xuICAgICAgICAvLyBBQ0NFUFQsIFJFSkVDVCBPUiBTS0lQIGJhc2VkIG9uXG4gICAgICAgIC8vIGN1c3RvbSBjcml0ZXJpYVxuICAgICAgfVxuICAgICk7XG5cbiAgICBpZiAoIW5pLnJlZmVyZW5jZU5vZGUpIHRocm93IEVycm9yKFwiUmVmZXJlbmNlIG5vZGUgbm90IGZvdW5kXCIpO1xuXG4gICAgbGV0IGN1cnJlbnQ7XG4gICAgbGV0IGVscyA9IFtdO1xuXG4gICAgd2hpbGUgKChjdXJyZW50ID0gbmkubmV4dE5vZGUoKSkpIHtcbiAgICAgIGVscy5wdXNoKGN1cnJlbnQpO1xuICAgICAgLy8gY29uc3QgcGFyZW50RWwgPSBjdXJyZW50O1xuICAgICAgLy8gY29uc3Qgc3RyID0gY3VycmVudC50ZXh0Q29udGVudDtcblxuICAgICAgLy8gaWYgKCFwYXJlbnRFbCkgdGhyb3cgRXJyb3IoYE5vIHBhcmVudCBlbGVtZW50LCAke2N1cnJlbnR9YCk7XG5cbiAgICAgIC8vIGlmICh0eXBlb2Ygc3RyICE9PSBcInN0cmluZ1wiIHx8ICFzdHIpIHRocm93IEVycm9yKFwiTm90aGluZyB0byBtYXRjaFwiKTtcblxuICAgICAgLy8gY3JlYXRlRm4oZm5SZSwgc3RyLCBwYXJlbnRFbCk7XG5cbiAgICAgIC8vIGNyZWF0ZVJlZihyZWZSZSwgc3RyLCBwYXJlbnRFbCk7XG4gICAgfVxuXG4gICAgY29uc3Qgbm90ZXMgPSBlbHMuc2xpY2UoMSk7XG4gICAgbGV0IGZuOiBzdHJpbmdbXSA9IFtdLFxuICAgICAgcmVmOiBzdHJpbmdbXSA9IFtdO1xuICAgIG5vdGVzLmZvckVhY2goKG5vdGUpID0+IHtcbiAgICAgIGNvbnN0IHN0ciA9IG5vdGUudGV4dENvbnRlbnQ7XG4gICAgICBjb25zdCBwYXJlbnRFbCA9IG5vdGUgYXMgSFRNTEVsZW1lbnQ7XG5cbiAgICAgIGlmICh0eXBlb2Ygc3RyICE9PSBcInN0cmluZ1wiIHx8ICFzdHIpIHRocm93IEVycm9yKFwiTm90aGluZyB0byBtYXRjaFwiKTtcblxuICAgICAgaWYgKCFwYXJlbnRFbCkgdGhyb3cgRXJyb3IoYE5vIHBhcmVudCBlbGVtZW50LCAke25vdGV9YCk7XG5cbiAgICAgIGxldCBmbkNoZWNrID0gY3JlYXRlRm4oZm5SZSwgc3RyLCBwYXJlbnRFbCk7XG5cbiAgICAgIGZuID0gWy4uLmZuLCAuLi5mbkNoZWNrXTtcblxuICAgICAgbGV0IHJlZkNoZWNrID0gY3JlYXRlUmVmKHJlZlJlLCBzdHIsIHBhcmVudEVsKTtcbiAgICAgIHJlZiA9IFsuLi5yZWYsIC4uLnJlZkNoZWNrXTtcbiAgICB9KTtcblxuICAgIGlmIChmbi5sZW5ndGggIT09IHJlZi5sZW5ndGgpIHtcbiAgICAgIGNvbnN0IFttYXgsIG1pbl0gPSBmbi5sZW5ndGggPiByZWYubGVuZ3RoID8gW2ZuLCByZWZdIDogW3JlZiwgZm5dO1xuXG4gICAgICBjb25zdCBtaXNzaW5nID0gbWF4LmZpbHRlcigodmFsKSA9PiAhbWluLmluY2x1ZGVzKHZhbCkpLmpvaW4oXCIsIFwiKTtcblxuICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gKFxuICAgICAgICBmbjogc3RyaW5nW10sXG4gICAgICAgIHJlZjogc3RyaW5nW10sXG4gICAgICAgIG1pc3Npbmc6IHN0cmluZ1xuICAgICAgKTogc3RyaW5nID0+IHtcbiAgICAgICAgcmV0dXJuIGBJdCBsb29rcyBsaWtlIHRoZXJlIGFyZSBtb3JlICR7XG4gICAgICAgICAgZm4ubGVuZ3RoID4gcmVmLmxlbmd0aFxuICAgICAgICAgICAgPyBcImZvb3Rub3RlcyAoXCIgK1xuICAgICAgICAgICAgICBmbi5sZW5ndGggK1xuICAgICAgICAgICAgICBcIilcIiArXG4gICAgICAgICAgICAgIFwiIHRoYW4gcmVmZXJlbmNlcyAoXCIgK1xuICAgICAgICAgICAgICByZWYubGVuZ3RoICtcbiAgICAgICAgICAgICAgXCIpXCJcbiAgICAgICAgICAgIDogXCJyZWZlcmVuY2VzIChcIiArXG4gICAgICAgICAgICAgIHJlZi5sZW5ndGggK1xuICAgICAgICAgICAgICBcIilcIiArXG4gICAgICAgICAgICAgIFwiIHRoYW4gZm9vdG5vdGVzIChcIiArXG4gICAgICAgICAgICAgIGZuLmxlbmd0aCArXG4gICAgICAgICAgICAgIFwiKVwiXG4gICAgICAgIH0uIENoZWNrICR7XG4gICAgICAgICAgZm4ubGVuZ3RoID4gcmVmLmxlbmd0aCA/IFwiZm9vdG5vdGUocylcIiA6IFwicmVmZXJlbmNlKHMpXCJcbiAgICAgICAgfSAke21pc3Npbmd9YDtcbiAgICAgIH07XG4gICAgICB0aHJvdyBFcnJvcihlcnJvck1lc3NhZ2UoZm4sIHJlZiwgbWlzc2luZykpO1xuICAgIH1cbiAgfSBjYXRjaCAoZSkge1xuICAgIGNvbnNvbGUuZXJyb3IoZSk7XG4gIH1cbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztJQVFBLE1BQU0sT0FBTyxHQUFZO0lBQ3ZCLElBQUEsU0FBUyxFQUFFLFNBQVM7SUFDcEIsSUFBQSxRQUFRLEVBQUUsSUFBSTtJQUNkLElBQUEsU0FBUyxFQUFFLElBQUk7SUFDZixJQUFBLFVBQVUsRUFBRSxNQUFNO0lBQ2xCLElBQUEsSUFBSSxFQUFFLE1BQU07S0FDYjs7SUNkRCxNQUFNLE1BQU0sR0FBRyxDQUNiLElBQVksRUFDWixVQUFrQixFQUNsQixLQUFhLEVBQ2IsSUFBWSxFQUNaLEtBQWEsS0FDTDtJQUNSLElBQUEsTUFBTSxNQUFNLEdBQUcsQ0FBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7V0FtQ04sS0FBSyxDQUFBOztBQUVxQyxtREFBQSxFQUFBLFVBQVUsTUFB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
