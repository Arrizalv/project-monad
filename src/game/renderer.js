// ═══════════════════════════════════════════════════════════════
// MONAD PANTHEON — Canvas Renderer (60fps 2D Top-Down) - Updated to 3D
// ═══════════════════════════════════════════════════════════════
import { renderGame as renderGame3D, renderDeityPreview as renderDeityPreview3D } from './renderer3d.js';

/**
 * Render the game state onto the given canvas.
 * Delegates to the Three.js based renderer for full 3D rendering.
 */
export function renderGame(canvas, state) {
  renderGame3D(canvas, state);
}

/**
 * Render a deity preview (used in the selection UI) onto a small canvas.
 * Delegates to the Three.js preview implementation.
 */
export function renderDeityPreview(canvas, idx) {
  renderDeityPreview3D(canvas, idx);
}
