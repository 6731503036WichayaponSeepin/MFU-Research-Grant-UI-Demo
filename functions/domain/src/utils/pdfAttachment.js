// Storage references are verified against upload tickets by the trusted API.
export function isPdfAttachment(d) {
  return !!d && d.size > 0 && d.size <= 2 * 1024 * 1024 &&
    (d.dataUrl?.startsWith('data:application/pdf;base64,') ||
      (typeof d.storagePath === 'string' && d.contentType === 'application/pdf'))
}
