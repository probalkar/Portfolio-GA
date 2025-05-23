// Get the elements that will be transformed during scrolling
const textBehind = document.getElementById('text-behind');
const textFront = document.getElementById('text-front');
const textBehindBlur = document.getElementById('text-behind-blur');
const canvasRect = document.getElementById('canvas');

// Define the increment of scaling
// Text scaling
const parallaxScaling1 = 0.0005;
// Canvas scaling
const parallaxScaling2 = 0.00025;
// Three.js Camera Rotation Speed
const parallaxScaling3 = 0.0000001;

// Initialize scroll and ease values
let currentScroll = 0;
let targetScroll = 0;
let ease = 0.001;

// Define a global variable to connect scroll-based animations to 3D animations.
let theta1 = 0;

// This function updates the scale and position of the elements on scroll
function updateScale() {
  
  // Get the top and bottom position of the canvasRect element relative to the viewport.
  let rect = canvasRect.getBoundingClientRect();
  
  // Calculate the start and end scroll positions relative to the top of the document.
  // window.pageYOffset provides the amount of pixels that the document is currently scrolled vertically.
  // Adding rect.top/rect.bottom converts the relative viewport position to an absolute document position.
  let startScrollPosition = window.pageYOffset + rect.top; 
  let endScrollPosition = window.pageYOffset + rect.bottom;

  // The condition checks the following:
  // 1. If the bottom edge of the viewport is above the starting position of our target element or
  // 2. If the top edge of the viewport is below the ending position of our target element.
  // In other words, it checks if the target element is outside the current viewport.
  if (targetScroll + window.innerHeight < startScrollPosition || targetScroll > endScrollPosition) {
    // If either of the conditions is true, we are not viewing the element and thus we should exit (return) from the function early, without updating the parallax effects.
     return;
    }
  
  // The currentScroll value is being adjusted to gradually approach the targetScroll value.
  // This creates a smoother, easing effect rather than directly jumping to the target value.
  currentScroll += (targetScroll - currentScroll) * ease;
  
  let scaleValue1 = 1 + (currentScroll * parallaxScaling1);
  let scaleValue2 = 1 + (currentScroll * parallaxScaling2);
    
  // Use the scaleValue to adjust the transform property for scaling
  textBehind.style.transform = `scale(${scaleValue1})`;
  textFront.style.transform = `scale(${scaleValue1})`;
  textBehindBlur.style.transform = `scale(${scaleValue1})`;
  canvasRect.style.transform = `scale(${scaleValue2})`;
  
  // Modulate theta1 based on the current scrolling offset.
  // This provides a connection between the 2D scrolling experience and the 3D Three.js animations.
  theta1 += currentScroll * parallaxScaling3;
    
  // setTimeout is a way to delay the execution of the function.
  // By calling updateScale with a delay of approximately 1/60th of a second, we're mimicking the behavior of requestAnimationFrame, aiming to update the parallax effect about 60 times per second.
  // This makes the animation smoother by spreading the updates across small time intervals, making transitions less abrupt and more visually appealing.
  setTimeout(updateScale, 1000 / 60); // approximately 60 times per second
}

window.addEventListener('scroll', () => {
    targetScroll = window.pageYOffset;
    updateScale();
});

updateScale();

import * as THREE from 'https://cdn.skypack.dev/three@0.124.0';
import { RGBELoader  } from 'https://cdn.skypack.dev/three@0.124.0/examples/jsm/loaders/RGBELoader.js';
import { EffectComposer } from 'https://cdn.skypack.dev/three@0.124.0/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://cdn.skypack.dev/three@0.124.0/examples/jsm/postprocessing/RenderPass.js';
import { AfterimagePass } from 'https://cdn.skypack.dev/three@0.124.0/examples/jsm/postprocessing/AfterimagePass.js';
import { UnrealBloomPass } from 'https://cdn.skypack.dev/three@0.124.0/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OBJLoader } from 'https://cdn.skypack.dev/three@0.134.0/examples/jsm/loaders/OBJLoader.js';

var renderer = new THREE.WebGLRenderer({ canvas : document.getElementById('canvas'), antialias:true, alpha: true });

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

var scene = new THREE.Scene();

// create a new RGBELoader to import the HDR
const hdrEquirect = new RGBELoader()
  // add your HDR //
	.setPath( 'https://raw.githubusercontent.com/miroleon/gradient_hdr_freebie/main/Gradient_HDR_Freebies/' )
	.load( 'ml_gradient_freebie_01.hdr', function () {

  hdrEquirect.mapping = THREE.EquirectangularReflectionMapping;
} );
scene.environment = hdrEquirect;

// add Fog to the scene - if too dark go lower with the second value
scene.fog = new THREE.FogExp2(0x11151c, 0.15);

// create a group to add your camera and object
// by creating a group, you can can work around the fact that three.js currently doesn't allow to add a rotation to the HDR
// when you add the camera and the object to the group, you can later animate the entire group
// you can then create a scene within the group, but then rotate the entire group, which simulates the rotation of the HDR
var group = new THREE.Group();
scene.add(group);

const pointlight = new THREE.PointLight (0x85ccb8, 7.5, 20);
pointlight.position.set (0,3,2);
group.add (pointlight);

const pointlight2 = new THREE.PointLight (0x9f85cc, 7.5, 20);
pointlight2.position.set (0,3,2);
group.add (pointlight2);

// create the camera
var camera = new THREE.PerspectiveCamera( 45, window.innerWidth/window.innerHeight, 0.1, 1000 );
camera.position.z = 10;
// add the camera to the group
group.add(camera);

const loader = new THREE.TextureLoader();

const baseColorMap1 = loader.load('https://miroleon.github.io/daily-assets/porcelain/textures/Porcelain_Map1_BaseColor.png');
const metallicMap1 = loader.load('https://miroleon.github.io/daily-assets/porcelain/textures/Porcelain_Map1_Metallic.png');
const normalMap1 = loader.load('https://miroleon.github.io/daily-assets/porcelain/textures/Porcelain_Map1_Normal.png');
const roughnessMap1 = loader.load('https://miroleon.github.io/daily-assets/porcelain/textures/Porcelain_Map1_Roughness.png');
const aoMap1 = loader.load('https://miroleon.github.io/daily-assets/porcelain/textures/Porcelain_Map1_ao.png');

const material1 = new THREE.MeshStandardMaterial({
  map: baseColorMap1,
  metalnessMap: metallicMap1,
  normalMap: normalMap1,
  roughnessMap: roughnessMap1,
  aoMap: aoMap1,
  envMap: hdrEquirect,
  envMapIntensity: 10
});

const baseColorMap2 = loader.load('https://miroleon.github.io/daily-assets/porcelain/textures/Porcelain_Map2_BaseColor.png');
const metallicMap2 = loader.load('https://miroleon.github.io/daily-assets/porcelain/textures/Porcelain_Map2_Metallic.png');
const normalMap2 = loader.load('https://miroleon.github.io/daily-assets/porcelain/textures/Porcelain_Map2_Normal.png');
const roughnessMap2 = loader.load('https://miroleon.github.io/daily-assets/porcelain/textures/Porcelain_Map2_Roughness.png');
const aoMap2 = loader.load('https://miroleon.github.io/daily-assets/porcelain/textures/Porcelain_Map2_ao.png');

const material2 = new THREE.MeshStandardMaterial({
  map: baseColorMap2,
  metalnessMap: metallicMap2,
  normalMap: normalMap2,
  roughnessMap: roughnessMap2,
  aoMap: aoMap2,
  envMap: hdrEquirect,
  envMapIntensity: 10
});

// Load the model
const objloader = new OBJLoader();
objloader.load(
    'https://raw.githubusercontent.com/miroleon/daily-assets/main/porcelain/source/Porcelain_Pose.obj',
 (object) => {
        object.children[0].material = material1;
        object.children[1].material = material2;
        object.scale.setScalar( 0.025 );
        object.position.set( 0, -2.5, 0 );
        group.add(object);
    },
);

// const material1 = new THREE.MeshStandardMaterial({
//   color: 0xffffff,
//   roughness: 0,
//   metalness: 0.5,
//   envMapIntensity: 10
// });

// // Load the model
// const objloader = new OBJLoader();
// objloader.load(
//     'https://raw.githubusercontent.com/miroleon/peace-of-mind/main/assets/buddha.obj',
//  (object) => {
//         object.children[0].material = material1;
//         object.scale.setScalar( 20 );
//         object.position.set( 0, -0.25, 0 );
//         group.add(object);
//     },
// );

// POST PROCESSING
// define the composer
let composer;
// define/add the RenderPass
const renderScene = new RenderPass( scene, camera );

// add the afterimagePass
const afterimagePass = new AfterimagePass();
// for my taste, anything between 0.85 and 0.95 looks good, but your milage may vary
afterimagePass.uniforms[ 'damp' ].value = 0.85;

// add the paramters for your bloom
// play around with the values to make it fit your scene
// note that you might want to consider the bi-directional effect between Fog and Bloom
const bloomparams = {
	exposure: 1,
	bloomStrength: 1,
	bloomThreshold: 0.1,
	bloomRadius: 1
};

// add a new UnrealBloomPass and add the values from the parameters above
const bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );
bloomPass.threshold = bloomparams.bloomThreshold;
bloomPass.strength = bloomparams.bloomStrength;
bloomPass.radius = bloomparams.bloomRadius;

// finally, create a new EffectComposer and add the different effects
composer = new EffectComposer( renderer );
composer.addPass( renderScene );
composer.addPass( afterimagePass );
composer.addPass( bloomPass );

// RESIZE
window.addEventListener( 'resize', onWindowResize );

var update = function() {
  // Continuously animate theta1 irrespective of scrolling to ensure there's an inherent animation in the 3D visualization.
  theta1 += 0.0025;

  // create a panning animation for the camera
  camera.position.x = Math.sin( theta1 ) * 8;
  camera.position.z = Math.cos( theta1 ) * 8;
  camera.position.y = 2.5*Math.cos( theta1 ) + 2;
  
  pointlight.position.x = Math.sin( theta1+1 ) * 11;
  pointlight.position.z = Math.cos( theta1+1 ) * 11;
  pointlight.position.y = 2*Math.cos( theta1-3 ) +3;
  
  pointlight2.position.x = -Math.sin( theta1+1 ) * 11;
  pointlight2.position.z = -Math.cos( theta1+1 ) * 11;
  pointlight2.position.y = 2*-Math.cos( theta1-3 ) -6;
  
  // rotate the group to simulate the rotation of the HDR
  group.rotation.y += 0.01;

  // keep the camera look at 0,0,0
  camera.lookAt( 0, 0, 0 );
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}

function animate() {
  update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

// Initialize particles.js
particlesJS('particles-js', {
  particles: {
    number: {
      value: 80, // Adjust the number of particles
    },
    color: {
      value: '#ffffff', // Particle color
    },
    shape: {
      type: 'circle', // Particle shape
    },
    opacity: {
      value: 0.2, // Particle opacity
    },
    size: {
      value: 3, // Particle size
    },
    move: {
      speed: 1, // Particle movement speed
    },
  },
});

requestAnimationFrame(animate);

// Update your existing JavaScript file with the following code

// Fade-in animation for About section
const aboutSection = document.querySelector('.about-section');

const observer1 = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('fade-in');
    } else {
      entry.target.classList.remove('fade-in');
    }
  });
}, { threshold: 0.4 });

observer1.observe(aboutSection);

// Fade-in animation for Education section
const educationSection = document.querySelector('.education-section');

const observer2 = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('fade-in');
    } else {
      entry.target.classList.remove('fade-in');
    }
  });
}, { threshold: 0.4 });

observer2.observe(educationSection);

// Fade-in animation for Certificates section
const certificateSection = document.querySelector('.certificates-section');

const observer3 = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('fade-in');
    } else {
      entry.target.classList.remove('fade-in');
    }
  });
}, { threshold: 0.1 });

observer3.observe(certificateSection);

// Fade-in animation for Skills section
const skillsSection = document.querySelector('.skills-section');

const observer4 = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('fade-in');
    } else {
      entry.target.classList.remove('fade-in');
    }
  });
}, { threshold: 0.4 });

observer4.observe(skillsSection);

// Fade-in animation for Work Experience
const experienceSection = document.querySelector('.work-experience');

const observer5 = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('fade-in');
    } else {
      entry.target.classList.remove('fade-in');
    }
  });
}, { threshold: 0.3 });

observer5.observe(experienceSection);

// Fade-in animation for Organizations section
const organizationSection = document.querySelector('.organizations');

const observer6 = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('fade-in');
    } else {
      entry.target.classList.remove('fade-in');
    }
  });
}, { threshold: 0.3 });

observer6.observe(organizationSection);

// Fade-in animation for Projects section
const projectSection = document.querySelector('.projects');

const observer7 = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('fade-in');
    } else {
      entry.target.classList.remove('fade-in');
    }
  });
}, { threshold: 0.1 });

observer7.observe(projectSection);

// Fade-in animation for Hobbies section
const hobbySection = document.querySelector('.hobbies');

const observer8 = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('fade-in');
    } else {
      entry.target.classList.remove('fade-in');
    }
  });
}, { threshold: 0.5 });

observer8.observe(hobbySection);

// Fade-in animation for bottom socials
const bottomSocials = document.querySelector('.bottom-socials');

const observer9 = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('fade-in');
    } else {
      entry.target.classList.remove('fade-in');
    }
  });
}, { threshold: 1 });

observer9.observe(bottomSocials);

document.addEventListener('DOMContentLoaded', function () {
  // Scroll tracking
  // window.addEventListener('scroll', () => {
  //   gtag('event', 'page_scrolled', {
  //     'event_category': 'engagement',
  //     'event_label': 'User scrolled the page',
  //     'interaction_type': 'scroll'
  //   });
  // });

  // Contact form submission
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', function () {
      gtag('event', 'contact_form_submitted', {
        'event_category': 'form',
        'event_label': 'Contact form submitted',
        'form_id': 'contact-form'
      });
    });
  }

  // Social link clicks
  document.querySelectorAll('.socials a').forEach(link => {
    link.addEventListener('click', function () {
      gtag('event', 'social_link_clicked', {
        'event_category': 'social',
        'event_label': this.href,
        'platform': this.href.includes('instagram') ? 'Instagram' :
                    this.href.includes('linkedin') ? 'LinkedIn' :
                    this.href.includes('github') ? 'GitHub' : 'Other'
      });
    });
  });

  // Certificate clicks
  document.querySelectorAll('.certificate a').forEach(link => {
    link.addEventListener('click', function () {
      gtag('event', 'certificate_viewed', {
        'event_category': 'certificates',
        'event_label': this.href,
        'certificate_name': this.querySelector('img')?.alt || 'Unknown Certificate'
      });
    });
  });

  // Resume download
  const resumeLink = document.querySelector('.resume a');
  if (resumeLink) {
    resumeLink.addEventListener('click', function () {
      gtag('event', 'resume_downloaded', {
        'event_category': 'resume',
        'event_label': 'Resume downloaded',
        'file_name': this.getAttribute('download') || 'resume.pdf'
      });
    });
  }
});

document.getElementById('custom-link').addEventListener('click', function() {
	dataLayer.push({
		event: 'custom_link_click',
		link_text: 'Download',
		link_url: 'https://linkedin.com/in/probalkar'
	});
});
