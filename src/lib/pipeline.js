import { SIZES } from '../config'
import { cropToSubject } from './image'
import { keepMainSubject } from './mainSubject'
import { refineMask } from './refine'

/** Raw model cut-out → cleaned, cropped subject, according to the scene's cut-out settings. */
export function buildCutout(rawCutout, { cutoutLevel, mainSubject }) {
  const refined = refineMask(rawCutout, cutoutLevel)
  return cropToSubject(mainSubject.on ? keepMainSubject(refined, mainSubject.separation) : refined)
}

/** Output size of a scene; "original" follows the source photo. */
export function sceneDimensions(scene, original) {
  const { w, h } = SIZES.find((size) => size.id === scene.size)
  return w ? { width: w, height: h } : { width: original.naturalWidth, height: original.naturalHeight }
}
