function sanitizeFileName(fileName: string): string {
  return fileName
    .trim()
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function buildDocumentStorageKey(patientId: string, fileName: string): string {
  const normalizedFileName = sanitizeFileName(fileName) || 'document';

  return `documents/${patientId}/${Date.now()}-${normalizedFileName}`;
}
