'use strict';var _createClass=function(){function a(b,c){for(var e,d=0;d<c.length;d++)e=c[d],e.enumerable=e.enumerable||!1,e.configurable=!0,'value'in e&&(e.writable=!0),Object.defineProperty(b,e.key,e)}return function(b,c,d){return c&&a(b.prototype,c),d&&a(b,d),b}}();function _classCallCheck(a,b){if(!(a instanceof b))throw new TypeError('Cannot call a class as a function')}function initiateCkeditor(){var a=Array.from(arguments);document.addEventListener('DOMContentLoaded',function(){a.forEach(function(b){newEditor(b)})})}function newEditor(a){var a=document.querySelector(a);if(null===a)return!1;try{ClassicEditor.create(a).then(function(b){b.plugins.get('FileRepository').createUploadAdapter=function(c){return new UploadAdapter(c)},document.querySelector('.ck-content').addEventListener('DOMNodeRemoved',function(c){var d=c.target,e=d.className.split(' ');e.includes('image')&&server.destroy(id(d.children[0]))})}).catch(function(b){console.error(b)})}catch(b){console.log(b),console.log('Is ckeditor.js included?','https://ckeditor.com/ckeditor-5/download/')}}var UploadAdapter=function(){function a(b){_classCallCheck(this,a),this.loader=b}return _createClass(a,[{key:'upload',value:function(){return server.upload(this.loader.file)}}]),a}(),server={upload:upload,destroy:destroy};function upload(a){return new Promise(function(b,c){var d=new XMLHttpRequest,e=new FormData;d.onreadystatechange=function(){4===d.readyState&&200!==d.status&&c('Image upload failed'),4===d.readyState&&200===d.status&&(b({default:d.responseText}),console.log('Image upload successful'))},e.set('ck_image',a),d.open('POST','/ckeditor_wave/ck_images'),d.send(e)})}function destroy(a){var b=new XMLHttpRequest,c=new FormData;b.onreadystatechange=function(){4===b.readyState&&200!==b.status&&console.log('Image deletion failed'),4===b.readyState&&200===b.status&&console.log(b.responseText)},c.set('method','delete'),b.open('DELETE','/ckeditor_wave/ck_images/'+a),b.send(c)}function id(a){var b=a.src.match(/[^\/]*.$/g).toString();return b.match(/[^.]*/)}
