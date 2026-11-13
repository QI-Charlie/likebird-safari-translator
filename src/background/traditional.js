import { Converter } from 'opencc-js/cn2t';

let convert;

export function toTraditional(text, slots = 1) {
  convert ??= Converter({ from: 'cn', to: 't' });
  if (slots === 1) return convertText(text);

  // Convert across inline boundaries so e.g. 頭 and 髮 remain correct in separate spans.
  const parts = text.split(/(<\/?x\d+>)/g);
  const plain = parts.filter((_, index) => index % 2 === 0).join('');
  const converted = [...convertText(plain)];
  if (converted.length !== [...plain].length) {
    return parts.map((part, index) => index % 2 ? part : convertText(part)).join('');
  }
  let offset = 0;
  return parts.map((part, index) => {
    if (index % 2) return part;
    const length = [...part].length;
    const value = converted.slice(offset, offset + length).join('');
    offset += length;
    return value;
  }).join('');
}

function convertText(text) {
  // URLs and email addresses may contain Han characters but are identifiers.
  return text.split(/((?:https?:\/\/|www\.)[^\s<>]+|[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+)/i)
    .map((part, index) => index % 2 ? part : convert(part)).join('');
}

export function isChinese(text, language = '') {
  const lang = language.toLowerCase();
  if (/^(?:ja|ko)(?:-|$)/.test(lang)) return false;
  if (/[\u3040-\u30ff\uac00-\ud7af]/.test(text)) return false;
  const plain = text.replace(/<\/?x\d+>/g, '');
  const han = plain.match(/\p{Script=Han}/gu)?.length || 0;
  if (!han) return false;
  if (/^(?:zh|cmn|yue)(?:-|$)/.test(lang)) return true;
  return han * 2 >= (plain.match(/\p{L}/gu)?.length || 0);
}
