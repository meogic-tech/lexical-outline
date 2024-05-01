/**
 * 执行命令vite build --mode development，注意输出的文件在dist_dev目录下
 * 执行命令vite build --mode production
 * 执行命令npm run tsc
 * 将dist_dev目录下的文件移动到dist目录下
 */
async function main() {
    const { execSync } = require('child_process');
    const path = require('path');
    const fs = require('fs');
    const { build } = require('vite');
    await build({
        mode: 'development',
        configFile: 'vite.config.ts',  // 确保指向正确的配置文件
        build: {
            outDir: `dist/`,  // 可以根据模式设置不同的输出目录
            emptyOutDir: true
        },
    });
    const results = await build({
        mode: 'production',
        configFile: 'vite.config.ts',  // 确保指向正确的配置文件
        build: {
            outDir: `dist/`,  // 可以根据模式设置不同的输出目录
            emptyOutDir: false
        },
    });
    let exports = []
    for (const result of results) {
        for (const output of result.output) {
            console.log("output.fileName", output.fileName);
            console.log("output.exports", output.exports);
            exports = output.exports
        }
    }
    const devFileName = 'LexicalOutline.dev.mjs'
    const prodFileName = 'LexicalOutline.prod.mjs'
    const lines = []
    lines.push(
        `import * as modDev from '${devFileName}';`,
        `import * as modProd from '${prodFileName}';`,
        `const mod = process.env.NODE_ENV === 'development' ? modDev : modProd;`,
    );
    for (const name of exports) {
        lines.push(
            name === 'default'
                ? `export default mod.default;`
                : `export const ${name} = mod.${name};`,
        );
    }
    // 把lines写入一个文件dist/LexicalOutline.mjs
    fs.writeFileSync(path.resolve(__dirname, '../dist/LexicalOutline.mjs'), lines.join('\n'));


    execSync('npm run tsc', { stdio: 'inherit' });
}
main()