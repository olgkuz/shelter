export const VALIDATION_LIMITS = {
  titleMin: 2,
  titleMax: 140,
  petNameMin: 2,
  petNameMax: 80,
  petDescriptionMin: 10,
  petDescriptionMax: 1000,
  petCharacterMin: 3,
  petCharacterMax: 500,
  specialCareDetailsMin: 5,
  specialCareDetailsMax: 500,
  articleSummaryMin: 10,
  articleSummaryMax: 300,
  articleContentMin: 30,
  articleContentMax: 10000,
  announcementDescriptionMin: 10,
  announcementDescriptionMax: 1500,
  contactNameMin: 2,
  contactNameMax: 60,
  maxImagesCount: 5,
  maxImageSizeBytes: 5 * 1024 * 1024,
  maxFilenameLength: 120
} as const;

export const VALIDATION_PATTERNS = {
  contact: /^(?:\+?[0-9()\-\s]{7,20}|[^\s@]+@[^\s@]+\.[^\s@]{2,})$/i,
  contactHtml: '(?:\\+?[0-9()\\-\\s]{7,20}|[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,})',
  unsafeHtmlChars: /[<>]/,
  contactName: /^[\p{L}\s'-]+$/u,
  imageFileNameUnsafe: /[<>:"/\\|?*\x00-\x1F]/
} as const;

export const ALLOWED_IMAGE_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

export type ImageValidationResult = {
  files: File[];
  names: string[];
  error: string;
};

export function normalizeText(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

export function isValidTitle(value: string): boolean {
  const normalized = normalizeText(value);
  return (
    normalized.length >= VALIDATION_LIMITS.titleMin &&
    normalized.length <= VALIDATION_LIMITS.titleMax &&
    !VALIDATION_PATTERNS.unsafeHtmlChars.test(normalized)
  );
}

export function isValidContact(value: string): boolean {
  return VALIDATION_PATTERNS.contact.test(normalizeText(value));
}

export function isSafeFilename(name: string): boolean {
  if (!name || name.length > VALIDATION_LIMITS.maxFilenameLength) return false;
  if (name.includes('..')) return false;
  return !VALIDATION_PATTERNS.imageFileNameUnsafe.test(name);
}

export function validateImageFiles(files: FileList | null): ImageValidationResult {
  if (!files || files.length === 0) {
    return { files: [], names: [], error: '' };
  }

  if (files.length > VALIDATION_LIMITS.maxImagesCount) {
    return {
      files: [],
      names: [],
      error: `Можно выбрать не более ${VALIDATION_LIMITS.maxImagesCount} изображений.`
    };
  }

  const validFiles: File[] = [];
  const validNames: string[] = [];
  const seen = new Set<string>();

  for (const file of Array.from(files)) {
    const trimmedName = file.name.trim();

    if (!isSafeFilename(trimmedName)) {
      return { files: [], names: [], error: `Некорректное имя файла: ${trimmedName || '(пусто)'}.` };
    }

    if (!ALLOWED_IMAGE_MIME_TYPES.has(file.type)) {
      return { files: [], names: [], error: `Файл ${trimmedName} имеет недопустимый формат.` };
    }

    if (file.size > VALIDATION_LIMITS.maxImageSizeBytes) {
      return {
        files: [],
        names: [],
        error: `Файл ${trimmedName} превышает 5 МБ.`
      };
    }

    const duplicateKey = `${trimmedName.toLowerCase()}_${file.size}`;
    if (seen.has(duplicateKey)) {
      return { files: [], names: [], error: `Файл ${trimmedName} выбран несколько раз.` };
    }

    seen.add(duplicateKey);
    validFiles.push(file);
    validNames.push(trimmedName);
  }

  return { files: validFiles, names: validNames, error: '' };
}
