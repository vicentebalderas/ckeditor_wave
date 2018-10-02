'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function initiateCkeditor() {
  var editors = Array.from(arguments);
  editors.forEach(function (editor) {
    newEditor(editor);
  });
}

function newEditor(ck_editor) {
  var ck_editor = document.querySelector(ck_editor);

  if (ck_editor === null) return false;
  try {
    ClassicEditor.create(ck_editor, {
        image: {
            toolbar: [ 'imageStyle:alignLeft', 'imageStyle:full', 'imageStyle:alignRight' ],
            styles: [
                // This option is equal to a situation where no style is applied.
                'full',

                // This represents an image aligned to the left.
                'alignLeft',

                // This represents an image aligned to the right.
                'alignRight'
            ]
        }
    } ).then(function (editor) {
      editor.plugins.get('FileRepository').createUploadAdapter = function (loader) {
        return new UploadAdapter(loader);
      };

      ck_editor.nextSibling.querySelector('.ck-content').addEventListener('DOMNodeRemoved', function (event) {
        var element = event.target;
        var classes = element.className ? element.className.split(' ') : [];
        if (classes.includes('image')) server.destroy(id(element.children[0]));
      });
    }).catch(function (error) {
      console.error(error);
    });
  } catch (error) {
    console.log(error);
    console.log('Is ckeditor.js included?', 'https://ckeditor.com/ckeditor-5/download/');
  }
}

var UploadAdapter = function () {
  function UploadAdapter(loader) {
    _classCallCheck(this, UploadAdapter);

    this.loader = loader;
  }

  _createClass(UploadAdapter, [{
    key: 'upload',
    value: function upload() {
      var _this = this;

      // Update loader's progress.
      server.onUploadProgress = function (data) {
        _this.loader.uploadTotal = data.total;
        _this.loader.uploaded = data.loaded;
      };

      // Return promise that will be resolved when file is uploaded.
      return server.upload(this.loader.file);
    }
  }, {
    key: 'abort',
    value: function abort() {
      // Reject promise returned from upload() method.
      server.abortUpload();
    }
  }]);

  return UploadAdapter;
}();

var server = {
  upload: upload,
  destroy: destroy,
  onUploadProgress: null,
  abortUpload: abort,
  xhr: null
};

function upload(file) {
  return new Promise(function (resolve, reject) {
    server.xhr = new XMLHttpRequest();
    var formData = new FormData();
    server.xhr.upload.onprogress = function (evt) {
      if (evt.lengthComputable) {
        server.onUploadProgress(evt);
      }
    };
    server.xhr.onreadystatechange = function () {
      if (server.xhr.readyState === 4 && server.xhr.status !== 200) reject('Image upload failed');
      if (server.xhr.readyState === 4 && server.xhr.status === 200) {
        resolve({
          default: server.xhr.responseText
        });
        //        server.onUploadProgress({loaded: 0, total: 0});
        console.log('Image upload successful');
      }
    };
    formData.set('ck_image', file);
    server.xhr.open('POST', '/ckeditor_wave/ck_images');
    server.xhr.send(formData);
  });
}

function destroy(id) {
  var xhr = new XMLHttpRequest();
  var formData = new FormData();
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status !== 200) console.log('Image deletion failed');
    if (xhr.readyState === 4 && xhr.status === 200) server.onUploadProgress({ loaded: 0, total: 0 });
    console.log(xhr.responseText);
  };
  formData.set('method', 'delete');
  xhr.open('DELETE', '/ckeditor_wave/ck_images/' + id);
  xhr.send(formData);
}

function abort() {
  if (server.xhr) {
    server.xhr.abort();
  }
}

function id(element) {
  var filename = element.src.match(/[^\/]*.$/g).toString();
  return filename.match(/[^.]*/);
}
