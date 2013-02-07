window.onload = function(){

  ace.config.set("workerPath", ".");
  var editor = ace.edit("editor");
  editor.setTheme("ace/theme/monokai");
  var session = editor.getSession();
  session.setMode("ace/mode/javascript");
  session.setTabSize(2);

  var applyButton = document.getElementById("apply");
  var autoCheck = document.getElementById("auto");
  var helpButton = document.getElementById("show-help");
  var exportButton = document.getElementById("export");
  var rightColumn = document.getElementById("right-column");
  var link = document.getElementById("link");
  var shareLink = document.getElementById("share-link");
  var help = document.getElementById("help");
  var helpClose = document.getElementById("help-close");
  var svgContainer = document.getElementById("svg-container");
  var svgImage = document.getElementById("svg-image");
  var info = document.getElementById("info");

  var testingCode;
  var testCodeStart;
  var svgGenTime;

  var currentSVGCode = "";
  var currentSVGString = "";

  var autoEval = false;

  var worker;
  var workerBusy = false;
  var workerError = false;
  var loadingSVG = false;

  var labels = {
    run: "Run",
    cancel: "Abort",
    loading: "Busy"
  };

  var infos = {
    syntaxError: "Check your Syntax!",
    outputError: "FAIL.",
    runtimeError: "Runtime Error!",
    processing: "Calculating...",
    rendering: "Loading...",
    cancelled: "Aborted.",
    outputSuccess: function(created, loaded){
      var c = Math.round(created/1000*100)/100;
      var l = loaded - testCodeStart - created;
      l = Math.round(l/1000*100)/100;
      return "SVG created in " + c + "s, loaded in " + l + "s";
    },
    clean: ""
  };



  var showStats = function() {
    info.innerHTML = workerError ? infos.outputError : infos.outputSuccess(svgGenTime, Date.now());
    applyButton.innerHTML = labels.run;
    applyButton.disabled = false;
  };

  var setupWorker = function(){

    if (worker) {
      worker.terminate();
      applyButton.innerHTML = labels.run;
      info.innerHTML = infos.cancelled;
    }

    worker = new Worker('turtle-svg-worker.js');
    worker.onmessage = function(e) {

      workerBusy = false;
      workerError = (e.data === "");

      if (workerError){
        showStats();
      } else {
        info.innerHTML = infos.rendering;
        applyButton.innerHTML = labels.loading;
        applyButton.disabled = true;
        // calculate + show the amount of time that was required to complete SVG creation
        svgGenTime = Date.now() - testCodeStart;
        setSVG(e.data, showStats);
      }

    };
    worker.onerror = function(e) {
      info.innerHTML = infos.runtimeError;
      workerError = true;
    };
    workerError = false;
    workerBusy = false;
  };

  // setupWorker();

  var testCode = function(){

    // don't do anything unless the SVG has finished loading.
    // otherwise things get real nasty.
    if(loadingSVG) {
      return;
    }
    if (!worker || workerBusy) {
      setupWorker();
    }
    if (worker && !workerBusy) {
      workerBusy = true;
      applyButton.innerHTML = labels.cancel;
      testCodeStart = Date.now();
      info.innerHTML = infos.processing;
      testingCode = editor.getValue();
      worker.postMessage(testingCode);
    }
  };

  autoCheck.onchange = function(){
    autoEval = autoCheck.checked;
    if (autoEval) {
      testCode();
    }
  };

  applyButton.onclick = function(){
    if (worker && (workerBusy || workerError)) {
      // Restart borked worker
      setupWorker();
    } else {
      testCode();
    }
  };

  var jshintOK = function() {
    var annotations = editor.getSession().getAnnotations();
    for (var key in annotations) {
      if (annotations.hasOwnProperty(key)){
        return false;
      }
    }
    return true;
  };

  session.on("changeAnnotation", function(){
    // Eval it?
    if (jshintOK()) { 
      info.innerHTML = infos.clean;
      if (autoEval) {
        testCode();
      }
    } else {
      info.innerHTML = infos.syntaxError;
    }
  });

  // var buildSVG = function(info){
  //   var svgns = "http://www.w3.org/2000/svg";
  //   var svg = document.createElementNS(svgns, "svg");
  //   svg.setAttribute("id", "turtle-svg");
  //   svg.setAttribute("width", info.w);
  //   svg.setAttribute("height", info.h);
  //   for (var i=0; i<info.paths.length; i++) {
  //     var path = document.createElementNS(svgns, "path");
  //     path.setAttributeNS(null, "id", "turtle-path-"+i);
  //     path.setAttributeNS(null, "stroke", info.paths[i].stroke);
  //     path.setAttributeNS(null, "fill", "none");
  //     path.setAttributeNS(null, "d", info.paths[i].d);
  //     path.setAttributeNS(null, "vector-effect", "non-scaling-stroke");
  //     svg.appendChild(path);
  //   }
  // };

  window.URL = window.URL || window.webkitURL || window.mozURL || window.msURL || null;
  var svgBlobURL;
  var buildURL = function(svgString){
    if (window.URL && window.URL.createObjectURL) {
      if (svgBlobURL) {
        window.URL.revokeObjectURL(svgBlobURL);
      }
      var svgBlob = new Blob([svgString], { "type" : "image/svg+xml" });
      svgBlobURL = window.URL.createObjectURL(svgBlob);
      return svgBlobURL;
    } else {
      return "data:image/svg+xml,"+encodeURIComponent(svgString);
    }
  };

  var setSVG = function(message, cb_onload){
    currentSVGCode = message.code;
    currentSVGString = message.svg;
    loadingSVG = true;
    svgImage.onload = function() {
      cb_onload();
      loadingSVG = false;
    }
    svgImage.src = buildURL(currentSVGString);
  };

  var helpShown = false;
  var toggleHelp = function(){
    helpShown = !helpShown;
    help.style.display = helpShown ? "block" : "none";
    rightColumn.scrollTop = helpShown ? help.offsetTop : 0;
  };
  helpButton.onclick = toggleHelp;
  helpClose.onclick = toggleHelp;

  exportButton.onclick = function(){
    if (!currentSVGString) { return; }

    var packed = encode( currentSVGCode );
    var perma = 'http://forresto.github.com/turtle-svg/#code/' + packed;
    var comment = "<!--\n\n" +
      "Made with LASER TURTLE; here is editor and source: \n" + 
      perma + "\n\n" +
      currentSVGCode.replace(/\-\-/g,"- - ") + "\n\n" +
      "-->\n";
    var svgBlob = new Blob([comment, currentSVGString], { "type" : "image/svg+xml" });
    var svgBlobURL = window.URL.createObjectURL(svgBlob);
    if (svgBlobURL) {
      // FIX this doesn't work in Safari
      window.open(svgBlobURL);
    } else {
      window.open("data:image/svg+xml,"+encodeURIComponent(comment+currentSVGString));
    }
  };


  /*
    Code saving and loading
  */

  shareLink.onclick = function() {
    this.select();
  };

  // Compress code for sharing
  var saveToURL = function(){
    // With help from https://github.com/mrdoob/htmleditor
    var packed = encode( editor.getValue() );
    shareLink.style.display = "inline";
    shareLink.value = 'http://forresto.github.com/turtle-svg/#code/' + packed;
    var now = new Date();
    document.title = "Saved " + now.toLocaleTimeString() + " -- LASER TURTLE";
    window.location.href = "#code/"+packed;
  };
  link.onclick = saveToURL;
  var decode = function ( string ) {
    return RawDeflate.inflate( window.atob( string ) );
  };
  var encode = function ( string ) {
    return window.btoa( RawDeflate.deflate( string ) );
  };

  var loadCodeFromHash = function(){
    if (window.location.hash.substr(0,5) === "#code") {
      try {
        var code = decode( window.location.hash.substr(6) );
        if (code !== editor.getValue()){
          editor.setValue(code, 1);
          testCode();
        }
      } catch (e) {}
    }
  };
  window.onhashchange = loadCodeFromHash;

  // See if code is set on load
  if ( window.location.hash ) {
    loadCodeFromHash();
  } else {
    // Default code
    testCode();
  }


  /*
    Key binding 
  */

  editor.commands.addCommand({
    name: 'saveToURL',
    bindKey: {win: 'Ctrl-S',  mac: 'Command-S'},
    exec: saveToURL
  });

  editor.commands.addCommand({
    name: 'applyCode',
    bindKey: {win: 'Ctrl-Return',  mac: 'Command-Return'},
    exec: testCode
  });


};
