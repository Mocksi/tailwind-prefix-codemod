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
      const element = <div className="hover:mw-bg-blue-600 focus:outline-none" />;
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
    const input = `const className = "bg-red-500 text-white p-4 hover:bg-blue-600 focus:outline-none";`;
    const expected = `const className = "mw-bg-red-500 mw-text-white mw-p-4 hover:mw-bg-blue-600 focus:outline-none";`;

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
      const className = "hover:mw-bg-red-500 focus:mw-bg-blue-500 active:mw-bg-green-500";
    `;
    expect(runTransform(input)).toBe(expected);
  });

  it('should handle class names with responsive prefixes', () => {
    const input = `
      const className = "sm:bg-red-500 md:bg-blue-500 lg:bg-green-500 xl:bg-yellow-500";
    `;
    const expected = `
      const className = "sm:mw-bg-red-500 md:mw-bg-blue-500 lg:mw-bg-green-500 xl:mw-bg-yellow-500";
    `;
    expect(runTransform(input)).toBe(expected);
  });

  it('should add prefix after responsive and state modifiers', () => {
    const input = `
      const className = "sm:bg-red-500 md:text-xl hover:bg-blue-500 focus:outline-none";
    `;
    const expected = `
      const className = "sm:mw-bg-red-500 md:mw-text-xl hover:mw-bg-blue-500 focus:outline-none";
    `;
    expect(runTransform(input)).toBe(expected);
  });

  it('should handle negative values correctly', () => {
    const input = `
      const className = "-mt-8 -mx-4";
    `;
    const expected = `
      const className = "-mw-mt-8 -mw-mx-4";
    `;
    expect(runTransform(input)).toBe(expected);
  });

  it('should not modify custom utility classes', () => {
    const input = `const className = "bg-brand-gradient hover:bg-brand-gradient text-lg";`;
    const expected = `const className = "mw-bg-brand-gradient hover:mw-bg-brand-gradient mw-text-lg";`;
    expect(runTransform(input)).toBe(expected);
  });

  it('should handle a mix of Tailwind and custom classes', () => {
    const input = `const className = "custom-class sm:bg-red-500 hover:custom-hover md:text-xl -mt-4";`;
    const expected = `const className = "custom-class sm:mw-bg-red-500 hover:custom-hover md:mw-text-xl -mw-mt-4";`;
    expect(runTransform(input)).toBe(expected);
  });

  it('should handle flex correctly', () => {
    const input = `
      const className = "flex flex-row";
    `;
    const expected = `
      const className = "mw-flex mw-flex-row";
    `;
    expect(runTransform(input)).toBe(expected);
  });

  it('should handle items-center correctly', () => {
    const input = `
      const className = "items-center";
    `;
    const expected = `
      const className = "mw-items-center";
    `;
    expect(runTransform(input)).toBe(expected);
  });

  it('should handle remaining classes correctly', () => {
    const input = `const className = "justify-center relative absolute top-0 left-0 font-bold py-4 mr-2 mt-1 right-9 cursor-pointer gap-[5px] underline border rounded-full";`;
    const expected = `const className = "mw-justify-center mw-relative mw-absolute mw-top-0 mw-left-0 mw-font-bold mw-py-4 mw-mr-2 mw-mt-1 mw-right-9 mw-cursor-pointer mw-gap-[5px] mw-underline mw-border mw-rounded-full";`;
    expect(runTransform(input)).toBe(expected);
  });

  it('should handle complex combinations of classes', () => {
    const input = `
    const className = "sm:hover:bg-red-500 md:focus:text-xl lg:active:p-4";
  `;
  const expected = `
    const className = "sm:hover:bg-red-500 md:focus:text-xl lg:active:p-4";
  `;
  expect(runTransform(input)).toBe(expected);
  });

  it('should not add prefix to already prefixed classes', () => {
    const input = `
      const className = "mw-bg-red-500 text-white mw-p-4";
    `;
    const expected = `
      const className = "mw-bg-red-500 mw-text-white mw-p-4";
    `;
    expect(runTransform(input)).toBe(expected);
  });

  it('should handle group and peer classes correctly', () => {
    const input = `
    const className = "group-hover:bg-red-500 peer-focus:text-xl";
  `;
  const expected = `
    const className = "group-hover:mw-bg-red-500 peer-focus:text-xl";
  `;
  expect(runTransform(input)).toBe(expected);
  });

  it('should handle arbitrary properties correctly', () => {
    const input = `
      const className = "[&>*]:border-red-500 [mask-type:luminance] [--scroll-offset:56px]";
    `;
    const expected = `
      const className = "[&>*]:border-red-500 [mask-type:luminance] [--scroll-offset:56px]";
    `;
    expect(runTransform(input)).toBe(expected);
  });

  it('should not modify class names within comments', () => {
    const input = `
      // This is a comment with bg-red-500 and text-white
      const className = "bg-blue-500";
    `;
    const expected = `
      // This is a comment with bg-red-500 and text-white
      const className = "mw-bg-blue-500";
    `;
    expect(runTransform(input)).toBe(expected);
  });
});
