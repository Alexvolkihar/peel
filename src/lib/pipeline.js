import { SIZES } from '../config'
import { findSubjectBox } from './image'
import { keepMainSubject } from './mainSubject'
import { refineMask } from './refine'

/** Raw model cut-out → cleaned mask (full size) and the box around the subject. */
export function buildCutout(rawCutout, { cutoutLevel, mainSubject }) {
  const refined = refineMask(rawCutout, cutoutLevel)
  const cleaned = mainSubject.on ? keepMainSubject(refined, mainSubject.separation) : refined
  return { refined: cleaned, box: findSubjectBox(cleaned) }
}

/** Output size of a scene; "original" follows the source photo. */
export function sceneDimensions(scene, original) {
  const { w, h } = SIZES.find((size) => size.id === scene.size)
  return w ? { width: w, height: h } : { width: original.naturalWidth, height: original.naturalHeight }
}
