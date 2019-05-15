import MediaEmbed from '@ckeditor/ckeditor5-media-embed/src/mediaembed';

var contentEditor;

function initiateCkeditor() {
  var editors = Array.from(arguments);
    editors.forEach(function(editor){
      newEditor(editor);
    });
}

function newEditor(ck_editor) {
  var ck_editor = document.querySelector(ck_editor);

  if (ck_editor === null) return false;
  try{
    ClassicEditor
      .create(ck_editor, {
        plugins: [ MediaEmbed ],
        toolbar: [ 'mediaEmbed'],
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
        },
        language: 'es-mx'
    } )
      .then(editor => {
	contentEditor = editor;

	editor.setData(ck_editor.value);

        editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
          return new UploadAdapter(loader);
        };

        ck_editor.nextSibling.querySelector('.ck-content').addEventListener(
          'DOMNodeRemoved', (event) => {
          var element = event.target;
          var classes = element.className ? element.className.split(' ') : [];
          if (classes.includes('image'))
            server.destroy(id(element.children[0]));
        });

	editor.editing.view.document.on( 'change:isFocused', function( evt, name, value ) {
          if (value) {
              editor.sourceElement.parentNode.classList.add("ckeditor-focused");
          } else {
              editor.sourceElement.parentNode.classList.remove("ckeditor-focused");
          }
        });
      })
      .catch(error => {
        console.error(error);
      });
  } catch(error) {
    console.log(error);
    console.log('Is ckeditor.js included?', 'https://ckeditor.com/ckeditor-5/download/');
  }
}

class UploadAdapter {
  constructor(loader) {
    this.loader = loader;
  }
  upload() {

    // Update loader's progress.
    server.onUploadProgress = (data) => {
        this.loader.uploadTotal = data.total;
        this.loader.uploaded = data.loaded;
    };

    // Return promise that will be resolved when file is uploaded.
    return server.upload(this.loader.file);
  }

  abort() {
    // Reject promise returned from upload() method.
    server.abortUpload();
  }
}

var server = {
  upload: upload,
  destroy: destroy,
  onUploadProgress: null,
  abortUpload: abort,
  xhr: null
}

function upload(file) {
  return new Promise((resolve, reject) => {
    server.xhr = new XMLHttpRequest();
    var formData = new FormData();
    server.xhr.upload.onprogress = (evt) => {
      if (evt.lengthComputable)
        {
	  server.onUploadProgress(evt);
        }
    };
    server.xhr.onreadystatechange = () => {
      if (server.xhr.readyState === 4 && server.xhr.status !== 200)
        reject('Image upload failed');
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
  xhr.onreadystatechange = () => {
    if (xhr.readyState === 4 && xhr.status !== 200)
      console.log('Image deletion failed');
    if (xhr.readyState === 4 && xhr.status === 200)
      server.onUploadProgress({loaded: 0, total: 0});
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
