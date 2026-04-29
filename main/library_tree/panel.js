'use strict';
//29/04/26

/* global ui:readable, ppt:readable, pop:readable, but:readable, $:readable, sbar:readable, img:readable, lib:readable, popUpBox:readable, pluralize:readable, sync:readable, search:readable */
/* global MK_CONTROL:readable, DT_RIGHT:readable, DT_CENTER:readable, DT_VCENTER:readable, DT_SINGLELINE:readable, DT_NOPREFIX:readable, DT_END_ELLIPSIS:readable, DT_CALCRECT:readable */
/* global folders:readable, globQuery:readable, globTags:readable */
/* global removeEventListeners:readable */
/* global _qCond:readable, isArrayEqual:readable */
/* global queryJoin:readable, getHandleTags:readable, getHandleListTags:readable, queryCombinationsExpand:readable, logicDic:readable, sanitizeTagTfo:readable */

/* exported Panel */

class Panel {
	constructor() {
		this.cc = DT_CENTER | DT_VCENTER | DT_SINGLELINE | DT_NOPREFIX;
		this.cce = this.cc | DT_END_ELLIPSIS;
		this.curPattern = '';
		this.defaultViews = [];
		this.defFilterPatterns = [];
		this.defViewPatterns = [];
		this.dialogFiltGrps = [];
		this.dialogGrps = [];
		this.draw = true;
		this.folder_view = 16;
		this.folderView = false;
		this.grp = [];
		this.imgView = ppt.albumArtShow;
		this.init = true;
		this.l = DT_VCENTER | DT_SINGLELINE | DT_NOPREFIX;
		this.lc = DT_VCENTER | DT_SINGLELINE | DT_NOPREFIX | DT_END_ELLIPSIS;
		this.lines = ppt.albumArtGrpLevel ? ppt.albumArtGrpLevel : img.getArt(ppt.artId).lines; // Regorxxx <- Code cleanup ->
		this.list = new FbMetadbHandleList();
		this.menu = [];
		this.paint_y = Math.floor(ui.style.topBarShow || !ppt.sbarShow ? ui.row.h * 1.2 : 0);
		this.pn_h_auto = ppt.pn_h_auto && ppt.rootNode;
		this.propNames = [];
		this.newView = true;
		this.pos = -1;
		this.rc = DT_RIGHT | DT_VCENTER | DT_SINGLELINE | DT_NOPREFIX | DT_END_ELLIPSIS;
		this.rootName = '';
		this.s_lc = $.stringFormat(0, 1);
		this.samePattern = true;
		this.sbar_x = 0;
		this.softSplitter = '\u00ac';
		this.splitter = '\u00a6';
		this.sortBy = '';
		this.sourceName = '';
		this.statistics = false;
		this.viewName = '';
		this.zoomFilter = Math.max(ppt.zoomFilter / 100, 0.7);
		// Regorxxx <- Auto-DJ feature
		this.autoDj = {
			running: false,
			source: null,
			cache: [],
			last: null
		};
		// Regorxxx ->
		ppt.zoomFilter = this.zoomFilter * 100;
		// Regorxxx <- Sorting transliteration
		this.sortingTransLangs = ppt.sortingTransLangs.length && ppt.sortingTransLangs.toLowerCase() !== 'el|ru|jp|ch'
			? ppt.sortingTransLangs.split('|').filter(Boolean)
			: null;
		// Regorxxx ->

		this.filter = {
			menu: [],
			mode: [],
			x: 0,
			y: 0,
			w: 0
		};

		this.last_pressed_coord = {
			x: -1,
			y: -1
		};

		this.ln = {
			x: 0,
			w: 100
		};

		this.m = {
			x: -1,
			y: -1
		};

		this.search = {
			active: false,
			cursor: false,
			txt: '',
			x: 0,
			w: 100,
			h: 25,
			sp: 25
		};

		this.settings = {};

		this.tree = {
			sel: {
				w: 0
			},
			stripe: {
				w: 0
			},
			w: 0,
			y: 0
		};

		ppt.get('Library Tree Dialog Box', JSON.stringify({
			w: 85,
			h: 60,
			def_w: 85,
			def_h: 60,
			page: 'behaviour',
			version: `v${window.ScriptInfo.Version}`
		}));

		if (this.pn_h_auto) {
			window.MaxHeight = window.MinHeight = ppt.pn_h;
		}

		this.setTopBar();
		this.getViews();
		this.getFilters();
		ppt.initialLoadFilters = false;
		ppt.initialLoadViews = false;
		this.getFields(ppt.viewBy, ppt.filterBy);
		if (img.useD2D) { this.adjustUiD2D(); } // Regorxxx <- GDI/D2D draw mode ->
	}

	// Methods

	calcText() {
		ui.style.topBarShow = ppt.filterShow || ppt.searchShow || ppt.settingsShow;
		if (!ui.style.topBarShow) return;
		$.gr(1, 1, false, g => {
			// Regorxxx <- Filter / View / Source button
			this.filter.w = ppt.filterShow && but && but.multiBtn && but.multiBtn.name
				? g.CalcTextWidth(but.multiBtn.name, this.filter.font) + (ppt.searchShow ? Math.max(ppt.margin * 2 + (ppt.settingsBtnStyle ? 0 : 2), 12) : 0)
				: 0;
			// Regorxxx ->
			this.settings.w = ppt.settingsShow ? Math.round(g.MeasureString(this.settings.icon, this.settings.font, 0, 0, 500, 500).Width) : 0;
		});
		switch (true) {
			case ppt.settingsShow && ppt.searchShow:
				this.filter.x = ui.w - ui.sz.marginSearch - this.filter.w - this.settings.w + this.settings.offset;
				break;
			case !ppt.searchShow:
				this.filter.x = ui.sz.marginSearch;
				break;
			case !ppt.settingsShow:
				this.filter.x = ui.w - ui.sz.marginSearch - this.filter.w;
				break;
			case !ppt.filterShow:
				this.filter.x = ui.w - ui.sz.marginSearch * 2 - this.settings.w + this.settings.offset;
				break;
		}
		this.search.x = Math.round(ui.sz.marginSearch + ui.row.h);
		this.search.w = ppt.searchShow && (ppt.filterShow || ppt.settingsShow) ? this.filter.x - this.search.x - 11 : ui.w - ui.sz.marginSearch - Math.round(ui.row.h * 0.75) - this.search.x + 1;
	}

	clear(type) {
		if (type == 'views' || type == 'both') {
			for (let i = 0; i < 100; i++) {
				ppt.set(`View ${$.padNumber(i, 2)}: Name // Pattern`, null);
			}
		}
		if (type == 'filters' || type == 'both') {
			for (let i = 0; i < 100; i++) ppt.set(`Filter ${$.padNumber(i, 2)}: Name // Query`, null);
		}
	}

	forcePaint() {
		window.RepaintRect(0, this.paint_y, ui.w, ui.h - this.paint_y + 1, true);
	}

	// Regorxxx <- Expose TF formatting for arbitrary input | Expand TF support | Merge now playing and selected as fallback | Expose custom prefixes as tag
	eval(n, type) {
		let handle, tfo;
		switch (type) {
			case 'nowplaying':
				if (!n || !fb.IsPlaying) return '';
				tfo = FbTitleFormat(n);
				if (fb.IsPlaying && fb.PlaybackLength <= 0) return tfo.Eval();
				handle = fb.GetNowPlaying();
				return handle ? tfo.EvalWithMetadb(handle) : '';
			case 'selected':
				if (!n) return '';
				tfo = FbTitleFormat(n);
				if (fb.IsPlaying && fb.PlaybackLength <= 0) return tfo.Eval();
				handle = fb.GetFocusItem();
				return handle ? tfo.EvalWithMetadb(handle) : '';
			case 'nowplayingorselected':
				if (!n) return '';
				tfo = FbTitleFormat(n);
				if (fb.IsPlaying && fb.PlaybackLength <= 0) return tfo.Eval();
				handle = fb.IsPlaying ? fb.GetNowPlaying() : fb.GetFocusItem();
				return handle ? tfo.EvalWithMetadb(handle) : '';
		}
	}

	processCustomTf(s, node) {
		if (typeof s === 'string') {
			const sourceIdx = this.getSourceIdxFromSettings();
			const sourceType = this.getSourceType(sourceIdx);
			const plsIdx = this.getPlaylistSource();
			const sourceName = isArrayEqual(plsIdx, [-1]) ? '' : plsIdx.map((idx) => plman.GetPlaylistName(idx)).join('\', \'');
			const sourceId = isArrayEqual(plsIdx, [-1]) ? '' : plsIdx.map((idx) => plman.GetGUID(idx)).join('\', \'');
			s = s.replace(/\$prefix/gi, ppt.prefix.split('|').join(','))
				.replace(/\$nodename/gi, sanitizeTagTfo((node || {}).nm || '-N/A-'))
				.replace(/\$sourcetype/gi, sanitizeTagTfo(sourceType || '-N/A-'))
				.replace(/\$sourcename/gi, sanitizeTagTfo(sourceName || '-N/A-'))
				.replace(/\$sourcenameortype/gi, sanitizeTagTfo(sourceName || sourceType || '-N/A-'))
				.replace(/\$sourceid/gi, sanitizeTagTfo(sourceId || '-N/A-'))
				.replace(/\$viewname/gi, sanitizeTagTfo(this.grp[ppt.viewBy].name || '-N/A-'))
				.replace(/\$filtername/gi, sanitizeTagTfo(this.filter.mode[ppt.filterBy].name || '-N/A-'));
			while (s.includes('$randfloat{')) {
				const q = s.match(/\$randfloat{(.*?),?(.+?)?}/);
				if (!q) { s = s.replace(/\$randfloat({?.*?}|{?)/, '\'[\'UNKNOWN FUNCTION\']\''); continue; }
				s = s.replace(
					q[0],
					$.round(
						typeof q[2] === 'undefined'
							? Math.randomNum(0, typeof q[1] === 'undefined' ? 1 : Number(q[1]), { includeMax: true })
							: Math.randomNum(Number(q[1]) || 0, typeof q[1] === 'undefined' ? 1 : Number(q[2]) || Infinity, { includeMax: true }),
						2)
				);
			}
			while (s.includes('$randint{')) {
				const q = s.match(/\$randint{(.*?),?(.+?)?}/);
				if (!q) { s = s.replace(/\$randint({?.*?}|{?)/, '\'[\'UNKNOWN FUNCTION\']\''); continue; }
				s = s.replace(
					q[0],
					typeof q[2] === 'undefined'
						? Math.randomInt(0, typeof q[1] === 'undefined' ? 1 : Number(q[1]), true)
						: Math.randomInt(Number(q[1]) || 0, typeof q[1] === 'undefined' ? 1 : Number(q[2]) || Infinity, true)
				);
			}
			let cache = null;
			while (s.includes('$pseudorandfloat{')) {
				const q = s.match(/\$pseudorandfloat{(.*?),?(.+?)?}/);
				if (!q) { s = s.replace(/\$pseudorandfloat({?.*?}|{?)/, '\'[\'UNKNOWN FUNCTION\']\''); continue; }
				if (cache === null) {
					cache = $.round(
						typeof q[2] === 'undefined'
							? Math.randomNum(0, typeof q[1] === 'undefined' ? 1 : Number(q[1]), { includeMax: true })
							: Math.randomNum(Number(q[1]) || 0, typeof q[1] === 'undefined' ? 1 : Number(q[2]) || Infinity, { includeMax: true }),
						2);
				}
				s = s.replace(q[0], cache);
			}
			cache = null;
			while (s.includes('$pseudorandint{')) {
				const q = s.match(/\$pseudorandint{(.*?),?(.+?)?}/);
				if (!q) { s = s.replace(/\$pseudorandint({?.*?}|{?)/, '\'[\'UNKNOWN FUNCTION\']\''); continue; }
				if (cache === null) {
					cache = typeof q[2] === 'undefined'
						? Math.randomInt(0, typeof q[1] === 'undefined' ? 1 : Number(q[1]), true)
						: Math.randomInt(Number(q[1]) || 0, typeof q[1] === 'undefined' ? 1 : Number(q[2]) || Infinity, true);
				}
				s = s.replace(q[0], cache);
			}
			while (s.includes('$iterate{')) {
				const q = s.match(/\$iterate{'(.+?)',?(.+?)?,?(.+?)?}/);
				if (!q) { s = s.replace(/\$iterate({?.*?}|{?)/, '\'[\'UNKNOWN FUNCTION\']\''); continue; }
				cache = q[3];
				s = s.replace(
					q[0],
					logicDic.includes(cache)
						? queryJoin(Array.from({ length: q[2] || 1 }, (v, j) => q[1].replace(/\$counter/g, j)), cache)
						: Array.from({ length: q[2] || 1 }, (v, j) => q[1].replace(/\$counter/g, j)).join(cache || '')
							.replaceAll(']¦[', '][¦').replaceAll(']|[', '][|')
				);
			}
			while (s.includes('$meta_branch_remap(')) {
				const q = s.match(/\$meta_branch_remap\((.+?)?\)/);
				if (!q) { s = s.replace(/\$meta_branch_remap(\(?.*?\)|{?)/, '\'[\'UNKNOWN FUNCTION\']\''); continue; }
				cache = (q[1] || '').toUpperCase();
				s = s.replace(
					q[0],
					cache === 'ARTIST'
						? '$if3(%<ARTIST>%,%<ALBUM ARTIST>%,%<COMPOSER>%,%<PERFORMER>%)'
						: cache === 'ALBUM ARTIST'
							? '$if3(%<ALBUM ARTIST>%,%<ARTIST>%,%<COMPOSER>%,%<PERFORMER>%)'
							: cache === 'ALBUM'
								? '$if2(%<ALBUM>%,%<VENUE>%)'
								: cache === 'TRACK ARTIST'
									? '$if($strcmp(%ARTIST%,%ALBUM ARTIST%),$char(8203),%<TRACK ARTIST>%)'
									: '$if($meta_test(' + q[1] + '),%<' + cache + '>%,$char(8203))'
				);
			}
			while (s.includes('$meta_branch(')) {
				const q = s.match(/\$meta_branch\((.+?)?\)/);
				if (!q) { s = s.replace(/\$meta_branch(\(?.*?\)|{?)/, '\'[\'UNKNOWN FUNCTION\']\''); continue; }
				s = s.replace(q[0], '$if($meta_test(' + q[1] + '),$meta_sep(' + q[1] + ',' + this.softSplitter + '),$char(8203))');
			}
			while (s.includes('$nowplaying{')) {
				const q = s.match(/\$nowplaying{(.+?)}/);
				if (!q) { s = s.replace(/\$nowplaying({?.*?}|{?)/, '\'[\'UNKNOWN FUNCTION\']\''); continue; }
				s = s.replace(q[0], this.eval(q[1], 'nowplaying') || '~#No Value For Item#~');
			}
			while (s.includes('$selected{')) {
				const q = s.match(/\$selected{(.+?)}/);
				if (!q) { s = s.replace(/\$selected({?.*?}|{?)/, '\'[\'UNKNOWN FUNCTION\']\''); continue; }
				s = s.replace(q[0], this.eval(q[1], 'selected') || '~#No Value For Item#~');
			}
			while (s.includes('$nowplayingorselected{')) {
				const q = s.match(/\$nowplayingorselected{(.+?)}/);
				if (!q) { s = s.replace(/\$nowplayingorselected({?.*?}|{?)/, '\'[\'UNKNOWN FUNCTION\']\''); continue; }
				s = s.replace(q[0], this.eval(q[1], 'nowplayingorselected') || '~#No Value For Item#~');
			}
			let i = 0;
			while (s.includes('$harmonicsort{')) {
				const q = s.match(/\$harmonicsort{.*?}/);
				if (!q) { s = s.replace(/\$harmonicsort({?.*?}|{?)/, '\'[\'UNKNOWN FUNCTION\']\''); continue; }
				s = s.replace(q[0], '$not(0)$puts(~#sort' + i + ',' + q[0].replace('$', '~#') + ')');
				i++;
			}
			while (s.includes('$harmonicmix{')) {
				const q = s.match(/\$harmonicmix{.*?}/);
				if (!q) { s = s.replace(/\$harmonicmix({?.*?}|{?)/, '\'[\'UNKNOWN FUNCTION\']\''); continue; }
				s = s.replace(q[0], '$not(0)$puts(~#sort' + i + ',' + q[0].replace('$', '~#') + ')');
				i++;
			}
			while (s.includes('$shufflebytags{')) {
				const q = s.match(/\$shufflebytags{.*?}/);
				if (!q) { s = s.replace(/\$shufflebytags({?.*?}|{?)/, '\'[\'UNKNOWN FUNCTION\']\''); continue; }
				s = s.replace(q[0], '$not(0)$puts(~#sort' + i + ',' + q[0].replace('$', '~#') + ')');
				i++;
			}
		}
		return s;
	}

	viewNeedsUpdateTf(callback, s = this.curPattern) {
		switch (callback) {
			case 'playlist': return ['$sourcename', '$sourcenameortype', '$sourceid'].some((v) => s.includes(v));
			case 'source': return ['$sourcetype', '$sourcename', '$sourcenameortype', '$sourceid', '$sourcenameortype'].some((v) => s.includes(v));
		}
	}
	// Regorxxx ->

	// Regorxxx <- Preserve tree sorting at selection
	cleanViewTf(s) {
		s = s.replace(/\$colour{.*?}/gi, '')
			.replace(/\$nodisplay{(.*?)}/gi, '@$1@') // It's used for sorting but not displayed
			.replace(/%<(.*?)>%/gi, (match, group) => {  // Only the first value of a branch tag is used for sorting
				group = (group || '').toUpperCase();
				return group === 'ARTIST'
					? '$if3([$meta(ARTIST,0)],[$meta(ALBUM ARTIST,0)],[$meta(COMPOSER,0)],[$meta(PERFORMER,0)])'
					: group === 'ALBUM ARTIST'
						? '$if3([$meta(ALBUM ARTIST,0)],[$meta(ARTIST,0)],[$meta(COMPOSER,0)],[$meta(PERFORMER,0)])'
						: group === 'ALBUM'
							? '$if3([$meta(ALBUM,0)],[$meta(VENUE,0)],[$meta(COMPOSER,0)],[$meta(PERFORMER,0)])'
							: group === 'TRACK ARTIST'
								? '$if($strcmp(%ARTIST%,%ALBUM ARTIST%),$char(8203),[$meta(ARTIST,0)])'
								: '[$meta(' + group + ',0)]';
			})
			.replace(/\$swapbranchprefix{(.*?)}/gi, '$stripprefix($1)')
			.replace(/\$stripbranchprefix{(.*?)}/gi, '$swapprefix($1)');
		return s;
	}
	// Regorxxx ->

	// Regorxxx <- Expand TF support on view patterns
	getView(view) {
		this.view = view;
		if (!this.folderView) {
			let ix1 = -1;
			let ix2 = -1;
			const findClosingBrace = (str, pos) => {
				let depth = 1;
				for (let l = pos + 1; l < str.length; l++) {
					switch (str[l]) {
						case '{':
							depth++;
							break;
						case '}':
							if (--depth == 0) return l;
							break;
					}
				}
				return -1;
			};
			const indexOfAll = (str, item) => {
				const indices = [];
				for (let pos = str.indexOf(item); pos !== -1; pos = str.indexOf(item, pos + 1)) indices.push(pos);
				return indices.reverse();
			};
			const prefix = ppt.prefix.split('|');
			this.statistics = /play(_|)count|auto(_|)rating/i.test(this.view); // Regorxxx <- Statistics identification should not be case-sensitive ->
			this.view = this.processCustomTf(this.view); // Regorxxx <- Expose custom prefixes as tag ->
			if (this.view.includes('%<') || this.view.includes(this.splitter)) this.multiProcess = true;
			if (this.multiProcess) {
				if (this.view.includes('$swapbranchprefix{') || this.view.includes('$stripbranchprefix{')) this.multiPrefix = true;
				if (ppt.smartSort) { this.playlistSort = this.cleanViewTf(this.view); } // Regorxxx <- Preserve tree sorting at selection | Smart sorting based on view ->
			}
			while (this.view.includes('$stripbranchprefix{')) {
				ix1 = this.view.indexOf('$stripbranchprefix{');
				ix2 = findClosingBrace(this.view, ix1 + 18);
				const mvIndices = indexOfAll(this.view, '%<');
				this.sortBy = this.view = $.replaceAt(this.view, ix2, ',' + prefix + ')');
				mvIndices.forEach(v => {
					if (v > ix1 && v < ix2) this.view = this.view.slice(0, v) + '~~' + this.view.slice(v);
				});
				this.sortBy = this.sortBy.replace(/\$stripbranchprefix{/, '$$stripprefix(').replace(/~~%/, '%');
				this.view = this.view.replace(/\$stripbranchprefix{/, '$$stripprefix(');
			}
			while (this.view.includes('$swapbranchprefix{')) {
				ix1 = this.view.indexOf('$swapbranchprefix{');
				ix2 = findClosingBrace(this.view, ix1 + 17);
				const mvIndices = indexOfAll(this.view, '%<');
				this.sortBy = this.view = $.replaceAt(this.view, ix2, ',' + prefix + ')');
				mvIndices.forEach(v => {
					if (v > ix1 && v < ix2) this.view = this.view.slice(0, v) + '~' + this.view.slice(v);
				});
				this.sortBy = this.sortBy.replace(/\$swapbranchprefix{/, '$$swapprefix(').replace(/~%/, '%');
				this.view = this.view.replace(/\$swapbranchprefix{/, '$$swapprefix(');
			}
			this.sortBy = this.sortBy.trimStart().replace(new RegExp(this.splitter, 'g'), '  ');
			this.view = this.view.trimStart().replace(new RegExp('\\s*' + this.splitter + '\\s*', 'g'), this.softSplitter);
			if (this.multiProcess) {
				this.sortBy = this.sortBy.replace(/[<>]/g, '');
				const baseTag = [];
				const origTag = [];
				const rxp = this.multiPrefix ? /(~~%<|~%<|%<).*?>%/g : /%<.*?>%/g;
				let cur_match;
				while ((cur_match = rxp.exec(this.view))) {
					origTag.push(cur_match[0]);
					baseTag.push(cur_match[0].replace('~~%', '%').replace('~%', '%').replace(/[<>]/g, ''));
				}
				origTag.forEach((v, i) => {
					const qMark = baseTag[i];
					this.view = this.view.replace(new RegExp(v), '$if2(' + v + ',' + qMark + ')');
				});
				this.view = this.view.replace(/%<album artist>%/i, '$if3(%<#ALBUM ARTIST#>%,%<#ARTIST#>%,%<#COMPOSER#>%,%<#PERFORMER#>%)').replace(/%<album>%/i, '$if2(%<#ALBUM#>%,%<#VENUE#>%)').replace(/%<artist>%/i, '$if3(%<ARTIST>%,%<ALBUM ARTIST>%,%<COMPOSER>%,%<PERFORMER>%)').replace(/<#/g, '<').replace(/#>/g, '>');
			}
			if (this.multiProcess) this.view = this.view.replace(/%</g, '#!#$meta_sep(').replace(/>%/g, ',@@)#!#');
			this.sortBy = this.sortBy.replace(/\|/g, this.splitter);
			this.view = this.view.replace(/\|/g, this.splitter);
			if (this.view.includes('$nodisplay{')) this.noDisplay = true;

			while (this.view.includes('$nodisplay{')) {
				ix1 = this.view.indexOf('$nodisplay{');
				ix2 = this.view.indexOf('}', ix1);
				const sub1 = this.view.substring(0, ix1 + 11);
				const sub2 = this.view.substring(ix1 + 11, ix2);
				const sub3 = this.view.substring(ix2);
				this.view = sub1 + sub2.replace(/[\u00a6|]/g, '') + sub3;
				ix1 = this.view.indexOf('$nodisplay{');
				ix2 = this.view.indexOf('}', ix1);
				this.view = $.replaceAt(this.view, ix2, '  #@#');
				this.view = this.view.replace('$nodisplay{', '#@#');
			}
			if (this.colMarker) {
				while (this.view.includes('$colour{')) {
					ix1 = this.view.indexOf('$colour{');
					ix2 = this.view.indexOf('}', ix1);
					this.view = $.replaceAt(this.view, ix2, '@!#');
					this.view = this.view.replace('$colour{', '@!#');
				}
				const colView = this.view.split('@!#');
				colView.forEach((v, i, arr) => {
					if (i % 2 === 1) {
						const colSplit = v.split(',');
						arr[i] = '@!#' + (ui.setMarkerCol(colSplit[0]) || (!ppt.albumArtShow || ppt.albumArtLabelType != 4 ? ui.col.text : $.RGB(240, 240, 240))) + '`' + (ui.setMarkerCol(colSplit[1]) || (ppt.highLightText ? ui.col.text_h : (!ppt.albumArtShow || ppt.albumArtLabelType != 4 ? ui.col.text : $.RGB(240, 240, 240)))) + '`' + (ui.setMarkerCol(colSplit[2]) || (!ppt.albumArtShow || ppt.albumArtLabelType != 4 ? ui.col.textSel : ui.col.text)) + '@!#';
					}
				});
				this.view = colView.join('');
			}
			if (ui.col.counts) this.colMarker = true;
			if (this.colMarker) this.sortBy = this.sortBy.replace(/\$colour{.*?}/g, '');
			while (this.sortBy.includes('$nodisplay{')) {
				ix1 = this.sortBy.indexOf('$nodisplay{');
				ix2 = this.sortBy.indexOf('}', ix1);
				this.sortBy = $.replaceAt(this.sortBy, ix2, '  ');
				this.sortBy = this.sortBy.replace('$nodisplay{', '  ');
			}
			this.sortBy = this.sortBy.replace(new RegExp(this.splitter, 'g'), '  ');
		}
		return this.view;
	}
	// Regorxxx ->

	getFields(view, filter, grpsOnly) {
		this.newView = ppt.viewBy != view;
		ppt.filterBy = filter;
		ppt.viewBy = view;
		let grps = [];
		this.filter.mode = [];
		this.folder_view = 16;
		this.grp = [];
		this.multiPrefix = false;
		this.multiProcess = false;
		this.noDisplay = false;
		this.playlistSort = null; // Regorxxx <- Preserve tree sorting at selection ->
		this.condViewFilter = false; // Regorxxx <- Expand TF support ->
		this.view = '';
		this.view_ppt.forEach((v, i) => {
			if (v.includes('//')) {
				grps = v.split('//');
				this.grp[i] = {
					name: grps[0].trim(),
					type: grps[1]
				};
			}
		});

		grps = [];
		this.filter_ppt.forEach((v, i) => {
			if (v.includes('//')) {
				grps = v.split('//');
				this.filter.mode[i] = {
					name: grps[0].trim(),
					type: grps[1].trim()
				};
			}
		});

		const name = v => v.name;
		const removeEmpty = v => v && v.name != '' && v.type != '';

		this.grp = this.grp.filter(removeEmpty);
		this.filter.mode = this.filter.mode.filter(removeEmpty);
		this.folder_view = this.grp.length - 1;
		ppt.filterBy = Math.min(ppt.filterBy, this.filter.mode.length - 1);
		ppt.viewBy = Math.min(ppt.viewBy, this.grp.length - 1);
		this.folderView = ppt.viewBy == this.folder_view;
		if (grpsOnly) return;
		this.colMarker = this.grp[ppt.viewBy].type.includes('$colour{');
		let valid = false;
		if (ui.img.blurDark && ppt.text_hUse) {
			const c = ppt.text_h.replace(/[^0-9.,-]/g, '').split(/[,-]/);
			if (c.length == 3 || c.length == 4) valid = true;
		}
		this.textDiffHighlight = ui.img.blurDark && !ppt.highLightRow && !(ppt.text_hUse && valid) && ppt.highLightText && !this.colMarker;
		if (this.folderView) {
			this.samePattern = !this.newView && !this.init;
		} else {
			this.sortBy = this.view = this.grp[ppt.viewBy].type;
			this.samePattern = !this.colMarker && this.curPattern == this.view;
		}
		this.curPattern = this.view;
		this.condViewFilter = ['$viewname', '$filtername'].some((s) => this.curPattern.includes(s) || this.filter.mode[ppt.filterBy].name.includes(s)); // Regorxxx <- Expand TF support ->
		this.lines = ppt.albumArtGrpLevel ? ppt.albumArtGrpLevel : img.getArt(ppt.artId).lines; // Regorxxx <- Code cleanup ->

		if (!this.folderView) { this.getView(this.view); } // Regorxxx <- Expand TF support on view patterns ->
		this.pn_h_auto = ppt.pn_h_auto && ppt.rootNode;
		if (this.pn_h_auto) window.MaxHeight = window.MinHeight = ppt.pn_h;
		else {
			window.MaxHeight = 2147483647;
			window.MinHeight = 0;
		}
		this.setRootName();
		this.filter.menu = this.filter.mode.map(name);
		this.menu = this.grp.map(name);
	}

	getFilterIndex(arr, name, type) {
		let findFilterIndex = arr.findIndex(v => v.name === name && v.type === type);
		if (findFilterIndex != -1) ppt.filterBy = findFilterIndex;
		return findFilterIndex;
	}

	getFilters() {
		// Regorxxx <- Default TF for compatibility with all stats components and improved filters
		let pt = [
			['Filter 01: Name // Query', 'Filter // Button Name'],
			['Filter XX: Name // Query', 'Lossless // "$info(ENCODING)" IS lossless'],
			['Filter XX: Name // Query', 'Lossy // "$info(ENCODING)" IS lossy'],
			['Filter XX: Name // Query', 'Missing Replaygain // %REPLAYGAIN_TRACK_GAIN% MISSING AND %TRUEPEAK_SCANNER_TRACK_GAIN% MISSING'],
			['Filter XX: Name // Query', 'separator // .'],
			['Filter XX: Name // Query', 'Never Played // %PLAY_COUNT% MISSING AND %LASTFM_PLAY_COUNT% MISSING AND %2003_PLAYCOUNT% MISSING'],
			['Filter XX: Name // Query', 'Played Often // ' + queryJoin([
				_qCond(globTags.playCount) + ' GREATER 3',
				globQuery.lastPlayedFunc.replaceAll('#QUERYEXPRESSION#', 'DURING LAST 50 WEEKS'),
				_qCond(globTags.playCountRateSinceAdded) + ' GREATER 0'
			])
			],
			['Filter XX: Name // Query', 'Recently Added // ' + globQuery.added + ' SORT BY ' + globTags.added],
			['Filter XX: Name // Query', 'Recently Played // ' + globQuery.recent + ' SORT BY ' + globTags.lastPlayed],
			['Filter XX: Name // Query', 'separator // .'],
			['Filter XX: Name // Query', 'Top Rated // ' + queryJoin([globQuery.fav, '%2003_RATING% EQUAL 10'], 'OR')],
			['Filter XX: Name // Query', 'Not Rated // ' + queryJoin([globQuery.noRating, '%2003_RATING% MISSING'], 'AND')],
			['Filter XX: Name // Query', 'separator // .'],
			['Filter XX: Name // Query', 'Nowplaying Artist // ' + queryCombinationsExpand('$nowplayingorselected{$if2($meta(ARTIST,$counter),DUMMY)}', 'ARTIST', 5, 'OR')],
			['Filter XX: Name // Query', 'Nowplaying Genre // ' + queryJoin(
				[
					queryCombinationsExpand('$nowplayingorselected{$if2($replace($lower($meta(' + globTags.genre + ',$counter)),female vocal,,live,,hi-fi,,instrumental,),DUMMY)}', globTags.genre, 5, 'OR'),
					'ARTIST IS $nowplayingorselected{$if2($meta(ARTIST,0),DUMMY)}'
				],
				'AND NOT'
			)],
			['Filter XX: Name // Query', 'Nowplaying Style // ' + queryJoin(
				[
					queryCombinationsExpand('$nowplayingorselected{$if2($replace($lower($meta(' + globTags.style + ',$counter)),female vocal,,live,,hi-fi,,instrumental,),DUMMY)}', globTags.style, 5, 'OR'),
					'ARTIST IS $nowplayingorselected{$if2($meta(ARTIST,0),DUMMY)}'
				],
				'AND NOT'
			)],
			['Filter XX: Name // Query', 'Nowplaying Decade // "$replace($sub($year(%DATE%),$nowplayingorselected{$year(%DATE%)}),-,)" LESS 10'],
			['Filter XX: Name // Query', 'separator // .'],
			['Filter XX: Name // Query', 'Nowplaying Similar Artists // ' + queryJoin(
				[
					queryJoin(
						[
							queryCombinationsExpand('$nowplayingorselected{$if2($meta(' + globTags.lbSimilarArtist + ',$counter),DUMMY)}', 'ARTIST', 10, 'OR'),
							queryCombinationsExpand('$nowplayingorselected{$if2($meta(' + globTags.sbdSimilarArtist + ',$counter),DUMMY)}', 'ARTIST', 10, 'OR'),
							queryCombinationsExpand('$nowplayingorselected{$if2($meta(' + globTags.lfmSimilarArtist + ',$counter),DUMMY)}', 'ARTIST', 10, 'OR'),
							queryCombinationsExpand('$nowplayingorselected{$if2($meta(' + globTags.related + ',$counter),DUMMY)}', 'ARTIST', 10, 'OR')
						],
						'OR'
					),
					queryCombinationsExpand('$nowplayingorselected{$if2($meta(' + globTags.unrelated + ',$counter),DUMMY)}', 'ARTIST', 10, 'OR')
				],
				'AND NOT'
			)],
			['Filter XX: Name // Query', 'Nowplaying Similar // ' + queryJoin(
				[
					queryJoin(
						[
							globTags.genre + ' MISSING OR (' + queryCombinationsExpand('$nowplayingorselected{$if2($replace($lower($meta(' + globTags.genre + ',$counter)),female vocal,,live,,hi-fi,,instrumental,),DUMMY)}', globTags.genre, 5, 'OR') + ')',
							globTags.style + ' MISSING OR (' + queryCombinationsExpand('$nowplayingorselected{$if2($replace($lower($meta(' + globTags.style + ',$counter)),female vocal,,live,,hi-fi,,instrumental,),DUMMY)}', globTags.style, 5, 'OR') + ')'
						]
					),
					'ARTIST IS $nowplayingorselected{$if2($meta(ARTIST,0),DUMMY)} AND "$replace($sub($year(%DATE%),$nowplayingorselected{$year(%DATE%)}),-,)" LESS 10'
				],
				'AND NOT'
			)],
		].filter(Boolean).map((entry, i) => [entry[0].replace('Filter XX', 'Filter ' + (i + 1).toString().padStart(2, '0')), entry[1]]);;
		// Regorxxx ->

		let grps = [];
		this.defFilterPatterns = pt.map(v => {
			grps = v[1].split('//');
			return {
				name: grps[0].trim(),
				type: grps[1].trim(),
				menu: true
			};
		});

		const dialogFilters = [];
		this.filter_ppt = [];
		let pptNo = 0;
		for (let i = 0; i < pt.length; i++) {
			const v = pt[i];
			const prop = ppt.initialLoadFilters ? ppt.get(v[0], v[1]) : ppt.get(v[0]);
			if (i) {
				if (prop) {
					if (prop.includes('//') || prop.includes('/hide/')) { dialogFilters.push(prop); }
					if (prop.includes('//')) { this.filter_ppt.push(prop); }
				}
				if (prop || prop === null) { pptNo++; }
			} else {
				const defValid = prop && prop.endsWith('// Button Name');
				dialogFilters.push(defValid ? prop : 'Filter // Button Name');
				this.filter_ppt.push(defValid ? prop : 'Filter // Button Name');
				if (!defValid) { ppt.set(v[0], v[1]); }
				pptNo++;
			}
		}

		pt = null;
		let nm = '';
		for (let i = pptNo + 1; i < 100; i++) {
			nm = ppt.get(`Filter ${$.padNumber(i, 2)}: Name // Query`);
			if (nm) {
				if (nm.includes('//') || nm.includes('/hide/')) dialogFilters.push(nm);
				if (nm.includes('//')) this.filter_ppt.push(nm);
			}
		}

		this.dialogFiltGrps = dialogFilters.map(v => {
			if (v.includes('//')) {
				grps = v.split('//');
				return {
					name: grps[0].trim(),
					type: grps[1].trim(),
					menu: true
				};
			} else if (v.includes('/hide/')) {
				grps = v.split('/hide/');
				return {
					name: grps[0].trim(),
					type: grps[1].trim(),
					menu: false
				};
			}
		});

		// move filter button to end
		this.dialogFiltGrps.push(this.dialogFiltGrps.shift());
		this.defFilterPatterns.push(this.defFilterPatterns.shift());
	}

	getViewIndex(arr, name, type) {
		const findViewIndex = arr.findIndex(v => v.name.trim() === name && v.type.trimStart() === type);
		if (findViewIndex != -1) { ppt.viewBy = findViewIndex; }
		return findViewIndex;
	}

	getViews() {
		// Regorxxx <- Improve view patterns. Fixed multiple bugs on automatic group handling for default view patterns and cases where a default group was not found.
		let pt = [
			['View 01: Name // Pattern', 'View by Folder Structure // Pattern Not Configurable', void (0), void (0), 1],
			['View XX: Name // Pattern', 'View by Artist | Album // $swapbranchprefix{%<ARTIST>%}|%ALBUM%$nodisplay{%COMMENT%-%MUSICBRAINZ_ALBUMID%}|[[%DISCNUMBER%.]%TRACKNUMBER%. ][%TRACK ARTIST% - ]%TITLE%', 'Artist', 'Album', [2, 2, 2, 1, 1]],
			['View XX: Name // Pattern', 'View by Artist | Album (year) // $swapbranchprefix{%<ARTIST>%}|$year(%DATE%) - %ALBUM%$nodisplay{%COMMENT%-%MUSICBRAINZ_ALBUMID%}|[[%DISCNUMBER%.]%TRACKNUMBER%. ][%TRACK ARTIST% - ]%TITLE%', 'Artist', 'Album', [2, 2, 2, 1, 1]],
			['View XX: Name // Pattern', 'View by Album Artist | Album // $swapbranchprefix{$if2(%<ALBUM ARTIST>%,%<ARTIST>%)}|%ALBUM%$nodisplay{%COMMENT%-%MUSICBRAINZ_ALBUMID%}|[[%DISCNUMBER%.]%TRACKNUMBER%. ][%TRACK ARTIST% - ]%TITLE%', 'Album Artist', 'Album', [2, 2, 2, 1, 1]],
			['View XX: Name // Pattern', 'View by Album Artist | Album (year) // $swapbranchprefix{$if2(%<ALBUM ARTIST>%,%<ARTIST>%)}|$year(%DATE%) - %ALBUM%$nodisplay{%COMMENT%-%MUSICBRAINZ_ALBUMID%}|[[%DISCNUMBER%.]%TRACKNUMBER%. ][%TRACK ARTIST% - ]%TITLE%', 'Album Artist', 'Album', [2, 2, 2, 1, 1]],
			['View XX: Name // Pattern', 'View by Album Artist - Album // [$swapprefix(%ALBUM ARTIST%,$prefix) - ][\'[\'%date%\']\' ]%ALBUM%$nodisplay{%COMMENT%-%MUSICBRAINZ_ALBUMID%}|[[%DISCNUMBER%.]%TRACKNUMBER%. ][%TRACK ARTIST% - ]%TITLE%', 'Album', 'Track', 1],
			['View XX: Name // Pattern', 'View by Artist initial | Artist // $puts(initial,$upper($cut($replace($swapprefix(%ARTIST%,$prefix),$char(33),,$char(34),,$char(35),,$char(36),,$char(37),,$char(38),,$char(39)$char(39),,$char(39),,,$char(40),,$char(41),,$char(42),,$char(43),,$char(44),,$char(45),,$char(46),,$char(47),),1)))$if($stricmp($ascii($get(initial)),?),$get(initial),$ascii($get(initial)))|%ARTIST%|$if2(%ALBUM%$nodisplay{%COMMENT%-%MUSICBRAINZ_ALBUMID%},εXtra)|[[%DISCNUMBER%.]%TRACKNUMBER%. ][%TRACK ARTIST% - ]%TITLE%', 'Artist Initial', 'Artist', [2, 2, 2, 1, 1]],
			['View XX: Name // Pattern', 'View by Album // %ALBUM%[ \'[\'$if2($meta(ALBUM ARTIST),$meta(ARTIST,0))\']\']$nodisplay{%COMMENT%-%MUSICBRAINZ_ALBUMID%}|[[%DISCNUMBER%.]%TRACKNUMBER%. ][%TRACK ARTIST% - ]%TITLE%', 'Album', 'Track', 1],
			['View XX: Name // Pattern', 'View by Album (year) // $year(%DATE%) - %ALBUM%[ \'[\'$if2($meta(ALBUM ARTIST),$meta(ARTIST,0))\']\']$nodisplay{%COMMENT%-%MUSICBRAINZ_ALBUMID%}|[[%DISCNUMBER%.]%TRACKNUMBER%. ][%TRACK ARTIST% - ]%TITLE%', 'Album', 'Track', 1],
			['View XX: Name // Pattern', 'separator // .'],
			['View XX: Name // Pattern', 'View by Artist initial (facets) // $puts(initial,$upper($cut($replace($swapprefix(%ARTIST%,$prefix),$char(33),,$char(34),,$char(35),,$char(36),,$char(37),,$char(38),,$char(39)$char(39),,$char(39),,,$char(40),,$char(41),,$char(42),,$char(43),,$char(44),,$char(45),,$char(46),,$char(47),),1)))$if($stricmp($ascii($get(initial)),?),$get(initial),$ascii($get(initial)))', 'Artist Initial', 'Artist', [2, 2, 2, 1, 1]],
			['View XX: Name // Pattern', 'View by Album (facets) // $nodisplay{$year(%DATE%)}%ALBUM%$nodisplay{%COMMENT%-%MUSICBRAINZ_ALBUMID%} \'[\'$year(%DATE%)\']\'|[[%DISCNUMBER%.]%TRACKNUMBER%. ][%TRACK ARTIST% - ]%TITLE%', 'Album', 'Track', 1],
			['View XX: Name // Pattern', 'View by Album - Title (queue) // [$swapprefix(%ALBUM ARTIST%,$prefix) - ][\'[\'%date%\']\' ]%ALBUM%$nodisplay{%COMMENT%-%MUSICBRAINZ_ALBUMID%} - [[%DISCNUMBER%.]%TRACKNUMBER%. ][%TRACK ARTIST% - ]%TITLE%', 'Album', 'Track', 1],
			['View XX: Name // Pattern', 'View by Date - Title (queue) // [$swapprefix(%ARTIST%,$prefix) - ][\'[\'%date%\']\' ][[%DISCNUMBER%.]%TRACKNUMBER%. ][%TRACK ARTIST% - ]%TITLE%$nodisplay{%COMMENT%-%MUSICBRAINZ_ALBUMID%}', 'Date', 'Track', 1],
			['View XX: Name // Pattern', 'View by Artist | Title (queue) // $swapprefix($if2($meta(ALBUM ARTIST),$meta(ARTIST,0)),$prefix)|%TITLE%$nodisplay{%COMMENT%-%MUSICBRAINZ_ALBUMID%}', 'Artist', 'Track', 1],
			['View XX: Name // Pattern', 'View by Title (queue) // [$swapprefix(%ALBUM ARTIST%,$prefix) - ]%TITLE%$nodisplay{%COMMENT%-%MUSICBRAINZ_ALBUMID%}', 'Track', 'Track', 1],
			['View XX: Name // Pattern', 'separator // .'],
			['View XX: Name // Pattern', 'View by Genre // %<GENRE>%|[%ALBUM ARTIST% - ]%ALBUM%$nodisplay{%COMMENT%-%MUSICBRAINZ_ALBUMID%}|[[%DISCNUMBER%.]%TRACKNUMBER%. ][%TRACK ARTIST% - ]%TITLE%', 'Genre', 'Album', 1],
			['View XX: Name // Pattern', 'View by Style // %<STYLE>%|[%ALBUM ARTIST% - ]%ALBUM%$nodisplay{%COMMENT%-%MUSICBRAINZ_ALBUMID%}|[[%DISCNUMBER%.]%TRACKNUMBER%. ][%TRACK ARTIST% - ]%TITLE%', 'Style', 'Album', 1],
			['View XX: Name // Pattern', 'View by Genre tree // %<GENRE>%|%<STYLE>%|[%ALBUM ARTIST% - ]%ALBUM%$nodisplay{%COMMENT%-%MUSICBRAINZ_ALBUMID%}|[[%DISCNUMBER%.]%TRACKNUMBER%. ][%TRACK ARTIST% - ]%TITLE%', 'Genre', 'Style', 1],
			['View XX: Name // Pattern', 'separator // .'],
			['View XX: Name // Pattern', 'View by Year // $year(%DATE%)|[%ALBUM ARTIST% - ]%ALBUM%$nodisplay{%COMMENT%-%MUSICBRAINZ_ALBUMID%}|[[%DISCNUMBER%.]%TRACKNUMBER%. ][%TRACK ARTIST% - ]%TITLE%', 'Year', 'Album', 1],
			['View XX: Name // Pattern', 'View by Decade // $div($year(%DATE%),10)0s|[%ALBUM ARTIST% - ]%ALBUM%$nodisplay{%COMMENT%-%MUSICBRAINZ_ALBUMID%}|[[%DISCNUMBER%.]%TRACKNUMBER%. ][%TRACK ARTIST% - ]%TITLE%', 'Decade', 'Album', 1],
		].filter(Boolean).map((entry, i) => [entry[0].replace('View XX', 'View ' + (i + 1).toString().padStart(2, '0')), ...entry.slice(1)]);
		let grps = [];
		this.defViewPatterns = pt.map(v => {
			grps = v[1].split('//');
			return {
				name: grps[0].trim(),
				type: grps[1].trimStart(),
				level1: v[2],
				level2: v[3],
				lines: v[4],
				menu: true
			};
		});

		this.defaultViews = this.defViewPatterns.filter((v) => v.name !== 'separator').map(v => v.type);
		this.defaultViews.shift();

		const albumArtGrpNames = $.jsonParse(ppt.albumArtGrpNames, {});
		this.defViewPatterns.filter((v) => !v.name.startsWith('separator')).forEach((v, i) => {
			if (i === 0) { return; }
			if (!v.name || !v.type || !v.level1 || !v.level2) { console.log(window.ScriptInfo.Name + ': error on default view pattern\n\t ' + JSON.stringify(v)); }
			if (!albumArtGrpNames[`${v.type}1`]) albumArtGrpNames[`${v.type}1`] = v.level1;
			if (!albumArtGrpNames[`${v.type}2`]) albumArtGrpNames[`${v.type}2`] = v.level2;
		});
		// Regorxxx ->

		const dialogViews = [];
		this.view_ppt = [];
		let pptNo = 0;
		for (let i = 0; i < pt.length; i++) {
			const v = pt[i];
			const prop = ppt.initialLoadViews ? ppt.get(v[0], v[1]) : ppt.get(v[0]);
			if (i) {
				if (prop) {
					if (prop.includes('//') || prop.includes('/hide/')) { dialogViews.push(prop); }
					if (prop.includes('//')) { this.view_ppt.push(prop); }
				}
				if (prop || prop === null) { pptNo++; }
			} else {
				const defValid = prop && prop.endsWith('// Pattern Not Configurable');
				dialogViews.push(defValid ? prop : 'View by Folder Structure // Pattern Not Configurable');
				this.view_ppt.push(defValid ? prop : 'View by Folder Structure // Pattern Not Configurable');
				if (!defValid) { ppt.set(v[0], v[1]); }
				pptNo++;
			}
		}

		pt = null;

		let nm = '';
		for (let i = pptNo + 1; i < 100; i++) {
			nm = ppt.get(`View ${$.padNumber(i, 2)}: Name // Pattern`);
			if (nm) {
				if (nm.includes('//') || nm.includes('/hide/')) dialogViews.push(nm);
				if (nm.includes('//')) this.view_ppt.push(nm);
			}
		}

		nm = '';
		this.propNames = [];
		for (let i = 1; i < 100; i++) {
			const propName = `View ${$.padNumber(i, 2)}: Name // Pattern`;
			nm = ppt.get(propName);
			if (nm) {
				if (nm.includes('//')) {
					this.propNames.push(propName);
				}
			}
		}
		this.propNames.shift();

		this.dialogGrps = dialogViews.map(v => {
			if (v.includes('//')) {
				grps = v.split('//');
				return {
					name: grps[0].trim(),
					type: grps[1].trimStart(),
					menu: true
				};
			} else if (v.includes('/hide/')) {
				grps = v.split('/hide/');
				return {
					name: grps[0].trim(),
					type: grps[1].trimStart(),
					menu: false
				};
			}
		});

		// move folder structure to end
		this.dialogGrps.push(this.dialogGrps.shift());
		this.defViewPatterns.push(this.defViewPatterns.shift());
		this.view_ppt.push(this.view_ppt.shift());

		const albumArtGrpNameKeys = Object.keys(albumArtGrpNames);
		if (albumArtGrpNameKeys.length > 100) {
			let keysPresent = this.dialogGrps.map(v => `${v.type}1`);
			albumArtGrpNameKeys.forEach(v => {
				if (!keysPresent.includes(`${v}1`)) delete albumArtGrpNames[`${v}1`];
			});
			keysPresent = this.dialogGrps.map(v => `${v.type}2`);
			albumArtGrpNameKeys.forEach(v => {
				if (!keysPresent.includes(`${v}2`)) delete albumArtGrpNames[`${v}2`];
			});
		}
		ppt.albumArtGrpNames = JSON.stringify(albumArtGrpNames);
	}

	load() {
		ppt.nodeLines = true;
		ppt.nodeCounts = 1;
		ppt.sbarButType = 0;
		ppt.searchShow = true;
		ppt.filterShow = true;
		ppt.settingsShow = true;
		window.Reload();
	}

	on_size(fontChanged) {
		const ln_sp = ui.style.topBarShow ? Math.floor(ui.row.h * 0.1) : 0; // Regorxxx <- Code cleanup. Remove ui.id.local references ->
		const sbarStyle = ppt.sbarFullHeight ? 0 : 2;
		this.calcText();
		this.ln.x = ppt.countsRight || ppt.itemShowStatistics || ppt.rowStripes || ppt.fullLineSelection || pop.inlineRoot ? 0 : ui.sz.marginSearch;
		this.ln.w = ui.w - this.ln.x - 1;
		// Regorxxx <- Code cleanup. Remove ui.id.local references
		this.search.h = ui.style.topBarShow
			? ui.row.h + ln_sp * 2
			: ppt.marginTopBottom;
		// Regorxxx ->
		this.search.sp = this.search.h - ln_sp;
		let sp = ui.h - this.search.h - (ui.style.topBarShow ? 0 : ppt.marginTopBottom);
		this.rows = sp / ui.row.h;
		this.rows = Math.floor(this.rows);
		sp = ui.row.h * this.rows;
		this.node_y = Math.round((ui.row.h - ui.sz.node) / 1.75);
		this.filter.y = sp + this.search.h - ui.row.h * 0.9;
		if (this.init || fontChanged || !this.tree.y) this.tree.y = this.search.h;
		this.paint_y = Math.floor(ui.style.topBarShow || !ppt.sbarShow ? this.search.h : 0);

		const sbar_top = ui.sbar.type ? ui.style.topBarShow ? 3 : 0 : 5;
		const sbar_bot = ui.sbar.type ? 0 : 5;
		this.sbar_o = [ui.sbar.arrowPad, Math.max(Math.floor(ui.sbar.but_w * 0.2), 2) + ui.sbar.arrowPad * 2, 0][ui.sbar.type];
		const vertical = !ppt.albumArtFlowMode || ui.h - this.search.h > ui.w - ui.sbar.w;
		switch (true) {
			case !this.imgView || vertical: {
				this.sbar_x = ui.w - ui.sbar.sp;
				const top_corr = [this.sbar_o - (ui.sbar.but_h - ui.sbar.but_w) / 2, this.sbar_o, 0][ui.sbar.type];
				const bot_corr = [(ui.sbar.but_h - ui.sbar.but_w) / 2 - this.sbar_o, -this.sbar_o, 0][ui.sbar.type];
				let sbar_y = (ui.sbar.type < sbarStyle || ui.style.topBarShow ? this.search.sp + 1 : 0) + sbar_top + top_corr;
				let sbar_h = ui.sbar.type < sbarStyle ? sp + 1 - sbar_top - sbar_bot + bot_corr * 2 : ui.h - sbar_y - sbar_bot + bot_corr;
				if (ui.sbar.type == 2) {
					sbar_y += 1;
					sbar_h -= 2;
				}
				sbar.metrics(this.sbar_x, sbar_y, ui.sbar.w, sbar_h, this.rows, ui.row.h, this.imgView ? vertical : true);
				if (this.imgView) img.metrics();
				break;
			}
			case !vertical: {
				this.sbar_y = ui.h - ui.sbar.sp;
				let sbar_x = 0;
				let sbar_w = ui.w;
				if (ui.sbar.type == 2) {
					sbar_x += 1;
					sbar_w -= 2;
				}
				sbar.metrics(sbar_x, this.sbar_y, sbar_w, ui.sbar.w, this.rows, ui.row.h, !this.imgView);
				if (this.imgView) img.metrics();
				break;
			}
		}
		if (this.imgView) {
			if (this.init) img.sizeDebounce();
			else if (sbar.scroll > sbar.max_scroll) sbar.checkScroll(sbar.max_scroll);
		}
	}

	// Regorxxx <- Fix HTML options panel error on panel reload when changing current library view or filter
	reOpen() {
		removeEventListeners('on_paint'); // Avoid library processing
		lib.logTree();
		ppt.set('Library Tree Dialog Box Reopen', true);
		return window.Reload();
	}
	// Regorxxx ->

	open(page) {
		const ok_callback = (new_cfg, new_ppt, type, new_cfgWindow) => {
			if (new_cfg) {
				let cfg = $.jsonParse(new_cfg, []);
				this.clear('both');
				let i = cfg[0].length;
				while (i--)
					if (!cfg[0][i].type) cfg[0].splice(i, 1);
				cfg[0].forEach((v, i) => {
					const nm = v.type ? v.name + (v.menu ? ' // ' : ' /hide/ ') + v.type : null;
					ppt.set(v.type == 'Pattern Not Configurable' ? 'View 01: Name // Pattern' : `View ${$.padNumber(i + 2, 2)}: Name // Pattern`, nm);
				});
				i = cfg[1].length;
				while (i--)
					if (!cfg[1][i].type) cfg[1].splice(i, 1);
				cfg[1].forEach((v, i) => {
					const nm = v.type ? v.name + (v.menu ? ' // ' : ' /hide/ ') + v.type : null;
					ppt.set(v.type == 'Button Name' ? 'Filter 01: Name // Query' : `Filter ${$.padNumber(i + 2, 2)}: Name // Query`, nm);
				});
				const view_name = this.grp[ppt.viewBy].name;
				const view_type = this.grp[ppt.viewBy].type.trimStart();
				const filter_name = this.filter.mode[ppt.filterBy].name;
				const filter_type = this.filter.mode[ppt.filterBy].type;
				this.getViews();
				this.getFilters();
				this.getFields(ppt.viewBy, ppt.filterBy, true);
				// Regorxxx <- Fix HTML options panel error on panel reload when changing current library view or filter
				if (this.getViewIndex(this.grp, view_name, view_type) === -1 || this.getFilterIndex(this.filter.mode, filter_name, filter_type) === -1) { return this.reOpen(); }
				else { this.getFields(ppt.viewBy, ppt.filterBy); }
				// Regorxxx ->
			}
			const filterDuplBy = ppt.filterDuplBy; // Regorxxx <- Global duplicates filter ->
			if (new_ppt) this.updateProp($.jsonParse(new_ppt, {}), 'value');

			if (new_cfgWindow) ppt.set('Library Tree Dialog Box', new_cfgWindow);
			ppt.set('Library Tree Dialog Box Reopen', false); // Regorxxx <- Fix HTML options panel error on panel reload when changing current library view or filter ->

			if (type == 'reset') {
				this.updateProp(ppt, 'default_value');
			}

			if (ppt.filterDupl && filterDuplBy !== ppt.filterDuplBy) { return this.reOpen(); } // Regorxxx <- Global duplicates filter ->
			return true;
		};

		this.getViews();
		let cfgWindow = ppt.get('Library Tree Dialog Box');
		cfgWindow = $.jsonParse(cfgWindow);
		if (typeof page !== 'undefined') { cfgWindow.page = page; }
		cfgWindow.version = `v${window.ScriptInfo.Version}`;
		cfgWindow = JSON.stringify(cfgWindow);
		ppt.set('Library Tree Dialog Box', cfgWindow);
		const pptStr = JSON.stringify(ppt)
			.replace(/:\\"\.\//gi, ':\\"' + folders.xxx.replace(/\\/gi, '/')); // Adjust relative paths
		if (popUpBox.isHtmlDialogSupported()) popUpBox.config(JSON.stringify([this.dialogGrps, this.dialogFiltGrps, this.defViewPatterns, this.defFilterPatterns]), pptStr, cfgWindow, ok_callback);
		else {
			popUpBox.ok = false;
			$.trace('options dialog isn\'t available with current operating system. All settings in options are available in panel properties. Common settings are on the menu.');
		}
	}

	searchPaint() {
		window.RepaintRect(0, 0, ui.w, this.search.h);
	}

	set(n, i, treeArtToggle) {
		// Regorxxx <- Code cleanup | New quicksetup presets
		switch (n) {
			case 'quickSetup': {
				let applySettings, caption, prompt;
				switch (i) {
					case 0: {
						applySettings = (status, confirmed) => {
							if (confirmed) {
								ppt.countsRight = false;
								ppt.itemShowStatistics = 0;
								ppt.nodeStyle = 0;
								ppt.inlineRoot = false;
								ppt.autoCollapse = false;
								ppt.treeAutoExpandSingle = false;
								ppt.facetView = false;
								ui.sbar.type = 0;
								ppt.sbarType = 0;
								ppt.sbarShow = 1;
								ppt.fullLineSelection = false;
								ppt.highLightText = false;
								ppt.rowStripes = false;
								ppt.highLightRow = 2;
								ppt.highLightNode = true;
								ppt.verticalPad = 3;
								ppt.rootNode = 1;
								this.imgView = ppt.albumArtShow = false;
								ppt.albumArtLabelType = 1;
								ppt.thumbNailSize = 2;
								ppt.artId = 0;
								this.load();
							}
						};
						caption = 'Quick Setup: Traditional Style';
						prompt = 'This changes various options on the display tab.\n\nContinue?';
						break;
					}
					case 1: {
						applySettings = (status, confirmed) => {
							if (confirmed) {
								ppt.countsRight = true;
								ppt.itemShowStatistics = 0;
								ppt.nodeStyle = 1;
								ppt.inlineRoot = true;
								ppt.autoCollapse = false;
								ppt.treeAutoExpandSingle = false;
								ppt.facetView = false;
								ui.sbar.type = 1;
								ppt.sbarType = 1;
								ppt.sbarShow = 1;
								ppt.fullLineSelection = true;
								ppt.highLightText = false;
								ppt.rowStripes = true;
								ppt.highLightRow = 2;
								ppt.highLightNode = true;
								ppt.verticalPad = 5;
								ppt.rootNode = 3;
								this.imgView = ppt.albumArtShow = false;
								ppt.albumArtLabelType = 1;
								ppt.thumbNailSize = 2;
								ppt.artId = 0;
								this.load();
							}
						};
						caption = 'Quick Setup: Modern Style';
						prompt = 'This changes various options on the display tab.\n\nContinue?';
						break;
					}
					case 2: {
						applySettings = (status, confirmed) => {
							if (confirmed) {
								ppt.countsRight = true;
								ppt.itemShowStatistics = 1;
								ppt.nodeStyle = 3;
								ppt.inlineRoot = true;
								ppt.autoCollapse = true;
								ppt.treeAutoExpandSingle = true;
								ppt.facetView = false;
								ui.sbar.type = 1;
								ppt.sbarType = 1;
								ppt.sbarShow = 1;
								ppt.fullLineSelection = true;
								ppt.highLightText = false;
								ppt.rowStripes = true;
								ppt.highLightRow = 1;
								ppt.highLightNode = false;
								ppt.verticalPad = 5;
								ppt.rootNode = 3;
								this.imgView = ppt.albumArtShow = false;
								if (!ppt.presetLoadCurView) ppt.viewBy = 1;
								ppt.albumArtFlowMode = false;
								ppt.albumArtLabelType = 1;
								ppt.albumArtFlipLabels = true;
								ppt.imgStyleFront = 1;
								ppt.itemOverlayType = 1;
								ppt.thumbNailSize = 2;
								ppt.artId = 0;
								ppt.albumArtGrpLevel = 0;
								ppt.artId = 0;
								this.load();
							}
						};
						caption = 'Quick Setup: Ultra Modern Style';
						prompt = 'This changes various options on the display tab.\n\nContinue?';
						break;
					}
					case 3: {
						applySettings = (status, confirmed) => {
							if (confirmed) {
								ppt.countsRight = true;
								ppt.itemShowStatistics = 0;
								ppt.nodeStyle = 5;
								ppt.inlineRoot = true;
								ppt.autoCollapse = false;
								ppt.treeAutoExpandSingle = false;
								ppt.facetView = false;
								ui.sbar.type = 0;
								ppt.sbarType = 0;
								ppt.sbarShow = 1;
								ppt.fullLineSelection = true;
								ppt.highLightText = true;
								ppt.rowStripes = false;
								ppt.highLightRow = 0;
								ppt.highLightNode = true;
								ppt.verticalPad = 5;
								ppt.rootNode = 3;
								this.imgView = ppt.albumArtShow = false;
								ppt.albumArtLabelType = 1;
								ppt.thumbNailSize = 2;
								ppt.artId = 0;
								this.load();
							}
						};
						caption = 'Quick Setup: Clean';
						prompt = 'This changes various options on the display tab.\n\nContinue?';
						break;
					}
					case 4: {
						applySettings = (status, confirmed) => {
							if (confirmed) {
								ppt.countsRight = true;
								ppt.itemShowStatistics = 0;
								ppt.nodeStyle = 1;
								ppt.inlineRoot = true;
								ppt.autoCollapse = false;
								ppt.treeAutoExpandSingle = false;
								ppt.facetView = true;
								this.imgView = ppt.albumArtShow = false;
								ppt.albumArtLabelType = 1;
								ppt.thumbNailSize = 2;
								ppt.artId = 0;
								ui.sbar.type = 1;
								ppt.sbarType = 1;
								ppt.sbarShow = 1;
								ppt.fullLineSelection = true;
								ppt.highLightText = false;
								ppt.rowStripes = true;
								ppt.highLightRow = 2;
								ppt.highLightNode = true;
								ppt.verticalPad = 5;
								ppt.rootNode = 3;
								this.load();
							}
						};
						caption = 'Quick Setup: Facet';
						prompt = 'This changes various options on the display tab.\n\nContinue?';
						break;
					}
					case 5: {
						applySettings = (status, confirmed) => {
							if (confirmed) {
								ui.sbar.type = 1;
								ppt.sbarType = 1;
								ppt.sbarShow = 1;
								ppt.fullLineSelection = true;
								ppt.highLightText = false;
								ppt.rowStripes = true;
								ppt.highLightRow = 1;
								ppt.highLightNode = false;
								ppt.verticalPad = 5;
								ppt.rootNode = 3;
								ppt.facetView = false;
								this.imgView = ppt.albumArtShow = true;
								if (!ppt.presetLoadCurView) ppt.viewBy = 1;
								ppt.albumArtFlowMode = false;
								ppt.albumArtLabelType = 2;
								ppt.albumArtFlipLabels = true;
								ppt.itemShowStatistics = 1;
								ppt.imgStyleFront = 1;
								ppt.itemOverlayType = 2;
								ppt.thumbNailSize = 2;
								ppt.artId = 0;
								ppt.albumArtGrpLevel = 0;
								this.load();
							}
						};
						caption = 'Quick Setup: Covers [Labels Right]';
						prompt = 'This changes various options on the display and album art tabs.\n\nContinue?';
						break;
					}
					case 6: {
						applySettings = (status, confirmed) => {
							if (confirmed) {
								ui.sbar.type = 1;
								ppt.sbarType = 1;
								ppt.sbarShow = 1;
								ppt.fullLineSelection = true;
								ppt.highLightText = false;
								ppt.rowStripes = true;
								ppt.highLightRow = 1;
								ppt.highLightNode = false;
								ppt.verticalPad = 5;
								ppt.rootNode = 3;
								ppt.facetView = false;
								this.imgView = ppt.albumArtShow = true;
								if (!ppt.presetLoadCurView) ppt.viewBy = 1;
								ppt.albumArtFlowMode = false;
								ppt.albumArtLabelType = 1;
								ppt.albumArtFlipLabels = true;
								ppt.itemShowStatistics = 0;
								ppt.imgStyleFront = 1;
								ppt.itemOverlayType = 1;
								ppt.thumbNailSize = 2;
								ppt.artId = 0;
								ppt.albumArtGrpLevel = 0;
								this.load();
							}
						};
						caption = 'Quick Setup: Covers [Labels Bottom]';
						prompt = 'This changes various options on the display and album art tabs.\n\nContinue?';
						break;
					}
					case 7: {
						applySettings = (status, confirmed) => {
							if (confirmed) {
								ui.sbar.type = 1;
								ppt.sbarType = 1;
								ppt.sbarShow = 1;
								ppt.fullLineSelection = true;
								ppt.highLightText = false;
								ppt.rowStripes = true;
								ppt.highLightRow = 1;
								ppt.highLightNode = false;
								ppt.verticalPad = 5;
								ppt.rootNode = 3;
								ppt.facetView = false;
								this.imgView = ppt.albumArtShow = true;
								if (!ppt.presetLoadCurView) ppt.viewBy = 1;
								ppt.albumArtFlowMode = false;
								ppt.albumArtLabelType = 4;
								ppt.albumArtFlipLabels = true;
								ppt.itemShowStatistics = 0;
								ppt.imgStyleFront = 1;
								ppt.itemOverlayType = 0;
								ppt.thumbNailSize = 3;
								ppt.artId = 0;
								ppt.albumArtGrpLevel = 0;
								this.load();
							}
						};
						caption = 'Quick Setup: Covers [Labels Blend]';
						prompt = 'This changes various options on the display and album art tabs.\n\nContinue?';
						break;
					}
					case 8: {
						applySettings = (status, confirmed) => {
							if (confirmed) {
								ui.sbar.type = 1;
								ppt.sbarType = 1;
								ppt.sbarShow = 1;
								ppt.fullLineSelection = true;
								ppt.highLightText = false;
								ppt.rowStripes = true;
								ppt.highLightRow = 1;
								ppt.highLightNode = false;
								ppt.verticalPad = 5;
								ppt.rootNode = 3;
								ppt.facetView = false;
								this.imgView = ppt.albumArtShow = true;
								if (!ppt.presetLoadCurView) ppt.viewBy = 0;
								ppt.albumArtFlowMode = false;
								ppt.albumArtLabelType = 2;
								ppt.itemShowStatistics = 0;
								ppt.imgStyleArtist = 2;
								ppt.itemOverlayType = 0;
								ppt.thumbNailSize = 1;
								ppt.artId = 4;
								ppt.albumArtGrpLevel = 0;
								this.load();
							}
						};
						caption = 'Quick Setup: Artist Photos [Labels Right]';
						prompt = 'This changes various options on the display and album art tabs.\n\nContinue?';
						break;
					}
					case 9: ppt.thumbNailSize++; this.load(); break;
					case 10: ppt.thumbNailSize--; this.load(); break;
					case 11: {
						applySettings = (status, confirmed) => {
							if (confirmed) {
								ppt.countsRight = true;
								ppt.nodeStyle = 1;
								ppt.inlineRoot = true;
								ppt.autoCollapse = false;
								ppt.treeAutoExpandSingle = false;
								ppt.facetView = false;
								this.imgView = ppt.albumArtShow = true;
								if (!ppt.presetLoadCurView) ppt.viewBy = 1;
								ppt.albumArtFlowMode = true;
								ppt.albumArtLabelType = 1;
								ppt.itemShowStatistics = 0;
								ppt.imgStyleFront = 1;
								ppt.itemOverlayType = 0;
								ppt.thumbNailSize = 2;
								if (!ppt.presetLoadCurView) ppt.artId = 0;
								ppt.albumArtGrpLevel = 0;
								this.load();
							}
						};
						caption = 'Quick Setup: Flow Mode';
						prompt = 'This changes various options on the display and album art tabs.\n\nContinue?';
						break;
					}
					case 12:
						ppt.toggle('presetLoadCurView');
						return;
					case 13: {
						applySettings = (status, confirmed) => {
							if (confirmed) {
								ppt.libSource = 3;
								ppt.queueSorting = true;
								ppt.countsRight = true;
								ppt.itemShowStatistics = 7;
								ppt.inlineRoot = true;
								ppt.autoCollapse = false;
								ppt.treeAutoExpandSingle = false;
								ppt.facetView = false;
								if (!ppt.presetLoadCurView) {
									const viewBy = this.grp.findIndex((gr) => gr.name === 'View by Date - Title (queue)');
									if (viewBy !== -1) { ppt.viewBy = viewBy; }
								}
								ui.sbar.type = 1;
								ppt.sbarType = 1;
								ppt.sbarShow = 1;
								ppt.rootNode = 0;
								ppt.albumArtGrpLevel = 0;
								this.load();
							}
						};
						caption = 'Quick Setup: Playback Queue viewer';
						prompt = 'This changes various options on the display tab, views and source settings.\n\nContinue?';
						break;
					}
					case 14: {
						applySettings = (status, confirmed) => {
							if (confirmed) {
								ppt.libSource = 3;
								ppt.queueSorting = true;
								ppt.countsRight = true;
								ppt.nodeStyle = 1;
								ppt.itemShowStatistics = 7;
								ppt.inlineRoot = true;
								ppt.autoCollapse = false;
								ppt.treeAutoExpandSingle = false;
								ppt.facetView = false;
								if (!ppt.presetLoadCurView) {
									const viewBy = this.grp.findIndex((gr) => gr.name === 'View by Artist | Title (queue)');
									if (viewBy !== -1) { ppt.viewBy = viewBy; }
									ppt.artId = 0;
								}
								ui.sbar.type = 1;
								ppt.sbarType = 1;
								ppt.sbarShow = 1;
								ppt.rootNode = 0;
								ppt.albumArtLabelType = 3;
								ppt.itemOverlayType = 2;
								this.imgView = ppt.albumArtShow = true;
								ppt.albumArtFlowMode = true;
								ppt.imgStyleFront = 1;
								ppt.thumbNailSize = 2;
								ppt.albumArtGrpLevel = 2;
								this.load();
							}
						};
						caption = 'Quick Setup: Playback Queue flow';
						prompt = 'This changes various options on the display and art tabs, views and source settings.\n\nContinue?';
						break;
					}
				}
				if (applySettings) {
					const wsh = popUpBox.isHtmlDialogSupported()
						? popUpBox.confirm(caption, prompt, 'Yes', 'No', '', '', applySettings)
						: true;
					if (wsh) { applySettings('ok', $.wshPopup(prompt, caption)); }
				}
				break;
			}
			// Regorxxx ->
			case 'Filter':
				lib.searchCache = {};
				pop.cache.filter = {};
				pop.cache.search = {};
				if (i === this.filter.menu.length) {
					ppt.toggle('reset');
					if (ppt.reset) {
						this.searchPaint();
						lib.treeState(true, 2);
					}
				} else {
					// Regorxxx <- Preset rules
					if (ppt.presetRulesOnFilterUse) {
						const rule = this.getPresetRule({ filterBy: i });
						if (this.applyPresetRule(rule)) { break; };
					}
					// Regorxxx ->
					ppt.filterBy = i;
					if (this.condViewFilter) { this.getFields(ppt.viewBy, ppt.filterBy); }
					but.multiBtnSetName(this.filter.mode[ppt.filterBy].name, false); // Regorxxx <- Filter / View / Source button ->
					this.calcText();
					if (this.search.txt) lib.upd_search = true;
					if (!ppt.reset) {
						const ix = pop.get_ix(this.imgView ? img.panel.x + 1 : 0, (!this.imgView || img.style.vertical ? this.tree.y : this.tree.x) + sbar.row.h / 2, true, false);
						let l = Math.min(Math.floor(ix + this.rows), pop.tree.length);
						if (ix != -1) {
							for (i = ix; i < l; i++) {
								if (pop.tree[i].sel) {
									sbar.checkScroll(sbar.row.h * i, 'full', true);
									lib.logTree();
									break;
								}
							}
						}
						if (!ppt.rememberTree && !ppt.reset) { lib.logTree(); }
						else if (ppt.rememberTree) { lib.logFilter(); }
					}
					lib.getLibrary();
					lib.rootNodes(ppt.reset ? 0 : 1, true);
					but.refresh(true);
					this.searchPaint();
					if (!pop.notifySelection()) {
						const list = !this.search.txt.length || !lib.list.Count ? lib.list : this.list;
						window.NotifyOthers(window.Name, ppt.filterBy ? list : new FbMetadbHandleList());
					}
					if (ppt.searchSend == 2 && this.search.txt.length) pop.load({ handleList: this.list, bAddToPls: false, bAutoPlay: false, bUseDefaultPls: true, bInsertToPls: false }); // Regorxxx <- Code cleanup ->
				}
				pop.checkAutoHeight();
				break;
			case 'view': {
				if (this.colMarker) this.draw = false;
				if (this.search.txt) lib.upd_search = true;
				// Regorxxx <- Preset rules
				const viewBy = i < this.grp.length ? i : ppt.viewBy;
				if (ppt.presetRulesOnViewUse) {
					const rule = this.getPresetRule({ viewBy });
					if (this.applyPresetRule(rule)) { break; };
				}
				this.getFields(viewBy, ppt.filterBy);
				// Regorxxx ->
				this.on_size();
				lib.searchCache = {};
				pop.cache = {
					'standard': {},
					'search': {},
					'filter': {}
				};
				lib.checkView();
				const key = ppt.rememberView ? this.viewName : 'def';
				if ((ppt.rememberView || treeArtToggle) && lib.exp[key]) lib.readTreeState(false, treeArtToggle);
				lib.getLibrary(treeArtToggle);
				lib.rootNodes((ppt.rememberView || treeArtToggle), !!(ppt.rememberView || treeArtToggle));
				if (ppt.rememberView) {
					this.calcText();
					but.refresh(true);
					this.searchPaint();
					lib.logTree();
					if (!pop.notifySelection()) {
						const list = !this.search.txt.length || !lib.list.Count ? lib.list : this.list;
						window.NotifyOthers(window.Name, ppt.filterBy ? list : new FbMetadbHandleList());
					}
				}
				this.draw = true;
				if (ppt.searchSend == 2 && this.search.txt.length) pop.load({ handleList: this.list, bAddToPls: false, bAutoPlay: false, bUseDefaultPls: true, bInsertToPls: false }); // Regorxxx <- Code cleanup ->
				pop.checkAutoHeight();
				break;
			}
		}
	}

	setHeight(n) {
		if (!this.pn_h_auto) return;
		ppt.pn_h = n || this.imgView ? ppt.pn_h_max : ppt.pn_h_min;
		window.MaxHeight = window.MinHeight = ppt.pn_h;
	}

	setRootName() {
		this.sourceName = [this.isAllPlaylistSource() ? 'All playlists' : (this.isPlayingPlaylistSource() ? 'Playing Playlist' : 'Active Playlist'), this.isFixedPlaylistSource() ? ppt.fixedPlaylistName : 'Library', 'Panel', 'Playback Queue', 'Auto-DJ Queue'][ppt.libSource]; // Regorxxx <- Queue source | Auto-DJ source | Active/Playing/All playlist source ->
		this.viewName = this.grp[ppt.viewBy].name;
		switch (ppt.rootNode) {
			case 1:
				this.rootName = ppt.showSource ? this.sourceName : 'All Music';
				break;
			case 2:
				this.rootName = this.viewName + (ppt.showSource ? ' [' + this.sourceName + ']' : '');
				break;
			case 3: {
				const nm = this.viewName.replace(/view by|^by\b/i, '').trim();
				const basenames = nm.split(' ').map(v => pluralize(v));
				const basename = basenames.join(' ').replace(/(album|artist|top|track)s\s/gi, '$1 ').replace(/(similar artist)\s/gi, '$1s ').replace(/years - albums/gi, 'Year - Albums');
				this.rootName = (this.imgView ? `All #^^^^# ${basename}` : `${ppt.showSource ? this.sourceName : 'All'} (#^^^^# ${basename})`);
				this.rootName1 = (this.imgView ? `All 1 ${nm}` : `${ppt.showSource ? this.sourceName : 'All'} (1 ${nm})`);
				break;
			}
		}
	}

	setSelection() {
		const flowMode = this.imgView && ppt.albumArtFlowMode;
		return (flowMode && ppt.flowModeFollowSelection || !flowMode && ppt.stndModeFollowSelection) && (!ppt.followPlaylistFocus || ppt.libSource) && this.m.x == -1;
	}

	setTopBar() {
		let sz = Math.round(12 * $.scale * this.zoomFilter);
		let mod = 0;
		if (sz > 15) mod = (sz % 2) - 1;
		this.filter.font = gdi.Font('Segoe UI', this.zoomFilter > 1.05 ? Math.floor(11 * $.scale * this.zoomFilter) : Math.max(11 * $.scale * this.zoomFilter, 9), 1);
		this.settings.font = gdi.Font('Segoe UI Symbol', sz + mod, 0);
		this.settings.icon = '\uE10C';
		this.settings.offset = Math.round(1 * this.settings.font.Size / 17);
	}

	// Regorxxx <- Support SORT BY query sorting
	sort(li, sortObj) {
		if (sortObj) {
			li.OrderByFormat(sortObj.tf, sortObj.direction);
		} else {
			if (this.isQueueLikeSource() && ppt.queueSorting) { return; } // Regorxxx <- Queue source ->
			if (this.isPlaylistSource() && ppt.plsSorting) { return; } // Regorxxx <- Support playlist sorting ->
			if (this.folderView) {
				li.OrderByRelativePath();
			} else {
				const tfo = FbTitleFormat(this.sortBy);
				li.OrderByFormat(tfo, 1);
			}
		}
	}
	// Regorxxx ->

	treePaint() {
		window.RepaintRect(0, this.paint_y, ui.w, ui.h - this.paint_y + 1);
	}

	updateProp(prop, value) {
		const curActionMode = ppt.actionMode;
		// Regorxxx <- Apply relevant changes on properties update
		let key;
		let bRefreshLib = false;
		const isQueueLike = this.isQueueLikeSource();
		const isPlsLike = this.isPlaylistSource();
		Object.entries(prop).forEach(v => {
			key = v[0].replace('_internal', '');
			if (ppt[key] !== v[1][value]) {
				ppt[key] = v[1][value];
				if (isPlsLike && key === 'plsSorting' || isQueueLike && key === 'queueSorting') { // Regorxxx <- Queue source | Support playlist sorting ->
					bRefreshLib = true;
				}
			}
		});
		// Regorxxx ->

		img.asyncBypass = Date.now();
		img.preLoadItems = [];
		clearInterval(img.timer.preLoad);
		img.timer.preLoad = null;

		pop.autoPlay.send = ppt.autoPlay;
		pop.setActions();
		if (ppt.actionMode != curActionMode) {
			if (ppt.actionMode == 2) {
				ppt.itemShowStatisticsLast = ppt.itemShowStatistics;
				ppt.highLightNowplayingLast = ppt.highLightNowplaying;
				ppt.nowPlayingIndicatorLast = ppt.nowPlayingIndicator;
				ppt.nowPlayingSidemarkerLast = ppt.nowPlayingSidemarker;
				ppt.itemShowStatistics = 7;
				ppt.highLightNowplaying = true;
				ppt.nowPlayingIndicator = true;
				ppt.nowPlayingSidemarker = true;
			} else {
				ppt.itemShowStatistics = ppt.itemShowStatisticsLast;
				ppt.highLightNowplaying = ppt.highLightNowplayingLast;
				ppt.nowPlayingIndicator = ppt.nowPlayingIndicatorLast;
				ppt.nowPlayingSidemarker = ppt.nowPlayingSidemarkerLast;
			}
		}
		ppt.autoExpandLimit = Math.round(ppt.autoExpandLimit);
		if (Number.isNaN(ppt.autoExpandLimit)) { ppt.autoExpandLimit = 350; }
		ppt.autoExpandLimit = $.clamp(ppt.autoExpandLimit, 10, 1000);
		ppt.margin = Math.round(ppt.margin);
		if (Number.isNaN(ppt.margin)) { ppt.margin = 8 * $.scale; }
		ppt.margin = $.clamp(ppt.margin, 0, 100);
		ppt.treeIndent = Math.round(ppt.treeIndent);
		if (Number.isNaN(ppt.treeIndent)) { ppt.treeIndent = 19 * $.scale; }
		ppt.treeIndent = $.clamp(ppt.treeIndent, 0, 100);

		pop.cache = {
			'standard': {},
			'search': {},
			'filter': {}
		};

		pop.setTf(); // Regorxxx <- New statistics. Fix sorting not being applied after HTML options panel change. ->
		pop.setAsyncFunc(); // Throttle selection playlist update | Performance improvements ->

		pop.tree.forEach(v => {
			v.id = '';
			v.count = '';
			delete v.statistics;
			delete v._statistics;
		});
		lib.prefix = ppt.prefix.split('|'); // Regorxxx <- Fix values on reset ->
		// Regorxxx <- Sorting transliteration
		this.sortingTransLangs = ppt.sortingTransLangs.length && ppt.sortingTransLangs.toLowerCase() !== 'el|ru|jp|ch'
			? ppt.sortingTransLangs.split('|').filter(Boolean)
			: null;
		// Regorxxx ->
		// Regorxxx <- Apply relevant changes on properties update
		if (bRefreshLib) {
			lib.treeState(false, 2);
		} else {
			lib.checkView();
			lib.logTree();
		}
		// Regorxxx ->
		img.setRoot();
		ppt.zoomImg = Math.round($.clamp(ppt.zoomImg, 10, 500));

		let o = this.imgView ? 'verticalAlbumArtPad' : 'verticalPad';
		if (ppt[o] === null) { ppt[o] = this.imgView ? 2 : 3; }
		ppt[o] = Math.round(ppt[o]);
		if (Number.isNaN(ppt[o])) { ppt[o] = this.imgView ? 2 : 3; }
		ppt[o] = $.clamp(ppt[o], 0, this.imgView ? 20 : 100);

		ppt.iconCustom = ppt.iconCustom.trim();
		ui.setNodes();
		sbar.active = true;
		sbar.duration = {
			drag: 200,
			inertia: ppt.durationTouchFlick,
			full: ppt.durationScroll
		};
		sbar.duration.scroll = Math.round(sbar.duration.full * 0.8);
		sbar.duration.step = Math.round(sbar.duration.full * 2 / 3);
		sbar.duration.bar = sbar.duration.full;
		sbar.duration.barFast = sbar.duration.step;
		if (!ppt.butCustIconFont.length) ppt.butCustIconFont = 'Segoe UI Symbol';
		ui.setSbar();
		on_colours_changed();
		if (ui.col.counts) this.colMarker = true;
		if (ppt.themed && ppt.theme) {
			const themed_image = `${fb.ProfilePath}settings\\themed\\themed_image.bmp`;
			if ($.file(themed_image)) sync.image(gdi.Image(themed_image));
		}
		this.setRootName();
		but.setSbarIcon();
		pop.setValues();
		pop.inlineRoot = ppt.rootNode && (ppt.inlineRoot || ppt.facetView);

		ui.getFont();
		this.on_size();
		this.tree.y = this.search.h;
		but.createImages();
		but.refresh(true);
		find.on_size();
		pop.createImages();
		// Regorxxx <- Fix values on reset | Fix values on options change
		this.playlistSort = ppt.smartSort ? this.cleanViewTf(this.processCustomTf(this.curPattern)) : ''; // Regorxxx <- Smart sorting based on view ->
		img.setRoot();
		img.setNoArtist();
		img.setNoCover();
		if (value === 'default_value') {
			this.clear('both');
			this.zoomReset();
			this.setTopBar();
			this.getViews();
			this.getFilters();
			ppt.initialLoadFilters = false;
			ppt.initialLoadViews = false;
			ppt.initialLoadFilters = false;
			ppt.initialLoadViews = false;
			this.getFields(ppt.viewBy, ppt.filterBy);
		}
		// Regorxxx ->

		if (ppt.highLightNowplaying || ppt.nowPlayingSidemarker) {
			pop.getNowplaying();
			pop.nowPlayingShow();
		}

		if (this.imgView && pop.tree.length) {
			img.trimCache(pop.tree[0].key);
			img.metrics();
			// Regorxxx <- New img styles
			const art = img.getArt(ppt.artId);
			if ((art.reflection || art.reflectionRoot) && !img.canShowReflection()) {
				fb.ShowPopupMessage('Art reflection effect is enabled but current pad settings don\'t allow such effect to be displayed.\n\nCheck your pad settings (normal and/or compact).', window.ScriptInfo.Name + ': Art reflection settings');
			}
			// Regorxxx ->
		}
		if (!bRefreshLib) { lib.rootNodes(1, true); } // Regorxxx <- Apply relevant changes on properties update ->
		this.pn_h_auto = ppt.pn_h_auto && ppt.rootNode;
		if (this.pn_h_auto) {
			window.MaxHeight = window.MinHeight = ppt.pn_h;
		}
		if (this.pn_h_auto && !this.imgView && ppt.pn_h == ppt.pn_h_min && this.tree[0]) pop.clearChild(this.tree[0]);
		pop.checkAutoHeight();
		if (sbar.scroll > sbar.max_scroll) sbar.checkScroll(sbar.max_scroll);
		window.Repaint();
	}

	zoomReset() {
		sbar.logScroll();
		ppt.zoomFont = 100;
		ppt.zoomNode = 100;
		this.zoomFilter = 1;
		ppt.zoomFilter = 100;
		ppt.zoomTooltipBut = 100;
		this.setTopBar();
		ui.getFont();
		this.on_size();
		find.on_size();
		if (this.imgView) {
			ppt.zoomImg = 100;
			img.clearCache();
			img.metrics();
		}
		if (ui.style.topBarShow || ppt.sbarShow) but.refresh(true);
		window.Repaint();
		sbar.setScroll();
	}

	// Regorxxx <-

	// Regorxx ->
	getDragDropTooltipText(method, mask, x, y, bInternal) {
		let text = '';
		if (y < this.search.h || !this.isQueueLikeSource()) {
			if (method === 0 && this.folderView) { // Auto: tags or path
				return 'Add paths to search box';
			} else { // Tags
				const searchTags = search.getDragDropTags(mask);
				const operators = search.getDragDropOperators(mask);
				const tagsDisplay = operators.tag
					? [...new Set(searchTags.map((t) => t.to))].join(' ' + operators.tag + ' ')
					: searchTags[0].to;
				text = (operators.query || !this.search.txt ? 'Add' : 'Replace') + ' query: ' + tagsDisplay;
			}
		} else if (this.isQueueSource()) {
			const idx = pop.row.i - (ppt.queueNowPlaying && fb.IsPlaying ? 1 : 0) - (ppt.rootNode ? 1 : 0);
			text = ppt.queueSorting && pop.row.i >= 0
				? idx < 0
					? (bInternal ? 'Move' : 'Add') + ' items to front of playback queue'
					: (bInternal ? 'Move' : 'Add') + ' items to playback queue at ' + (idx + 1) + 'º pos'
				: (mask & MK_CONTROL) === MK_CONTROL
					? (bInternal ? 'Move' : 'Add') + ' items to front of playback queue'
					: (bInternal ? 'Move' : 'Add') + ' items to back of playback queue';
		} else if (this.isAutoDjSource()) {
			text = (mask & MK_CONTROL) === MK_CONTROL
				? 'Add items to Auto-DJ (top tracks)'
				: 'Add items to Auto-DJ';
		}
		return text.cut(46);
	}

	// Regorxxx <- Auto-DJ feature
	addToAutoDj(itemsArr) {
		const count = itemsArr ? itemsArr.length : 0;
		if (!itemsArr || !count) { this.stopAutoDj(); return false; }
		// Flush playback queue for filters based on nowplaying or selection, since next tracks would otherwise not match at all tracks between currently playing and Auto-DJ added tracks
		if (lib.doDynamicFilter(void (0), (bSearch, bFilter) => bSearch || bFilter)) { plman.FlushPlaybackQueue(); }
		const handle = this.chooseNextTrackAutoDj(itemsArr);
		if (!handle) { this.stopAutoDj(); return false; }
		if (!this.autoDj.running) {
			const selectionHolder = fb.AcquireUiSelectionHolder();
			selectionHolder.SetSelection(FbMetadbHandleList(handle), 0);
		}
		this.autoDj.last = handle;
		plman.AddItemToPlaybackQueue(handle);
		this.autoDj.cache.push(handle);
		if (!fb.IsPlaying) { fb.Play(); }
		if (this.isAutoDjSource()) { lib.treeState100(false, 2); }
		this.autoDj.running = true;
		return this.autoDj.running;
	}

	sortTracksAutoDj(itemsArr, method) {
		let out;
		method = (method || 'random').toLowerCase();
		switch (method.toLowerCase()) {
			case 'match-genre':
			case 'match-mood':
			case 'match': {
				const prev = this.autoDj.last;
				if (prev) {
					// Match genre, style, and mood while trying to scatter same artists
					const tags = [
						['match-genre', 'match'].includes(method)
							? [globTags.genre, globTags.style]
							: [],
						['match-mood', 'match'].includes(method)
							? [globTags.mood]
							: [],
						['album artist', 'artist']
					].flat(Infinity).filter(Boolean);
					const temp = getHandleTags(prev, tags);
					const reference = new Set(temp.slice(0, -2).flat(Infinity).filter(Boolean));
					const refSize = reference.size;
					const id = new Set(temp.slice(-2).flat(Infinity).filter(Boolean));
					getHandleListTags(new FbMetadbHandleList(itemsArr), tags).forEach((handleTag, i) => {
						itemsArr[i].weight = (new Set(handleTag.slice(0, -2).flat(Infinity).filter(Boolean)))
							.intersectionSize(reference) / refSize +
							(
								(new Set(handleTag.slice(-2).flat(Infinity).filter(Boolean)))
									.isEqual(id) ? -0.5 : 0.5
							);
					});
					out = [...itemsArr].sort((a, b) => b.weight - a.weight);
				}
				else { out = this.sortTracksAutoDj(itemsArr, 'random'); }
				break;
			}
			case 'random':
			default: out = [...itemsArr].shuffle();
		}
		return out;
	}

	chooseNextTrackAutoDj(itemsArr, method = ppt.autoDjTrackPicking) {
		const toAdd = this.sortTracksAutoDj(itemsArr, method);
		const count = toAdd.length;
		let i = 0;
		/** @type {FbMetadbHandle} */
		let handle;
		let prevIdx = -1;
		let idx;
		while (i < count) {
			handle = toAdd[i++];
			idx = this.autoDj.cache.findIndex((h) => handle.Compare(h));
			if (idx === -1) { break; }
			else if (idx <= prevIdx || prevIdx === -1) { prevIdx = idx; }
		}
		if (idx !== -1 && prevIdx !== -1) {
			if (ppt.autoDjStopRepeat) { return null; }
			handle = this.autoDj.cache[prevIdx];
		}
		return handle;
	}

	updateAutoDj(itemsArr = this.autoDj.source || this.list.Convert()) {
		if (!this.autoDj.running) { return false; }
		return this.addToAutoDj(itemsArr);
	}

	stopAutoDj() {
		this.autoDj.source = null;
		this.autoDj.running = false;
		this.autoDj.cache.length = 0;
		this.autoDj.last = null;
		plman.FlushPlaybackQueue();
		if (this.isAutoDjSource()) { lib.treeState100(false, 2); }
	}

	startAutoDj(items) {
		this.stopAutoDj();
		if (items) { this.autoDj.source = items instanceof FbMetadbHandleList ? items.Convert() : items; }
		return this.addToAutoDj(this.autoDj.source || this.list.Convert());
	};


	addToAutoDjSource(items, bForce) {
		if (!this.autoDj.running) { return false; }
		if (items instanceof FbMetadbHandleList) { items = items.Convert(); }
		if (this.autoDj.source) {
			items.forEach((handle) => {
				this.autoDj.source.push(handle);
				if (bForce) { this.autoDj.cache = this.autoDj.cache.filter((playedHandle) => !handle.Compare(playedHandle)); }
			});
		}
		else { this.autoDj.source = [...items]; }
		if (this.isAutoDjSource()) { lib.treeState100(false, 2); }
	}

	removeFromAutoDjSource(items) {
		if (!this.autoDj.running || !this.autoDj.source) { return false; }
		const handleList = items instanceof FbMetadbHandleList ? items.Clone() : new FbMetadbHandleList(items);
		handleList.Sort();
		this.autoDj.source = this.autoDj.source.filter((handle) => handleList.BSearch(handle) === -1);
		// Update in case the next one is removed
		if (this.autoDj.source.length > 1 && this.autoDj.last !== null && handleList.BSearch(this.autoDj.last) !== -1) { this.updateAutoDj(); }
		if (this.isAutoDjSource()) { lib.treeState100(false, 2); }
	}

	getAutoDjSource() {
		return this.autoDj.running
			? this.autoDj.source || this.list.Convert()
			: [];
	}

	getAutoDjRemaining(bAlsoQueued = true) {
		return this.autoDj.running
			? this.getAutoDjSource().filter((handle) => !this.autoDj.cache.some((playedHandle) => handle.Compare(playedHandle)) || bAlsoQueued && handle.Compare(this.autoDj.last))
			: [];
	}

	isInAutoDj(items) {
		if (items instanceof FbMetadbHandleList) { items = items.Convert(); }
		const handleList = new FbMetadbHandleList(ppt.autoDjStopRepeat ? this.getAutoDjRemaining() : this.getAutoDjSource());
		handleList.Sort();
		return this.autoDj.running
			? items.every((handle) => handleList.BSearch(handle) !== -1)
			: false;
	}

	isAnyInAutoDj(items) {
		if (items instanceof FbMetadbHandleList) { items = items.Convert(); }
		const handleList = new FbMetadbHandleList(ppt.autoDjStopRepeat ? this.getAutoDjRemaining() : this.getAutoDjSource());
		handleList.Sort();
		return this.autoDj.running
			? items.some((handle) => handleList.BSearch(handle) !== -1)
			: false;
	}
	// Regorxxx ->

	// Regorxxx <- Drag n' drop to queue | Queue handling
	fillQueue(queueItems) {
		queueItems.forEach((item) => {
			if (![0xffffffff, -1].includes(item.PlaylistIndex) && ![0xffffffff, -1].includes(item.PlaylistItemIndex)) { // BUG: SMP 1.6.1-mod returns 4294967295 instead of -1
				plman.AddPlaylistItemToPlaybackQueue(item.PlaylistIndex, item.PlaylistItemIndex);
			} else {
				plman.AddItemToPlaybackQueue(item.Handle);
			}
		});
		return !!queueItems.length;
	}

	addToFrontQueue(selItems) {
		const queue = plman.GetPlaybackQueueContents();
		plman.FlushPlaybackQueue();
		return this.fillQueue([
			...selItems.Convert().map((Handle) => { return { Handle, PlaylistIndex: -1, PlaylistItemIndex: -1 }; }),
			...queue
		]);
	}

	addToBackQueue(selItems) {
		return this.fillQueue(selItems.Convert().map((Handle) => { return { Handle, PlaylistIndex: -1, PlaylistItemIndex: -1 }; }));
	}

	addToPosQueue(selItems, position, bScroll) {
		const queue = plman.GetPlaybackQueueContents();
		const selection = selItems.Convert().map((Handle) => { return { Handle, PlaylistIndex: -1, PlaylistItemIndex: -1 }; });
		plman.FlushPlaybackQueue();
		queue.splice(position - 1, 0, ...selection);
		const bDone = this.fillQueue(queue);
		if (bDone && bScroll) {
			const now = Date.now();
			const offset = selection.length;
			const id = setInterval(() => {
				const item = this.list.Find(selItems[0]);
				if (item === Math.min(ppt.queueNowPlaying && fb.IsPlaying ? position : position - 1, this.list.Count - offset)) {
					pop.selShow(item, false);
					clearInterval(id);
				} else if (Date.now() - now > 6000) { clearInterval(id); }
			}, 60);
		}
		return bDone;
	}

	extractFromQueue(selItems, bSkipMissing) {
		const queue = plman.GetPlaybackQueueContents();
		const selection = selItems.Convert().map((Handle) => {
			let idx = queue.findIndex((q) => q.Handle.Compare(Handle));
			if (idx === -1 && bSkipMissing) { return null; }
			while (idx !== -1) {
				queue.splice(idx, 1);
				idx = queue.findIndex((q) => q.Handle.Compare(Handle));
			}
			return { Handle, PlaylistIndex: -1, PlaylistItemIndex: -1 };
		}).filter(Boolean);
		return { selection, queue };
	}

	moveToFrontQueue(selItems, bScroll) {
		const { selection, queue } = this.extractFromQueue(selItems);
		plman.FlushPlaybackQueue();
		const bDone = this.fillQueue([
			...selection,
			...queue
		]);
		if (bDone && bScroll) {
			const now = Date.now();
			const id = setInterval(() => {
				const item = this.list.Find(selItems[0]);
				if (item === (ppt.queueNowPlaying && fb.IsPlaying ? 1 : 0)) {
					pop.selShow(item, false);
					clearInterval(id);
				} else if (Date.now() - now > 6000) { clearInterval(id); }
			}, 60);
		}
		return bDone;
	}

	moveToBackQueue(selItems, bScroll) {
		const { selection, queue } = this.extractFromQueue(selItems);
		plman.FlushPlaybackQueue();
		const bDone = this.fillQueue([
			...queue,
			...selection
		]);
		if (bDone && bScroll) {
			const now = Date.now();
			const offset = selection.length;
			const id = setInterval(() => {
				const item = this.list.Find(selItems[0]);
				if (item === this.list.Count - offset) {
					pop.selShow(item, false);
					clearInterval(id);
				} else if (Date.now() - now > 6000) { clearInterval(id); }
			}, 60);
		}
		return bDone;
	}

	moveToPosQueue(selItems, position, bScroll) {
		const { selection, queue } = this.extractFromQueue(selItems);
		plman.FlushPlaybackQueue();
		queue.splice(position - 1, 0, ...selection);
		const bDone = this.fillQueue(queue);
		if (bDone && bScroll) {
			const now = Date.now();
			const offset = selection.length;
			const id = setInterval(() => {
				const item = this.list.Find(selItems[0]);
				if (item === Math.min(ppt.queueNowPlaying && fb.IsPlaying ? position : position - 1, this.list.Count - offset)) {
					pop.selShow(item, false);
					clearInterval(id);
				} else if (Date.now() - now > 6000) { clearInterval(id); }
			}, 60);
		}
		return bDone;
	}

	removeFromQueue(selItems) {
		const idx = [];
		const queueHandles = plman.GetPlaybackQueueHandles();
		for (let handle of selItems) {
			for (let j = 0; j < queueHandles.Count; j++) {
				if (handle.Compare(queueHandles[j])) { idx.push(j); }
			}
		}
		if (idx.length) { plman.RemoveItemsFromPlaybackQueue(idx); return true; }
		return false;
	}
	// Regorxxx ->

	// Regorxxx <- Preset rules
	getPresetRule({
		viewBy,
		filterBy,
		sourceBy,
		sourceId = plman.ActivePlaylist === -1 ? [] : [plman.GetPlaylistName(plman.ActivePlaylist), plman.GetGUID(plman.ActivePlaylist)],
		bSetSourceId = false
	} = {}) {
		const rules = $.jsonParse(ppt.presetRules, []);
		const bSetView = typeof viewBy !== 'undefined';
		const bSetFilter = typeof filterBy !== 'undefined';
		const bSetSource = typeof sourceBy !== 'undefined';
		const hasSourceId = typeof sourceId !== 'undefined';
		const viewName = bSetView
			? this.grp[viewBy].name
			: this.grp[ppt.viewBy].name;
		const filterName = bSetFilter
			? this.filter.mode[filterBy].name
			: this.filter.mode[ppt.filterBy].name;
		const sourceIdx = bSetSource
			? this.getSourceIdxFromSettings(sourceBy)
			: this.getSourceIdxFromSettings();
		if (hasSourceId && !Array.isArray(sourceId)) { sourceId = [sourceId]; }
		if (bSetView || bSetFilter || bSetSource || hasSourceId) {
			const hasKey = (obj, key) => Object.hasOwn(obj, key);
			const hasKeys = (obj, key) => hasKey(obj, key) && Object.keys(obj[key]).length > 0;
			const omit = (condition, key, bSet) => !hasKey(condition, key) || (!condition[key] || !condition[key].length) && !bSet;
			const match = (condition, val) => Array.isArray(val)
				? val.some((sv) => condition.includes(sv))
				: condition.includes(val);
			const notMatch = (condition, val) => Array.isArray(val)
				? val.every((sv) => condition.every((v) => v !== sv))
				: condition.every((v) => v !== val);
			const isValid = (cond) => Object.keys(cond).every((key) => cond[key] === null || Array.isArray(cond[key]));
			const rule = rules.find((rule) => {
				let bDone = (hasKeys(rule, 'if') || hasKeys(rule, 'ifNot')) && hasKeys(rule, 'then');
				if (hasKey(rule, 'if')) {
					const cond = rule.if;
					if (!isValid(cond)) { console.log(window.PanelName + ': Non valid preset rule (if)\n\t ' + JSON.stringify(rule)); return false; }
					bDone = bDone && (omit(cond, 'view', bSetView) || match(cond.view, viewName));

					bDone = bDone && (omit(cond, 'filter', bSetFilter) || match(cond.filter, filterName));
					bDone = bDone && (omit(cond, 'source', bSetSource) || match(cond.source.map((s) => this.getSourceIdx(s)), sourceIdx));
					bDone = bDone && (omit(cond, 'sourceId', bSetSourceId) || hasSourceId && match(cond.sourceId, sourceId));
				}
				if (hasKey(rule, 'ifNot')) {
					const cond = rule.ifNot;
					if (!isValid(cond)) { console.log(window.PanelName + ': Non valid preset rule (if not)\n\t ' + JSON.stringify(rule)); return false; }
					bDone = bDone && (omit(cond, 'view', bSetView) || notMatch(cond.view, viewName));
					bDone = bDone && (omit(cond, 'filter', bSetFilter) || notMatch(cond.filter, filterName));
					bDone = bDone && (omit(cond, 'source', bSetSource) || notMatch(cond.source.map((s) => this.getSourceIdx(s)), sourceIdx));
					bDone = bDone && (omit(cond, 'sourceId', bSetSourceId) || hasSourceId && notMatch(cond.sourceId, sourceId));
				}
				if (!isValid(rule.then)) { console.log(window.PanelName + ': Non valid preset rule (then)\n\t ' + JSON.stringify(rule)); return false; }
				bDone = bDone && (!hasKey(rule.then, 'view') || !bSetView);
				bDone = bDone && (!hasKey(rule.then, 'filter') || !bSetFilter);
				bDone = bDone && (!hasKey(rule.then, 'source') || !bSetSource);
				return bDone;
			});
			if (rule) {
				const then = { ...rule.then };
				then.filterBy = Object.hasOwn(then, 'filter')
					? then.filter[0].toLowerCase() === '- none -' ? 0 : this.filter.mode.findIndex((f) => f.name.toLowerCase() === then.filter[0].toLowerCase())
					: bSetFilter ? filterBy : -1;
				then.viewBy = Object.hasOwn(then, 'view')
					? this.grp.findIndex((v) => v.name.toLowerCase() === then.view[0].toLowerCase())
					: bSetView ? viewBy : -1;
				then.sourceIdx = Object.hasOwn(then, 'source')
					? this.getSourceIdx(then.source[0])
					: bSetSource ? sourceIdx : null;
				return then;
			}
		}
		return { view: null, viewBy: -1, filter: null, filterBy: -1, source: null, sourceIdx: null };
	}

	applyPresetRule(then) {
		let viewBy = -1;
		if (then.viewBy !== -1) {
			viewBy = then.viewBy;
			if (viewBy !== ppt.viewBy) {
				if (ppt.artTreeSameView) {
					ppt.albumArtViewBy = ppt.treeViewBy = viewBy;
				} else {
					if (this.imgView) { ppt.albumArtViewBy = viewBy; }
					else { ppt.treeViewBy = viewBy; }
					if (ppt.treeViewBy != ppt.albumArtViewBy) {
						ppt.set(this.imgView ? 'Tree' : 'Tree Image', null);
						ppt.set(this.imgView ? 'Tree Search' : 'Tree Image Search', null);
					}
				}
			}
		}
		let filterBy = -1;
		if (then.filterBy !== -1) {
			filterBy = then.filterBy;
			if (filterBy !== ppt.filterBy) {
				ppt.filterBy = filterBy;
				but.multiBtnSetName(this.filter.mode[filterBy].name, false); // Regorxxx <- Filter / View / Source button ->
				this.calcText();
			}
		}
		let source = null;
		if (then.sourceIdx !== null) {
			source = then.sourceIdx;
			switch (source) {
				case -1: { // Playlist
					const fixedPlaylistIndex = this.getFixedPlaylistSources();
					ppt.fixedPlaylist = fixedPlaylistIndex.length !== 0;
					ppt.libSource = ppt.fixedPlaylist ? 1 : 0;
					break;
				}
				case 0:  // Playlist
					ppt.fixedPlaylist = false;
					ppt.libSource = 0;
					break;
				case 1: // Library
					ppt.libSource = 1;
					ppt.fixedPlaylist = false;
					break;
				case 2: // Panel
					ppt.libSource = 2;
					ppt.fixedPlaylist = false;
					break;
				case 3: // Queue
					ppt.libSource = 3;
					break;
				case 4: // Auto-DJ
					ppt.libSource = 4;
					break;
			}
			if (this.imgView) { img.clearCache(); }
		}
		if (source === null && viewBy === -1 && filterBy === -1) { return false; }
		if (viewBy === -1) { viewBy = ppt.viewBy; }
		if (filterBy === -1) { filterBy = ppt.filterBy; }
		this.getFields(viewBy, filterBy);
		lib.searchCache = {};
		if (source !== null) { lib.treeState(false, 2); return true; }
		this.on_size();
		pop.cache = {
			'standard': {},
			'search': {},
			'filter': {}
		};
		lib.checkView();
		const key = ppt.rememberView ? this.viewName : 'def';
		if (ppt.rememberView && lib.exp[key]) { lib.readTreeState(false); }
		if (!ppt.rememberTree && !ppt.reset) { lib.logTree(); }
		else if (ppt.rememberTree) { lib.logFilter(); }
		lib.getLibrary();
		lib.rootNodes(ppt.rememberView, !!ppt.rememberView);
		if (ppt.rememberView) {
			this.calcText();
			but.refresh(true);
			this.searchPaint();
			lib.logTree();
			if (!pop.notifySelection()) {
				const list = !this.search.txt.length || !lib.list.Count ? lib.list : this.list;
				window.NotifyOthers(window.Name, ppt.filterBy ? list : new FbMetadbHandleList());
			}
		}
		this.draw = true;
		if (ppt.searchSend == 2 && this.search.txt.length) pop.load({ handleList: this.list, bAddToPls: false, bAutoPlay: false, bUseDefaultPls: true, bInsertToPls: false }); // Regorxxx <- Code cleanup ->
		pop.checkAutoHeight();
		return true;
	}

	sourceTypes() {
		return { 'Playlist(s)': -1, 'Active Playlist': 0, 'Library': 1, 'Panel(s)': 2, 'Playback Queue': 3, 'Auto-DJ Queue': 4 };
	}

	getSourceType(idx) {
		const source = Object.entries(this.sourceTypes()).find(([, val]) => val === idx);
		return source ? source[0] : null;
	}

	getSourceIdx(type) {
		const idx = this.sourceTypes()[type];
		return typeof idx === 'undefined' ? null : idx;
	}

	getSourceIdxFromSettings(setting = ppt.libSource, fixedPlaylist = ppt.fixedPlaylist) {
		switch (setting) {
			case 0:
				return 0;
			case 1:
				return fixedPlaylist ? -1 : 1;
			default:
				return setting;
		}
	}
	// Regorxxx->

	// Regorxxx <- GDI/D2D draw mode
	adjustUiD2D() {
		this.cc |= DT_CALCRECT;
		this.l |= DT_CALCRECT;
		this.lc |= DT_CALCRECT;
		this.rc |= DT_CALCRECT;
	}
	// Regorxxx ->

	// Regorxxx <- Allow multiple fixed playlists as source | Allow fixed playlist by GUID | Active/Playing/All playlist source | Code cleanup | Multiple-playlist flat view
	getFixedPlaylistSources() {
		const fixedPlaylistIndex = [];
		(ppt.fixedPlaylistName || '').split('|').forEach((name) => {
			let idx = plman.FindPlaylist(name);
			if (idx === -1) { idx = plman.FindByGUID(name); }
			if (idx !== -1) { fixedPlaylistIndex.push(idx); }
		});
		return fixedPlaylistIndex;
	}

	getPlaylistSource() {
		if (plman.PlaylistCount === 0) { return [-1]; }
		if (ppt.libSource > 0) {
			return ppt.libSource === 1 && ppt.fixedPlaylist
				? this.getFixedPlaylistSources()
				: [-1];
		} else {
			switch (ppt.plsSource) {
				case 2:
					return $.range(0, plman.PlaylistCount - 1);
				case 1:
					return plman.PlayingPlaylist === -1
						? ppt.playlistFallback
							? [plman.ActivePlaylist]
							: [-1]
						: fb.IsPlaying
							? [plman.PlayingPlaylist]
							: ppt.playlistFallbackStop
								? [plman.ActivePlaylist]
								: [plman.PlayingPlaylist];
				case 0:
				default:
					return [plman.ActivePlaylist];
			}
		}
	}

	isActivePlaylistSource(fromProperty) {
		return ppt.libSource === 0 && (fromProperty ? ppt.plsSource === 0 : isArrayEqual(this.getPlaylistSource(), [plman.ActivePlaylist]));
	}

	isPlayingPlaylistSource(fromProperty) {
		return ppt.libSource === 0 && ppt.plsSource === 1 && (fromProperty ? true : isArrayEqual(this.getPlaylistSource(), [plman.PlayingPlaylist]));
	}

	isAllPlaylistSource(fromProperty) {
		return ppt.libSource === 0 && (fromProperty ? ppt.plsSource === 2 : isArrayEqual(this.getPlaylistSource(), $.range(0, plman.PlaylistCount - 1)));
	}

	isNonFixedPlaylistSource() {
		return ppt.libSource === 0 && !ppt.fixedPlaylist;
	}

	isFixedPlaylistSource() {
		return ppt.libSource === 1 && ppt.fixedPlaylist;
	}

	isPlaylistSource() {
		return ppt.libSource === 1 && ppt.fixedPlaylist || ppt.libSource === 0;
	}

	isLibrarySource() {
		return ppt.libSource === 1 && !ppt.fixedPlaylist;
	}

	isPanelSource() {
		return ppt.libSource === 2;
	}

	isQueueSource() {
		return ppt.libSource === 3;
	}

	isAutoDjSource() {
		return ppt.libSource === 4;
	}

	isStandardSource() {
		return ppt.libSource > 0;
	}

	isQueueLikeSource() {
		return ppt.libSource === 3 || ppt.libSource === 4;
	}
	// Regorxxx ->
}