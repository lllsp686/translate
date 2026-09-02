// Polyfill Uint8Array.prototype.toHex
if (typeof Uint8Array !== 'undefined' && !('toHex' in Uint8Array.prototype)) {
  ;(Uint8Array.prototype as any).toHex = function () {
    return Array.from(this)
      .map((b: any) => b.toString(16).padStart(2, '0'))
      .join('')
  }
}
