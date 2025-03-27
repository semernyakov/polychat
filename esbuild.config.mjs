import esbuild from 'esbuild';
import process from 'process';
import builtins from 'builtin-modules';
import { exec } from 'child_process';
import { promises as fs } from 'fs';
import postcss from 'postcss';
import autoprefixer from 'autoprefixer';
import postcssPresetEnv from 'postcss-preset-env';
import path from 'path';
import browserslistToEsbuild from 'browserslist-to-esbuild';
import postcssImport from 'postcss-import';
import browserslist from 'browserslist';

const isProduction = process.argv.includes('production');

const banner = `/*
СГЕНЕРИРОВАННЫЙ ФАЙЛ (ESBUILD)
Оригинальный код доступен в репозитории GitHub.
*/`;

function formatDuration(ms) {
  return ms >= 1000 ? `${(ms / 1000).toFixed(2)}s` : `${ms}ms`;
}

const postCssPlugin = {
  name: 'postcss-plugin',
  setup(build) {
    build.onLoad({ filter: /\.css$/ }, async (args) => {
      try {
        const css = await fs.readFile(args.path, 'utf8');
        const result = await postcss([
					postcssImport(), autoprefixer(),	postcssPresetEnv()
					]
				).process(css, {
          from: args.path,
          to: path.join('dist', path.basename(args.path)),
        });
        return { contents: result.css, loader: 'css' };
      } catch (err) {
        return {
          errors: [{ text: `Ошибка PostCSS: ${err.message}`, detail: err }],
        };
      }
    });
  },
};

const copyFilesPlugin = {
  name: 'copy-files',
  setup(build) {
    build.onEnd(async () => {
      const dist = path.join(process.cwd(), 'dist');
      try {
        await fs.copyFile('manifest.json', path.join(dist, 'manifest.json'));
        console.log('📄 manifest.json скопирован в dist/');

        const staticSrc = path.join('src', 'static');
        const staticDest = path.join(dist, 'static');

        try {
          await fs.access(staticSrc);
          await fs.mkdir(staticDest, { recursive: true });
          await fs.cp(staticSrc, staticDest, { recursive: true });
          console.log('📂  Статические файлы скопированы в dist/static/');
        } catch {}
      } catch (err) {
        console.error('❌  Ошибка при копировании файлов:', err);
      }
    });
  },
};

const target = browserslistToEsbuild(browserslist(undefined, { path: process.cwd() }));

const config = {
  banner: { js: banner },
  entryPoints: ['src/main.ts', 'src/styles.css'],
  bundle: true,
  platform: 'node',
	mainFields: ['module', 'main'],
	conditions: ['require', 'node'],
  format: 'cjs',
  target,
  external: ['obsidian', 'electron', '@codemirror/*', '@lezer/*', ...builtins],
  sourcemap: !isProduction ? 'inline' : false,
  minify: isProduction,
  outdir: 'dist',
  treeShaking: true,
  logLevel: 'info',
  plugins: [postCssPlugin, copyFilesPlugin],
  loader: { '.css': 'css' },
};

(async () => {
  const start = Date.now();
  await fs.mkdir('dist', { recursive: true });

  const context = await esbuild.context(config);

  if (isProduction) {
    await context.rebuild();
    console.log(`✅  Продакшен сборка завершена за ${formatDuration(Date.now() - start)}!`);
    process.exit(0);
  } else {
    await context.watch();
    const server = await context.serve({ servedir: 'dist', port: 3000 });
    console.log(`👀  Ожидание изменений (первая сборка: ${formatDuration(Date.now() - start)})`);
    console.log(`🔥  Сервер запущен: http://${server.host}:${server.port}`);

    const obsidianPath = process.env.OBSIDIAN_EXECUTABLE_PATH || 'obsidian';
    exec(obsidianPath, (err) => {
      if (err) {
        console.error(`❌  Не удалось запустить Obsidian (${obsidianPath}):`, err);
      }
    });

    const cleanup = async () => {
      console.log('\n🧹  Завершение работы...');
      await context.dispose();
      process.exit(0);
    };

    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
  }
})();
