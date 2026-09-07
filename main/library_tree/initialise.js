'use strict';
//07/09/26

/* global UserInterface:readable, Panel:readable, Scrollbar:readable, Vkeys:readable, Library:readable, Populate:readable, Search:readable, Find:readable, Buttons:readable, PopUpBox:readable, MenuItems:readable, Timers:readable, FileExplorer:readable, ppt:readable */
/* global require:readable */

/* exported ui, panel, sbar, vk, lib, pop, search, but, find, popUpBox, men, timer, Chroma, explorer */

/* eslint-disable no-redeclare */

let pop;
let but; // Regorxxx <- Filter / View / Source button ->
const ui = new UserInterface;
const panel = new Panel;
const sbar = new Scrollbar;
const vk = new Vkeys;
const lib = new Library;
pop = new Populate;
const explorer = new FileExplorer(panel.isFileExplorerSource(), function () {
	['mbtnClickAction', 'altClickAction', 'dblClickAction'].forEach((key) => {
		Object.defineProperty(this, key, {
			get: () => ppt[key]
		});
	});
	Object.defineProperty(this, 'libPlaylistName', {
		get: () => panel.getLibPlaylistName()
	});
});
const search = new Search;
const find = new Find;
but = new Buttons; // Regorxxx <- Filter / View / Source button ->
const popUpBox = new PopUpBox;
const men = new MenuItems;
const timer = new Timers;
const Chroma = require('..\\helpers-external\\chroma.js\\chroma.min'); // Relative to helpers folder