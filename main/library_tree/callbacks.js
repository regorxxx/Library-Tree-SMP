'use strict';
//09/01/26

/* global ui:readable, panel:readable, ppt:readable, lib:readable, pop:readable, but:readable, img:readable, search:readable, timer:readable, $:readable, men:readable, vk:readable, folders:readable, sync:readable, tooltip:readable, sbar:readable */
/* global dropEffect:readable */

addEventListener('on_colours_changed', (keepCache) => {
	ui.getColours();

	if (panel.colMarker) {
		panel.getFields(ppt.viewBy, ppt.filterBy);
		if (lib) {
			lib.getLibrary();
			lib.rootNodes(true, true);
		}
	}
	sbar.setCol();
	pop.createImages();
	but.createImages();
	if (!keepCache) img.clearCache();
	img.createImages();
	but.refresh(true);
	sbar.resetAuto();
	ui.createImages();
	if (!ppt.themed) ui.blurReset();
	window.Repaint();
});

addEventListener('on_font_changed', () => {
	sbar.logScroll();
	pop.deactivateTooltip();
	ui.getFont();
	panel.on_size(true);
	if (ui.style.topBarShow || ppt.sbarShow) but.refresh(true);
	sbar.resetAuto();
	window.Repaint();
	sbar.setScroll();
});

addEventListener('on_char', (code) => {
	pop.on_char(code);
	find.on_char(code);
	if (!ppt.searchShow) return;
	search.on_char(code);
});

addEventListener('on_focus', (is_focused) => {
	if (!is_focused) {
		timer.clear(timer.cursor);
		panel.search.cursor = false;
		panel.searchPaint();
	}
	pop.on_focus(is_focused);
});

addEventListener('on_get_album_art_done', (handle, art_id, image, image_path) => {
	ui.on_get_album_art_done(handle, image, image_path);
});

addEventListener('on_item_focus_change', (playlistIndex) => {
	lib.checkFilter('selection'); // Regorxxx <- Improve filter checking based on events. Search text also triggers updates to filtering ->
	if (!pop.setFocus) {
		if (ppt.followPlaylistFocus && playlistIndex == $.pl_active && !ppt.libSource) {
			setSelection(fb.GetFocusItem());
		}
	} else pop.setFocus = false;
	ui.focus_changed();
});

addEventListener('on_key_down', (vkey) => {
	pop.on_key_down(vkey);
	img.on_key_down(vkey);
	if (!ppt.searchShow) return;
	search.on_key_down(vkey);
});

addEventListener('on_key_up', (vkey) => {
	img.on_key_up(vkey);
	if (!ppt.searchShow) return;
	search.on_key_up(vkey);
});

addEventListener('on_library_items_added', (handleList) => {
	if (ppt.libSource === 2 || ppt.libSource === 3) { return; } // Regorxxx <- Queue source ->
	if (lib.v2_init) {
		lib.v2_init = false;
		if (ui.w < 1 || !window.IsVisible) return;
		lib.initialise(handleList, true); // Regorxxx <- Don't create cache playlists if possible
		return;
	}
	if (!ppt.libAutoSync || ppt.fixedPlaylist || !ppt.libSource) return;
	lib.treeState(false, 2, handleList, 0);
});

addEventListener('on_library_items_removed', (handleList) => {
	if (!ppt.libAutoSync || ppt.fixedPlaylist || !ppt.libSource || ppt.libSource === 3) { return; } // Regorxxx <- Queue source ->
	if (ppt.libSource == 2) {
		const libList = lib.list.Clone();
		libList.Sort();
		handleList.Sort();
		handleList.MakeIntersection(libList);
	}
	lib.treeState(false, 2, handleList, 2);
});

addEventListener('on_library_items_changed', (handleList) => {
	if (!ppt.libAutoSync || ppt.fixedPlaylist || !ppt.libSource || ppt.libSource === 3) { return; } // Regorxxx <- Queue source ->
	if (ppt.libSource == 2) {
		const libList = lib.list.Clone();
		libList.Sort();
		handleList.Sort();
		handleList.MakeIntersection(libList);
	}
	lib.treeState(false, 2, handleList, 1);
});

addEventListener('on_main_menu', (index) => {
	pop.on_main_menu(index);
});

addEventListener('on_metadb_changed', (handleList, isDatabase) => {
	if (isDatabase && !panel.statistics || lib.list.Count != lib.libNode.length) return;
	if (ppt.fixedPlaylist || !ppt.libSource) {
		handleList.Convert().some(h => {
			const i = lib.full_list.Find(h);
			if (i != -1) {
				const isMainChanged = lib.isMainChanged(handleList);
				if (isMainChanged) lib.treeState(false, 2);
				ui.focus_changed();
				return true;
			}
		});
	}
});

addEventListener('on_mouse_lbtn_dblclk', (x, y) => {
	but.lbtn_dn(x, y);
	if (ppt.searchShow) search.lbtn_dblclk(x, y);
	pop.lbtn_dblclk(x, y);
	but.lbtn_dblclk(x, y); // Regorxxx <- Double click scrollbar
	sbar.lbtn_dblclk(x, y);
});

addEventListener('on_mouse_lbtn_down', (x, y) => {
	if (ppt.touchControl) panel.last_pressed_coord = {
		x: x,
		y: y
	};
	if (ui.style.topBarShow || ppt.sbarShow) but.lbtn_dn(x, y);
	if (ppt.searchShow) search.lbtn_dn(x, y);
	pop.lbtn_dn(x, y);
	sbar.lbtn_dn(x, y);
	ui.sz.y_start = y;
});

addEventListener('on_mouse_lbtn_up', (x, y) => {
	pop.lbtn_up(x, y);
	if (ppt.searchShow) search.lbtn_up();
	but.lbtn_up(x, y);
	sbar.lbtn_up();
});

addEventListener('on_mouse_leave', () => {
	if (ui.style.topBarShow || ppt.sbarShow) but.leave();
	sbar.leave();
	pop.leave();
});

addEventListener('on_mouse_mbtn_dblclk', (x, y, mask) => {
	pop.mbtnDblClickOrAltDblClick(x, y, mask, 'mbtn');
});

addEventListener('on_mouse_mbtn_down', (x, y) => {
	pop.mbtn_dn(x, y);
});

addEventListener('on_mouse_mbtn_up', (x, y, mask) => {
	// hacks at default settings blocks on_mouse_mbtn_up, at least in windows; workaround configure hacks: main window > move with > caption only & ensure pseudo-caption doesn't overlap buttons
	pop.mbtnUpOrAltClickUp(x, y, mask, 'mbtn');
});

addEventListener('on_mouse_move', (x, y) => {
	if (panel.m.x == x && panel.m.y == y) return;
	pop.hand = false;
	if (ui.style.topBarShow || ppt.sbarShow) but.move(x, y);
	if (ppt.searchShow) search.move(x, y);
	pop.move(x, y);
	pop.dragDrop(x, y);
	sbar.move(x, y);
	ui.zoomDrag(x, y);
	panel.m.x = x;
	panel.m.y = y;
});

addEventListener('on_mouse_rbtn_up', (x, y) => {
	if (y < panel.search.h && x > panel.search.x && x < panel.search.x + panel.search.w) {
		if (ppt.searchShow) search.rbtn_up(x, y);
	} else men.rbtn_up(x, y);
	return true;
});

addEventListener('on_mouse_wheel', (step) => {
	pop.deactivateTooltip();
	if (!vk.k('zoom')) sbar.wheel(step);
	else ui.wheel(step);
});

addEventListener('on_notify_data', (name, info) => {
	if (ppt.libSource == 2 && name != 'bio_imgChange') {
		const panelSelectionPlaylists = ppt.panelSelectionPlaylist.split(/\s*\|\s*/);
		// Regorxxx <- Merge multiple panel sources
		if (ppt.libSourceChained && panelSelectionPlaylists.length > 1) {
			// Note this doesn't survive after panel reload, so source selections must be re-sent
			if (!lib.listPerSource) { lib.listPerSource = {}; }
			panelSelectionPlaylists.forEach(v => {
				if (name == v) {
					lib.listPerSource[v] = new FbMetadbHandleList(info);
					lib.listPerSource[v].Sort();
				}
			});
		}
		// Regorxxx ->
		panelSelectionPlaylists.some(v => {
			if (name == v) {
				// Regorxxx <- Merge multiple panel sources
				if (ppt.libSourceChained && panelSelectionPlaylists.length > 1) {
					lib.list = new FbMetadbHandleList();
					Object.values(lib.listPerSource).forEach((handleList) => lib.list.MakeUnion(handleList));
				} else {
					lib.list = new FbMetadbHandleList(info);
				}
				// Regorxxx ->
				if ($.equalHandles(lib.list.Convert(), lib.full_list.Convert())) return;
				lib.full_list = lib.list.Clone();
				ppt.lastPanelSelectionPlaylist = `${v} Cache`;
				// Regorxxx <- Don't create cache playlists if possible
				if (ppt.panelInternalCache) {
					if (lib.list.SaveAs) {
						$.buildPth(folders.dataPackage + '\\librarytreeSel\\');
						lib.list.SaveAs(folders.dataPackage + '\\librarytreeSel\\' + ppt.lastPanelSelectionPlaylist + '.fpl');
					}
				} else {
					const pln = plman.FindOrCreatePlaylist(ppt.lastPanelSelectionPlaylist, false);
					plman.ClearPlaylist(pln);
					plman.InsertPlaylistItems(pln, 0, lib.list);
				}
				if (!lib.initialised && ppt.panelInternalCache) { lib.initialise(lib.full_list); }
				else {
					lib.searchCache = {};
					pop.clearTree();
					pop.cache = {
						'standard': {},
						'search': {},
						'filter': {}
					};
					lib.treeState(false, 2, null, 3);
					ui.expandHandle = lib.list.Count ? lib.list[0] : null;
					ui.on_playback_new_track();
					lib.treeState(false, ppt.rememberTree);
					if (ppt.libSourceChained) { pop.notifySelection(lib.list); } // Regorxxx <- Chained facets updates.
				}
				// Regorxxx ->
				return;
			}
		});
	}

	switch (name) {
		case '!!.tags update':
			lib.treeState(false, 2);
			break;
		case 'newThemeColours':
			if (!ppt.themed) break;
			ppt.theme = info.theme;
			ppt.themeBgImage = info.themeBgImage;
			ppt.themeColour = info.themeColour;
			on_colours_changed(true);
			break;
		case 'Sync col': {
			if (!ppt.themed) break;
			const themeLight = ppt.themeLight;
			if (themeLight != info.themeLight) {
				ppt.themeLight = info.themeLight;
				on_colours_changed(true);
			}
			break;
		}
		case 'Sync image':
			if (!ppt.themed) break;
			sync.image(new GdiBitmap(info.image), info.id);
			break;
		// Regorxxx <- Don't create cache playlists if possible
		case window.ScriptInfo.Name + ': ask selection': {
			if (!info.some((v) => v === window.Name)) { break; }
			pop.notifySelection();
			break;
		}
		// Regorxxx ->
		// Regorxxx <- External integration
		case window.ScriptInfo.Name + ': new':
		case window.ScriptInfo.Name + ': insert':
		case window.ScriptInfo.Name + ': add': {
			if (info && info.window && !info.window.some((v) => v === window.Name)) { break; }
			pop.getTreeSel();
			if (!pop.sel_items.length) { break; }
			if (name === window.ScriptInfo.Name + ': New') { pop.sendToNewPlaylist(); }
			else { pop.load({ bAddToPls: true, bAutoPlay: false, bUseDefaultPls: false, bInsertToPls: name === window.ScriptInfo.Name + ': Insert' }); }
			break;
		}
		case window.ScriptInfo.Name + ': show now playing': {
			if (info && info.window && !info.window.some((v) => v === window.Name)) { break; }
			pop.nowPlayingShow();
			break;
		}
		case window.ScriptInfo.Name + ': show handle': {
			if (!info || !info.handle) { break; }
			if (info.window && !info.window.some((v) => v === window.Name)) { break; }
			const item = panel.list.Find(info.handle);
			if (item !== -1) { pop.selShow(item); }
			break;
		}
		case window.ScriptInfo.Name + ': switch show art':
		case window.ScriptInfo.Name + ': show art':
		case window.ScriptInfo.Name + ': show tree': {
			if (info && info.window && !info.window.some((v) => v === window.Name)) { break; }
			if (name === window.ScriptInfo.Name + ': show album art' && panel.imgView) { break; }
			if (name === window.ScriptInfo.Name + ': show tree' && !panel.imgView) { break; }
			men.setPlaylist(4);
			break;
		}
		case window.ScriptInfo.Name + ': switch show artists / albums':
		case window.ScriptInfo.Name + ': show artists':
		case window.ScriptInfo.Name + ': show albums': {
			if (info && info.window && !info.window.some((v) => v === window.Name)) { break; }
			if (!panel.imgView && info && info.forceShowArt) { men.setPlaylist(4); }
			if (name === window.ScriptInfo.Name + ': show albums' && ppt.artId != 4) { break; }
			if (name === window.ScriptInfo.Name + ': show artists' && ppt.artId === 4) { break; }
			ppt.artId = ppt.artId === 4 ? 0 : 4;
			men.setPlaylist(5);
			break;
		}
		case window.ScriptInfo.Name + ': switch art type': {
			if (info && info.window && !info.window.some((v) => v === window.Name)) { break; }
			if (!panel.imgView && info && info.forceShowArt) { men.setPlaylist(4); }
			let idx = -1;
			const types = men.artTypes();
			if (typeof info.artType !== 'undefined') { idx = types.findIndex((t) => t.toLowerCase() === info.artType.toLowerCase()); }
			else if (typeof info.artIdx !== 'undefined' && info.artIdx >= -1 && info.artIdx < types.length) {
				if (info.artIdx === -1) { idx = 0; }
				else { idx = info.artIdx; }
			}
			if (idx !== -1) { men.setAlbumart(idx); }
			break;
		}
		case window.ScriptInfo.Name + ': collapse all': {
			if (info && info.window && !info.window.some((v) => v === window.Name)) { break; }
			men.setTreeState(0);
			break;
		}
		case window.ScriptInfo.Name + ': quicksearch': {
			if (!info || typeof info.viewName === 'undefined' || !info.search.length) { break; }
			if (info.window && !info.window.some((v) => v === window.Name)) { break; }
			info.search.split('').forEach((s) => on_char(s.charCodeAt(0)));
			break;
		}
		case window.ScriptInfo.Name + ': search': {
			if (!ppt.searchShow) { break; }
			if (!info || typeof info.viewName === 'undefined' || !info.search.length) { break; }
			if (info.window && !info.window.some((v) => v === window.Name)) { break; }
			info.search.split('').forEach((s) => search.on_char(s.charCodeAt(0), true));
			search.on_char(vk.enter);
			break;
		}
		case window.ScriptInfo.Name + ': search clear': {
			if (!ppt.searchShow) { break; }
			if (info.window && !info.window.some((v) => v === window.Name)) { break; }
			search.clear();
			break;
		}
		case window.ScriptInfo.Name + ': search focus': {
			if (!ppt.searchShow) { break; }
			if (info.window && !info.window.some((v) => v === window.Name)) { break; }
			if (pop.is_focused) { search.focus(); }
			break;
		}
		case window.ScriptInfo.Name + ': switch view': {
			if (info.window && !info.window.some((v) => v === window.Name)) { break; }
			let idx = -1;
			if (typeof info.viewName !== 'undefined') { idx = panel.grp.findIndex(v => v.name.trim().toLowerCase() === info.viewName.toLowerCase()); }
			else if (typeof info.viewIdx !== 'undefined' && info.viewIdx >= -1 && info.viewIdx < panel.grp.length) {
				if (info.viewIdx === -1) { idx = panel.grp.length - 1; }
				else if (panel.grp[info.viewIdx].name.trim() !== 'separator') { idx = info.viewIdx; }
			}
			if (idx !== -1) { men.setView(idx); }
			break;
		}
		case window.ScriptInfo.Name + ': switch filter': {
			if (info.window && !info.window.some((v) => v === window.Name)) { break; }
			let idx = -1;
			if (typeof info.filterName !== 'undefined') { idx = panel.dialogFiltGrps.findIndex(v => v.name.trim().toLowerCase() === info.filterName.toLowerCase()); }
			else if (typeof info.filterIdx !== 'undefined' && info.filterIdx >= -1 && info.filterIdx < panel.dialogFiltGrps.length) {
				if (info.filterIdx === -1) { idx = 0; }
				else if (panel.dialogFiltGrps[info.filterIdx].name.trim() !== 'separator') { idx = info.filterIdx; }
			}
			if (idx !== -1) { panel.set('Filter', idx); }
			break;
		}
		case window.ScriptInfo.Name + ': switch source': {
			if (info.window && !info.window.some((v) => v === window.Name)) { break; }
			let idx = -1;
			let plsIdx = -1;
			// Source type
			const types = men.sourceTypes();
			if (typeof info.sourceName !== 'undefined') { idx = types.findIndex((t) => t.toLowerCase() === info.sourceName.toLowerCase()); }
			else if (typeof info.sourceIdx !== 'undefined' && info.sourceIdx >= -1 && info.sourceIdx < types.length) {
				if (info.sourceIdx === -1) { idx = 0; }
				else { idx = info.sourceIdx; }
			}
			// Playlists
			if (typeof info.sourcePlaylistName !== 'undefined') { plsIdx = plman.FindOrCreatePlaylist(info.sourcePlaylistName); }
			else if (typeof info.sourcePlaylistIdx !== 'undefined' && info.sourcePlaylistIdx >= -1 && info.sourcePlaylistIdx > plman.PlaylistCount) {
				if (info.sourcePlaylistIdx === -1) { plsIdx = plman.ActivePlaylist; }
				else { plsIdx = info.sourcePlaylistIdx; }
			}
			// Panels
			if (typeof info.sourcePanel !== 'undefined') {
				ppt.panelSelectionPlaylist = info.sourcePanel;
			}
			// Set all
			if (plsIdx !== -1) { men.setFixedPlaylist(plsIdx); }
			if (idx !== -1) { men.setSource(idx); }
			break;
		}
		case window.ScriptInfo.Name + ': switch statistics': {
			if (info.window && !info.window.some((v) => v === window.Name)) { break; }
			let idx = -1;
			const types = men.statisticsTypes();
			const customRe = / \[custom-\d \(avg\)\]/i;
			if (typeof info.statisticsName !== 'undefined') {
				const statsName = info.statisticsName.toLowerCase();
				idx = types.findIndex((t) => {
					t = t.toLowerCase(); // Match entire name, user label or Custom-X (avg) labels
					return t === statsName || t.replace(customRe, '') === statsName || t === t.replace(customRe, '') + ' [' + statsName + ']';
				});
			} else if (typeof info.statisticsIdx !== 'undefined' && info.statisticsIdx >= -1 && info.statisticsIdx < types.length) {
				if (info.statisticsIdx === -1) { idx = 0; }
				else { idx = info.statisticsIdx; }
			}
			if (idx !== -1) { men.setSource(idx); }
			break;
		}
		// Regorxxx ->
	}
	// Regorxxx <- Code cleanup. Remove ui.id.local references ->
});

addEventListener('on_paint', (gr) => {
	if (!window.ID) { return; }
	if (!window.Width || !window.Height) { return; }
	// Regorxxx <- Don't create cache playlists if possible
	if (!lib.initialised) {
		if (ppt.libSource === 2 && ppt.panelInternalCache) {
			const cache = folders.dataPackage + '\\librarytreeSel\\' + ppt.lastPanelSelectionPlaylist + '.fpl';
			if (utils.IsFile(cache)) {
				lib.cacheId = fb.AddLocationsAsync([cache]);
			} else {
				const panelSelectionPlaylists = ppt.panelSelectionPlaylist.split(/\s*\|\s*/);
				window.NotifyOthers(window.ScriptInfo.Name + ': ask selection', panelSelectionPlaylists);
			}
		} else {
			lib.initialise(void (0), true);
		}
	}
	// Regorxxx ->
	ui.draw(gr);
	lib.checkTree();
	img.draw(gr);
	ui.drawLine(gr);
	search.draw(gr);
	pop.draw(gr);
	sbar.draw(gr);
	but.draw(gr);
	find.draw(gr);
	// Regorxxx <- Fix HTML options panel error on panel reload when changing current library view or filter
	if (lib.initialised && ppt.get('Library Tree Dialog Box Reopen')) {
		ppt.set('Library Tree Dialog Box Reopen', false);
		setTimeout(() => panel.open(), 100);
	}
	// Regorxxx ->
});

addEventListener('on_playback_new_track', (handle) => {
	lib.checkFilter('playback'); // Regorxxx <- Improve filter checking based on events. Search text also triggers updates to filtering ->
	pop.getNowplaying(handle);
	if (!ppt.recItemImage || ppt.libSource != 2) ui.on_playback_new_track(handle);
	panel.updateAutoDj(); // Regorxxx <- Auto-DJ feature ->
});

addEventListener('on_playback_stop', (reason) => {
	if (reason == 2) return;
	pop.getNowplaying('', true);
	on_item_focus_change();
	panel.stopAutoDj();
});

addEventListener('on_playback_queue_changed', () => {
	if (ppt.libSource === 3) { lib.treeState(false, 2); } // Regorxxx <- Queue source ->
	on_queue_changed();
});

addEventListener('on_playlists_changed', () => {
	men.playlists_changed();
	if ($.pl_active != plman.ActivePlaylist) $.pl_active = plman.ActivePlaylist;
	// Regorxxx <- Allow multiple fixed playlists as source | Allow fixed playlist by GUID
	if (ppt.fixedPlaylist) {
		const fixedPlaylistIndex = lib.getFixedPlaylistSources();
		if (fixedPlaylistIndex.length === 0) {
			ppt.fixedPlaylist = false;
			ppt.libSource = 0;
			if (panel.imgView) img.clearCache();
			lib.playlist_update();
		}
	}
	// Regorxxx ->
});

addEventListener('on_playlist_items_added', (playlistIndex) => {
	// Regorxxx <- Allow multiple fixed playlists as source | Allow fixed playlist by GUID
	if (ppt.fixedPlaylist) {
		const fixedPlaylistIndex = lib.getFixedPlaylistSources();
		if (fixedPlaylistIndex.includes(playlistIndex)) {
			lib.playlist_update(playlistIndex);
			return;
		}
	}
	// Regorxxx ->
	if (!ppt.libSource && playlistIndex == $.pl_active) {
		lib.playlist_update(playlistIndex);

	}
});

addEventListener('on_playlist_items_removed', (playlistIndex) => {
	if (ppt.fixedPlaylist) {
		const fixedPlaylistIndex = lib.getFixedPlaylistSources();
		if (fixedPlaylistIndex.includes(playlistIndex)) {
			lib.playlist_update(playlistIndex);
			return;
		}
	}

	if (!ppt.libSource && playlistIndex == $.pl_active) {
		lib.playlist_update(playlistIndex);
	}
});

addEventListener('on_playlist_items_reordered', (playlistIndex) => {
	if (!ppt.libSource && playlistIndex == $.pl_active) {
		lib.playlist_update(playlistIndex);
	}
});

addEventListener('on_playlist_switch', () => {
	$.pl_active = plman.ActivePlaylist;
	if (!ppt.libSource) {
		lib.playlist_update();
	}
	ui.focus_changed();
});

const on_queue_changed = $.debounce(() => {
	if (ppt.itemShowStatistics != 7) return;
	pop.tree.forEach(v => {
		v.id = '';
		v.count = '';
		delete v.statistics;
		delete v._statistics;
	});
	pop.cache = {
		'standard': {},
		'search': {},
		'filter': {}
	};
	panel.treePaint();
}, 250, {
	leading: true,
	trailing: true
});

addEventListener('on_script_unload', () => {
	but.on_script_unload();
	if (ppt.searchShow) { search.on_script_unload(); } // Regorxxx <- Tooltip over search input box
	pop.deactivateTooltip();
});

addEventListener('on_selection_changed', () => {
	if (!panel.setSelection()) return;
	setSelection(fb.GetSelection());
});

const windowMetricsPath = `${fb.ProfilePath}settings\\themed\\windowMetrics.json`;
addEventListener('on_size', () => {
	ui.w = window.Width;
	ui.h = window.Height;
	if (!ui.w || !ui.h) return;

	pop.deactivateTooltip();
	tooltip.SetMaxWidth(Math.max(ui.w, 800));
	ui.blurReset();
	ui.calcText(true);

	if (ppt.themed && ppt.theme) {
		const themed_image = `${fb.ProfilePath}settings\\themed\\themed_image.bmp`;
		if ($.file(themed_image)) sync.image(gdi.Image(themed_image));
	}

	panel.on_size();
	if (ui.style.topBarShow || ppt.sbarShow) but.refresh(true);
	sbar.resetAuto();
	find.on_size();

	if (!ppt.themed) return;
	const windowMetrics = $.jsonParse(windowMetricsPath, {}, 'file');
	windowMetrics[window.Name] = {
		w: ui.w,
		h: ui.h
	};
	$.save(windowMetricsPath, JSON.stringify(windowMetrics, null, 3), true);
});

function setSelection(handle) {
	if (!handle || !panel.list.Count) return;
	const item = panel.list.Find(handle);
	let idx = -1;
	pop.tree.forEach((v, i) => {
		if (!v.root && pop.inRange(item, v.item)) idx = i;
	});
	if (idx != -1) {
		if (!panel.imgView) pop.focusShow(idx);
		else pop.showItem(idx, 'focus');
	}
};

// Regorxxx <- Don't create cache playlists if possible
addEventListener('on_locations_added', (taskId, handleList) => {
	if (taskId === lib.cacheId) {
		lib.cache = handleList.Clone();
		if (ppt.libSource === 2) { lib.initialise(lib.cache); }
	}
});
// Regorxxx ->

// Regorxxx <- Drag n' drop to search box
// Drag n drop to copy/move tracks to playlists (only files from foobar2000)
addEventListener('on_drag_enter', (action, x, y, mask) => { // eslint-disable-line no-unused-vars
	if (!ui.w || !ui.h || !ppt.searchShow || ppt.searchDragMethod === -1) { return; }
	// Avoid things outside foobar2000
	if (action.Effect === dropEffect.none || (action.Effect & dropEffect.link) === dropEffect.link) { action.Effect = dropEffect.none; }
});

addEventListener('on_drag_leave', (action, x, y, mask) => {
	if (!ui.w || !ui.h || !ppt.searchShow || ppt.searchDragMethod === -1) { return; }
	on_mouse_leave(x, y, mask);
});

addEventListener('on_drag_over', (action, x, y, mask) => {
	if (!ui.w || !ui.h || !ppt.searchShow || ppt.searchDragMethod === -1) { return; }
	// Avoid things outside foobar2000
	if (action.Effect === dropEffect.none || (action.Effect & dropEffect.link) === dropEffect.link) { action.Effect = dropEffect.none; return; }
	// Move playlist index only while not pressing alt
	on_mouse_move(x, y, mask);
	// Set effects
	action.Effect = dropEffect.copy;
	action.Text = search.getDragDropTooltipText(ppt.searchDragMethod, mask);
});

addEventListener('on_drag_drop', (action, x, y, mask) => {
	if (!ui.w || !ui.h || !ppt.searchShow || ppt.searchDragMethod === -1) { return; }
	// Avoid things outside foobar2000
	if (action.Effect === dropEffect.none) { return; }
	action.Effect = dropEffect.none; // Forces not sending things to a playlist
	const selItems = fb.GetSelections(1);
	if (selItems && selItems.Count) {
		const input = search.getDragDropExpression(selItems, ppt.searchDragMethod, mask);
		search.clear();
		if (input.length) {
			input.split('').forEach((s) => search.on_char(s.charCodeAt(0), true));
			search.on_char(vk.enter);
		}
	}
});
// Regorxxx ->