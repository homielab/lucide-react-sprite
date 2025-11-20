#!/usr/bin/env node
import { parse } from '@babel/parser'
import traverse from '@babel/traverse'
import { promises as fs } from 'fs'
import { glob } from 'glob'
import path from 'path'
import { performance } from 'perf_hooks'
import { type Config, optimize } from 'svgo'

const ORIGINAL_CWD = process.cwd()

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  dim: '\x1b[2m',
  bold: '\x1b[1m'
}

const logger = {
  info: (msg: string) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  success: (msg: string) =>
    console.log(`${colors.green}✔️  ${msg}${colors.reset}`),
  warn: (msg: string) =>
    console.warn(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  error: (msg: string) =>
    console.error(`${colors.red}❌ ${msg}${colors.reset}`),
  log: (msg: string) => console.log(`   ${colors.dim}${msg}${colors.reset}`),
  result: (msg: string) =>
    console.log(`${colors.cyan}✨ ${msg}${colors.reset}`),
  divider: () => console.log(`${colors.dim}${'─'.repeat(60)}${colors.reset}`),
  header: (msg: string) =>
    console.log(`\n${colors.bold}${colors.magenta}🎨 ${msg}${colors.reset}\n`)
}

async function getLucideIcons(cwd: string) {
  logger.info(`Scanning for Lucide icons...`)
  logger.log(`Directories: src/, app/`)

  const files = await glob(
    ['src/**/*.{js,jsx,ts,tsx}', 'app/**/*.{js,jsx,ts,tsx}'],
    { cwd }
  )

  if (files.length === 0) {
    logger.warn('No source files found to scan')
    return new Set<string>()
  }

  logger.log(
    `Scanning ${colors.yellow}${files.length}${colors.reset}${colors.dim} source files...${colors.reset}`
  )
  const iconNames = new Set<string>()
  let filesWithIcons = 0

  for (const file of files) {
    const filePath = path.join(cwd, file)
    try {
      const content = await fs.readFile(filePath, 'utf-8')
      const ast = parse(content, {
        sourceType: 'module',
        plugins: ['jsx', 'typescript']
      })

      const iconsInFile = new Set<string>()
      traverse(ast, {
        JSXOpeningElement(path) {
          if (
            path.node.name.type === 'JSXIdentifier' &&
            path.node.name.name === 'LucideIcon'
          ) {
            const nameAttribute = path.node.attributes.find(
              (attr) =>
                attr.type === 'JSXAttribute' && attr.name.name === 'name'
            )

            if (
              nameAttribute &&
              nameAttribute.type === 'JSXAttribute' &&
              nameAttribute.value?.type === 'StringLiteral'
            ) {
              const iconName = nameAttribute.value.value
              iconNames.add(iconName)
              iconsInFile.add(iconName)
            }
          }
        }
      })

      if (iconsInFile.size > 0) {
        filesWithIcons++
      }
    } catch (error) {
      logger.error(
        `Failed to parse ${path.relative(cwd, filePath)}: ${
          error instanceof Error ? error.message : String(error)
        }`
      )
    }
  }

  if (iconNames.size > 0) {
    logger.success(
      `Found ${colors.bold}${iconNames.size}${colors.reset}${colors.green} Lucide icons in ${filesWithIcons} files`
    )
    logger.log(
      `Icons: ${colors.yellow}${Array.from(iconNames).sort().join(', ')}${
        colors.reset
      }${colors.dim}`
    )
  } else {
    logger.warn('No Lucide icons found in source files')
  }

  return iconNames
}

async function getCustomIcons(cwd: string) {
  logger.info('Scanning for custom icons...')
  logger.log(`Directory: public/custom-icons/`)

  const customIconsDir = path.join(cwd, 'public/custom-icons')
  try {
    await fs.access(customIconsDir)
  } catch {
    logger.log('Custom icons directory not found, skipping...')
    return []
  }

  const files = await glob('public/custom-icons/**/*.svg', { cwd })

  if (files.length > 0) {
    const iconNames = files.map((f) => path.basename(f, '.svg'))
    logger.success(
      `Found ${colors.bold}${files.length}${colors.reset}${colors.green} custom icons`
    )
    logger.log(
      `Icons: ${colors.yellow}${iconNames.sort().join(', ')}${colors.reset}${
        colors.dim
      }`
    )
  } else {
    logger.log('No custom icons found')
  }

  return files
}

function processSvg(svgContent: string, svgoConfig: Config) {
  const { data } = optimize(svgContent, svgoConfig)
  const innerContent = data.match(/<svg[^>]*>([\s\S]*)<\/svg>/)?.[1] ?? ''
  let attributes = data.match(/<svg([^>]*)>/)?.[1] ?? ''

  // Remove unwanted attributes using a more robust regex
  attributes = attributes.replace(/\s(width|height|class|xmlns)="[^"]*"/g, '')

  return {
    content: innerContent,
    attributes: attributes.trim() // Trim whitespace
  }
}

export async function generateSprite(cwd: string = ORIGINAL_CWD) {
  const generateAll = process.argv.includes('--all')

  logger.header('Lucide React Sprite Generator')
  logger.info(
    `Working directory: ${colors.cyan}${path.basename(cwd)}${colors.reset}`
  )
  if (generateAll) {
    logger.info(
      `${colors.magenta}Mode: Development (Generating all icons)${colors.reset}`
    )
  } else {
    logger.info(
      `${colors.magenta}Mode: Production (Scanning for used icons)${colors.reset}`
    )
  }

  const startTime = performance.now()
  let originalTotalSize = 0
  let processedLucideIcons = 0
  let processedCustomIcons = 0
  let failedIcons = 0

  const SPRITE_PATH = path.join(cwd, 'public/icons.svg')
  logger.log(`Output: public/icons.svg`)
  logger.divider()

  const svgoConfig: Config = {
    plugins: [
      {
        name: 'preset-default',
        params: {
          overrides: {
            removeUnknownsAndDefaults: false,
            removeUselessStrokeAndFill: false
          }
        }
      }
    ]
  }

  // Resolve lucide-static package location using Node's module resolution
  let lucideStaticPath: string
  try {
    const lucideStaticPackage = require.resolve('lucide-static/package.json', {
      paths: [cwd, __dirname]
    })
    lucideStaticPath = path.join(path.dirname(lucideStaticPackage), 'icons')
  } catch (error) {
    logger.error(
      'Failed to resolve lucide-static package. Make sure it is installed.'
    )
    throw error
  }

  let lucideIcons: Set<string>
  if (generateAll) {
    logger.info('Fetching all Lucide icons...')
    const files = await fs.readdir(lucideStaticPath)
    lucideIcons = new Set(
      files
        .filter((f) => f.endsWith('.svg'))
        .map((f) => path.basename(f, '.svg'))
    )
    logger.success(
      `Found ${colors.bold}${lucideIcons.size}${colors.reset}${colors.green} total Lucide icons`
    )
  } else {
    lucideIcons = await getLucideIcons(cwd)
  }

  logger.divider()
  const customIcons = await getCustomIcons(cwd)
  logger.divider()

  const symbols: string[] = []

  // Process Lucide icons
  if (lucideIcons.size > 0) {
    logger.info(`Processing ${lucideIcons.size} Lucide icons...`)

    for (const iconName of lucideIcons) {
      try {
        const iconPath = path.join(lucideStaticPath, `${iconName}.svg`)
        const svgContent = await fs.readFile(iconPath, 'utf-8')
        originalTotalSize += Buffer.byteLength(svgContent, 'utf-8')
        const { content, attributes } = processSvg(svgContent, svgoConfig)
        const finalAttributes = attributes ? ` ${attributes}` : ''
        symbols.push(
          `<symbol id="${iconName}"${finalAttributes}>${content}</symbol>`
        )
        processedLucideIcons++
      } catch (error) {
        failedIcons++
        logger.warn(
          `Failed to process Lucide icon "${iconName}": ${
            error instanceof Error ? error.message : String(error)
          }`
        )
      }
    }
    logger.success(
      `Processed ${processedLucideIcons}/${lucideIcons.size} Lucide icons`
    )
  }

  // Process custom icons
  if (customIcons.length > 0) {
    logger.info(`Processing ${customIcons.length} custom icons...`)
    for (const iconPath of customIcons) {
      const iconName = path.basename(iconPath, '.svg')
      try {
        const fullPath = path.join(cwd, iconPath)
        const svgContent = await fs.readFile(fullPath, 'utf-8')
        originalTotalSize += Buffer.byteLength(svgContent, 'utf-8')
        const { content, attributes } = processSvg(svgContent, svgoConfig)
        const finalAttributes = attributes ? ` ${attributes}` : ''
        symbols.push(
          `<symbol id="extend-${iconName}"${finalAttributes}>${content}</symbol>`
        )
        processedCustomIcons++
      } catch (error) {
        failedIcons++
        logger.error(
          `Failed to process custom icon "${iconName}": ${
            error instanceof Error ? error.message : String(error)
          }`
        )
      }
    }
    logger.success(
      `Processed ${processedCustomIcons}/${customIcons.length} custom icons`
    )
  }

  // Write sprite file
  const sprite = `<svg xmlns="http://www.w3.org/2000/svg" style="display: none;">${symbols.join(
    ''
  )}</svg>`
  await fs.writeFile(SPRITE_PATH, sprite)

  const endTime = performance.now()
  const duration = ((endTime - startTime) / 1000).toFixed(2)
  const finalSize = Buffer.byteLength(sprite, 'utf-8')
  const savings =
    originalTotalSize > 0 ? (1 - finalSize / originalTotalSize) * 100 : 0

  // Final summary
  logger.divider()
  logger.success(`Sprite generated successfully!`)
  logger.divider()

  const totalIcons = processedLucideIcons + processedCustomIcons
  logger.result(`${colors.bold}Summary${colors.reset}`)
  logger.result(
    `├─ Total Icons: ${colors.bold}${totalIcons}${colors.reset} (${processedLucideIcons} Lucide + ${processedCustomIcons} Custom)`
  )
  logger.result(
    `├─ Failed: ${failedIcons > 0 ? colors.red : colors.dim}${failedIcons}${
      colors.reset
    }`
  )
  logger.result(
    `├─ Original Size: ${colors.bold}${(originalTotalSize / 1024).toFixed(
      2
    )} KB${colors.reset}`
  )
  logger.result(
    `├─ Sprite Size: ${colors.bold}${(finalSize / 1024).toFixed(2)} KB${
      colors.reset
    }`
  )
  logger.result(
    `├─ Savings: ${colors.green}${colors.bold}${savings.toFixed(2)}%${
      colors.reset
    }`
  )
  logger.result(`└─ Duration: ${colors.bold}${duration}s${colors.reset}`)
  logger.divider()
}

if (require.main === module) {
  generateSprite(ORIGINAL_CWD).catch((error) => {
    logger.error(
      `Fatal error: ${error instanceof Error ? error.message : String(error)}`
    )
    if (error instanceof Error && error.stack) {
      console.error(colors.dim + error.stack + colors.reset)
    }
    process.exit(1)
  })
}
