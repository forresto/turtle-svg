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
  var help = document.getElementById("help");
  var svgContainer = document.getElementById("svg-container");

  var testingCode;

  var currentSVGCode = "";
  var currentSVGString = "";

  var autoEval = true;

  var worker;
  var workerBusy = false;
  var workerError = false;

  var setupWorker = function(){
    if (worker) {
      worker.terminate();
    }
    worker = new Worker('turtle-svg-worker.js');
    worker.onmessage = function(e) {
      if (e.data === ""){
        workerError = true;
        applyButton.innerHTML = "JS error... restart?";
      } else {
        workerError = false;
        applyButton.innerHTML = "Apply";
        setSVG(e.data);
      }
      workerBusy = false;
    };
    worker.onerror = function() {
      applyButton.innerHTML = "JS error... restart?";
      workerError = true;
    };
    workerError = false;
    workerBusy = false;
  };
  // setupWorker();

  var testCode = function(){
    if (!worker || workerBusy) {
      setupWorker();
    }
    if (worker && !workerBusy) {
      workerBusy = true;
      applyButton.innerHTML = "Working... cancel?";
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

      autoCheck.checked = false;
      autoCheck.onchange();
      applyButton.innerHTML = "Apply";
    } else {
      testCode();
    }
  };

  session.on("changeAnnotation", function(){
    var annotations = editor.getSession().getAnnotations();
    var jshintOK = true;
    for (var key in annotations) {
      if (annotations.hasOwnProperty(key)){
        jshintOK = false;
      }
    }

    // Eval it?
    if (jshintOK) {
      applyButton.innerHTML = "Apply";
      if (autoEval) {
        testCode();
      } 
    } else {
      applyButton.innerHTML = "Check your code.";
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

  var setSVG = function(message){
    currentSVGCode = message.code;
    currentSVGString = message.svg;

    svgContainer.innerHTML = currentSVGString;

    // while (svgContainer.hasChildNodes()) {
    //   svgContainer.removeChild(svgContainer.lastChild);
    // }
    // svgContainer.appendChild( buildSVG(message.svg) );
  };

  var helpShown = false;
  helpButton.onclick = function(){
    helpShown = !helpShown;
    help.style.display = helpShown ? "block" : "none";
    rightColumn.scrollTop = helpShown ? help.offsetTop : 0;
  };

  window.URL = window.URL || window.webkitURL || window.mozURL || window.msURL || null;
  exportButton.onclick = function(){
    if (!currentSVGString) { return; }

    var packed = encode( currentSVGCode );
    var perma = 'http://forresto.github.com/turtle-svg/#code/' + packed;
    var comment = "<!--\n\n" +
      "Made with LASER TURTLE; here is editor and source: \n" + 
      perma + "\n\n" +
      currentSVGCode.replace(/\-\-/g,"- - ") + "\n\n" +
      "-->\n";
    // var svgBlob = new Blob([comment, currentSVGString], { "type" : "image/svg+xml" });
    // var svgBlobURL = window.URL.createObjectURL(svgBlob);
    // if (svgBlobURL) {
    //   window.open(svgBlobURL);
    // } else {
      window.open("data:image/svg+xml,"+encodeURIComponent(comment+currentSVGString));
    // }
  };


  /*
    Code saving and loading
  */


  // Compress code for sharing
  var saveToURL = function(){
    // With help from https://github.com/mrdoob/htmleditor
    var packed = encode( editor.getValue() );
    // var perma = 'http://forresto.github.com/turtle-svg/#code/' + packed;
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