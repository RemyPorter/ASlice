const GR = 1.618;
const THRESH = 3;

let speed = 1;

let capture;
let lastFrame;
let displayFrame;
class Slice
{
    constructor(x,y,w,h)
    {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.hit = 0;
    }
}

function sliceFactory(x,y,w,h,depth,maxDepth)
{
    if (depth > maxDepth) return [];
    if (depth > 0) {res = [new Slice(x,y,w,h)]} else {res = []};
    res = res.concat(sliceFactory(x,y,w,h/GR,depth+1,maxDepth));
    res = res.concat(sliceFactory(x,y+h/GR,w,h-h/GR,depth+1,maxDepth));
    res = res.concat(sliceFactory(x,y,w/GR,h,depth+1,maxDepth));
    res = res.concat(sliceFactory(x+w/GR,y,w-w/GR,h,depth+1,maxDepth));
    res = res.concat(sliceFactory(x,y,w,(h-h/GR),depth+1,maxDepth));
    res = res.concat(sliceFactory(x,y+(h-h/GR),w,h/GR,depth+1,maxDepth));
    res = res.concat(sliceFactory(x+(w-w/GR),y,w/GR,h,depth+1,maxDepth));
    return res;
}

class SliceTree
{
    constructor(width,height)
    {
        this.slices = sliceFactory(0,0,width,height,0,5);
        this.hits = 0;
    }

    reset()
    {
        this.hits = 0;
        this.slices.forEach((s) => { s.hit = 0; })
    }

    pickSlice()
    {
        this.hits++;
        if (this.hits >= this.slices.length * THRESH) this.reset();
        const candidates = this.slices.filter((s) => s.hit < THRESH);
        let r = int(random() * candidates.length);
        let slice = candidates[r];
        slice.hit++;
        return slice;
    }

}

let sliced;

function doSlice() {
    const slice = sliced.pickSlice();
    const portion = lastFrame.get(slice.x, slice.y, slice.w, slice.h);
    portion.filter(POSTERIZE, 5);
    portion.filter(BLUR, 2);
    displayFrame.set(slice.x, slice.y, portion);
}

function windowResized()
{
    resizeCanvas(windowWidth, windowHeight);
    lastFrame.resizeCanvas(windowWidth, windowHeight)
    displayFrame.resizeCanvas(windowWidth, windowHeight);
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    sliced = new SliceTree(width, height);

    capture = createCapture(VIDEO);
    capture.hide();

    describe('A video stream from the webcam sliced over time');

    lastFrame = createGraphics(width, height);
    displayFrame = createGraphics(width, height);
}

function draw() {
    lastFrame.image(capture, 0, 0, width, width * capture.height / capture.width);
    for (let i = 0; i < speed; i++)
    {
        doSlice();
        image(displayFrame, 0, 0);
    }
}

function mouseClicked()
{
    const fname = crypto.randomUUID();
    saveCanvas(fname, "png");
}

function keyPressed()
{
    switch(key)
    {
        case "+": 
            speed++;
            break;
        case "-":
            speed--;
            speed = speed > 0 ? speed : 1;
            break;
    }
}