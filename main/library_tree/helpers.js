'use strict';
//24/06/26

/* global fso:readable, WshShell:readable, folders:readable, popup:readable */

/* global Language:readable, popUpBox:readable, ppt:readable */

/* exported tooltip, $, ease */

const tooltip = window.Tooltip;

class Helpers {
	constructor() {
		this.scale = this.getDpi();
		this.symbolOrder = ['!', '#', '$', '%', '&', '(', ')', ',', '.', ';', '@', '[', ']', '^', '_', '`', '{', '}', '~', '+', '='];
	}

	// Methods

	average(arr) {
		return arr.reduce((a, b) => a + b, 0) / arr.length;
	}

	browser(c) {
		if (!this.run(c)) fb.ShowPopupMessage('Unable to launch your default browser.', 'Library Tree');
	}

	buildPth(pth) {
		let result, tmpFileLoc = '';
		let UNC = pth.startsWith('\\\\');
		if (UNC) pth = pth.replace('\\\\', '');
		const pattern = /(.*?)\\/gm;
		while ((result = pattern.exec(pth))) {
			tmpFileLoc = tmpFileLoc.concat(result[0]);
			if (UNC) {
				tmpFileLoc = `\\\\${tmpFileLoc}`;
				UNC = false;
			}
			this.create(tmpFileLoc);
		}
	}

	clamp(num, min, max) {
		return Math.max(Math.min(num, max), min);
	}

	create(fo) {
		try {
			if (!this.folder(fo)) fso.CreateFolder(fo);
		} catch (e) { /* empty */ } // eslint-disable-line no-unused-vars
	}

	debounce(e, r, i) {
		var o, u, a, c, v, f, d = 0, m = !1, j = !1, n = !0; if ('function' != typeof e) throw new TypeError('debounce: invalid function'); function T(i) { var n = o, t = u; return o = u = void 0, d = i, c = e.apply(t, n); } function b(i) { var n = i - f; return void 0 === f || r <= n || n < 0 || j && a <= i - d; } function l() { var i, n, t = Date.now(); if (b(t)) return w(t); v = setTimeout(l, (n = r - ((i = t) - f), j ? Math.min(n, a - (i - d)) : n)); } function w(i) { return v = void 0, n && o ? T(i) : (o = u = void 0, c); } function t() { var i, n = Date.now(), t = b(n); if (o = arguments, u = this, f = n, t) { if (void 0 === v) return d = i = f, v = setTimeout(l, r), m ? T(i) : c; if (j) return v = setTimeout(l, r), T(f); } return void 0 === v && (v = setTimeout(l, r)), c; } return r = Number.parseFloat(r) || 0, this.isObject(i) && (m = !!i.leading, a = ((j = 'maxWait' in i)) ? Math.max(Number.parseFloat(i.maxWait) || 0, r) : a, n = 'trailing' in i ? !!i.trailing : n), t.cancel = function () { void 0 !== v && clearTimeout(v), o = f = u = v = void (d = 0); }, t.flush = function () { return void 0 === v ? c : w(Date.now()); }, t; // NOSONAR
	}

	equal(arr1, arr2) {
		if (!this.isArray(arr1) || !this.isArray(arr2)) return false;
		let i = arr1.length;
		if (i != arr2.length) return false;
		while (i--)
			if (arr1[i] !== arr2[i]) return false;
		return true;
	}

	equalHandles(arr1, arr2) {
		if (!this.isArray(arr1) || !this.isArray(arr2)) return false;
		let i = arr1.length;
		if (i != arr2.length) return false;
		while (i--)
			if (!arr1[i].Compare(arr2[i])) return false;
		return true;
	}

	file(f) {
		return typeof f === 'string' && fso.FileExists(f);
	}

	folder(fo) {
		return typeof fo === 'string' && fso.FolderExists(fo);
	}

	getDpi() {
		let dpi = typeof window.DPI === 'number' ? 120 : window.DPI; // Regorxxx <- Use exposed SMP dpi ->
		try {
			dpi = WshShell.RegRead('HKCU\\Control Panel\\Desktop\\WindowMetrics\\AppliedDPI');
		} catch (e) { /* empty */ } // eslint-disable-line no-unused-vars
		return Math.max(dpi / 120, 1);
	}

	/**
	 * Create and draw on new img
	 *
	 * @method
	 * @name gr
	 * @kind method
	 * @memberof Helpers
	 * @param {number} w
	 * @param {number} h
	 * @param {GdiBitmap|D2DBitmap} im
	 * @param {(g: GdiGraphics, i: GdiBitmap|D2DBitmap) => void} func
	 * @returns {GdiBitmap}
	 */
	gr(w, h, im, func) {
		if (Number.isNaN(w) || Number.isNaN(h)) return;
		let i = gdi.CreateImage(Math.max(w, 2), Math.max(h, 2));
		let g = i.GetGraphics();
		func(g, i);
		i.ReleaseGraphics(g);
		g = null;
		if (im) return i;
		else i = null;
	}

	isArray(arr) {
		return Array.isArray(arr);
	}

	isObject(t) {
		const e = typeof t;
		return null != t && ('object' == e || 'function' == e);
	}

	jsonParse(n, defaultVal, type) {
		switch (type) { // NOSONAR
			case 'file':
				try {
					return JSON.parse(this.open(n));
				} catch (e) { // eslint-disable-line no-unused-vars
					return defaultVal;
				}
			default:
				try {
					return JSON.parse(n);
				} catch (e) { // eslint-disable-line no-unused-vars
					return defaultVal;
				}
		}
	}

	open(f) {
		try { // handle locked files
			return this.file(f) ? utils.ReadTextFile(f) : '';
		} catch (e) { // eslint-disable-line no-unused-vars
			return '';
		}
	}

	padNumber(num, len, base) {
		if (!base) base = 10;
		return ('000000' + num.toString(base)).slice(-len);
	}

	query(h, q) {
		let l = new FbMetadbHandleList();
		try {
			l = fb.GetQueryItems(h, q);
		} catch (e) { /* empty */ } // eslint-disable-line no-unused-vars
		return l;
	}

	range(start, stop, step = 1) {
		return Array.from({ length: (stop - start) / step + 1 }, (_, i) => start + i * step);
	}

	regexEscape(n) {
		return n.replace(/[*+\-?^!:&"~${}()|[\]/\\]/g, '\\$&');
	}

	replaceAt(str, pos, chr) {
		return str.substring(0, pos) + chr + str.substring(pos + 1);
	}

	RGBAtoRGB(c, bg) {
		c = this.toRGBA(c);
		bg = this.toRGB(bg);
		const r = c[0] / 255;
		const g = c[1] / 255;
		const b = c[2] / 255;
		const a = c[3] / 255;
		const bgr = bg[0] / 255;
		const bgg = bg[1] / 255;
		const bgb = bg[2] / 255;
		let nR = ((1 - a) * bgr) + (a * r);
		let nG = ((1 - a) * bgg) + (a * g);
		let nB = ((1 - a) * bgb) + (a * b);
		nR = this.clamp(Math.round(nR * 255), 0, 255);
		nG = this.clamp(Math.round(nG * 255), 0, 255);
		nB = this.clamp(Math.round(nB * 255), 0, 255);
		return this.RGB(nR, nG, nB);
	}

	RGBtoRGBA(rgb, a) {
		return a << 24 | rgb & 0x00FFFFFF;
	}

	run(c) {
		try {
			WshShell.Run(c);
			return true;
		} catch (e) { // eslint-disable-line no-unused-vars
			return false;
		}
	}

	save(fn, text, bom) {
		try {
			utils.WriteTextFile(fn, text, bom);
		} catch (e) { // eslint-disable-line no-unused-vars
			this.trace('error saving: ' + fn);
		}
	}

	split(n, type) {
		switch (type) {
			case 0:
				return n.replace(/\s+|^,+|,+$/g, '').split(',');
			case 1:
				return n.replace(/^[,\s]+|[,\s]+$/g, '').split(/[,-]/);
		}
	}

	throttle(e, i, t) {
		let n = !0;
		let r = !0;
		if (typeof e !== 'function') {
			throw new TypeError('throttle: invalid function');
		}
		if (this.isObject(t)) {
			n = 'leading' in t ? !!t.leading : n;
			r = 'trailing' in t ? !!t.trailing : r;
		}
		return this.debounce(e, i, { leading: n, maxWait: i, trailing: r });
	}

	titlecase(n) {
		return n.replace(/[A-Za-z0-9\u00C0-\u00FF]+[^\s-/]*/g, match => {
			if (match.slice(1).search(/[A-Z]|\../) > -1) return match;
			return match.charAt(0).toUpperCase() + match.slice(1);
		});
	}

	toRGB(c) {
		return [c >> 16 & 0xff, c >> 8 & 0xff, c & 0xff];
	}

	toRGBA(c) {
		return [c >> 16 & 0xff, c >> 8 & 0xff, c & 0xff, c >> 24 & 0xff];
	}

	trace(message) {
		console.log('Library Tree' + ': ' + message);
	}

	value(num, def, type) {
		num = Number.parseFloat(num);
		if (Number.isNaN(num)) return def;
		switch (type) {
			case 0:
				return num;
			case 1:
				if (num !== 1 && num !== 0) return def;
				break;
			case 2:
				if (num > 2 || num < 0) return def;
				break;
		}
		return num;
	}

	// Regorxxx <- Cleanup
	stringFormat() {
		const a = arguments;
		const flags = 0;
		let h_align = 0;
		let v_align = 0;
		let trimming = 0;
		switch (a.length) {
			case 3:
				trimming = a[2]; /*fall through*/
			case 2:
				v_align = a[1]; /*fall through*/
			case 1:
				h_align = a[0];
				break;
			default:
				return 0;
		}
		return (h_align << 28 | v_align << 24 | trimming << 20 | flags);
	}

	RGB(r, g, b) {
		return 0xff000000 | r << 16 | g << 8 | b;
	}

	RGBA(r, g, b, a) {
		return a << 24 | r << 16 | g << 8 | b;
	}
	// Regorxxx ->

	// Regorxxx <- Rating decimals
	round(floatNum, decimals, eps = 10 ** -14) {
		return (decimals > 0
			? decimals === 15
				? floatNum
				: Math.round(floatNum * Math.pow(10, decimals) + eps) / Math.pow(10, decimals)
			: Math.round(floatNum)
		);
	}
	// Regorxxx ->

	// Regorxxx <- RegExp library search
	applyRegExp(str, handleList, meta = ['ALBUM ARTIST', 'ALBUM', 'TITLE', 'DATE']) {
		let rgExp, re, flag, bTransliterate;
		try {
			[, re, flag] = str.startsWith('/')
				? str.match(/\/(.*)\/([gimsuyt]+)?/)
				: [];
			rgExp = re ? new RegExp(re, (flag || '').replace('t', '')) : null;
			bTransliterate = (flag || '').includes('t');
		} catch (e) { /* empty */ } // eslint-disable-line no-unused-vars
		if (!rgExp) { throw new Error('Non-valid RegExp: ' + str); }
		const match = (val) => {
			return Array.isArray(val)
				? val.some((v) => rgExp.test(v))
				: rgExp.test(val) || (bTransliterate && rgExp.test(Language.transliterate(val)));
		};
		const matchTrans = (val) => {
			return Array.isArray(val)
				? val.some((v) => rgExp.test(Language.transliterate(v)))
				: rgExp.test(Language.transliterate(val));
		};
		return new FbMetadbHandleList(
			this.getHandleListTags(handleList, meta, { bMerged: true })
				.reduce((prev, tagArr, i) => {
					if (match(tagArr) || bTransliterate && matchTrans(tagArr)) { prev.push(handleList[i]); }
					return prev;
				}, [])
		);
	}

	isArrayStrings(checkKeys, bAllowEmpty = false) {
		if (checkKeys === null || Object.prototype.toString.call(checkKeys) !== '[object Array]' || checkKeys.length === null || checkKeys.length === 0) {
			return false; //Array was null or not an array
		} else {
			let i = checkKeys.length;
			while (i--) {
				if (Object.prototype.toString.call(checkKeys[i]) !== '[object String]') {
					return false; //values were null or not strings
				}
				if (!bAllowEmpty && checkKeys[i] === '') {
					return false; //values were empty
				}
			}
		}
		return true;
	}

	_b(value) {
		return '[' + value + ']';
	}

	_t(tag) {
		return (tag.includes('%') || tag.includes('$') ? tag : '%' + tag + '%');
	}

	getHandleListTags(handleList, tagsArray, { bMerged = false } = {}) {
		if (!this.isArrayStrings(tagsArray)) { return null; }
		if (!handleList) { return null; }
		const tagArray_length = tagsArray.length;
		/** @type {any[]|any[][]} */
		let outputArray = [];
		let i = 0;
		let tagString = '';
		const outputArray_length = handleList.Count;
		const sep = '|‎|'; // Contains U+200E invisible char
		while (i < tagArray_length) {
			const tagStr = tagsArray[i].includes('$')
				? tagsArray[i]
				: tagsArray[i].includes('%')
					? tagsArray[i]
					: '%' + tagsArray[i] + '%';
			if (bMerged) { tagString += this._b((i === 0 ? '' : ', ') + tagStr); } // We have all values separated by comma
			else { tagString += (i === 0 ? '' : sep) + this._b(tagStr); } // We have tag values separated by comma and different tags by 'sep'
			i++;
		}
		let tfo = fb.TitleFormat(tagString);
		// Regorxxx <- Support for stream tag-retrieval
		outputArray = this.isStreamSupport(tfo)
			? tfo.EvalWithMetadbsDynamic(handleList)
			: tfo.EvalWithMetadbs(handleList);
		// Regorxxx ->
		if (bMerged) { // Just an array of values per track: n x 1
			for (let i = 0; i < outputArray_length; i++) {
				outputArray[i] = outputArray[i].split(', ');
			}
		} else { // Array of values tag and per track; n x tagNumber
			for (let i = 0; i < outputArray_length; i++) {
				outputArray[i] = outputArray[i].split(sep);
				for (let j = 0; j < tagArray_length; j++) {
					outputArray[i][j] = outputArray[i][j].split(', ');
				}
			}
		}
		return outputArray;
	}

	getTagsFromTf(tf, exclude = ['%DISCNUMBER%', '%TRACKNUMBER%', '%TRACK NUMBER%', '%TOTALTRACKS%', '%TOTALDISCS%', '%SUBSONG%', '%__CHANNELS%', '%COMPILATION%']) {
		return [...(new Set(tf.match(/%.+?%|\$meta\(.+?,.+?\)/gi)
			.map((tag) => tag.replace(/[<>]|\$meta\(|,\d\)/gi, ''))
			.filter(Boolean)
			.map((tag) => this._t(tag.toUpperCase()))
		).difference(
			new Set(exclude || [])
		)
		)];
	}
	// Regorxxx ->

	// Regorxxx <- Drag n' drop to search box
	escapeRegExp(s) { // https://github.com/lodash/lodash/blob/4.1.2-npm-packages/lodash.escaperegexp/index.js
		const reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
		const reHasRegExpChar = new RegExp(reRegExpChar.source);
		s = s.toString();
		return (s && reHasRegExpChar.test(s) ? s.replace(reRegExpChar, '\\$&') : s);
	}

	_q(value, bSpace) {
		return (bSpace ? ' ' : '') + '"' + value + '"';
	}

	_qCond(tag, bUnquote = false) {
		return bUnquote //NOSONAR
			? tag.replace(/(^")(.*\$+.*)("$)/g, '$2')
			: tag.includes('$')
				? this._q(tag)
				: tag;
	}

	sanitizeQueryVal(val) {
		return (val.match(/[()]/g) ? this._q(val) : val);
	}

	queryCombinations(tagsArray, queryKey, tagsArrayLogic /*AND, OR [NOT]*/, subTagsArrayLogic /*AND, OR [NOT]*/, match = 'IS' /*IS, HAS, EQUAL*/, prefix = '') {
		// Wrong tagsArray
		if (tagsArray === null || Object.prototype.toString.call(tagsArray) !== '[object Array]' || tagsArray.length === null || tagsArray.length === 0) { return; }
		if (typeof queryKey === 'undefined' || queryKey === null || !queryKey) { return; }
		tagsArrayLogic = (tagsArrayLogic || '').toUpperCase();
		subTagsArrayLogic = (subTagsArrayLogic || '').toUpperCase();
		match = (match || '').toUpperCase();
		if (this.isArrayStrings(queryKey)) {
			let queryKeyLength = queryKey.length;
			let i = 0;
			let queryArray = [];
			while (i < queryKeyLength) {
				queryArray.push(/** @type {string} */(this.queryCombinations(tagsArray, queryKey[i], tagsArrayLogic, subTagsArrayLogic, match)));
				i++;
			}
			return queryArray;
		}
		let tagsArrayLength = tagsArray.length;
		/** @type {string|string[]} */
		let query = '';
		if (Array.isArray(tagsArray[0])) {
			if (!['AND', 'OR', 'AND NOT', 'OR NOT'].includes(tagsArrayLogic) || !['AND', 'OR', 'AND NOT', 'OR NOT'].includes(subTagsArrayLogic)) { return; }
			let k = tagsArray[0].length; // subTagsArrays length
			let i = 0;
			while (i < tagsArrayLength) {
				if (i !== 0) {
					query += ' ' + tagsArrayLogic + ' ';
				}
				let j = 0;
				while (j < k) {
					if (j === 0) {
						query += (k > 1 ? '(' : '') + queryKey + ' ' + match + ' ' + this.sanitizeQueryVal(tagsArray[i][0]); // only adds parenthesis when more than one subTag! Esthetic fix...
					} else {
						query += ' ' + subTagsArrayLogic + ' ' + queryKey + ' ' + match + ' ' + this.sanitizeQueryVal(tagsArray[i][j]);
					}
					j++;
				}
				query += (k > 1 ? ')' : '');
				i++;
			}
		} else { //no subTagsArrays
			if (!['AND', 'OR', 'AND NOT', 'OR NOT'].includes(tagsArrayLogic)) { return; }
			let i = 0;
			while (i < tagsArrayLength) {
				if (i === 0) {
					query += queryKey + ' ' + match + ' ' + this.sanitizeQueryVal(/** @type {string} */(tagsArray[0]));
				} else {
					query += ' ' + tagsArrayLogic + ' ' + queryKey + ' ' + match + ' ' + this.sanitizeQueryVal(/** @type {string} */(tagsArray[i]));
				}
				i++;
			}
		}
		return query
			? prefix
				? prefix + '(' + query + ')'
				: query
			: '';
	}

	queryJoin(queryArray, setLogic = 'AND') {
		setLogic = (setLogic || '').toUpperCase();
		if (!['AND', 'OR', 'AND NOT', 'OR NOT'].includes(setLogic)) { return; }
		let arrayLength = queryArray.length;
		// Wrong array
		if (!Array.isArray(queryArray) || typeof queryArray === 'undefined' || queryArray === null || arrayLength === null || arrayLength === 0) { return; }
		const allRegex = /ALL/;
		const copy = [...queryArray].filter((q) => q && !allRegex.test(q));
		arrayLength = copy.length;
		let query = '';
		let i = 0;
		while (i < arrayLength) {
			if (i === 0) {
				query += (arrayLength > 1 ? '(' : '') + copy[i] + (arrayLength > 1 ? ')' : '');
			} else {
				query += ' ' + setLogic + ' (' + copy[i] + ')';
			}
			i++;
		}
		return query;
	}
	// Regorxxx ->
	// Regorxxx <- Fix quick-searck for non ascii first char, greek and cyrilic. Mimics $ascii() Title Format function
	asciify(value) {
		return (typeof value === 'string' ? value : String(value)).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\u0142/g, 'l');
	}
	// Regorxxx ->

	// Regorxxx <- Fixed Library's "View by Folder Structure" to match Windows Explorer. Improves behavior compared to TT's fix https://github.com/TT-ReBORN/Georgia-ReBORN/commit/819284002e133bb4d9406ad55e233e7bb18d39b8
	getSymbolIndex(ch) {
		const i = this.symbolOrder.indexOf(ch);
		return i >= 0 ? i + 1 : 0;
	}

	getTypeWeight(ch, symbolIdx = this.getSymbolIndex(ch), sensitivity) {
		const code = ch.charCodeAt(0);
		if (symbolIdx) { return 0; }
		else if (code >= 48 && code <= 57) { return 2; } // 0-9
		else if ((code >= 65 && code <= 90) || (code >= 97 && code <= 122)) { return 3; } // A-z
		else if (code >= 192 && code <= 591) { return sensitivity === 'base' ? 3 : 4; } // À-ɏ
		else if (code >= 880 && code <= 1023) { return sensitivity === 'base' ? 3 : 5; } // Greek
		else if (code >= 1024 && code <= 1279) { return sensitivity === 'base' ? 3 : 6; } // Cyrilic
		else if (code >= 12352 && code <= 12543) { return sensitivity === 'base' ? 3 : 7; } // Japanese
		else if (code >= 1424 && code <= 1535) { return sensitivity === 'base' ? 3 : 8; } // Hebrew
		else if (code >= 1536 && code <= 1791) { return sensitivity === 'base' ? 3 : 9; } // Arab
		else if (code >= 2304 && code <= 2431) { return sensitivity === 'base' ? 3 : 10; } // Hindi
		else if (code >= 3584 && code <= 3711) { return sensitivity === 'base' ? 3 : 11; } // Thai
		else if (code >= 19968 && code <= 40959) { return sensitivity === 'base' ? 3 : 12; } // Chinese
		else if (code >= 44032 && code <= 55215) { return sensitivity === 'base' ? 3 : 13; } // Korean
		else { return 1; }
	}

	isNumeric(n) {
		return !Number.isNaN(Number.parseFloat(n)) && Number.isFinite(n);
	}
	// Regorxxx ->

	getAsset(assetFile) {
		return utils.ReadTextFile(folders.xxx + 'assets/library_tree/' + assetFile);
	}

	getImageAssets(assetFolder) {
		return utils.Glob(folders.xxx + 'assets/library_tree/images/' + assetFolder + '/*');
	}

	// Regorxxx <- Native themed popups | Code cleanup
	okCancelPopup(caption, prompt, callback = () => void (0), type = 'okCancel') {
		const types = {
			ok: { html: ['Ok'], popupButtons: popup.ok, popupOut: popup.okr },
			okCancel: { html: ['Ok', 'Cancel'], popupButtons: popup.ok_cancel, popupOut: popup.okr },
			yesNo: { html: ['Yes', 'No'], popupButtons: popup.yes_no, popupOut: popup.yes }
		};
		const label = types[type] || types.okCancel;
		const wsh = !utils.MessageBox && popUpBox.isHtmlDialogSupported()
			? popUpBox.confirm(caption, prompt, ...label.html, '', '', callback)
			: true;
		if (wsh) { callback('ok', WshShell.Popup(prompt, 0, caption, label.popupButtons) === label.popupOut); }
	}
	// Regorxxx ->

	// Regorxxx <- Support for stream tag-retrieval
	isStreamSupport(tf) {
		if (!ppt.streamSupport || !fb.IsPlaying) { return false; }
		const expr = (typeof tf === 'string' ? tf : tf.Expression).toUpperCase();
		return (expr.includes('ARTIST') || expr.includes('TITLE'));
	}
	// Regorxxx ->
}

const $ = new Helpers;

function Bezier() { const i = 4, c = .001, o = 1e-7, v = 10, l = 11, s = 1 / (l - 1), n = typeof Float32Array === 'function'; function e(r, n) { return 1 - 3 * n + 3 * r; } function u(r, n) { return 3 * n - 6 * r; } function a(r) { return 3 * r; } function w(r, n, t) { return ((e(n, t) * r + u(n, t)) * r + a(n)) * r; } function y(r, n, t) { return 3 * e(n, t) * r * r + 2 * u(n, t) * r + a(n); } function h(r, n, t, e, u) { let a, f, i = 0; do { f = n + (t - n) / 2; a = w(f, e, u) - r; if (a > 0) { t = f; } else { n = f; } } while (Math.abs(a) > o && ++i < v); return f; } function A(r, n, t, e) { for (let u = 0; u < i; ++u) { const a = y(n, t, e); if (a === 0) { return n; } const f = w(n, t, e) - r; n -= f / a; } return n; } function f(r) { return r; } function bezier(i, t, o, e) { if (!(0 <= i && i <= 1 && 0 <= o && o <= 1)) { throw new Error('Bezier x values must be in [0, 1] range'); } if (i === t && o === e) { return f; } const v = n ? new Float32Array(l) : new Array(l); for (let r = 0; r < l; ++r) { v[r] = w(r * s, i, o); } function u(r) { const e = l - 1; let n = 0, t = 1; for (; t !== e && v[t] <= r; ++t) { n += s; } --t; const u = (r - v[t]) / (v[t + 1] - v[t]), a = n + u * s, f = y(a, i, o); if (f >= c) { return A(r, a, i, o); } else if (f === 0) { return a; } else { return h(r, n, n + s, i, o); } } return function r(n) { if (n === 0) { return 0; } if (n === 1) { return 1; } return w(u(n), t, e); }; } this.scroll = bezier(0.25, 0.1, 0.25, 1); this.full = this.scroll; this.step = this.scroll; this.bar = bezier(0.165, 0.84, 0.44, 1); this.barFast = bezier(0.19, 1, 0.22, 1); this.inertia = bezier(0.23, 1, 0.32, 1); } // NOSONAR
const ease = new Bezier;