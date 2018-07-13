class Color {

    constructor(r=1, g=0, b=0, a=1) {

        this.rgba = [r, g, b, a];
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }

    get hexa() {
        return ("#" + this.r.toString(16) + this.g.toString(16) + this.b.toString(16) + (this.a * 255).toString(16).substring(0,2));
    }
}

Color.RED = new Color(1, 0, 0, 1);
Color.GREEN = new Color(0, 1, 0, 1);
Color.BLUE = new Color(0, 0, 1, 1);
export default Color;