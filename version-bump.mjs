import { readFileSync, writeFileSync } from 'fs';

const targetVersion = process.env.npm_package_version;

// Читаем текущий manifest
const manifest = JSON.parse(readFileSync('manifest.json', 'utf8'));
const versions = JSON.parse(readFileSync('versions.json', 'utf8'));

// Обновляем версию в manifest.json
manifest.version = targetVersion;
writeFileSync('manifest.json', JSON.stringify(manifest, null, 4));

// Обновляем versions.json
versions[targetVersion] = manifest.minAppVersion;
writeFileSync('versions.json', JSON.stringify(versions, null, 4));
