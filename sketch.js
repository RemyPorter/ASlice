let capture;
let lastFrame;
let displayFrame;

const HIT_WEIGHT = 0.9;

class Slice
{
    constructor(x,y,w,h)
    {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.hit = false;
    }
}

function sliceFactory(x,y,w,h,depth,maxDepth)
{
    if (depth > maxDepth) return [];
    if (depth > 0) {res = [new Slice(x,y,w,h)]} else {res = []};
    res = res.concat(sliceFactory(x+ceil(w/2),y,ceil(w/2),ceil(h/2),depth+1,maxDepth));
    res = res.concat(sliceFactory(x,y+ceil(h/2),ceil(w/2),ceil(h/2),depth+1,maxDepth));
    res = res.concat(sliceFactory(x,y,ceil(w/2),ceil(h/2),depth+1,maxDepth));
    res = res.concat(sliceFactory(x+ceil(w/2),y+ceil(h/2),ceil(w/2),ceil(h/2),depth+1,maxDepth));
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
        this.slices.forEach((s) => { s.hit = false; })
    }

    pickSlice()
    {
        this.hits++;
        if (this.hits >= this.slices.length) this.reset();
        const candidates = this.slices.filter((s) => !s.hit);
        let r = int(random() * candidates.length);
        let slice = candidates[r];
        if (!slice) {
            console.log("WHUT?");
        }
        slice.hit = true;
        return slice;
    }

}

let sliced;

function doSlice() {
    const slice = sliced.pickSlice();
    const portion = lastFrame.get(slice.x, slice.y, slice.w, slice.h);
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

    // Create the video capture and hide the element.
    capture = createCapture(VIDEO);
    capture.hide();

    describe('A video stream from the webcam with inverted colors.');

    lastFrame = createGraphics(width, height);
    displayFrame = createGraphics(width, height);
}

function draw() {
    // Draw the video capture within the canvas.
    lastFrame.image(capture, 0, 0, width, width * capture.height / capture.width);
    doSlice();
    image(displayFrame, 0, 0);
}