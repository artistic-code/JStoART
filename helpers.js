function getCharsUntilNextSpace(text) {
	let count = 0;
	for (const char of text) {
		if (char !== " " && char !== "\n") {
			count++;
		} else {
			return count;
		}
	}
}

function getCharsUntilNextNonSpace(text) {
	let count = 0;
	for (const char of text) {
		if (char === " ") {
			count++;
		} else {
			return count;
		}
	}
}

// if, else, etc. also don't necessarily need a space, but only when a block statement follows
// when an expression statement follows (single line, without curly brackets) they do need a space
// TODO: walk AST, change all exp. statements to block statements and rewrite code from AST
const noSpaceKeywords = ["for", "switch", "break", "while", "this"];

function needsSpaceAfter(token, nextToken) {
	// there has to be a better way... and now the if chain begins!
	if (
		(token.type === "Keyword" && !noSpaceKeywords.includes(token.value)) ||
		(token.value === "else" && nextToken.value === "if") ||
		(token.type === "Identifier" && nextToken.value === "of") ||
		(token.value === "of" && nextToken.type === "Identifier") ||
		(token.type === "Identifier" && nextToken.value === "in") ||
		(token.value === "in" && nextToken.type === "Identifier") ||
		(token.type === "Identifier" && nextToken.value === "instanceof") ||
		(token.value === "instanceof" && nextToken.type === "Identifier") ||
		(token.value === "await" && nextToken.type === "Identifier") ||
		(token.value === "async" && nextToken.value === "function")
	) {
		return true;
	} else {
		return false;
	}
}

function getAsciiArtInfo(asciiArt) {
	let width = asciiArt.split("\n")[0].length;
	let height = asciiArt.split("\n").length;
	let totalNumberOfChars = width * height;
	let totalNumberOfNonSpace = (asciiArt.match(/#/g) || []).length;
	return { width, height, totalNumberOfChars, totalNumberOfNonSpace };
}

module.exports = {
	getCharsUntilNextSpace,
	getCharsUntilNextNonSpace,
	needsSpaceAfter,
	getAsciiArtInfo,
};
