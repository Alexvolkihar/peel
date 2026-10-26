export const MODELS = [
  { id: 'rmbg', label: 'RMBG · précis', hint: 'Bords très fins, garde tous les objets au premier plan.', load: () => import('./rmbg').then((m) => m.cutOutWithRmbg) },
  { id: 'isnet', label: 'ISNet · sujet isolé', hint: 'Isole surtout le sujet principal, bords un peu moins fins.', load: () => import('./isnet').then((m) => m.cutOutWithIsnet) },
]

/** Runs the chosen model; engines are lazy-loaded so only the one in use is downloaded. */
export async function cutOutSubject(modelId, image, maxSide, onProgress) {
  const cutOut = await MODELS.find((model) => model.id === modelId).load()
  return cutOut(image, maxSide, onProgress)
}
