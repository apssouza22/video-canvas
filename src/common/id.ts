export function createElementId(): string {
  return `el-${crypto.randomUUID()}`;
}
