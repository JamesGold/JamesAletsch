// Resize a photo to a metadata-free JPEG, like the iPhone shortcut does.
// osascript -l JavaScript scripts/strip_metadata.js in.jpg out.jpg [maxEdge]
ObjC.import('Foundation'); ObjC.import('CoreGraphics'); ObjC.import('ImageIO');
function run(argv) {
  var src = $.CGImageSourceCreateWithURL($.NSURL.fileURLWithPath(argv[0]), null);
  if (!src) throw 'cannot read ' + argv[0];
  // Thumbnail API: applies EXIF rotation and resizes; the result carries no metadata.
  var opts = $.NSDictionary.dictionaryWithDictionary({
    kCGImageSourceCreateThumbnailFromImageAlways: true,
    kCGImageSourceCreateThumbnailWithTransform: true,
    kCGImageSourceThumbnailMaxPixelSize: parseInt(argv[2] || '2000', 10)
  });
  var img = $.CGImageSourceCreateThumbnailAtIndex(src, 0, opts);
  var dest = $.CGImageDestinationCreateWithURL($.NSURL.fileURLWithPath(argv[1]), $('public.jpeg'), 1, null);
  $.CGImageDestinationAddImage(dest, img, $.NSDictionary.dictionaryWithDictionary({ kCGImageDestinationLossyCompressionQuality: 0.85 }));
  if (!$.CGImageDestinationFinalize(dest)) throw 'cannot write ' + argv[1];
}
