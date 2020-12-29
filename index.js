const fs = require("fs");
const { tokenize } = require("esprima");
const { minify } = require("terser");

const {
	getCharsUntilNextNonSpace,
	getCharsUntilNextSpace,
	needsSpaceAfter,
	getAsciiArtInfo,
} = require("./helpers");

let codeTokens;
let asciiArt;

async function art(inFile, outFile, asciiFile) {
	let code = fs.readFileSync(inFile).toString();
	let isPossible = true;
	// minify the code because i.e. long variable names make problems
	code = (await minify(code, { sourceMap: true })).code;

	codeTokens = tokenize(code);

	asciiArt = fs.readFileSync(asciiFile).toString();
	let asciiArtInfo = getAsciiArtInfo(asciiArt);

	codeTokens.map((token) => {
		if (token.value.length > asciiArtInfo.width) {
			isPossible = false;
		}
	});

	if (isPossible) {
		insertToken(0);
		fs.writeFile(outFile, outArray.join(""), () => {});
	} else {
		console.log("Impossible.");
	}
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
		} else if (asciiArt[asciiPos] == "\n") {
			outArray.push("\n");
			asciiPos++;
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

art("index.js", "test.js", "ascii.txt");
