// Worker setup
self.onmessage = function(e) {
  importScripts('./turtle-parse.js');
  _resetTurtle();

  try {
    eval(e.data);

    // Build SVG string
    var svg = '<svg id="turtle-svg" xmlns="http://www.w3.org/2000/svg" version="1.1" width="'+
      Math.ceil(_max.x) + '" height="' +
      Math.ceil(_max.y) +'">'+"\n";
    for (var i=0; i<_paths.length; i++) {
      var path = _paths[i];
      svg += '  <path id="turtle-path-'+ i +'" '+
        'stroke="' + path.color + '" '+
        'd="' + path.d + '" '+
        'fill="' + (path.fill ? path.fill : 'none') + '" vector-effect="non-scaling-stroke" />' + "\n";
    }
    svg += '</svg>';

    self.postMessage({
      svg: svg,
      code: e.data,
      paths: _paths
    });

    // Terminate self
    self.close();
  } catch (error) {
    // err
    self.postMessage("");
  }
};
