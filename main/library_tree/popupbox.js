'use strict';
//24/03/26

/* global ppt:readable, $:readable, WshShell:readable, doc:readable */
/* global folders:readable */

/* exported PopUpBox */

class PopUpBox {
	constructor() {
		this.getHtmlCode();
		this.ok = true;
		this.soFeat = { clipboard: true, gecko: true };
	}

	// Methods

	config(cfg, ppt, cfgWindow, ok_callback) {
		const playlistIds = JSON.stringify($.range(0, plman.PlaylistCount, 1).map((idx) => { return { name: plman.GetPlaylistName(idx), guid: plman.GetGUID(idx) }; })); // Regorxxx <- Preset rules ->
		utils.ShowHtmlDialog(0, this.configHtmlCode, {
			data: [cfg, ppt, cfgWindow, ok_callback, void (0), folders.xxx + 'assets\\library_tree\\html', playlistIds], // Regorxxx <- Root path | Preset rules ->
			resizable: true
		});
	}

	confirm(msg_title, msg_content, btn_yes_label, btn_no_label, height_adjust, h_center, confirm_callback) {
		utils.ShowHtmlDialog(0, this.confirmHtmlCode, {
			data: [msg_title, msg_content, btn_yes_label, btn_no_label, height_adjust, h_center, confirm_callback]
		});
	}

	getHtmlCode() {
		let cssPath = folders.xxx + '/assets/library_tree/html/'; // Regorxxx <- change file structure ->
		if (this.getWindowsVersion() === '6.1') {
			cssPath += 'styles7.css';
		} else {
			cssPath += 'styles10.css';
		}
		this.configHtmlCode = $.getAsset('\\html\\config.html').replace(/href="styles10.css"/i, `href="${cssPath}"`);
		this.inputHtmlCode = $.getAsset('\\html\\input.html').replace(/href="styles10.css"/i, `href="${cssPath}"`);
		this.messageHtmlCode = $.getAsset('\\html\\messageBox.html').replace(/href="styles10.css"/i, `href="${cssPath}"`);
		this.confirmHtmlCode = $.getAsset('\\html\\confirm.html').replace(/href="styles10.css"/i, `href="${cssPath}"`);
	}

	getWindowsVersion() {
		let version = '';
		try {
			version = (WshShell.RegRead('HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\CurrentMajorVersionNumber')).toString();
			version += '.';
			version += (WshShell.RegRead('HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\CurrentMinorVersionNumber')).toString();
			return version;
		} catch (e) { /* empty */ } // eslint-disable-line no-unused-vars
		try {
			version = WshShell.RegRead('HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\CurrentVersion');
			return version;
		} catch (e) { /* empty */ } // eslint-disable-line no-unused-vars
		return '6.1';
	}

	input(title, msg, ok_callback, input, def) {
		utils.ShowHtmlDialog(0, this.inputHtmlCode, {
			data: [title, msg, 'Cancel', ok_callback, input, def]
		});
	}

	isHtmlDialogSupported() {
		if (ppt.isHtmlDialogSupported != 2) return ppt.isHtmlDialogSupported;

		if (typeof doc === 'undefined' || !doc) {
			this.soFeat.gecko = false;
		}
		if (this.soFeat.gecko) {
			let cache = null;
			let clText = 'test';
			try {
				cache = doc.parentWindow.clipboardData.getData('Text');
			} catch (e) { /* empty */ } // eslint-disable-line no-unused-vars
			try {
				doc.parentWindow.clipboardData.setData('Text', clText);
				clText = doc.parentWindow.clipboardData.getData('Text');
			} catch (e) { // eslint-disable-line no-unused-vars
				this.soFeat.clipboard = false;
			}
			if (cache) { // Just in case previous clipboard data is needed
				try {
					doc.parentWindow.clipboardData.setData('Text', cache);
				} catch (e) { /* empty */ } // eslint-disable-line no-unused-vars
			}
			if (clText !== 'test') {
				this.soFeat.clipboard = false;
			}
		} else {
			this.soFeat.clipboard = false;
		}

		ppt.isHtmlDialogSupported = this.soFeat.gecko && this.soFeat.clipboard || this.isIEInstalled() ? 1 : 0;
		if (!ppt.isHtmlDialogSupported) {
			const caption = 'Show HTML Dialog';
			const prompt = 'A feature check indicates that Spider Monkey Panel show html dialog isn\'t supported by the current operating system.\n\nThis is used to display options. The console will show alternatives on closing this dialog.\n\nOccassionally, the feature check may give the wrong answer.\n\nIf you\'re using windows and have Internet Explorer support it should work, so enter 1 and press OK.\n\nThe setting is saved in panel properties as the first item and can be changed there later.\n\nSupported-1; unsupported-0';
			let ns = '';
			let status = 'ok';
			try {
				ns = utils.InputBox(0, prompt, caption, ppt.isHtmlDialogSupported, true);
			} catch (e) { // eslint-disable-line no-unused-vars
				status = 'cancel';
			}
			if (status != 'cancel') {
				ppt.isHtmlDialogSupported = ns == 0 ? 0 : 1;
			}
		}
		return ppt.isHtmlDialogSupported;
	}

	isIEInstalled() {
		const diskLetters = Array.from(Array(26)).map((e, i) => i + 65).map((x) => `${String.fromCharCode(x)}:\\`);
		const paths = ['Program Files\\Internet Explorer\\ieinstal.exe', 'Program Files (x86)\\Internet Explorer\\ieinstal.exe'];
		return diskLetters.some(d => {
			try { // Needed when permission error occurs and current SMP implementation is broken for some devices....
				return utils.IsDirectory(d) ? paths.some(p => utils.IsFile(d + p)) : false;
			} catch (e) { return false; } // eslint-disable-line no-unused-vars
		});
	}

	message() {
		utils.ShowHtmlDialog(0, this.messageHtmlCode, {
			data: [this.window_ok_callback, $.scale],
			selection: true
		});
	}

	window_ok_callback(status, clicked) {
		if (clicked) ppt.panelSourceMsg = false;
	}
}