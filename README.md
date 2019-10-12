[![header](./header.png)](https://www.ramotion.com/agency/app-development?utm_source=gthb&utm_medium=special&utm_campaign=vr-menu-demo)
[![preview](./preview.gif)](https://ramotion.github.io/vr-menu-demo/main.html)


## WebVR Menu Demo
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/c502012bcb1b4e90a7255e6ce47e5b1a)](https://www.codacy.com/app/juri-v/vr-menu-demo?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=Ramotion/vr-menu-demo&amp;utm_campaign=Badge_Grade)
[![Twitter](https://img.shields.io/badge/Twitter-@Ramotion-blue.svg?style=flat)](http://twitter.com/Ramotion)
[![Travis](https://img.shields.io/travis/Ramotion/vr-menu-demo.svg)](https://travis-ci.org/Ramotion/vr-menu-demo)



## About
This project is maintained by Ramotion, Inc.<br>
We specialize in the designing and coding of custom UI for Mobile Apps and Websites.<br>

**Looking for developers for your project?**<br>
This project is maintained by Ramotion, Inc. We specialize in the designing and coding of custom UI for Mobile Apps and Websites.

<a href="https://www.ramotion.com/agency/app-development?utm_source=gthb&utm_medium=repo&utm_campaign=vr-menu-demo"> 
<img src="https://github.com/ramotion/gliding-collection/raw/master/contact_our_team@2x.png" width="187" height="34"></a> <br>


Prototype of a menu system in Virtual Reality controlled using only the user's gaze! Requires a cutting-edge browser and a Google Cardboard (or similarly compatible) device. While current browser support for native VR headsets (Vive/Oculus) is poor, it should rapidly improve in the near future. When it does, this demo should support them, too.

[Try it!](http://ramotion.github.io/vr-menu-demo/main.html)

### Running the demo locally

To run this demo yourself, simply start a static file server (e.g., with [Node](https://www.npmjs.com/package/static-server)) in the project root and navigate to `main.html` in your browser.

### Technical details

This project is written using [Three.js](https://github.com/mrdoob/three.js) and [WebVR Polyfill](https://github.com/googlevr/webvr-polyfill). A microframework in [main.js](https://github.com/Ramotion/vr-menu-demo/blob/master/main.js) declares a [Rust](https://github.com/rust-lang/rust)-inspired ownership model for handling 3D scenes and takes cares of meta-concerns like dependency retrieval, fullscreen/VR swapping, and rendering calls. The scene itself is in [MenuScene.js](https://github.com/Ramotion/vr-menu-demo/blob/master/MenuScene.js) and declares the 3D content and interactions.

# Get the Showroom App for iOS to give it a try
Try our UI components in our iOS app. Contact us if interested.

<a href="https://itunes.apple.com/app/apple-store/id1182360240?pt=550053&ct=vr-menu-demo&mt=8" > 
<img src="https://github.com/ramotion/gliding-collection/raw/master/app_store@2x.png" width="117" height="34"></a>
<a href="https://www.ramotion.com/agency/app-development?utm_source=gthb&utm_medium=repo&utm_campaign=vr-menu-demo"> 
<img src="https://github.com/ramotion/gliding-collection/raw/master/contact_our_team@2x.png" width="187" height="34"></a>

Follow us for the latest updates<br>
<a href="https://goo.gl/rPFpid" >
<img src="https://i.imgur.com/ziSqeSo.png/" width="156" height="28"></a>
