import { arrayOfLetters } from '../constant';

/* 

* 💡 ru: 

* 💡 en: 

*/

export const flattenArray = (arr: any[]) => {
	return arr.reduce((acc, val) => {
		if (val !== null) {
			acc.push(val[0]);
		}
		return acc;
	}, []);
};

/* 

* 💡 ru: 

* 💡 en: 

*/

export const cleaningUpExtraQuotes = (arr: any[]) => {
	const packages: any[] = [];

	arr.forEach(el => {
		packages.push(el.match(/'[^']*'|"[^"]*"/g));
	});

	return [...new Set(packages)];
};

/* 

* 💡 ru: 

* 💡 en: 

*/

export const getArrayImportPackages = (importsCode: any) => {
	const arrImportsString = gettingOnlyStringImports(importsCode);

	return flattenArray(cleaningUpExtraQuotes(arrImportsString)).map((el: any) =>
		el.replace(/['"]+/g, ''),
	);
};

/* 

* 💡 ru: 

* 💡 en: 

*/

export const baseSchemaArrayConfigLocal = (arr: any[]) => {
	const result: any[] = [];
	const _arr = [...new Set(arr)].forEach(el => {
		result.push({
			triggerDefault: [],
			triggerExport: [],
			package: el,
		});
	});

	return result;
};

/* 

* 💡 ru: 

* 💡 en: 

*/

export const gettingOnlyStringImports = (arr: any) => {
	const result: any[] = [];
	[
		...new Set(
			arr
				.replace(/import/g, ';import')
				.split(';')
				.map((el: string) => el.replace(/^\s+|\s+$/g, '')),
		),
	]
		.filter(el => el !== '')
		.forEach((el: any) => {
			if (el.startsWith('import')) {
				result.push(el);
			}
		});

	return result;
};

/* 

* 💡 ru: 

* 💡 en: 

*/

export const arrImportToObjectImport = (arrImport: any[], arrPackages: any[]) => {
	arrImport.forEach(imp => {
		arrPackages.forEach(el => {
			if (imp.match(/'(.*?)'/)[1] === el.package) {
				let exportsArr: any[] = [];
				let defaultsArr: any[] = [];
				let wordTrigger: any[] = [];
				let checkWord = true;
				let checkDefault = true;
				let activeWordAs = false;

				if (imp.includes(' as ')) {
					activeWordAs = true;
				}

				imp
					.split('')
					.splice(6)
					.forEach((el: any) => {
						if (el === '{') {
							checkDefault = false;
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
						arrayOfLetters.forEach(word => {
							if (el === word) {
								wordTrigger.push(el);
								checkWord = true;
							}
						});
					});

				el.triggerDefault = [...new Set([...el.triggerDefault, ...defaultsArr])];
				el.triggerExport = [...new Set([...el.triggerExport, ...exportsArr])];
			}
		});
	});
	return arrPackages;
};

/* 

* 💡 ru: 

* 💡 en: 

*/

export const removeUnusedArray = (text: any, triggerArr: any[]) => {
	if (triggerArr.length) {
		return triggerArr.filter(word => {
			if (word.includes(' as ')) {
				return text.includes(word.split(' as ')[1]);
			}
			return text.includes(word);
		});
	}
	return triggerArr;
};

/* 

* 💡 ru: 

* 💡 en: 

*/

export const sortArrayByField = (array: any[], field: string) => {
	return array.sort((a, b) => {
		if (a[field] < b[field]) {
			return 0;
		}
		if (a[field] > b[field]) {
			return 1;
		}
		return -1;
	});
};

/* 

* 💡 ru: 

* 💡 en: 

*/

export const removeDuplicatesByPackage = (arr: any[]) => {
	let seen: any = {};
	let result: any[] = [];

	arr.forEach(item => {
		if (!seen[item.package]) {
			seen[item.package] = true;
			result.push(item);
		}
	});

	return result;
};

/* 

* 💡 ru: 

* 💡 en: 

*/

export const joinArraysConfigAndImportFile = (config: any[], packageResult: any[]) => {
	let result: any[] = [];

	config.forEach(conf => {
		packageResult.forEach(pack => {
			if (conf.package === pack.package) {
				result.push({
					triggerDefault: [...new Set([...conf.triggerDefault, ...pack.triggerDefault])],
					triggerExport: [...new Set([...conf.triggerExport, ...pack.triggerExport])],
					package: conf.package,
				});
			}
			if (pack.triggerDefault.length !== 0 && pack.triggerExport.length !== 0) {
				result.push({
					triggerDefault: [...new Set([...pack.triggerDefault])],
					triggerExport: [...new Set([...pack.triggerExport])],
					package: pack.package,
				});
			}
			if (
				pack.triggerDefault.length === 0 &&
				pack.triggerExport.length === 0 &&
				(pack.package.includes('.css') ||
					pack.package.includes('.scss') ||
					pack.package.includes('.sass') ||
					pack.package.includes('/css') ||
					pack.package.includes('/scss') ||
					pack.package.includes('/sass'))
			) {
				result.push({
					triggerDefault: [],
					triggerExport: [],
					package: pack.package,
				});
			}
			if (pack.triggerDefault.length !== 0 || pack.triggerExport.length !== 0) {
				result.push({
					triggerDefault: [...new Set([...pack.triggerDefault])],
					triggerExport: [...new Set([...pack.triggerExport])],
					package: pack.package,
				});
			}
		});
	});

	result = removeDuplicatesByPackage(result);

	return result;
};
