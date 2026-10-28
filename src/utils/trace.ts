/* ai-gateway trace 包装（MVP mock）
 * 单一真源：okResult / errResult 来自 platform/adapter（含 mock 计量），
 * 类型来自 ../types。禁止在此处再定义第二份 ProviderCallResult（宪法 §6）。
 */
export { okResult, errResult } from '../platform/adapter';
export type { ProviderCallResult } from '../types';
