import { renderers } from './renderers.mjs';
import { c as createExports, s as serverEntrypointModule } from './chunks/_@astrojs-ssr-adapter_CoAR5jkj.mjs';
import { manifest } from './manifest_CS-E2jbG.mjs';

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/api/auth.astro.mjs');
const _page2 = () => import('./pages/api/chat.astro.mjs');
const _page3 = () => import('./pages/api/compare.astro.mjs');
const _page4 = () => import('./pages/api/export.astro.mjs');
const _page5 = () => import('./pages/api/me.astro.mjs');
const _page6 = () => import('./pages/api/news.astro.mjs');
const _page7 = () => import('./pages/api/portfolio.astro.mjs');
const _page8 = () => import('./pages/api/screener.astro.mjs');
const _page9 = () => import('./pages/api/stock.astro.mjs');
const _page10 = () => import('./pages/api/watchlist.astro.mjs');
const _page11 = () => import('./pages/dashboard/compare.astro.mjs');
const _page12 = () => import('./pages/dashboard/news.astro.mjs');
const _page13 = () => import('./pages/dashboard/portfolio.astro.mjs');
const _page14 = () => import('./pages/dashboard/screener.astro.mjs');
const _page15 = () => import('./pages/dashboard/watchlist.astro.mjs');
const _page16 = () => import('./pages/dashboard.astro.mjs');
const _page17 = () => import('./pages/docs/api.astro.mjs');
const _page18 = () => import('./pages/docs/changelog.astro.mjs');
const _page19 = () => import('./pages/docs/getting-started.astro.mjs');
const _page20 = () => import('./pages/docs/tutorials.astro.mjs');
const _page21 = () => import('./pages/docs.astro.mjs');
const _page22 = () => import('./pages/login.astro.mjs');
const _page23 = () => import('./pages/index.astro.mjs');

const pageMap = new Map([
    ["node_modules/astro/dist/assets/endpoint/node.js", _page0],
    ["src/pages/api/auth.ts", _page1],
    ["src/pages/api/chat.ts", _page2],
    ["src/pages/api/compare.ts", _page3],
    ["src/pages/api/export.ts", _page4],
    ["src/pages/api/me.ts", _page5],
    ["src/pages/api/news.ts", _page6],
    ["src/pages/api/portfolio.ts", _page7],
    ["src/pages/api/screener.ts", _page8],
    ["src/pages/api/stock.ts", _page9],
    ["src/pages/api/watchlist.ts", _page10],
    ["src/pages/dashboard/compare.astro", _page11],
    ["src/pages/dashboard/news.astro", _page12],
    ["src/pages/dashboard/portfolio.astro", _page13],
    ["src/pages/dashboard/screener.astro", _page14],
    ["src/pages/dashboard/watchlist.astro", _page15],
    ["src/pages/dashboard/index.astro", _page16],
    ["src/pages/docs/api.astro", _page17],
    ["src/pages/docs/changelog.astro", _page18],
    ["src/pages/docs/getting-started.astro", _page19],
    ["src/pages/docs/tutorials.astro", _page20],
    ["src/pages/docs/index.astro", _page21],
    ["src/pages/login.astro", _page22],
    ["src/pages/index.astro", _page23]
]);
const serverIslandMap = new Map();
const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    middleware: () => import('./_noop-middleware.mjs')
});
const _args = {
    "mode": "standalone",
    "client": "file:///D:/project/qwenta/dist/client/",
    "server": "file:///D:/project/qwenta/dist/server/",
    "host": true,
    "port": 4321,
    "assets": "_astro"
};
const _exports = createExports(_manifest, _args);
const handler = _exports['handler'];
const startServer = _exports['startServer'];
const options = _exports['options'];
const _start = 'start';
{
	serverEntrypointModule[_start](_manifest, _args);
}

export { handler, options, pageMap, startServer };
