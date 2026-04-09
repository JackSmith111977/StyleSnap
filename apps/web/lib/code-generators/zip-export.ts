/**
 * ZIP Export - ZIP 打包和下载工具
 * 将生成的代码打包成 ZIP 文件并下载
 */

import * as JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { type DesignTokens } from '@/stores/workspace-store';
import { generateCSS } from './css-generator';
import { generateHTML } from './html-generator';
import { generateREADME } from './readme-generator';

/**
 * ZIP 导出选项
 */
export interface ZipExportOptions {
  /** 风格名称 */
  styleName: string;
  /** 设计变量 */
  tokens: DesignTokens;
}

/**
 * 生成 ZIP 并下载
 * @param options - 导出选项
 */
export async function exportToZip(options: ZipExportOptions): Promise<void> {
  const zip = new JSZip();
  const { styleName, tokens } = options;

  // 生成所有文件内容
  const css = generateCSS(tokens);
  const html = generateHTML(tokens, styleName);
  const readme = generateREADME({ styleName, tokens });

  // 添加到 ZIP
  zip.file('styles.css', css.variables);
  zip.file('styles.module.css', css.modules);
  zip.file('index.html', html.index);
  zip.file('README.md', readme);

  // 生成并下载
  const blob = await zip.generateAsync({ type: 'blob' });
  const timestamp = new Date().toISOString().split('T')[0];
  const safeName = styleName.replace(/[^a-z0-9]/gi, '-').toLowerCase();
  const filename = `stylesnap-export-${safeName}-${timestamp}.zip`;

  saveAs(blob, filename);
}

/**
 * 生成 ZIP Blob（不立即下载，用于预览或其他用途）
 * @param options - 导出选项
 * @returns ZIP Blob
 */
export async function generateZipBlob(options: ZipExportOptions): Promise<Blob> {
  const zip = new JSZip();
  const { styleName, tokens } = options;

  // 生成所有文件内容
  const css = generateCSS(tokens);
  const html = generateHTML(tokens, styleName);
  const readme = generateREADME({ styleName, tokens });

  // 添加到 ZIP
  zip.file('styles.css', css.variables);
  zip.file('styles.module.css', css.modules);
  zip.file('index.html', html.index);
  zip.file('README.md', readme);

  // 生成 Blob
  return await zip.generateAsync({ type: 'blob' });
}
