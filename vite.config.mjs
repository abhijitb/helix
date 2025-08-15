import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig( {
	plugins: [ react() ],
	build: {
		outDir: 'build',
		emptyOutDir: true,
		rollupOptions: {
			input: 'src/App.jsx',
			output: {
				entryFileNames: 'index.js',
			},
		},
	},
} );
