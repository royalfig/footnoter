const styles = (text: string, background: string): void => {
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

export default styles;
