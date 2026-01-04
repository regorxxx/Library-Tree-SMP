'use strict';
//01/01/26

if (!window.ScriptInfo.PackageId) { window.DefineScript('Library-Tree-SMP', { author: 'regorxxx', version: '1.0.0', features: { drag_n_drop: true, grab_focus: true } }); }


const loadAsync = window.GetProperty('Load Library Tree Asynchronously', true);

async function readFiles(files) {
	for (const file of files) {
		if (window.ID) { // fix pss issue
			await include(file);
		}
	}
}
// Regorxxx <- change file structure
const files = [
	// Regorxxx <- xxx-scripts helpers
	'helpers\\helpers_xxx.js',
	/* global globProfiler:readable */
	'helpers\\helpers_xxx_flags.js',
	'helpers\\helpers_xxx_language.js',
	'helpers\\callbacks_xxx.js',
	'helpers\\helpers_xxx_tags.js',
	'helpers\\helpers_xxx_prototypes_smp_post.js',
	'main\\filter_and_query\\remove_duplicates.js',
	'main\\sort\\scatter_by_tags.js',
	'main\\sort\\harmonic_mixing.js',
	// Regorxxx ->
	'main\\library_tree\\helpers.js',
	'main\\library_tree\\properties.js',
	'main\\library_tree\\interface.js',
	'main\\library_tree\\panel.js',
	'main\\library_tree\\scrollbar.js',
	'main\\library_tree\\library.js',
	'main\\library_tree\\populate.js',
	'main\\library_tree\\search.js',
	'main\\library_tree\\buttons.js',
	'main\\library_tree\\popupbox.js',
	'main\\library_tree\\timers.js',
	'main\\library_tree\\menu.js',
	'main\\library_tree\\initialise.js',
	'main\\library_tree\\images.js',
	'main\\library_tree\\callbacks.js'
];
// Regorxxx ->

if (loadAsync) {
	readFiles(files).then(() => {
		globProfiler.Print('helpers'); // Regorxxx <- Init profiler ->
		if (!window.ID) return; // fix pss issue
		on_size();
		if (window.IsVisible) { window.Repaint(); }
	});
} else {
	files.forEach(v => include(v));
	globProfiler.Print('helpers'); // Regorxxx <- Init profiler ->
}