import { promises as fs } from 'fs'
import os from 'os'
import path from 'path'
import { type Config, optimize } from 'svgo' // Import optimize from svgo
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { generateSprite } from '../../scripts/generate-sprite' // Correctly import the exported function

let tempDir: string
let ORIGINAL_CWD: string // Store original CWD for restoration

// Helper function to optimize SVG content similar to the sprite generator
const optimizeSvgContent = (svgContent: string) => {
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
  // IMPORTANT: Use `data` (optimized SVG string) to extract the d attribute
  const { data } = optimize(svgContent, svgoConfig)

  // Find the 'd' attribute value from the first path or polyline in the *optimized* SVG
  const dAttributeMatch = data.match(/(?:<path|<polyline)[^>]*d="([^"]*)"/)
  return dAttributeMatch ? `d="${dAttributeMatch[1]}"` : '' // Return d="value"
}

describe('CLI Integration Test', () => {
  let optimizedActivityContent: string
  let optimizedHomeContent: string
  let optimizedMyLogoContent: string

  beforeEach(async () => {
    ORIGINAL_CWD = process.cwd() // Store original CWD
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'lucide-sprite-test-'))
    process.chdir(tempDir) // Change CWD to the temporary directory

    // Create mock src files
    await fs.mkdir(path.join(tempDir, 'src'), { recursive: true })
    await fs.writeFile(
      path.join(tempDir, 'src/App.tsx'),
      `import { LucideIcon } from 'lucide-react-sprite';
      function App() { return <LucideIcon name="activity" />; }`
    )
    await fs.writeFile(
      path.join(tempDir, 'src/AnotherComponent.tsx'),
      `import { LucideIcon } from 'lucide-react-sprite';
      function AnotherComponent() { return <LucideIcon name="home" />; }`
    )

    // Create mock custom icons directory and files
    await fs.mkdir(path.join(tempDir, 'public/custom-icons'), {
      recursive: true
    })
    await fs.writeFile(
      path.join(tempDir, 'public/custom-icons/my-logo.svg'),
      `<svg viewBox="0 0 24 24"><path d="M12 2L2 22h20z"/></svg>`
    )

    // Create mock SVG files for lucide-static directly in node_modules for test resolution
    const lucideStaticIconsDir = path.join(
      tempDir,
      'node_modules/lucide-static/icons'
    )
    await fs.mkdir(lucideStaticIconsDir, { recursive: true })
    const activitySvgRaw = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-activity">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
      </svg>`
    await fs.writeFile(
      path.join(lucideStaticIconsDir, 'activity.svg'),
      activitySvgRaw
    )
    const homeSvgRaw = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-home">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>`
    await fs.writeFile(path.join(lucideStaticIconsDir, 'home.svg'), homeSvgRaw)

    // Pre-optimize the content to match the sprite generator's output
    optimizedActivityContent = optimizeSvgContent(activitySvgRaw)
    optimizedHomeContent = optimizeSvgContent(homeSvgRaw)
    optimizedMyLogoContent = optimizeSvgContent(
      `<svg viewBox="0 0 24 24"><path d="M12 2L2 22h20z"/></svg>`
    )
  })

  afterEach(async () => {
    process.chdir(ORIGINAL_CWD) // Change back to original CWD
    await fs.rm(tempDir, { recursive: true, force: true })
  })

  it('should generate icons.svg with correct symbols for used lucide and custom icons', async () => {
    // Pass tempDir as the cwd for the sprite generation
    await generateSprite(tempDir)

    const spritePath = path.join(tempDir, 'public/icons.svg')
    const spriteContent = await fs.readFile(spritePath, 'utf-8')

    expect(spriteContent).toBeDefined()
    expect(spriteContent).toContain('<symbol id="activity"')
    // Assert on the optimized inner content
    expect(spriteContent).toContain(optimizedActivityContent)
    expect(spriteContent).toContain('<symbol id="home"')
    expect(spriteContent).toContain(optimizedHomeContent)
    expect(spriteContent).toContain('<symbol id="extend-my-logo"')
    expect(spriteContent).toContain(optimizedMyLogoContent)

    // Ensure unused icons are NOT included (e.g., "bluetooth" is not in our mock App.tsx)
    expect(spriteContent).not.toContain('<symbol id="bluetooth"')
  })
})
