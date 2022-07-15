enum Formatting {

    Plain = 0,
    Bold = 1 << 0, 
    Underline = 1 << 1,

}

enum Foreground {
    fgGray = 30, 
    fgRed = 31, 
    fgGreen = 32,
    fgYellow = 33,
    fgBlue = 34,
    fgPink = 35, 
    fgCyan = 36,
    fgWhite = 37,
}

enum Background {
    bgDarkBlue = 40, 
    bgOrange = 41, 
    bgMarbleBlue = 42, 
    bgTurquoise = 43, 
    bgGray = 44, 
    bgIndigo = 45, 
    bgLightGray = 46, 
    bgWhite = 47
}

interface Stylable {
    underline?: boolean 
    bold?: boolean 

    isUnderline: () => boolean
    isBold: () => boolean 
    isNormal: () => boolean
    hasColor: () => boolean 
    get: () => ReadonlyElement
}


class FormattedText implements Stylable {
    private content: string = "";
    underline?: boolean;
    bold?: boolean;
    color?: boolean;

    constructor(c?: string) {
        if(c) this.content = c;
    }

    isUnderline() {
        return this.underline || false;
    }
    isBold() {
        return this.bold || false;
    }
    
    isNormal() {
        return !this.bold && !this.underline;
    }

    hasColor() {
        return this.color || false;
    }

    private withColor(c: Foreground): string {
        return `[${c}m`
    }

    private withFormat(f: Formatting): string {
        let formattingType;

        if(f & Formatting.Bold) formattingType = 1;
        if(f & Formatting.Underline) formattingType = 4;

        return (
            ((f & Formatting.Underline) > 0 && (f & Formatting.Bold) > 0)
            ? `[1m[4m` 
            : `[${formattingType}m` 
        )
    }

    text(f: Foreground): FormattedText {
        if(!this.content || this.content && this.content.length == 0) return this;
        this.content = `${this.withColor(f)}${this.content}`
        return this;
    }

    background(b: Background): FormattedText {
        if(!this.content || this.content && this.content.length == 0) return this;
        this.content = `${this.withColor(b)}${this.content}`
        return this;
    }

    formatted(f: Formatting): FormattedText {
        if(!this.content || this.content && this.content.length == 0) return this;
        this.content = `${this.withFormat(f)}${this.content}`
        return this;
    }

    newline() {
        this.content += "\n"
    }

    static of(s: string): FormattedText {
        return new FormattedText(s);
    }

    of(s: string): FormattedText {
        this.content = s;
        return this;
    }

    get(): ReadonlyElement {
        return new ReadonlyElement(this.content);
    }


}

class ReadonlyElement {
    private _content: string = "";

    constructor(c: string) {
        this._content = c;
    }

    public get content() {
        return (this._content != "\n" ? "[0m" : "") + this._content;
    }
}

class BaseText implements Stylable {
    private content: string = "";

    constructor(c: string) {
        this.content = c;
    }


    isUnderline() {
        return false;
    }
    isBold() {
        return false;
    }
    
    isNormal() {
        return true;
    }

    hasColor() {
        return false;
    }

    static newline() {
      return new BaseText("\n")
    }

    static of(s: string) {
        return new BaseText(s);
    }

    static empty() {
      return new BaseText("");
    }

    of(s: string) {
        this.content = s;
    }

    get() {
        return new ReadonlyElement(this.content);
    }
}

class Builder {
    private elements: Stylable[] = [];

    constructor(el?: Stylable[]) {
        this.elements = el && el.length > 0 ? el : []
    }

    private append(e: Stylable) {
        this.elements.push(e);
    }

    with(e: Stylable): Builder {
        this.append(e);
        return this;
    }

    get(): string {
        let constructed = "";

        for(let node of this.elements) {
            constructed += node.get().content.split("\n").join("\n\n")
        }

        return [
          `\`\`\`ansi`, constructed, `\`\`\``
        ].join("\n")
    }
}

export default Builder;
