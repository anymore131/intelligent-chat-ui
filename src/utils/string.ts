// utils/string.ts
type TruncatePosition = 'start' | 'middle' | 'end';

/**
 * 格式化字符串，超过指定长度时用省略号代替
 * @param str 要格式化的字符串
 * @param maxLength 最大显示长度（默认20）
 * @param ellipsis 省略符号（默认"..."）
 * @param position 截断位置：'start'|'middle'|'end'（默认'end'）
 * @returns 格式化后的字符串
 */
export function truncateString(
  str: string,
  maxLength: number = 10,
  ellipsis: string = '...',
  position: TruncatePosition = 'end'
): string {
  if (str == null) return '';
  if (typeof str !== 'string') str = String(str);
  if (str.length <= maxLength) return str;

  const ellipsisLength = ellipsis.length;
  const actualMaxLength = Math.max(0, maxLength - ellipsisLength);

  switch (position) {
    case 'start':
      return ellipsis + str.slice(-actualMaxLength);
    case 'middle':
      const halfLength = Math.floor(actualMaxLength / 2);
      return str.slice(0, halfLength) + ellipsis + str.slice(-halfLength);
    case 'end':
    default:
      return str.slice(0, actualMaxLength) + ellipsis;
  }
}
