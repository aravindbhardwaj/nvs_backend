import { getUploadConfiguration } from '../config/upload.config';

export const ALLOWED_MEDIA_TYPES: Readonly<Record<string, readonly string[]>> =
  {
    pdf: ['application/pdf'],
    doc: ['application/msword'],
    docx: [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
    xls: ['application/vnd.ms-excel'],
    xlsx: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
    ppt: ['application/vnd.ms-powerpoint'],
    pptx: [
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ],
  };

export const MAX_UPLOAD_SIZE = getUploadConfiguration().media.maxSize;
