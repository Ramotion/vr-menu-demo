[![header](http://i.imgur.com/Qfdbkep.png)](http://ramotion.github.io/vr-menu-demo/main.html)

## WebVR Menu Demo

Prototype of a menu system in Virtual Reality controlled using only the user's gaze! Requires a cutting-edge browser and a Google Cardboard (or similarly compatible) device. While current browser support for native VR headsets (Vive/Oculus) is poor, it should rapidly improve in the near future. When it does, this demo should support them, too.

[Try it!](http://ramotion.github.io/vr-menu-demo/main.html)

### Running the demo locally

To run this demo yourself, simply start a static file server (e.g., with [Node](https://www.npmjs.com/package/static-server)) in the project root and navigate to `main.html` in your browser.

### Technical details

This project is written using [Three.js](https://github.com/mrdoob/three.js) and [WebVR Polyfill](https://github.com/googlevr/webvr-polyfill). A microframework in [main.js](https://github.com/Ramotion/vr-menu-demo/blob/master/main.js) declares a [Rust](https://github.com/rust-lang/rust)-inspired ownership model for handling 3D scenes and takes cares of meta-concerns like dependency retrieval, fullscreen/VR swapping, and rendering calls. The scene itself is in [MenuScene.js](https://github.com/Ramotion/vr-menu-demo/blob/master/MenuScene.js) and declares the 3D content and interactions.

## Follow Us

[![Twitter URL](https://img.shields.io/twitter/url/http/shields.io.svg?style=social)](https://twitter.com/intent/tweet?text=https://github.com/ramotion/vr-menu-demo)
[![Twitter Follow](https://img.shields.io/twitter/follow/ramotion.svg?style=social)](https://twitter.com/ramotion)
