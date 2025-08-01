export const lineRegex = /(?<source>.*)\[(?<value>([0-9,.?]+)|(\([0-9.+\-*/()\s]+\)))(?<currency>[$€£₽¥])?]\s*(?<target>.+?)(\s\[(?<color>.+)])?$/;
export const sankeyInput = document.getElementById('sankey-input-textarea');

