import process from 'node:process';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteTsconfigPaths from 'vite-tsconfig-paths';
import svgr from 'vite-plugin-svgr';

// The following are known larger packages or packages that can be loaded asynchronously.
const individuallyPackages = ['activities', 'github.svg', 'grid.svg', 'mol.svg'];

const packageChunkGroups: Array<{ name: string; matchers: string[] }> = [
  {
    name: 'react-core',
    matchers: ['react', 'react-dom', 'scheduler'],
  },
  {
    name: 'routing',
    matchers: ['react-router', 'react-router-dom'],
  },
  {
    name: 'charts',
    matchers: ['recharts', 'd3-', 'victory-vendor'],
  },
  {
    name: 'map-core',
    matchers: ['maplibre-gl'],
  },
  {
    name: 'map-ui',
    matchers: ['react-map-gl', 'viewport-mercator-project'],
  },
  {
    name: 'geo',
    matchers: [
      '@mapbox/polyline',
      '@surbowl/world-geo-json-zh',
      'gcoord',
      'geojson',
    ],
  },
  {
    name: 'head',
    matchers: ['react-helmet-async', 'react-ga4', '@vercel/analytics'],
  },
];

const getPackageName = (id: string) => {
  const normalized = id.split('\\').join('/');
  const nodeModulesIndex = normalized.lastIndexOf('node_modules/');

  if (nodeModulesIndex === -1) {
    return null;
  }

  const packagePath = normalized.slice(nodeModulesIndex + 'node_modules/'.length);
  const segments = packagePath.split('/');

  if (segments[0] === '.pnpm') {
    const packageToken = segments[1];
    if (!packageToken) {
      return null;
    }

    const atIndex = packageToken.startsWith('@')
      ? packageToken.indexOf('@', 1)
      : packageToken.indexOf('@');

    const baseName = atIndex === -1 ? packageToken : packageToken.slice(0, atIndex);
    return baseName.replace(/\+/g, '/');
  }

  if (segments[0]?.startsWith('@') && segments[1]) {
    return `${segments[0]}/${segments[1]}`;
  }

  return segments[0] ?? null;
};

const getVendorChunkName = (id: string) => {
  const packageName = getPackageName(id);

  for (const group of packageChunkGroups) {
    if (packageName && group.matchers.includes(packageName)) {
      return group.name;
    }
  }

  return 'vendor-misc';
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    viteTsconfigPaths(),
    svgr({
      include: ['**/*.svg'],
      svgrOptions: {
        exportType: 'named',
        namedExport: 'ReactComponent',
        plugins: ['@svgr/plugin-svgo', '@svgr/plugin-jsx'],
        svgoConfig: {
          floatPrecision: 2,
          plugins: [
            {
              name: 'preset-default',
              params: {
                overrides: {
                  removeTitle: false,
                  removeViewBox: false,
                },
              },
            },
          ],
        },
      },
    }),
  ],
  base: process.env.PATH_PREFIX || '/',
  define: {
    "import.meta.env.VERCEL": JSON.stringify(process.env.VERCEL),
  },
  build: {
    manifest: true,
    outDir: './dist', // for user easy to use, vercel use default dir -> dist
    rollupOptions: {
      output: {
        manualChunks: (id: string) => {
          if (id.includes('node_modules')) {
            return getVendorChunkName(id);
          } else {
            for (const item of individuallyPackages) {
              if (id.includes(item)) {
                return item;
              }
            }
          }
        },
      },
    },
  },
});
