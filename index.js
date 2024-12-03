'use strict';

import chalk from 'chalk';
import readline from 'readline';
import crypto from 'crypto';
const commands = ['singledie', 'doubledice', 'sides', 'roll', 'help', 'exit'];
let pickingSides = false;
let sideAmount = 6;
let doubleDice = false;

let completer = (line) => {
	let hits = commands.filter((c) => c.startsWith(line));
	return [hits.length ? hits : commands, line];
};

const rli = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
	prompt: 'Die roller > ',
	completer: completer
});

rli._writeToOutput = function _writeToOutput(input) {
	if (input.includes('\n')) {
		process.stdout.write(input);
	} else {
		process.stdout.write(chalk.yellow(input));
	}
};

function addStructure(type, content, length) {
	let result;
	
	if (type === 'top') {
		result = `┏━ ${chalk.white(content)} `;
		let originalLength = result.replace(/\x1B\[[0-9;]*[a-zA-Z]/g, '').length;
		
		for (let i = 0; i < ((length - 1) - originalLength); i++) {
			result += '━';
		}
		
		result += '┓';
		return result;
	}
	
	if (type === 'middle') {
		result = `┃ ${content} `;
		let originalLength = content.replace(/\x1B\[[0-9;]*[a-zA-Z]/g, '').length;
		
		for (let i = 0; i < ((length - 4) - originalLength); i++) {
			result += ' ';
		}
		
		result += '┃';
		return result;
	}
	
	if (type === 'bottom') {
		result = `┗`;
		
		for (let i = 0; i < (length - 2); i++) {
			result += '━';
		}
		
		result += '┛';
		return result;
	}
}

function longestLineLength(lines) {
	let maxLength = 0;
	
	for (let i = 0; i < lines.length; i++) {
		let testLine = lines[i].replace(/\x1B\[[0-9;]*[a-zA-Z]/g, '').trim();
		
		if (testLine.length > maxLength) {
			maxLength = testLine.length;
		}
	}
	
   return maxLength;
}

function showWithBox(title, content, end) {
	let lines = content.split(`\n`);
	let newLines = [];
	
	for (let i = 0; i < lines.length; i++) {
		if (((i === 0) || (i === (lines.length - 1))) && (lines[i].trim().replace(/\t/g, '') === '')) {
			continue;
		}
		
		newLines.push(lines[i].trim().replace(/\t/g, ''));
	}
	
	lines = newLines;
	let longest = longestLineLength(lines) + 4;
	
	if ((title.length + 6) > longest) {
		longest = title.length + 6;
	}
	
	for (let i = 0; i < lines.length; i++) {
		lines[i] = addStructure('middle', lines[i], longest);
	}
	
	lines.unshift(addStructure('top', title, longest));
	lines.push(addStructure('bottom', '', longest));
	let lineString = `\n`;
	
	if (title === 'Introduction') {
		lineString = '';
	}
	
	for (let line of lines) {
		lineString += line;
		
		if (line !== lines[lines.length - 1]) {
			lineString += `\n`;
		}
	}
	
	if (end === true) {
		lineString += `\n`;
	}
	
	console.log(chalk.cyan(lineString));
}

rli.on('line', async (input) => {
	if (input.trim() === '') {
		rli.prompt();
		return;
	}
	
	if (pickingSides) {
		sideAmount = parseInt(input);
		
		if (isNaN(sideAmount)) {
			showWithBox('Error', `
				Please enter a whole number like 1, 2, 3 etc.
			`, true);
			rli.prompt();
			return;
		}
		
		showWithBox('Info', `
			The die now has ${sideAmount} sides.
		`, true);
		pickingSides = false;
		rli.prompt();
		return;
	}
	
	let output, sideAmountDisplay;
	
	switch (input.trim()) {
		case 'singledie':
			showWithBox('Question', `
				You have switched to rolling with ${chalk.white(1)} die.
			`, true);
			doubleDice = false;
			rli.prompt();
			break;
		case 'doubledice':
			showWithBox('Question', `
				You have switched to rolling with ${chalk.white(2)} dice.
			`, true);
			doubleDice = true;
			rli.prompt();
			break;
		case 'sides':
			output = `How many sides would you like your `;
			
			if (doubleDice) {
				output += `dice to have?`;
			} else {
				output += `die to have?`;
			}
			
			showWithBox('Question', output, true);
			pickingSides = true;
			rli.prompt();
			break;
		case 'roll':
			let randomNumber1 = crypto.randomInt(1, sideAmount + 1);
			let randomNumber2 = crypto.randomInt(1, sideAmount + 1);
			sideAmountDisplay = new Intl.NumberFormat('de-DE').format(sideAmount);
			let randomNumberDisplay1 = new Intl.NumberFormat('de-DE').format(randomNumber1);
			let randomNumberDisplay2 = new Intl.NumberFormat('de-DE').format(randomNumber2);
			let totalNumberDisplay = new Intl.NumberFormat('de-DE').format(randomNumber1 + randomNumber2);
			let eachString = ``;
			
			if (doubleDice) {
				eachString = ` with each`;
			}
			
			output = `You could have rolled anywhere from ${chalk.white(1)} to ${chalk.white(sideAmountDisplay)}${eachString}, and you rolled ${chalk.white(randomNumberDisplay1)}`;
			
			if (doubleDice) {
				output += ` & ${chalk.white(randomNumberDisplay2)}`;
				output += `. Which totals to ${chalk.white(totalNumberDisplay)}.`;
			} else {
				output += `.`;
			}
			
			showWithBox('Roll result', output, true);
			rli.prompt();
			break;
		case 'help':
			let config = ``;
			sideAmountDisplay = new Intl.NumberFormat('de-DE').format(sideAmount);
			
			if (doubleDice) {
				config += `2 dice with ${chalk.white(sideAmountDisplay)} sides each.`;
			} else {
				config += `1 die with ${chalk.white(sideAmountDisplay)} sides.`;
			}
			
			showWithBox('Commands', `
				Current configuration: ${config}
				${chalk.green('singledie')}    Roll with only 1 die.
				${chalk.green('doubledice')}   Roll with 2 dice at the same time.
				${chalk.green('sides')}        Choose the number of sides for your die roll.
				${chalk.green('roll')}         Roll the die.
				${chalk.green('exit')}         Exit the application.
			`, true);
			rli.prompt();
			break;
		case 'exit':
			rli.close();
			break;
		default:
			console.log(chalk.cyan(`\n${chalk.white(input.trim())} is not a valid command. Please type ${chalk.white('help')} for a list of valid commands.\n`));
			rli.prompt();
			break;
	}
}).on('close', () => {
	process.exit(0);
});

showWithBox('Introduction', `
	Welcome to Dice roller, you are rolling with 1 die which has 6 sides.
	Type ${chalk.white('help')} for a list of available commands.
`,true);
rli.prompt();