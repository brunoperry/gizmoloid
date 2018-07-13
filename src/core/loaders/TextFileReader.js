class TextFileReader {

    constructor(textFile) {

        this.lines = textFile.split("\n");
        this.lineCounter = -1;
    }
    
    readLine() {
        if(this.lineCounter >= this.lines.length - 1) {
            return false;
        } else {
            this.lineCounter++;
            return true;
        }
    }
    
    getLine() {
        return this.lines[this.lineCounter];
    }
}

export default TextFileReader;