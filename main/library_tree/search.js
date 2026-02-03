'use strict';
//03/02/26

/* global ui:readable, panel:readable, ppt:readable, lib:readable, pop:readable, but:readable, timer:readable, $:readable, vk:readable, tooltip:readable, sbar:readable, Tooltip:readable, searchMenu:readable */
/* global MK_CONTROL:readable, MK_SHIFT */
/* global globTags:readable */
/* global Language:readable */

/* exported Search, Find */

class Search {
	constructor() {
		this.cx = 0;
		this.end = 0;
		this.lbtnDn = false;
		this.lg = [];
		this.log = [];
		this.menu = $.jsonParse(ppt.searchHistory, []);
		this.offset = 0;
		this.paste = false;
		this.start = 0;
		this.shift = false;
		this.shift_x = 0;
		this.txt_w = 0;
		// Regorxxx <- Tooltip over search input box
		this.tt = new Tooltip;

		this.tt = (n, force) => {
			if (tooltip.Text === n && !force) return;
			pop.checkTooltipFont('btn');
			tooltip.Text = n;
			tooltip.Activate();
		};

		this.searchTooltipText = () => {
			if (!panel.search.txt || !panel.search.txt.length) { return ''; }
			let tooltipText = panel.search.txt;
			tooltipText += '\n----------------------------------------------';
			const count = pop.tree[0] && pop.tree[0].root && pop.tree[0].tracksCount ? pop.tree[0].tracksCount : panel.list.Count;
			tooltipText += '\nFound ' + count + ' tracks';
			return tooltipText;
		};

		this.on_script_unload = () => {
			this.tt('');
		};
		// Regorxxx ->
		// Regorxxx <- Drag n' drop to search box | Drag n' drop to queue
		this.getDragDropTags = (mask) => {
			const bCtrl = (mask & MK_CONTROL) === MK_CONTROL;
			const bAlt = (mask & 32) === 32;
			return $.jsonParse(
				bAlt
					? ppt.searchDragTagsAlt
					: bCtrl ? ppt.searchDragTagsCtrl : ppt.searchDragTags,
				bAlt
					? [globTags.artistRaw]
					: [globTags.artistRaw, globTags.genre]
			);
		};

		this.getDragDropOperators = (mask) => {
			const operators = { value: '', tag: '', track: '', query: '' };
			const bCtrl = (mask & MK_CONTROL) === MK_CONTROL;
			const bAlt = (mask & 32) === 32;
			const bShift = (mask & MK_SHIFT) === MK_SHIFT;
			if (bAlt) {
				operators.value = ppt.searchDragValOpAlt;
				operators.tag = ppt.searchDragTagOpAlt;
				operators.track = ppt.searchDragTrackOpAlt;
			} else if (bCtrl) {
				operators.value = ppt.searchDragValOpCtrl;
				operators.tag = ppt.searchDragTagOpCtrl;
				operators.track = ppt.searchDragTrackOpCtrl;
			} else {
				operators.value = ppt.searchDragValOp;
				operators.tag = ppt.searchDragTagOp;
				operators.track = ppt.searchDragTrackOp;
			}
			operators.query = bShift ? ppt.searchDragQueryOpShift : ppt.searchDragQueryOp;
			return operators;
		};

		this.getDragDropQuery = (selItems, searchTags, operators) => {
			if (!operators.track) { selItems = new FbMetadbHandleList(selItems[0]); }
			const trackQueries = $.getHandleListTags(selItems, searchTags).map((trackTags) => {
				return $.queryJoin(
					searchTags.map((searchTag, i) => {
						if (!operators.tag && i > 0) { return; }
						const values = [...new Set(trackTags[i].filter(Boolean).map(s => s.toLowerCase()))];
						if (!operators.value) { values.length = 1; }
						return searchTag.toUpperCase() === 'ALBUM ARTIST'
							? $.queryJoin([
								$.queryCombinations(values, 'ALBUM ARTIST', operators.value),
								$.queryCombinations(values, 'ARTIST', operators.value),
							].filter(Boolean), 'OR')
							: $.queryCombinations(values, searchTag, operators.value);
					}).filter(Boolean),
					operators.tag
				);
			}).filter(Boolean);
			return $.queryJoin([...new Set(trackQueries)], operators.track) || '';
		};

		this.getDragDropPathRegexp = (selItems) => {
			const paths = selItems.GetLibraryRelativePaths()
				.map((path) => path.split('\\').slice(-1)[0])
				.filter(Boolean)
				.map((s) => $.escapeRegExp(s));
			return paths.length ? '/' + paths.join('|') + '/i' : '';
		};

		this.getDragDropExpression = (selItems, method, mask) => {
			let input = '';
			if (method === 0 && panel.folderView) { // Auto: tags or path
				input = this.getDragDropPathRegexp(selItems);
			} else if (method === 0 && !panel.folderView || method === 1) { // Tags
				const searchTags = this.getDragDropTags(mask);
				const operators = this.getDragDropOperators(mask);
				input = this.getDragDropQuery(selItems, searchTags, operators);
				if (input.length && panel.search.txt && operators.query) {
					input = $.queryJoin([panel.search.txt, input], operators.query) || '';
				}
			}
			return input;
		};

		this.getDragDropTooltipText = (method, mask, x, y) => {
			if (y < panel.search.h || ppt.libSource !== 3) {
				if (method === 0 && panel.folderView) { // Auto: tags or path
					return 'Add paths to search box';
				} else { // Tags
					const searchTags = this.getDragDropTags(mask);
					const operators = this.getDragDropOperators(mask);
					const tagsDisplay = operators.tag
						? searchTags.join(' ' + operators.tag + ' ')
						: searchTags[0];
					return (operators.query || !panel.search.txt ? 'Add' : 'Replace') + ' query: ' + tagsDisplay;
				}
			} else if (ppt.libSource === 3) {
				return (mask & MK_CONTROL) === MK_CONTROL
					? 'Add items to front of playback queue'
					: 'Add items to playback queue';
			}
		};
		// Regorxxx ->
		// Regorxxx <- RegExp library search
		const isRegExp = /^\/.+\/[gimsuy]?/;
		this.isSearchRegExp = () => {
			return isRegExp.test(panel.search.txt);
		};
		// Regorxxx ->

		// Regorxxx <- Fix search history on enter
		this.logHistoryAdd = () => {
			let item = -1;
			const itemPresent = this.menu.some((v, i) => {
				item = i;
				return v.search == panel.search.txt;
			});
			if (itemPresent) {
				this.menu[item].accessed = Date.now();
				return;
			}
			if (!panel.search.txt) return;
			this.menu.push({ search: panel.search.txt, accessed: Date.now() });
			if (this.menu.length > 25) {
				this.menu.sort((a, b) => b.accessed - a.accessed);
				this.menu.length = 25;
			}
			this.menu.sort((a, b) => pop.collator.compare(a.search, b.search));
			ppt.searchHistory = JSON.stringify(this.menu);
		};

		this.logHistoryAddDelayed = $.debounce(this.logHistoryAdd, 3000);

		this.logHistory = (bImmediate) => {
			return bImmediate ? this.logHistoryAdd() : this.logHistoryAddDelayed();
		};
		// Regorxxx ->
	}

	// Methods

	calcText() {
		$.gr(1, 1, false, g => this.txt_w = g.CalcTextWidth(panel.search.txt.substr(this.offset), ui.font.main, true));
	}

	clear() {
		if (!panel.search.txt) return;
		lib.time.Reset();
		pop.cache.search = {};
		this.offset = this.start = this.end = this.cx = 0;
		panel.search.txt = '';
		but.setSearchBtnsHide();
		panel.searchPaint();
		lib.setNodes(); // comment out to always stop child panels clearing [if memory on & item selected that's used & so won't clear]
		pop.checkAutoHeight();
		pop.notifySelection();
	}

	draw(gr) {
		if (!ppt.searchShow) return;
		this.start = $.clamp(this.start, 0, panel.search.txt.length);
		this.end = $.clamp(this.end, 0, panel.search.txt.length);
		this.cx = $.clamp(this.cx, 0, panel.search.txt.length);
		if (ui.style.fill) gr.FillSolidRect(0, 1, ui.w, ui.row.h - 4, 0x60000000);
		if (ui.style.pen == 2) gr.DrawRoundRect(0, 2, ui.w - 1, ui.row.h - 4, 4, 4, 1, ui.style.pen_c);
		if (panel.search.txt) {
			this.drawSel(gr);
			this.getOffset(gr);
			gr.GdiDrawText(panel.search.txt.substr(this.offset), ui.font.main, ui.col.search, panel.search.x, 0, panel.search.w, panel.search.sp, panel.l);
		} else {
			if (!ui.img.blurDark) gr.GdiDrawText('Search', ui.font.search, ui.col.txt_box, panel.search.x, 0, panel.search.w, panel.search.sp, panel.l);
			else {
				gr.SetTextRenderingHint(5);
				gr.DrawString('Search', ui.font.search, ui.col.txt_box, panel.search.x, -1, panel.search.w, panel.search.sp, panel.s_lc);
			}
		}
		this.drawCursor(gr);
	}

	drawCursor(gr) {
		if (panel.search.active && panel.search.cursor && this.start == this.end && this.cx >= this.offset) {
			const lx = panel.search.x + this.get_cursor_x(this.cx);
			gr.DrawLine(lx, panel.search.sp * 0.1, lx, panel.search.sp * 0.85, ui.l.w, ui.col.text);
		}
	}

	drawSel(gr) {
		if (this.start == this.end) return;
		const clamp = panel.search.x + panel.search.w;
		gr.DrawLine(Math.min(panel.search.x + this.get_cursor_x(this.start), clamp), panel.search.sp / 2, Math.min(panel.search.x + this.get_cursor_x(this.end), clamp), panel.search.sp / 2, ui.row.h - 3, ui.col.searchSel);
	}

	get_cursor_x(pos) {
		let x = 0;
		$.gr(1, 1, false, g => {
			if (pos >= this.offset) x = g.CalcTextWidth(panel.search.txt.substr(this.offset, pos - this.offset), ui.font.main, true);
		});
		return x;
	}

	getCursorChrPos(x) {
		let i = 0;
		$.gr(1, 1, false, g => {
			const nx = x - panel.search.x;
			let pos = 0;
			for (i = this.offset; i < panel.search.txt.length; i++) {
				pos += g.CalcTextWidth(panel.search.txt.substr(i, 1), ui.font.main, true);
				if (pos >= nx + 3) break;
			}
		});
		return i;
	}

	getOffset(gr) {
		let j = 0;
		let tx = gr.CalcTextWidth(panel.search.txt.substr(this.offset, this.cx - this.offset), ui.font.main, true);
		while (tx >= panel.search.w && panel.search.w > 0 && j < 500) {
			j++;
			this.offset++;
			tx = gr.CalcTextWidth(panel.search.txt.substr(this.offset, this.cx - this.offset), ui.font.main, true);
		}
	}

	lbtn_dblclk(x, y) {
		if (y < panel.search.h && x > but.q.h + but.margin && x < panel.search.x + panel.search.w && panel.search.txt.length) {
			panel.search.cursor = false;
			this.start = 0;
			this.end = panel.search.txt.length;
			panel.searchPaint();
		}
	}

	lbtn_dn(x, y) {
		panel.searchPaint();
		this.lbtnDn = panel.search.active = (y < panel.search.h && x > but.q.x - but.margin / 2 + but.q.h + but.margin && x < panel.search.x + panel.search.w);
		if (!this.lbtnDn) {
			this.offset = this.start = this.end = this.cx = 0;
			timer.clear(timer.cursor);
			return;
		} else {
			if (this.shift) {
				this.start = this.cx;
				this.end = this.cx = this.getCursorChrPos(x);
			} else {
				this.cx = this.getCursorChrPos(x);
				this.start = this.end = this.cx;
			}
			timer.searchCursor(true);
		}
		panel.searchPaint();
	}

	lbtn_up() {
		if (this.start != this.end) timer.clear(timer.cursor);
		this.lbtnDn = false;
	}

	move(x, y) {
		// Regorxxx <- Tooltip over search input box
		if (y < panel.search.h && x > panel.search.x && x < (panel.search.w + panel.search.x)) {
			this.tt(this.searchTooltipText());
		}
		// Regorxxx ->
		if (y > panel.search.h || !this.lbtnDn) return;
		const cursorChrPos = this.getCursorChrPos(x);
		const c_x = this.get_cursor_x(cursorChrPos);
		let l;
		this.calcText();
		if (cursorChrPos < this.start) {
			if (cursorChrPos < this.end) {
				if (c_x < panel.search.x)
					if (this.offset > 0) this.offset--;
			} else if (cursorChrPos > this.end) {
				if (c_x + panel.search.x > panel.search.x + panel.search.w) {
					l = (this.txt_w > panel.search.w) ? this.txt_w - panel.search.w : 0;
					if (l > 0) this.offset++;
				}
			}
			this.end = cursorChrPos;
		} else if (cursorChrPos > this.start) {
			if (c_x + panel.search.x > panel.search.x + panel.search.w) {
				l = (this.txt_w > panel.search.w) ? this.txt_w - panel.search.w : 0;
				if (l > 0) this.offset++;
			}
			this.end = cursorChrPos;
		}
		this.cx = cursorChrPos;
		panel.searchPaint();
	}

	on_char(code, force) {
		let searchDone = false;
		let text = String.fromCharCode(code) || '';
		if (force) panel.search.active = true;
		if (!panel.search.active || code == 5 || code == 9 || code == 12) return;
		panel.search.cursor = false;
		panel.pos = -1;
		switch (code) {
			case vk.enter:
				if (ppt.searchEnter || ppt.searchSend == 1) {
					lib.upd_search = true;
					lib.time.Reset();
					pop.cache.search = {};
					lib.setNodes();
					panel.setHeight(true);
					if (panel.search.txt.length > 2) window.NotifyOthers(window.Name, !lib.list.Count ? lib.list : panel.list);
					else if (!panel.search.txt.length) pop.notifySelection();
					lib.search.cancel();
					this.logHistory(true); // Regorxxx <- Fix search history on enter ->
					searchDone = true;
				}
				if (ppt.searchSend == 1 || ppt.searchEnter && ppt.searchSend == 2) pop.load({ handleList: panel.list, bAddToPls: false, bAutoPlay: pop.autoPlay.send, bUseDefaultPls: !ppt.sendToCur, bInsertToPls: false }); // Regorxxx <- Code cleanup ->
				break;
			case vk.escape:
				this.clear();
				return;
			case vk.redo:
				this.lg.push(panel.search.txt);
				if (this.lg.length > 30) this.lg.shift();
				if (this.log.length > 0) {
					panel.search.txt = this.log.pop() + '';
					this.cx++;
				}
				break;
			case vk.undo:
				this.log.push(panel.search.txt);
				if (this.log.length > 30) this.lg.shift();
				if (this.lg.length > 0) panel.search.txt = this.lg.pop() + '';
				break;
			case vk.selAll:
				this.start = 0;
				this.end = panel.search.txt.length;
				break;
			case vk.copy:
				if (this.start != this.end) $.setClipboardData(panel.search.txt.substring(this.start, this.end));
				break;
			case vk.cut:
				if (this.start != this.end) $.setClipboardData(panel.search.txt.substring(this.start, this.end)); // fall through
			case vk.back:
				this.record();
				if (this.start == this.end) {
					if (this.cx > 0) {
						panel.search.txt = panel.search.txt.substr(0, this.cx - 1) + panel.search.txt.substr(this.cx, panel.search.txt.length - this.cx);
						if (this.offset > 0) this.offset--;
						this.cx--;
					}
				} else {
					if (this.end - this.start == panel.search.txt.length) {
						panel.search.txt = '';
						this.cx = 0;
					} else {
						if (this.start > 0) {
							const st = this.start;
							const en = this.end;
							this.start = Math.min(st, en);
							this.end = Math.max(st, en);
							panel.search.txt = panel.search.txt.substring(0, this.start) + panel.search.txt.substring(this.end, panel.search.txt.length);
							this.cx = this.start;
						} else {
							panel.search.txt = panel.search.txt.substring(this.end, panel.search.txt.length);
							this.cx = this.start;
						}
					}
				}
				this.calcText();
				this.offset = this.offset >= this.end - this.start ? this.offset - this.end + this.start : 0;
				this.start = this.cx;
				this.end = this.start;
				break;
			case vk.ctrlBackspace:
				this.record();
				if (this.start != this.end) this.cx = this.end = this.start;
				if (this.cx > 0) {
					const initial = panel.search.txt.length;
					const leftSide = panel.search.txt.slice(0, this.cx).trimEnd();
					let boundary = 0;
					for (let k = 0; k < leftSide.length; k++) {
						if (panel.search.txt[k] == ' ' && panel.search.txt[k + 1] != ' ') boundary = k + 1;
					}
					panel.search.txt = leftSide.slice(0, boundary) + panel.search.txt.slice(this.cx).trimStart();
					this.cx = boundary;

					if (this.offset > 0) {
						this.offset -= initial - panel.search.txt.length;
					}
				}
				this.calcText();
				this.offset = this.offset >= this.end - this.start ? this.offset - this.end + this.start : 0;
				this.start = this.cx;
				this.end = this.start;
				break;
			case 'delete':
				this.record();
				if (this.start == this.end) {
					if (this.cx < panel.search.txt.length) {
						panel.search.txt = panel.search.txt.substr(0, this.cx) + panel.search.txt.substr(this.cx + 1, panel.search.txt.length - this.cx - 1);
					}
				} else {
					if (this.end - this.start == panel.search.txt.length) {
						panel.search.txt = '';
						this.cx = 0;
					} else {
						if (this.start > 0) {
							const st = this.start;
							const en = this.end;
							this.start = Math.min(st, en);
							this.end = Math.max(st, en);
							panel.search.txt = panel.search.txt.substring(0, this.start) + panel.search.txt.substring(this.end, panel.search.txt.length);
							this.cx = this.start;
						} else {
							panel.search.txt = panel.search.txt.substring(this.end, panel.search.txt.length);
							this.cx = this.start;
						}
					}
				}
				this.calcText();
				this.offset = this.offset >= this.end - this.start ? this.offset - this.end + this.start : 0;
				this.start = this.cx;
				this.end = this.start;
				break;
			case vk.paste:
				text = $.getClipboardData() || '';
				text = text.replace(/(\r\n|\n|\r)/gm, ' '); // fall through
			default:
				this.record();
				if (this.start == this.end) {
					panel.search.txt = panel.search.txt.substring(0, this.cx) + text + panel.search.txt.substring(this.cx);
					this.cx += text.length;
					this.end = this.start = this.cx;
				} else if (this.end > this.start) {
					panel.search.txt = panel.search.txt.substring(0, this.start) + text + panel.search.txt.substring(this.end);
					this.calcText();
					this.offset = this.offset >= this.end - this.start ? this.offset - this.end + this.start : 0;
					this.cx = this.start + text.length;
					this.end = this.start = this.cx;
				} else {
					panel.search.txt = panel.search.txt.substring(0, this.end) + text + panel.search.txt.substring(this.start);
					this.calcText();
					this.offset = this.offset < this.end - this.start ? this.offset - this.end + this.start : 0;
					this.cx = this.end + text.length;
					this.end = this.start = this.cx;
				}
				break;
		}
		if (code == vk.copy || code == vk.selAll) return;
		if (!timer.cursor.id) timer.searchCursor();
		but.setSearchBtnsHide();
		panel.searchPaint();
		if (ppt.searchEnter || searchDone) return;
		if ((ppt.searchSend == 2 || lib.list.Count > 200000) && panel.search.txt && panel.search.txt.length < 4) {
			lib.upd_search = true;
			lib.search500();
			this.logHistory();
		} else {
			lib.search500.cancel();
			lib.upd_search = true;
			lib.search();
			this.logHistory();
		}
	}

	on_key_down(vkey) {
		if (!panel.search.active) return;
		switch (vkey) {
			case vk.ctrl:
				this.ctrl = true;
				break;
			case vk.left:
			case vk.right:
				if (vkey == vk.left) {
					if (!this.ctrl) {
						if (this.offset > 0) {
							if (this.cx <= this.offset) {
								this.offset--;
								this.cx--;
							} else this.cx--;
						} else if (this.cx > 0) this.cx--;
					} else {
						let boundary = 0;
						for (let k = this.cx - 1; k > 0; k--) {
							if (panel.search.txt[k] != ' ' && panel.search.txt[k - 1] == ' ') {
								boundary = k;
								break;
							}
						}
						if (this.offset > 0) {
							this.offset -= (this.cx - boundary);
						}
						this.cx = boundary;
						this.offset = this.offset >= this.end - this.start ? this.offset - this.end + this.start : 0;
					}
				}
				if (vkey == vk.right && this.cx < panel.search.txt.length) {
					if (!this.ctrl) this.cx++;
					else {
						let boundary = panel.search.txt.length;
						for (let k = this.cx; k < panel.search.txt.length; k++) {
							if (panel.search.txt[k] == ' ' && panel.search.txt[k + 1] != ' ') {
								boundary = k + 1;
								break;
							}
						}
						this.cx = boundary;
					}
				}
				this.start = this.end = this.cx;
				if (this.shift) {
					this.start = Math.min(this.cx, this.shift_x);
					this.end = Math.max(this.cx, this.shift_x);
				}
				panel.search.cursor = true;
				timer.searchCursor(true);
				break;
			case vk.home:
			case vk.end:
				if (vkey == vk.home) this.offset = this.start = this.end = this.cx = 0;
				else this.start = this.end = this.cx = panel.search.txt.length;
				if (this.shift) {
					this.start = Math.min(this.cx, this.shift_x);
					this.end = Math.max(this.cx, this.shift_x);
				}
				panel.search.cursor = true;
				timer.searchCursor(true);
				break;
			case vk.shift:
				this.shift = true;
				this.shift_x = this.cx;
				break;
			case vk.del:
				if (this.ctrl && !this.shift && this.start == this.end) { // ctrl + delete: delete next word
					this.record();
					const initial = panel.search.txt.length;
					const leftSide = panel.search.txt.slice(0, this.cx);
					const rightSide = panel.search.txt.slice(this.cx, panel.search.txt.length).trimStart();
					const idx = rightSide.search(/ \b/);
					const boundary = idx == -1 ? rightSide.length : idx + 1;
					let newRightSide = rightSide.slice(boundary);
					if (newRightSide.length && !/\s$/.test(leftSide) && !/^\s/.test(newRightSide)) newRightSide = ' ' + newRightSide;
					panel.search.txt = leftSide + newRightSide;
					this.cx = !/\s$/.test(leftSide) ? leftSide.length + 1 : leftSide.length;
					if (this.offset > 0) {
						this.offset -= initial - panel.search.txt.length;
					}
					this.calcText();
					this.offset = this.offset >= this.end - this.start ? this.offset - this.end + this.start : 0;
					this.start = this.end = this.cx;
				} else this.on_char('delete');
				break;
		}
		panel.searchPaint();
	}

	on_key_up(vkey) {
		if (!panel.search.active) return;
		if (vkey == vk.ctrl) {
			this.ctrl = false;
		}
		if (vkey == vk.shift) {
			this.shift = false;
			this.shift_x = this.cx;
		}
	}

	rbtn_up(x, y) {
		this.paste = $.getClipboardData() ? true : false;
		searchMenu.load(x, y);
	}

	record() {
		this.lg.push(panel.search.txt);
		this.log = [];
		if (this.lg.length > 30) this.lg.shift();
	}

	focus() {
		panel.searchPaint();
		panel.search.active = true;
		this.shift = false;
		this.start = this.end = this.cx = panel.search.x;
		panel.search.cursor = true;
		timer.searchCursor(true);
		panel.searchPaint();
	}
}

class Find {
	constructor() {
		this.arc1 = 5;
		this.arc2 = 4;
		this.j = {
			x: 5,
			y: 5,
			w: 50,
			h: 30
		};
		this.jSearch = '';
		this.jump_search = true;
		this.initials = null;
		this.prevChar = null; // Regorxxx <- Fixed quick-search on same letter
		this.bAnyPosition = false; // Regorxxx <- Quick-search at any position of string ->
	}

	// Methods

	// Regorxxx <- Quick-search at any position of string
	draw(gr) {
		if (this.jSearch) {
			gr.SetSmoothingMode(4);
			const text = this.jSearch.length
				? (this.bAnyPosition ? '*' : '') +  this.jSearch.toUpperCase()
				: '';
			this.j.w = gr.CalcTextWidth(text, ui.font.find) + 25;
			gr.FillRoundRect(this.j.x - this.j.w / 2, this.j.y, this.j.w, this.j.h, this.arc1, this.arc1, 0x96000000);
			gr.DrawRoundRect(this.j.x - this.j.w / 2, this.j.y, this.j.w, this.j.h, this.arc1, this.arc1, 1, 0x64000000);
			gr.DrawRoundRect(this.j.x - this.j.w / 2 + 1, this.j.y + 1, this.j.w - 2, this.j.h - 2, this.arc2, this.arc2, 1, 0x28ffffff);
			gr.GdiDrawText(text, ui.font.find, $.RGB(0, 0, 0), this.j.x - this.j.w / 2 + 1, this.j.y + 1, this.j.w, this.j.h, panel.cc);
			gr.GdiDrawText(text, ui.font.find, this.jump_search ? 0xfffafafa : 0xffff4646, this.j.x - this.j.w / 2, this.j.y, this.j.w, this.j.h, panel.cc);
			gr.SetSmoothingMode(0);
		}
	}
	// Regorxxx ->

	on_char(code) {
		// Regorxxx <- Quick-search at any position of string
		const bCtrl = utils.IsKeyPressed(vk.ctrl);
		const bShift = utils.IsKeyPressed(vk.shift);
		if (bCtrl || bShift) {
			if (vk.hasKey(code)) { return; }
			if (bCtrl) { code += 96; }
			else { code += 32; }
		}
		// Regorxxx <- Quick-search at any position of string
		const text = String.fromCharCode(code).toLowerCase(); // Regorxxx <- Quick-search optimization ->
		let advance = false;
		if (panel.pos >= 0 && panel.pos < pop.tree.length) {
			const char = pop.tree[panel.pos].name.replace(/@!#.*?@!#/g, '').charAt(0).toLowerCase();
			// Regorxxx <- Fixed quick-search on same letter. Fix quick-searck for non ascii first char, greek and cyrilic
			const normChar = $.asciify(Language.transliterate(char));
			if (pop.tree[panel.pos].sel && (char === text || normChar === text) && this.prevChar == text) { advance = true; }
			this.prevChar = text;
			timer.clear(timer.jsearch3);
			timer.jsearch3.id = setTimeout(() => {
				this.prevChar = null;
				timer.jsearch3.id = null;
			}, 1200);
			// Regorxxx ->
		}
		switch (true) {
			case advance:
				if (utils.IsKeyPressed(0x0A) || utils.IsKeyPressed(0x08) || utils.IsKeyPressed(0x09) || utils.IsKeyPressed(0x11) || utils.IsKeyPressed(0x1B) || utils.IsKeyPressed(0x6A) || utils.IsKeyPressed(0x6D)) return;
				if (!panel.search.active) {
					let init = '';
					let cur = 'currentArr';
					if (!this.initials) { // reset in buildTree
						this.initials = {};
						pop.tree.forEach((v, i) => {
							if (!v.root) {
								const nm = v.name.replace(/@!#.*?@!#/g, '');
								init = $.asciify(Language.transliterate(nm.charAt(0).toLowerCase())); // Regorxxx <- Fix quick-searck for non ascii first char, greek and cyrilic ->
								if (cur != init && !this.initials[init]) {
									this.initials[init] = [i];
									cur = init;
								} else {
									this.initials[init].push(i);
								}
							}
						});
					}

					this.jump_search = false;
					if (panel.pos >= 0 && panel.pos < pop.tree.length) {
						this.matches = this.initials[text];
						this.ix = this.matches.indexOf(panel.pos);
						this.ix++;
						if (this.ix >= this.matches.length) this.ix = 0;
						panel.pos = this.matches[this.ix];
						this.jump_search = true;
					}
					if (this.jump_search) {
						pop.clearSelected();
						pop.sel_items = [];
						pop.tree[panel.pos].sel = true;
						pop.setPos(panel.pos);
						pop.getTreeSel();
						lib.treeState(false, ppt.rememberTree);
						panel.treePaint();
						if (panel.imgView) pop.showItem(panel.pos, 'focus');
						else {
							const row = (panel.pos * ui.row.h - sbar.scroll) / ui.row.h;
							if (sbar.rows_drawn - row < 3 || row < 0) sbar.checkScroll((panel.pos + 3) * ui.row.h - sbar.rows_drawn * ui.row.h);
						}
						if (ppt.libSource) {
							// if (pop.autoFill.key) pop.load(pop.sel_items, true, false, false, !ppt.sendToCur, false);
							if (pop.autoFill.key) pop.load({ bAddToPls: false, bAutoPlay: false, bUseDefaultPls: !ppt.sendToCur, bInsertToPls: false });
							pop.track(pop.autoFill.key);
						} else if (panel.pos >= 0 && panel.pos < pop.tree.length) pop.setPlaylistSelection(panel.pos, pop.tree[panel.pos]);
					} else {
						this.jSearch = text;
						panel.treePaint();
						timer.clear(timer.jsearch2);
						timer.jsearch2.id = setTimeout(() => {
							this.jSearch = '';
							this.bAnyPosition = false; // Regorxxx <- Quick-search at any position of string ->
							panel.treePaint();
							timer.jsearch2.id = null;
						}, 1200);
					}
				}
				break;
			case !advance:
				if (utils.IsKeyPressed(0x09) || utils.IsKeyPressed(0x1B) || utils.IsKeyPressed(0x6A) || utils.IsKeyPressed(0x6D)) return;
				if (!panel.search.active) {
					let found = false;
					let pos = -1;
					switch (code) {
						case vk.back:
							this.jSearch = this.jSearch.substr(0, this.jSearch.length - 1);
							break;
						// Regorxxx <- Quick-search at any position of string
						case vk.enter:
							this.jSearch = '';
							this.bAnyPosition = false;
							return;
						default:
							if (this.jSearch.length === 0 && (bShift || bCtrl)) { this.bAnyPosition = true; }
							this.jSearch += text;
							break;
						// Regorxxx ->
					}
					pop.clearSelected();
					if (!this.jSearch) return;
					pop.sel_items = [];
					this.jump_search = true;
					panel.treePaint();
					timer.clear(timer.jsearch1);
					timer.jsearch1.id = setTimeout(() => {
						pop.tree.some((v, i) => {
							const name = $.asciify(Language.transliterate(v.name.replace(/@!#.*?@!#/g, ''))); // Regorxxx <- Fix quick-searck for non ascii first char, greek and cyrilic ->
							if (name != panel.rootName && name.toLowerCase()[this.bAnyPosition ? 'includes' : 'startsWith'](this.jSearch)) { // Regorxxx <- Quick-search optimization | Quick-search at any position of string ->
								found = true;
								pos = i;
								v.sel = true;
								pop.setPos(pos);
								pop.getTreeSel();
								lib.treeState(false, ppt.rememberTree);
								return true;
							}
						});
						if (!found) this.jump_search = false;
						panel.treePaint();
						if (found) pop.showItem(pos, 'focus');
						timer.jsearch1.id = null;
					}, 500);

					timer.clear(timer.jsearch2);
					timer.jsearch2.id = setTimeout(() => {
						if (found) {
							if (ppt.libSource) {
								if (pop.autoFill.key) pop.load({ bAddToPls: false, bAutoPlay: false, bUseDefaultPls: !ppt.sendToCur, bInsertToPls: false });
								pop.track(pop.autoFill.key);
							} else if (pos >= 0 && pos < pop.tree.length) pop.setPlaylistSelection(pos, pop.tree[pos]);
						}
						this.jSearch = '';
						this.bAnyPosition = false; // Regorxxx <- Quick-search at any position of string ->
						panel.treePaint();
						timer.jsearch2.id = null;
					}, 1200);
				}
		}
	}

	on_size() {
		this.j.x = Math.round(ui.w / 2);
		this.j.h = Math.round(ui.row.h * 1.5);
		this.j.y = Math.round((ui.h - this.j.h) / 2);
		this.arc1 = Math.min(5, this.j.h / 2);
		this.arc2 = Math.min(4, (this.j.h - 2) / 2);
	}
}