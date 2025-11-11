import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import { resolve } from 'path'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import AutoImport from 'unplugin-auto-import/vite'
import setupExtend from 'unplugin-vue-setup-extend-plus/vite'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import compression from 'vite-plugin-compression'
import { loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  console.log(env.VITE_APP_BASE_API)
  const { VITE_BUILD_COMPRESS } = env
  const isBuild = process.env.NODE_ENV === 'production'

  // =============================
  // Renderer 插件
  // =============================
  const rendererPlugins = [
    vue(),
    vueJsx(),

    // 自动导入 Vue、VueRouter、Pinia API
    AutoImport({
      imports: ['vue', 'vue-router', 'pinia'],
      dts: 'auto-imports.d.ts', // 生成类型文件
      eslintrc: {
        enabled: true, // 生成 eslint 配置文件
        filepath: './.eslintrc-auto-import.json',
        globalsPropValue: true
      }
    }),

    // 支持 <script setup name="">
    setupExtend(),

    // SVG 图标注册
    createSvgIconsPlugin({
      iconDirs: [resolve(process.cwd(), 'src/renderer/src/assets/icons/svg')],
      symbolId: 'icon-[dir]-[name]',
      svgoOptions: isBuild
    })
  ]

  // 打包压缩插件
  if (isBuild && VITE_BUILD_COMPRESS) {
    const compressList = VITE_BUILD_COMPRESS.split(',')
    if (compressList.includes('gzip')) {
      rendererPlugins.push(
        compression({
          ext: '.gz',
          deleteOriginFile: false
        })
      )
    }
    if (compressList.includes('brotli')) {
      rendererPlugins.push(
        compression({
          ext: '.br',
          algorithm: 'brotliCompress',
          deleteOriginFile: false
        })
      )
    }
  }

  return {
    main: {
      plugins: [externalizeDepsPlugin()]
    },
    preload: {
      plugins: [externalizeDepsPlugin()]
    },
    renderer: {
      base: './',
      resolve: {
        alias: {
          '@renderer': resolve('src/renderer/src'),
          '@': resolve('src/renderer/src'), // 若依别名
          '~': resolve('src/renderer') // 若依别名
        },
        extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
      },
      plugins: rendererPlugins,
      server: {
        port: 80,
        host: true,
        open: true,
        proxy: {
          '/dev-api': {
            target: 'http://localhost:8080',
            changeOrigin: true,
            rewrite: (p) => p.replace(/^\/dev-api/, '')
          }
        }
      }
    }
  }
})
