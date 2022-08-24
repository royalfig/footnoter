
  /**
   * @license
   * author: Ryan Feigenbaum
   * footnoter.js v1.0.0
   * Released under the MIT license.
   */

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
 
   `;
    const style = document.createElement("style");
    style.textContent = styles;
    document.head.append(style);
};

function init(userOptions) {
    const config = { ...options, ...userOptions };
    console.log(config);
    const { container, fnAnchor, refAnchor, text, background } = config;
    const fnRE = new RegExp(`${fnAnchor}(\\d+)`, "g");
    const refRE = new RegExp(`${refAnchor}(\\d+)`, "g");
    const article = document.querySelector(container);
    if (!article)
        throw Error("No container found.");
    const containerSize = article?.querySelector("p")?.getBoundingClientRect();
    if (!containerSize)
        throw Error("Can't find container size");
    const { width, left, right } = containerSize;
    styles(text, background, width);
    if (!article)
        throw Error("Content container not found");
    const ni = document.createNodeIterator(article, NodeFilter.SHOW_TEXT);
    if (!ni.referenceNode)
        throw Error("Reference node not found");
    let current;
    console.log(ni);
    while ((current = ni.nextNode())) {
        const parentEl = ni.referenceNode.parentElement;
        const str = ni.referenceNode.textContent;
        if (!parentEl)
            throw Error(`No parent el, ${current}`);
        if (typeof str !== "string" || !str)
            throw Error("Nothing to match");
        if (fnRE.test(str)) {
            const transformedText = parentEl?.innerText.replace(fnRE, `<a class='footnote' id='$1' href='#ref-$1'>$1</a>`);
            parentEl.innerHTML = transformedText;
            parentEl.setAttribute("style", "position:relative;");
        }
        if (refRE.test(str)) {
            // Need to encode/decode html entities in config
            const matches = str.match(refRE);
            if (!matches || !matches.length)
                throw Error("Couldn't find matches");
            matches.forEach((match) => {
                const number = /\d/.exec(match);
                if (!number)
                    throw Error("Couldn`t extract number");
                const [num] = number;
                const outer = document.createElement("div");
                outer.setAttribute("class", "reference-preview");
                const inner = document.createElement("div");
                inner.setAttribute("class", "reference-content");
                inner.innerHTML = parentEl.innerHTML.replace(/&lt;&lt;(\d)/g, "$1 | ");
                outer.append(inner);
                document.getElementById(num)?.append(outer);
            });
            const transformedText = parentEl.innerHTML.replaceAll(/&lt;&lt;(\d)/g, "$1. ");
            const num = transformedText[0];
            parentEl.id = `ref-${num}`;
            parentEl.innerHTML = `${transformedText} <a href="#${num}">⮌</a>`;
        }
        console.log(current);
    }
}

export { init as default };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguZXMuanMiLCJzb3VyY2VzIjpbIi4uL3NyYy9vcHRpb25zLnRzIiwiLi4vc3JjL3N0eWxlcy50cyIsIi4uL3NyYy9pbmRleC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbnRlcmZhY2UgT3B0aW9ucyB7XG4gIGNvbnRhaW5lcjogc3RyaW5nO1xuICBmbkFuY2hvcjogc3RyaW5nO1xuICByZWZBbmNob3I6IHN0cmluZztcbiAgYmFja2dyb3VuZDogc3RyaW5nO1xuICB0ZXh0OiBzdHJpbmc7XG59XG5cbmNvbnN0IG9wdGlvbnM6IE9wdGlvbnMgPSB7XG4gIGNvbnRhaW5lcjogXCJhcnRpY2xlXCIsXG4gIGZuQW5jaG9yOiBcIj4+XCIsXG4gIHJlZkFuY2hvcjogXCI8PFwiLFxuICBiYWNrZ3JvdW5kOiBcIiNmZmZcIixcbiAgdGV4dDogXCIjMDAwXCIsXG59O1xuXG5leHBvcnQgZGVmYXVsdCBvcHRpb25zO1xuIiwiY29uc3Qgc3R5bGVzID0gKFxuICB0ZXh0OiBzdHJpbmcsXG4gIGJhY2tncm91bmQ6IHN0cmluZyxcbiAgd2lkdGg6IG51bWJlcixcbiAgbGVmdDogbnVtYmVyLFxuICByaWdodDogbnVtYmVyXG4pOiB2b2lkID0+IHtcbiAgY29uc3Qgc3R5bGVzID0gYFxuICAgIGJvZHkge1xuICAgIH1cblx0LmZvb3Rub3RlIHtcblx0XHRmb250LXNpemU6IDEycHg7XG5cdFx0dGV4dC1kZWNvcmF0aW9uOiBub25lO1xuICAgICAgICBib3JkZXItcmFkaXVzOiA1MCU7XG4gICAgICAgIHBhZGRpbmc6IDAgNHB4O1xuICAgICAgICBmb250LXZhcmlhbnQtbnVtZXJpYzogdGFidWxhci1udW1zO1xuICAgICAgICBsZWZ0OiAtNHB4O1xuICAgICAgICBmb250LXdlaWdodDogNzAwO1xuICAgICAgICB2ZXJ0aWNhbC1hbGlnbjogdGV4dC10b3A7XG4gICAgICAgIGNvbG9yOiBpbmhlcml0O1xuICAgICAgICBzY3JvbGwtcGFkZGluZzogMzBweDtcblx0fVxuXG4gICAgOnRhcmdldCB7XG4gICAgICAgIG1hcmdpbi10b3A6IDFlbTtcbiAgICB9XG5cbiAgICBcblxuICAgIC5mb290bm90ZTpob3ZlciB7XG4gICAgICAgIGJhY2tncm91bmQ6IHJnYmEoMCAwIDAgLyAuMTUpXG4gICAgfVxuXG5cdC5yZWZlcmVuY2UtcHJldmlldyB7XG5cdFx0cG9zaXRpb246IGFic29sdXRlO1xuXHRcdG9wYWNpdHk6IDA7XG5cdFx0dHJhbnNmb3JtOiB0cmFuc2xhdGVZKC0xcmVtKTtcblx0XHRsZWZ0OiAwO1xuICAgICAgICBmb250LXdlaWdodDogNDAwO1xuXHRcdFxuXHRcdHBvaW50ZXItZXZlbnRzOiBub25lO1xuXHRcdHBhZGRpbmc6IDNyZW0gLjVyZW07XG5cdFx0d2lkdGg6ICR7d2lkdGh9cHg7XG5cdFx0dHJhbnNpdGlvbjogLjRzO1xuXHRcdGJhY2tncm91bmQ6IGxpbmVhci1ncmFkaWVudCh0byB0b3AsIHRyYW5zcGFyZW50LCAke2JhY2tncm91bmR9LCAgJHtiYWNrZ3JvdW5kfSwgdHJhbnNwYXJlbnQpO1xuXHRcdFxuXG5cdH1cblxuXHQucmVmZXJlbmNlLWNvbnRlbnQge1xuXHRcdGZvbnQtc2l6ZTogMTVweDtcblx0XHRiYWNrZ3JvdW5kLWNvbG9yOiAke2JhY2tncm91bmR9O1xuXHRcdGNvbG9yOiAke3RleHR9O1xuXHRcdGJvcmRlci1yYWRpdXM6IDlweDtcblx0XHRwYWRkaW5nOiAxZW07XG5cdFx0Ym94LXNoYWRvdzogMCAxOXB4IDM4cHggcmdiYSgwLDAsMCwwLjMwKSwgMCAxNXB4IDEycHggcmdiYSgwLDAsMCwwLjIyKTtcblxuXG5cdH1cblx0XG5cdC5mb290bm90ZTpob3ZlciAucmVmZXJlbmNlLXByZXZpZXcge1xuXHRcdG9wYWNpdHk6IDE7XG5cdH1cbiBcbiAgIGA7XG4gIGNvbnN0IHN0eWxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInN0eWxlXCIpO1xuICBzdHlsZS50ZXh0Q29udGVudCA9IHN0eWxlcztcbiAgZG9jdW1lbnQuaGVhZC5hcHBlbmQoc3R5bGUpO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgc3R5bGVzO1xuIiwiaW1wb3J0IG9wdGlvbnMgZnJvbSBcIi4vb3B0aW9uc1wiO1xuaW1wb3J0IHN0eWxlcyBmcm9tIFwiLi9zdHlsZXNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gaW5pdCh1c2VyT3B0aW9uczoge1xuICBjb250YWluZXI/OiBzdHJpbmc7XG4gIGZuQW5jaG9yPzogc3RyaW5nO1xuICByZWZBbmNob3I/OiBzdHJpbmc7XG4gIHRleHQ/OiBzdHJpbmc7XG4gIGJhY2tncm91bmQ/OiBzdHJpbmc7XG59KTogdm9pZCB7XG4gIGNvbnN0IGNvbmZpZyA9IHsgLi4ub3B0aW9ucywgLi4udXNlck9wdGlvbnMgfTtcbiAgY29uc29sZS5sb2coY29uZmlnKTtcbiAgY29uc3QgeyBjb250YWluZXIsIGZuQW5jaG9yLCByZWZBbmNob3IsIHRleHQsIGJhY2tncm91bmQgfSA9IGNvbmZpZztcblxuICBjb25zdCBmblJFID0gbmV3IFJlZ0V4cChgJHtmbkFuY2hvcn0oXFxcXGQrKWAsIFwiZ1wiKTtcbiAgY29uc3QgcmVmUkUgPSBuZXcgUmVnRXhwKGAke3JlZkFuY2hvcn0oXFxcXGQrKWAsIFwiZ1wiKTtcblxuICBjb25zdCBhcnRpY2xlID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcihjb250YWluZXIpO1xuXG4gIGlmICghYXJ0aWNsZSkgdGhyb3cgRXJyb3IoXCJObyBjb250YWluZXIgZm91bmQuXCIpO1xuXG4gIGNvbnN0IGNvbnRhaW5lclNpemUgPSBhcnRpY2xlPy5xdWVyeVNlbGVjdG9yKFwicFwiKT8uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG5cbiAgaWYgKCFjb250YWluZXJTaXplKSB0aHJvdyBFcnJvcihcIkNhbid0IGZpbmQgY29udGFpbmVyIHNpemVcIik7XG5cbiAgY29uc3QgeyB3aWR0aCwgbGVmdCwgcmlnaHQgfSA9IGNvbnRhaW5lclNpemU7XG5cbiAgc3R5bGVzKHRleHQsIGJhY2tncm91bmQsIHdpZHRoLCBsZWZ0LCByaWdodCk7XG5cbiAgaWYgKCFhcnRpY2xlKSB0aHJvdyBFcnJvcihcIkNvbnRlbnQgY29udGFpbmVyIG5vdCBmb3VuZFwiKTtcblxuICBjb25zdCBuaSA9IGRvY3VtZW50LmNyZWF0ZU5vZGVJdGVyYXRvcihhcnRpY2xlLCBOb2RlRmlsdGVyLlNIT1dfVEVYVCk7XG5cbiAgaWYgKCFuaS5yZWZlcmVuY2VOb2RlKSB0aHJvdyBFcnJvcihcIlJlZmVyZW5jZSBub2RlIG5vdCBmb3VuZFwiKTtcblxuICBsZXQgY3VycmVudDtcbiAgbGV0IGNvdW50O1xuICBjb25zb2xlLmxvZyhuaSk7XG4gIHdoaWxlICgoY3VycmVudCA9IG5pLm5leHROb2RlKCkpKSB7XG4gICAgY29uc3QgcGFyZW50RWwgPSBuaS5yZWZlcmVuY2VOb2RlLnBhcmVudEVsZW1lbnQ7XG5cbiAgICBjb25zdCBzdHIgPSBuaS5yZWZlcmVuY2VOb2RlLnRleHRDb250ZW50O1xuXG4gICAgaWYgKCFwYXJlbnRFbCkgdGhyb3cgRXJyb3IoYE5vIHBhcmVudCBlbCwgJHtjdXJyZW50fWApO1xuXG4gICAgaWYgKHR5cGVvZiBzdHIgIT09IFwic3RyaW5nXCIgfHwgIXN0cikgdGhyb3cgRXJyb3IoXCJOb3RoaW5nIHRvIG1hdGNoXCIpO1xuXG4gICAgaWYgKGZuUkUudGVzdChzdHIpKSB7XG4gICAgICBjb25zdCB0cmFuc2Zvcm1lZFRleHQgPSBwYXJlbnRFbD8uaW5uZXJUZXh0LnJlcGxhY2UoXG4gICAgICAgIGZuUkUsXG4gICAgICAgIGA8YSBjbGFzcz0nZm9vdG5vdGUnIGlkPSckMScgaHJlZj0nI3JlZi0kMSc+JDE8L2E+YFxuICAgICAgKTtcbiAgICAgIHBhcmVudEVsLmlubmVySFRNTCA9IHRyYW5zZm9ybWVkVGV4dDtcbiAgICAgIHBhcmVudEVsLnNldEF0dHJpYnV0ZShcInN0eWxlXCIsIFwicG9zaXRpb246cmVsYXRpdmU7XCIpO1xuICAgIH1cblxuICAgIGlmIChyZWZSRS50ZXN0KHN0cikpIHtcbiAgICAgIC8vIE5lZWQgdG8gZW5jb2RlL2RlY29kZSBodG1sIGVudGl0aWVzIGluIGNvbmZpZ1xuICAgICAgY29uc3QgbWF0Y2hlcyA9IHN0ci5tYXRjaChyZWZSRSk7XG5cbiAgICAgIGlmICghbWF0Y2hlcyB8fCAhbWF0Y2hlcy5sZW5ndGgpIHRocm93IEVycm9yKFwiQ291bGRuJ3QgZmluZCBtYXRjaGVzXCIpO1xuXG4gICAgICBtYXRjaGVzLmZvckVhY2goKG1hdGNoKSA9PiB7XG4gICAgICAgIGNvbnN0IG51bWJlciA9IC9cXGQvLmV4ZWMobWF0Y2gpO1xuXG4gICAgICAgIGlmICghbnVtYmVyKSB0aHJvdyBFcnJvcihcIkNvdWxkbmB0IGV4dHJhY3QgbnVtYmVyXCIpO1xuXG4gICAgICAgIGNvbnN0IFtudW1dID0gbnVtYmVyO1xuXG4gICAgICAgIGNvbnN0IG91dGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgb3V0ZXIuc2V0QXR0cmlidXRlKFwiY2xhc3NcIiwgXCJyZWZlcmVuY2UtcHJldmlld1wiKTtcbiAgICAgICAgY29uc3QgaW5uZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICBpbm5lci5zZXRBdHRyaWJ1dGUoXCJjbGFzc1wiLCBcInJlZmVyZW5jZS1jb250ZW50XCIpO1xuXG4gICAgICAgIGlubmVyLmlubmVySFRNTCA9IHBhcmVudEVsLmlubmVySFRNTC5yZXBsYWNlKC8mbHQ7Jmx0OyhcXGQpL2csIFwiJDEgfCBcIik7XG4gICAgICAgIG91dGVyLmFwcGVuZChpbm5lcik7XG5cbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQobnVtKT8uYXBwZW5kKG91dGVyKTtcbiAgICAgIH0pO1xuXG4gICAgICBjb25zdCB0cmFuc2Zvcm1lZFRleHQgPSBwYXJlbnRFbC5pbm5lckhUTUwucmVwbGFjZUFsbChcbiAgICAgICAgLyZsdDsmbHQ7KFxcZCkvZyxcbiAgICAgICAgXCIkMS4gXCJcbiAgICAgICk7XG4gICAgICBjb25zdCBudW0gPSB0cmFuc2Zvcm1lZFRleHRbMF07XG4gICAgICBwYXJlbnRFbC5pZCA9IGByZWYtJHtudW19YDtcblxuICAgICAgcGFyZW50RWwuaW5uZXJIVE1MID0gYCR7dHJhbnNmb3JtZWRUZXh0fSA8YSBocmVmPVwiIyR7bnVtfVwiPuKujDwvYT5gO1xuICAgIH1cblxuICAgIGNvbnNvbGUubG9nKGN1cnJlbnQpO1xuICB9XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFRQSxNQUFNLE9BQU8sR0FBWTtBQUN2QixJQUFBLFNBQVMsRUFBRSxTQUFTO0FBQ3BCLElBQUEsUUFBUSxFQUFFLElBQUk7QUFDZCxJQUFBLFNBQVMsRUFBRSxJQUFJO0FBQ2YsSUFBQSxVQUFVLEVBQUUsTUFBTTtBQUNsQixJQUFBLElBQUksRUFBRSxNQUFNO0NBQ2I7O0FDZEQsTUFBTSxNQUFNLEdBQUcsQ0FDYixJQUFZLEVBQ1osVUFBa0IsRUFDbEIsS0FBYSxFQUNiLElBQVksRUFDWixLQUFhLEtBQ0w7QUFDUixJQUFBLE1BQU0sTUFBTSxHQUFHLENBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1dBbUNOLEtBQUssQ0FBQTs7QUFFcUMsbURBQUEsRUFBQSxVQUFVLE1BQU0sVUFBVSxDQUFBOzs7Ozs7O3NCQU96RCxVQUFVLENBQUE7V0FDckIsSUFBSSxDQUFBOzs7Ozs7Ozs7Ozs7SUFZWCxDQUFDO0lBQ0gsTUFBTSxLQUFLLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUM5QyxJQUFBLEtBQUssQ0FBQyxXQUFXLEdBQUcsTUFBTSxDQUFDO0FBQzNCLElBQUEsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDOUIsQ0FBQzs7QUNqRXVCLFNBQUEsSUFBSSxDQUFDLFdBTTVCLEVBQUE7SUFDQyxNQUFNLE1BQU0sR0FBRyxFQUFFLEdBQUcsT0FBTyxFQUFFLEdBQUcsV0FBVyxFQUFFLENBQUM7QUFDOUMs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
