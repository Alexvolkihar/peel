export const SIZES = [
  { id: 'original', label: 'Original', ratio: '4/3' },
  { id: 'square', label: 'Carré 1:1', w: 1080, h: 1080 },
  { id: 'portrait', label: 'Portrait 4:5', w: 1080, h: 1350 },
  { id: 'story', label: 'Story 9:16', w: 1080, h: 1920 },
  { id: 'wide', label: 'Paysage 16:9', w: 1920, h: 1080 },
  { id: 'classic', label: 'Photo 3:2', w: 1620, h: 1080 },
].map((size) => ({ ...size, ratio: size.ratio ?? `${size.w}/${size.h}` }))

export const COLORS = ['#ffffff', '#f5f4f0', '#ebe8ff', '#e5ed49', '#492ffb', '#0f1011', '#ff4040', '#f5b63d', '#00cd9c', '#aa4fff']

export const GRADIENTS = [
  ['#ebe8ff', '#ffffff'], ['#492ffb', '#aa4fff'], ['#f5b63d', '#ff4040'],
  ['#00cd9c', '#e5ed49'], ['#0f1011', '#393a40'], ['#ffd9e8', '#ebe8ff'],
]

export const BG_KINDS = [
  { id: 'none', label: 'Transparent' },
  { id: 'color', label: 'Couleur' },
  { id: 'gradient', label: 'Dégradé' },
  { id: 'scene', label: 'Scène' },
  { id: 'blur', label: 'Flou' },
  { id: 'image', label: 'Image' },
]

export const SHADOW_KINDS = [
  { id: 'none', label: 'Aucune' },
  { id: 'drop', label: 'Portée' },
  { id: 'ground', label: 'Au sol' },
]

export const EXPORT_FORMATS = {
  png: { mime: 'image/png', ext: 'png' },
  jpeg: { mime: 'image/jpeg', ext: 'jpg' },
  webp: { mime: 'image/webp', ext: 'webp' },
}

export const TABS = [
  { id: 'cutout', label: 'Détourage', icon: 'M9 4 4 9l5 5M4 9h9a6 6 0 0 1 0 12h-2' },
  { id: 'background', label: 'Arrière-plan', icon: 'M3 5h18v14H3zM3 15l5-5 5 5 3-3 5 5' },
  { id: 'shadow', label: 'Ombre', icon: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 3v18' },
  { id: 'size', label: 'Format', icon: 'M4 4h16v16H4zM9 4v16M4 9h16' },
  { id: 'adjust', label: 'Retouche', icon: 'M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M14 4v4M8 10v4M16 16v4' },
]

export const BASE_DIMENSION = 1080

export const CUTOUT_MAX_SIDE = 2048

export const createScene = () => ({
  size: 'square',
  cutoutLevel: 50,
  mainSubject: { on: false, separation: 50 },
  bg: { kind: 'none', color: '#ffffff', gradient: GRADIENTS[0], scene: 'studio', blur: 24 },
  subject: { x: 0.5, y: 0.5, scale: 0.8, rotate: 0, flip: false, brightness: 100, contrast: 100, saturate: 100 },
  shadow: { kind: 'none', opacity: 0.35, blur: 40, offset: 24 },
})
