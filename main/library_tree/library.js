'use strict';
//09/01/26

/* global panel:readable, ppt:readable, $:readable, sbar:readable, pop:readable, img:readable, but:readable, lib:readable, search:readable, setSelection:readable, ui:readable */

/* global globQuery:readable, globTags:readable */
/* global harmonicMixingSort:readable, harmonicMixingCycle:readable */
/* global removeDuplicates:readable, showDuplicates:readable */
/* global shuffleByTags:readable */

/* exported Library*/

class Library {
	constructor() {
		this.allmusic = [];
		this.checkSelection = true;
		this.exp = {};
		this.expand = [];
		this.filterQuery = '';
		this.filterQueryID = 'N/A';
		this.searchQueryID = 'N/A'; // Regorxxx <- Don't update search if possible ->
		this.full_list = new FbMetadbHandleList();
		this.full_list_need_sort = false;
		this.initialised = false;
		this.libNode = [];
		this.list = new FbMetadbHandleList();
		// Regorxxx <- Don't create cache playlists if possible
		this.cacheId = null;
		this.cache = null;
		// Regorxxx ->
		this.noListUpd = false;
		this.none = '';
		this.node = [];
		this.prefix = ppt.prefix.split('|');
		this.root = [];
		this.scr = [];
		this.searchCache = {};
		this.searchNode = [];
		this.sel = [];
		this.time = FbProfiler();
		this.upd = 0;
		this.upd_search = false;
		this.v2_init = fb.Version.startsWith('2') && fb.IsLibraryEnabled();
		this.validSearch = true;

		ppt.autoExpandLimit = $.clamp(ppt.autoExpandLimit, 10, 1000);

		this.lib_update = $.debounce(() => {
			this.time.Reset();
			pop.cache = {
				'standard': {},
				'search': {},
				'filter': {}
			};
			this.searchCache = {};
			this.upd_search = !panel.search.txt ? false : true;
			this.rootNodes(2, ppt.process);
			pop.getTreeSel();
		}, 500);

		this.playlist_update = $.debounce((playlistIndex) => {
			this.searchCache = {};
			this.treeState(false, 2);
			if (playlistIndex) on_item_focus_change(playlistIndex);
		}, 100);

		this.search = $.debounce(() => {
			this.upd_search = true;
			this.time.Reset();
			pop.cache.search = {};
			this.setNodes();
			panel.setHeight(true);
			if (panel.search.txt.length > 2) window.NotifyOthers(window.Name, !lib.list.Count ? lib.list : panel.list);
			else if (!panel.search.txt.length) pop.notifySelection();
			if (ppt.searchSend != 2) return;
			if (panel.search.txt) pop.load({ handleList: panel.list, bAddToPls: false, bAutoPlay: false, bUseDefaultPls: true, bInsertToPls: false }); // Regorxxx <- Code cleanup ->
			else plman.ClearPlaylist(plman.FindOrCreatePlaylist(ppt.libPlaylist.replace(/%view_name%/i, panel.viewName), false));
		}, 333);

		this.search500 = $.debounce(() => {
			this.upd_search = true;
			this.time.Reset();
			pop.cache.search = {};
			this.setNodes();
			panel.setHeight(true);
			if (panel.search.txt.length > 2) window.NotifyOthers(window.Name, !lib.list.Count ? lib.list : panel.list);
			else if (!panel.search.txt.length) pop.notifySelection();
			if (ppt.searchSend != 2) return;
			pop.load({ handleList: panel.list, bAddToPls: false, bAutoPlay: false, bUseDefaultPls: true, bInsertToPls: false }); // Regorxxx <- Code cleanup ->
		}, 500);

		this.checkView();
		this.readTreeState(true);
	}

	// Methods

	added(handleList) {
		let i, items;
		this.full_list.InsertRange(this.full_list.Count, handleList);
		this.full_list_need_sort = true;
		switch (true) {
			case handleList.Count < 100 && (!panel.folderView || ppt.libSource === 1 && !ppt.fixedPlaylist && ppt.folderSortingFb): {  // Regorxxx <- Reversed sorting using folder-view | https://github.com/regorxxx/Library-Tree-SMP/issues/3 ->
				let lis = ppt.filterBy && !this.filterQuery.includes('$searchtext') ? $.query(handleList, this.filterQuery) : handleList;
				panel.sort(lis);
				this.binaryInsert(panel.folderView, lis, this.list, this.libNode);
				// Regorxxx <- Reversed sorting using folder-view | https://github.com/regorxxx/Library-Tree-SMP/issues/3
				if (panel.folderView && ppt.libSource === 1 && !ppt.fixedPlaylist && ppt.folderSortingFb) {
					panel.sort(this.list);
				}
				// Regorxxx ->
				if (this.list.Count) this.empty = '';
				if (panel.search.txt) {
					let newSearchItems = new FbMetadbHandleList();
					this.validSearch = true;
					try {
						// Regorxxx <- RegExp library search. Support for custom TF expression
						const isRegExp = search.isSearchRegExp();
						const tags = isRegExp
							? panel.folderView
								? ['%PATH%']
								: $.getTagsFromTf(panel.view)
							: null;
						const searchText = !isRegExp && !this.filterQuery.includes('$searchtext')
							? this.processCustomTf(panel.search.txt)
							: panel.search.txt;
						this.searchQueryID = !isRegExp && !this.filterQuery.includes('$searchtext')
							? searchText
							: 'N/A';
						newSearchItems = isRegExp
							? $.applyRegExp(searchText, handleList, tags)
							: fb.GetQueryItems(
								handleList,
								!this.filterQuery.includes('$searchtext')
									? searchText
									: this.filterQuery.replace(/\$searchtext/g, searchText)
							);
						// Regorxxx ->
					} catch (e) { // eslint-disable-line no-unused-vars
						this.validSearch = false;
					}
					this.binaryInsert(panel.folderView, newSearchItems, panel.list, this.searchNode);
					if (!panel.list.Count) {
						pop.clearTree();
						sbar.setRows(0);
						this.none = this.validSearch ? 'Nothing found' : 'Invalid search expression';
						panel.treePaint();
						this.noListUpd = true;
					}
				} else {
					panel.list = this.list;
					this.searchQueryID = 'N/A'; // Regorxxx <- Don't update search if possible ->
				}
				break;
			}
			default:
				if (ppt.filterBy && !this.filterQuery.includes('$searchtext')) {
					const newFilterItems = $.query(handleList, this.filterQuery);
					this.list.InsertRange(this.list.Count, newFilterItems);
					panel.sort(this.list);
				} else {
					if (this.full_list_need_sort) panel.sort(this.full_list);
					this.list = this.full_list.Clone();
					this.full_list_need_sort = false;
				}
				panel.sort(handleList);
				switch (true) {
					case !panel.folderView: {
						const tfo = FbTitleFormat(panel.view);
						items = tfo.EvalWithMetadbs(handleList);
						handleList.Convert().forEach((h, j) => {
							i = this.list.Find(h);
							if (i != -1) this.format(items[j], panel.splitter, i, this.libNode);
						});
						break;
					}
					default:
						items = handleList.GetLibraryRelativePaths();
						handleList.Convert().forEach((h, j) => {
							i = this.list.Find(h);
							if (i != -1) this.format(items[j], '\\', i, this.libNode);
						});
						break;
				}
				if (this.list.Count) this.empty = '';
				if (panel.search.txt) {
					let newSearchItems = new FbMetadbHandleList();
					this.validSearch = true;
					try {
						// Regorxxx <- RegExp library search. Support for custom TF expression
						const isRegExp = search.isSearchRegExp();
						const tags = isRegExp
							? panel.folderView
								? ['%PATH%']
								: $.getTagsFromTf(panel.view)
							: null;
						const searchText = !isRegExp && !this.filterQuery.includes('$searchtext')
							? this.processCustomTf(panel.search.txt)
							: panel.search.txt;
						this.searchQueryID = !isRegExp && !this.filterQuery.includes('$searchtext')
							? searchText
							: 'N/A';
						newSearchItems = isRegExp
							? $.applyRegExp(searchText, handleList, tags)
							: fb.GetQueryItems(
								handleList,
								!this.filterQuery.includes('$searchtext')
									? searchText
									: this.filterQuery.replace(/\$searchtext/g, searchText)
							);
						// Regorxxx ->
					} catch (e) { // eslint-disable-line no-unused-vars
						this.validSearch = false;
					}
					panel.list.InsertRange(panel.list.Count, newSearchItems);
					panel.sort(panel.list);
					panel.sort(newSearchItems);
					switch (true) {
						case !panel.folderView: {
							const tfo = FbTitleFormat(panel.view);
							items = tfo.EvalWithMetadbs(newSearchItems);
							newSearchItems.Convert().forEach((h, j) => {
								i = panel.list.Find(h);
								if (i != -1) this.format(items[j], panel.splitter, i, this.searchNode);
							});
							break;
						}
						default:
							items = newSearchItems.GetLibraryRelativePaths();
							newSearchItems.Convert().forEach((h, j) => {
								i = panel.list.Find(h);
								if (i != -1) this.format(items[j], '\\', i, this.searchNode);
							});
							break;
					}
					if (!panel.list.Count) {
						pop.clearTree();
						sbar.setRows(0);
						this.none = this.validSearch ? 'Nothing found' : 'Invalid search expression';
						panel.treePaint();
						this.noListUpd = true;
					}
				} else {
					panel.list = this.list;
					this.searchQueryID = 'N/A'; // Regorxxx <- Don't update search if possible ->
				}
				break;
		}
	}

	addedFilter(handleList) {
		let i, items;
		switch (true) {
			case handleList.Count < 100:
				this.binaryInsert(panel.folderView, handleList, this.list, this.libNode);
				break;
			default:
				this.list.InsertRange(this.list.Count, handleList);
				panel.sort(this.list);
				panel.sort(handleList);
				switch (true) {
					case !panel.folderView: {
						const tfo = FbTitleFormat(panel.view);
						items = tfo.EvalWithMetadbs(handleList);
						handleList.Convert().forEach((h, j) => {
							i = this.list.Find(h);
							if (i != -1) this.format(items[j], panel.splitter, i, this.libNode);
						});
						if (!this.list.Count) this.none = 'Nothing found';
						break;
					}
					default:
						items = handleList.GetLibraryRelativePaths();
						handleList.Convert().forEach((h, j) => {
							i = this.list.Find(h);
							if (i != -1) this.format(items[j], '\\', i, this.libNode);
						});
						if (!this.list.Count) this.none = 'Nothing found';
						break;
				}
		}
	}

	addedSearch(handleList) {
		let i, items;
		switch (true) {
			case handleList.Count < 100:
				this.binaryInsert(panel.folderView, handleList, panel.list, this.searchNode);
				break;
			default:
				panel.list.InsertRange(panel.list.Count, handleList);
				panel.sort(panel.list);
				switch (true) {
					case !panel.folderView: {
						const tfo = FbTitleFormat(panel.view);
						items = tfo.EvalWithMetadbs(handleList);
						handleList.Convert().forEach((h, j) => {
							i = panel.list.Find(h);
							if (i != -1) this.format(items[j], panel.splitter, i, this.searchNode);
						});
						break;
					}
					default:
						items = handleList.GetLibraryRelativePaths();
						handleList.Convert().forEach((h, j) => {
							i = panel.list.Find(h);
							if (i != -1) this.format(items[j], '\\', i, this.searchNode);
						});
						break;
				}
		}
	}

	bInsert(item) {
		let min = 0;
		let max = panel.list.Count;
		let index = Math.floor((min + max) / 2);
		while (max > min) {
			let tmp = new FbMetadbHandleList([item, panel.list[index]]);
			panel.sort(tmp);
			if (item.Compare(tmp[0])) max = index;
			else min = index + 1;
			index = Math.floor((min + max) / 2);
		}
		return index;
	}

	binaryInsert(folder, insert, li, n) {
		let i, items;
		switch (true) {
			case !folder: {
				const tfo = FbTitleFormat(panel.view);
				items = tfo.EvalWithMetadbs(insert);
				insert.Convert().forEach((h, j) => {
					i = this.bInsert(h);
					this.format(items[j], panel.splitter, i, n);
					li.Insert(i, h);
				});
				break;
			}
			case folder:
				items = insert.GetLibraryRelativePaths();
				insert.Convert().reverse().forEach((h, j) => { // Regorxxx <- Reversed sorting using folder-view | https://github.com/regorxxx/Library-Tree-SMP/issues/3 ->
					i = this.bInsert(h);
					this.format(items[j], '\\', i, n);
					li.Insert(i, h);
				});
				break;
		}
	}

	checkAutoExpand() {
		if (panel.imgView) return;
		if (!ppt.treeAutoExpand || panel.list.Count >= ppt.autoExpandLimit || !pop.tree.length) return false;
		let m = pop.tree.length;
		let rootNode = ppt.rootNode;
		const n = rootNode && pop.tree.length > 1 ? true : false;
		pop.expandedTracks = 0;
		pop.expandLmt = ppt.autoExpandLimit;
		while (m--) {
			pop.expandNodes(pop.tree[m], !rootNode || m ? false : true);
			if (n && m == 1) break;
		}
		sbar.setRows(pop.tree.length);
		panel.treePaint();
		return true;
	}

	// Regorxxx <- Improve filter checking based on events. Search text also triggers updates to filtering.
	doDynamicFilter(type, callback) {
		return [
			...(type === 'playback' || !type ? [/\$nowplaying{(.+?)}/] : []),
			...(type === 'selection' || !type ? [/\$selected{(.+?)}/] : []),
			/\$nowplayingorselected{(.+?)}/
		].filter(Boolean).some((re) => {
			const bSearch = !ppt.searchEnter && ppt.searchRefreshTf && panel.search.txt.match(re);
			const bFilter = panel.filter.mode[ppt.filterBy].type.match(re);
			return callback(bSearch, bFilter);
		});
	}

	checkFilter(type) {
		pop.cache.filter = {};
		pop.cache.search = {};
		this.searchCache = {};
		// Regorxxx <- Merge now playing and selected as fallback.
		this.doDynamicFilter(type, (bSearchMatch, bFilterMatch) => {
			if (bFilterMatch || bSearchMatch) {
				if (bFilterMatch) { this.getFilterQuery(); }
				const bFilterChanged = bFilterMatch && this.filterQuery !== this.filterQueryID;
				const bSearchChanged = bSearchMatch && this.processCustomTf(panel.search.txt) !== this.searchQueryID;
				if (bFilterChanged || bSearchChanged) {
					if (!ppt.rememberTree && !ppt.reset) this.logTree();
					else if (ppt.rememberTree) this.logFilter();
					if (panel.search.txt) lib.upd_search = true;
					this.getLibrary();
					this.rootNodes(!ppt.reset ? 1 : 0, true);
					if (!pop.notifySelection()) {
						const list = !panel.search.txt.length || !lib.list.Count ? lib.list : panel.list;
						window.NotifyOthers(window.Name, ppt.filterBy ? list : new FbMetadbHandleList());
					}
					if (ppt.searchSend == 2 && panel.search.txt.length) pop.load({ handleList: panel.list, bAddToPls: false, bAutoPlay: false, bUseDefaultPls: true, bInsertToPls: false }); // Regorxxx <- Code cleanup ->
					pop.checkAutoHeight();
					return true;
				}
			}
			return false;
		});
		// Regorxxx ->
	}

	checkLines(arr, arrExpanded) {
		if (ppt.albumArtGrpLevel) return; // user set
		// Regorxxx <- Improve view patterns. Fixed multiple bugs on automatic group handling for default view patterns and cases where a default group was not found.
		const view = panel.grp[ppt.viewBy].type.trim();
		const defaultView = !panel.folderView
			? panel.defaultViews.includes(view)
			: panel.defaultViews.length - 1;
		if (defaultView) {
			const lines = (panel.defViewPatterns.find((v) => v.type === view) || { lines: 1 }).lines;
			panel.lines = Array.isArray(lines) ? lines[ppt.artId] : lines;
			return;
		}
		// Regorxxx ->
		const lengths = arr.map(v => v.length);
		const avg = $.average(lengths);
		if (avg < (!arrExpanded ? 3 : 2)) panel.lines = 1;
	}

	// Regorxxx <- Avoid unnecesary sorting while checking statistics which can take more than 1 second on big libraries
	checkStatistics(handleList) {
		const bDone = handleList.Convert().some(h => this.full_list.Find(h) !== -1);
		if (bDone) {
			pop.cache = {
				'standard': {},
				'search': {},
				'filter': {}
			};
			pop.tree.forEach(v => {
				delete v.statistics;
				delete v._statistics;
			});
			panel.treePaint();
		}
	}
	// Regorxxx ->

	checkTree() {
		if (!this.upd) return;
		this.lib_update.cancel();
		this.time.Reset();
		pop.cache = {
			'standard': {},
			'search': {},
			'filter': {}
		};
		this.searchCache = {};
		this.upd_search = !panel.search.txt ? false : true;
		this.rootNodes(this.upd == 2 ? 2 : 1, ppt.process);
		if (this.checkSelection) {
			setSelection(ppt.followPlaylistFocus && !ppt.libSource ? fb.GetFocusItem() : panel.setSelection() ? fb.GetSelection() : null);
			this.checkSelection = false;
		}
		this.upd = 0;
	}

	checkView() {
		const startIX = ppt.rememberView ? panel.grp.length : 0;
		for (let i = startIX; i < 100; i++) {
			ppt.set(`Tree.View ${$.padNumber(i, 2) + (!panel.imgView ? '' : ' Image')}`, null); // clear non-existent
			ppt.set(`Tree.View ${$.padNumber(i, 2) + (!panel.imgView ? ' Search' : ' Image Search')}`, null); // clear non-existent
		}
		if (ppt.rememberTree) {
			this.exp = ppt.get(this.rememberViewProp(), JSON.stringify({}));
			this.exp = $.jsonParse(this.exp, {});
		} else ppt.set(!panel.imgView ? 'Tree' + (panel.search.txt ? ' Search' : '') : 'Tree Image' + (panel.search.txt ? ' Search' : ''), null);
	}

	expandArr(arr) {
		arr.forEach((v, i) => {
			arr[i][0] = arr[i][0] + '^@^' + (arr[i][1] || '?');
			arr[i].splice(1, 1);
		});
	}

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
			// Regorxxx <- Merge now playing and selected as fallback
			case 'nowplayingorselected':
				if (!n) return '';
				tfo = FbTitleFormat(n);
				if (fb.IsPlaying && fb.PlaybackLength <= 0) return tfo.Eval();
				handle = fb.IsPlaying ? fb.GetNowPlaying() : fb.GetFocusItem();
				return handle ? tfo.EvalWithMetadb(handle) : '';
			// Regorxxx ->
		}
	}

	flattenArr(arr) {
		arr.forEach((v, i) => {
			arr[i][0] = arr[i][0].split('^@^');
			arr[i] = arr[i].flat();
		});
	}

	format(item, splitter, i, node) {
		item = item.split(splitter);
		if (panel.imgView && panel.lines == 2) {
			item[0] = item[0] + '^@^' + (item[1] || '?');
			item.splice(1, 1);
		}
		node.splice(i, 0, item);
	}

	// Regorxxx <- Code cleanup. Expose TF formatting for arbitrary input
	getFilterQuery() {
		this.filterQuery = this.processCustomTf(panel.filter.mode[ppt.filterBy].type);
	}

	processCustomTf(s) {
		if (typeof s === 'string') {
			while (s.includes('$nowplaying{')) {
				const q = s.match(/\$nowplaying{(.+?)}/);
				s = s.replace(q[0], this.eval(q[1], 'nowplaying') || '~#No Value For Item#~');
			}
			while (s.includes('$selected{')) {
				const q = s.match(/\$selected{(.+?)}/);
				s = s.replace(q[0], this.eval(q[1], 'selected') || '~#No Value For Item#~');
			}
			// Regorxxx <- Merge now playing and selected as fallback
			while (s.includes('$nowplayingorselected{')) {
				const q = s.match(/\$nowplayingorselected{(.+?)}/);
				s = s.replace(q[0], this.eval(q[1], 'nowplayingorselected') || '~#No Value For Item#~');
			}
			// Regorxxx ->
			// Regorxxx <- Expand TF support
			let i = 0;
			while (s.includes('$harmonicsort{')) {
				const q = s.match(/\$harmonicsort{.*?}/)[0];
				s = s.replace(q, '$not(0)$puts(~#sort' + i + ',' + q.replace('$', '~#') + ')');
				i++;
			}
			while (s.includes('$harmonicmix{')) {
				const q = s.match(/\$harmonicmix{.*?}/)[0];
				s = s.replace(q, '$not(0)$puts(~#sort' + i + ',' + q.replace('$', '~#') + ')');
				i++;
			}
			while (s.includes('$shufflebytags{')) {
				const q = s.match(/\$shufflebytags{.*?}/)[0];
				s = s.replace(q, '$not(0)$puts(~#sort' + i + ',' + q.replace('$', '~#') + ')');
				i++;
			}
		}
		// Regorxxx ->
		return s;
	}

	// Regorxxx <- Expand TF support
	processCustomSort(handleList, tf) {
		if (handleList.Count <= 1 || !tf || typeof tf === 'string' && !tf.length) { return handleList; }
		// If not using special $funcs{}, tf has been already cached
		if (tf instanceof FbTitleFormat) {
			handleList.OrderByFormat(tf, 1);
			return handleList;
		}
		const tfClean = this.processCustomTf(tf)
			.replace(/%ISPLAYING%/gi, fb.IsPlaying ? '$not(0)' : '').replace(/%ISPAUSEd%/gi, fb.isPaused ? '$not(0)' : '');
		const sortMatches = /~#sort\d+/g.exec(tfClean) || [];
		let tfEval = tfClean;
		sortMatches.forEach((match) => {
			tfEval += '$get(' + match + ')';
		});
		tfEval = (fb.TitleFormat(tfEval).Eval(true) || '').replace('~#', '$');
		// First process special $funcs{} if available
		while (tfEval.includes('$harmonicsort{')) {
			let [, bShuffleInput] = tf.match(/\$harmonicsort{([^,{}]*)}/) || [, 'true']; // eslint-disable-line no-sparse-arrays
			bShuffleInput = !!bShuffleInput && !!bShuffleInput.trim().length && !['false', '0'].includes(bShuffleInput.trim().toLowerCase());
			handleList = harmonicMixingSort({ selItems: handleList, bShuffleInput, bSendToActivePls: false });
			tfEval = tfEval.replace(tfEval.match(/\$harmonicsort{.*?}/)[0], '');
		}
		if (tfEval.includes('$harmonicmix{') && handleList.Count > 2) {
			while (tfEval.includes('$harmonicmix{')) {
				let [, bShuffleInput] = tf.match(/\$harmonicmix{([^,{}]*)}/) || [, 'true']; // eslint-disable-line no-sparse-arrays
				bShuffleInput = !!bShuffleInput && !!bShuffleInput.trim().length && !['false', '0'].includes(bShuffleInput.trim().toLowerCase());
				handleList = harmonicMixingCycle({ selItems: handleList, bShuffleInput, bSendToActivePls: false, bDoublePass: true });
				tfEval = tfEval.replace(tfEval.match(/\$harmonicmix{.*?}/)[0], '');
			}
		}
		while (tfEval.includes('$shufflebytags{')) {
			let [, tagName, sortBias, sortDir] = tf.match(/\$shufflebytags{((?:\[".*"\])|(?:[^,{}]+)),?([^,{}]*),?([^,{}]*?)}/) || [];
			if (tagName) {
				tagName = tagName.trim();
				tagName = $.jsonParse(tagName, tagName);
				if (!Array.isArray(tagName)) { tagName = [tagName]; }
				if (sortBias) { sortBias = sortBias.trim(); }
				if (sortDir) { sortDir = Number(sortDir.trim()); }
				handleList = shuffleByTags({
					tagName, sortBias, sortDir,
					selItems: handleList, bSendToActivePls: false, bAdvancedShuffle: true, bMultiple: true
				}).handleList;
			} else {
				console.log(window.PanelName + ': $shufflebytags{tagName,sortBias,sortDir} missing \'tagName\' variable');
			}
			tfEval = tfEval.replace(tfEval.match(/\$shufflebytags{.*?}/)[0], '');
		}
		// Allow mixing special $funcs{} and standard TF, as long as it's valid
		if (tf === tfClean || !tfClean.match(/^( *\$not\(0\)\$puts\(.+\) *)*$/)) {
			handleList.OrderByFormat(fb.TitleFormat(tfClean), 1);
		}
		return handleList;
	}
	// Regorxxx ->

	// Regorxxx <- Global duplicates filter
	removeDuplicates(handleList, checkKeys = []) {
		if (checkKeys && checkKeys.length && handleList.Count > 1) { handleList = removeDuplicates({ handleList, checkKeys, sortBias: globQuery.remDuplBias, bAdvTitle: true, bMultipl: true }); }
		return handleList;
	}

	removeNonDuplicates(handleList, checkKeys = []) {
		if (checkKeys && checkKeys.length && handleList.Count > 1) { handleList = showDuplicates({ handleList, checkKeys, sortBias: globQuery.remDuplBias, bAdvTitle: true, bMultipl: true }); }
		return handleList;
	}
	// Regorxxx ->

	// Regorxxx <- Allow multiple fixed playlists as source | Allow fixed playlist by GUID
	getFixedPlaylistSources() {
		const fixedPlaylistIndex = [];
		(ppt.fixedPlaylistName || '').split('|').forEach((name) => {
			let idx = plman.FindPlaylist(name);
			if (idx === -1) { idx = plman.FindByGUID(name); }
			if (idx !== -1) { fixedPlaylistIndex.push(idx); }
		});
		return fixedPlaylistIndex;
	}
	// Regorxxx ->

	getLibrary(items) {
		this.empty = '';
		this.time.Reset();
		this.none = '';
		// Regorxxx <- Allow multiple fixed playlists as source | Allow fixed playlist by GUID
		const fixedPlaylistIndex = [];
		if (ppt.fixedPlaylist) {
			this.getFixedPlaylistSources().forEach((idx) => fixedPlaylistIndex.push(idx));
			if (fixedPlaylistIndex.length === 0) {
				ppt.fixedPlaylist = false;
				ppt.libSource = 0;
			}
		}
		// Regorxxx ->
		if (!items) {
			// Regorxxx <- Optimize library loading. Previously all items were retrieved and then source chosen! Don't create cache playlists if possible | Allow multiple fixed playlists as source | Allow fixed playlist by GUID
			switch (ppt.libSource) {
				case 0: this.list = plman.GetPlaylistItems($.pl_active); break;
				case 1: {
					if (ppt.fixedPlaylist) {
						this.list = fixedPlaylistIndex.reduce((prev, idx) => {
							prev.AddRange(plman.GetPlaylistItems(idx));
							return prev;
						}, new FbMetadbHandleList());
					} else { this.list = fb.GetLibraryItems(); }
					break;
				}
				case 2: this.list = this.cache || plman.GetPlaylistItems(plman.FindPlaylist(ppt.lastPanelSelectionPlaylist)); break;
				case 3: this.list = plman.GetPlaybackQueueHandles(); break; // Regorxxx <- Queue source ->
			}
			// Regorxxx ->
			if (ppt.recItemImage && ppt.libSource == 2) ui.expandHandle = this.list.Count ? this.list[0] : null;
			if (ppt.libSource != 2) this.full_list = this.list.Clone();
		}
		if (ppt.libSource && (!this.list.Count || !fb.IsLibraryEnabled() && ppt.libSource == 1)) {
			pop.clearTree();
			sbar.setRows(0);
			// Regorxxx <- Queue source
			this.empty = ppt.libSource === 1
				? (!ppt.fixedPlaylist ? (!this.list.Count && this.v2_init ? 'Loading...\n\n' : 'Nothing to show\n\nClick here to configure the media library') : 'Nothing found\n\n')
				: ppt.libSource === 3
					? 'Empty playback queue'
					: 'Nothing received';
			// Regorxxx ->
			panel.treePaint();
			return;
		}
		pop.libItems = true;
		panel.forcePaint();
		if (ppt.filterBy) {
			this.getFilterQuery();
			this.filterQueryID = this.filterQuery;
			if (!this.filterQuery.includes('$searchtext')) this.list = $.query(this.list, this.filterQuery);
		} else {
			this.filterQuery = '';
			this.filterQueryID = 'N/A';
		}
		// Regorxxx <- Global duplicates filter
		if (ppt.filterDupl) {
			this.list = this.removeDuplicates(this.list, $.jsonParse(ppt.filterDuplBy, globTags.remDupl));
		} else if (ppt.showDupl) {
			this.list = this.removeNonDuplicates(this.list, $.jsonParse(ppt.filterDuplBy, globTags.remDupl));
		}
		// Regorxxx ->
		if (!this.list.Count) {
			pop.clearTree();
			sbar.setRows(0);
			this.none = 'Nothing found';
			panel.treePaint();
			return;
		}
		this.rootNames('', 0, ppt.libSource == 2 ? false : items);
	}

	getSearchList(n) {
		if (this.filterQuery.includes('$searchtext')) return false;
		const queryArr = [' AFTER ', 'ALL', ' AND ', ' BEFORE ', ' DURING ', ' EQUAL ', ' GREATER ', ' HAS ', ' IS ', ' LESS ', ' MISSING', ' NOT ', ' OR ', ' PRESENT', ' SINCE '];
		if (queryArr.some(v => n.includes(v))) return false;
		const ln = n.length;
		for (let i = 0; i < ln; i++) {
			if (!n) return false;
			if (this.searchCache[n]) return this.searchCache[n];
			else n = n.slice(0, -1);
		}
		return false;
	}

	initialise(handleList, bNotify) { // Regorxxx <- Don't create cache playlists if possible
		const profiler = ppt.logLibProfiler ? new FbProfiler(window.ScriptInfo.Name + ': Load library') : null; // Regorxxx <- Library profiling
		lib.initialised = true;
		this.load(handleList);
		this.getLibrary(true);
		this.rootNodes(ppt.rememberTree, ppt.process);
		if (bNotify && ppt.panelInternalCache) { setTimeout(() => pop.notifySelection(), 1000); } // Regorxxx <- Don't create cache playlists if possible
		if (profiler) { profiler.Print(this.list.Count + ' tracks ->'); } // Regorxxx <- Library profiling
	}

	isMainChanged(handleList) {
		let i, items;
		let tree_type = !panel.folderView ? 0 : 1;
		switch (tree_type) { // check for changes to items; any change updates all
			case 0: {
				let tfo = FbTitleFormat(panel.view);
				items = tfo.EvalWithMetadbs(handleList);
				let ret = handleList.Convert().some((h, j) => {
					i = this.list.Find(h);
					if (i != -1) {
						let libItem = [];
						if (!panel.imgView || panel.lines != 2) libItem = this.libNode[i];
						else {
							libItem = this.libNode[i].slice();
							libItem[0] = libItem[0].split('^@^');
							libItem = libItem.flat();
						}
						return !$.equal(libItem, items[j].split(panel.splitter));
					}
				});
				if (ret) return true;
				if (ppt.itemShowStatistics < 2) return false;
				this.checkStatistics(handleList);
				break;
			}

			case 1: {
				items = handleList.GetLibraryRelativePaths();
				let ret = handleList.Convert().some((h, j) => {
					i = this.list.Find(h);
					if (i != -1) {
						let libItem = [];
						if (!panel.imgView || panel.lines != 2) libItem = this.libNode[i];
						else {
							libItem = this.libNode[i].slice();
							libItem[0] = libItem[0].split('^@^');
							libItem = libItem.flat();
						}
						return !$.equal(libItem, items[j].split('\\'));
					}
				});
				if (ret) return true;
				if (ppt.itemShowStatistics < 2) return false;
				this.checkStatistics(handleList);
				break;
			}
		}
	}

	load(handleList) {
		// Regorxxx <- Allow multiple fixed playlists as source | Allow fixed playlist by GUID
		const fixedPlaylistIndex = [];
		if (ppt.fixedPlaylist) {
			this.getFixedPlaylistSources().forEach((idx) => fixedPlaylistIndex.push(idx));
			if (fixedPlaylistIndex.length === 0) {
				ppt.fixedPlaylist = false;
				ppt.libSource = 0;
			}
		}
		// Regorxxx ->
		// Regorxxx <- Optimize library loading. Previously all items were retrieved and then source chosen! Don't create cache playlists if possible
		switch (ppt.libSource) {
			case 0: this.list = plman.GetPlaylistItems($.pl_active); break;
			case 1: {
				if (ppt.fixedPlaylist) {
					this.list = fixedPlaylistIndex.reduce((prev, idx) => {
						prev.AddRange(plman.GetPlaylistItems(idx));
						return prev;
					}, new FbMetadbHandleList());
				} else { this.list = fb.GetLibraryItems(); }
				break;
			}
			case 2: this.list = handleList || this.cache || plman.GetPlaylistItems(plman.FindPlaylist(ppt.lastPanelSelectionPlaylist)); break;
			case 3: this.list = plman.GetPlaybackQueueHandles(); break; // Regorxxx <- Queue source ->
		}
		// Regorxxx ->
		if (ppt.recItemImage && ppt.libSource == 2) ui.expandHandle = this.list.Count ? this.list[0] : null;
		this.full_list = this.list.Clone();
		if (this.list.Count) this.v2_init = false;

		if (ppt.libSource && (!this.list.Count || !fb.IsLibraryEnabled() && ppt.libSource == 1)) {
			// Regorxxx <- Queue source
			this.empty = ppt.libSource === 1
				? (!ppt.fixedPlaylist ? (!this.list.Count && this.v2_init ? 'Loading...\n\n' : 'Nothing to show\n\nClick here to configure the media library') : 'Nothing found\n\n')
				: ppt.libSource === 3
					? 'Empty playback queue'
					: 'Nothing received';
			// Regorxxx ->
			panel.treePaint();
		}
	}

	logFilter() {
		ppt.process = true;
		const key = !ppt.rememberView ? 'def' : panel.viewName;
		if (!$.objHasOwnProperty(this.exp, key)) this.exp[key] = {};
		this.exp[key].filter = panel.filter.menu[ppt.filterBy];
		ppt.set(this.rememberViewProp(), JSON.stringify(this.exp));
	}

	logTree() {
		if (!pop.tree.length) return;
		let i = 0;
		let ix = -1;
		let level = 0;
		this.expand = [];
		ppt.process = true;
		this.sel = [];
		pop.tree.forEach(v => {
			level = !ppt.rootNode ? v.level : v.level - 1;
			if (v.child.length) this.expand.push({
				level: level,
				a: level < 1 ? v.root || v.srt[0] : pop.tree[v.par].root || pop.tree[v.par].srt[0],
				b: level < 1 ? '' : v.srt[0]
			});
			level = v.level;
			if (v.sel == true) this.sel.push({
				level: level,
				a: v.root || v.srt[0],
				b: level != 0 ? pop.tree[v.par].root || pop.tree[v.par].srt[0] : '',
				c: level > 1 ? pop.tree[pop.tree[v.par].par].root || pop.tree[pop.tree[v.par].par].srt[0] : ''
			});
		});
		ix = pop.get_ix(!panel.imgView ? 0 : img.panel.x + 1, (!panel.imgView || img.style.vertical ? panel.tree.y : panel.tree.x) + sbar.row.h / 2, true, false);
		level = 0;
		let l = Math.min(Math.floor(ix + panel.rows), pop.tree.length);
		if (ix != -1) {
			this.scr = [];
			for (i = ix; i < l; i++) {
				level = pop.tree[i].level;
				this.scr.push({
					level: level,
					a: pop.tree[i].root || pop.tree[i].srt[0],
					b: level != 0 ? pop.tree[pop.tree[i].par].root || pop.tree[pop.tree[i].par].srt[0] : '',
					c: level > 1 ? pop.tree[pop.tree[pop.tree[i].par].par].root || pop.tree[pop.tree[pop.tree[i].par].par].srt[0] : ''
				});
			}
		}
		this.sortByLevel(this.expand);
		if (ppt.rememberTree) {
			const key = !ppt.rememberView ? 'def' : panel.viewName;
			const cur_sel = this.exp[key] ? this.exp[key].sel : [];
			this.exp[key] = {
				exp: this.expand,
				filter: panel.filter.menu[ppt.filterBy],
				scr: this.scr,
				sel: this.sel.length ? this.sel : cur_sel,
				s_txt: panel.search.txt
			};
			ppt.set(this.rememberViewProp(), JSON.stringify(this.exp));
		}
	}

	match(a, b) {
		if (!a) return false;
		const c = a.root || a.srt[0];
		return c.toUpperCase() == b.toUpperCase();
	}

	prefixes(n) {
		if (!n.includes('~#!#')) return n;
		let ln = 0;
		const noPrefix = v => !n.includes(v + ' ');
		if (this.prefix.every(noPrefix)) return n.replace(/~~#!#/g, '#!#').replace(/~#!#/g, '#!#');
		let pr1 = n.split('~~#!#');
		let ret1 = '';
		for (let j = 1; j < pr1.length; j++) {
			const pr2 = pr1[j].split('#!#');
			const pr = pr2[0].split('@@');
			pr.forEach((v, i) => {
				this.prefix.forEach(w => {
					ln = w.length + 1;
					if (v.substr(0, ln) == w + ' ') pr[i] = v.slice(ln);
				});
			});
			pr2.shift();
			ret1 += '#!#' + pr.join('@@') + '#!#' + pr2.join('#!#');
		}
		ret1 = pr1[0] + ret1;
		let pr3 = ret1.split('~#!#');
		let ret2 = '';
		for (let j = 1; j < pr3.length; j++) {
			const pr2 = pr3[j].split('#!#');
			const pr = pr2[0].split('@@');
			pr.forEach((v, i) => {
				this.prefix.forEach(w => {
					ln = w.length + 1;
					if (v.substr(0, ln) == w + ' ') pr[i] = v.substr(ln) + ', ' + w;
				});
			});
			pr2.shift();
			ret2 += '#!#' + pr.join('@@') + '#!#' + pr2.join('#!#');
		}
		return pr3.length > 1 ? pr3[0] + ret2 : ret1;
	}

	readTreeState(bypass, treeArtToggle) {
		if (ppt.rememberTree) {
			const key = !ppt.rememberView ? 'def' : panel.viewName;
			if (this.exp[key]) {
				this.expand = this.exp[key].exp || [];
				if (!treeArtToggle) {
					let tmpFilter = this.exp[key].filter || 'N/A';
					tmpFilter = panel.filter.menu.indexOf(tmpFilter);
					ppt.filterBy = tmpFilter != -1 ? tmpFilter : 0;
				}
				this.scr = this.exp[key].scr || [];
				this.sel = this.exp[key].sel || [];
				if (!treeArtToggle) panel.search.txt = this.exp[key].s_txt || '';
				panel.calcText();
				if (!bypass) but.setSearchBtnsHide();
				window.Repaint();
			} else {
				this.exp = {};
				ppt.rememberView ? ppt.set(this.rememberViewProp(), null) : ppt.set(!panel.imgView ? 'Tree' + (panel.search.txt ? ' Search' : '') : 'Tree Image' + (panel.search.txt ? ' Search' : ''), JSON.stringify(this.exp));
			}
		} else ppt.process = false;
	}

	rememberViewProp() {
		let isValidProp, prop, property;
		switch (ppt.rememberView) {
			case true:
				property = `Tree.View ${$.padNumber(ppt.viewBy, 2) + (!panel.imgView ? '' : ' Image') + ' Search'}`;
				if (panel.search.txt) return property;
				prop = ppt.get(property);
				isValidProp = prop && prop.includes('exp');
				if (isValidProp) return property;
				return `Tree.View ${$.padNumber(ppt.viewBy, 2) + (!panel.imgView ? '' : ' Image')}`;
			case false:
				property = !panel.imgView ? 'Tree Search' : 'Tree Image Search';
				if (panel.search.txt) return property;
				prop = ppt.get(property);
				isValidProp = prop && prop.includes('exp');
				if (isValidProp) return property;
				return !panel.imgView ? 'Tree' : 'Tree Image';
		}
	}

	removed(handleList) {
		let i, j = handleList.Count;
		while (j--) {
			i = this.list.Find(handleList[j]);
			if (i != -1) {
				this.list.RemoveById(i);
				this.libNode.splice(i, 1);
			}
		}
		if (ppt.filterBy) {
			j = handleList.Count;
			if (this.full_list_need_sort) panel.sort(this.full_list);
			this.full_list_need_sort = false;
			while (j--) {
				i = this.full_list.Find(handleList[j]);
				if (i != -1) this.full_list.RemoveById(i);
			}
		} else this.full_list = this.list.Clone();
		if (panel.search.txt) {
			j = handleList.Count;
			while (j--) {
				i = panel.list.Find(handleList[j]);
				if (i != -1) {
					panel.list.RemoveById(i);
					this.searchNode.splice(i, 1);
				}
			}
			if (!panel.list.Count) {
				pop.clearTree();
				sbar.setRows(0);
				this.none = this.validSearch ? 'Nothing found' : 'Invalid search expression';
				panel.treePaint();
				this.noListUpd = true;
			}
		} else panel.list = this.list;

		if (ppt.libSource && !this.full_list.Count) {
			// Regorxxx <- Queue source
			this.empty = ppt.libSource == 1
				? (!ppt.fixedPlaylist ? 'Nothing to show\n\nClick here to configure the media library' : 'Nothing found\n\n')
				: ppt.libSource === 3
					? 'Empty playback queue'
					: 'Nothing received';
			// Regorxxx ->
		}
	}

	removedFilter(handleList) {
		let j = handleList.Count;
		while (j--) {
			let i = this.list.Find(handleList[j]);
			if (i != -1) {
				this.list.RemoveById(i);
				this.libNode.splice(i, 1);
			}
		}
	}

	removedSearch(handleList) {
		let j = handleList.Count;
		while (j--) {
			let i = panel.list.Find(handleList[j]);
			if (i != -1) {
				panel.list.RemoveById(i);
				this.searchNode.splice(i, 1);
			}
		}
	}

	rootNames(li, search, treeArtToggle) {
		const tree_type = !panel.folderView ? 0 : 1;
		let arr = [];
		if (!treeArtToggle || !panel.samePattern) switch (search) {
			case 0:
				if (ppt.libSource || panel.multiProcess) panel.sort(this.list);
				li = panel.list = this.list;
				this.libNode = [];
				arr = this.libNode;
				break;
			case 1:
				this.searchNode = [];
				arr = this.searchNode;
				break;
		}

		if (!treeArtToggle || !panel.samePattern) {
			switch (tree_type) {
				case 0: {
					let tfo = FbTitleFormat(panel.view);
					tfo.EvalWithMetadbs(li).forEach((v, i) => arr[i] = v.split(panel.splitter));
					break;
				}
				case 1:
					li.GetLibraryRelativePaths().forEach((v, i) => arr[i] = v.length ? v.split('\\') : ['File(s) Not In Library']);
					break;
			}
			if (panel.imgView && panel.lines == 2) this.checkLines(arr);
			if (panel.imgView && panel.lines == 2) this.expandArr(arr);
		} else {
			arr = !search ? this.libNode : this.searchNode;
			const arrExpanded = arr.length && arr[0][0].includes('^@^');
			if (panel.imgView && panel.lines == 2) this.checkLines(arr, arrExpanded);
			if (panel.imgView) {
				if (panel.lines == 2) {
					if (!arrExpanded) this.expandArr(arr);
				} else if (panel.lines == 1) {
					if (arrExpanded) this.flattenArr(arr);
				}
			} else if (arrExpanded) this.flattenArr(arr);
		}
	}

	rootNodes(lib_update, process) {
		if (!this.list.Count) return;
		this.root = [];
		let i = 0;
		let n = '';
		if (panel.search.txt && (this.upd_search || lib_update === true)) {
			this.validSearch = true;
			this.none = '';
			try {
				// Regorxxx <- RegExp library search. Support for custom TF expression
				const isRegExp = search.isSearchRegExp();
				const tags = isRegExp
					? panel.folderView
						? ['%PATH%']
						: $.getTagsFromTf(panel.view)
					: null;
				const searchText = !isRegExp && !this.filterQuery.includes('$searchtext')
					? this.processCustomTf(panel.search.txt)
					: panel.search.txt;
				this.searchQueryID = !isRegExp && !this.filterQuery.includes('$searchtext')
					? searchText
					: 'N/A';
				panel.list = isRegExp
					? $.applyRegExp(searchText, this.list, tags)
					: fb.GetQueryItems(
						this.getSearchList(searchText) || this.list,
						!this.filterQuery.includes('$searchtext')
							? searchText
							: this.filterQuery.replace(/\$searchtext/g, searchText)
					);
				this.searchCache[searchText] = panel.list;
				// Regorxxx ->
			} catch (e) { // eslint-disable-line no-unused-vars
				this.list = this.list.Clone();
				panel.list.RemoveAll();
				this.validSearch = false;
			}
			if (!panel.list.Count) {
				pop.clearTree();
				sbar.setRows(0);
				this.none = this.validSearch ? 'Nothing found' : 'Invalid search expression';
				panel.treePaint();
				return;
			}
			this.rootNames(panel.list, 1);
			this.node = this.searchNode;
			this.upd_search = false;
		} else if (!panel.search.txt) {
			this.searchQueryID = 'N/A'; // Regorxxx <- Don't update search if possible ->
			panel.list = this.list;
			this.node = this.libNode;
			this.searchNode = [];
			this.searchCache = {};
		}
		let end = 0;
		let n_o = '#get_node#';
		let nU = '';
		let start = 0;
		let total = panel.list.Count;
		pop.getNowplaying();
		if (ppt.rootNode) this.root[0] = {
			root: 'Root Node',
			nm: panel.rootName,
			sel: false,
			child: [],
			item: this.set(start, total - 1),
			srt: this.sort(panel.rootName)
		};
		else {
			this.node.forEach((v, l) => {
				n = v[0];
				nU = n.toUpperCase();
				if (nU != n_o) {
					n_o = nU;
					if (i > 0) this.root[i - 1].item = this.set(start, end);
					start = l;
					if (panel.multiPrefix) n = this.prefixes(n);
					this.root[i] = {
						nm: n,
						sel: false,
						child: [],
						srt: this.sort(n)
					};
					end = start;
					i++;
				} else end = l;
			});
			if (i > 0) this.root[i - 1].item = this.set(start, end);
		}
		if (!lib_update) sbar.reset();
		/* Draw tree -> */
		if (!ppt.rootNode || panel.search.txt) pop.buildTree(this.root, 0);
		if (ppt.rootNode) pop.branch(this.root[0], true);
		if (panel.pn_h_auto && !panel.imgView && (panel.init || lib_update) && ppt.pn_h == ppt.pn_h_min && pop.tree[0]) pop.clearChild(pop.tree[0]);
		panel.init = false; // $.trace('initialised in: ' + this.time.Time / 1000 + ' seconds');

		if (lib_update !== 2) this.checkAutoExpand();
		if (lib_update && process) {
			if (!panel.imgView) {
				this.expand.forEach(v => {
					if (v.level == 0) {
						pop.tree.some(w => {
							if (this.match(w, v.a)) {
								pop.branch(w);
								return true;
							}
						});
					} else if (v.level > 0) {
						pop.tree.some(w => {
							if (this.match(w, v.b) && this.match(pop.tree[w.par], v.a)) {
								pop.branch(w);
								return true;
							}
						});
					}
				});
			}
			this.sel.forEach(v => {
				if (v.level == 0) {
					pop.tree.some(w => {
						if (this.match(w, v.a)) return w.sel = true;
					});
				} else if (v.level == 1) {
					pop.tree.some(w => {
						if (this.match(w, v.a) && this.match(pop.tree[w.par], v.b)) return w.sel = true;
					});
				} else if (v.level > 1) {
					pop.tree.some(w => {
						if (this.match(w, v.a) && this.match(pop.tree[w.par], v.b) && this.match(pop.tree[pop.tree[w.par].par], v.c)) return w.sel = true;
					});
				}
			});
			let scr_pos = false;
			this.scr.some((v, h) => {
				if (scr_pos) return true;
				if (v.level == 0) {
					pop.tree.some((w, j) => {
						if (this.match(w, v.a)) {
							sbar.scrollMemory(h, j);
							return scr_pos = true;
						}
					});
				} else if (v.level == 1) {
					pop.tree.some((w, j) => {
						if (this.match(w, v.a) && this.match(pop.tree[w.par], v.b)) {
							sbar.scrollMemory(h, j);
							return scr_pos = true;
						}
					});
				} else if (v.level > 1) {
					pop.tree.some((w, j) => {
						if (this.match(w, v.a) && this.match(pop.tree[w.par], v.b) && this.match(pop.tree[pop.tree[w.par].par], v.c)) {
							sbar.scrollMemory(h, j);
							return scr_pos = true;
						}
					});
				}
			});
			if (!scr_pos) {
				sbar.reset();
				panel.treePaint();
			}
		} else this.treeState(false, ppt.rememberTree);
		if (panel.imgView && total) img.load();
		if (lib_update && !process) {
			sbar.reset();
			panel.treePaint();
		}
	}

	set(start, end) {
		return [{
			start: start,
			end: end,
			count: end - start + 1
		}];
	}

	setMemory(i) {
		const o = ['rememberTree', 'rememberView'][i];
		ppt[o] = ppt[o] ? 0 : 1;
		this.checkView();
		this.logTree();
	}

	setNodes() {
		if (panel.search.txt == '' && ppt.rememberPreSearch) {
			ppt.set(this.rememberViewProp(), JSON.stringify({}));
			this.checkView();
			this.logFilter();
			this.readTreeState(true);
			this.rootNodes(ppt.rememberTree, ppt.process);
			this.treeState(false, ppt.rememberTree);
		} else {
			this.treeState(false, ppt.rememberTree);
			this.rootNodes();
		}
	}

	sort(name) {
		if (panel.multiProcess) name = name.replace(/#!#/g, '');
		if (panel.noDisplay) name = name.replace(/#@#/g, '');
		if (panel.colMarker) name = name.replace(/@!#.*?@!#/g, '');
		if (panel.imgView) name = name.replace(/\^@\^/g, '  ');
		return [name, name, name, false];
	}

	sortByLevel(data) {
		data.sort((a, b) => parseFloat(a.level) - parseFloat(b.level));
		return data;
	}

	treeState(reset, state, handleList, handleType) {
		if (!state) return;
		panel.searchPaint();
		panel.treePaint();
		ppt.process = false;
		if (!reset) this.logTree();
		if (ppt.rememberTree && state === true) return;
		if (handleType == 3) {
			this.getLibrary(true);
			this.rootNodes(true, true);
		} else if (!handleList) {
			this.getLibrary();
			this.rootNodes(true, true);
		} else this.updateLibrary(handleList, handleType);
	}

	updateLibrary(handleList, handleType) {
		if (!this.initialised || this.list.Count != this.libNode.length) return;
		this.noListUpd = false;
		switch (handleType) {
			case 0: {
				let origList = this.list.Clone();
				origList.Sort();
				handleList.Sort();
				handleList.MakeDifference(origList);
				if (handleList.Count) this.added(handleList);
				if (this.noListUpd) break;
				if (ui.w < 1 || !window.IsVisible) this.upd = 2;
				else this.lib_update();
				break;
			}
			case 1: {
				// check for changes to items; any change updates all
				const isMainChanged = this.isMainChanged(handleList);
				if (isMainChanged) {
					this.removed(handleList);
					this.added(handleList);
					if (ui.w < 1 || !window.IsVisible) this.upd = 2;
					else this.lib_update(isMainChanged);
					break;
				}
				if (ppt.filterBy && !this.filterQuery.includes('$searchtext')) { // filter: check if not done
					let newFilterItems = $.query(handleList, this.filterQuery);
					let origFilter = this.list.Clone();
					// addns
					origFilter.Sort();
					newFilterItems.Sort();
					newFilterItems.MakeDifference(origFilter);
					if (newFilterItems.Count) this.addedFilter(newFilterItems);
					// removals
					let removeFilterItems = handleList.Clone();
					removeFilterItems.Sort();
					removeFilterItems.MakeIntersection(origFilter); // handles in this.list
					let handlesInFilter = $.query(removeFilterItems, this.filterQuery); // handles in this.list & filter
					handlesInFilter.Sort();
					removeFilterItems.MakeDifference(handlesInFilter); // handles to remove
					if (removeFilterItems.Count) this.removedFilter(removeFilterItems);
					if (newFilterItems.Count || removeFilterItems.Count) {
						if (!panel.search.txt) panel.list = this.list;
						if (ui.w < 1 || !window.IsVisible) this.upd = 2;
						else this.lib_update();
					}
				}
				if (panel.search.txt) { // search: check if not done
					let handlesInSearch = new FbMetadbHandleList();
					let newSearchItems = new FbMetadbHandleList();
					let origSearch = panel.list.Clone();
					// addns
					this.validSearch = true;
					try {
						// Regorxxx <- RegExp library search. Support for custom TF expression
						const isRegExp = search.isSearchRegExp();
						const tags = isRegExp
							? panel.folderView
								? ['%PATH%']
								: $.getTagsFromTf(panel.view)
							: null;
						const searchText = !isRegExp && !this.filterQuery.includes('$searchtext')
							? this.processCustomTf(panel.search.txt)
							: panel.search.txt;
						this.searchQueryID = !isRegExp && !this.filterQuery.includes('$searchtext')
							? searchText
							: 'N/A';
						newSearchItems = isRegExp
							? $.applyRegExp(searchText, handleList, tags)
							: fb.GetQueryItems(
								handleList,
								!this.filterQuery.includes('$searchtext')
									? searchText
									: this.filterQuery.replace(/\$searchtext/g, searchText)
							);
						// Regorxxx ->
					} catch (e) { // eslint-disable-line no-unused-vars
						this.validSearch = false;
					}
					origSearch.Sort();
					newSearchItems.Sort();
					if (ppt.filterBy) {
						let newFilt = this.list.Clone();
						newFilt.Sort();
						newSearchItems.MakeIntersection(newFilt);
					}
					newSearchItems.MakeDifference(origSearch);
					if (newSearchItems.Count) this.addedSearch(newSearchItems);
					// removals
					let removeSearchItems = handleList.Clone();
					removeSearchItems.Sort();
					removeSearchItems.MakeIntersection(origSearch); // handles in origSearch (present in any filter)
					this.validSearch = true;
					try {
						// Regorxxx <- RegExp library search. Support for custom TF expression
						const isRegExp = search.isSearchRegExp();
						const tags = isRegExp
							? panel.folderView
								? ['%PATH%']
								: $.getTagsFromTf(panel.view)
							: null;
						const searchText = !isRegExp && !this.filterQuery.includes('$searchtext')
							? this.processCustomTf(panel.search.txt)
							: panel.search.txt;
						this.searchQueryID = !isRegExp && !this.filterQuery.includes('$searchtext')
							? searchText
							: 'N/A';
						handlesInSearch = isRegExp
							? $.applyRegExp(searchText, removeSearchItems, tags)
							: fb.GetQueryItems(
								removeSearchItems,
								!this.filterQuery.includes('$searchtext')
									? searchText
									: this.filterQuery.replace(/\$searchtext/g, searchText)
							);
						// Regorxxx ->
					} catch (e) { // eslint-disable-line no-unused-vars
						this.validSearch = false;
					}
					handlesInSearch.Sort();
					removeSearchItems.MakeDifference(handlesInSearch); // handles to remove
					if (removeSearchItems.Count) this.removedSearch(removeSearchItems);
					if (newSearchItems.Count || removeSearchItems.Count) {
						if (!panel.list.Count) {
							pop.clearTree();
							sbar.setRows(0);
							this.none = this.validSearch ? 'Nothing found' : 'Invalid search expression';
							panel.treePaint();
							break;
						}
						if (ui.w < 1 || !window.IsVisible) this.upd = 2;
						else this.lib_update();
					}
				} else { this.searchQueryID = 'N/A'; } // Regorxxx <- Don't update search if possible ->
				break;
			}
			case 2:
				this.removed(handleList);
				if (this.noListUpd) break;
				if (ui.w < 1 || !window.IsVisible) this.upd = 2;
				else this.lib_update();
				break;
		}
	}
}