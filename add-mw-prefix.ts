import { API, FileInfo, Options } from 'jscodeshift';

const defaultPrefix = 'mw-';

function addPrefixToClasses(classString: string, prefix: string): string {
  const tailwindRegex = /^(-?)((sm|md|lg|xl|2xl|hover|focus|active|group-hover|focus-within|disabled):)?(bg-|text-|p[xy]?-|m[xytrblf]?-|w-|h-|flex$|flex-|items-|justify-|relative$|absolute$|top-|left-|right-|bottom-|font-|cursor-|gap-|underline$|border$|rounded-)([\w-/[\]#%\.]+)?/;

  const classes = classString.split(' ');
  const prefixedClasses = classes.map((cls: string) => {
    const match = cls.match(tailwindRegex);
    if (match) {
      const [, negative, modifier, , utility, value] = match;
      // Check if it's a custom utility class (doesn't start with a known Tailwind utility)
      if (!utility) {
        return cls; // Don't modify custom utility classes
      }
      return `${negative}${modifier || ''}${prefix}${utility}${value || ''}`;
    }
    return cls;
  });

  return prefixedClasses.join(' ');
}

interface ElementWithAttributes {
  openingElement?: {
    attributes?: any[];
  };
}

function transformJSXAttributes(path: any, prefix: string): void {
  if (path.node && Array.isArray(path.node.attributes)) {
    path.node.attributes.forEach((attr: any) => {
      if (attr.name && (attr.name.name === 'className' || attr.name.name === 'class') && attr.value) {
        if (attr.value.type === 'Literal') {
          attr.value.value = addPrefixToClasses(attr.value.value, prefix);
        } else if (attr.value.type === 'JSXExpressionContainer' && attr.value.expression.type === 'StringLiteral') {
          attr.value.expression.value = addPrefixToClasses(attr.value.expression.value, prefix);
        }
      }
      // Recursively transform attributes of nested elements
      if (attr.value && attr.value.expression && attr.value.expression.type === 'JSXElement') {
        transformJSXAttributes({ node: attr.value.expression.openingElement }, prefix);
      }
    });
  }
}

function transform(file: FileInfo, api: API, options: Options): string {
  const j = api.jscodeshift;
  const root = j(file.source);
  const prefix = options.prefix || defaultPrefix;

  // Transform JSX className and class attributes
  root.find(j.JSXOpeningElement).forEach((path: any) => transformJSXAttributes(path, prefix));

  // Transform string literals in JavaScript/TypeScript
  root.find(j.Literal).forEach((path: any) => {
    if (typeof path.node.value === 'string') {
      path.node.value = addPrefixToClasses(path.node.value, prefix);
    }
  });

  // Transform HTML class attributes
  root.find(j.JSXAttribute, { name: { name: 'class' } }).forEach((path: any) => {
    if (path.node.value && path.node.value.type === 'Literal') {
      path.node.value.value = addPrefixToClasses(path.node.value.value, prefix);
    }
  });

  return root.toSource();
}

export default transform;
