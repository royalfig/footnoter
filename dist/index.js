
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

    const styles = (text, background) => {
        const styles = `.footnote {position:relative} 
 .reference-preview {
	position: absolute;
	opacity: 0;
	bottom: -2em;
	left: 0;
	transform: translateY(100%);
	pointer-events: none;
	background-color: ${background};
	color: ${text};
	padding: 1em;
	border-radius: 9px;
	box-shadow: 2px 2px 5px 10px rgb(0 0 0 / .75), 5px 5px 2rem 15px rgb(0 0 0 / .35);
	width: 50vw;
	font-size: 15px;
	transition: .4s;

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
        const { container, fnAnchor, refAnchor, text, background } = config;
        styles(text, background);
        const fnRE = new RegExp(`${fnAnchor}(\\d)`, "g");
        const refRE = new RegExp(`${refAnchor}(\\d)`, "g");
        console.log(fnRE);
        const article = document.querySelector(container);
        if (!article)
            throw Error("Content container not found");
        const ni = document.createNodeIterator(article, NodeFilter.SHOW_TEXT);
        if (!ni.referenceNode)
            throw Error("Reference node not found");
        let current;
        let nodes = [];
        while ((current = ni.nextNode())) {
            const parentEl = ni.referenceNode.parentElement;
            const str = ni.referenceNode.textContent;
            if (!parentEl)
                return;
            // console.log(str, current);
            if (typeof str !== "string" || !str)
                throw Error("Nothing to match");
            if (fnRE.test(str)) {
                const transformedText = parentEl?.innerText.replace(fnRE, "<a class='footnote' id='$1' href='#ref-$1'><sup>$1</sup></a>");
                parentEl.innerHTML = transformedText;
            }
            if (refRE.test(str)) {
                // Need to encode/decode html entities in config
                const transformedText = parentEl.innerHTML.replaceAll(/&lt;&lt;(\d)/g, '<a href="#$1" id="ref-$1">$1</a>');
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

    return init;

})();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uL3NyYy9vcHRpb25zLnRzIiwiLi4vc3JjL3N0eWxlcy50cyIsIi4uL3NyYy9pbmRleC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbnRlcmZhY2UgT3B0aW9ucyB7XG4gIGNvbnRhaW5lcjogc3RyaW5nO1xuICBmbkFuY2hvcjogc3RyaW5nO1xuICByZWZBbmNob3I6IHN0cmluZztcbiAgYmFja2dyb3VuZDogc3RyaW5nO1xuICB0ZXh0OiBzdHJpbmc7XG59XG5cbmNvbnN0IG9wdGlvbnM6IE9wdGlvbnMgPSB7XG4gIGNvbnRhaW5lcjogXCJhcnRpY2xlXCIsXG4gIGZuQW5jaG9yOiBcIj4+XCIsXG4gIHJlZkFuY2hvcjogXCI8PFwiLFxuICBiYWNrZ3JvdW5kOiBcIiNmZmZcIixcbiAgdGV4dDogXCIjMDAwXCIsXG59O1xuXG5leHBvcnQgZGVmYXVsdCBvcHRpb25zO1xuIiwiY29uc3Qgc3R5bGVzID0gKHRleHQ6IHN0cmluZywgYmFja2dyb3VuZDogc3RyaW5nKTogdm9pZCA9PiB7XG4gIGNvbnN0IHN0eWxlcyA9IGAuZm9vdG5vdGUge3Bvc2l0aW9uOnJlbGF0aXZlfSBcbiAucmVmZXJlbmNlLXByZXZpZXcge1xuXHRwb3NpdGlvbjogYWJzb2x1dGU7XG5cdG9wYWNpdHk6IDA7XG5cdGJvdHRvbTogLTJlbTtcblx0bGVmdDogMDtcblx0dHJhbnNmb3JtOiB0cmFuc2xhdGVZKDEwMCUpO1xuXHRwb2ludGVyLWV2ZW50czogbm9uZTtcblx0YmFja2dyb3VuZC1jb2xvcjogJHtiYWNrZ3JvdW5kfTtcblx0Y29sb3I6ICR7dGV4dH07XG5cdHBhZGRpbmc6IDFlbTtcblx0Ym9yZGVyLXJhZGl1czogOXB4O1xuXHRib3gtc2hhZG93OiAycHggMnB4IDVweCAxMHB4IHJnYigwIDAgMCAvIC43NSksIDVweCA1cHggMnJlbSAxNXB4IHJnYigwIDAgMCAvIC4zNSk7XG5cdHdpZHRoOiA1MHZ3O1xuXHRmb250LXNpemU6IDE1cHg7XG5cdHRyYW5zaXRpb246IC40cztcblxuIH1cbiAgIFxuIC5mb290bm90ZTpob3ZlciAucmVmZXJlbmNlLXByZXZpZXcge1xuXHRvcGFjaXR5OiAxO1xuIH1cbiBcbiAgIGA7XG4gIGNvbnN0IHN0eWxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInN0eWxlXCIpO1xuICBzdHlsZS50ZXh0Q29udGVudCA9IHN0eWxlcztcbiAgZG9jdW1lbnQuaGVhZC5hcHBlbmQoc3R5bGUpO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgc3R5bGVzO1xuIiwiaW1wb3J0IG9wdGlvbnMgZnJvbSBcIi4vb3B0aW9uc1wiO1xuaW1wb3J0IHN0eWxlcyBmcm9tIFwiLi9zdHlsZXNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gaW5pdCh1c2VyT3B0aW9uczoge1xuICBjb250YWluZXI/OiBzdHJpbmc7XG4gIGZuQW5jaG9yPzogc3RyaW5nO1xuICByZWZBbmNob3I/OiBzdHJpbmc7XG4gIHRleHQ/OiBzdHJpbmc7XG4gIGJhY2tncm91bmQ/OiBzdHJpbmc7XG59KTogdm9pZCB7XG4gIGNvbnN0IGNvbmZpZyA9IHsgLi4ub3B0aW9ucywgLi4udXNlck9wdGlvbnMgfTtcblxuICBjb25zdCB7IGNvbnRhaW5lciwgZm5BbmNob3IsIHJlZkFuY2hvciwgdGV4dCwgYmFja2dyb3VuZCB9ID0gY29uZmlnO1xuICBzdHlsZXModGV4dCwgYmFja2dyb3VuZCk7XG5cbiAgY29uc3QgZm5SRSA9IG5ldyBSZWdFeHAoYCR7Zm5BbmNob3J9KFxcXFxkKWAsIFwiZ1wiKTtcbiAgY29uc3QgcmVmUkUgPSBuZXcgUmVnRXhwKGAke3JlZkFuY2hvcn0oXFxcXGQpYCwgXCJnXCIpO1xuICBjb25zb2xlLmxvZyhmblJFKTtcbiAgY29uc3QgYXJ0aWNsZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoY29udGFpbmVyKTtcblxuICBpZiAoIWFydGljbGUpIHRocm93IEVycm9yKFwiQ29udGVudCBjb250YWluZXIgbm90IGZvdW5kXCIpO1xuXG4gIGNvbnN0IG5pID0gZG9jdW1lbnQuY3JlYXRlTm9kZUl0ZXJhdG9yKGFydGljbGUsIE5vZGVGaWx0ZXIuU0hPV19URVhUKTtcblxuICBpZiAoIW5pLnJlZmVyZW5jZU5vZGUpIHRocm93IEVycm9yKFwiUmVmZXJlbmNlIG5vZGUgbm90IGZvdW5kXCIpO1xuXG4gIGxldCBjdXJyZW50O1xuXG4gIGxldCBub2RlcyA9IFtdO1xuXG4gIHdoaWxlICgoY3VycmVudCA9IG5pLm5leHROb2RlKCkpKSB7XG4gICAgY29uc3QgcGFyZW50RWwgPSBuaS5yZWZlcmVuY2VOb2RlLnBhcmVudEVsZW1lbnQ7XG5cbiAgICBjb25zdCBzdHIgPSBuaS5yZWZlcmVuY2VOb2RlLnRleHRDb250ZW50O1xuICAgIGlmICghcGFyZW50RWwpIHJldHVybjtcblxuICAgIC8vIGNvbnNvbGUubG9nKHN0ciwgY3VycmVudCk7XG5cbiAgICBpZiAodHlwZW9mIHN0ciAhPT0gXCJzdHJpbmdcIiB8fCAhc3RyKSB0aHJvdyBFcnJvcihcIk5vdGhpbmcgdG8gbWF0Y2hcIik7XG5cbiAgICBpZiAoZm5SRS50ZXN0KHN0cikpIHtcbiAgICAgIGNvbnN0IHRyYW5zZm9ybWVkVGV4dCA9IHBhcmVudEVsPy5pbm5lclRleHQucmVwbGFjZShcbiAgICAgICAgZm5SRSxcbiAgICAgICAgXCI8YSBjbGFzcz0nZm9vdG5vdGUnIGlkPSckMScgaHJlZj0nI3JlZi0kMSc+PHN1cD4kMTwvc3VwPjwvYT5cIlxuICAgICAgKTtcbiAgICAgIHBhcmVudEVsLmlubmVySFRNTCA9IHRyYW5zZm9ybWVkVGV4dDtcbiAgICB9XG5cbiAgICBpZiAocmVmUkUudGVzdChzdHIpKSB7XG4gICAgICAvLyBOZWVkIHRvIGVuY29kZS9kZWNvZGUgaHRtbCBlbnRpdGllcyBpbiBjb25maWdcbiAgICAgIGNvbnN0IHRyYW5zZm9ybWVkVGV4dCA9IHBhcmVudEVsLmlubmVySFRNTC5yZXBsYWNlQWxsKFxuICAgICAgICAvJmx0OyZsdDsoXFxkKS9nLFxuICAgICAgICAnPGEgaHJlZj1cIiMkMVwiIGlkPVwicmVmLSQxXCI+JDE8L2E+J1xuICAgICAgKTtcbiAgICAgIGNvbnNvbGUubG9nKHRyYW5zZm9ybWVkVGV4dCk7XG4gICAgICBwYXJlbnRFbC5pbm5lckhUTUwgPSB0cmFuc2Zvcm1lZFRleHQ7XG4gICAgICBjb25zdCBtYXRjaGVzID0gc3RyLm1hdGNoKHJlZlJFKTtcblxuICAgICAgbWF0Y2hlcy5mb3JFYWNoKChtYXRjaCkgPT4ge1xuICAgICAgICBjb25zdCBbbnVtXSA9IC9cXGQvLmV4ZWMobWF0Y2gpO1xuXG4gICAgICAgIGNvbnN0IHNwYW4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3BhblwiKTtcbiAgICAgICAgc3Bhbi5zZXRBdHRyaWJ1dGUoXCJjbGFzc1wiLCBcInJlZmVyZW5jZS1wcmV2aWV3XCIpO1xuICAgICAgICBzcGFuLmlubmVySFRNTCA9IHBhcmVudEVsLmlubmVySFRNTC5yZXBsYWNlKG51bSArIFwiIFwiLCBcIlwiKTtcblxuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChudW0pPy5hcHBlbmQoc3Bhbik7XG4gICAgICB9KTtcbiAgICB9XG4gICAgbm9kZXMucHVzaChjdXJyZW50KTtcbiAgfVxuICBjb25zb2xlLmxvZyhub2Rlcyk7XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7SUFRQSxNQUFNLE9BQU8sR0FBWTtJQUN2QixJQUFBLFNBQVMsRUFBRSxTQUFTO0lBQ3BCLElBQUEsUUFBUSxFQUFFLElBQUk7SUFDZCxJQUFBLFNBQVMsRUFBRSxJQUFJO0lBQ2YsSUFBQSxVQUFVLEVBQUUsTUFBTTtJQUNsQixJQUFBLElBQUksRUFBRSxNQUFNO0tBQ2I7O0lDZEQsTUFBTSxNQUFNLEdBQUcsQ0FBQyxJQUFZLEVBQUUsVUFBa0IsS0FBVTtJQUN4RCxJQUFBLE1BQU0sTUFBTSxHQUFHLENBQUE7Ozs7Ozs7O3FCQVFJLFVBQVUsQ0FBQTtVQUNyQixJQUFJLENBQUE7Ozs7Ozs7Ozs7Ozs7O0lBY1Ys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
