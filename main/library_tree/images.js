'use strict';
//24/05/26

/* global ui:readable, panel:readable, ppt:readable, $:readable, vk:readable, sbar:readable, pop:readable, md5:readable, pluralize:readable, popUpBox:readable, lib:readable */
/* global folders:readable, globTags:readable */
/* global getFiles:readable, _deleteFolder:readable, WshShell:readable, popup:readable */
/* global applyMask:readable, applyAsMask:readable, applyEffect:readable, applyEffectAsMaskEffect:readable, Effects:readable, BorderMode:readable, BlendMode:readable, BrushType:readable, BrushWrapMode: readable */
/* global getStarPoints:readable, getHeartPoints:readable */
/* global InterpolationMode:readable, SmoothingMode:readable, RotateFlipType:readable */

/* exported img */

class Images {
	constructor() {
		this.accessed = 0;
		this.asyncBypass = 0;
		this.blockWidth = 150;
		this.cachePath = folders.dataPackage + 'librarytreeCache\\';
		this.cellWidth = 200;
		this.column = 0;
		this.columnWidth = 150;
		this.database = this.newDatabase();
		this.end = 1;
		this.groupField = '';
		this.items = [];
		this.overlayHeight = 0;
		this.panel = {};
		this.preLoadItems = [];
		this.rootNo = 4;
		this.saveSize = 250;
		this.shadow = null;
		this.shadowStub = null;
		this.start = 0;
		this.toSave = [];
		this.zooming = false;

		this.bor = {
			bot: 6,
			cov: 16,
			pad: 10,
			side: 2
		};

		this.box = {
			h: 100,
			w: 100
		};

		this.cache = {};

		this.cachesize = {
			min: 20
		};

		this.stub = {
			noImg: null,
			root: null,
			rootFrame: null // Regorxxx <- Fix img frame for root images (hover effect) ->
		};

		// Regorxxx <- New overlay styles
		/** @type {{idx: number, type: string, itemKey: '', isCount: boolean, tf: FbTitleFormat}[]} */
		this.overlays = [
			{ idx: 0, type: 'none', itemKey: '', isCount: false, tf: null },
			{ idx: 1, type: 'tracks', itemKey: 'count', isCount: true, tf: null },
			{ idx: 2, type: 'tracks (#)', itemKey: 'count', isCount: true, tf: null },
			{ idx: 3, type: 'items', itemKey: 'count', isCount: true, tf: null },
			{ idx: 4, type: 'items (#)', itemKey: 'count', isCount: true, tf: null },
			{ idx: 5, type: 'decade', itemKey: 'year', isCount: false, tf: new FbTitleFormat('$if2([$div($year(%DATE%),10)0s],   -   )') },
			{ idx: 6, type: 'year', itemKey: 'year', isCount: false, tf: new FbTitleFormat('$if3([' + globTags.date + '],[$year(%DATE%)],   -   )') }, // Regorxxx <- Date fallback ->
			{ idx: 7, type: 'month', itemKey: 'year', isCount: false, tf: new FbTitleFormat('$if2([$month(%DATE%)],   -   )') },
			{ idx: 8, type: 'last played (full)', itemKey: 'year', isCount: false, tf: new FbTitleFormat('$if2([' + globTags.lastPlayed + '],   -   )') },
			{ idx: 9, type: 'last played (date)', itemKey: 'year', isCount: false, tf: new FbTitleFormat('$if2([$date(' + globTags.lastPlayed + ')],   -   )') },
			{ idx: 10, type: 'last played (hour)', itemKey: 'year', isCount: false, tf: new FbTitleFormat('$if2([$time(' + globTags.lastPlayed + ')],   -   )') },
			{ idx: 10, type: 'playing', itemKey: 'year', isCount: false, tf: null }
		];
		// Regorxxx ->

		// Regorxxx <- Code cleanup | New img styles
		/** @type {{idx: number, type: string, mask: string | void, border: string, shadow: string, collageLine: boolean, centerLabel: boolean, centerTrackCount: boolean, overlayOffsetV: number, overlayOffsetH: number, fillBg: boolean, collageCondense: number}[]} */
		this.styles = [
			{ idx: 0, type: 'default', mask: void (0), border: 'default', shadow: 'default', collageLine: true, centerLabel: true, centerTrackCount: false, overlayOffsetV: 0, overlayOffsetH: 0, fillBg: false, collageCondense: 1 },
			{ idx: 1, type: 'crop', mask: void (0), border: 'crop', shadow: 'crop', collageLine: true, centerLabel: false, centerTrackCount: false, overlayOffsetV: 0, overlayOffsetH: 0, fillBg: false, collageCondense: 1 },
			{ idx: 2, type: 'circular', mask: 'circular', border: 'circular', shadow: 'circular', collageLine: false, centerLabel: true, centerTrackCount: true, overlayOffsetV: 0, overlayOffsetH: 0, fillBg: true, collageCondense: 0.8 },
			{ idx: 3, type: 'starfill', mask: 'starFill', border: 'star', shadow: 'star', collageLine: false, centerLabel: true, centerTrackCount: true, overlayOffsetV: 0.065, overlayOffsetH: 0, fillBg: true, collageCondense: 0.9 },
			{ idx: 4, type: 'stareffect', mask: 'starEffect', border: 'star', shadow: 'star', collageLine: false, centerLabel: true, centerTrackCount: true, overlayOffsetV: 0.1, overlayOffsetH: 0.05, fillBg: true, collageCondense: 0.8 },
			{ idx: 5, type: 'staroutline', mask: 'starOutline', border: 'star', shadow: 'star', collageLine: false, centerLabel: true, centerTrackCount: true, overlayOffsetV: 0.1, overlayOffsetH: 0.05, fillBg: true, collageCondense: 1 },
			{ idx: 6, type: 'heart', mask: 'heart', border: 'heart', shadow: 'heart', collageLine: false, centerLabel: true, centerTrackCount: true, overlayOffsetV: 0.05, overlayOffsetH: 0, fillBg: true, collageCondense: 0.8 }
		];
		// Regorxxx ->

		// Regorxxx <- Code cleanup | External integration | Custom TF art | Effect per art type | Image border setting
		/** @type {{idx: number, type: string, name?: string | (folderView: boolean) => string, cacheName: string | (folderView: boolean) => string, lines: number, style: string, reflection: string, reflectionStyle: string, reflectionRoot: string, border: string, shadow: string, mute: string, bloom: string, blur: string, vignette: string, grayScale: string, hoverZoom: string, tf?: string | (folderView: boolean) => string, trim: boolean, showMenu: string, switchIdx: number[]}[]} */
		this.art = [
			{ idx: 0, type: 'Front', cacheName: 'front', lines: 2, style: 'imgStyleFront', reflection: 'imgFrontRefl', reflectionStyle: 'imgFrontReflStyle', reflectionRoot: 'imgFrontReflRoot', border: 'imgFrontBorder', shadow: 'imgFrontShadow', mute: 'imgFrontMute', edgeGlow: 'imgFrontEdgeGlow', bloom: 'imgFrontBloom', blur: 'imgFrontBlur', vignette: 'imgFrontVignette', grayScale: 'imgFrontGrayScale', hoverZoom: 'imgFrontHoverZoom', trim: false, showMenu: 'Show albums', switchIdx: [4, 5] },
			{ idx: 1, type: 'Back', cacheName: 'back', lines: 2, style: 'imgStyleBack', reflection: 'imgBackRefl', reflectionStyle: 'imgBackReflStyle', reflectionRoot: 'imgBackReflRoot', border: 'imgBackBorder', shadow: 'imgBackShadow', mute: 'imgBackMute', edgeGlow: 'imgBackEdgeGlow', bloom: 'imgBackBloom', blur: 'imgBackBlur', vignette: 'imgBackVignette', grayScale: 'imgBackGrayScale', hoverZoom: 'imgBackHoverZoom', trim: true, showMenu: 'Show albums', switchIdx: [4, 5] },
			{ idx: 2, type: 'Disc', cacheName: 'disc', lines: 2, style: 'imgStyleDisc', reflection: 'imgDiscRefl', reflectionStyle: 'imgDiscReflStyle', reflectionRoot: 'imgDiscReflRoot', border: 'imgDiscBorder', shadow: 'imgDiscShadow', mute: 'imgDiscMute', edgeGlow: 'imgDiscEdgeGlow', bloom: 'imgDiscBloom', blur: 'imgDiscBlur', vignette: 'imgDiscVignette', grayScale: 'imgDiscGrayScale', hoverZoom: 'imgDiscHoverZoom', trim: true, showMenu: 'Show albums', switchIdx: [4, 5] },
			{ idx: 3, type: 'Icon', cacheName: 'icon', lines: 1, style: 'imgStyleIcon', reflection: 'imgIconRefl', reflectionStyle: 'imgIconReflStyle', reflectionRoot: 'imgIconReflRoot', border: 'imgIconBorder', shadow: 'Shadow', mute: 'imgIconMute', edgeGlow: 'imgIconEdgeGlow', bloom: 'imgIconBloom', blur: 'imgIconBlur', vignette: 'imgIconVignette', grayScale: 'imgIconGrayScale', hoverZoom: 'imgIconHoverZoom', trim: true, showMenu: 'Show albums', switchIdx: [4, 5] },
			{ idx: 4, type: 'Artist', cacheName: 'artist', lines: 1, style: 'imgStyleArtist', reflection: 'imgArtistRefl', reflectionStyle: 'imgArtistReflStyle', reflectionRoot: 'imgArtistReflRoot', border: 'imgArtistBorder', shadow: 'imgArtistShadow', mute: 'imgArtistMute', edgeGlow: 'imgArtistEdgeGlow', bloom: 'imgArtistBloom', blur: 'imgArtistBlur', vignette: 'imgArtistVignette', grayScale: 'imgArtistGrayScale', hoverZoom: 'imgArtistHoverZoom', trim: true, showMenu: 'Show artists', switchIdx: [0, 5] },
			{ idx: 5, type: 'File (by Tf) [1]', name: (folderView) => ppt.albumArtTf1Name.split('|')[folderView ? 1 : 0], cacheName: (folderView) => folderView ? 'foldertf1' : 'viewtf1', lines: 1, style: 'imgStyleTf1', reflection: 'imgTfRefl1', reflectionStyle: 'imgTf1ReflStyle', reflectionRoot: 'imgTf1ReflRoot', border: 'imgTf1Border', shadow: 'imgTf1Shadow', mute: 'imgTf1Mute', edgeGlow: 'imgTf1EdgeGlow', bloom: 'imgTf1Bloom', blur: 'imgTf1Blur', vignette: 'imgTf1Vignette', grayScale: 'imgTf1GrayScale', hoverZoom: 'imgTf1HoverZoom', tf: (folderView) => folderView ? 'albumArtTf1Folder' : 'albumArtTf1View', trim: true, showMenu: 'Show art (Tf)', switchIdx: [0, 4] },
			{ idx: 6, type: 'File (by Tf) [2]', name: (folderView) => ppt.albumArtTf2Name.split('|')[folderView ? 1 : 0], cacheName: (folderView) => folderView ? 'foldertf2' : 'viewtf2', lines: 1, style: 'imgStyleTf2', reflection: 'imgTfRefl1', reflectionStyle: 'imgTf2ReflStyle', reflectionRoot: 'imgTf2ReflRoot', border: 'imgTf2Border', shadow: 'imgTf2Shadow', mute: 'imgTf2Mute', edgeGlow: 'imgTf2EdgeGlow', bloom: 'imgTf2Bloom', blur: 'imgTf2Blur', vignette: 'imgTf2Vignette', grayScale: 'imgTf2GrayScale', hoverZoom: 'imgTf2HoverZoom', tf: (folderView) => folderView ? 'albumArtTf2Folder' : 'albumArtTf2View', trim: true, showMenu: 'Show art (Tf)', switchIdx: [0, 4] }
		];

		this.useD2D = window.DrawMode === 1 && typeof Effects !== 'undefined';
		// Regorxxx ->

		// Regorxxx <- Code cleanup
		this.style = {
			image: 0,
			rootComposite: ppt.rootNode && ppt.curRootImg === 3,
			vertical: !ppt.albumArtFlowMode,
			y: 25,
			dropShadow: false,
			dropShadowStub: false,
			dropGrad: false,
			dropGradStub: false,
		};
		// Regorxxx ->

		this.im = {
			offset: 0,
			y: 0,
			w: 120
		};

		this.interval = {
			cache: 1,
			preLoad: 7
		};

		this.labels = { statistics: ppt.itemShowStatistics ? 1 : 0 };

		this.letter = {
			albumArtYearAuto: ppt.albumArtYearAuto,
			no: 1,
			show: ppt.albumArtLetter,
			w: 0
		};

		this.mask = {
			fade: null,
			circular: null,
			starFill: null,
			starEffect: null,
			starOutline: null,
			heart: null,
			flareEffect: null
		};

		this.row = {
			h: 80
		};

		this.text = {
			x: 0,
			y1: 0,
			y2: 0,
			h: 20,
			w: 20
		};

		this.timer = {
			load: null,
			preLoad: null,
			save: null
		};

		this.drawDebounce = $.debounce(() => {
			panel.treePaint();
		}, 500);

		this.loadThrottle = $.throttle(() => {
			if (!panel.imgView) return;
			this.getImages();
		}, 40);

		this.rootDebounce = $.debounce(() => {
			this.checkRootImg();
		}, 250, {
			'leading': true,
			'trailing': true
		});

		this.sizeDebounce = $.debounce(() => {
			if (!panel.imgView) return;
			this.clearCache();
			this.metrics();
			if (sbar.scroll > sbar.max_scroll) sbar.checkScroll(sbar.max_scroll);
		}, 100);

		this.setRoot();
		this.setNoArtist();
		this.setNoCover();
	}

	// Methods


	// Regorxxx <- New overlay styles
	getOverlaySchema() {
		return this.overlays.map((s) => {
			return { ...s };
		});
	}

	getOverlay(idx) {
		return { ...this.overlays[idx] };
	}

	getOverlayByType(type) {
		return { ...(this.overlays.find((s) => s.type.toLowerCase() === type.toLowerCase()) || this.getOverlay(0)) };
	}

	getOverlayIdxByType(type) {
		return this.overlays.findIndex((s) => s.type.toLowerCase() === type.toLowerCase()) || 0;
	}

	getOverlayType(idx) {
		return this.getOverlay(idx).type;
	}
	// Regorxxx ->

	// Regorxxx <- Code cleanup | New img styles | Effect per art type | Image border setting
	getStyleSchema() {
		return this.styles.map((s) => {
			return { ...s };
		});
	}

	getStyle(idx, bStub) {
		if (bStub && idx < 2) { idx = 0; }
		return { ...this.styles[idx] };
	}

	getStyleByType(type) {
		return { ...(this.styles.find((s) => s.type.toLowerCase() === type.toLowerCase()) || this.getStyle(0)) };
	}

	getStyleType(idx, bStub) {
		return this.getStyle(idx, bStub).type;
	}
	// Regorxxx ->

	// Regorxxx <- Code cleanup | External integration | Custom TF art | Effect per art type
	formatArt(a, folderView) {
		/** @type {{idx: number, type: string, name:string, cacheName: string, lines: number, style: number, reflection: boolean, reflectionStyle: number, reflectionRoot: boolean, border: boolean, shadow: boolean, mute: boolean, bloom: boolean, blur: boolean, vignette: boolean, grayScale: boolean, hoverZoom: boolean, tf: string, trim: boolean, showMenu: string, switchIdx: number[]}} */
		const copy = { ...a };
		if (typeof copy.cacheName === 'function') { copy.cacheName = copy.cacheName(folderView); }
		if (typeof copy.tf === 'function') { copy.tf = ppt[copy.tf(folderView)]; }
		if (typeof copy.name === 'function') { copy.name = copy.name(folderView); }
		if (!Object.hasOwn(copy, 'name') || !copy.name) { copy.name = copy.type; }
		['switchIdx'].forEach((k) => copy[k] = [...copy[k]]);
		['style', 'reflection', 'reflectionStyle', 'reflectionRoot', 'border', 'shadow', 'mute', 'edgeGlow', 'bloom', 'blur', 'vignette', 'grayScale', 'hoverZoom'].forEach((k) => copy[k] = ppt[copy[k]]);
		return copy;
	}

	disableArtEffects(a) {
		['reflection', 'border', 'shadow', 'mute', 'bloom', 'blur', 'vignette', 'grayScale'].forEach((k) => a[k] = false);
		return a;
	}

	getArtSchema(folderView) {
		return this.art.map((a) => this.formatArt(a, folderView));
	}

	getArt(idx, folderView) {
		return this.formatArt(this.art[idx], folderView);
	}

	getArtStyle(idx) {
		return this.getArt(idx).style;
	}

	getArtTypes() {
		return this.getArtSchema().map((a) => a.type);
	}

	getArtNames() {
		return this.getArtSchema().map((a) => a.name);
	}

	getArtShowTypes() {
		const art = this.getArtSchema();
		return [...new Set(this.getArtSchema().map((a) => a.switchIdx).flat(Infinity))].sort((a, b) => a - b).map((id) => art[id]);
	}

	getArtSwitchTypes(idx) {
		const art = this.getArtSchema();
		const newIdx = art[idx].switchIdx;
		return newIdx.map((id) => art[id]);
	}

	getArtSwitchType(idx) {
		return this.getArtSwitchTypes(idx)[0];
	}

	getArtCachePath(idx, folderView) {
		return this.cachePath + this.getArt(idx, folderView).cacheName;
	}

	async get_album_art_async(handle, art, key, ix) {
		const result = { path: '', image: null, ext: '', key, ix }; // Regorxxx <- Allow images with transparencies ->
		if (Object.hasOwn(art, 'tf')) {
			const tf = panel.processCustomTf(art.tf, pop.tree[ix]);
			const mask = new FbTitleFormat(tf).EvalWithMetadb(handle);
			const files = getFiles(mask, new Set(['.png', '.jpg', '.jpeg', '.gif']));
			if (files[0] && $.file(files[0])) {
				result.path = files[0];
				result.image = await gdi.LoadImageAsyncV2(0, files[0]);
				result.ext = this.getCacheFileExt(files[0]); // Regorxxx <- Allow images with transparencies ->
			}
		} else {
			const artProm = await utils.GetAlbumArtAsyncV2(0, handle, art.idx, false);
			result.path = artProm.path;
			result.image = artProm.image;
			result.ext = this.getCacheFileExt(result.path);
		}
		this.cacheAlbumArt(result);
		return result;
	}

	cacheAlbumArt(result) {
		const o = this.cache[result.key];
		if (o && o.img == 'called') {
			const saveName = md5.hashStr(result.path) + result.ext; // Regorxxx <- Allow images with transparencies ->
			this.cacheIt(result.image, result.key, result.ix, saveName);
		}
	}
	// Regorxxx ->

	// Regorxxx <- Allow images with transparencies | Code cleanup
	getCacheFileFormat(fileName) {
		return ppt.albumArtDiskCacheAlpha && this.isTransparentExt(utils.SplitFilePath(fileName)[2]) ? 'image/png' : 'image/jpeg';
	}

	getCacheFileExt(fileName) {
		return ppt.albumArtDiskCacheAlpha && this.isTransparentExt(utils.SplitFilePath(fileName)[2]) ? '.png' : '.jpg';
	}

	isTransparentExt(ext) {
		return ['.png', '.gif'].includes(ext);
	}

	async load_image_async(key, image_path, ix, rawCache) {
		const result = {
			path: image_path,
			image: Date.now() - this.asyncBypass > 5000 ? await gdi.LoadImageAsyncV2(0, image_path) : gdi.Image(image_path),
			ext: utils.SplitFilePath(image_path)[2],
			key,
			ix
		};
		const o = this.cache[key];
		if (o && o.img == 'called') {
			if (rawCache) { this.cacheItPreLoad(result.image, key, ix); }
			else { this.cacheIt(result.image, key, ix); }
		}
		return result;
	}
	// Regorxxx ->

	cacheIt(image, key, ix, saveName) {
		try {
			if (!image) {
				if (this.style.rootComposite && ix < this.rootNo) this.rootDebounce();
				if (this.albumArtDiskCache && !this.database[key]) {
					this.toSave.unshift({
						key,
						image: null,
						folder: this.cacheFolder,
						saveName: 'noAlbumArt',
						setKeyOnly: true
					});
				}
			}
			if (image) {
				if (this.albumArtDiskCache && saveName) {
					if (!this.database[key] && $.file(this.cacheFolder + saveName)) {
						this.toSave.unshift({
							key,
							image: null,
							folder: this.cacheFolder,
							saveName: saveName,
							setKeyOnly: true
						});
					}
					if (!this.database[key] || !$.file(this.cacheFolder + saveName)) {
						image = this.format(image, { trim: true }, this.getStyleByType('default'), this.saveSize, this.saveSize, false, 'save');
						this.toSave.unshift({
							key,
							image: image.Clone(0, 0, image.Width, image.Height),
							folder: this.cacheFolder,
							saveName: saveName,
							setKeyOnly: false
						});
					}
				}

				this.checkCache();
				this.addToCache( // Regorxxx <- Code cleanup ->
					this.format(image, this.getArt(ppt.artId), this.getStyle(this.style.image), this.im.w, this.im.w, this.labels.fade),
					'display',
					key
				);
				if (this.style.rootComposite && ix < this.rootNo) this.rootDebounce();
			}

			if (!this.timer.save && this.toSave.length) this.timer.save = setInterval(() => {
				const ln = this.toSave.length;
				if (ln) {
					const item = this.toSave[ln - 1];
					if (item.setKeyOnly) {
						this.database[item.key] = item.saveName;
						$.save(item.folder + 'database.dat', JSON.stringify(this.database, null, 3), true);
					} else {
						const saved = item.image.SaveAs(item.folder + item.saveName, this.getCacheFileFormat(item.saveName)); // Regorxxx <- Allow images with transparencies ->
						if (saved) {
							this.database[item.key] = item.saveName;
							$.save(item.folder + 'database.dat', JSON.stringify(this.database, null, 3), true);
						}
					}
					this.toSave.pop();
				}
				if (!this.toSave.length) {
					clearInterval(this.timer.save);
					this.timer.save = null;
				}
			}, 1000);

		} catch (e) { // eslint-disable-line no-unused-vars
			$.trace('unable to load thumbnail image: ' + key);
		}
		this.drawDebounce();
	}

	cacheItPreLoad(image, key, ix) {
		try {
			if (image) {
				this.checkCache();
				this.addToCache( // Regorxxx <- Code cleanup ->
					this.format(image, this.getArt(ppt.artId), this.getStyle(this.style.image), this.im.w, this.im.w, this.labels.fade),
					'displayPreload',
					key
				);
			}
			if (this.style.rootComposite && ix < this.rootNo) this.rootDebounce();
		} catch (e) { // eslint-disable-line no-unused-vars
			$.trace('unable to load thumbnail image: ' + key);
		}
		panel.treePaint();
	}

	checkCache() {
		if (!this.memoryLimit()) return;
		const ln = this.columns * panel.rows * 3;
		if (this.toSave.length > ln) this.toSave.length = ln;
		this.preLoadItems = [];
		clearInterval(this.timer.preLoad);
		this.timer.preLoad = null;
		this.items = [];
		clearInterval(this.timer.load);
		this.timer.load = null;
		let keys = Object.keys(this.cache);
		const cacheLength = keys.length;
		if (pop.tree.length) {
			const o = this.cache[pop.tree[0].key];
			if (o) o.accessed = Infinity;
		}
		this.cache = this.sortCache(this.cache, 'accessed');
		keys = Object.keys(this.cache);
		const numToRemove = Math.round((cacheLength - this.cachesize.min) / 2);
		if (numToRemove > 0)
			for (let i = 0; i < numToRemove; i++) this.trimCache(keys[i]);
	}

	checkNowPlaying(item) {
		if (!ppt.highLightNowplaying) return false;
		return !item.root && pop.inRange(pop.nowp, item.item);
	}

	checkRootImg() {
		const key = pop.tree.length ? pop.tree[0].key : null;
		if (!key) return;
		let o = this.cache[key];
		const imgsAvailable = Math.min(Math.round((this.panel.h + this.row.h) / this.row.h) * this.columns, pop.tree.length) - 1;
		let n = Math.max(Math.min(Math.floor(Math.sqrt(imgsAvailable)), Infinity), 2); // auto set collage size: limited by no imgs available (per screen): reduce by changing infinity
		const cells = Math.pow(n, 2);
		this.rootNo = n * n + 1;
		if (!o) this.cache[key] = {
			img: 'called',
			accessed: ++this.accessed
		};
		o = this.cache[key];
		o.img = $.gr(this.cellWidth * n, this.cellWidth * n, true, g => this.createCollage(g, this.cellWidth, this.cellWidth, n, n, cells));
		this.applyStyleMask(o.img, this.getStyle(this.style.image)); // Regorxxx <- Code cleanup |New img styles ->
		// Regorxxx <- Cut img to avoid artifacts at borders | Use HQ Bicubic interpolation
		const w = Math.round(this.im.w);
		if (o.img.Width !== w || o.img.Height !== w) {
			const cut = $.clamp(Number(ppt.albumArtCutResize), 0, w - 1);
			if (cut > 0) {
				o.img = o.img.Resize(w + cut * 2, w + cut * 2, InterpolationMode.HighQualityBicubic);
				o.img = o.img.Clone(cut, cut, w, w);
			} else {
				o.img = o.img.Resize(w, w, InterpolationMode.HighQualityBicubic);
			}
		}
		// Regorxxx ->
		if (this.labels.fade) this.fadeMask(o.img, o.img.Width, o.img.Height);
		panel.treePaint();
	}

	checkTooltip(gr, item, coords, tt, font) {
		if (panel.colMarker) {
			if (tt.tt1) tt.tt1 = tt.tt1.replace(/@!#.*?@!#/g, '');
			if (tt.tt2) tt.tt2 = tt.tt2.replace(/@!#.*?@!#/g, '');
		}
		let text = tt.tt1 || '';
		if (tt.tt2 && (panel.lines == 2 || panel.lines == 1 && this.labels.statistics)) { text += '\n' + tt.tt2; }
		if (tt.tt3 && this.labels.statistics) { text += '\n' + tt.tt3; }
		item.tt = {
			text: text,
			x: coords.x,
			y1: coords.y1,
			y2: coords.y2,
			y3: coords.y3,
			w: coords.w,
			1: tt.tt1 ? gr.CalcTextWidth(tt.tt1, font.font1) > coords.w ? tt.tt1 : false : false,
			2: tt.tt2 ? gr.CalcTextWidth(tt.tt2, font.font2) > coords.w ? tt.tt2 : false : false,
			3: tt.tt3 ? gr.CalcTextWidth(tt.tt3, font.font3) > coords.w ? tt.tt3 : false : false
		};
	}

	clearCache() {
		this.accessed = 0;
		this.cache = {};
		this.cachesize = {
			min: 20
		};
		this.items = [];
	}

	// Regorxxx <- Code cleanup | New img styles | Branch collage art
	createCollage(g, cellWidth, cellHeight, rows, columns, cells, imgs) {
		let x = 0;
		let y = 0;
		const style = this.getStyle(this.style.image);
		const condense = Math.max(style.collageCondense, 0.1);
		for (let row = 0; row < rows; row++) {
			for (let column = 0; column < columns; column++) {
				const idx = column + row * columns + (imgs ? 0 : 1);
				if (idx <= cells) {
					let img = imgs
						? imgs[idx]
						: pop.tree.length && pop.tree[idx] ? this.getImg(pop.tree[idx].key) : null;
					if (!img) { img = this.stub.noImg; }
					if (img) {
						let cx = 0;
						let cy = 0;
						let cw = img.Width;
						let ch = img.Height;
						if (this.labels.fade) {
							if (condense === 1) {
								ch -= this.overlayHeight;
							} else {
								if (condense !== Infinity) {
									cx = cw * (1 - condense) / 2;
									cy = ch * (1 - condense) / 2;
									cw *= condense;
									ch = (ch - this.overlayHeight) * condense;
								}
							}
						} else if (condense !== 1) {
							if (condense !== Infinity) {
								cx = cw * (1 - condense) / 2;
								cy = ch * (1 - condense) / 2;
								cw *= condense;
								ch *= condense;
							}
						}
						cx = Math.round(cx);
						cy = Math.round(cy);
						cw = Math.round(cw);
						ch = Math.round(ch);
						img = img.Clone(cx, cy, cw, ch);
						img = this.format(img, this.disableArtEffects(this.getArt(ppt.artId)), this.getStyleByType('crop'), this.cellWidth, this.cellWidth, false, 'root');
						g.DrawImage(img, x, y, img.Width, img.Height, 0, 0, img.Width, img.Height);
					}
					x += cellWidth;
				}
			}
			x = 0;
			y += cellHeight;
		}
		x = 0; y = 0; // NOSONAR
		for (let column = 0; column < columns; column++) {
			x += cellWidth;
			if (style.collageLine) { g.DrawLine(x, 0, x, cellWidth * columns, ui.l.w, ui.col.rootBlend); }
		}
		x = 0; y = 0; // NOSONAR
		for (let row = 0; row < rows; row++) {
			y += cellHeight;
			if (style.collageLine) { g.DrawLine(x, y, cellWidth * columns, y, ui.l.w, ui.col.rootBlend); }

		}
		if (style.collageLine) { g.DrawRect(0, 0, cellWidth * columns - 1, cellWidth * columns - 1, 1, ui.col.rootBlend); }
	}

	createCollageFromImgs(g, cellWidth, cellHeight, rows, imgs) {
		this.createCollage(g, cellWidth, cellHeight, rows, rows, imgs.length, imgs);
	}

	getHeartPoints(w, h, x = 0, y = 0) {
		return getHeartPoints(w + w / 16 * (1 + 1 / 2), 60, x - w / 16 * (1 + 1 / 2) / 2 - 0.5, y - h / 16 * (1 + 1 + 1 / 2) / 2);
	}

	createMasks() {
		const wh = 500;
		this.mask.circular = $.gr(wh, wh, true, g => {
			g.FillSolidRect(0, 0, wh, wh, $.RGB(255, 255, 255));
			g.SetSmoothingMode(SmoothingMode.HighQuality);
			g.FillEllipse(0.5, 0.5, wh - 1.75, wh - 1.75, $.RGB(0, 0, 0)); // Regorxxx <- Improve img mask to avoid rough edges ->
			g.SetSmoothingMode();
		});
		this.mask.fade = $.gr(wh, wh, true, g => {
			g.FillSolidRect(0, 0, wh, wh, $.RGB(175, 175, 175));
		});
		this.mask.starFill = $.gr(wh, wh, true, g => {
			g.FillSolidRect(0, 0, wh, wh, $.RGB(255, 255, 255));
			g.SetSmoothingMode(SmoothingMode.AntiAlias);
			g.FillPolygon($.RGBA(0, 0, 0, 255), 0, getStarPoints(wh * 2, 6, 1.5, -wh / 2, -wh / 2));
			g.SetSmoothingMode();
		});
		this.mask.starOutline = $.gr(wh, wh, true, g => {
			g.FillSolidRect(0, 0, wh, wh, $.RGB(255, 255, 255));
			g.SetSmoothingMode(SmoothingMode.AntiAlias);
			const bw = wh / 5;
			g.FillPolygon($.RGBA(0, 0, 0, 25), 0, getStarPoints((wh - bw * 2) * 2, 6, 1.5, -(wh - bw * 4) / 2, -(wh - bw * 4) / 2));
			g.DrawPolygon($.RGBA(0, 0, 0, 255), bw, getStarPoints((wh - bw * 2) * 2, 6, 1.5, -(wh - bw * 4) / 2, -(wh - bw * 4) / 2));
			g.SetSmoothingMode();
		});
		this.mask.starEffect = $.gr(wh, wh, true, g => {
			g.FillSolidRect(0, 0, wh, wh, $.RGB(255, 255, 255));
			g.SetSmoothingMode(SmoothingMode.AntiAlias);
			const bw = wh / 5;
			g.DrawPolygon($.RGBA(0, 0, 0, 125), bw, getStarPoints((wh - bw * 2) * 2, 6, 1.5, -(wh - bw * 4) / 2, -(wh - bw * 4) / 2));
			g.FillPolygon($.RGBA(0, 0, 0, 225), 0, getStarPoints((wh - bw * 2) * 2, 6, 1.5, -(wh - bw * 4) / 2, -(wh - bw * 4) / 2));
			g.SetSmoothingMode();
		});
		this.mask.heart = $.gr(wh, wh, true, g => {
			g.FillSolidRect(0, 0, wh, wh, $.RGB(255, 255, 255));
			g.SetSmoothingMode(SmoothingMode.AntiAlias);
			g.FillPolygon($.RGBA(0, 0, 0, 255), 0, this.getHeartPoints(wh, wh, 0, -wh / 20));
			g.SetSmoothingMode();
		});
		this.mask.flareEffect = $.gr(wh, wh, true, g => {
			g.SetSmoothingMode(SmoothingMode.AntiAlias);
			g.FillPolygon($.RGB(255, 255, 255), 0, getStarPoints(wh, 50, 25));
			g.SetSmoothingMode();
		});
		this.mask.flareEffect.StackBlur(5);
	}

	// Regorxxx <- Fix img frame for root images (hover effect)
	createImages() {
		if (this.stub.root && !ppt.frameImageRoot) {
			this.stub.rootFrame = $.gr(this.stub.root.Width, this.stub.root.Height, true, g => {
				g.FillSolidRect(0, 0, this.stub.root.Width, this.stub.root.Height, ui.col.frameImg);
			});
			const mask = $.gr(this.stub.root.Width, this.stub.root.Height, true, g => {
				g.FillSolidRect(0, 0, this.stub.root.Width, this.stub.root.Height, $.RGB(255, 255, 255));
				g.DrawImage(this.stub.root, 0, 0, this.stub.root.Width, this.stub.root.Height, 0, 0, this.stub.root.Width, this.stub.root.Height);
			});
			this.stub.rootFrame.ApplyMask(mask);
		} else {
			this.stub.rootFrame = null;
		}
	}
	// Regorxxx ->

	draw(gr) {
		if (!panel.imgView) return;
		let box_x, box_y;
		let coords = {};
		this.getItemsToDraw();
		this.column = 0;
		const style = this.getStyle(this.style.image);
		const art = this.getArt(ppt.artId);
		const stack = [[], [], []];
		const overlay = this.getOverlay(ppt.itemOverlayType); // Regorxxx <- New overlay styles ->
		for (let i = this.start; i < this.end; i++) {
			const bHover = i === pop.m.i;
			const item = pop.tree[i];
			if (overlay.type === 'playing') { item[overlay.itemKey] = pop.inRange(pop.nowp, item.item) ? String.fromCodePoint(9654) : ''; } // Regorxxx <- New overlay styles ->
			const bSel = item.sel;
			stack[bHover ? 2 : bSel ? 1 : 0].push({
				i,
				column: this.column,
				item,
				selIdx: bSel ? pop.lastSelMul.indexOf(i) : -1,
				bHover,
				bSel,
				bNowPlaying: this.checkNowPlaying(item)
			});
			if (this.column == this.columns - 1) { this.column = 0; }
			else { this.column++; }
		}
		stack[1].sort((a, b) => b.selIdx - a.selIdx);
		const stat = this.labels.statistics ? pop.statistics[pop.statisticsShow] : null; // Regorxxx <- New statistics | Code cleanup | Improve statistics tooltip ->
		stack.flat().forEach((cell) => {
			const row = this.style.vertical ? Math.floor(cell.i / this.columns) : 0;
			box_x = this.style.vertical ? Math.floor(this.panel.x + cell.column * this.columnWidth + this.bor.side) : Math.floor(this.panel.x + cell.i * this.columnWidth + this.bor.side - sbar.delta);
			box_y = this.style.vertical ? Math.floor(this.panel.y + row * this.row.h - sbar.delta) : this.style.y;
			if (box_y >= 0 - this.row.h && box_y < this.panel.y + this.panel.h) {
				const item = cell.item;
				pop.getItemCount(item);
				const grp = item.grp;
				const lot = item.lot;
				// Regorxxx <- Improve statistics tooltip
				const statistics = this.labels.statistics
					? (!item.root && this.labels.counts ? item.count + (item.count && item._statistics ? ' | ' : '') : '') + item._statistics
					: '';
				const statisticsTt = this.labels.statistics
					? stat.ttFunc
						? (!item.root && this.labels.counts ? item.count + (item.count && item._statistics ? ' | ' : '') : '') + stat.ttFunc(stat.nameTree + ': ' + (typeof item.stats.valueFormat === 'undefined' ? '' : item.stats.valueFormat.toString()))
						: statistics
					: '';
				// Regorxxx ->
				const cur_img = this.zooming ? null : this.getImg(item.key);
				const grpCol = this.getGrpCol(item, cell.bNowPlaying, pop.highlight.text && cell.bHover);
				const lotCol = this.getLotCol(item, cell.bNowPlaying, pop.highlight.text && cell.bHover);
				this.drawSelBg(gr, art, style, cur_img, box_x, box_y, cell); // Regorxxx <- Zoom hover effect ->
				this.im.y = this.im.offset + box_y;
				if (pop.rowStripes && this.labels.right) {
					if (cell.i % 2 == 0) gr.FillSolidRect(0, box_y + 1, panel.tree.stripe.w, this.row.h, ui.col.bg1);
					else gr.FillSolidRect(0, box_y, panel.tree.stripe.w, this.row.h, ui.col.bg2);
				}
				let x2 = Math.round(box_x + (this.bor.cov) / 2);
				let y1 = 0;
				let y2 = this.im.y + 2 + this.im.w - this.overlayHeight;
				if (art.reflection && art.reflectionStyle === 0) { x2 = Math.floor(x2 - this.bor.pad / 4); }
				if (cur_img) {
					const offsetY = ppt.thumbNailVCenter ? (this.im.w - cur_img.Height) / 2 : 0; // Regorxxx <- Thumbnail Vertically centered ->
					coords = {
						x: box_x + Math.round((this.box.w - cur_img.Width) / 2),
						y: this.im.y + 2 + this.im.w - cur_img.Height - offsetY,
						w: cur_img.Width,
						h: cur_img.Height
					};
					const bPaintBorder = art.border && (!cell.bSel || !this.labels.overlay || !style.fillBg);
					this.drawArt(gr, art, style, cur_img, coords, { border: bPaintBorder, shadow: true, reflection: item.root ? art.reflectionRoot : art.reflection, hover: art.hoverZoom && (cell.bHover || cell.bSel) }); // Regorxxx <- Zoom hover effect ->
					if (this.labels.overlayDark) { this.drawItemOverlayDark(gr, art, item, { x: x2, y: y2, w: coords.w, h: this.overlayHeight }, cell); }
				} else {
					coords = {
						x: box_x + Math.round((this.box.w - this.im.w) / 2),
						y: this.im.y + 2,
						w: this.im.w,
						h: this.im.w
					};
					if (!item.root) {
						if (this.stub.noImg) { this.drawArt(gr, art, style, this.stub.noImg, coords, { shadow: true, reflection: art.reflection, hover: art.hoverZoom && (cell.bHover || cell.bSel) }); } // Regorxxx <- Zoom hover effect ->
					} else if (!this.style.rootComposite && this.stub.root) {
						this.drawArt(gr, art, style, this.stub.root, coords, { reflection: art.reflectionRoot, hover: art.hoverZoom && (cell.bHover || cell.bSel) }); // Regorxxx <- Zoom hover effect ->
					}
					if (this.labels.overlay) {
						gr.FillGradRect(coords.x, y2 - 1, coords.w / 2, ui.l.w, 1, $.RGBA(0, 0, 0, 0), ui.col.imgBor);
						gr.FillGradRect(coords.x + coords.w / 2, y2 - 1, coords.w / 2, ui.l.w, 1, ui.col.imgBor, $.RGBA(0, 0, 0, 0));
					}
					if (this.labels.overlayDark) { this.drawItemOverlayDark(gr, art, item, { x: x2, y: y2, w: coords.w, h: this.overlayHeight }, cell); }
				}
				if (art.reflection && art.reflectionStyle === 0) { coords.x -= Math.round(this.bor.pad / 4); }
				this.drawItemOverlay(gr, art, style, item, { ...coords, box_x, box_y }); // Regorxxx <- Item overlay horizontal alignment ->
				if (cell.bHover) {
					if (pop.highlight.row == 3 || pop.highlight.row == 2 && (((this.labels.overlay || this.labels.hide) && !style.fillBg))) {
						if (ppt.frameImage) { this.drawImageFrame(gr, art, style, item, coords, ui.col.frameImg, cell); } // Regorxxx <- Zoom hover effect ->
						else { this.drawFrame(gr, art, box_x, box_y, ui.col.frameImg, !this.labels.overlay && !this.labels.hide ? 'stnd' : 'thick', cell); } // Regorxxx <- Zoom hover effect ->
					} else if (pop.highlight.row == 1 && !sbar.draw_timer) gr.FillSolidRect(ui.l.w, coords.y, ui.sz.sideMarker, this.im.w, ui.col.sideMarker);
					if (ppt.flareImage) { this.drawImageEffect(gr, 'flare', coords); } // Regorxxx <- Flare hover effect ->
				}
				if (cell.bSel) {
					if (this.labels.overlay && !style.fillBg) { this.drawFrame(gr, art, box_x, box_y, ui.col.frameImgSel, 'thick', cell); } // Regorxxx <- Zoom hover effect ->
					else if (this.labels.hide && pop.highlight.row == 3 && ppt.frameImage) { this.drawImageFrame(gr, art, style, item, coords, ui.col.frameImgSel, cell); } // Regorxxx <- Zoom hover effect ->
					if (ppt.flareImage) { this.drawImageEffect(gr, 'flare', coords); } // Regorxxx <- Flare hover effect ->
				}
				if (!this.labels.hide) {
					const x = box_x + this.text.x;
					let type = 0;
					if (panel.colMarker) { type = cell.bSel ? 2 : pop.highlight.text && cell.bHover ? 1 : 0; }
					if (this.labels.overlay) {
						y1 = this.im.y + this.text.y1;
						y2 = y1 + this.text.h * (this.labels.statistics ? 0.93 : 0.9);
						// Regorxxx <- Zoom hover effect
						if (art.hoverZoom && (cell.bHover || cell.bSel)) {
							const zoomX = this.getZoomEffectIntensity();
							y1 += zoomX / 2;
							y2 += zoomX / 2;
						}
						// Regorxxx ->
						const y3 = y2 + this.text.h * 0.95;
						if (panel.lines == 2) {
							this.checkTooltip(gr, item, { x, y1, y2, y3, w: this.text.w }, { tt1: grp, tt2: lot, tt3: statisticsTt }, { font1: ui.font.group, font2: ui.font.lot, font3: ui.font.statistics }); // Regorxxx <- Improve statistics tooltip ->
							if (panel.colMarker) {
								pop.cusCol(gr, grp, item, x, y1, this.text.w, this.text.h, type, cell.bNowPlaying, ui.font.group, ui.font.groupEllipsisSpace, 'lott');
								pop.cusCol(gr, lot, item, x, y2, this.text.w, this.text.h, type, cell.bNowPlaying, ui.font.lot, ui.font.lotEllipsisSpace, 'group');
							}
							else {
								gr.GdiDrawText(grp, ui.font.group, grpCol, x, y1, this.text.w, this.text.h, style.centerLabel && !item.tt[1] ? panel.cc : panel.lc);
								gr.GdiDrawText(lot, ui.font.lot, lotCol, x, y2, this.text.w, this.text.h, style.centerLabel && !item.tt[2] ? panel.cc : panel.lc);
							}
							if (statistics) { gr.GdiDrawText(statistics, ui.font.statistics, lotCol, x, y3, this.text.w, this.text.h, style.centerLabel && !item.tt[3] ? panel.cc : panel.lc); }
						} else {
							this.checkTooltip(gr, item, { x, y1, y2: statistics ? y2 : -1, y3: -1, w: this.text.w }, { tt1: grp, tt2: statisticsTt }, { font1: ui.font.group, font2: ui.font.statistics }); // Regorxxx <- Improve statistics tooltip ->
							if (panel.colMarker) {
								pop.cusCol(gr, grp, item, x, y1, this.text.w, this.text.h, type, cell.bNowPlaying, ui.font.group, ui.font.groupEllipsisSpace, 'group');
							} else {
								gr.GdiDrawText(grp, ui.font.group, grpCol, x, y1, this.text.w, this.text.h, style.centerLabel && !item.tt[1] ? panel.cc : panel.lc);
							}
							if (statistics) gr.GdiDrawText(statistics, ui.font.statistics, lotCol, x, y2, this.text.w, this.text.h, style.centerLabel && !item.tt[2] ? panel.cc : panel.lc);
						}
					} else {
						y1 = this.im.y + this.text.y1;
						y2 = this.im.y + this.text.y2;
						const y3 = this.im.y + this.text.y3;
						if (panel.lines == 2) {
							this.checkTooltip(gr, item, { x, y1, y2, y3, w: this.text.w }, { tt1: grp, tt2: lot, tt3: statisticsTt }, { font1: ui.font.group, font2: ui.font.lot, font3: ui.font.statistics }); // Regorxxx <- Improve statistics tooltip ->
							if (panel.colMarker) {
								pop.cusCol(gr, grp, item, x, y1, this.text.w, this.text.h, type, cell.bNowPlaying, ui.font.group, ui.font.groupEllipsisSpace, 'group');
								pop.cusCol(gr, lot, item, x, y2, this.text.w, this.text.h, type, cell.bNowPlaying, ui.font.lot, ui.font.lotEllipsisSpace, 'lott');
							} else {
								gr.GdiDrawText(grp, ui.font.group, grpCol, x, y1, this.text.w, this.text.h, style.centerLabel && !this.labels.right && !item.tt[1] ? panel.cc : panel.lc);
								gr.GdiDrawText(lot, ui.font.lot, lotCol, x, y2, this.text.w, this.text.h, style.centerLabel && !this.labels.right && !item.tt[2] ? panel.cc : panel.lc);
							}
							if (statistics) { gr.GdiDrawText(statistics, ui.font.statistics, lotCol, x, y3, this.text.w, this.text.h, style.centerLabel && !this.labels.right && !item.tt[2] ? panel.cc : panel.lc); }
						} else {
							this.checkTooltip(gr, item, { x, y1, y2: statistics ? y2 : -1, y3: -1, w: this.text.w }, { tt1: grp, tt2: statisticsTt }, { font1: ui.font.group, font2: ui.font.statistics }); // Regorxxx <- Improve statistics tooltip ->
							if (panel.colMarker) {
								pop.cusCol(gr, grp, item, x, y1, this.text.w, this.text.h, type, cell.bNowPlaying, ui.font.group, ui.font.mainEllipsisSpace, 'group');
							} else {
								gr.GdiDrawText(grp, ui.font.group, grpCol, x, y1, this.text.w, this.text.h, style.centerLabel && !this.labels.right && !item.tt[1] ? panel.cc : panel.lc);
							}
							if (statistics) { gr.GdiDrawText(statistics, ui.font.statistics, lotCol, x, y2, this.text.w, this.text.h, style.centerLabel && !this.labels.right && !item.tt[2] ? panel.cc : panel.lc); }
						}
					}
				}
			}
		});
		ui.drawTopBarUnderlay(gr, art); // Regorxxx <- Zoom hover effect ->
	}

	drawArt(gr, art, style, image, coords, effects) {
		const offsetX = art.reflection && art.reflectionStyle === 0 ? this.bor.pad / 4 : 0;
		// Regorxxx <- Zoom hover effect
		if (effects.hover) {
			const zoomX = this.getZoomEffectIntensity();
			coords = { ...coords, x: coords.x - zoomX / 2, y: coords.y - zoomX / 2, w: coords.w + zoomX, h: coords.h + zoomX };
		}
		// Regorxxx ->
		if (effects.shadow) { this.drawStyleShadow(gr, style, { ...coords, x: coords.x - offsetX }); }
		if (effects.reflection) { this.drawReflection(gr, art, image, coords); }
		gr.SetInterpolationMode(InterpolationMode.NearestNeighbor);
		gr.DrawImage(image, coords.x - offsetX, coords.y, coords.w, coords.h, 0, 0, image.Width, image.Height);
		gr.SetInterpolationMode();
		if (effects.border) { this.drawStyleBorder(gr, style, { ...coords, x: coords.x - offsetX }); } // Regorxxx <- Image border setting | Effect per art type ->
		return coords;
	};

	drawFrame(gr, art, box_x, box_y, col, weight, cell) {
		let x, y, w, h, l_w;
		switch (weight) {
			case 'stnd':
				x = this.labels.right ? ui.sz.pad + 1 : box_x + 1;
				y = box_y + (this.labels.right ? 1 : 3);
				w = this.labels.right ? panel.tree.sel.w - 2 : this.box.w - 2;
				h = this.box.h - (this.labels.right ? 0 : 2);
				l_w = 2;
				break;
			case 'thick':
				x = box_x + Math.round((this.box.w - this.im.w) / 2) + 1;
				y = this.im.y + 3;
				w = this.im.w - 3;
				h = this.im.w - 3;
				l_w = 3;
				break;
		}
		// Regorxxx <- Zoom hover effect
		if (art.hoverZoom && (cell.bHover || cell.bSel)) {
			const zoomX = this.getZoomEffectIntensity();
			x -= zoomX / 2; y -= zoomX / 2; w += zoomX; h += zoomX;
		}
		// Regorxxx ->
		// Regorxxx <- Clamp thumbnail padding to not overlay other elements
		if (this.style.vertical) {
			const offset = Math.max(panel.search.h, y) - y;
			y += offset;
			h -= offset;
		} else {
			y = Math.max(panel.search.h + (ui.style.topBarShow ? ppt.marginTopBottom : 0), y);
			h = Math.min(window.Height - ppt.marginTopBottom - y, sbar.y - y - ppt.marginTopBottom, h);
		}
		// Regorxxx ->
		if (art.reflection && art.reflectionStyle === 0) { x -= this.bor.pad / 4; }
		gr.DrawRect(x, y, w, h, l_w, col);
	}

	drawImageFrame(gr, art, style, item, coords, col, cell) {
		// Regorxxx <- Zoom hover effect
		if (art.hoverZoom && (cell.bHover || cell.bSel)) {
			const zoomX = this.getZoomEffectIntensity();
			coords = { ...coords, x: coords.x - zoomX / 2, y: coords.y - zoomX / 2, w: coords.w + zoomX, h: coords.h + zoomX };
		}
		// Regorxxx ->
		const l_w = 3;
		if (item.root && !ppt.frameImageRoot) {
			if (this.stub.rootFrame) {
				gr.DrawImage(this.stub.rootFrame, coords.x, coords.y, coords.w, coords.h, 0, 0, this.stub.rootFrame.Width, this.stub.rootFrame.Height);
			} else {
				if (art.reflection) {
					if (ppt.frameReflection) {
						if (art.reflectionStyle === 0) { coords.x -= this.bor.pad / 4; coords.w += this.bor.pad / 2; }
						if (art.reflectionStyle === 1) { coords.x -= this.bor.pad / 2; coords.w += this.bor.pad; }
					} else if (art.reflectionStyle === 0) { coords.x -= this.bor.pad / 4; }
				}
				gr.SetSmoothingMode(SmoothingMode.HighQuality);
				gr.DrawRect(coords.x + 1, coords.y + 1, coords.w - l_w / 2 - 1, coords.h - l_w / 2 - 1, l_w, col);
			}
		} else {
			switch (style.border) {
				case 'circular': {
					gr.SetSmoothingMode(SmoothingMode.AntiAlias);
					gr.DrawEllipse(coords.x, coords.y, coords.w - l_w / 2, coords.h - l_w / 2, l_w, col);
					break;
				}
				case 'star': {
					gr.SetSmoothingMode(SmoothingMode.HighQuality);
					gr.DrawPolygon(col, l_w, getStarPoints((coords.w - l_w / 2) * 2, 6, 1.5, coords.x - (coords.w - l_w / 2) / 2, coords.y - (coords.h - l_w / 2) / 2));
					break;
				}
				case 'heart': {
					gr.SetSmoothingMode(SmoothingMode.AntiAlias);
					gr.DrawPolygon(col, l_w, this.getHeartPoints(coords.w, coords.h, coords.x - l_w / 4, coords.y - coords.h / 20));
					break;
				}
				default: {
					gr.SetSmoothingMode(SmoothingMode.HighQuality);
					gr.DrawRect(coords.x + 1, coords.y + 1, coords.w - l_w / 2 - 1, coords.h - l_w / 2 - 1, l_w, col);
					break;
				}
			}
		}
		gr.SetSmoothingMode();
	}

	drawImageEffect(gr, effect, coords) {
		gr.SetSmoothingMode(SmoothingMode.HighQuality);
		switch (effect) { // NOSONAR
			case 'flare': { // Regorxxx <- Flare hover effect ->
				gr.DrawImage(this.mask.flareEffect, coords.x, coords.y, coords.w, coords.h, 0, 0, this.mask.flareEffect.Width, this.mask.flareEffect.Height);
				break;
			}
		}
		gr.SetSmoothingMode();
	}

	// Regorxxx <- Item overlay vertical alignment | Item overlay horizontal alignment | New overlay styles
	drawItemOverlay(gr, art, style, item, coords) {
		if (item.root) { return; }
		const overlay = this.getOverlay(ppt.itemOverlayType);
		switch (overlay.type) {
			case 'items':
			case 'items (#)':
			case 'tracks':
			case 'tracks (#)': {
				let val = item[overlay.itemKey];
				if (overlay.type.includes('#')) { val = '# ' + val.replace(/ (track|item)s?$/i, ''); }
				if (!val) { return; }
				const h = Math.max(gr.CalcTextHeight(val, ui.font.tracks), 8);
				let w = Math.max(gr.CalcTextWidth(val + ' ', ui.font.tracks), 8);
				let h2;
				if (w > this.im.w) {
					val = val.split(' ');
					h2 = h * 2;
					w = Math.max(gr.CalcTextWidth(val[0], ui.font.tracks), gr.CalcTextWidth(val[1], ui.font.tracks));
				} else {
					h2 = h;
				}
				const { x, y } = this.getOverlayPos(overlay, style, coords, w, h);
				gr.SetSmoothingMode(SmoothingMode.HighQuality);
				// Regorxxx <- Custom album art overlay color track count/year
				gr.FillSolidRect(x, y, w + 2, h2, ui.col.bgTrackCount);
				if (w > this.im.w) {
					gr.GdiDrawText(val[0], ui.font.tracks, ui.col.textTrackCount, x + 1, y, w, h, style.centerTrackCount ? panel.cc : panel.rc);
					gr.GdiDrawText(val[1], ui.font.tracks, ui.col.textTrackCount, x + 1, y + h, w, h, style.centerTrackCount ? panel.cc : panel.rc);
				} else {
					gr.GdiDrawText(val, ui.font.tracks, ui.col.textTrackCount, x + 1, y, w, h, panel.cc);
				}
				// Regorxxx ->
				gr.SetSmoothingMode();
				break;
			}
			default: {
				const val = item[overlay.itemKey];
				if (!val) { break; }
				const w = Math.max(gr.CalcTextWidth(val + ' ', ui.font.tracks), 8);
				const h = Math.max(gr.CalcTextHeight(val, ui.font.tracks), 8);
				const { x, y } = this.getOverlayPos(overlay, style, coords, w, h);
				gr.SetSmoothingMode(SmoothingMode.HighQuality);
				// Regorxxx <- Custom album art overlay color track count/year
				gr.FillSolidRect(x, y, w + 2, h, ui.col.bgTrackCount);
				gr.GdiDrawText(val, ui.font.tracks, ui.col.textTrackCount, x + 1, y, w, h, panel.cc);
				// Regorxxx ->
				gr.SetSmoothingMode();
				break;
			}
		}
	}

	getOverlayPos(overlay, style, coords, textW, textH) {
		let x;
		switch (ppt.itemOverlayHAlign) {
			case 0: {  // Default
				switch (overlay.type) {
					case 'items':
					case 'items (#)':
					case 'tracks':
					case 'tracks (#)': {
						x = coords.x + (style.centerTrackCount ? (coords.w - textW - 2) / 2 : coords.w - textW - 3); break;
					}
					default: {
						x = coords.x + (style.centerTrackCount ? (coords.w - textW - 2) / 2 : 0); break;
					}
				}
				break;
			}
			case 1: x = coords.box_x + this.box.w - textW - 3; break; // Right frame
			case 2: x = coords.x - (this.im.w - coords.w) / 2 + this.im.w - textW - 3; break; // Right box
			case 3: x = coords.x + coords.w - textW - 3 - (style.overlayOffsetV ? coords.w * style.overlayOffsetH : 0); break; // Right img
			case 4: x = coords.box_x; break; // Left frame
			case 5: x = coords.x - (this.im.w - coords.w) / 2; break; // Left box
			case 6: x = coords.x + (style.overlayOffsetV ? coords.w * style.overlayOffsetH : 0); break; // Left img
			case 7: x = coords.x + (coords.w - textW - 2) / 2; break; // Center
		}
		let y;
		switch (ppt.itemOverlayVAlign) {
			case 0: y = coords.y + (style.centerTrackCount ? textH / 1.67 : 0); break; // Default
			case 1: y = coords.box_y + 3; break; // Top frame
			case 2: y = this.im.y + 1.5; break; // Top box
			case 3: y = coords.y + (style.overlayOffsetV ? coords.w * style.overlayOffsetV : 0); break; // Top img
			case 4: y = coords.box_y + this.box.h - textH; break; // Bottom frame
			case 5: y = this.im.y + this.im.w - textH; break; // Bottom box
			case 6: y = coords.y + coords.h - textH - (style.overlayOffsetV ? coords.w * style.overlayOffsetV : 0); break; // Bottom img
			case 7: y = coords.y + (coords.h - textH - 2) / 2; break; // Center
		}
		return { x, y };
	}
	// Regorxxx ->

	drawItemOverlayDark(gr, art, item, coords, cell) {
		// Regorxxx <- Zoom hover effect
		if (art.hoverZoom && (cell.bHover || cell.bSel)) {
			const zoomX = Math.floor(Math.max(this.bor.pad / 4, Math.round(5 * $.scale)));
			coords = { ...coords, x: coords.x - Math.floor(zoomX / 2), y: coords.y + Math.floor(zoomX / 4), w: coords.w + zoomX, h: coords.h + Math.floor(zoomX / 4) };
		}
		// Regorxxx ->
		if (cell.bSel || cell.bNowp) { gr.FillSolidRect(coords.x, coords.y, coords.w, coords.h, $.RGBA(150, 150, 150, 150)); }
		gr.FillSolidRect(coords.x, coords.y, coords.w, coords.h, this.getSelBgCol(item, cell.bNowp));
	}

	drawSelBg(gr, art, style, cur_img, box_x, box_y, cell) {
		if (this.labels.hide && (!style.fillBg || pop.highlight.row == 3 && ppt.frameImage)) return;
		let col, x, y, w, h;
		switch (true) {
			case (cell.bNowPlaying || cell.bSel) && !(pop.selRect.down && pop.selRect.over.has(cell.i)): // Regorxxx <- Rectangle selection on art view ->
				col = ui.col.imgBgSel;
				switch (this.labels.overlay || this.labels.hide) {
					case true:
						x = box_x + Math.round((this.box.w - (cur_img ? cur_img.Width : this.im.w)) / 2);
						y = box_y + (cur_img ? this.im.w - cur_img.Height : 0);
						w = cur_img ? cur_img.Width : this.im.w;
						h = cur_img ? cur_img.Height : this.im.w;
						break;
					case false:
						x = this.labels.right ? ui.sz.pad : box_x;
						y = box_y + (this.labels.right ? 1 : 2);
						w = this.labels.right ? panel.tree.sel.w : this.box.w;
						h = this.box.h;
						break;
				}
				break;
			case pop.highlight.row == 2 && cell.i == pop.m.i || pop.selRect.down && pop.selRect.over.has(cell.i): // Regorxxx <- Rectangle selection on art view ->
				col = ui.col.bg_h;
				if ((this.labels.overlay || this.labels.hide) && style.fillBg) {
					x = box_x + Math.round((this.box.w - (cur_img ? cur_img.Width : this.im.w)) / 2);
					y = box_y + (cur_img ? 2 + this.im.w - cur_img.Height : 2);
					w = cur_img ? cur_img.Width : this.im.w;
					h = cur_img ? cur_img.Height : this.im.w;
				} else {
					x = this.labels.right ? ui.sz.pad : box_x;
					y = box_y + ((this.labels.overlay || this.labels.hide) ? 0 : (this.labels.right ? 1 : 2));
					w = this.labels.right ? panel.tree.sel.w : this.box.w;
					h = this.box.h + ((this.labels.overlay || this.labels.hide) ? 2 : 0);
				}
				break;
			default: return;
		}
		// Regorxxx <- Zoom hover effect
		if (art.hoverZoom && (cell.bHover || cell.bSel)) {
			const zoomX = this.getZoomEffectIntensity();
			x -= zoomX / 2; y -= zoomX / 2; w += zoomX; h += zoomX;
		}
		// Regorxxx ->
		if (art.reflection && art.reflectionStyle === 0) { x -= this.bor.pad / 4; }
		// Regorxxx <- Clamp thumbnail padding to not overlay other elements
		if (this.style.vertical) {
			const offset = Math.max(panel.search.h, y) - y;
			y += offset;
			h -= offset;
		} else {
			y = Math.max(panel.search.h + (ui.style.topBarShow ? ppt.marginTopBottom : 0), y);
			h = Math.min(window.Height - ppt.marginTopBottom - y, sbar.y - y - ppt.marginTopBottom, h);
		}
		// Regorxxx ->
		if (typeof col !== 'undefined') { gr.FillSolidRect(x, y, w, h, col); } // Regorxxx <- Code cleanup don't call method if unused! ->
	}

	fadeMask(image, w, h) {
		const mask = $.gr(w, h, true, g => g.DrawImage(this.mask.fade, 0, h - this.overlayHeight, w, this.overlayHeight, 0, 0, this.mask.fade.Width, this.mask.fade.Height));
		image.ApplyMask(mask);
	}

	applyStyleMask(image, style) {
		if (style.mask) { image.ApplyMask(this.mask[style.mask].Resize(image.Width, image.Height)); }
		return image;
	}

	applyArtEffect(image, art) {
		if (this.useD2D) {
			let intensity;
			image = applyEffect(image, (img) => {
				let prevEffect, effect;
				if (art.mute && ppt.imgMute !== 0 && Number.isInteger(ppt.imgMute)) {
					intensity = Math.max(Math.min(ppt.imgMute / 100, 1), 0);
					const brightness = d2d.Effect(Effects.Brightness.ID);
					brightness.SetInput(0, img);
					brightness.SetValue(Effects.Brightness.BlackPoint, new Float32Array([0, 1 - intensity]));
					const blur = d2d.Effect(Effects.GaussianBlur.ID);
					blur.SetInputEffect(0, brightness);
					blur.SetValue(Effects.GaussianBlur.StandardDeviation, 1);
					blur.SetValue(Effects.GaussianBlur.BorderMode, BorderMode.Hard);
					effect = d2d.Effect(Effects.Blend.ID);
					if (prevEffect) { effect.SetInputEffect(0, prevEffect); }
					else { effect.SetInput(0, img); }
					effect.SetInputEffect(1, blur);
					effect.SetValue(Effects.Blend.Mode, BlendMode.Luminosity);
					prevEffect = effect;
					const tint = d2d.Effect(Effects.TemperatureTint.ID);
					tint.SetInput(0, img);
					tint.SetValue(Effects.TemperatureTint.Temperature, -0.25);
					effect = d2d.Effect(Effects.Blend.ID);
					effect.SetInputEffect(0, prevEffect);
					effect.SetInputEffect(1, tint);
					effect.SetValue(Effects.Blend.Mode, BlendMode.Darken);
					prevEffect = effect;
					effect = d2d.Effect(Effects.HighlightsShadows.ID);
					effect.SetInputEffect(0, prevEffect);
					effect.SetValue(Effects.HighlightsShadows.Shadows, 0.75);
					effect.SetValue(Effects.HighlightsShadows.Highlights, -0.25);
					effect.SetValue(Effects.HighlightsShadows.Clarity, -1);
					effect.SetValue(Effects.HighlightsShadows.MaskBlurRadius, 5);
					prevEffect = effect;
				}
				if (art.edgeGlow && ppt.imgEdgeGlow !== 0 && Number.isInteger(ppt.imgEdgeGlow)) {
					intensity = Math.max(Math.min(ppt.imgEdgeGlow / 100, 1), 0);
					effect = d2d.Effect(Effects.EdgeDetection.ID);
					if (prevEffect) { effect.SetInputEffect(0, prevEffect); }
					else { effect.SetInput(0, img); }
					effect.SetValue(Effects.EdgeDetection.Strength, intensity);
					prevEffect = effect;
				}
				if (art.bloom && ppt.imgBloom !== 0 && Number.isInteger(ppt.imgBloom)) {
					intensity = Math.max(Math.min(ppt.imgBloom / 100, 1), 0);
					const brightness = d2d.Effect(Effects.Brightness.ID);
					brightness.SetInput(0, img);
					brightness.SetValue(Effects.Brightness.WhitePoint, new Float32Array([0.5, intensity]));
					intensity = Math.max(img.Width, img.Height) / 100;
					const blur = d2d.Effect(Effects.GaussianBlur.ID);
					blur.SetInputEffect(0, brightness);
					blur.SetValue(Effects.GaussianBlur.StandardDeviation, intensity);
					blur.SetValue(Effects.GaussianBlur.BorderMode, BorderMode.Hard);
					effect = d2d.Effect(Effects.Blend.ID);
					if (prevEffect) { effect.SetInputEffect(0, prevEffect); }
					else { effect.SetInput(0, img); }
					effect.SetInputEffect(1, blur);
					effect.SetValue(Effects.Blend.Mode, prevEffect ? BlendMode.SoftLight : BlendMode.Screen);
					prevEffect = effect;
				}
				if (art.blur && ppt.imgBlur !== 0 && Number.isInteger(ppt.imgBlur)) {
					intensity = ppt.imgCircularBlur
						? Math.min(Math.max(ppt.imgBlur, 0) / 5 / 2, 1)
						: Math.max(ppt.imgBlur, 0);
					const id = ppt.imgDirectionalBlur
						? Effects.DirectionalBlur.ID
						: Effects.GaussianBlur.ID;
					effect = d2d.Effect(id);
					if (prevEffect) { effect.SetInputEffect(0, prevEffect); }
					else { effect.SetInput(0, img); }
					effect.SetValue(Effects.GaussianBlur.StandardDeviation, intensity);
					effect.SetValue(Effects.GaussianBlur.BorderMode, BorderMode.Hard);
					prevEffect = effect;
					if (ppt.imgCircularBlur) {
						intensity = Math.max(ppt.imgBlur, 0) / 2;
						prevEffect = effect = applyEffectAsMaskEffect(img, effect, (img, effect) => {
							const innerBlur = d2d.Effect(id);
							innerBlur.SetInputEffect(0, effect);
							innerBlur.SetValue(Effects.GaussianBlur.StandardDeviation, intensity);
							return innerBlur;
						}, (mask, gr) => {
							gr.FillEllipse(mask.Width / 4, mask.Height / 4, mask.Width / 2, mask.Height / 2, 0xFF000000);
							mask.ReleaseGraphics(gr);
							mask.StackBlur(mask.Width / 10);
							return true;
						}, true);
					}
				}
				if (art.grayScale) {
					effect = d2d.Effect(Effects.Grayscale.ID);
					if (prevEffect) { effect.SetInputEffect(0, prevEffect); }
					else { effect.SetInput(0, img); }
					prevEffect = effect;
				}
				if (art.vignette && ppt.imgVignette !== 0 && Number.isInteger(ppt.imgVignette)) {
					intensity = Math.max(Math.min(ppt.imgVignette / 100, 1), 0);
					effect = d2d.Effect(Effects.Vignette.ID);
					if (prevEffect) { effect.SetInputEffect(0, prevEffect); }
					else { effect.SetInput(0, img); }
					const color = [...$.toRGB(ppt.imgVignetteColor || this.getAvgUiColor()).map((v) => v / 255), 1];
					effect.SetValue(Effects.Vignette.Color, new Float32Array(color));
					effect.SetValue(Effects.Vignette.TransitionSize, intensity);
					effect.SetValue(Effects.Vignette.Strength, 0.8);
					prevEffect = effect; // NOSONAr
				}
				return effect;
			});
		} else {
			let intensity;
			if (art.mute && ppt.imgMute !== 0 && Number.isInteger(ppt.imgMute)) {
				intensity = Math.max(Math.min(ppt.imgMute / 100 * 255, 255), 0);
				applyMask(image, (mask, gr, w, h) => {
					gr.DrawImage(image, 0, 0, w, h, 0, 0, w, h, 0, intensity / 2);
					mask.ReleaseGraphics(gr);
					mask.StackBlur(5);
					return true;
				});
				applyMask(image, (mask, gr, w, h) => {
					gr.DrawImage(image.InvertColours(), 0, 0, w, h, 0, 0, w, h, 0, intensity);
					mask.ReleaseGraphics(gr);
					mask.StackBlur(10);
					return true;
				});
			}
			if (art.edgeGlow && ppt.imgEdgeGlow !== 0 && Number.isInteger(ppt.imgEdgeGlow)) {
				intensity = Math.max(Math.min(ppt.imgEdgeGlow / 100 * 255, 255), 0);
				applyAsMask(
					image,
					(img, gr, w, h) => {
						gr.FillSolidRect(0, 0, w, h, $.RGB(0, 0, 0));
					},
					(mask, gr, w, h) => {
						gr.DrawImage(image.InvertColours(), 0, 0, w, h, 0, 0, w, h, 0, intensity);
						mask.ReleaseGraphics(gr);
						mask.StackBlur(1);
						return true;
					}, true
				);
			}
			if (art.bloom && ppt.imgBloom !== 0 && Number.isInteger(ppt.imgBloom)) {
				intensity = Math.max(Math.min(ppt.imgBloom / 100 * 255, 255), 0);
				applyAsMask(
					image,
					(img, gr, w, h) => {
						gr.FillSolidRect(0, 0, w, h, $.RGB(255, 255, 255));
					},
					(mask, gr, w, h) => {
						gr.DrawImage(image.InvertColours(), 0, 0, w, h, 0, 0, w, h, 0, intensity);
						mask.ReleaseGraphics(gr);
						mask.StackBlur(50);
						return true;
					}, true
				);
				applyAsMask(
					image,
					(img, gr) => {
						img.ReleaseGraphics(gr);
						img.StackBlur(10);
						return true;
					},
					(mask, gr, w, h) => { gr.DrawImage(image.InvertColours(), 0, 0, w, h, 0, 0, w, h); },
				);
			}
			if (art.blur && ppt.imgBlur !== 0 && Number.isInteger(ppt.imgBlur)) {
				intensity = Math.max(ppt.imgBlur, 0);
				if (ppt.imgCircularBlur) {
					image.StackBlur(Math.min(intensity / 5, 1));
					applyAsMask(
						image,
						(img, gr) => {
							img.ReleaseGraphics(gr);
							img.StackBlur(intensity);
							return true;
						},
						(mask, gr, w, h) => {
							gr.FillEllipse(w / 4, h / 4, w / 2, h / 2, 0xFFFFFFFF);
							mask.ReleaseGraphics(gr);
							mask.StackBlur(w / 10);
							return true;
						},
					);
				} else {
					image.StackBlur(intensity);
				}
			}
			if (art.vignette && ppt.imgVignette !== 0 && Number.isInteger(ppt.imgVignette)) {
				intensity = Math.max(Math.min(ppt.imgVignette / 100, 1), 0);
				applyAsMask(
					image,
					(img, gr, w, h) => gr.FillSolidRect(0, 0, w, h, 0xFF000000),
					(mask, gr, w, h) => {
						const x = intensity * w / 7;
						const y = intensity * h / 7;
						const ww = w - 2 * x;
						const hh = h - 2 * y;
						gr.FillEllipse(x, y, ww, hh, 0xFFFFFFFF);
						mask.ReleaseGraphics(gr);
						mask.StackBlur(w / 3.5);
					},
				);
			}
		}
		return image;
	}

	drawStyleBorder(gr, style, coords) {
		switch (style.border) {
			case 'circular': {
				gr.SetSmoothingMode(SmoothingMode.HighQuality);
				gr.DrawEllipse(coords.x + 1, coords.y + 1, coords.w - 2, coords.h - 2, 1, ui.col.imgBor); // Regorxxx <- Improve img mask to avoid rough edges ->
				gr.SetSmoothingMode();
				break;
			}
			case 'star': {
				gr.SetSmoothingMode(SmoothingMode.HighQuality);
				gr.DrawPolygon(ui.col.imgBor, 1, getStarPoints(coords.w * 2, 6, 1.5, coords.x - coords.w / 2, coords.y - coords.h / 2));
				gr.SetSmoothingMode();
				break;
			}
			case 'heart': {
				gr.SetSmoothingMode(SmoothingMode.HighQuality);
				gr.DrawPolygon(ui.col.imgBor, 2, this.getHeartPoints(coords.w - 2, coords.h, coords.x + 1, coords.y - coords.h / 20));
				gr.SetSmoothingMode();
				break;
			}
			default: {
				gr.DrawRect(coords.x, coords.y, coords.w - 1, coords.h - 1, 1, ui.col.imgBor);
				break;
			}
		}
	}

	drawStyleShadow(gr, style, coords) {
		if (this.style.dropShadow && this.shadow) {
			if (style.shadow === 'default') { // disabled for blend: not suitable
				// Regorxxx <- Adjust shadows to non-filling images
				const h = this.shadow.Height - (this.im.w - coords.h) * 1.15;
				const w = this.shadow.Width - (this.im.w - coords.w) * 1.15;
				gr.DrawImage(this.shadow, coords.x, coords.y, w, h, 0, 0, this.shadow.Width, this.shadow.Height);
				// Regorxxx ->
			} else { gr.DrawImage(this.shadow, coords.x, coords.y, Math.ceil(coords.w * 1.15), Math.ceil(coords.h * 1.15), 0, 0, this.shadow.Width, this.shadow.Height); }
		} else if (this.style.dropGrad) {
			switch (style.shadow) {
				case 'circular': {
					gr.SetSmoothingMode(SmoothingMode.AntiAlias);
					gr.DrawEllipse(coords.x, coords.y, coords.w, coords.h, 4 * $.scale, $.RGBA(0, 0, 0, 32));
					gr.SetSmoothingMode();
					break;
				}
				case 'star': {
					coords.w += 1;
					gr.SetSmoothingMode(SmoothingMode.AntiAlias);
					gr.FillPolygon($.RGBA(0, 0, 0, 32), 0, getStarPoints(coords.w * 2, 6, 1.5, coords.x - coords.w / 2, coords.y - coords.h / 2));
					gr.SetSmoothingMode();
					break;
				}
				case 'heart': {
					coords.w += 6;
					coords.y -= 3;
					gr.SetSmoothingMode(SmoothingMode.AntiAlias);
					gr.FillPolygon($.RGBA(0, 0, 0, 32), 0, this.getHeartPoints(coords.w, coords.h, coords.x - 3, coords.y - coords.h / 20));
					gr.SetSmoothingMode();
					break;
				}
				default: {
					gr.FillGradRect(coords.x + coords.w, coords.y, 4 * $.scale, coords.h, 0, $.RGBA(0, 0, 0, 56), 0);
					gr.FillGradRect(coords.x, coords.y + coords.h, coords.w, 4 * $.scale, 90, $.RGBA(0, 0, 0, 56), 0);
					break;
				}
			}
		}
	}

	drawStyleShadowStub(gr, style, x, y, w, h) {
		if (this.style.dropShadowStub && this.shadowStub) {
			gr.DrawImage(this.shadowStub, x, y, this.shadowStub.Width, this.shadowStub.Height, 0, 0, this.shadowStub.Width, this.shadowStub.Height);
		} else if (this.style.dropGradStub) {
			switch (style.shadow) {
				case 'circular': {
					gr.SetSmoothingMode(SmoothingMode.AntiAlias);
					gr.DrawEllipse(x, y, w, h, 4 * $.scale, $.RGBA(0, 0, 0, 32));
					gr.SetSmoothingMode();
					break;
				}
				case 'star': {
					w += 1;
					gr.SetSmoothingMode(SmoothingMode.AntiAlias);
					gr.FillPolygon($.RGBA(0, 0, 0, 32), 0, getStarPoints(w * 2, 6, 1.5, x - w / 2, y - h / 2));
					gr.SetSmoothingMode();
					break;
				}
				case 'heart': {
					w += 6;
					y -= 3;
					gr.SetSmoothingMode(SmoothingMode.AntiAlias);
					gr.FillPolygon($.RGBA(0, 0, 0, 32), 0, this.getHeartPoints(w, h, x - 3, y - h / 20));
					gr.SetSmoothingMode();
					break;
				}
				default: {
					gr.FillGradRect(x + w - 2 * $.scale, y, 6 * $.scale, h, 0, $.RGBA(0, 0, 0, 56), 0);
					gr.FillGradRect(x, y + h - 2 * $.scale, w, 6 * $.scale, 90, $.RGBA(0, 0, 0, 56), 0);
					break;
				}
			}
		}
	}

	drawReflection(gr, art, image, coords) {
		if (!this.canShowReflection(art)) { return false; }
		const alpha = 102; // Art alpha * 0.4
		const offsetX = this.bor.pad / 2;
		const fade = Math.min(offsetX, image.Width * 0.9);
		switch (art.reflectionStyle) {
			case 0: { // asymmetric right
				const clone = image.Clone(0, 0, image.Width, image.Height);
				clone.RotateFlip(RotateFlipType.RotateNoneFlipX);
				applyMask(
					clone,
					(mask, gr, w, h) => gr.FillGradRect(0, 0, fade, h, 0.15, $.RGB(0, 0, 0), $.RGB(255, 255, 255)),
					true
				);
				gr.DrawImage(clone, coords.x + image.Width - offsetX / 2, coords.y, Math.ceil(offsetX), coords.h, 0, 0, Math.ceil(offsetX), image.Height, 0, alpha);
				break;
			}
			case 2: // asymmetric bottom
			case 3: { // asymmetric bottom skew
				const clone = image.Clone(0, 0, image.Width, image.Height);
				clone.RotateFlip(RotateFlipType.RotateNoneFlipY);
				const offsetY = this.bor.pad / 2;
				const scale = this.style.vertical ? 2 : 2.5;
				const fade = Math.min(offsetY * scale, image.Height * 0.9);
				applyMask(
					clone,
					(mask, gr, w) => gr.FillGradRect(0, 0, w, fade, 90, $.RGB(0, 0, 0), $.RGB(255, 255, 255)),
					true
				);
				if (typeof BrushType === 'undefined' || art.reflectionStyle === 2) {
					gr.DrawImage(clone, coords.x, coords.y + image.Height - offsetY / 2, coords.w, Math.ceil(offsetY * scale), 0, 0, image.Width, Math.ceil(offsetY * scale), 0, alpha);
				} else {
					gr.SetSmoothingMode(SmoothingMode.AntiAlias);
					const brush = gdi.Brush(BrushType.Bitmap, clone.ApplyAlpha(alpha), BrushWrapMode.Clamp);
					const prop = coords.w / clone.Width;
					brush.Skew(-10, 0);
					brush.Scale(prop, 0.6);
					brush.Translate(coords.x, coords.y + coords.h);
					gr.FillPolygon(
						brush,
						0,
						[
							coords.x, coords.y + Math.floor(image.Height * prop) - 1,
							coords.x + coords.w, coords.y + Math.floor(image.Height * prop) - 1,
							coords.x + coords.w, coords.y + image.Height * prop + Math.ceil(offsetY * 2) * prop,
							Math.max(coords.x - coords.w, coords.x - offsetY), coords.y + image.Height * prop + Math.ceil(offsetY * 2) * prop,
						]
					);
					gr.SetSmoothingMode();
				}
				break;
			}
			case 4: // asymmetric bottom | symmetric left/right
			case 5: { // asymmetric bottom skew | symmetric left/right
				let imgRotated = image.Clone(0, 0, image.Width, image.Height);
				imgRotated.RotateFlip(RotateFlipType.RotateNoneFlipY);
				const offsetY = this.bor.pad / 2;
				const scale = this.style.vertical ? 2 : 2.5;
				let fade = Math.min(offsetY * scale, image.Height * 0.9);
				let refl = imgRotated;
				applyMask(
					refl,
					(mask, gr, w) => gr.FillGradRect(0, 0, w, fade, 90.1, $.RGB(0, 0, 0), $.RGB(255, 255, 255)),
					true
				);
				if (typeof BrushType === 'undefined' || art.reflectionStyle === 4) {
					gr.DrawImage(refl, coords.x, coords.y + image.Height - offsetY / 2, coords.w, Math.ceil(offsetY * scale), 0, 0, image.Width, Math.ceil(offsetY * scale), 0, alpha);
				} else {
					gr.SetSmoothingMode(SmoothingMode.AntiAlias);
					const brush = gdi.Brush(BrushType.Bitmap, refl.ApplyAlpha(alpha), BrushWrapMode.Clamp);
					brush.Scale(1, 0.6);
					brush.Skew(-30, 0);
					brush.Translate(coords.x, coords.y + image.Height);
					gr.FillPolygon(
						brush,
						0,
						[
							coords.x, coords.y + image.Height,
							coords.x + coords.w, coords.y + image.Height,
							coords.x + coords.w * 0.82, coords.y + image.Height + Math.ceil(offsetY * 2),
							coords.x - coords.w * 0.18, coords.y + image.Height + Math.ceil(offsetY * 2),
						]
					);
					gr.SetSmoothingMode();
				}
				fade = Math.min(offsetX, image.Width * 0.9);
				imgRotated = image.Clone(0, 0, image.Width, image.Height);
				imgRotated.RotateFlip(RotateFlipType.RotateNoneFlipX);
				refl = imgRotated.Clone(0, 0, image.Width, image.Height);
				applyMask(
					refl,
					(mask, gr, w, h) => gr.FillGradRect(0, 0, fade, h, 0.15, $.RGB(0, 0, 0), $.RGB(255, 255, 255)),
					true
				);
				gr.DrawImage(refl, coords.x + image.Width, coords.y, Math.ceil(offsetX), coords.h, 0, 0, Math.ceil(offsetX), image.Height, 0, alpha / 2);
				refl = imgRotated.Clone(0, 0, image.Width, image.Height);
				applyMask(
					refl,
					(mask, gr, w, h) => gr.FillGradRect(w - fade, 0, fade, h, 0.15, $.RGB(255, 255, 255), $.RGB(0, 0, 0)),
					true
				);
				gr.DrawImage(refl, Math.floor(coords.x - offsetX), coords.y, Math.ceil(offsetX), coords.h, Math.floor(image.Width - offsetX), 0, Math.ceil(offsetX), image.Height, 0, alpha / 2);
				break;
			}
			case 1: // symmetric left/right
			default: {
				const imgRotated = image.Clone(0, 0, image.Width, image.Height);
				imgRotated.RotateFlip(RotateFlipType.RotateNoneFlipX);
				let refl = imgRotated.Clone(0, 0, image.Width, image.Height);
				applyMask(
					refl,
					(mask, gr, w, h) => gr.FillGradRect(0, 0, fade, h, 0.15, $.RGB(0, 0, 0), $.RGB(255, 255, 255)),
					true
				);
				gr.DrawImage(refl, coords.x + image.Width, coords.y, Math.ceil(offsetX), coords.h, 0, 0, Math.ceil(offsetX), image.Height, 0, alpha);
				refl = imgRotated.Clone(0, 0, image.Width, image.Height);
				applyMask(
					refl,
					(mask, gr, w, h) => gr.FillGradRect(w - fade, 0, fade, h, 0.15, $.RGB(255, 255, 255), $.RGB(0, 0, 0)),
					true
				);
				gr.DrawImage(refl, Math.floor(coords.x - offsetX), coords.y, Math.ceil(offsetX), coords.h, Math.floor(image.Width - offsetX), 0, Math.ceil(offsetX), image.Height, 0, alpha);
				break;
			}
		}
		return true;
	};

	canShowReflection(art) {
		return art.reflectionStyle === 2
			? this.bor.pad / 2 * 2.5 > 10
			: this.bor.pad / 2 > 5;
	}

	getZoomEffectIntensity() {
		return Math.max(this.bor.pad / 4, Math.round(5 * $.scale));
	}

	format(image, art, style, w, h, fade, caller) {
		let ix = 0;
		let iy = 0;
		let iw = image.Width;
		let ih = image.Height;
		switch (style.type) {
			case 'starfill':
			case 'stareffect':
			case 'staroutline':
			case 'heart':
			case 'crop':
			case 'circular': {
				const s1 = iw / w;
				const s2 = ih / h;
				const r = s1 / s2;
				if (this.needTrim(art.trim, r)) {
					if (s1 > s2) {
						iw = Math.round(w * s2);
						ix = Math.round((image.Width - iw) / 2);
					} else {
						ih = Math.round(h * s1);
						iy = Math.round((image.Height - ih) / 8);
					}
					image = image.Clone(ix, iy, iw, ih);
				}
				// Regorxxx <- Cut img to avoid artifacts at borders | Use HQ Bicubic interpolation
				w = Math.round(w);
				h = Math.round(h);
				if (w !== iw || h !== ih) {
					const cut = $.clamp(Number(ppt.albumArtCutResize), 0, Math.min(w, h) - 1);
					if (cut) {
						image = image.Resize(w + cut * 2, h + cut * 2, InterpolationMode.HighQualityBicubic);
						image = image.Clone(cut, cut, w, h);
					} else {
						image = image.Resize(w, h, InterpolationMode.HighQualityBicubic);
					}
				}
				// Regorxxx ->
				break;
			}
			default: {
				const sc = caller == 'save' ? Math.max(h / ih, w / iw) : Math.min(h / ih, w / iw);
				const im_w = Math.round(iw * sc);
				const im_h = Math.round(ih * sc);
				// Regorxxx <- Cut img to avoid artifacts at borders | Use HQ Bicubic interpolation
				if (im_w !== iw || im_h !== ih) {
					const cut = $.clamp(Number(ppt.albumArtCutResize), 0, Math.min(im_w, im_h) - 1);
					if (cut) {
						image = image.Resize(im_w + cut * 2, im_h + cut * 2, InterpolationMode.HighQualityBicubic);
						image = image.Clone(cut, cut, im_w, im_h);
					} else {
						image = image.Resize(im_w, im_h, InterpolationMode.HighQualityBicubic);
					}
				}
				// Regorxxx ->
				break;
			}
		}
		this.applyStyleMask(image, style);
		image = this.applyArtEffect(image, art);
		if (fade) { this.fadeMask(image, image.Width, image.Height); }
		return image;
	}

	addToCache(image, caller, key) {
		this.cache[key] = {
			img: image,
			accessed: caller == 'display' ? ++this.accessed : 0
		};
	}
	// Regorxxx ->

	getCurrentDatabase() {
		this.albumArtDiskCache = ppt.albumArtDiskCache;
		if (!this.albumArtDiskCache) return;
		const cacheFolder = this.cacheFolder;
		$.buildPth(this.cachePath);
		this.saveSize = this.im.w > 500 ? 750 : this.im.w > 250 ? 500 : 250;
		this.interval = {
			cache: this.saveSize == 250 ? 1 : this.saveSize == 500 ? 4 : 9,
			preLoad: this.saveSize == 250 ? (this.labels.fade ? 15 : 7) : this.saveSize == 500 ? 20 : 45
		};
		this.cacheFolder = this.getArtCachePath(ppt.artId, panel.folderView) + (this.saveSize == 250 ? '' : this.saveSize) + '\\'; // Regorxxx <- Code cleanup ->
		$.create(this.cacheFolder);
		this.database = $.jsonParse(this.cacheFolder + 'database.dat', this.newDatabase(), 'file');
		if (this.cacheFolder != cacheFolder) {
			this.preLoadItems = [];
			clearInterval(this.timer.preLoad);
			this.timer.preLoad = null;
			this.items = [];
			clearInterval(this.timer.load);
			this.timer.load = null;
			this.toSave = [];
			clearInterval(this.timer.save);
			this.timer.save = null;
		}
	}

	getField(handle, name, arr) {
		let f = handle.GetFileInfo();
		if (f) {
			for (let i = 0; i < f.MetaCount; ++i) {
				let fullName = '';
				for (let j = 0; j < f.MetaValueCount(i); ++j) {
					fullName += f.MetaValue(i, j) + (j < f.MetaValueCount(i) - 1 ? ', ' : '');
					if (f.MetaValue(i, j) == name || fullName == name) arr.push(f.MetaName(i).toLowerCase());
				}
			}
		}
	}

	getGrpCol(item, nowp, hover) {
		return nowp ? ui.col.nowp : hover ? (panel.textDiffHighlight ? ui.col.nowp : ui.col.text_h) : item.sel ? this.labels.overlayDark ? ui.col.text : ui.col.textSel : this.labels.overlayDark ? $.RGB(240, 240, 240) : ui.col.text;
	}

	// Regorxxx <- Code cleanup | Improve image loading | Branch collage art
	getImages() {
		if (!panel.imgView) { return; }
		const extraRows = this.albumArtDiskCache ? panel.rows * 2 : panel.rows; // will load any extra including those after any preLoad
		this.items = [];
		let begin = this.start == 0 ? ppt.rootNode ? 1 : 0 : this.start;
		let end = this.end == 0 ? this.end : Math.min(this.end + this.columns * extraRows, pop.tree.length);
		const fill = (item, ix) => {
			if (!item) { return; }
			let key = item.key;
			if (key && !this.cache[key]) {
				this.items.push({
					ix,
					handle: item.handle,
					key,
					handleArr: item.handleArr,
					keyArr: item.keyArr
				});
			}
		};
		for (let i = begin; i < end; i++) {
			fill(pop.tree[i], i);
		}
		begin = Math.max(ppt.rootNode ? 1 : 0, begin - this.columns * extraRows);
		let i = end;
		while (i--) {
			if (i < begin) { break; }
			fill(pop.tree[i], i);
		}
		if (!this.items.length) { return; }

		const allCached = this.albumArtDiskCache
			? this.items.every(v => v.key && this.database[v.key])
			: false;
		const interval = allCached
			? this.interval.cache
			: !sbar.bar.isDragging && !sbar.touch.dn ? 5 : 50;

		const addToCache = (() => {
			const art = this.getArt(ppt.artId, panel.folderView);
			let j = 0;
			return () => {
				if (j < this.items.length) {
					const v = this.items[j];
					const key = v.key;
					j++;
					if (this.cache[key]) { addToCache(); }
					else {
						this.cache[key] = {
							img: 'called',
							accessed: ++this.accessed
						};
						const handlesCount = v.handleArr.length;
						if (ppt.albumArtNodeCollage && handlesCount) {
							const promises = [];
							const keys = new Set();
							const max = Math.min(handlesCount, 4);
							for (let i = 0; i < handlesCount; i++) {
								if (keys.size === max) { break; }
								const handle = v.handleArr[i];
								const subKey = v.keyArr[i];
								if (!keys.has(subKey)) {
									keys.add(subKey);
									if (this.albumArtDiskCache && this.database[subKey] && $.file(this.cacheFolder + this.database[subKey])) {
										promises.push(this.load_image_async(subKey, this.cacheFolder + this.database[subKey], v.ix));
									} else {
										promises.push(this.get_album_art_async(handle, art, subKey, v.ix));
									}
								}
							}
							Promise.all(promises).then((results) => {
								if (this.albumArtDiskCache) {
									results.forEach((r) => {
										if (!this.database[r.key] || !$.file(this.cacheFolder + this.database[r.key])) {
											const saveName = 'b_' + md5.hashStr(r.key) + r.ext;
											this.cacheIt(r.image, r.key, r.ix, saveName);
										}
									});
								}
								if (results.length > 1) {
									const img = $.gr(this.cellWidth * 2, this.cellWidth * 2, true, g => this.createCollageFromImgs(g, this.cellWidth, this.cellWidth, 2, results.map((r) => r.image)));
									this.cacheIt(img, key, v.ix);
								} else {
									this.cacheIt(results[0].image, key, v.ix);
								}
							});
						} else if (this.albumArtDiskCache && $.file(this.cacheFolder + this.database[key])) {
							this.load_image_async(key, this.cacheFolder + this.database[key], v.ix);
						} else if (v.handle) {
							this.get_album_art_async(v.handle, art, key, v.ix);
						}
					}
				} else {
					clearInterval(this.timer.load);
					this.timer.load = null;
				}
			};
		})();
		clearInterval(this.timer.load);
		this.timer.load = setInterval(addToCache, interval);
	}
	// Regorxxx ->

	getImg(key) {
		const o = this.cache[key];
		if (!o || o.img == 'called') return void (0);
		o.accessed = ++this.accessed;
		return o.img;
	}

	getItem(i) {
		if (!pop.tree[i]) {
			return null;
		}
		const key = pop.tree[i].key;
		if (!this.cache[key] && this.database[key] && this.database[key] != 'noAlbumArt') {
			if ($.file(this.cacheFolder + this.database[key])) { // cacheItPreload if file exists
				return {
					ix: i,
					key
				};
			}
		}
		return null;
	}

	getItemsToDraw(preLoad) {
		switch (true) {
			case this.style.vertical:
				if (pop.tree.length <= panel.rows * this.columns) {
					this.start = 0;
					this.end = pop.tree.length;
				} else {
					this.start = Math.round(sbar.delta / this.row.h) * this.columns;
					this.start = $.clamp(this.start, 0, this.start - this.columns);
					this.end = Math.ceil((sbar.delta + this.panel.h) / this.row.h) * this.columns;
					this.end = Math.min(this.end, pop.tree.length);
				}
				break;
			case !this.style.vertical:
				if (pop.tree.length <= panel.rows) {
					this.start = 0;
					this.end = pop.tree.length;
				} else {
					this.start = Math.round(sbar.delta / this.blockWidth);
					this.end = Math.min(this.start + panel.rows + 2, pop.tree.length);
					this.start = $.clamp(this.start, 0, this.start - 1);
				}
				break;
		}
		this.albumArtDiskCache ? (preLoad && !ppt.albumArtNodeCollage ? this.preLoad() : this.getImages()) : this.loadThrottle(); // Regorxxx <- Branch collage art ->
	}

	getLotCol(item, nowp, hover) {
		return nowp ? ui.col.nowp : hover ? (panel.textDiffHighlight ? ui.col.nowp : ui.col.text_h) : item.sel ? this.labels.overlayDark ? ui.col.lotBlend : ui.col.selBlend : this.labels.overlayDark ? $.RGB(220, 220, 220) : ui.col.lotBlend;
	}

	getMostFrequentField(arr) {
		const counts = arr.reduce((a, c) => {
			a[c] = (a[c] || 0) + 1;
			return a;
		}, {});
		const maxCount = Math.max(...Object.values(counts));
		const mostFrequent = Object.keys(counts).find(k => counts[k] === maxCount);
		return panel.grp[ppt.viewBy].type.includes(mostFrequent) ? mostFrequent : '';
	}

	// Regorxxx <- Code cleanup | New img styles
	getShadow(style) {
		const xy = this.im.w * 0.02;
		let wh = style.shadow === 'default' ? this.im.w : this.im.w * 0.985; // draw at actual size if possible as faster; regular have to be resized during draw
		const sz = this.im.w * 1.17;
		switch (style.shadow) {
			case 'circular':
				this.shadow = $.gr(sz, sz, true, g => g.FillEllipse(xy, xy, wh, wh, $.RGBA(0, 0, 0, 128)));
				this.shadow.StackBlur(4);
				break;
			case 'star':
				this.shadow = $.gr(sz, sz, true, g => g.FillPolygon($.RGBA(0, 0, 0, 128), 0, getStarPoints(wh * 2, 6, 1.5, -wh / 2, -wh / 2)));
				this.shadow.StackBlur(4);
				break;
			case 'heart':
				this.shadow = $.gr(sz, sz, true, g => g.FillPolygon($.RGBA(0, 0, 0, 128), 0, this.getHeartPoints(wh, wh, 0, - wh / 20)));
				this.shadow.StackBlur(4);
				break;
			default:
				this.shadow = $.gr(sz, sz, true, g => g.FillSolidRect(xy, xy, wh, wh, $.RGBA(0, 0, 0, 128)));
				this.shadow.StackBlur(5);
				break;
		}
		wh = this.im.w * 0.985; // always drawn at actual size
		if (ppt.artId == 4) {
			if (ppt.curNoArtistImg == 0 || ppt.curNoArtistImg == 2 || style.shadow === 'circular') {
				this.shadowStub = $.gr(sz, sz, true, g => g.FillEllipse(xy, xy, wh, wh, $.RGBA(0, 0, 0, 128)));
				this.shadowStub.StackBlur(4);
			} else if (ppt.curNoArtistImg == 4) {
				this.shadowStub = null;
			} else {
				this.shadowStub = $.gr(sz, sz, true, g => g.FillSolidRect(xy, xy, wh, wh, $.RGBA(0, 0, 0, 128)));
				this.shadowStub.StackBlur(5);
			}
		} else if (ppt.curNoCoverImg > 2) {
			this.shadowStub = $.gr(sz, sz, true, g => g.FillSolidRect(xy, xy, wh, wh, $.RGBA(0, 0, 0, 128)));
			this.shadowStub.StackBlur(5);
		} else {
			this.shadowStub = null;
		}
	}
	// Regorxxx ->

	getSelBgCol(item, nowp) {
		return nowp || item.sel ? this.albumArtShowLabels ? ui.col.imgBgSel : ui.col.imgOverlaySel : $.RGBA(0, 0, 0, 175);
	}

	load() {
		const albumArtGrpNames = $.jsonParse(ppt.albumArtGrpNames, {});
		const fields = [];
		const mod = pop.tree.length < 1000 ? 1 : pop.tree.length < 3500 ? Math.round(pop.tree.length / 1000) : 3;
		const tfArtId = panel.folderView ? null : new FbTitleFormat(panel.getBranchTf()); // Regorxxx <- Branch collage art ->
		this.groupField = albumArtGrpNames[`${panel.grp[ppt.viewBy].type.trim()}${panel.lines}`];
		const overlay = this.getOverlay(ppt.itemOverlayType); // Regorxxx <- New overlay styles ->

		pop.tree.forEach((v, i) => {
			const handle = panel.list[v.item[0].start];
			v.handle = handle;
			const arr = pop.tree[i].name.split('^@^');
			v.grp = panel.lines == 1 || !ppt.albumArtFlipLabels ? arr[0] : arr[1];
			v.lot = panel.lines == 2 ? ppt.albumArtFlipLabels ? arr[0] : arr[1] : '';
			// Regorxxx <- Multiple-playlist flat view
			if (handle) {
				v.key = md5.hashStr(handle.Path + handle.SubSong + (panel.lines == 1 ? (arr[0] || 'Unknown') : ((arr[0] || 'Unknown') + ' - ' + (arr[1] || 'Unknown'))) + ppt.artId);
				// Regorxxx <- New overlay styles
				switch (overlay.type) {
					case 'none': break;
					case 'year': v[overlay.itemKey] = overlay.tf.EvalWithMetadb(handle).replace('0000', ''); break;
					default: {
						if (overlay.tf && !overlay.isCount) { v[overlay.itemKey] = overlay.tf.EvalWithMetadb(handle); }
						break;
					}
				}
				// Regorxxx ->
				if (!this.groupField && !panel.folderView && i % mod === 0) {
					this.getField(handle, panel.lines == 1 || ppt.albumArtFlipLabels ? v.grp : v.lot, fields);
				}
				// Regorxxx <- Branch collage art
				v.handleArr = [];
				v.keyArr = [];
				if (ppt.albumArtNodeCollage) {
					const ids = new Set();
					const handleArr = ppt.albumArtNodeCollage
						? pop.range(v.item).map((idx) => panel.list[idx])
						: [];
					v.handleArr = [];
					for (const handle of handleArr) {
						const tag = tfArtId
							? tfArtId.EvalWithMetadb(handle).split('|').filter((s) => !s.includes('^@^')).join('').trim() || ''
							: handle.Path.split('\\').at(-2) || '';
						if (tag && !ids.has(tag)) {
							ids.add(tag);
							v.handleArr.push(handle);
							v.keyArr.push(md5.hashStr(handle.Path + handle.SubSong + (panel.lines == 1 ? (arr[0] || 'Unknown') : ((arr[0] || 'Unknown') + ' - ' + (arr[1] || 'Unknown'))) + ppt.artId));
						}
						if (ids.size === 4) { break; }
					}
				}
				// Regorxxx ->
			} else if (panel.isBranchedPlaylistSource() && ppt.plsPopEmpty) {
				v.key = md5.hashStr('Dummy node' + (panel.lines == 1 ? (arr[0] || 'Unknown') : ((arr[0] || 'Unknown') + ' - ' + (arr[1] || 'Unknown'))) + ppt.artId);
				// Regorxxx <- New overlay styles | Date fallback
				switch (overlay.type) {
					case 'none': break;
					default: {
						if (overlay.tf && !overlay.isCount) { v[overlay.itemKey] = '   -   '; }
						break;
					}
				}
				// Regorxxx ->
				// Regorxxx <- Branch collage art
				v.handleArr = [];
				v.keyArr = [];
				// Regorxxx ->
			}
			// Regorxxx ->
			// Regorxxx <- Active/Playing/All playlist source | Multiple-playlist flat view
			if (!!pop.rootNode && panel.isBranchedPlaylistSource()) {
				for (const plsRootNode of lib.playlistSourceRoot) {
					if (plsRootNode.name === v.nm) { // Duplicated playlist names will share the same node
						plsRootNode.node = v;
						v.plsRoot = true;
					}
				}
			}
			// Regorxxx ->
		});

		if (!this.groupField && !panel.folderView) {
			this.groupField = this.getMostFrequentField(fields) || 'Item';
			this.groupField = $.titlecase(this.groupField);
		}

		if (ppt.rootNode) {
			if (!this.groupField) this.groupField = 'Item';
			const plurals = this.groupField.split(' ').map(v => pluralize(v));
			const pluralField = plurals.join(' ').replace(/(album|artist|top|track)s\s/gi, '$1 ').replace(/(similar artist)\s/gi, '$1s ').replace(/years - albums/gi, 'Year - Albums');
			pop.tree[0].key = pop.tree[0].name;
			const ln1 = pop.tree.length - 1;
			const ln2 = panel.list.Count;
			const nm = `${ppt.showSource ? panel.sourceName : 'All'} (` + ln1 + (ln1 > 1 ? ` ${pluralField}` : ` ${this.groupField}`) + ')';
			if (ppt.rootNode == 3) pop.tree[0].grp = nm;
			else if (panel.lines == 1) pop.tree[0].grp = panel.rootName + (ppt.nodeCounts ? ' (' + (ppt.nodeCounts == 2 && ppt.rootNode != 3 ? ln1 + (ln1 > 1 ? ` ${pluralField}` : ` ${this.groupField}`) : ln2 + (ln2 > 1 ? ' tracks' : ' track')) + ')' : '');
			if (panel.lines == 2) {
				if (ppt.rootNode != 3) pop.tree[0].grp = panel.rootName;
				pop.tree[0].lot = ppt.nodeCounts == 2 && ppt.rootNode != 3 ? ln1 + (ln1 > 1 ? ` ${pluralField}` : ` ${this.groupField}`) : ln2 + (ln2 > 1 ? ' tracks' : ' track');
			}
		}
		this.metrics();
		panel.treePaint();
	}

	memoryLimit() {
		if (!window.JsMemoryStats) { return void (0); }
		// Check that current memory usage is not over the limit
		const limit = ppt.memoryLimit
			? Math.min(ppt.memoryLimit * 1048576, window.JsMemoryStats.TotalMemoryLimit * 0.8)
			: window.JsMemoryStats.TotalMemoryLimit * 0.5;
		if (window.JsMemoryStats.TotalMemoryUsage > limit) { return true; }
		// Or make an estimation of memory usage for possible new images
		let totalImgSize = 0, maxImgSize = 0, currImgSize;
		Object.values(this.cache).forEach((cache) => {
			currImgSize = cache.img instanceof GdiBitmap ? cache.img.Width * cache.img.Height * 4 : 0;
			totalImgSize += currImgSize;
			maxImgSize = Math.max(maxImgSize, currImgSize);
		});
		return totalImgSize > limit * 0.65 || window.JsMemoryStats.MemoryUsage + maxImgSize * this.cachesize.min > limit;
	}

	metrics() {
		if (!ui.w || !ui.h) return;
		$.gr(1, 1, false, g => {
			const lineSpacing = this.labels.hide || this.labels.overlay ? Math.max(ppt.verticalAlbumArtPad - 2, 0) : ppt.verticalAlbumArtPad;
			this.letter.w = Math.round(g.CalcTextWidth('W', ui.font.main));
			this.text.h = Math.max(Math.round(g.CalcTextHeight('String', ui.font.group)) + lineSpacing, Math.round(g.CalcTextHeight('String', ui.font.lot)) + lineSpacing, 10);
		});
		// Regorxxx <- Code cleanup | Effect per art type | Image border setting
		const art = this.getArt(ppt.artId);
		this.style = {
			dropShadow: art.shadow && ppt.albumArtLabelType !== 3,
			dropShadowStub: art.shadow && ppt.albumArtLabelType !== 3 && (ppt.artId === 4 || ppt.curNoCoverImg > 2),
			image: this.getArtStyle(ppt.artId),
			rootComposite: ppt.rootNode && ppt.curRootImg === 3,
			vertical: ppt.albumArtFlowMode ? ui.h - panel.search.h > ui.w - ui.sbar.w : true,
			dropGrad: art.shadow && !this.dropShadow,
			dropGradStub: art.shadow && !this.dropShadowStub,
			fade: ppt.albumArtLabelType === 3
		};
		// Regorxxx ->

		this.letter.show = ppt.albumArtLetter;
		this.letter.no = ppt.albumArtLetterNo;
		this.letter.albumArtYearAuto = ppt.albumArtYearAuto;

		switch (this.style.vertical) {
			case true: {
				this.labels = {
					hide: !ppt.albumArtLabelType,
					bottom: ppt.albumArtLabelType === 1 || ppt.albumArtFlowMode && ppt.albumArtLabelType == 2,
					right: ppt.albumArtFlowMode ? false : ppt.albumArtLabelType === 2,
					overlay: ppt.albumArtLabelType === 3 || ppt.albumArtLabelType === 4,
					overlayDark: ppt.albumArtLabelType === 4,
					flip: ppt.albumArtFlipLabels,
					statistics: ppt.itemShowStatistics ? 1 : 0,
					fade: ppt.albumArtLabelType === 3
				};
				// Regorxxx <- Code cleanup | Effect per art type
				this.bor.pad = !this.labels.hide && !this.labels.overlay
					? ppt.thumbNailGapStnd == 0
						? Math.round(this.text.h * (this.labels.right ? 0.75 : 1.05) * (art.reflection || art.reflectionRoot ? 2.5 : 1))
						: ppt.thumbNailGapStnd - Math.round(2 * $.scale)
					: ppt.thumbNailGapCompact;
				// Regorxxx ->
				this.im.offset = Math.round(!this.labels.hide && !this.labels.overlay ? this.bor.pad / 2 : -2);
				if (this.labels.hide || this.labels.overlay) {
					this.panel.y = panel.search.h + Math.round(this.bor.pad / 2);
					this.bor.bot = 0;
					this.bor.side = 0;
					this.bor.cov = ppt.thumbNailGapCompact;
				} else {
					this.panel.y = panel.search.h;
					this.bor.cov = Math.round(this.bor.pad / 2);
					this.bor.side = Math.round(2 * $.scale);
					this.bor.bot = this.bor.side * 2;
				}
				this.bor.cov += ppt.thumbNailGapMod; // Regorxxx <- Extra gap settings ->
				const margin = ppt.margin;
				this.panel.x = (ppt.sbarShow == 2 ? margin : Math.max(margin, ui.sbar.w)) + ui.l.w;
				this.panel.w = ui.w - ui.l.w * 2 - (ui.sbar.type == 0 || ppt.sbarShow != 2 ? Math.max(margin, ui.sbar.w) * 2 : (margin * 2 + ui.sbar.w));
				this.panel.h = ui.h - this.panel.y;

				this.blockWidth = Math.round(ui.row.h * 4 * $.scale * ppt.zoomImg / 100 * [0.66, 1, 1.5, 2, 2.5, 3, 3.5, 5][ppt.thumbNailSize]);
				this.columns = ppt.albumArtFlowMode || this.labels.right ? 1 : Math.max(Math.floor(this.panel.w / this.blockWidth), 1);
				let gap = this.panel.w - this.columns * this.blockWidth;
				gap = Math.floor(gap / this.columns);
				this.columnWidth = this.labels.right ? $.clamp(this.blockWidth, 10, Math.min(this.panel.w, this.panel.h)) : $.clamp(this.blockWidth + gap, 10, Math.min(this.panel.w, this.panel.h));
				this.overlayHeight = this.labels.overlay ? (panel.lines == 2 ? Math.round(this.text.h * (2.1 + this.labels.statistics)) : this.text.h * (1.2 + this.labels.statistics)) : 0;
				this.im.w = Math.round(Math.max(this.columnWidth - this.bor.side * 2 - this.bor.cov * 2 - (this.labels.hide || this.labels.overlay ? 1 : 0), 10));

				if (this.labels.hide || this.labels.overlay) {
					this.im.w = Math.round(Math.max(this.columnWidth - this.bor.cov, 10));
					this.row.h = this.im.w + this.bor.cov;
				} else {
					this.im.w = Math.round(Math.max(this.columnWidth - this.bor.cov * 2 - this.bor.side * 2, 10));
					this.row.h = this.labels.right ? this.im.w + this.bor.pad + 2 : this.im.w + this.text.h * (panel.lines + this.labels.statistics) + this.bor.cov * 2 + this.bor.side * 2;
				}
				if (this.row.h > this.panel.h) {
					this.im.w -= this.row.h - this.panel.h;
					this.im.w = Math.max(this.im.w, 10);
					this.row.h = this.panel.h;
				}
				this.box.w = this.columnWidth - this.bor.side * 2;
				this.box.h = this.row.h - (this.labels.right ? 0 : this.bor.side * 2);
				panel.rows = Math.max(Math.floor(this.panel.h / this.row.h));
				sbar.metrics(sbar.x, sbar.y, sbar.w, sbar.h, panel.rows, this.row.h, this.style.vertical);
				sbar.setRows(Math.ceil(pop.tree.length / this.columns));
				break;
			}
			case false: { // only H-Flow
				this.labels = {
					hide: !ppt.albumArtLabelType,
					bottom: ppt.albumArtLabelType === 1 || ppt.albumArtLabelType === 2,
					right: false,
					overlay: ppt.albumArtLabelType === 3 || ppt.albumArtLabelType === 4,
					overlayDark: ppt.albumArtLabelType === 4,
					flip: ppt.albumArtFlipLabels,
					statistics: ppt.itemShowStatistics ? 1 : 0,
					fade: ppt.albumArtLabelType === 3
				};
				// Regorxxx <- Code cleanup | Effect per art type
				this.bor.pad = !this.labels.hide && !this.labels.overlay
					? ppt.thumbNailGapStnd == 0
						? Math.round(this.text.h * 1.05 * (art.reflection || art.reflectionRoot ? 2 : 1))
						: ppt.thumbNailGapStnd - Math.round(2 * $.scale)
					: ppt.thumbNailGapCompact;
				// Regorxxx ->
				this.im.offset = Math.round(!this.labels.hide && !this.labels.overlay ? this.bor.pad / 2 : -2);
				if (this.labels.hide || this.labels.overlay) {
					this.bor.bot = 0;
					this.bor.side = 0;
					this.bor.cov = ppt.thumbNailGapCompact;
				} else {
					this.bor.cov = Math.round(this.bor.pad / 2);
					this.bor.side = Math.round(2 * $.scale);
					this.bor.bot = this.bor.side * 2;
				}
				this.bor.cov += ppt.thumbNailGapMod; // Regorxxx <- Extra gap settings ->
				this.panel.x = 0;
				const spacer = this.letter.show ? (this.labels.bottom ? this.text.h * 0.5 - this.bor.pad / 4 : this.text.h * 0.75) : (this.labels.bottom ? 0 : Math.round(this.bor.pad / 2));
				this.panel.y = panel.search.h + spacer;
				this.panel.h = ui.h - this.panel.y - ui.l.w * 3 - spacer - ui.sbar.w;

				this.panel.w = ui.w;
				if (!this.labels.hide && !this.labels.overlay) {
					this.row.h = this.panel.h;
					const extra = this.text.h * (panel.lines + this.labels.statistics) + this.bor.cov * 2 + this.bor.side * 2;
					this.im.w = Math.min(this.panel.h - extra, this.panel.h - extra);
					this.im.w = $.clamp(this.im.w, 10, Math.round(this.panel.w - (this.bor.cov * 2 + this.bor.side * 2)));
					this.blockWidth = this.im.w + this.bor.cov * 2 + this.bor.side * 2;
					this.row.h = this.im.w + extra;
				} else {
					const extra = this.bor.cov;
					this.im.w = Math.min(this.panel.h - extra, this.panel.h - extra);
					this.im.w = $.clamp(this.im.w, 10, Math.round(this.panel.w - this.bor.cov));
					this.blockWidth = this.im.w + this.bor.cov;
					this.row.h = this.im.w + extra;
				}
				this.columns = Math.max(Math.floor(this.panel.w / this.blockWidth), 1);
				this.overlayHeight = this.labels.overlay ? (panel.lines == 2 ? Math.round(this.text.h * (2.1 + this.labels.statistics)) : this.text.h * (1.2 + this.labels.statistics)) : 0;
				this.box.w = this.blockWidth - this.bor.side * 2;
				this.box.h = this.row.h - this.bor.bot;
				panel.rows = Math.max(Math.floor(this.panel.w / this.blockWidth));
				this.columnWidth = this.blockWidth;

				sbar.metrics(sbar.x, sbar.y, ui.w, ui.sbar.w, panel.rows, this.blockWidth, this.style.vertical);
				sbar.setRows(Math.ceil(pop.tree.length));
				break;
			}
		}

		this.cellWidth = Math.max(200, this.im.w / 2);
		this.labels.counts = !this.getOverlay(ppt.itemOverlayType).isCount && ppt.nodeCounts;
		this.style.y = this.style.vertical ? Math.floor(this.panel.y + (!this.labels.hide && !this.labels.overlay ? ppt.thumbNailGapStnd / 2 : ppt.thumbNailGapCompact / 2)) : this.panel.y;
		if (this.style.dropShadow) { this.getShadow(this.getStyle(this.style.image)); }

		if (!this.labels.hide) {
			if (this.labels.overlay) {
				this.text.x = Math.round(10 + (ppt.thumbNailGapCompact - 3) / 2);
				this.text.y1 = Math.round(this.im.w - this.overlayHeight + 2 + (this.overlayHeight - this.text.h * (panel.lines + this.labels.statistics)) / 2);
				this.text.w = this.box.w - 20 - ppt.thumbNailGapCompact - 6;
			} else {
				this.text.x = this.labels.right ? Math.max(Math.round((this.box.w - this.im.w) / 2), 5 * $.scale) * 2 + this.im.w : Math.round((this.box.w - this.im.w) / 2);
				this.text.y1 = this.labels.right ? Math.round((this.im.w - this.text.h * panel.lines) / 2) - (this.labels.statistics ? this.text.h / 2 : 0) : this.im.w + Math.round(this.bor.cov * 0.5);
				this.text.y2 = this.labels.right ? this.text.y1 + this.text.h : Math.round(this.text.y1 + this.text.h * 0.95);
				this.text.y3 = this.labels.right ? this.text.y2 + this.text.h : Math.round(this.text.y2 + this.text.h * 0.95);
				this.text.w = this.labels.right ? this.panel.w - this.text.x - 12 : this.im.w;
			}
		}

		this.cachesize.min = panel.rows * this.columns * 3 + (this.albumArtDiskCache ? panel.rows * 2 : panel.rows) * this.columns * 2;
		this.createMasks(); // Regorxxx <- Code Cleanup ->
		this.getCurrentDatabase();
		if (ppt.albumArtPreLoad && !this.zooming && this.albumArtDiskCache) this.getItemsToDraw(true);
		this.setNoArtist();
		this.setNoCover();
		this.setRoot();
		if (this.style.rootComposite) this.checkRootImg();
		const stub = ppt.artId == 4 ? this.no_artist_img : this.no_cover_img;
		if (stub) this.stub.noImg = this.format(stub, art, this.getStyle(this.style.image, true), this.im.w, this.im.w, this.labels.fade, 'noImg');
		// Regorxxx <- Fix img frame for root images (hover effect)
		this.stub.root = this.root_img
			? this.format(this.root_img, art, this.getStyleByType('default'), this.im.w, this.im.w, this.labels.fade, 'root')
			: null;
		this.createImages();
		// Regorxxx ->
		panel.treePaint();
	}

	// Regorxxx <- Code cleanup | New img styles
	needTrim(bForce, ratio) {
		return bForce || Math.abs(ratio - 1) >= 0.05;
	}
	// Regorxxx ->

	newDatabase() {
		return {
			'-----------group key------------': '-----------image key------------.ext' // Regorxxx <- Allow images with transparencies ->
		};
	}

	on_key_down() {
		this.zooming = vk.k('zoom');
		if (this.zooming) {
			clearInterval(this.timer.preLoad);
			this.timer.preLoad = null;
		}
	}

	on_key_up() {
		if (this.zooming && this.zooming != vk.k('zoom')) {
			this.zooming = false;
			if (ppt.albumArtPreLoad && this.albumArtDiskCache && panel.imgView) this.metrics();
			panel.treePaint();
		}
	}

	preLoad() {
		if (!panel.imgView) return;
		this.preLoadItems = [];
		let begin = this.start == 0 ? ppt.rootNode ? 1 : 0 : this.start;
		let end = this.end == 0 ? this.end : Math.min(this.end + this.columns, pop.tree.length);
		for (let i = begin; i < end; i++) {
			const v = this.getItem(i);
			if (v) {
				const key = v.key;
				if (!this.cache[key]) {
					this.cache[key] = {
						img: 'called',
						accessed: ++this.accessed
					};
					this.load_image_async(key, this.cacheFolder + this.database[key], v.ix, true);
				}
			}
		}

		const upBegin = this.start == 0 ? ppt.rootNode ? 1 : 0 : this.start - 1;
		const upEnd = ppt.rootNode ? 1 : 0;
		const downBegin = this.end == 0 ? this.end : Math.min(this.end + 1 + this.columns, pop.tree.length);
		const downEnd = pop.tree.length;

		const doPreload = () => {
			clearInterval(this.timer.preLoad);
			this.timer.preLoad = null;
			let i = downBegin;
			let j = upBegin;
			if (i < downEnd || j > upEnd) this.timer.preLoad = setInterval(() => {
				let v = null;
				if (i < downEnd || j > upEnd) { // interleave
					if (i < downEnd) v = this.getItem(i++);
					if (v) {
						const key = v.key;
						if (!this.cache[key]) {
							this.cache[key] = {
								img: 'called',
								accessed: 0
							};
							this.load_image_async(key, this.cacheFolder + this.database[key], v.ix, true);
						}
					}

					if (j > upEnd) v = this.getItem(j--);
					if (v) {
						const key = v.key;
						if (!this.cache[key]) {
							this.cache[key] = {
								img: 'called',
								accessed: 0
							};
							this.load_image_async(key, this.cacheFolder + this.database[key], v.ix, true);
						}
					}
				} else {
					clearInterval(this.timer.preLoad);
					this.timer.preLoad = null;
				}
			}, this.interval.preLoad);
		};

		doPreload();
	}

	refresh(items) {
		let itemsToRemove = [];
		if (items === 'all') {
			if (!ppt.albumArtDiskCache) return;
			const continue_confirmation = (status, confirmed) => {
				if (confirmed) {
					// Regorxxx <- Bypass admin permissions to delete cache | Delete only current view cache
					this.clearCache();
					_deleteFolder(this.cacheFolder);
					// Regorxxx ->
				}
			};
			const caption = 'Reset All Images';
			const prompt = 'This action resets the library tree thumbnail disk cache\n\nContinue?';
			const wsh = !utils.MessageBox && popUpBox.isHtmlDialogSupported() // Regorxxx <- Native themed popups ->
				? popUpBox.confirm(caption, prompt, 'Yes', 'No', '', '', continue_confirmation)
				: true;
			if (wsh) { continue_confirmation('ok', WshShell.Popup(prompt, 0, caption, popup.ok_cancel) === popup.okr); } // Regorxxx <- Native themed popups | Code cleanup ->
			return;
		}

		const allSelected = pop.sel_items.length == fb.GetLibraryItems().Count;
		const base = this.getArtCachePath(ppt.artId, panel.folderView); // Regorxxx <- Code cleanup ->
		const databases = [base + '\\database.dat', base + '500\\database.dat', base + '750\\database.dat'];
		if (allSelected) {
			this.clearCache(); // full clear of working cache
			if (!ppt.albumArtDiskCache) return;
			this.database = this.newDatabase(); // full clear of databases for current image type
			databases.forEach(v => {
				if ($.file(v)) $.save(v, JSON.stringify(this.newDatabase(), null, 3), true);
			});
			return;
		}

		// refresh selected images
		items.Convert().forEach(v => {
			const item = panel.list.Find(v);
			let ind = -1;
			pop.tree.forEach((v, j) => {
				if (!v.root && pop.inRange(item, v.item)) ind = j;
			});
			if (ind != -1) itemsToRemove.push(pop.tree[ind].key);
		});
		itemsToRemove = [...new Set(itemsToRemove)];
		itemsToRemove.forEach(v => this.trimCache(v)); // clear working cache of selected keys: won't check if same images are used with other keys
		if (!ppt.albumArtDiskCache) return;
		let imgsToRemove = itemsToRemove.map(v => this.database[v]);
		imgsToRemove = [...new Set(imgsToRemove)];
		databases.forEach(v => {
			if ($.file(v)) {
				const cur_db = v == this.cacheFolder + 'database.dat';
				const imgDatabase = $.jsonParse(v, this.newDatabase(), 'file');
				Object.entries(imgDatabase).forEach(w => { // clear working cache & database of all keys that reference a particular image: this should always work even if images in use
					if (w[0] != '-----------group key------------') {
						if (imgsToRemove.includes(w[1]) || !$.file(this.cacheFolder + w[1])) { // images are refreshed as loaded, overwriting existing
							if (cur_db) this.trimCache(w[0]);
							delete imgDatabase[w[0]];
						}
					}
				});
				Object.entries(imgDatabase).forEach(w => {
					if (w[0] != '-----------group key------------') {
						if (w[1] != 'noAlbumArt' && !$.file(this.cacheFolder + w[1])) delete imgDatabase[w[0]];
					}
				}); // remove any user deleted images from database
				$.save(v, JSON.stringify(imgDatabase, null, 3), true);
			}
		});
		this.getCurrentDatabase();
	}

	setNoArtist() {
		this.artist_images = $.getImageAssets('noArtist').sort();
		ppt.curNoArtistImg = $.clamp($.value(ppt.curNoArtistImg, 0, 0), 0, this.artist_images.length - 1);
		const artistImages = this.artist_images.map(v => ({
			name: utils.SplitFilePath(v)[1],
			path: v.replace('noArtist', 'noArtist/small').replace(folders.xxx, './')
		}));
		this.no_artist_img = gdi.Image(this.artist_images[ppt.curNoArtistImg]);
		ppt.noArtistImages = JSON.stringify(artistImages);
	}

	setNoCover() {
		this.cover_images = $.getImageAssets('noCover').sort();
		ppt.curNoCoverImg = $.clamp($.value(ppt.curNoCoverImg, 0, 0), 0, this.cover_images.length - 1);
		const coverImages = this.cover_images.map(v => ({
			name: utils.SplitFilePath(v)[1],
			path: v.replace('noCover', 'noCover/small').replace(folders.xxx, './')
		}));
		this.no_cover_img = gdi.Image(this.cover_images[ppt.curNoCoverImg]);
		ppt.noCoverImages = JSON.stringify(coverImages);
	}

	setRoot() {
		this.root_images = $.getImageAssets('root').sort();
		ppt.curRootImg = $.clamp($.value(ppt.curRootImg, 0, 0), 0, this.root_images.length - 1);
		const rootImages = this.root_images.map(v => ({
			name: utils.SplitFilePath(v)[1],
			path: v.replace('root', 'root/small').replace(folders.xxx, './')
		}));
		if (ppt.rootNode && ppt.curRootImg == 3) {
			this.style.rootComposite = true;
			this.root_img = null;
		} else {
			this.style.rootComposite = false;
			this.root_img = gdi.Image(this.root_images[ppt.curRootImg]);
		}
		ppt.rootImages = JSON.stringify(rootImages);
	}

	sort(data, prop) {
		data.sort((a, b) => a[prop] - b[prop]);
		return data;
	}

	sortCache(o, prop) {
		const sorted = {};
		Object.keys(o).sort((a, b) => o[a][prop] - o[b][prop]).forEach(key => sorted[key] = o[key]);
		return sorted;
	}

	trimCache(key) {
		delete this.cache[key];
	}
}
const img = new Images;