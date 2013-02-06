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
  // var svg = document.getElementById("svgOutput");
  // var path = svg.getElementById("turtle");

  // var changeTimeout;
  var testCodeStart;
  var testCodeWorking = true;
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
        // applyButton.disabled = false;
      } else {
        workerError = false;
        applyButton.innerHTML = "Apply";
        // applyButton.disabled = autoEval;
        setSVG(e.data);
      }
      workerBusy = false;
    };
    worker.onerror = function(e) {
      applyButton.innerHTML = "JS error... restart?";
      workerError = true;
    };
    workerError = false;
    workerBusy = false;
  }
  // setupWorker();

  var testCode = function(){
    if (!worker || workerBusy) {
      setupWorker();
    }
    if (worker && !workerBusy) {
      workerBusy = true;
      applyButton.innerHTML = "Working... cancel?";
      // applyButton.disabled = false;
      // testCodeStart = Date.now();
      testingCode = editor.getValue();
      worker.postMessage(testingCode);
    }
  };

  autoCheck.onchange = function(e){
    autoEval = autoCheck.checked;
    // applyButton.disabled = autoEval;
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

  // session.on("change", function (e) {
  //   if (!autoEval){
  //     return;
  //   }
  //   if(changeTimeout) {
  //     clearTimeout(changeTimeout);
  //   }
  //   changeTimeout = setTimeout(testCode, 500);
  // });


  session.on("changeAnnotation", function(){
    var annotations = editor.getSession().getAnnotations();
    var jshintOK = true;
    for (key in annotations) {
      if (annotations.hasOwnProperty(key)){
        jshintOK = false;
      }
    }

    // Eval it?
    if (jshintOK) {
      applyButton.innerHTML = "Apply";
      if (autoEval) {
        testCode();
      } else {
        // applyButton.disabled = false;
      }
    } else {
      applyButton.innerHTML = "Check your code.";
      if (!autoEval){
        // applyButton.disabled = true;
      }
    }
  });

  var setSVG = function(message){
    currentSVGCode = message.code;
    currentSVGString = message.svg;

    svgContainer.innerHTML = currentSVGString;

    // var d = path.d;
    // path.setAttributeNS(null, "d", d);

    // var bBox = path.getBBox();
    // var w = Math.max(500, Math.ceil(bBox.x+bBox.width+20));
    // var h = Math.max(500, Math.ceil(bBox.y+bBox.height+20));
    // svg.setAttribute("width", w);
    // svg.setAttribute("height", h);
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
      currentSVGCode + "\n\n" +
      "-->\n";
    var svgBlob = new Blob([comment, currentSVGString], { "type" : "image/svg+xml" });
    var svgBlobURL = URL.createObjectURL(svgBlob);
    if (svgBlobURL) {
      window.open(svgBlobURL);
      // window.URL.revokeObjectURL(svgBlobURL); 
    } else {
      window.open("data:image/svg+xml,"+currentSVGString);
    }
  }


  /*
    Code saving and loading
  */


  // Compress code for sharing
  var saveToURL = function(){
    // With help from https://github.com/mrdoob/htmleditor
    var packed = encode( editor.getValue() );
    var perma = 'http://forresto.github.com/turtle-svg/#code/' + packed;
    // window.location.replace("#code/"+packed); 
    window.location.href = "#code/"+packed;
  }
  link.onclick = saveToURL;
  var decode = function ( string ) {
    return RawDeflate.inflate( window.atob( string ) );
  };
  var encode = function ( string ) {
    return window.btoa( RawDeflate.deflate( string ) );
  };

  var loadCodeFromHash = function(e){
    if (window.location.hash.substr(0,5) === "#code") {
      try {
        var code = decode( window.location.hash.substr(6) );
        if (code !== editor.getValue()){
          editor.setValue(code, 1);
          testCode();
        }
      } catch (e) {}
    }
  }
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


}