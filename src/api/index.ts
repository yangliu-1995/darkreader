import './chrome';
import {setFetchMethod as setFetch} from './fetch';
import {DEFAULT_THEME} from '../defaults';
import type {Theme, DynamicThemeFix} from '../definitions';
import {ThemeEngine} from '../generators/theme-engines';
import {createOrUpdateDynamicThemeInternal, removeDynamicTheme} from '../inject/dynamic-theme';
import {collectCSS} from '../inject/dynamic-theme/css-collection';
import {isMatchMediaChangeEventListenerSupported} from '../utils/platform';

import createStaticStylesheet from '../generators/static-theme';
import {createOrUpdateStyle, removeStyle} from '../inject/style';

let isDarkReaderEnabled = false;
const isIFrame = (() => {
    try {
        return window.self !== window.top;
    } catch (err) {
        console.warn(err);
        return true;
    }
})();

export function enable(themeOptions: Partial<Theme> | null = {}, fixes: DynamicThemeFix | null = null): void {
    const theme = {...DEFAULT_THEME, ...themeOptions};

    if (theme.engine !== ThemeEngine.dynamicTheme) {
        throw new Error('Theme engine is not supported.');
    }
    // TODO: repalce with createOrUpdateDynamicTheme() and make fixes signature
    // DynamicThemeFix | DynamicThemeFix[]
    createOrUpdateDynamicThemeInternal(theme, fixes, isIFrame);
    isDarkReaderEnabled = true;
}

export function enableDynamicTheme(themeOptions: Partial<Theme> | null = {}, fixes: DynamicThemeFix | null = null) {
    const theme = {...DEFAULT_THEME, ...themeOptions};

    if (theme.engine !== ThemeEngine.dynamicTheme) {
        theme.engine = ThemeEngine.dynamicTheme;
    }
    // TODO: repalce with createOrUpdateDynamicTheme() and make fixes signature
    // DynamicThemeFix | DynamicThemeFix[]
    removeStyle();
    createOrUpdateDynamicThemeInternal(theme, fixes, isIFrame);
    isDarkReaderEnabled = true;
}

export function enableStaticTheme(themeOptions: Partial<Theme> | null = {}) {
    const theme = {...DEFAULT_THEME, ...themeOptions};
    if (theme.engine != ThemeEngine.staticTheme) {
        theme.engine = ThemeEngine.staticTheme;
    }
    removeStyle();
    var css = createStaticStylesheet(theme, location.href, !isIFrame,
            static_thems_raw(),
            static_themes_index());
    createOrUpdateStyle(css, 'static');
}

function static_themes_index() {
    return { "offsets": "00000ml00nj03s00s90cl015s01m018c01901aj02o01e50fh01uk0cm", "domains": { "github.com": [1], "imdb.com": [2], "mail.google.com": [3], "nationstates.net": [4], "opencollective.com": [5], "reddit.com": [6], "youtube.com": [7] }, "domainLabels": { "*": [0] }, "nonstandard": [], "cacheDomainIndex": { "business.bing.com": [0], "www.bing.com": [0], "": [0] }, "cacheSiteFix": { "0": { "url": ["*"], "neutralBg": ["html", "body"] } }, "cacheCleanupTimer": 13 };
}

function static_thems_raw() {
    return `
    "*

NEUTRAL BG
html
body
:not([style*="background-color:"]):not(iframe)

NEUTRAL TEXT
html
body
:not([style*="color:"])
.sr-reader *:not([class*='sr-pivot'])

RED TEXT
h1:not([style*="color:"])
h2:not([style*="color:"])
h3:not([style*="color:"])
h4:not([style*="color:"])
h5:not([style*="color:"])
h6:not([style*="color:"])

GREEN TEXT
cite:not([style*="color:"])

BLUE BG ACTIVE
input:not([style*="background-color:"])
textarea:not([style*="background-color:"])
button:not([style*="background-color:"])
[role="button"]

BLUE TEXT ACTIVE
a:not([style*="color:"])

BLUE BORDER
:not([style*="border-color:"])
::before
::after

FADE BG
div:empty
.sr-reader *
.sr-backdrop

FADE TEXT
input::placeholder
textarea::placeholder

NO IMAGE
input:not([style*="background-image:"])
textarea:not([style*="background-image:"])

================================

github.com

RED TEXT
.pl-k

GREEN BG ACTIVE
.btn-primary

GREEN TEXT
.pl-c

BLUE TEXT
.pl-s
.pl-pds
.pl-c1

NO IMAGE
.btn
.btn-primary

================================

imdb.com

RED BG
.jw-progress:empty
.jw-knob:empty

FADE BG
.MediaSheetstyles__MediaContainer-sc-1warcg6-0
.MediaSheetstyles__MediaContentContainer-sc-1warcg6-1

TRANSPARENT BG
.ipc-lockup-overlay
.ipc-lockup-overlay__content *
.jw-captions
.jw-controls
.jw-controls *
.jw-controls-backdrop:empty
.jw-overlays
.MediaSheetstyles__MediaContentContainer-sc-1warcg6-1 div
.Slate__VideoPreviewContainer-ss6ccs-3
.styles__MediaViewerTouchHandler-sc-6t1jw8-5

================================

mail.google.com

RED BG ACTIVE
.T-I-KE

NO IMAGE
.T-I-KE

================================

nationstates.net

TRANSPARENT BG
.paperclip

================================

opencollective.com

BLUE BG ACTIVE
.TierCard .action

TRANSPARENT BG
.CollectiveCover .content

================================

reddit.com

RED BG
.reddit-video-player-root .seek-bar-progress
.reddit-video-player-root .volume-slider-progress
.reddit-video-player-root .volume-slider-thumb

BLUE BG
.reddit-video-player-root .seek-bar-buffered
.reddit-video-player-root .volume-slider-track

FADE BG
.reddit-video-player-root .ended-controls
.reddit-video-player-root .playback-controls

TRANSPARENT BG
.reddit-video-player-root video + div
.reddit-video-player-root .ended-controls :not(button)
.reddit-video-seek-bar-root
.reddit-video-player-root .playback-controls .control-button

================================

youtube.com

RED BG
.ytp-swatch-background-color.ytp-swatch-background-color

BLUE BG
.ytp-load-progress:empty

FADE BG
.ytp-chrome-top
.ytp-chrome-bottom
.ytp-pause-overlay

TRANSPARENT BG
#previewbar
.ytp-button.ytp-button
.ytp-chrome-bottom *
.ytp-chrome-top *
.ytp-gradient-bottom:empty
.ytp-gradient-top:empty
.ytp-pause-overlay *
.ytp-progress-bar-padding:empty
.ytp-scrubber-container
.ytp-timed-markers-container:empty
.ytp-tooltip-text-wrapper
"
    `;
}

export function isEnabled(): boolean {
    return isDarkReaderEnabled;
}

export function disable(): void {
    removeDynamicTheme();
    isDarkReaderEnabled = false;
}

const darkScheme = matchMedia('(prefers-color-scheme: dark)');
let store = {
    themeOptions: null as Partial<Theme> | null,
    fixes: null as DynamicThemeFix | null,
};

function handleColorScheme(): void {
    if (darkScheme.matches) {
        enable(store.themeOptions, store.fixes);
    } else {
        disable();
    }
}

export function auto(themeOptions: Partial<Theme> | false = {}, fixes: DynamicThemeFix | null = null): void {
    if (themeOptions) {
        store = {themeOptions, fixes};
        handleColorScheme();
        if (isMatchMediaChangeEventListenerSupported) {
            darkScheme.addEventListener('change', handleColorScheme);
        } else {
            darkScheme.addListener(handleColorScheme);
        }
    } else {
        if (isMatchMediaChangeEventListenerSupported) {
            darkScheme.removeEventListener('change', handleColorScheme);
        } else {
            darkScheme.removeListener(handleColorScheme);
        }
        disable();
    }
}

export async function exportGeneratedCSS(): Promise<string> {
    return await collectCSS();
}

export const setFetchMethod = setFetch;
