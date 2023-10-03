// This function is used to maintain backwards compatibility with the older version of Port-API
// and the Codefresh workflow template which supported a single team provided as a string
function parseTeamInput(testString: string) {
	if (!testString.includes('[') && testString != '') {
		return [`"${testString}"`];
	}
	return testString === '' ? ['[', ']'].join('') : JSON.stringify(JSON.parse(testString)).split('\n').join('');
}

export default parseTeamInput;
