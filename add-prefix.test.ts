import transform from './add-mw-prefix';
import { API, FileInfo, Options, JSCodeshift } from 'jscodeshift';
import jscodeshift from 'jscodeshift';

// Correctly mock jscodeshift API by using the actual jscodeshift import
const mockJSCodeshiftAPI: Partial<API> = {
  jscodeshift: jscodeshift as JSCodeshift,
  report: () => {},
};

// Helper function to run the transform
function runTransform(input: string, options: Partial<Options> = {}): string {
  const output = transform(
    { source: input, path: 'test.ts' } as FileInfo,
    mockJSCodeshiftAPI as API,
    options as Options
  );
  return typeof output === 'string' ? output : (output as any).toString();
}

// Test cases
describe('Tailwind prefix codemod', () => {
  it('should add prefix to valid Tailwind classes', () => {
    const input = `
      const className = "bg-red-500 text-white p-4";
      const element = <div className="hover:bg-blue-600 focus:outline-none" />;
    `;
    const expected = `
      const className = "mw-bg-red-500 mw-text-white mw-p-4";
      const element = <div className="mw-hover:bg-blue-600 mw-focus:outline-none" />;
    `;
    expect(runTransform(input)).toBe(expected);
  });

  it('should not modify import statements', () => {
    const input = `
      import Toast from "./index";
      const className = "bg-red-500";
    `;
    const expected = `
      import Toast from "./index";
      const className = "mw-bg-red-500";
    `;
    expect(runTransform(input)).toBe(expected);
  });

  it('should handle arbitrary values', () => {
    const input = `
      const className = "bg-[#123456] text-[22px]";
    `;
    const expected = `
      const className = "mw-bg-[#123456] mw-text-[22px]";
    `;
    expect(runTransform(input)).toBe(expected);
  });

  it('should not modify non-Tailwind classes', () => {
    const input = `
      const className = "custom-class bg-red-500 another-custom-class";
    `;
    const expected = `
      const className = "custom-class mw-bg-red-500 another-custom-class";
    `;
    expect(runTransform(input)).toBe(expected);
  });

  it('should handle HTML files', () => {
    const input = `
      <div class="bg-red-500 text-white p-4">
        <span class="font-bold">Hello</span>
      </div>
    `;
    const expected = `
      <div class="mw-bg-red-500 mw-text-white mw-p-4">
        <span class="mw-font-bold">Hello</span>
      </div>
    `;
    expect(runTransform(input, { path: 'test.html' })).toBe(expected);
  });

  it('should use custom prefix when provided', () => {
    const input = `
      const className = "bg-red-500 text-white";
    `;
    const expected = `
      const className = "custom-bg-red-500 custom-text-white";
    `;
    expect(runTransform(input, { prefix: 'custom-' })).toBe(expected);
  });

  it('should handle multiple class names in a single attribute', () => {
    const input = `
      const className = "bg-red-500 text-white p-4 hover:bg-blue-600 focus:outline-none";
    `;
    const expected = `
      const className = "mw-bg-red-500 mw-text-white mw-p-4 mw-hover:bg-blue-600 mw-focus:outline-none";
    `;
    expect(runTransform(input)).toBe(expected);
  });

  it('should handle class names with special characters', () => {
    const input = `
      const className = "bg-red-500/50 text-white/75 p-4";
    `;
    const expected = `
      const className = "mw-bg-red-500/50 mw-text-white/75 mw-p-4";
    `;
    expect(runTransform(input)).toBe(expected);
  });

  it('should handle class names with pseudo-classes', () => {
    const input = `
      const className = "hover:bg-red-500 focus:bg-blue-500 active:bg-green-500";
    `;
    const expected = `
      const className = "mw-hover:bg-red-500 mw-focus:bg-blue-500 mw-active:bg-green-500";
    `;
    expect(runTransform(input)).toBe(expected);
  });

  it('should handle class names with responsive prefixes', () => {
    const input = `
      const className = "sm:bg-red-500 md:bg-blue-500 lg:bg-green-500 xl:bg-yellow-500";
    `;
    const expected = `
      const className = "mw-sm:bg-red-500 mw-md:bg-blue-500 mw-lg:bg-green-500 mw-xl:bg-yellow-500";
    `;
    expect(runTransform(input)).toBe(expected);
  });
});
