'use strict';
//01/03/26

/* exported Language */

// Helpers for language handling
const Language = Object.freeze({
	// Data validation
	data: Object.seal({ lastOutput: null, lastInput: null }),
	helpers: Object.freeze({
		greek: Object.freeze(
			{
				table: Object.freeze(
					{ 'Α': 'A', 'Χ': 'C', 'Δ': 'D', 'Ε': 'E', 'Φ': 'F', 'Γ': 'G', 'Η': 'h', 'Ι': 'I', 'Κ': 'K', 'Λ': 'L', 'Μ': 'M', 'Ν': 'N', 'Ο': 'O', 'Ω': 'o', 'Π': 'P', 'Ρ': 'R', 'Σ': 'S', 'Τ': 'T', 'Υ': 'U', 'Ξ': 'X', 'Ζ': 'Z', 'α': 'a', 'β': 'b', 'χ': 'c', 'δ': 'd', 'ε': 'e', 'φ': 'f', 'γ': 'g', 'η': 'h', 'ι': 'i', 'κ': 'k', 'λ': 'l', 'μ': 'm', 'ν': 'n', 'ο': 'o', 'ω': 'o', 'π': 'p', 'ρ': 'r', 'σ': 's', 'τ': 't', 'θ': 't', 'υ': 'u', 'ξ': 'x', 'ζ': 'z' }
				)
			}
		),
		russian: Object.freeze(
			{
				table: Object.freeze(
					{ 'Ё': 'YO', 'Й': 'I', 'Ц': 'TS', 'У': 'U', 'К': 'K', 'Е': 'E', 'Н': 'N', 'Г': 'G', 'Ш': 'SH', 'Щ': 'SCH', 'З': 'Z', 'Х': 'H', 'Ъ': '\'', 'ё': 'yo', 'й': 'i', 'ц': 'ts', 'у': 'u', 'к': 'k', 'е': 'e', 'н': 'n', 'г': 'g', 'ш': 'sh', 'щ': 'sch', 'з': 'z', 'х': 'h', 'ъ': '\'', 'Ф': 'F', 'Ы': 'I', 'В': 'V', 'А': 'A', 'П': 'P', 'Р': 'R', 'О': 'O', 'Л': 'L', 'Д': 'D', 'Ж': 'ZH', 'Э': 'E', 'ф': 'f', 'ы': 'i', 'в': 'v', 'а': 'a', 'п': 'p', 'р': 'r', 'о': 'o', 'л': 'l', 'д': 'd', 'ж': 'zh', 'э': 'e', 'Я': 'Ya', 'Ч': 'CH', 'С': 'S', 'М': 'M', 'И': 'I', 'Т': 'T', 'Ь': '\'', 'Б': 'B', 'Ю': 'YU', 'я': 'ya', 'ч': 'ch', 'с': 's', 'м': 'm', 'и': 'i', 'т': 't', 'ь': '\'', 'б': 'b', 'ю': 'yu' }
				)
			}
		),
		japanese: Object.freeze(
			{
				table: Object.freeze(
					{ 'あ': 'a', 'い': 'i', 'う': 'u', 'え': 'e', 'お': 'o', 'か': 'ka', 'き': 'ki', 'く': 'ku', 'け': 'ke', 'こ': 'ko', 'さ': 'sa', 'し': 'si', 'す': 'su', 'せ': 'se', 'そ': 'so', 'た': 'ta', 'ち': 'ti', 'つ': 'tu', 'て': 'te', 'と': 'to', 'な': 'na', 'に': 'ni', 'ぬ': 'nu', 'ね': 'ne', 'の': 'no', 'は': 'ha', 'ひ': 'hi', 'ふ': 'hu', 'へ': 'he', 'ほ': 'ho', 'ま': 'ma', 'み': 'mi', 'む': 'mu', 'め': 'me', 'も': 'mo', 'や': 'ya', 'ゆ': 'yu', 'よ': 'yo', 'ら': 'ra', 'り': 'ri', 'る': 'ru', 'れ': 're', 'ろ': 'ro', 'わ': 'wa', 'ゐ': 'wi', 'ゑ': 'we', 'を': 'wo', 'ん': 'n', 'が': 'ga', 'ぎ': 'gi', 'ぐ': 'gu', 'げ': 'ge', 'ご': 'go', 'ざ': 'za', 'じ': 'zi', 'ず': 'zu', 'ぜ': 'ze', 'ぞ': 'zo', 'だ': 'da', 'ぢ': 'di', 'づ': 'du', 'で': 'de', 'ど': 'do', 'ば': 'ba', 'び': 'bi', 'ぶ': 'bu', 'べ': 'be', 'ぼ': 'bo', 'ゔ': 'vu', 'ぱ': 'pa', 'ぴ': 'pi', 'ぷ': 'pu', 'ぺ': 'pe', 'ぽ': 'po', 'きゃ': 'kya', 'きゅ': 'kyu', 'きぇ': 'kye', 'きょ': 'kyo', 'しゃ': 'sya', 'しゅ': 'syu', 'しぇ': 'sye', 'しょ': 'syo', 'ちゃ': 'tya', 'ちゅ': 'tyu', 'ちぇ': 'tye', 'ちょ': 'tyo', 'にゃ': 'nya', 'にゅ': 'nyu', 'にぇ': 'nye', 'にょ': 'nyo', 'ひゃ': 'hya', 'ひゅ': 'hyu', 'ひぇ': 'hye', 'ひょ': 'hyo', 'みゃ': 'mya', 'みゅ': 'my', 'みぇ': 'mye', 'みょ': 'myo', 'りゃ': 'rya', 'りゅ': 'ryu', 'りぇ': 'rye', 'りょ': 'ryo', 'ぎゃ': 'gya', 'ぎゅ': 'gyu', 'ぎぇ': 'gye', 'ぎょ': 'gyo', 'じゃ': 'zya', 'じゅ': 'zyu', 'じぇ': 'zye', 'じょ': 'zyo', 'ぢゃ': 'dya', 'ぢゅ': 'dyu', 'ぢぇ': 'dye', 'ぢょ': 'dyo', 'びゃ': 'bya', 'びゅ': 'byu', 'びぇ': 'bye', 'びょ': 'byo', 'ゔぁ': 'va', 'ゔぃ': 'vi', 'ゔぇ': 've', 'ゔぉ': 'vo', 'ぴゃ': 'pya', 'ぴゅ': 'pyu', 'ぴぇ': 'pye', 'ぴょ': 'pyo', 'いぃ': 'yi', 'いぇ': 'ye', 'うぁ': 'wa', 'うぃ': 'wi', 'うぅ': 'wu', 'うぇ': 'we', 'うぉ': 'wo', 'うゅ': 'wyu', 'ゔゃ': 'vya', 'ゔゅ': 'vyu', 'ゔょ': 'vyo', 'くぁ': 'kwa', 'くぃ': 'kwi', 'くぅ': 'kwu', 'くぇ': 'kwe', 'くぉ': 'kwo', 'くゎ': 'kwa', 'ぐぁ': 'gwa', 'ぐぃ': 'gwi', 'ぐぅ': 'gwu', 'ぐぇ': 'gwe', 'ぐぉ': 'gwo', 'ぐゎ': 'gwa', 'すぃ': 'si', 'ずぃ': 'zi', 'つぁ': 'tua', 'つぃ': 'tui', 'つぇ': 'tue', 'つぉ': 'tuo', 'つゅ': 'tuyu', 'づぁ': 'dua', 'づぃ': 'dui', 'づぇ': 'due', 'づぉ': 'duo', 'てゃ': 'tea', 'てぃ': 'tei', 'てゅ': 'teu', 'てぇ': 'tee', 'てょ': 'teo', 'とぅ': 'tou', 'でゃ': 'dea', 'でぃ': 'dei', 'でゅ': 'deu', 'でぇ': 'dee', 'でょ': 'deo', 'どぅ': 'dou', 'ふぁ': 'hua', 'ふぃ': 'hui', 'ふぇ': 'hue', 'ふぉ': 'huo', 'ふゃ': 'huya', 'ふゅ': 'huyu', 'ふょ': 'huyo', 'ほぅ': 'hu', 'ら゚': 'la', 'り゚': 'li', 'る゚': 'lu', 'れ゚': 'le', 'ろ゚': 'lo', 'わ゙': 'va', 'ゐ゙': 'vi', 'ゑ゙': 've', 'を゙': 'vo', 'ぁ': 'a', 'ぃ': 'i', 'ぅ': 'u', 'ぇ': 'e', 'ぉ': 'o', 'ゃ': 'ya', 'ゅ': 'yu', 'ょ': 'yo', 'っ': 'tu', 'ゎ': 'wa', 'ヵ': 'ka', 'ヶ': 'ke' }
				),
				punctuation: Object.freeze(
					{ '。': '.', '、': ',', '・': '-', '－': '-', '「': '“', '」': '”', '（': '(', '）': ')', '　': ' ', ' ': ' ' }
				),
				specialHiraganization: Object.freeze(
					{ 'ヿ': 'こと', '𪜈': 'とも', '𪜈゙': 'ども', 'ヷ': 'わ゙', 'ヸ': 'ゐ゙', 'ヹ': 'ゑ゙', 'ヺ': 'を゙', '𛀀': 'え', 'ㇰ': 'く', 'ㇱ': 'し', 'ㇲ': 'す', 'ㇳ': 'と', 'ㇴ': 'ぬ', 'ㇵ': 'は', 'ㇶ': 'ひ', 'ㇷ': 'ふ', 'ㇸ': 'へ', 'ㇹ': 'ほ', 'ㇺ': 'む', 'ㇻ': 'ら', 'ㇼ': 'り', 'ㇽ': 'る', 'ㇾ': 'れ', 'ㇿ': 'ろ' }
				),
				katakanaRe: new RegExp('(' + '[' + '\\u30a1-\\u30f4' + // ァ～ヴ
					'\\u30f7-\\u30fa' + // ヷ～ヺ
					'\\u30fd-\\u30ff' + // ヽ～ヿ
					'\\u31f0-\\u31ff' + // ㇰ～ㇿ
					']' + '|' + '\\ud869\\udf08\\u3099' + // 𪜈゙
					'|' + '\\ud869\\udf08' + // 𪜈
					'|' + '\\ud82c\\udc00' + // 𛀀
					')', 'g'),
				romanizationConfigs: Object.freeze({
					default: Object.freeze({ 'し': 'shi', 'ち': 'chi', 'つ': 'tsu', 'ふ': 'fu', 'じ': 'ji', 'ぢ': 'ji', 'づ': 'zu', 'ああ': 'aa', 'いい': 'ii', 'うう': 'ū', 'ええ': 'ee', 'おお': 'ō', 'あー': 'ā', 'えい': 'ei', 'おう': 'ō', 'んあ': 'n\'a', 'んば': 'nba', 'っち': 'tchi', 'ゐ': 'i', 'を': 'o', punctuation: true }),
					'traditional hepburn': Object.freeze({ 'を': 'wo', 'んあ': 'n-a', 'んば': 'mba' }),
					'modified hepburn': Object.freeze({ 'ああ': 'ā', 'いい': 'ii', 'うう': 'ū', 'ええ': 'ē', 'おお': 'ō' }),
					kunrei: Object.freeze({ 'し': 'si', 'ち': 'ti', 'つ': 'tu', 'ふ': 'hu', 'じ': 'zi', 'ぢ': 'zi', 'づ': 'zu', 'ああ': 'â', 'いい': 'î', 'うう': 'û', 'ええ': 'ê', 'おお': 'ô', 'あー': 'â', 'おう': 'ô', 'っち': 'tti' }),
					nihon: Object.freeze({ 'し': 'si', 'ち': 'ti', 'つ': 'tu', 'ふ': 'hu', 'じ': 'zi', 'ぢ': 'di', 'づ': 'du', 'ああ': 'ā', 'いい': 'ī', 'うう': 'ū', 'ええ': 'ē', 'おお': 'ō', 'あー': 'ā', 'おう': 'ō', 'っち': 'tti', 'ゐ': 'wi', 'を': 'wo' }),
				}),
				hiraganize: function (string) {
					return string.replace(this.katakanaRe, function (katakana) {
						if (katakana.match(/^[\u30a1-\u30f4\u30fd\u30fe]$/)) {
							return String.fromCharCode(katakana.charCodeAt(0) - 'ァ'.charCodeAt(0) + 'ぁ'.charCodeAt(0));
						} else if (this.specialHiraganization[katakana]) {
							return this.specialHiraganization[katakana];
						}
					});
				},
				applyConfigs: function (table, config) {
					const merge = (target, source) => { for (let key in source) { target[key] = source[key]; } };
					if (config['し'] === 'shi') {
						merge(table, { 'し': 'shi', 'しゃ': 'sha', 'しゅ': 'shu', 'しぇ': 'she', 'しょ': 'sho' });
					}
					if (config['ち'] === 'chi') {
						merge(table, {
							'ち': 'chi', 'ちゃ': 'cha', 'ちゅ': 'chu', 'ちぇ': 'che', 'ちょ': 'cho', 'てぃ': 'ti', 'てゅ': 'tyu',
						});
					}
					if (config['つ'] === 'tsu') {
						merge(table, {
							'つ': 'tsu', 'つぁ': 'tsa', 'つぃ': 'tsi', 'つぇ': 'tse', 'つぉ': 'tso', 'つゅ': 'tsyu', 'とぅ': 'tu',
						});
					}
					if (config['ふ'] === 'fu') {
						merge(table, {
							'ふ': 'fu', 'ふぁ': 'fa', 'ふぃ': 'fi', 'ふぇ': 'fe', 'ふぉ': 'fo', 'ふゃ': 'fya', 'ふゅ': 'fyu', 'ふょ': 'fyo',
						});
					}
					if (config['じ'] === 'ji') {
						merge(table, {
							'じ': 'ji', 'じゃ': 'ja', 'じゅ': 'ju', 'じぇ': 'je', 'じょ': 'jo',
						});
					}
					if (config['ぢ'] === 'ji') {
						merge(table, {
							'ぢ': 'ji', 'ぢゃ': 'ja', 'ぢゅ': 'ju', 'ぢぇ': 'je', 'ぢょ': 'jo', 'でぃ': 'di', 'でゅ': 'dyu',
						});
					}
					if (config['ぢ'] === 'zi') {
						merge(table, {
							'ぢ': 'zi', 'ぢゃ': 'zya', 'ぢゅ': 'zyu', 'ぢぇ': 'zye', 'ぢょ': 'zyo', 'でぃ': 'di', 'でゅ': 'dyu',
						});
					}
					if (config['ぢ'] === 'dji') {
						merge(table, {
							'ぢ': 'dji', 'ぢゃ': 'dja', 'ぢゅ': 'dju', 'ぢぇ': 'dje', 'ぢょ': 'djo', 'でぃ': 'di', 'でゅ': 'dyu',
						});
					}
					if (config['ぢ'] === 'dzi') {
						merge(table, {
							'ぢ': 'dzi', 'ぢゃ': 'dzya', 'ぢゅ': 'dzyu', 'ぢぇ': 'dzye', 'ぢょ': 'dzyo', 'でぃ': 'di', 'でゅ': 'dyu',
						});
					}
					if (config['づ'] === 'zu') {
						merge(table, {
							'づ': 'zu', 'づぁ': 'zua', 'づぃ': 'zui', 'づぇ': 'zue', 'づぉ': 'zuo', 'どぅ': 'du',
						});
					}
					if (config['づ'] === 'dsu') {
						merge(table, {
							'づ': 'dsu', 'づぁ': 'dsua', 'づぃ': 'dsui', 'づぇ': 'dsue', 'づぉ': 'dsuo', 'どぅ': 'du',
						});
					}
					if (config['づ'] === 'dzu') {
						merge(table, {
							'づ': 'dzu', 'づぁ': 'dzua', 'づぃ': 'dzui', 'づぇ': 'dzue', 'づぉ': 'dzuo', 'どぅ': 'du',
						});
					}
					if (config['ゐ'] === 'i') {
						merge(table, {
							'ゐ': 'i', 'ゑ': 'e',
						});
					}
					if (config['を'] === 'o') {
						merge(table, {
							'を': 'o',
						});
					}
					return table;
				}
			}
		),
		chinese: Object.freeze(
			{
				internals: {
					supported: null,
					collator: void (0),
					latin: 1,
					pinyin: 2,
					unknown: 3,
					firstPinyinUnihan: '\u963F',
					lastPinyinUnihan: '\u9FFF'
				},
				table: Object.freeze(
					{
						unihans: [
							'\u963f', '\u54ce', '\u5b89', '\u80ae', '\u51f9', '\u516b',
							'\u6300', '\u6273', '\u90a6', '\u52f9', '\u9642', '\u5954',
							'\u4f3b', '\u5c44', '\u8fb9', '\u706c', '\u618b', '\u6c43',
							'\u51ab', '\u7676', '\u5cec', '\u5693', '\u5072', '\u53c2',
							'\u4ed3', '\u64a1', '\u518a', '\u5d7e', '\u66fd',
							'\u53c9', '\u8286', '\u8fbf', '\u4f25', '\u6284',
							'\u8f66', '\u62bb', '\u9637', '\u5403',
							'\u5145', '\u62bd', '\u51fa', '\u6b3b', '\u63e3', '\u5ddb',
							'\u5205', '\u5439', '\u65fe', '\u9034', '\u5472', '\u5306',
							'\u51d1', '\u7c97', '\u6c46', '\u5d14', '\u90a8', '\u6413',
							'\u5491', '\u5446', '\u4e39', '\u5f53', '\u5200', '\u561a',
							'\u6265', '\u706f', '\u6c10', '\u7538', '\u5201',
							'\u7239', '\u4e01', '\u4e1f', '\u4e1c', '\u543a', '\u53be',
							'\u8011', '\u5796', '\u5428', '\u591a', '\u59b8', '\u8bf6',
							'\u5940', '\u97a5', '\u513f', '\u53d1', '\u5e06', '\u531a',
							'\u98de', '\u5206', '\u4e30', '\u8985', '\u4ecf', '\u7d11',
							'\u592b', '\u65ee', '\u4f85', '\u7518', '\u5188', '\u768b',
							'\u6208', '\u7ed9', '\u6839', '\u522f', '\u5de5', '\u52fe',
							'\u4f30', '\u74dc', '\u4e56', '\u5173', '\u5149', '\u5f52',
							'\u4e28', '\u5459', '\u54c8', '\u548d', '\u4f44', '\u592f',
							'\u8320', '\u8bc3', '\u9ed2', '\u62eb', '\u4ea8', '\u5677',
							'\u53ff', '\u9f41', '\u4e4e', '\u82b1', '\u6000', '\u6b22',
							'\u5ddf', '\u7070', '\u660f', '\u5419', '\u4e0c', '\u52a0',
							'\u620b', '\u6c5f', '\u827d', '\u9636', '\u5dfe', '\u5755',
							'\u5182', '\u4e29', '\u51e5', '\u59e2', '\u5658', '\u519b',
							'\u5494', '\u5f00', '\u520a', '\u5ffc', '\u5c3b', '\u533c',
							'\u808e', '\u52a5', '\u7a7a', '\u62a0', '\u625d', '\u5938',
							'\u84af', '\u5bbd', '\u5321', '\u4e8f', '\u5764', '\u6269',
							'\u5783', '\u6765', '\u5170', '\u5577', '\u635e', '\u808b',
							'\u52d2', '\u5d1a', '\u54e9', '\u4fe9', '\u5941', '\u826f',
							'\u64a9', '\u6bdf', '\u62ce', '\u4f36', '\u6e9c', '\u56d6',
							'\u9f99', '\u779c', '\u565c', '\u9a74', '\u5a08', '\u63a0', '\u62a1',
							'\u7f57', '\u5463', '\u5988', '\u57cb', '\u5ada', '\u7264',
							'\u732b', '\u4e48', '\u5445', '\u95e8', '\u753f', '\u54aa',
							'\u5b80', '\u55b5', '\u4e5c', '\u6c11', '\u540d', '\u8c2c',
							'\u6478', '\u54de', '\u6bea', '\u55ef', '\u62cf', '\u8149',
							'\u56e1', '\u56d4', '\u5b6c', '\u7592', '\u5a1e', '\u6041',
							'\u80fd', '\u59ae', '\u62c8', '\u5a18', '\u9e1f', '\u634f',
							'\u56dc', '\u5b81', '\u599e', '\u519c', '\u7fba', '\u5974', '\u5973',
							'\u597b', '\u759f', '\u9ec1', '\u632a', '\u5594', '\u8bb4',
							'\u5991', '\u62cd', '\u7705', '\u4e53', '\u629b', '\u5478',
							'\u55b7', '\u5309', '\u4e15', '\u56e8', '\u527d', '\u6c15',
							'\u59d8', '\u4e52', '\u948b', '\u5256', '\u4ec6', '\u4e03',
							'\u6390', '\u5343', '\u545b', '\u6084', '\u767f', '\u4eb2',
							'\u9751', '\u536d', '\u4e18', '\u533a', '\u5cd1', '\u7f3a',
							'\u590b', '\u5465', '\u7a63', '\u5a06', '\u60f9', '\u4eba',
							'\u6254', '\u65e5', '\u8338', '\u53b9', '\u909a', '\u633c',
							'\u5827', '\u5a51', '\u77a4', '\u637c', '\u4ee8', '\u6be2',
							'\u4e09', '\u6852', '\u63bb', '\u95aa', '\u68ee', '\u50e7',
							'\u6740', '\u7b5b', '\u5c71', '\u4f24', '\u5f30', '\u5962',
							'\u7533', '\u5347', '\u5c38', '\u53ce',
							'\u4e66', '\u5237', '\u8870', '\u95e9', '\u53cc', '\u813d',
							'\u542e', '\u8bf4', '\u53b6', '\u5fea', '\u635c', '\u82cf',
							'\u72fb', '\u590a', '\u5b59', '\u5506', '\u4ed6', '\u56fc',
							'\u574d', '\u6c64', '\u5932', '\u5fd1', '\u71a5', '\u5254',
							'\u5929', '\u65eb', '\u5e16', '\u5385', '\u56f2', '\u5077',
							'\u51f8', '\u6e4d', '\u63a8', '\u541e', '\u4e47', '\u7a75',
							'\u6b6a', '\u5f2f', '\u5c23', '\u5371', '\u6637', '\u7fc1',
							'\u631d', '\u4e4c', '\u5915', '\u8672', '\u4ed9', '\u4e61',
							'\u7071', '\u4e9b', '\u5fc3', '\u661f', '\u51f6', '\u4f11',
							'\u5401', '\u5405', '\u524a', '\u5743', '\u4e2b', '\u6079',
							'\u592e', '\u5e7a', '\u503b', '\u4e00', '\u56d9', '\u5e94',
							'\u54df', '\u4f63', '\u4f18', '\u625c', '\u56e6', '\u66f0',
							'\u6655', '\u5e00', '\u707d', '\u5142',
							'\u5328', '\u50ae', '\u5219', '\u8d3c', '\u600e', '\u5897',
							'\u624e', '\u635a', '\u6cbe', '\u5f20', '\u4f4b', '\u8707', '\u8d1e', '\u4e89', '\u4e4b',
							'\u4e2d', '\u5dde', '\u6731', '\u6293', '\u62fd',
							'\u4e13', '\u5986', '\u96b9', '\u5b92', '\u5353', '\u4e72',
							'\u5b97', '\u90b9', '\u79df', '\u94bb', '\u539c', '\u5c0a',
							'\u6628', '\u5159'
						],
						pinyins: [
							'A', 'AI', 'AN', 'ANG', 'AO', 'BA',
							'BAI', 'BAN', 'BANG', 'BAO', 'BEI', 'BEN',
							'BENG', 'BI', 'BIAN', 'BIAO', 'BIE', 'BIN',
							'BING', 'BO', 'BU', 'CA', 'CAI', 'CAN',
							'CANG', 'CAO', 'CE', 'CEN', 'CENG',
							'CHA', 'CHAI', 'CHAN', 'CHANG', 'CHAO',
							'CHE', 'CHEN', 'CHENG', 'CHI',
							'CHONG', 'CHOU', 'CHU', 'CHUA', 'CHUAI', 'CHUAN',
							'CHUANG', 'CHUI', 'CHUN', 'CHUO', 'CI', 'CONG',
							'COU', 'CU', 'CUAN', 'CUI', 'CUN', 'CUO',
							'DA', 'DAI', 'DAN', 'DANG', 'DAO', 'DE',
							'DEN', 'DENG', 'DI', 'DIAN', 'DIAO',
							'DIE', 'DING', 'DIU', 'DONG', 'DOU', 'DU',
							'DUAN', 'DUI', 'DUN', 'DUO', 'E', 'EI',
							'EN', 'ENG', 'ER', 'FA', 'FAN', 'FANG',
							'FEI', 'FEN', 'FENG', 'FIAO', 'FO', 'FOU',
							'FU', 'GA', 'GAI', 'GAN', 'GANG', 'GAO',
							'GE', 'GEI', 'GEN', 'GENG', 'GONG', 'GOU',
							'GU', 'GUA', 'GUAI', 'GUAN', 'GUANG', 'GUI',
							'GUN', 'GUO', 'HA', 'HAI', 'HAN', 'HANG',
							'HAO', 'HE', 'HEI', 'HEN', 'HENG', 'HM',
							'HONG', 'HOU', 'HU', 'HUA', 'HUAI', 'HUAN',
							'HUANG', 'HUI', 'HUN', 'HUO', 'JI', 'JIA',
							'JIAN', 'JIANG', 'JIAO', 'JIE', 'JIN', 'JING',
							'JIONG', 'JIU', 'JU', 'JUAN', 'JUE', 'JUN',
							'KA', 'KAI', 'KAN', 'KANG', 'KAO', 'KE',
							'KEN', 'KENG', 'KONG', 'KOU', 'KU', 'KUA',
							'KUAI', 'KUAN', 'KUANG', 'KUI', 'KUN', 'KUO',
							'LA', 'LAI', 'LAN', 'LANG', 'LAO', 'LE',
							'LEI', 'LENG', 'LI', 'LIA', 'LIAN', 'LIANG',
							'LIAO', 'LIE', 'LIN', 'LING', 'LIU', 'LO',
							'LONG', 'LOU', 'LU', 'LV', 'LUAN', 'LVE', 'LUN',
							'LUO', 'M', 'MA', 'MAI', 'MAN', 'MANG',
							'MAO', 'ME', 'MEI', 'MEN', 'MENG', 'MI',
							'MIAN', 'MIAO', 'MIE', 'MIN', 'MING', 'MIU',
							'MO', 'MOU', 'MU', 'N', 'NA', 'NAI',
							'NAN', 'NANG', 'NAO', 'NE', 'NEI', 'NEN',
							'NENG', 'NI', 'NIAN', 'NIANG', 'NIAO', 'NIE',
							'NIN', 'NING', 'NIU', 'NONG', 'NOU', 'NU', 'NV',
							'NUAN', 'NVE', 'NUN', 'NUO', 'O', 'OU',
							'PA', 'PAI', 'PAN', 'PANG', 'PAO', 'PEI',
							'PEN', 'PENG', 'PI', 'PIAN', 'PIAO', 'PIE',
							'PIN', 'PING', 'PO', 'POU', 'PU', 'QI',
							'QIA', 'QIAN', 'QIANG', 'QIAO', 'QIE', 'QIN',
							'QING', 'QIONG', 'QIU', 'QU', 'QUAN', 'QUE',
							'QUN', 'RAN', 'RANG', 'RAO', 'RE', 'REN',
							'RENG', 'RI', 'RONG', 'ROU', 'RU', 'RUA',
							'RUAN', 'RUI', 'RUN', 'RUO', 'SA', 'SAI',
							'SAN', 'SANG', 'SAO', 'SE', 'SEN', 'SENG',
							'SHA', 'SHAI', 'SHAN', 'SHANG', 'SHAO', 'SHE',
							'SHEN', 'SHENG', 'SHI', 'SHOU',
							'SHU', 'SHUA', 'SHUAI', 'SHUAN', 'SHUANG', 'SHUI',
							'SHUN', 'SHUO', 'SI', 'SONG', 'SOU', 'SU',
							'SUAN', 'SUI', 'SUN', 'SUO', 'TA', 'TAI',
							'TAN', 'TANG', 'TAO', 'TE', 'TENG', 'TI',
							'TIAN', 'TIAO', 'TIE', 'TING', 'TONG', 'TOU',
							'TU', 'TUAN', 'TUI', 'TUN', 'TUO', 'WA',
							'WAI', 'WAN', 'WANG', 'WEI', 'WEN', 'WENG',
							'WO', 'WU', 'XI', 'XIA', 'XIAN', 'XIANG',
							'XIAO', 'XIE', 'XIN', 'XING', 'XIONG', 'XIU',
							'XU', 'XUAN', 'XUE', 'XUN', 'YA', 'YAN',
							'YANG', 'YAO', 'YE', 'YI', 'YIN', 'YING',
							'YO', 'YONG', 'YOU', 'YU', 'YUAN', 'YUE',
							'YUN', 'ZA', 'ZAI', 'ZAN',
							'ZANG', 'ZAO', 'ZE', 'ZEI', 'ZEN', 'ZENG',
							'ZHA', 'ZHAI', 'ZHAN', 'ZHANG',
							'ZHAO', 'ZHE', 'ZHEN', 'ZHENG', 'ZHI', 'ZHONG', 'ZHOU', 'ZHU', 'ZHUA', 'ZHUAI',
							'ZHUAN', 'ZHUANG', 'ZHUI', 'ZHUN', 'ZHUO', 'ZI',
							'ZONG', 'ZOU', 'ZU', 'ZUAN', 'ZUI', 'ZUN',
							'ZUO', ''
						],
						// Separate from UNIHANS & PINYINS.
						// So PINYINS are completely of alphabetical order, and no duplicate pinyin.
						exceptions: {
							'\u66fe': 'ZENG', // CENG 曾
							'\u6c88': 'SHEN', // CHEN 沈
							'\u55f2': 'DIA', // DIE 嗲
							'\u78a1': 'ZHOU', // DU 碡
							'\u8052': 'GUO', // GUA 聒
							'\u7094': 'QUE', // GUI 炔
							'\u86b5': 'KE', // HE 蚵
							'\u7809': 'HUA', // HUO 砉
							'\u5b24': 'MO', // MA 嬤
							'\u5b37': 'MO', // MA 嬷
							'\u8e52': 'PAN', // MAN 蹒
							'\u8e4a': 'XI', // QI 蹊
							'\u4e2c': 'PAN', // QIANG 丬
							'\u9730': 'XIAN', // SAN 霰
							'\u8398': 'XIN', // SHEN 莘
							'\u8c49': 'CHI', // SHI 豉
							'\u9967': 'XING', // TANG 饧
							'\u7b60': 'JUN', // YUN 筠
							'\u957f': 'CHANG', // ZHANG 长
							'\u5e27': 'ZHEN', // ZHENG 帧
							'\u5cd9': 'SHI', // ZHI 峙
							'\u90cd': 'NA',
							'\u828e': 'XIONG',
							'\u8c01': 'SHUI'
						}
					}
				),
				patchers: Object.freeze(
					{
						patcher56L: (() => {
							const f = function (dict) {
								// Update EXCEPTIONS dict.
								dict.exceptions = {
									'\u55f2': 'DIA', // DIE 嗲
									'\u78a1': 'ZHOU', // DU 碡
									'\u8052': 'GUO', // GUA 聒
									'\u7094': 'QUE', // GUI 炔
									'\u86b5': 'KE', // HE 蚵
									'\u7809': 'HUA', // HUO 砉
									'\u5b37': 'MO', // MA 嬷 新增
									'\u8e4a': 'XI', // QI 蹊
									'\u4e2c': 'PAN', // QIANG 丬
									'\u9730': 'XIAN', // SAN 霰
									'\u8c49': 'CHI', // SHI 豉
									'\u9967': 'XING', // TANG 饧
									'\u5e27': 'ZHEN', // ZHENG 帧
									'\u828e': 'XIONG', // 芎
									'\u8c01': 'SHUI', // 谁
									'\u94b6': 'KE' // 钶
								};

								// Update UNIHANS dict.
								dict.unihans[91] = '\u4f15'; // FU: 夫 --> 伕
								dict.unihans[347] = '\u4eda'; // XIAN: 仙 --> 仚
								dict.unihans[393] = '\u8bcc'; // ZHOU: 州 --> 诌
								dict.unihans[39] = '\u5a64'; // CHOU: 抽 --> 婤
								dict.unihans[50] = '\u8160'; // COU: 凑 --> 腠
								dict.unihans[369] = '\u6538'; // YOU: 优 --> 攸
								dict.unihans[123] = '\u4e6f'; // HU: 乎 --> 乯
								dict.unihans[171] = '\u5215'; // LI: 哩 --> 刕
								dict.unihans[102] = '\u4f5d'; // GOU: 勾 --> 佝
								dict.unihans[126] = '\u72bf'; // HUAN: 欢 --> 犿
								dict.unihans[176] = '\u5217'; // LIE: 毟 --> 列
								dict.unihans[178] = '\u5222'; // LING: 伶 --> 刢
								dict.unihans[252] = '\u5a1d'; // POU: 剖 --> 娝
								dict.unihans[330] = '\u5078'; // TOU: 偷 --> 偸
							};
							f.shouldPatch = function (toToken = this.genToken) {
								if (typeof toToken !== 'function') return false;
								// Special unihans that get incorrect pinyins.
								if (
									toToken('\u4f15').target === 'FOU'
									&& toToken('\u4eda').target === 'XIA'
									&& toToken('\u8bcc').target === 'ZHONG'
									&& toToken('\u5a64').target === 'CHONG'
									&& toToken('\u8160').target === 'CONG'
									&& toToken('\u6538').target === 'YONG'
									&& toToken('\u4e6f').target === 'HOU'
									&& toToken('\u5215').target === 'LENG'
									&& toToken('\u4f5d').target === 'GONG'
									&& toToken('\u72bf').target === 'HUAI'
									&& toToken('\u5217').target === 'LIAO'
									&& toToken('\u5222').target === 'LIN'
									&& toToken('\u94b6').target === 'E'
								) {
									return true;
								}
								return false;
							};
							return f;
						})(),
					}
				),
				patchDict: function (patchers = Object.values(this.patchers)) {
					if (!patchers) return;
					if (typeof patchers === 'function') {
						patchers = [patchers];
					}
					if (patchers.forEach) {
						patchers.forEach(p => {
							typeof p === 'function' && p(this.table);
						});
					}
				},
				isSupported: function (force) {
					if (!force && this.internals.supported !== null) {
						return this.internals.supported;
					}
					if (typeof Intl === 'object' && Intl.Collator) {
						this.internals.collator = new Intl.Collator(['zh-Hans-CN', 'zh-CN']);
						this.internals.supported = Intl.Collator.supportedLocalesOf(['zh-CN']).length === 1;
					} else {
						this.internals.supported = false;
					}
					return this.internals.supported;
				},
				genToken: function (ch) {
					// Access DICT here, give the chance to patch DICT.
					const unihans = this.table.unihans;
					const pinyins = this.table.pinyins;
					const exceptions = this.table.exceptions;
					const token = {
						source: ch
					};

					// First check EXCEPTIONS map, then search with UNIHANS table.
					if (ch in exceptions) {
						token.type = this.internals.pinyin;
						token.target = exceptions[ch];
						return token;
					}

					let offset = -1;
					let cmp;
					if (ch.charCodeAt(0) < 256) {
						token.type = this.internals.latin;
						token.target = ch;
						return token;
					} else {
						cmp = this.internals.collator.compare(ch, this.internals.firstPinyinUnihan);
						if (cmp < 0) {
							token.type = this.internals.unknown;
							token.target = ch;
							return token;
						} else if (cmp === 0) {
							token.type = this.internals.pinyin;
							offset = 0;
						} else {
							cmp = this.internals.collator.compare(ch, this.internals.lastPinyinUnihan);
							if (cmp > 0) {
								token.type = this.internals.unknown;
								token.target = ch;
								return token;
							} else if (cmp === 0) {
								token.type = this.internals.pinyin;
								offset = unihans.length - 1;
							}
						}
					}

					token.type = this.internals.pinyin;
					if (offset < 0) {
						let begin = 0;
						let end = unihans.length - 1;
						while (begin <= end) {
							offset = ~~((begin + end) / 2);
							let unihan = unihans[offset];
							cmp = this.internals.collator.compare(ch, unihan);

							// Catch it.
							if (cmp === 0) {
								break;
							}
							// Search after offset.
							else if (cmp > 0) {
								begin = offset + 1;
							}
							// Search before the offset.
							else {
								end = offset - 1;
							}
						}
					}

					if (cmp < 0) {
						offset--;
					}

					token.target = pinyins[offset];
					if (!token.target) {
						token.type = this.internals.unknown;
						token.target = token.source;
					}
					return token;
				},
				parse: function (str) {
					if (typeof str !== 'string') {
						throw new Error('argument should be string.');
					}
					if (!this.isSupported()) {
						throw new Error('not support Intl or zh-CN language.');
					}
					return str.split('').map(v => this.genToken(v));
				},
				convertToPinyin: function (str, separator, lowerCase) {
					return this.parse(str).map(v => {
						if (lowerCase && v.type === this.internals.pinyin) {
							return v.target.toLowerCase();
						}
						return v.target;
					}).join(separator || '');
				}
			}
		)
	}),
	/**
	 * Checks if last input is equal to the last output value
	 *
	 * @method
	 * @name (get) isLastEqual
	 * @kind property
	 * @memberof Input
	 * @returns {boolean}
	*/
	get isLastEqual() {
		return this.data.lastOutput === this.data.lastInput;
	},
	/**
	 * Retrieves last output value
	 *
	 * @method
	 * @name (get) lastOutput
	 * @kind property
	 * @memberof Language
	 * @returns {string}
	*/
	get lastOutput() {
		return this.data.lastOutput;
	},
	/**
	 * Retrieves last input value
	 *
	 * @method
	 * @name (get) lastInput
	 * @kind property
	 * @memberof Language
	 * @returns {any}
	*/
	get lastInput() {
		return this.data.lastInput;
	},
	// Output methods
	/**
	 * Transliterates a string from Japanese into latin
	 *
	 * @property
	 * @name jpRomanize
	 * @kind method
	 * @memberof Language
	 * @param {string} string
	 * @param {object|'traditional hepburn'|'modified hepburn'|'kunrei'|'nihon'} config - Mapping of characters.
	 * @param {boolean} bSaveInput - Cache transliteration
	 * @returns {string}
	 */
	jpRomanize(string, config, bSaveInput = true) {
		if (bSaveInput) {
			if (this.data.lastInput === string) { return this.lastOutput; }
			this.data.lastInput = string;
		}
		config = typeof config === 'string'
			? { ...this.helpers.japanese.romanizationConfigs.default, ...(this.helpers.japanese.romanizationConfigs[config] || {}) }
			: !config
				? { ...this.helpers.japanese.romanizationConfigs.default }
				: config;
		if (typeof config === 'undefined' || typeof config !== 'object') { throw new ReferenceError('Romanization method "' + config + '" is undefined or non valid'); }

		const table = this.helpers.japanese.applyConfigs({ ...this.helpers.japanese.table }, config);

		string = this.helpers.japanese.hiraganize(string);

		let dest = '';
		let previousToken = '';
		let prevJapanese = false;

		while (string.length > 0) {
			let token = '';

			// assuming we have only one or two letter token in table
			if (table[string.slice(0, 2)]) {
				token = string.slice(0, 2);
				string = string.slice(2);
			} else {
				token = string[0];
				string = string.slice(1);
			}

			// handle small tsu
			if (token === 'っ') {
				previousToken = token;
				prevJapanese = true;
				continue;
			}

			let tokenDest = table[token] || '';
			let tokenDestFallBack = !tokenDest.length ? token : null;

			// small tsu
			if (previousToken === 'っ') {
				if (tokenDest.match(/^[^aiueo]/)) {
					if (token[0] === 'ち') {
						if (config['っち'] === 'tchi') {
							tokenDest = {
								'ち': 'tchi',
								'ちゃ': 'tcha',
								'ちゅ': 'tchu',
								'ちぇ': 'tche',
								'ちょ': 'tcho',
							}[token];
						} else if (config['っち'] === 'cchi') {
							tokenDest = {
								'ち': 'cchi',
								'ちゃ': 'ccha',
								'ちゅ': 'cchu',
								'ちぇ': 'cche',
								'ちょ': 'ccho',
							}[token];
						} else { // normally 'tti'
							tokenDest = {
								'ち': 'tti',
								'ちゃ': 'ttya',
								'ちゅ': 'ttyu',
								'ちぇ': 'ttye',
								'ちょ': 'ttyo',
							}[token];
						}
					} else {
						tokenDest = tokenDest[0] + tokenDest;
					}
				} else {
					/*
					 * Some article claims that "ローマ字教育の指針(文部科学省)" defines that
					 * strings ending with "っ" must be represented with trailing apostrophe
					 * though I couldn't confirm.
					 */
					dest += '\'';
				}
			}

			// long vowel
			if (token === 'ー') {
				if (dest.match(/[aiueo]$/)) {
					if (config['あー'] === 'a') {
						// nope
					} else if (config['あー'] === 'ah') {
						dest += 'h';
					} else if (config['あー'] === 'a-') {
						dest += '-';
					} else if (config['あー'] === 'aa') {
						dest = dest.slice(0, -1) + {
							'a': 'aa',
							'i': 'ii',
							'u': 'uu',
							'e': 'ee',
							'o': 'oo',
						}[dest.slice(-1)];
					} else if (config['あー'] === 'â') {
						dest = dest.slice(0, -1) + {
							'a': 'â',
							'i': 'î',
							'u': 'û',
							'e': 'ê',
							'o': 'ô',
						}[dest.slice(-1)];
					} else if (config['あー'] === 'ā') {
						dest = dest.slice(0, -1) + {
							'a': 'ā',
							'i': 'ī',
							'u': 'ū',
							'e': 'ē',
							'o': 'ō',
						}[dest.slice(-1)];
					}

					tokenDest = '';
				} else {
					tokenDest = '-';
				}
			} else if (prevJapanese && dest.slice(-1) === 'e' && tokenDest[0] === 'i') {
				tokenDest = tokenDest.slice(1);

				if (config['えい'] === 'ei') {
					dest += 'i';
				} else if (config['えい'] === 'ee') {
					dest += 'e';
				} else if (config['えい'] === 'eh') {
					dest += 'h';
				} else if (config['えい'] === 'ê') {
					dest = dest.slice(0, -1) + 'ê';
				} else if (config['えい'] === 'ē') {
					dest = dest.slice(0, -1) + 'ē';
				} else if (config['えい'] === 'e') {
					// nope
				}
			} else if (prevJapanese && dest.slice(-1) === 'o' && tokenDest[0] === 'u') {
				tokenDest = tokenDest.slice(1);

				if (config['おう'] === 'ou') {
					dest += 'u';
				} else if (config['おう'] === 'oo') {
					dest += 'o';
				} else if (config['おう'] === 'oh') {
					dest += 'h';
				} else if (config['おう'] === 'ô') {
					dest = dest.slice(0, -1) + 'ô';
				} else if (config['おう'] === 'ō') {
					dest = dest.slice(0, -1) + 'ō';
				} else if (config['おう'] === 'o') {
					// nope
				}
			} else if (prevJapanese && dest.match(/[aiueo]$/) && dest.slice(-1) === tokenDest[0] && token !== 'を') {
				tokenDest = tokenDest.slice(1);

				dest = dest.slice(0, -1) + config[{
					'a': 'ああ',
					'i': 'いい',
					'u': 'うう',
					'e': 'ええ',
					'o': 'おお',
				}[dest.slice(-1)]];
			}

			// んば
			if (tokenDest.match(/^[bpm]/) && previousToken === 'ん') {
				if (config['んば'] === 'nba') {
					// nope
				} else if (config['んば'] === 'mba') {
					dest = dest.slice(0, -1) + 'm';
				}
			}

			// んあ
			if (tokenDest.match(/^[aiueoy]/) && previousToken === 'ん') {
				if (config['んあ'] === 'na') {
					// nope
				} else if (config['んあ'] === 'n\'a') {
					tokenDest = '\'' + tokenDest;
				} else if (config['んあ'] === 'n-a') {
					tokenDest = '-' + tokenDest;
				}
			}

			if (config.punctuation && this.helpers.japanese.punctuation[token]) {
				tokenDest = this.helpers.japanese.punctuation[token];
			}

			dest += (tokenDest || tokenDestFallBack || '');

			prevJapanese = tokenDestFallBack ? false : true;

			previousToken = token;
		}

		if (previousToken === 'っ') {
			dest += '\'';
		}
		if (bSaveInput) { this.data.lastOutput = dest; }
		return dest;
	},
	/**
	 * Transliterates a string from Chinese into latin
	 *
	 * @property
	 * @name jRomanize
	 * @kind method
	 * @memberof Language
	 * @param {string} string
	 * @param {{ separator: string, lowerCase: boolean }} config - [{ separator: '', lowerCase: false }] Output setting
	 * @param {boolean} bSaveInput - Cache transliteration
	 * @returns {string}
	 */
	chRomanize(string, config = { separator: '', lowerCase: false }, bSaveInput = true) {
		if (bSaveInput) {
			if (this.data.lastInput === string) { return this.lastOutput; }
			this.data.lastInput = string;
		}
		const dest = this.helpers.chinese.convertToPinyin(string, Object.hasOwn(config, 'separator') ? config.separator : '', Object.hasOwn(config, 'lowerCase') ? config.lowerCase : false);
		if (bSaveInput) { this.data.lastOutput = dest; }
		return dest;
	},
	/**
	 * Transliterates a string from Japanese, Greek and Cyrilic into latin
	 *
	 * @property
	 * @name transliterate
	 * @kind method
	 * @memberof Language
	 * @param {string} value
	 * @param {{japansese: object, chinese: object}} config - Language dependendant settings. See this.jpRomanize and this.chRomanize
	 * @returns {string}
	 */
	transliterate(string, config = {}) {
		if (this.data.lastInput === string) { return this.lastOutput; }
		this.data.lastInput = string;
		return this.data.lastOutput = this.jpRomanize(
			this.chRomanize(
				string.replace(/./gui, a => this.helpers.greek.table[a] || this.helpers.russian.table[a] || a),
				Object.hasOwn(config, 'chinese') ? config.chinese : void (0),
				false
			),
			Object.hasOwn(config, 'japanese') ? config.japanese : void (0),
			false
		);
	}
});

{	// Patch dict for icudt56l.dat related env, such as safari|node v4.
	const chinese = Language.helpers.chinese;
	if (chinese.isSupported() && chinese.patchers.patcher56L.shouldPatch()) { chinese.patchDict(); }
}