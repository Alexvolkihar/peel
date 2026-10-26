# Atelier

Éditeur photo perso inspiré de Photoroom, 100 % local et sans compte : tes photos ne quittent jamais le navigateur.

- Détourage IA (RMBG-1.4 ou ISNet), netteté réglable, outil « sujet principal »
- Arrière-plans : couleur, dégradé, flou, image, scènes (studio, podium, bois…)
- Ombres, formats (1:1, 4:5, 9:16…), retouche
- Export PNG / JPG / WebP, animation produit (WebM), traitement par lots (ZIP)

```
npm install
npm run dev
```

Stack : Vue 3, Vite, `@huggingface/transformers`, `@imgly/background-removal`, `fflate`.
