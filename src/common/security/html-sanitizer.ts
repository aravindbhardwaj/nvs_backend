import { FilterXSS, type IWhiteList } from 'xss';

const commonAttributes = ['class', 'style'];
const attributes = (...values: string[]): string[] => [
  ...commonAttributes,
  ...values,
];

const whiteList: IWhiteList = {
  p: commonAttributes,
  br: commonAttributes,
  hr: commonAttributes,
  span: commonAttributes,
  div: commonAttributes,
  h1: commonAttributes,
  h2: commonAttributes,
  h3: commonAttributes,
  h4: commonAttributes,
  h5: commonAttributes,
  h6: commonAttributes,
  strong: commonAttributes,
  b: commonAttributes,
  em: commonAttributes,
  i: commonAttributes,
  u: commonAttributes,
  s: commonAttributes,
  sub: commonAttributes,
  sup: commonAttributes,
  blockquote: commonAttributes,
  pre: commonAttributes,
  code: commonAttributes,
  ul: commonAttributes,
  ol: attributes('start', 'type', 'reversed'),
  li: attributes('value'),
  a: attributes('href', 'target', 'rel', 'title'),
  figure: commonAttributes,
  figcaption: commonAttributes,
  img: attributes('src', 'alt', 'title', 'width', 'height', 'loading'),
  table: attributes('width'),
  caption: commonAttributes,
  colgroup: commonAttributes,
  col: attributes('span', 'width'),
  thead: commonAttributes,
  tbody: commonAttributes,
  tfoot: commonAttributes,
  tr: commonAttributes,
  th: attributes('colspan', 'rowspan', 'scope', 'width', 'height'),
  td: attributes('colspan', 'rowspan', 'width', 'height'),
  oembed: attributes('url'),
};

const filter = new FilterXSS({
  whiteList,
  stripIgnoreTag: true,
  stripIgnoreTagBody: [
    'script',
    'style',
    'iframe',
    'object',
    'embed',
    'svg',
    'math',
  ],
  css: {
    whiteList: {
      'text-align': /^(?:left|right|center|justify)$/,
      'vertical-align': /^(?:top|middle|bottom|baseline)$/,
      color:
        /^(?:#[0-9a-f]{3,8}|rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)|[a-z]+)$/i,
      'background-color':
        /^(?:#[0-9a-f]{3,8}|rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)|[a-z]+)$/i,
      width: /^\d+(?:\.\d+)?(?:px|em|rem|%|vh|vw)?$/,
      height: /^\d+(?:\.\d+)?(?:px|em|rem|%|vh|vw)?$/,
      margin:
        /^\d+(?:\.\d+)?(?:px|em|rem|%)(?:\s+\d+(?:\.\d+)?(?:px|em|rem|%)){0,3}$/,
      'margin-left': /^\d+(?:\.\d+)?(?:px|em|rem|%|vh|vw)?$/,
      'margin-right': /^\d+(?:\.\d+)?(?:px|em|rem|%|vh|vw)?$/,
    },
  },
});

export function sanitizeRichText(value: unknown): unknown {
  if (typeof value !== 'string') return value;
  return filter.process(value.trim());
}
