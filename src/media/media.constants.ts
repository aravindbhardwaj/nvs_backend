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
    odt: ['application/vnd.oasis.opendocument.text'],
    ods: ['application/vnd.oasis.opendocument.spreadsheet'],
    odp: ['application/vnd.oasis.opendocument.presentation'],
    txt: ['text/plain'],
  };

const configuredUploadSize = Number(process.env.MAX_UPLOAD_SIZE);

export const MAX_UPLOAD_SIZE =
  Number.isSafeInteger(configuredUploadSize) && configuredUploadSize > 0
    ? configuredUploadSize
    : 20 * 1024 * 1024;
import 'dotenv/config';
