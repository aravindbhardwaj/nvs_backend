import { escapeAttrValue, FilterXSS, type IWhiteList } from 'xss';

const commonAttributes = ['class', 'style'];
const attributes = (...values: string[]): string[] => [
  ...commonAttributes,
  ...values,
];

type ChartDataset = {
  label: string;
  values: number[];
  color: string;
};

type ChartConfig = {
  type: string;
  title: string;
  labels: string[];
  datasets: ChartDataset[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isBoundedString(value: unknown, maximumLength = 500): value is string {
  return typeof value === 'string' && value.length <= maximumLength;
}

function parseChartDataset(value: unknown): ChartDataset | undefined {
  if (
    !isRecord(value) ||
    !isBoundedString(value.label) ||
    !Array.isArray(value.values) ||
    value.values.length > 500 ||
    !isBoundedString(value.color, 100)
  )
    return undefined;

  const values: unknown[] = value.values;
  if (
    !values.every(
      (item): item is number =>
        typeof item === 'number' && Number.isFinite(item),
    )
  )
    return undefined;

  return { label: value.label, values, color: value.color };
}

function parseChartConfig(value: string): ChartConfig | undefined {
  if (value.length > 50_000) return undefined;
  const decoded = value.replace(/&(?:quot|#34|#x22);/gi, '"');

  try {
    const parsed: unknown = JSON.parse(decoded);
    if (
      !isRecord(parsed) ||
      !isBoundedString(parsed.type, 32) ||
      !/^[a-z][a-z0-9-]*$/i.test(parsed.type) ||
      !isBoundedString(parsed.title) ||
      !Array.isArray(parsed.labels) ||
      parsed.labels.length > 500 ||
      !parsed.labels.every((label) => isBoundedString(label)) ||
      !Array.isArray(parsed.datasets) ||
      parsed.datasets.length > 50
    )
      return undefined;

    const datasets = parsed.datasets.map(parseChartDataset);
    if (datasets.some((dataset) => dataset === undefined)) return undefined;

    return {
      type: parsed.type,
      title: parsed.title,
      labels: parsed.labels,
      datasets: datasets as ChartDataset[],
    };
  } catch {
    return undefined;
  }
}

const whiteList: IWhiteList = {
  p: commonAttributes,
  br: commonAttributes,
  hr: commonAttributes,
  span: commonAttributes,
  div: attributes('data-chart-config'),
  canvas: attributes('width', 'height'),
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
  onTagAttr: (tag, name, value) => {
    if (tag !== 'div' || name !== 'data-chart-config') return undefined;
    const config = parseChartConfig(value);
    if (!config) return '';
    return `data-chart-config="${escapeAttrValue(JSON.stringify(config))}"`;
  },
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
