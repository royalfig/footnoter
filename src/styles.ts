const styles: string = `.footnote {position:relative} a.footnote:hover {opacity: 1} .footnote:hover::after {width:200px;
	content: attr(data-reference); position:absolute; top: -1rem; right: 25px; box-shadow: 2px 2px 20px rgb(0 0 0 / .25); padding: 5px 15px; background: white; border-radius; 5px; transform: translateY(-50%); 
}`

export default styles;