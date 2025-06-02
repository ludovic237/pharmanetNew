export class Category {
    constructor(public id: number,
                public name: string,
                public hasSubCategory: boolean,
                public parentId: number) { }
}