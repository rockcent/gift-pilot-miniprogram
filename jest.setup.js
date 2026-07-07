// Jest 全局 polyfill：TransformStream / ReadableStream 是 Web API，
// @ai-sdk 模块依赖它们；node 22 内置 node:stream/web 暴露等价实现。
const { TransformStream, ReadableStream, WritableStream } = require('node:stream/web');
if (typeof globalThis.TransformStream === 'undefined') {
  globalThis.TransformStream = TransformStream;
}
if (typeof globalThis.ReadableStream === 'undefined') {
  globalThis.ReadableStream = ReadableStream;
}
if (typeof globalThis.WritableStream === 'undefined') {
  globalThis.WritableStream = WritableStream;
}
