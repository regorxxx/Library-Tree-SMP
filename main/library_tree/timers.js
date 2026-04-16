'use strict';
//16/04/26

/* global panel:readable, pop:readable */

/* exported Timers */

class Timers {
	constructor() {
		['cursor', 'jsearch1', 'jsearch2', 'jsearch3', 'tt', 'searchTplClck'].forEach(v => this[v] = { // Regorxxx <- Fixed quick-search on same letter | Search triple click ->
			id: null
		});
	}

	// Methods

	clear(timer) {
		if (timer) clearTimeout(timer.id);
		timer.id = null;
	}

	searchCursor(clear) {
		if (clear) this.clear(this.cursor);
		if (!panel.search.cursor) panel.search.cursor = true;
		this.cursor.id = setInterval(() => {
			panel.search.cursor = !panel.search.cursor;
			panel.searchPaint();
		}, 530);
	}

	tooltip() {
		this.clear(this.tt);
		this.tt.id = setTimeout(() => {
			pop.deactivateTooltip();
			this.tt.id = null;
		}, 5000);
	}
}