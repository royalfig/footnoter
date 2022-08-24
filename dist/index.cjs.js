
  /**
   * @license
   * author: Ryan Feigenbaum
   * footnoter.js v1.0.0
   * Released under the MIT license.
   */

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

module.exports = init;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguY2pzLmpzIiwic291cmNlcyI6WyIuLi9zcmMvb3B0aW9ucy50cyIsIi4uL3NyYy9zdHlsZXMudHMiLCIuLi9zcmMvaW5kZXgudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW50ZXJmYWNlIE9wdGlvbnMge1xuICBjb250YWluZXI6IHN0cmluZztcbiAgZm5BbmNob3I6IHN0cmluZztcbiAgcmVmQW5jaG9yOiBzdHJpbmc7XG4gIGJhY2tncm91bmQ6IHN0cmluZztcbiAgdGV4dDogc3RyaW5nO1xufVxuXG5jb25zdCBvcHRpb25zOiBPcHRpb25zID0ge1xuICBjb250YWluZXI6IFwiYXJ0aWNsZVwiLFxuICBmbkFuY2hvcjogXCI+PlwiLFxuICByZWZBbmNob3I6IFwiPDxcIixcbiAgYmFja2dyb3VuZDogXCIjZmZmXCIsXG4gIHRleHQ6IFwiIzAwMFwiLFxufTtcblxuZXhwb3J0IGRlZmF1bHQgb3B0aW9ucztcbiIsImNvbnN0IHN0eWxlcyA9IChcbiAgdGV4dDogc3RyaW5nLFxuICBiYWNrZ3JvdW5kOiBzdHJpbmcsXG4gIHdpZHRoOiBudW1iZXIsXG4gIGxlZnQ6IG51bWJlcixcbiAgcmlnaHQ6IG51bWJlclxuKTogdm9pZCA9PiB7XG4gIGNvbnN0IHN0eWxlcyA9IGBcbiAgICBib2R5IHtcbiAgICB9XG5cdC5mb290bm90ZSB7XG5cdFx0Zm9udC1zaXplOiAxMnB4O1xuXHRcdHRleHQtZGVjb3JhdGlvbjogbm9uZTtcbiAgICAgICAgYm9yZGVyLXJhZGl1czogNTAlO1xuICAgICAgICBwYWRkaW5nOiAwIDRweDtcbiAgICAgICAgZm9udC12YXJpYW50LW51bWVyaWM6IHRhYnVsYXItbnVtcztcbiAgICAgICAgbGVmdDogLTRweDtcbiAgICAgICAgZm9udC13ZWlnaHQ6IDcwMDtcbiAgICAgICAgdmVydGljYWwtYWxpZ246IHRleHQtdG9wO1xuICAgICAgICBjb2xvcjogaW5oZXJpdDtcbiAgICAgICAgc2Nyb2xsLXBhZGRpbmc6IDMwcHg7XG5cdH1cblxuICAgIDp0YXJnZXQge1xuICAgICAgICBtYXJnaW4tdG9wOiAxZW07XG4gICAgfVxuXG4gICAgXG5cbiAgICAuZm9vdG5vdGU6aG92ZXIge1xuICAgICAgICBiYWNrZ3JvdW5kOiByZ2JhKDAgMCAwIC8gLjE1KVxuICAgIH1cblxuXHQucmVmZXJlbmNlLXByZXZpZXcge1xuXHRcdHBvc2l0aW9uOiBhYnNvbHV0ZTtcblx0XHRvcGFjaXR5OiAwO1xuXHRcdHRyYW5zZm9ybTogdHJhbnNsYXRlWSgtMXJlbSk7XG5cdFx0bGVmdDogMDtcbiAgICAgICAgZm9udC13ZWlnaHQ6IDQwMDtcblx0XHRcblx0XHRwb2ludGVyLWV2ZW50czogbm9uZTtcblx0XHRwYWRkaW5nOiAzcmVtIC41cmVtO1xuXHRcdHdpZHRoOiAke3dpZHRofXB4O1xuXHRcdHRyYW5zaXRpb246IC40cztcblx0XHRiYWNrZ3JvdW5kOiBsaW5lYXItZ3JhZGllbnQodG8gdG9wLCB0cmFuc3BhcmVudCwgJHtiYWNrZ3JvdW5kfSwgICR7YmFja2dyb3VuZH0sIHRyYW5zcGFyZW50KTtcblx0XHRcblxuXHR9XG5cblx0LnJlZmVyZW5jZS1jb250ZW50IHtcblx0XHRmb250LXNpemU6IDE1cHg7XG5cdFx0YmFja2dyb3VuZC1jb2xvcjogJHtiYWNrZ3JvdW5kfTtcblx0XHRjb2xvcjogJHt0ZXh0fTtcblx0XHRib3JkZXItcmFkaXVzOiA5cHg7XG5cdFx0cGFkZGluZzogMWVtO1xuXHRcdGJveC1zaGFkb3c6IDAgMTlweCAzOHB4IHJnYmEoMCwwLDAsMC4zMCksIDAgMTVweCAxMnB4IHJnYmEoMCwwLDAsMC4yMik7XG5cblxuXHR9XG5cdFxuXHQuZm9vdG5vdGU6aG92ZXIgLnJlZmVyZW5jZS1wcmV2aWV3IHtcblx0XHRvcGFjaXR5OiAxO1xuXHR9XG4gXG4gICBgO1xuICBjb25zdCBzdHlsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzdHlsZVwiKTtcbiAgc3R5bGUudGV4dENvbnRlbnQgPSBzdHlsZXM7XG4gIGRvY3VtZW50LmhlYWQuYXBwZW5kKHN0eWxlKTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IHN0eWxlcztcbiIsImltcG9ydCBvcHRpb25zIGZyb20gXCIuL29wdGlvbnNcIjtcbmltcG9ydCBzdHlsZXMgZnJvbSBcIi4vc3R5bGVzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGluaXQodXNlck9wdGlvbnM6IHtcbiAgY29udGFpbmVyPzogc3RyaW5nO1xuICBmbkFuY2hvcj86IHN0cmluZztcbiAgcmVmQW5jaG9yPzogc3RyaW5nO1xuICB0ZXh0Pzogc3RyaW5nO1xuICBiYWNrZ3JvdW5kPzogc3RyaW5nO1xufSk6IHZvaWQge1xuICBjb25zdCBjb25maWcgPSB7IC4uLm9wdGlvbnMsIC4uLnVzZXJPcHRpb25zIH07XG4gIGNvbnNvbGUubG9nKGNvbmZpZyk7XG4gIGNvbnN0IHsgY29udGFpbmVyLCBmbkFuY2hvciwgcmVmQW5jaG9yLCB0ZXh0LCBiYWNrZ3JvdW5kIH0gPSBjb25maWc7XG5cbiAgY29uc3QgZm5SRSA9IG5ldyBSZWdFeHAoYCR7Zm5BbmNob3J9KFxcXFxkKylgLCBcImdcIik7XG4gIGNvbnN0IHJlZlJFID0gbmV3IFJlZ0V4cChgJHtyZWZBbmNob3J9KFxcXFxkKylgLCBcImdcIik7XG5cbiAgY29uc3QgYXJ0aWNsZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoY29udGFpbmVyKTtcblxuICBpZiAoIWFydGljbGUpIHRocm93IEVycm9yKFwiTm8gY29udGFpbmVyIGZvdW5kLlwiKTtcblxuICBjb25zdCBjb250YWluZXJTaXplID0gYXJ0aWNsZT8ucXVlcnlTZWxlY3RvcihcInBcIik/LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXG4gIGlmICghY29udGFpbmVyU2l6ZSkgdGhyb3cgRXJyb3IoXCJDYW4ndCBmaW5kIGNvbnRhaW5lciBzaXplXCIpO1xuXG4gIGNvbnN0IHsgd2lkdGgsIGxlZnQsIHJpZ2h0IH0gPSBjb250YWluZXJTaXplO1xuXG4gIHN0eWxlcyh0ZXh0LCBiYWNrZ3JvdW5kLCB3aWR0aCwgbGVmdCwgcmlnaHQpO1xuXG4gIGlmICghYXJ0aWNsZSkgdGhyb3cgRXJyb3IoXCJDb250ZW50IGNvbnRhaW5lciBub3QgZm91bmRcIik7XG5cbiAgY29uc3QgbmkgPSBkb2N1bWVudC5jcmVhdGVOb2RlSXRlcmF0b3IoYXJ0aWNsZSwgTm9kZUZpbHRlci5TSE9XX1RFWFQpO1xuXG4gIGlmICghbmkucmVmZXJlbmNlTm9kZSkgdGhyb3cgRXJyb3IoXCJSZWZlcmVuY2Ugbm9kZSBub3QgZm91bmRcIik7XG5cbiAgbGV0IGN1cnJlbnQ7XG4gIGxldCBjb3VudDtcbiAgY29uc29sZS5sb2cobmkpO1xuICB3aGlsZSAoKGN1cnJlbnQgPSBuaS5uZXh0Tm9kZSgpKSkge1xuICAgIGNvbnN0IHBhcmVudEVsID0gbmkucmVmZXJlbmNlTm9kZS5wYXJlbnRFbGVtZW50O1xuXG4gICAgY29uc3Qgc3RyID0gbmkucmVmZXJlbmNlTm9kZS50ZXh0Q29udGVudDtcblxuICAgIGlmICghcGFyZW50RWwpIHRocm93IEVycm9yKGBObyBwYXJlbnQgZWwsICR7Y3VycmVudH1gKTtcblxuICAgIGlmICh0eXBlb2Ygc3RyICE9PSBcInN0cmluZ1wiIHx8ICFzdHIpIHRocm93IEVycm9yKFwiTm90aGluZyB0byBtYXRjaFwiKTtcblxuICAgIGlmIChmblJFLnRlc3Qoc3RyKSkge1xuICAgICAgY29uc3QgdHJhbnNmb3JtZWRUZXh0ID0gcGFyZW50RWw/LmlubmVyVGV4dC5yZXBsYWNlKFxuICAgICAgICBmblJFLFxuICAgICAgICBgPGEgY2xhc3M9J2Zvb3Rub3RlJyBpZD0nJDEnIGhyZWY9JyNyZWYtJDEnPiQxPC9hPmBcbiAgICAgICk7XG4gICAgICBwYXJlbnRFbC5pbm5lckhUTUwgPSB0cmFuc2Zvcm1lZFRleHQ7XG4gICAgICBwYXJlbnRFbC5zZXRBdHRyaWJ1dGUoXCJzdHlsZVwiLCBcInBvc2l0aW9uOnJlbGF0aXZlO1wiKTtcbiAgICB9XG5cbiAgICBpZiAocmVmUkUudGVzdChzdHIpKSB7XG4gICAgICAvLyBOZWVkIHRvIGVuY29kZS9kZWNvZGUgaHRtbCBlbnRpdGllcyBpbiBjb25maWdcbiAgICAgIGNvbnN0IG1hdGNoZXMgPSBzdHIubWF0Y2gocmVmUkUpO1xuXG4gICAgICBpZiAoIW1hdGNoZXMgfHwgIW1hdGNoZXMubGVuZ3RoKSB0aHJvdyBFcnJvcihcIkNvdWxkbid0IGZpbmQgbWF0Y2hlc1wiKTtcblxuICAgICAgbWF0Y2hlcy5mb3JFYWNoKChtYXRjaCkgPT4ge1xuICAgICAgICBjb25zdCBudW1iZXIgPSAvXFxkLy5leGVjKG1hdGNoKTtcblxuICAgICAgICBpZiAoIW51bWJlcikgdGhyb3cgRXJyb3IoXCJDb3VsZG5gdCBleHRyYWN0IG51bWJlclwiKTtcblxuICAgICAgICBjb25zdCBbbnVtXSA9IG51bWJlcjtcblxuICAgICAgICBjb25zdCBvdXRlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICAgIG91dGVyLnNldEF0dHJpYnV0ZShcImNsYXNzXCIsIFwicmVmZXJlbmNlLXByZXZpZXdcIik7XG4gICAgICAgIGNvbnN0IGlubmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgaW5uZXIuc2V0QXR0cmlidXRlKFwiY2xhc3NcIiwgXCJyZWZlcmVuY2UtY29udGVudFwiKTtcblxuICAgICAgICBpbm5lci5pbm5lckhUTUwgPSBwYXJlbnRFbC5pbm5lckhUTUwucmVwbGFjZSgvJmx0OyZsdDsoXFxkKS9nLCBcIiQxIHwgXCIpO1xuICAgICAgICBvdXRlci5hcHBlbmQoaW5uZXIpO1xuXG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKG51bSk/LmFwcGVuZChvdXRlcik7XG4gICAgICB9KTtcblxuICAgICAgY29uc3QgdHJhbnNmb3JtZWRUZXh0ID0gcGFyZW50RWwuaW5uZXJIVE1MLnJlcGxhY2VBbGwoXG4gICAgICAgIC8mbHQ7Jmx0OyhcXGQpL2csXG4gICAgICAgIFwiJDEuIFwiXG4gICAgICApO1xuICAgICAgY29uc3QgbnVtID0gdHJhbnNmb3JtZWRUZXh0WzBdO1xuICAgICAgcGFyZW50RWwuaWQgPSBgcmVmLSR7bnVtfWA7XG5cbiAgICAgIHBhcmVudEVsLmlubmVySFRNTCA9IGAke3RyYW5zZm9ybWVkVGV4dH0gPGEgaHJlZj1cIiMke251bX1cIj7irow8L2E+YDtcbiAgICB9XG5cbiAgICBjb25zb2xlLmxvZyhjdXJyZW50KTtcbiAgfVxufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFRQSxNQUFNLE9BQU8sR0FBWTtBQUN2QixJQUFBLFNBQVMsRUFBRSxTQUFTO0FBQ3BCLElBQUEsUUFBUSxFQUFFLElBQUk7QUFDZCxJQUFBLFNBQVMsRUFBRSxJQUFJO0FBQ2YsSUFBQSxVQUFVLEVBQUUsTUFBTTtBQUNsQixJQUFBLElBQUksRUFBRSxNQUFNO0NBQ2I7O0FDZEQsTUFBTSxNQUFNLEdBQUcsQ0FDYixJQUFZLEVBQ1osVUFBa0IsRUFDbEIsS0FBYSxFQUNiLElBQVksRUFDWixLQUFhLEtBQ0w7QUFDUixJQUFBLE1BQU0sTUFBTSxHQUFHLENBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1dBbUNOLEtBQUssQ0FBQTs7QUFFcUMsbURBQUEsRUFBQSxVQUFVLE1BQU0sVUFBVSxDQUFBOzs7Ozs7O3NCQU96RCxVQUFVLENBQUE7V0FDckIsSUFBSSxDQUFBOzs7Ozs7Ozs7Ozs7SUFZWCxDQUFDO0lBQ0gsTUFBTSxLQUFLLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUM5QyxJQUFBLEtBQUssQ0FBQyxXQUFXLEdBQUcsTUFBTSxDQUFDO0FBQzNCLElBQUEsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDOUIsQ0FBQzs7QUNqRXVCLFNBQUEsSUFBSSxDQUFDLFdBTTVCLEVBQUE7SUFDQyxNQUFNLE1BQU0sR0FBRyxFQUFFLEdBQUcsT0FBTyxFQUFFLEdBQUcsV0FBVyxFQUFFLENBQUM7QUFDOUMsSUFBQSxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ3BCLElBQUEsTUFBTSxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsR0FBRyxNQUFNLENBQUM7SUFFcEUsTUFBTSxJQUFJLEdBQUcsSUFBSSxNQUFNLENBQUMsQ0FBRyxFQUFBLFFBQVEsQ0FBUSxNQUFBLENBQUEsRUFBRSxHQUFHLENBQUMsQ0FBQztJQUNsRCxNQUFNLEtBQUssR0FBRyxJQUFJLE1BQU0sQ0FBQyxDQUFHLEVBQUEsU0FBUyxDQUFRLE1BQUEsQ0FBQSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBRXBELE1BQU0sT0FBTyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLENBQUM7QUFFbEQsSUFBQSxJQUFJLENBQUMsT0FBTztBQUFFLFFBQUEsTUFBTSxLQUFLLENBQUMscUJBQXFCLENBQUMsQ0FBQztJQUVqRCxNQUFNLGFBQWEsR0FBRyxPQUFPLEVBQUUsYUFBYSxDQUFDLEdBQUcsQ0FBQyxFQUFFLHFCQUFxQixFQUFFLENBQUM7QUFFM0UsSUFBQSxJQUFJLENBQUMsYUFBYTtBQUFFLFFBQUEsTUFBTSxLQUFLLENBQUMsMkJBQTJCLENBQUMsQ0FBQztJQUU3RCxNQUFNLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsR0FBRyxhQUFhLENBQUM7SUFFN0MsTUFBTSxDQUFDLElBQUksRUFBRSxVQUFVLEVBQUUsS0FBa0IsQ0FBQyxDQUFDO0FBRTdDLElBQUEsSUFBSSxDQUFDLE9BQU87QUFBRSxRQUFBLE1BQU0sS0FBSyxDQUFDLDZCQUE2QixDQUFDLENBQUM7QUFFekQsSUFBQSxNQUFNLEVBQUUsR0FBRyxRQUFRLENBQUMsa0JBQWtCLENBQUMsT0FBTyxFQUFFLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUV0RSxJQUFJLENBQUMsRUFBRSxDQUFDLGFBQWE7QUFBRSxRQUFBLE1BQU0sS0FBSyxDQUFDLDBCQUEwQixDQUFDLENBQUM7QUFFL0QsSUFBQSxJQUFJLE9BQU8sQ0FBQztBQUVaLElBQUEsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUNoQixRQUFRLE9BQU8sR0FBRyxFQUFFLENBQUMsUUFBUSxFQUFFLEdBQUc7QUFDaEMsUUFBQSxNQUFNLFFBQVEsR0FBRyxFQUFFLENBQUMsYUFBYSxDQUFDLGFBQWEsQ0FBQztBQUVoRCxRQUFBLE1BQU0sR0FBRyxHQUFHLEVBQUUsQ0FBQyxhQUFhLENBQUMsV0FBVyxDQUFDO0FBRXpDLFFBQUEsSUFBSSxDQUFDLFFBQVE7QUFBRSxZQUFBLE1BQU0sS0FBSyxDQUFDLENBQUEsY0FBQSxFQUFpQixPQUFPLENBQUEsQ0FBRSxDQUFDLENBQUM7QUFFdkQsUUFBQSxJQUFJLE9BQU8sR0FBRyxLQUFLLFFBQVEsSUFBSSxDQUFDLEdBQUc7QUFBRSxZQUFBLE1BQU0sS0FBSyxDQUFDLGtCQUFrQixDQUFDLENBQUM7QUFFckUsUUFBQSxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUU7QUFDbEIsWUFBQSxNQUFNLGVBQWUsR0FBRyxRQUFRLEVBQUUsU0FBUyxDQUFDLE9BQU8sQ0FDakQsSUFBSSxFQUNKLENBQW1ELGlEQUFBLENBQUEsQ0FDcEQsQ0FBQztBQUNGLFlBQUEsUUFBUSxDQUFDLFNBQVMsR0FBRyxlQUFlLENBQUM7QUFDckMsWUFBQSxRQUFRLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxvQkFBb0IsQ0FBQyxDQUFDO0FBQ3RELFNBQUE7QUFFRCxRQUFBLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRTs7WUFFbkIsTUFBTSxPQUFPLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUVqQyxZQUFBLElBQUksQ0FBQyxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTTtBQUFFLGdCQUFBLE1BQU0sS0FBSyxDQUFDLHVCQUF1QixDQUFDLENBQUM7QUFFdEUsWUFBQSxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsS0FBSyxLQUFJO2dCQUN4QixNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBRWhDLGdCQUFBLElBQUksQ0FBQyxNQUFNO0FBQUUsb0JBQUEsTUFBTSxLQUFLLENBQUMseUJBQXlCLENBQUMsQ0FBQztBQUVwRCxnQkFBQSxNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsTUFBTSxDQUFDO2dCQUVyQixNQUFNLEtBQUssR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQzVDLGdCQUFBLEtBQUssQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLG1CQUFtQixDQUFDLENBQUM7Z0JBQ2pELE1BQU0sS0FBSyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDNUMsZ0JBQUEsS0FBSyxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsbUJBQW1CLENBQUMsQ0FBQztBQUVqRCxnQkFBQSxLQUFLLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLGVBQWUsRUFBRSxPQUFPLENBQUMsQ0FBQztBQUN2RSxnQkFBQSxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUVwQixRQUFRLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUM5QyxhQUFDLENBQUMsQ0FBQztBQUVILFlBQUEsTUFBTSxlQUFlLEdBQUcsUUFBUSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQ25ELGVBQWUsRUFDZixNQUFNLENBQ1AsQ0FBQztBQUNGLFlBQUEsTUFBTSxHQUFHLEdBQUcsZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQy9CLFlBQUEsUUFBUSxDQUFDLEVBQUUsR0FBRyxDQUFPLElBQUEsRUFBQSxHQUFHLEVBQUUsQ0FBQztZQUUzQixRQUFRLENBQUMsU0FBUyxHQUFHLENBQUEsRUFBRyxlQUFlLENBQWMsV0FBQSxFQUFBLEdBQUcsU0FBUyxDQUFDO0FBQ25FLFNBQUE7QUFFRCxRQUFBLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDdEIsS0FBQTtBQUNIOzs7OyJ9
