/**
 * Ensures a base64 string has the proper data URI prefix
 */
export function formatBase64Image(base64Data: string, imageFormat: string = 'png'): string {
  if (!base64Data) return '';
  
  // If already has data URI prefix, use as-is
  if (base64Data.startsWith('data:')) {
    return base64Data;
  }
  
  // Otherwise, add appropriate data URI prefix
  return `data:image/${imageFormat};base64,${base64Data}`;
}

/**
 * Converts a base64 string to a Blob object
 */
export function base64ToBlob(base64Data: string, contentType: string = 'image/png'): Blob {
  // Remove data URI prefix if present
  const base64WithoutPrefix = base64Data.includes('base64,')
    ? base64Data.substring(base64Data.indexOf('base64,') + 7)
    : base64Data;
    
  // Convert base64 to binary
  const binaryString = window.atob(base64WithoutPrefix);
  const bytes = new Uint8Array(binaryString.length);
  
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  // Create blob
  return new Blob([bytes], { type: contentType });
}

/**
 * Downloads a base64 image
 */
export function downloadBase64Image(base64Data: string, fileName: string = 'image', imageFormat: string = 'png'): void {
  const formattedBase64 = formatBase64Image(base64Data, imageFormat);
  
  const link = document.createElement('a');
  link.href = formattedBase64;
  link.download = `${fileName}.${imageFormat}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}