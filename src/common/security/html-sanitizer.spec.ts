import 'reflect-metadata';

import { plainToInstance } from 'class-transformer';

import { CreatePageDto } from '../../pages/dto/create-page.dto';
import { UpdatePageDto } from '../../pages/dto/update-page.dto';
import { sanitizeRichText } from './html-sanitizer';

describe('sanitizeRichText', () => {
  it('preserves supported CKEditor links and table markup', () => {
    const html =
      '<p class="intro">Text <a href="https://example.com" target="_blank" rel="noopener">link</a></p>' +
      '<figure class="table"><table><tbody><tr><th colspan="2">Heading</th></tr>' +
      '<tr><td>Value</td><td>Value 2</td></tr></tbody></table></figure>';

    expect(sanitizeRichText(html)).toBe(html);
  });

  it('preserves CKEditor images served by this application', () => {
    const html =
      '<figure class="image"><img src="/api/ckeditor-images/123e4567-e89b-12d3-a456-426614174000.png" alt="Example"></figure>';

    expect(sanitizeRichText(html)).toBe(html);
  });

  it('removes scripts, event handlers, and unsafe URL schemes', () => {
    const result = sanitizeRichText(
      '<script>alert(1)</script><p onclick="alert(2)">Safe</p>' +
        '<a href="javascript:alert(3)">link</a><img src="javascript:alert(4)" onerror="alert(5)">',
    );

    expect(result).toBe('<p>Safe</p><a href>link</a><img src>');
  });

  it('is applied to create and update page rich-text fields', () => {
    const unsafe = '<p onmouseover="alert(1)">Content</p><script>x</script>';

    const createDto = plainToInstance(CreatePageDto, {
      contentEnglish: unsafe,
      contentHindi: unsafe,
    });
    const updateDto = plainToInstance(UpdatePageDto, {
      content2_english: unsafe,
      content4_hindi: unsafe,
    });

    expect(createDto.contentEnglish).toBe('<p>Content</p>');
    expect(createDto.contentHindi).toBe('<p>Content</p>');
    expect(updateDto.content2_english).toBe('<p>Content</p>');
    expect(updateDto.content4_hindi).toBe('<p>Content</p>');
  });

  it('preserves a valid CKEditor chart configuration and canvas', () => {
    const html =
      '<div class="nvs-chart-embed" data-chart-config="{&quot;type&quot;:&quot;bar&quot;,&quot;title&quot;:&quot;&quot;,&quot;labels&quot;:[&quot;Label 1&quot;,&quot;Label 2&quot;,&quot;Label 3&quot;],&quot;datasets&quot;:[{&quot;label&quot;:&quot;Series 1&quot;,&quot;values&quot;:[1,2,3],&quot;color&quot;:&quot;#2563eb&quot;}]}">' +
      '<canvas></canvas></div>';

    expect(sanitizeRichText(html)).toBe(html);
  });

  it('removes malformed or invalid chart configuration', () => {
    const malformed =
      '<div class="nvs-chart-embed" data-chart-config="{bad json}"><canvas></canvas></div>';
    const invalidValues =
      '<div class="nvs-chart-embed" data-chart-config="{&quot;type&quot;:&quot;bar&quot;,&quot;title&quot;:&quot;&quot;,&quot;labels&quot;:[&quot;A&quot;],&quot;datasets&quot;:[{&quot;label&quot;:&quot;Series&quot;,&quot;values&quot;:[&quot;not-a-number&quot;],&quot;color&quot;:&quot;#2563eb&quot;}]}"><canvas></canvas></div>';

    expect(sanitizeRichText(malformed)).toBe(
      '<div class="nvs-chart-embed"><canvas></canvas></div>',
    );
    expect(sanitizeRichText(invalidValues)).toBe(
      '<div class="nvs-chart-embed"><canvas></canvas></div>',
    );
  });

  it('safely encodes HTML-like text inside chart configuration', () => {
    const config = JSON.stringify({
      type: 'bar',
      title: '"><img src=x onerror=alert(1)>',
      labels: ['A'],
      datasets: [{ label: 'Series', values: [1], color: '#2563eb' }],
    }).replace(/"/g, '&quot;');
    const result = sanitizeRichText(
      `<div class="nvs-chart-embed" data-chart-config="${config}"><canvas></canvas></div>`,
    );

    expect(result).toContain('data-chart-config="');
    expect(result).not.toContain('<img');
    expect(result).not.toContain('onerror="');
    expect(result).toContain('<canvas></canvas>');
  });
});
