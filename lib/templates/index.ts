import { modernTemplate } from './modern';
import { classicTemplate } from './classic';
import { minimalTemplate } from './minimal';

export const predefinedTemplates = [
    modernTemplate,
    classicTemplate,
    minimalTemplate,
];

export { modernTemplate, classicTemplate, minimalTemplate };

export type Template = {
    id: string;
    name: string;
    description: string;
    html: string;
    css: string;
}; 