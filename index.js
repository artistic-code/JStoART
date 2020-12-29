const fs = require("fs");
const { tokenize } = require("esprima");
const { minify } = require("terser");
const { ArgumentParser } = require("argparse");

const {
	getCharsUntilNextNonSpace,
	getCharsUntilNextSpace,
	needsSpaceAfter,
	getAsciiArtInfo,
} = require("./helpers");
const { get } = require("https");

let codeTokens;
let asciiArt;

async function main() {
	const parser = new ArgumentParser({
		description:
			"converts javascript code to ascii art while mantaining its functionality",
		add_help: true,
	});

	parser.add_argument("in", { help: "input path" });
	parser.add_argument("out", { help: "output path" });
	parser.add_argument("ascii", { help: "path to file with ascii art" });

	const args = parser.parse_args();

	let code = fs.readFileSync(args.in).toString();

	// minify the code because i.e. long variable names make problems
	// (they might not fit onto a single line of ascii art)
	code = await minify(code, { sourceMap: true });
	code = code.code;

	codeTokens = tokenize(code);

	asciiArt = fs.readFileSync(args.ascii).toString();

	insertToken(0);

	fs.writeFile(args.out, outArray.join(""), () => {});
}

let outArray = [];
let asciiPos = 0;

function insertToken(i) {
	const t = codeTokens[i];

	if (
		i >= codeTokens.length &&
		asciiPos < getAsciiArtInfo(asciiArt).totalNumberOfChars
	) {
		if (asciiArt[asciiPos] == "#") {
			let charsUntilSpace = getCharsUntilNextSpace(asciiArt.slice(asciiPos));
			if (charsUntilSpace >= 4) {
				outArray.push(`/*${"#".repeat(charsUntilSpace - 4)}*/`);
				asciiPos += charsUntilSpace;
				insertToken(i);
			}
		} else if (asciiArt[asciiPos] == " ") {
			let charsUntilNonSpace = getCharsUntilNextNonSpace(
				asciiArt.slice(asciiPos)
			);
			outArray.push(" ".repeat(charsUntilNonSpace));
			asciiPos += charsUntilNonSpace;
			insertToken(i);
		}
	} else {
		if (asciiArt[asciiPos] == "#") {
			let charsUntilSpace = getCharsUntilNextSpace(asciiArt.slice(asciiPos));
			if (charsUntilSpace > t.value.length) {
				outArray.push(t.value);
				asciiPos += t.value.length;
				if (needsSpaceAfter(t, codeTokens[i + 1])) {
					outArray.push(" ");
					asciiPos++;
				}
				insertToken(i + 1);
			} else if (charsUntilSpace >= 4) {
				outArray.push(`/*${"#".repeat(charsUntilSpace - 4)}*/`);
				asciiPos += charsUntilSpace;
				insertToken(i);
			} else {
				outArray.push(" ".repeat(charsUntilSpace));
				asciiPos += charsUntilSpace;
				insertToken(i);
			}
		} else if (asciiArt[asciiPos] == " ") {
			let charsUntilNonSpace = getCharsUntilNextNonSpace(
				asciiArt.slice(asciiPos)
			);
			outArray.push(" ".repeat(charsUntilNonSpace));
			asciiPos += charsUntilNonSpace;
			insertToken(i);
		} else if (asciiArt[asciiPos] == "\n") {
			outArray.push("\n");
			asciiPos++;
			insertToken(i);
		}
	}
}

main();
