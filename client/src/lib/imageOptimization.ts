export interface OptimizedImage {
  file: File
  originalSize: number
  width: number
  height: number
}

const MAX_WIDTH = 1600
const MAX_HEIGHT = 2400
const OUTPUT_QUALITY = 0.82
const COMPRESS_THRESHOLD = 600 * 1024

type DrawableImage = ImageBitmap | HTMLImageElement

function getDimensions(image: DrawableImage): { width: number; height: number } {
  if ('naturalWidth' in image) {
    return { width: image.naturalWidth, height: image.naturalHeight }
  }
  return { width: image.width, height: image.height }
}

async function loadImage(file: File): Promise<DrawableImage> {
  if (typeof createImageBitmap === 'function') {
    try {
      return await createImageBitmap(file, { imageOrientation: 'from-image' })
    } catch {
      // Fall back to an <img> element below.
    }
  }

  const url = URL.createObjectURL(file)
  try {
    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image()
      image.onload = () => resolve(image)
      image.onerror = () => reject(new Error('We could not read that image.'))
      image.src = url
    })
  } finally {
    URL.revokeObjectURL(url)
  }
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob(resolve, type, quality)
  })
}

function extensionFor(type: string): string {
  if (type === 'image/jpeg') return 'jpg'
  if (type === 'image/webp') return 'webp'
  return 'png'
}

export async function optimizeImage(file: File): Promise<OptimizedImage> {
  const image = await loadImage(file)
  const source = getDimensions(image)

  if (!source.width || !source.height) {
    if ('close' in image) image.close()
    throw new Error('That image has no readable dimensions.')
  }

  const scale = Math.min(
    1,
    MAX_WIDTH / source.width,
    MAX_HEIGHT / source.height,
  )
  const width = Math.max(1, Math.round(source.width * scale))
  const height = Math.max(1, Math.round(source.height * scale))

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')

  if (!context) {
    if ('close' in image) image.close()
    throw new Error('Your browser could not process that image.')
  }

  context.fillStyle = '#ffffff'
  context.fillRect(0, 0, width, height)
  context.imageSmoothingEnabled = true
  context.imageSmoothingQuality = 'high'
  context.drawImage(image, 0, 0, width, height)

  if ('close' in image) image.close()

  if (scale === 1 && file.size <= COMPRESS_THRESHOLD) {
    return {
      file,
      originalSize: file.size,
      width: source.width,
      height: source.height,
    }
  }

  let blob = await canvasToBlob(canvas, 'image/webp', OUTPUT_QUALITY)
  if (!blob || blob.type !== 'image/webp') {
    blob = await canvasToBlob(canvas, 'image/jpeg', 0.86)
  }

  if (!blob || blob.size >= file.size) {
    return {
      file,
      originalSize: file.size,
      width: source.width,
      height: source.height,
    }
  }

  const extension = extensionFor(blob.type)
  const name = file.name.replace(/\.[^.]+$/, '')
  const optimizedFile = new File([blob], `${name}.${extension}`, {
    type: blob.type,
    lastModified: Date.now(),
  })

  return {
    file: optimizedFile,
    originalSize: file.size,
    width,
    height,
  }
}
