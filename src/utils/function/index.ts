import { consoleLog } from '../other';
import { TImportElement } from '../types';

import type {
	TStatusBarAcceptProps,
	TStatusBarErrorProps,
	TStatusBarInitProps,
	TStatusBarPendingProps,
} from './types';

//| ✅ Main

/* 
* 💡 ru: 

* 💡 en: 
*/

export const copyArray = (arr: any[]) => {
	return JSON.parse(JSON.stringify(arr));
};

/* 
* 💡 ru: 

* 💡 en: 
*/

export const getPartCode = ({
	code,
	type,
	arrTriggerWordImport,
	arrTriggerWordOther,
}: {
	code: string;
	type: 'import' | 'main';
	arrTriggerWordImport: string[];
	arrTriggerWordOther: string[];
}): any => {
	if (code.includes('\n')) {
		const arrCode: string[] = code.replace(/;/g, '').replace(/\n/g, ';').split(';');
		const arrCodeMain: string[] = code.split('\n');
		let activeImport: boolean = true;
		let activeId: number = 0;

		copyArray(arrCode).map((el: string, idArr: number) => {
			arrTriggerWordImport.forEach(wordImport => {
				arrTriggerWordOther.forEach(wordOther => {
					if (activeImport && el.includes(wordImport)) {
						activeId = idArr + 1;
						activeImport = true;
					}
					if (el.includes(wordOther)) {
						activeImport = false;
					}
				});
			});
		});

		if (type === 'import') {
			return arrCode.slice(0, activeId).filter((el: any) => el !== '');
		}
		return arrCodeMain.slice(activeId).join('\n');
	}
};

/* 
* 💡 ru: 

* 💡 en: 
*/

export const removeDuplicates = (arr: any[], key: string) => {
	const seen: any = {};
	return arr.filter(item => {
		const k = item[key];
		if (seen.hasOwnProperty(k)) {
			return false;
		}
		return (seen[k] = true);
	});
};

/* 
* 💡 ru: 

* 💡 en: 
*/

export const convertImportInStringToObjectImports = (
	arrImport: string[],
	arrOfSymbols: string[],
) => {
	const predResult: TImportElement[] = [];

	const arrImport_: string[] = copyArray(arrImport);

	arrImport_.forEach((elemImport: any) => {
		predResult.push({
			importDefault: [],
			importExport: [],
			importOnly: false,
			importType: [],
			importAll: false,
			importAsAll: '',
			package: elemImport.replace('"', "'").match(/'(.*?)'/)[1],
		});
	});

	const result = copyArray(removeDuplicates(predResult, 'package'));

	arrImport_.forEach((elemImport: any) => {
		result.forEach((elemObject: any) => {
			if (elemImport.replace('"', "'").match(/'(.*?)'/)[1] === elemObject.package) {
				if (elemImport.includes('import * from ')) {
					elemObject.importAll = true;
				}

				if (elemImport.includes('import * as ') && elemImport.includes(' from ')) {
					elemObject.importAsAll = elemImport
						.replace('import ', '')
						.slice(0, elemImport.indexOf(' from ') - 7);
				}

				if (
					elemImport.includes('import type ') &&
					elemImport.includes(' from ') &&
					!elemImport.includes('import * ') &&
					!elemImport.includes('import * as ')
				) {
					let exportsArr: any = [];
					let defaultsArr: any = [];
					let wordTrigger: any = [];

					let checkWord = true;
					let checkDefault = true;
					let activeWordAs = false;

					elemImport
						.replace('import type ', '')
						.slice(0, elemImport.indexOf(' from ') - 7)
						.replace(" from '", '')
						.split('')
						.forEach((el: any) => {
							if (el === '{') {
								checkDefault = false;
								activeWordAs = true;
							}
							if (el === '}') {
								if (wordTrigger.length) {
									if (checkDefault) {
										defaultsArr.push(wordTrigger.join('').trim());
									} else {
										exportsArr.push(wordTrigger.join('').trim());
									}
								}
								wordTrigger = [];
								checkWord = false;
								checkDefault = true;
							}

							if (wordTrigger.join('') == 'from') {
								wordTrigger = [];
								checkWord = false;
							}

							if (el === ' ') {
								if (activeWordAs) {
									wordTrigger.push(el);
									checkWord = true;
								} else {
									if (wordTrigger.length) {
										if (checkDefault) {
											defaultsArr.push(wordTrigger.join('').trim());
										} else {
											exportsArr.push(wordTrigger.join('').trim());
										}
									}
									wordTrigger = [];
									checkWord = false;
								}
							}
							if (el === ',') {
								if (wordTrigger.length) {
									if (checkDefault) {
										defaultsArr.push(wordTrigger.join('').trim());
									} else {
										exportsArr.push(wordTrigger.join('').trim());
									}
								}
								wordTrigger = [];
								checkWord = false;
							}
							arrOfSymbols.forEach(word => {
								if (el === word) {
									wordTrigger.push(el);

									checkWord = true;
								}
							});
						});
					elemObject.importType = exportsArr;
				}

				if (
					elemImport.includes('import ') &&
					elemImport.includes(' from ') &&
					!elemImport.includes('import type ') &&
					!elemImport.includes('import * as ')
				) {
					let exportsArr: any = [];
					let defaultsArr: any = [];
					let wordTrigger: any = [];

					let checkWord = true;
					let checkDefault = true;
					let activeWordAs = false;

					elemImport
						.replace('import ', '')
						.slice(0, elemImport.indexOf(' from ') - ' from '.length)
						.replace(" from '", '')
						.split('')
						.forEach((el: any) => {
							if (el === '{') {
								checkDefault = false;
								activeWordAs = true;
							}
							if (el === '}') {
								if (wordTrigger.length) {
									if (checkDefault) {
										defaultsArr.push(wordTrigger.join('').trim());
									} else {
										exportsArr.push(wordTrigger.join('').trim());
									}
								}
								wordTrigger = [];
								checkWord = false;
								checkDefault = true;
								activeWordAs = false;
							}

							if (wordTrigger.join('') == 'type') {
								wordTrigger = [];
								checkWord = false;
							}

							if (wordTrigger.join('') == 'from') {
								wordTrigger = [];
								checkWord = false;
							}

							if (el === ' ') {
								if (activeWordAs) {
									wordTrigger.push(el);
									checkWord = true;
								} else {
									if (wordTrigger.length) {
										if (checkDefault) {
											defaultsArr.push(wordTrigger.join('').trim());
										} else {
											exportsArr.push(wordTrigger.join('').trim());
										}
									}
									wordTrigger = [];
									checkWord = false;
								}
							}
							if (el === ',') {
								if (wordTrigger.length) {
									if (checkDefault) {
										defaultsArr.push(wordTrigger.join('').trim());
									} else {
										exportsArr.push(wordTrigger.join('').trim());
									}
								}
								wordTrigger = [];
								checkWord = false;
							}
							arrOfSymbols.forEach(word => {
								if (el === word) {
									wordTrigger.push(el);

									checkWord = true;
								}
							});
						});
					if (defaultsArr.length) {
						elemObject.importDefault.push(...defaultsArr);
					}

					if (exportsArr.length) {
						elemObject.importExport.push(...exportsArr);
					}
				}

				if (
					elemImport.includes('import ') &&
					!elemImport.includes(' from ') &&
					!elemImport.includes('import type ')
				) {
					elemObject.importOnly = true;
				}
			}
		});
	});

	return result;
};

/* 
* 💡 ru: 

* 💡 en: 
*/

export const checkTriggerImportConfigInMainCode = (importsFile: any, arrConfig: any) => {
	const arrConfig_ = copyArray(arrConfig);
	const importsFile_: any[] = copyArray(importsFile);

	arrConfig_.forEach((el: any) => {
		let result: any[] = [];

		if (el.importDefault.length) {
			el.importDefault.forEach((importDef: any) => {
				if (!importsFile_.join('; ').includes(importDef)) {
					result.push(importDef);
				}
			});
		}

		el.importDefault = result;

		result = [];

		if (el.importExport.length) {
			el.importExport.forEach((importExp: any) => {
				if (!importsFile_.join('; ').includes(importExp)) {
					result.push(importExp);
				}
			});
		}

		el.importExport = result;

		//! Error config
	});

	return arrConfig_;
};

/* 
* 💡 ru: 

* 💡 en: 
*/

export const connectImportsFileWithConfigImports = (
	codeImportsFile: any,
	arrImports: any,
	arrConfig: any,
) => {
	const arrImports_ = copyArray(arrImports);

	const arrConfig_ = copyArray(checkTriggerImportConfigInMainCode(codeImportsFile, arrConfig));

	arrImports_.forEach((elemImport: any) => {
		arrConfig_.forEach((elemConfig: any) => {
			if (elemImport.package === elemConfig.package) {
				elemImport.importDefault = [
					...new Set([...elemImport.importDefault, ...elemConfig.importDefault]),
				];
				elemImport.importExport = [
					...new Set([...elemImport.importExport, ...elemConfig.importExport]),
				];
			} else {
				arrImports_.push({
					importDefault: elemConfig.importDefault || [],
					importExport: elemConfig.importExport || [],
					importOnly: false,
					importType: [],
					importAll: false,
					importAsAll: '',
					package: elemConfig.package,
				});
			}
		});
	});

	return removeDuplicates(arrImports_, 'package');
};

/* 
* 💡 ru: 

* 💡 en: 
*/

export const checkingPresenceElementInText = (text: any, word: any) => {
	//! fix

	const arrRight = [
		...'abcdefghijklmnopqrstuvwxyz'.toLocaleLowerCase().split(''),
		...'abcdefghijklmnopqrstuvwxyz'.toLocaleUpperCase().split(''),
		...'1234567890_$@~'.split(''),
	];

	const arrLeft = ['.'];

	let result: boolean = false;

	const test = (elem: any, _word: string) => {
		let active = true;
		const arrLeft_ = [...arrRight, ...arrLeft];

		arrLeft_.forEach(el => {
			if (elem.includes(`${el}${_word}`)) {
				active = false;
			}
		});

		arrRight.forEach(el => {
			if (elem.includes(`${_word}${el}`)) {
				active = false;
			}
		});

		return active;
	};

	text.split('\n').forEach((el: any) => {
		if (el.includes(word.replace('* as ', ''))) {
			if (test(el, word.replace('* as ', ''))) {
				result = true;
			}
		}
	});

	return result ? word : '';
};

/* 
* 💡 ru: 

* 💡 en: 
*/

export const removeUnusedArray = (text: any, triggerArr: any) => {
	const result: any = [];

	//! fix

	const arrRight = [
		...'abcdefghijklmnopqrstuvwxyz'.toLocaleLowerCase().split(''),
		...'abcdefghijklmnopqrstuvwxyz'.toLocaleUpperCase().split(''),
		...'1234567890_$@~'.split(''),
	];

	const arrLeft = ['.'];

	const test = (elem: any, _word: string) => {
		let active = true;
		const arrLeft_ = [...arrRight, ...arrLeft];

		arrLeft_.forEach(el => {
			if (elem.includes(`${el}${_word}`)) {
				active = false;
			}
		});

		arrRight.forEach(el => {
			if (elem.includes(`${_word}${el}`)) {
				active = false;
			}
		});

		return active;
	};

	triggerArr.forEach((word: any) => {
		if (word.includes(' as ')) {
			const word_ = word.split(' as ')[1];
			text.split('\n').forEach((el: any) => {
				if (el.includes(word_)) {
					if (test(el, word_)) {
						result.push(word);
					}
				}
			});
		} else {
			text.split('\n').forEach((el: any) => {
				if (el.includes(word)) {
					if (test(el, word)) {
						result.push(word);
					}
				}
			});
		}
	});

	return [...new Set(result)];
};

/* 
* 💡 ru: 

* 💡 en: 
*/

export const checkHaveImportInMainCode = (codeMain: any, arrImports: any) => {
	const arrImports_ = copyArray(arrImports);

	if (arrImports_.length) {
		arrImports_.forEach((elemImport: any) => {
			elemImport.importExport = removeUnusedArray(codeMain, elemImport.importExport);
			elemImport.importDefault = removeUnusedArray(codeMain, elemImport.importDefault);
			elemImport.importType = removeUnusedArray(codeMain, elemImport.importType);
			elemImport.importAsAll = checkingPresenceElementInText(codeMain, elemImport.importAsAll);
		});
	}

	return arrImports_.filter((elemImport: any) => {
		if (
			!(
				elemImport.importDefault.length === 0 &&
				elemImport.importExport.length === 0 &&
				elemImport.importOnly === false &&
				elemImport.importType.length === 0 &&
				elemImport.importAll === false &&
				elemImport.importAsAll === ''
			)
		) {
			return elemImport;
		}
	});
};

/* 
* 💡 ru: 

* 💡 en: 
*/

export const convertImportsArrObjectToArrStringImport = (arrImports: any[]) => {
	const result: any[] = [];
	const arrImports_ = copyArray(arrImports);

	arrImports_.forEach((elemImport: any) => {
		if (elemImport.importOnly) {
			result.push(`import '${elemImport.package}'`);
		}
		if (elemImport.importAll) {
			result.push(`import * from '${elemImport.package}'`);
		}
		if (elemImport.importAsAll) {
			result.push(`import ${elemImport.importAsAll} from '${elemImport.package}'`);
		}
		if (elemImport.importType.length) {
			result.push(
				`import type { ${elemImport.importType.join(', ')} } from '${elemImport.package}'`,
			);
		}
		if (elemImport.importDefault.length && elemImport.importExport.length) {
			result.push(
				`import ${
					elemImport.importDefault.length < 1
						? elemImport.importDefault.join(', ')
						: `${elemImport.importDefault[0]}, `
				}{ ${elemImport.importExport.join(', ')} } from '${elemImport.package}'`,
			);
		} else if (elemImport.importDefault.length) {
			result.push(`import ${elemImport.importDefault.join(', ')} from '${elemImport.package}'`);
		} else if (elemImport.importExport.length) {
			result.push(`import { ${elemImport.importExport.join(', ')} } from '${elemImport.package}'`);
		}
	});

	return result;
};

/* 
* 💡 ru: 

* 💡 en: 
*/

export const sortImportsArray = (arrImports: any) => {
	const result = [];
	let count = 0;

	copyArray(arrImports).forEach((elemImport: any) => {
		if (
			elemImport.includes('import ') &&
			elemImport.includes(' from ') &&
			!elemImport.includes('import type ') &&
			!elemImport.includes('import * as ') &&
			!elemImport.includes('import * ')
		) {
			result.push(elemImport);
			count += 1;
		}
	});

	if (count) {
		result.push('');
		count = 0;
	}

	copyArray(arrImports).forEach((elemImport: any) => {
		if (elemImport.includes('import type ')) {
			result.push(elemImport);
			count += 1;
		}
	});

	if (count) {
		result.push('');
		count = 0;
	}

	copyArray(arrImports).forEach((elemImport: any) => {
		if (elemImport.includes('import * from ')) {
			result.push(elemImport);
			count += 1;
		}
	});

	if (count) {
		result.push('');
		count = 0;
	}

	copyArray(arrImports).forEach((elemImport: any) => {
		if (elemImport.includes('import * as ')) {
			result.push(elemImport);
			count += 1;
		}
	});

	if (count) {
		result.push('');
		count = 0;
	}

	copyArray(arrImports).forEach((elemImport: any) => {
		if (
			elemImport.includes('import ') &&
			!elemImport.includes(' from ') &&
			!elemImport.includes('import type ') &&
			!elemImport.includes('import * as ') &&
			!elemImport.includes('import * ')
		) {
			result.push(elemImport);
			count += 1;
		}
	});

	if (count) {
		result.push('');
		count = 0;
	}

	return result;
};

/* 
* 💡 ru: 

* 💡 en: 
*/

export const reductionCodeImport = (text: any) => {
	const result = [];

	if (
		!(
			text.includes('{') &&
			text.includes('}') &&
			text.slice(text.indexOf('{') + 1, text.indexOf('}')).length > 50
		)
	) {
		return text;
	}

	result.push(text.slice(0, text.indexOf('{') + 1).trim());

	result.push(
		...text
			.slice(text.indexOf('{') + 1, text.indexOf('}') - 1)
			.trim()
			.split(', ')
			.map((el: any) => `    ${el},`),
	);
	result.push(text.slice(text.indexOf('}') - 1).trim());

	return result;
};

/* 
* 💡 ru: 

* 💡 en: 
*/

export const removeEmptyAndStop = (array: any) => {
	let result = [];
	let checked = false;
	for (let i = 0; i < array.length; i++) {
		if ((array[i] === '' || array[i] === '\r') && !checked) {
			continue;
		} else {
			checked = true;
			result.push(array[i]);
		}
	}
	return result;
};

/* 
* 💡 ru: 

* 💡 en: 
*/

export const finallyCode = (arrImports: any, codeMain: any) => {
	const result: any = sortImportsArray(
		convertImportsArrObjectToArrStringImport(copyArray(arrImports)),
	);

	result.forEach((el: any, i: any) => {
		if (
			el.includes('{') &&
			el.includes('}') &&
			el.slice(el.indexOf('{') + 1, el.indexOf('}')).length > 50
		) {
			result[i] = [...reductionCodeImport(el)] as any;
		}
	});

	return `${[]
		.concat(...result)
		.map((el: any) => (el.includes(' from ') || el.includes("import '") ? `${el};` : el))
		.join('\n')}\n${removeEmptyAndStop(codeMain.split('\n')).join('\n')}`;
};

//| ✅ Extension

/* 
* 💡 ru: 

* 💡 en: 
*/

export const checkFormatFile = (vscode: any) => {
	const currentlyOpenTabFilePath: string = vscode.window.activeTextEditor
		? vscode.window.activeTextEditor.document.fileName
		: '';

	const arrFormat = ['js', 'ts', 'tsx', 'jsx'];

	let result = false;

	arrFormat.forEach((format: string) => {
		if (currentlyOpenTabFilePath.slice(-5).split('.')[1] === format) {
			result = true;
		}
	});

	return result;
};

/* 
* 💡 ru: 

* 💡 en: 
*/

export const statusBarInit = ({ context, statusBar }: TStatusBarInitProps) => {
	statusBar.command = 'import-at-top';
	statusBar.name = 'Import At Top';
	statusBar.text = '⌛ Import At Top';
	statusBar.backgroundColor = 'transparent';
	context.subscriptions.push(statusBar);
	statusBar.show();
};

/* 
* 💡 ru: 

* 💡 en: 
*/

export const statusBarError = ({ vscode, statusBar, message }: TStatusBarErrorProps) => {
	vscode.window.showInformationMessage(`❌ Import At Top: ${message}`);
	statusBar.text = '❌ Import At Top';
	statusBar.backgroundColor = 'red';
	consoleLog({
		text: `- Import At Top ${message}`,
		type: 'err',
	});
};

export const statusBarAccept = ({ statusBar }: TStatusBarAcceptProps) => {
	statusBar.text = '✅ Import At Top';
	statusBar.backgroundColor = 'green';
	consoleLog({
		text: `- Import At Top`,
		type: 'log',
	});
};

/* 
* 💡 ru: 

* 💡 en: 
*/

export const statusBarPending = ({ statusBar }: TStatusBarPendingProps) => {
	setTimeout(() => {
		statusBar.text = '⌛ Import At Top';
		statusBar.backgroundColor = 'transparent';
	}, 1000);
};

/* 
* 💡 ru: 

* 💡 en: 
*/

export const checkArrayConfig = (arr: any[]) => {
	const expectedKeys: string[] = ['importDefault', 'importExport', 'package'];
	let check: boolean = true;
	for (const obj of arr) {
		for (const key in obj) {
			if (!expectedKeys.includes(key)) {
				check = false;
			}
			if (key === 'importDefault' || key === 'importExport') {
				if (!Array.isArray(obj[key])) {
					check = false;
				}
				for (const item of obj[key]) {
					if (typeof item !== 'string') {
						check = false;
					}
				}
			}
			if (key === 'package') {
				if (typeof obj[key] !== 'string') {
					check = false;
				}
			}
		}
	}
	return check;
};
