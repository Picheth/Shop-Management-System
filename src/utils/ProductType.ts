import { BaseEntity } from '../types';

export interface ProductType extends BaseEntity {
    code: string;
    name: string;
    description?: string;
    active: boolean;
}

export interface Category extends BaseEntity {
    code: string;
    typeId: string;
    name: string;
    description?: string;
    active: boolean;
}

export interface SubCategory extends BaseEntity {
    code: string;
    categoryId: string;
    name: string;
    description?: string;
    active: boolean;
}

export interface Brand extends BaseEntity {
    code: string;
    name: string;
    shortName?: string;
    country?: string;
}

export interface Variation extends BaseEntity {
    name: string;
    type: string;
    value: string;
}

export interface ProductSpecs extends BaseEntity {
    label: string;
    value: string;
    unit?: string;
}

export interface ProductAttributeSet {
    type?: ProductType;
    category?: Category;
    subCategory?: SubCategory;
    brand?: Brand;
    variations?: Variation[];
    specs?: ProductSpecs[];
}