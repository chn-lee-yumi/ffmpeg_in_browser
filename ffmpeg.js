var Module = typeof Module !== "undefined" ? Module : {};

function ffmpeg_run(opts, cb) {
 var isNode = typeof exports !== "undefined";
 if (!isNode) {
  var Module = {
   "outputDirectory": "output"
  };
  for (var i in opts) {
   Module[i] = opts[i];
  }
  var outputFilePath = Module["arguments"][Module["arguments"].length - 1];
  if (Module["arguments"].length > 2 && outputFilePath && outputFilePath.indexOf(".") > -1) {
   Module["arguments"][Module["arguments"].length - 1] = "output/" + outputFilePath;
  }
  Module["preRun"] = function() {
   if (Module["files"]) {
    FS.createFolder("/", "input", true, true);
    console.log(Module["files"]);
    FS.mount(WORKERFS, {
     files: Module["files"]
    }, "/input");
    FS.createFolder("/", Module["outputDirectory"], true, true);
   }
  };
  Module["postRun"] = function() {
   var handle = FS.analyzePath(Module["outputDirectory"]);
   Module["return"] = getAllBuffers(handle);
   cb(Module["return"]);
  };
  function getAllBuffers(result) {
   var buffers = [];
   if (result && result.object && result.object.contents) {
    for (var i in result.object.contents) {
     if (result.object.contents.hasOwnProperty(i)) {
      buffers.push({
       name: i,
       data: new Uint8Array(result.object.contents[i].contents).buffer
      });
     }
    }
   }
   return buffers;
  }
 }
 var moduleOverrides = {};
 var key;
 for (key in Module) {
  if (Module.hasOwnProperty(key)) {
   moduleOverrides[key] = Module[key];
  }
 }
 var arguments_ = [];
 var thisProgram = "./this.program";
 var quit_ = function(status, toThrow) {
  throw toThrow;
 };
 var ENVIRONMENT_IS_WEB = false;
 var ENVIRONMENT_IS_WORKER = false;
 var ENVIRONMENT_IS_NODE = false;
 var ENVIRONMENT_IS_SHELL = false;
 ENVIRONMENT_IS_WEB = typeof window === "object";
 ENVIRONMENT_IS_WORKER = typeof importScripts === "function";
 ENVIRONMENT_IS_NODE = typeof process === "object" && typeof process.versions === "object" && typeof process.versions.node === "string";
 ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;
 if (Module["ENVIRONMENT"]) {
  throw new Error("Module.ENVIRONMENT has been deprecated. To force the environment, use the ENVIRONMENT compile-time option (for example, -s ENVIRONMENT=web or -s ENVIRONMENT=node)");
 }
 var ENVIRONMENT_IS_PTHREAD = Module["ENVIRONMENT_IS_PTHREAD"] || false;
 if (ENVIRONMENT_IS_PTHREAD) {
  buffer = Module["buffer"];
  DYNAMIC_BASE = Module["DYNAMIC_BASE"];
  DYNAMICTOP_PTR = Module["DYNAMICTOP_PTR"];
 }
 var _scriptDir = typeof document !== "undefined" && document.currentScript ? document.currentScript.src : undefined;
 if (ENVIRONMENT_IS_WORKER) {
  _scriptDir = self.location.href;
 } else if (ENVIRONMENT_IS_NODE) {
  _scriptDir = __filename;
 }
 var scriptDirectory = "";
 function locateFile(path) {
  if (Module["locateFile"]) {
   return Module["locateFile"](path, scriptDirectory);
  }
  return scriptDirectory + path;
 }
 var read_, readAsync, readBinary, setWindowTitle;
 var nodeFS;
 var nodePath;
 if (ENVIRONMENT_IS_NODE) {
  if (ENVIRONMENT_IS_WORKER) {
   scriptDirectory = require("path").dirname(scriptDirectory) + "/";
  } else {
   scriptDirectory = __dirname + "/";
  }
  read_ = function shell_read(filename, binary) {
   if (!nodeFS) nodeFS = require("fs");
   if (!nodePath) nodePath = require("path");
   filename = nodePath["normalize"](filename);
   return nodeFS["readFileSync"](filename, binary ? null : "utf8");
  };
  readBinary = function readBinary(filename) {
   var ret = read_(filename, true);
   if (!ret.buffer) {
    ret = new Uint8Array(ret);
   }
   assert(ret.buffer);
   return ret;
  };
  if (process["argv"].length > 1) {
   thisProgram = process["argv"][1].replace(/\\/g, "/");
  }
  arguments_ = process["argv"].slice(2);
  if (typeof module !== "undefined") {
   module["exports"] = Module;
  }
  process["on"]("uncaughtException", function(ex) {
   if (!(ex instanceof ExitStatus)) {
    throw ex;
   }
  });
  process["on"]("unhandledRejection", abort);
  quit_ = function(status) {
   process["exit"](status);
  };
  Module["inspect"] = function() {
   return "[Emscripten Module object]";
  };
  var nodeWorkerThreads;
  try {
   nodeWorkerThreads = require("worker_threads");
  } catch (e) {
   console.error('The "worker_threads" module is not supported in this node.js build - perhaps a newer version is needed?');
   throw e;
  }
  global.Worker = nodeWorkerThreads.Worker;
 } else if (ENVIRONMENT_IS_SHELL) {
  if (typeof read != "undefined") {
   read_ = function shell_read(f) {
    return read(f);
   };
  }
  readBinary = function readBinary(f) {
   var data;
   if (typeof readbuffer === "function") {
    return new Uint8Array(readbuffer(f));
   }
   data = read(f, "binary");
   assert(typeof data === "object");
   return data;
  };
  if (typeof scriptArgs != "undefined") {
   arguments_ = scriptArgs;
  } else if (typeof arguments != "undefined") {
   arguments_ = arguments;
  }
  if (typeof quit === "function") {
   quit_ = function(status) {
    quit(status);
   };
  }
  if (typeof print !== "undefined") {
   if (typeof console === "undefined") console = {};
   console.log = print;
   console.warn = console.error = typeof printErr !== "undefined" ? printErr : print;
  }
 } else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
  if (ENVIRONMENT_IS_WORKER) {
   scriptDirectory = self.location.href;
  } else if (document.currentScript) {
   scriptDirectory = document.currentScript.src;
  }
  if (scriptDirectory.indexOf("blob:") !== 0) {
   scriptDirectory = scriptDirectory.substr(0, scriptDirectory.lastIndexOf("/") + 1);
  } else {
   scriptDirectory = "";
  }
  if (ENVIRONMENT_IS_NODE) {
   read_ = function shell_read(filename, binary) {
    if (!nodeFS) nodeFS = require("fs");
    if (!nodePath) nodePath = require("path");
    filename = nodePath["normalize"](filename);
    return nodeFS["readFileSync"](filename, binary ? null : "utf8");
   };
   readBinary = function readBinary(filename) {
    var ret = read_(filename, true);
    if (!ret.buffer) {
     ret = new Uint8Array(ret);
    }
    assert(ret.buffer);
    return ret;
   };
  } else {
   read_ = function shell_read(url) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, false);
    xhr.send(null);
    return xhr.responseText;
   };
   if (ENVIRONMENT_IS_WORKER) {
    readBinary = function readBinary(url) {
     var xhr = new XMLHttpRequest();
     xhr.open("GET", url, false);
     xhr.responseType = "arraybuffer";
     xhr.send(null);
     return new Uint8Array(xhr.response);
    };
   }
   readAsync = function readAsync(url, onload, onerror) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.responseType = "arraybuffer";
    xhr.onload = function xhr_onload() {
     if (xhr.status == 200 || xhr.status == 0 && xhr.response) {
      onload(xhr.response);
      return;
     }
     onerror();
    };
    xhr.onerror = onerror;
    xhr.send(null);
   };
  }
  setWindowTitle = function(title) {
   document.title = title;
  };
 } else {
  throw new Error("environment detection error");
 }
 if (ENVIRONMENT_IS_NODE) {
  if (typeof performance === "undefined") {
   global.performance = require("perf_hooks").performance;
  }
 }
 var out = Module["print"] || console.log.bind(console);
 var err = Module["printErr"] || console.warn.bind(console);
 for (key in moduleOverrides) {
  if (moduleOverrides.hasOwnProperty(key)) {
   Module[key] = moduleOverrides[key];
  }
 }
 moduleOverrides = null;
 if (Module["arguments"]) arguments_ = Module["arguments"];
 if (!Object.getOwnPropertyDescriptor(Module, "arguments")) Object.defineProperty(Module, "arguments", {
  configurable: true,
  get: function() {
   abort("Module.arguments has been replaced with plain arguments_ (the initial value can be provided on Module, but after startup the value is only looked for on a local variable of that name)");
  }
 });
 if (Module["thisProgram"]) thisProgram = Module["thisProgram"];
 if (!Object.getOwnPropertyDescriptor(Module, "thisProgram")) Object.defineProperty(Module, "thisProgram", {
  configurable: true,
  get: function() {
   abort("Module.thisProgram has been replaced with plain thisProgram (the initial value can be provided on Module, but after startup the value is only looked for on a local variable of that name)");
  }
 });
 if (Module["quit"]) quit_ = Module["quit"];
 if (!Object.getOwnPropertyDescriptor(Module, "quit")) Object.defineProperty(Module, "quit", {
  configurable: true,
  get: function() {
   abort("Module.quit has been replaced with plain quit_ (the initial value can be provided on Module, but after startup the value is only looked for on a local variable of that name)");
  }
 });
 assert(typeof Module["memoryInitializerPrefixURL"] === "undefined", "Module.memoryInitializerPrefixURL option was removed, use Module.locateFile instead");
 assert(typeof Module["pthreadMainPrefixURL"] === "undefined", "Module.pthreadMainPrefixURL option was removed, use Module.locateFile instead");
 assert(typeof Module["cdInitializerPrefixURL"] === "undefined", "Module.cdInitializerPrefixURL option was removed, use Module.locateFile instead");
 assert(typeof Module["filePackagePrefixURL"] === "undefined", "Module.filePackagePrefixURL option was removed, use Module.locateFile instead");
 assert(typeof Module["read"] === "undefined", "Module.read option was removed (modify read_ in JS)");
 assert(typeof Module["readAsync"] === "undefined", "Module.readAsync option was removed (modify readAsync in JS)");
 assert(typeof Module["readBinary"] === "undefined", "Module.readBinary option was removed (modify readBinary in JS)");
 assert(typeof Module["setWindowTitle"] === "undefined", "Module.setWindowTitle option was removed (modify setWindowTitle in JS)");
 assert(typeof Module["TOTAL_MEMORY"] === "undefined", "Module.TOTAL_MEMORY has been renamed Module.INITIAL_MEMORY");
 if (!Object.getOwnPropertyDescriptor(Module, "read")) Object.defineProperty(Module, "read", {
  configurable: true,
  get: function() {
   abort("Module.read has been replaced with plain read_ (the initial value can be provided on Module, but after startup the value is only looked for on a local variable of that name)");
  }
 });
 if (!Object.getOwnPropertyDescriptor(Module, "readAsync")) Object.defineProperty(Module, "readAsync", {
  configurable: true,
  get: function() {
   abort("Module.readAsync has been replaced with plain readAsync (the initial value can be provided on Module, but after startup the value is only looked for on a local variable of that name)");
  }
 });
 if (!Object.getOwnPropertyDescriptor(Module, "readBinary")) Object.defineProperty(Module, "readBinary", {
  configurable: true,
  get: function() {
   abort("Module.readBinary has been replaced with plain readBinary (the initial value can be provided on Module, but after startup the value is only looked for on a local variable of that name)");
  }
 });
 if (!Object.getOwnPropertyDescriptor(Module, "setWindowTitle")) Object.defineProperty(Module, "setWindowTitle", {
  configurable: true,
  get: function() {
   abort("Module.setWindowTitle has been replaced with plain setWindowTitle (the initial value can be provided on Module, but after startup the value is only looked for on a local variable of that name)");
  }
 });
 var IDBFS = "IDBFS is no longer included by default; build with -lidbfs.js";
 var PROXYFS = "PROXYFS is no longer included by default; build with -lproxyfs.js";
 var NODEFS = "NODEFS is no longer included by default; build with -lnodefs.js";
 assert(ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER || ENVIRONMENT_IS_NODE, "Pthreads do not work in this environment yet (need Web Workers, or an alternative to them)");
 var STACK_ALIGN = 16;
 function dynamicAlloc(size) {
  assert(DYNAMICTOP_PTR);
  assert(!ENVIRONMENT_IS_PTHREAD);
  var ret = GROWABLE_HEAP_I32()[DYNAMICTOP_PTR >> 2];
  var end = ret + size + 15 & -16;
  assert(end <= GROWABLE_HEAP_I8().length, "failure to dynamicAlloc - memory growth etc. is not supported there, call malloc/sbrk directly");
  GROWABLE_HEAP_I32()[DYNAMICTOP_PTR >> 2] = end;
  return ret;
 }
 function alignMemory(size, factor) {
  if (!factor) factor = STACK_ALIGN;
  return Math.ceil(size / factor) * factor;
 }
 function getNativeTypeSize(type) {
  switch (type) {
  case "i1":
  case "i8":
   return 1;

  case "i16":
   return 2;

  case "i32":
   return 4;

  case "i64":
   return 8;

  case "float":
   return 4;

  case "double":
   return 8;

  default:
   {
    if (type[type.length - 1] === "*") {
     return 4;
    } else if (type[0] === "i") {
     var bits = Number(type.substr(1));
     assert(bits % 8 === 0, "getNativeTypeSize invalid bits " + bits + ", type " + type);
     return bits / 8;
    } else {
     return 0;
    }
   }
  }
 }
 function warnOnce(text) {
  if (!warnOnce.shown) warnOnce.shown = {};
  if (!warnOnce.shown[text]) {
   warnOnce.shown[text] = 1;
   err(text);
  }
 }
 function convertJsFunctionToWasm(func, sig) {
  if (typeof WebAssembly.Function === "function") {
   var typeNames = {
    "i": "i32",
    "j": "i64",
    "f": "f32",
    "d": "f64"
   };
   var type = {
    parameters: [],
    results: sig[0] == "v" ? [] : [ typeNames[sig[0]] ]
   };
   for (var i = 1; i < sig.length; ++i) {
    type.parameters.push(typeNames[sig[i]]);
   }
   return new WebAssembly.Function(type, func);
  }
  var typeSection = [ 1, 0, 1, 96 ];
  var sigRet = sig.slice(0, 1);
  var sigParam = sig.slice(1);
  var typeCodes = {
   "i": 127,
   "j": 126,
   "f": 125,
   "d": 124
  };
  typeSection.push(sigParam.length);
  for (var i = 0; i < sigParam.length; ++i) {
   typeSection.push(typeCodes[sigParam[i]]);
  }
  if (sigRet == "v") {
   typeSection.push(0);
  } else {
   typeSection = typeSection.concat([ 1, typeCodes[sigRet] ]);
  }
  typeSection[1] = typeSection.length - 2;
  var bytes = new Uint8Array([ 0, 97, 115, 109, 1, 0, 0, 0 ].concat(typeSection, [ 2, 7, 1, 1, 101, 1, 102, 0, 0, 7, 5, 1, 1, 102, 0, 0 ]));
  var module = new WebAssembly.Module(bytes);
  var instance = new WebAssembly.Instance(module, {
   "e": {
    "f": func
   }
  });
  var wrappedFunc = instance.exports["f"];
  return wrappedFunc;
 }
 var freeTableIndexes = [];
 var functionsInTableMap;
 function addFunctionWasm(func, sig) {
  var table = wasmTable;
  if (!functionsInTableMap) {
   functionsInTableMap = new WeakMap();
   for (var i = 0; i < table.length; i++) {
    var item = table.get(i);
    if (item) {
     functionsInTableMap.set(item, i);
    }
   }
  }
  if (functionsInTableMap.has(func)) {
   return functionsInTableMap.get(func);
  }
  var ret;
  if (freeTableIndexes.length) {
   ret = freeTableIndexes.pop();
  } else {
   ret = table.length;
   try {
    table.grow(1);
   } catch (err) {
    if (!(err instanceof RangeError)) {
     throw err;
    }
    throw "Unable to grow wasm table. Set ALLOW_TABLE_GROWTH.";
   }
  }
  try {
   table.set(ret, func);
  } catch (err) {
   if (!(err instanceof TypeError)) {
    throw err;
   }
   assert(typeof sig !== "undefined", "Missing signature argument to addFunction");
   var wrapped = convertJsFunctionToWasm(func, sig);
   table.set(ret, wrapped);
  }
  functionsInTableMap.set(func, ret);
  return ret;
 }
 function removeFunctionWasm(index) {
  functionsInTableMap.delete(wasmTable.get(index));
  freeTableIndexes.push(index);
 }
 function addFunction(func, sig) {
  assert(typeof func !== "undefined");
  return addFunctionWasm(func, sig);
 }
 function removeFunction(index) {
  removeFunctionWasm(index);
 }
 var funcWrappers = {};
 function getFuncWrapper(func, sig) {
  if (!func) return;
  assert(sig);
  if (!funcWrappers[sig]) {
   funcWrappers[sig] = {};
  }
  var sigCache = funcWrappers[sig];
  if (!sigCache[func]) {
   if (sig.length === 1) {
    sigCache[func] = function dynCall_wrapper() {
     return dynCall(sig, func);
    };
   } else if (sig.length === 2) {
    sigCache[func] = function dynCall_wrapper(arg) {
     return dynCall(sig, func, [ arg ]);
    };
   } else {
    sigCache[func] = function dynCall_wrapper() {
     return dynCall(sig, func, Array.prototype.slice.call(arguments));
    };
   }
  }
  return sigCache[func];
 }
 function makeBigInt(low, high, unsigned) {
  return unsigned ? +(low >>> 0) + +(high >>> 0) * 4294967296 : +(low >>> 0) + +(high | 0) * 4294967296;
 }
 function dynCall(sig, ptr, args) {
  if (args && args.length) {
   assert(args.length === sig.substring(1).replace(/j/g, "--").length);
   assert("dynCall_" + sig in Module, "bad function pointer type - no table for sig '" + sig + "'");
   return Module["dynCall_" + sig].apply(null, [ ptr ].concat(args));
  } else {
   assert(sig.length == 1);
   assert("dynCall_" + sig in Module, "bad function pointer type - no table for sig '" + sig + "'");
   return Module["dynCall_" + sig].call(null, ptr);
  }
 }
 var tempRet0 = 0;
 var setTempRet0 = function(value) {
  tempRet0 = value;
 };
 var getTempRet0 = function() {
  return tempRet0;
 };
 function getCompilerSetting(name) {
  throw "You must build with -s RETAIN_COMPILER_SETTINGS=1 for getCompilerSetting or emscripten_get_compiler_setting to work";
 }
 var GLOBAL_BASE = 1024;
 var Atomics_load = Atomics.load;
 var Atomics_store = Atomics.store;
 var Atomics_compareExchange = Atomics.compareExchange;
 var wasmBinary;
 if (Module["wasmBinary"]) wasmBinary = Module["wasmBinary"];
 if (!Object.getOwnPropertyDescriptor(Module, "wasmBinary")) Object.defineProperty(Module, "wasmBinary", {
  configurable: true,
  get: function() {
   abort("Module.wasmBinary has been replaced with plain wasmBinary (the initial value can be provided on Module, but after startup the value is only looked for on a local variable of that name)");
  }
 });
 var noExitRuntime;
 if (Module["noExitRuntime"]) noExitRuntime = Module["noExitRuntime"];
 if (!Object.getOwnPropertyDescriptor(Module, "noExitRuntime")) Object.defineProperty(Module, "noExitRuntime", {
  configurable: true,
  get: function() {
   abort("Module.noExitRuntime has been replaced with plain noExitRuntime (the initial value can be provided on Module, but after startup the value is only looked for on a local variable of that name)");
  }
 });
 if (typeof WebAssembly !== "object") {
  abort("No WebAssembly support found. Build with -s WASM=0 to target JavaScript instead.");
 }
 function setValue(ptr, value, type, noSafe) {
  type = type || "i8";
  if (type.charAt(type.length - 1) === "*") type = "i32";
  switch (type) {
  case "i1":
   GROWABLE_HEAP_I8()[ptr >> 0] = value;
   break;

  case "i8":
   GROWABLE_HEAP_I8()[ptr >> 0] = value;
   break;

  case "i16":
   GROWABLE_HEAP_I16()[ptr >> 1] = value;
   break;

  case "i32":
   GROWABLE_HEAP_I32()[ptr >> 2] = value;
   break;

  case "i64":
   tempI64 = [ value >>> 0, (tempDouble = value, +Math_abs(tempDouble) >= 1 ? tempDouble > 0 ? (Math_min(+Math_floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0 : ~~+Math_ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0) ],
   GROWABLE_HEAP_I32()[ptr >> 2] = tempI64[0], GROWABLE_HEAP_I32()[ptr + 4 >> 2] = tempI64[1];
   break;

  case "float":
   GROWABLE_HEAP_F32()[ptr >> 2] = value;
   break;

  case "double":
   GROWABLE_HEAP_F64()[ptr >> 3] = value;
   break;

  default:
   abort("invalid type for setValue: " + type);
  }
 }
 function getValue(ptr, type, noSafe) {
  type = type || "i8";
  if (type.charAt(type.length - 1) === "*") type = "i32";
  switch (type) {
  case "i1":
   return GROWABLE_HEAP_I8()[ptr >> 0];

  case "i8":
   return GROWABLE_HEAP_I8()[ptr >> 0];

  case "i16":
   return GROWABLE_HEAP_I16()[ptr >> 1];

  case "i32":
   return GROWABLE_HEAP_I32()[ptr >> 2];

  case "i64":
   return GROWABLE_HEAP_I32()[ptr >> 2];

  case "float":
   return GROWABLE_HEAP_F32()[ptr >> 2];

  case "double":
   return GROWABLE_HEAP_F64()[ptr >> 3];

  default:
   abort("invalid type for getValue: " + type);
  }
  return null;
 }
 var wasmMemory;
 var wasmTable = new WebAssembly.Table({
  "initial": 10032,
  "maximum": 10032 + 0,
  "element": "anyfunc"
 });
 var wasmModule;
 var threadInfoStruct = 0;
 var selfThreadId = 0;
 var ABORT = false;
 var EXITSTATUS = 0;
 // Support for growable heap + pthreads, where the buffer may change, so JS views
 // must be updated.
 function GROWABLE_HEAP_I8() {
   if (wasmMemory.buffer != buffer) {
     updateGlobalBufferAndViews(wasmMemory.buffer);
   }
   return HEAP8;
 }
 function GROWABLE_HEAP_U8() {
   if (wasmMemory.buffer != buffer) {
     updateGlobalBufferAndViews(wasmMemory.buffer);
   }
   return HEAPU8;
 }
 function GROWABLE_HEAP_I16() {
   if (wasmMemory.buffer != buffer) {
     updateGlobalBufferAndViews(wasmMemory.buffer);
   }
   return HEAP16;
 }
 function GROWABLE_HEAP_U16() {
   if (wasmMemory.buffer != buffer) {
     updateGlobalBufferAndViews(wasmMemory.buffer);
   }
   return HEAPU16;
 }
 function GROWABLE_HEAP_I32() {
   if (wasmMemory.buffer != buffer) {
     updateGlobalBufferAndViews(wasmMemory.buffer);
   }
   return HEAP32;
 }
 function GROWABLE_HEAP_U32() {
   if (wasmMemory.buffer != buffer) {
     updateGlobalBufferAndViews(wasmMemory.buffer);
   }
   return HEAPU32;
 }
 function GROWABLE_HEAP_F32() {
   if (wasmMemory.buffer != buffer) {
     updateGlobalBufferAndViews(wasmMemory.buffer);
   }
   return HEAPF32;
 }
 function GROWABLE_HEAP_F64() {
   if (wasmMemory.buffer != buffer) {
     updateGlobalBufferAndViews(wasmMemory.buffer);
   }
   return HEAPF64;
 }
 function assert(condition, text) {
  if (!condition) {
   abort("Assertion failed: " + text);
  }
 }
 function getCFunc(ident) {
  var func = Module["_" + ident];
  assert(func, "Cannot call unknown function " + ident + ", make sure it is exported");
  return func;
 }
 function ccall(ident, returnType, argTypes, args, opts) {
  var toC = {
   "string": function(str) {
    var ret = 0;
    if (str !== null && str !== undefined && str !== 0) {
     var len = (str.length << 2) + 1;
     ret = stackAlloc(len);
     stringToUTF8(str, ret, len);
    }
    return ret;
   },
   "array": function(arr) {
    var ret = stackAlloc(arr.length);
    writeArrayToMemory(arr, ret);
    return ret;
   }
  };
  function convertReturnValue(ret) {
   if (returnType === "string") return UTF8ToString(ret);
   if (returnType === "boolean") return Boolean(ret);
   return ret;
  }
  var func = getCFunc(ident);
  var cArgs = [];
  var stack = 0;
  assert(returnType !== "array", 'Return type should not be "array".');
  if (args) {
   for (var i = 0; i < args.length; i++) {
    var converter = toC[argTypes[i]];
    if (converter) {
     if (stack === 0) stack = stackSave();
     cArgs[i] = converter(args[i]);
    } else {
     cArgs[i] = args[i];
    }
   }
  }
  var ret = func.apply(null, cArgs);
  ret = convertReturnValue(ret);
  if (stack !== 0) stackRestore(stack);
  return ret;
 }
 function cwrap(ident, returnType, argTypes, opts) {
  return function() {
   return ccall(ident, returnType, argTypes, arguments, opts);
  };
 }
 var ALLOC_NORMAL = 0;
 var ALLOC_STACK = 1;
 var ALLOC_DYNAMIC = 2;
 var ALLOC_NONE = 3;
 function allocate(slab, types, allocator, ptr) {
  var zeroinit, size;
  if (typeof slab === "number") {
   zeroinit = true;
   size = slab;
  } else {
   zeroinit = false;
   size = slab.length;
  }
  var singleType = typeof types === "string" ? types : null;
  var ret;
  if (allocator == ALLOC_NONE) {
   ret = ptr;
  } else {
   ret = [ _malloc, stackAlloc, dynamicAlloc ][allocator](Math.max(size, singleType ? 1 : types.length));
  }
  if (zeroinit) {
   var stop;
   ptr = ret;
   assert((ret & 3) == 0);
   stop = ret + (size & ~3);
   for (;ptr < stop; ptr += 4) {
    GROWABLE_HEAP_I32()[ptr >> 2] = 0;
   }
   stop = ret + size;
   while (ptr < stop) {
    GROWABLE_HEAP_I8()[ptr++ >> 0] = 0;
   }
   return ret;
  }
  if (singleType === "i8") {
   if (slab.subarray || slab.slice) {
    GROWABLE_HEAP_U8().set(slab, ret);
   } else {
    GROWABLE_HEAP_U8().set(new Uint8Array(slab), ret);
   }
   return ret;
  }
  var i = 0, type, typeSize, previousType;
  while (i < size) {
   var curr = slab[i];
   type = singleType || types[i];
   if (type === 0) {
    i++;
    continue;
   }
   assert(type, "Must know what type to store in allocate!");
   if (type == "i64") type = "i32";
   setValue(ret + i, curr, type);
   if (previousType !== type) {
    typeSize = getNativeTypeSize(type);
    previousType = type;
   }
   i += typeSize;
  }
  return ret;
 }
 function getMemory(size) {
  if (!runtimeInitialized) return dynamicAlloc(size);
  return _malloc(size);
 }
 function UTF8ArrayToString(heap, idx, maxBytesToRead) {
  var endIdx = idx + maxBytesToRead;
  var str = "";
  while (!(idx >= endIdx)) {
   var u0 = heap[idx++];
   if (!u0) return str;
   if (!(u0 & 128)) {
    str += String.fromCharCode(u0);
    continue;
   }
   var u1 = heap[idx++] & 63;
   if ((u0 & 224) == 192) {
    str += String.fromCharCode((u0 & 31) << 6 | u1);
    continue;
   }
   var u2 = heap[idx++] & 63;
   if ((u0 & 240) == 224) {
    u0 = (u0 & 15) << 12 | u1 << 6 | u2;
   } else {
    if ((u0 & 248) != 240) warnOnce("Invalid UTF-8 leading byte 0x" + u0.toString(16) + " encountered when deserializing a UTF-8 string on the asm.js/wasm heap to a JS string!");
    u0 = (u0 & 7) << 18 | u1 << 12 | u2 << 6 | heap[idx++] & 63;
   }
   if (u0 < 65536) {
    str += String.fromCharCode(u0);
   } else {
    var ch = u0 - 65536;
    str += String.fromCharCode(55296 | ch >> 10, 56320 | ch & 1023);
   }
  }
  return str;
 }
 function UTF8ToString(ptr, maxBytesToRead) {
  return ptr ? UTF8ArrayToString(GROWABLE_HEAP_U8(), ptr, maxBytesToRead) : "";
 }
 function stringToUTF8Array(str, heap, outIdx, maxBytesToWrite) {
  if (!(maxBytesToWrite > 0)) return 0;
  var startIdx = outIdx;
  var endIdx = outIdx + maxBytesToWrite - 1;
  for (var i = 0; i < str.length; ++i) {
   var u = str.charCodeAt(i);
   if (u >= 55296 && u <= 57343) {
    var u1 = str.charCodeAt(++i);
    u = 65536 + ((u & 1023) << 10) | u1 & 1023;
   }
   if (u <= 127) {
    if (outIdx >= endIdx) break;
    heap[outIdx++] = u;
   } else if (u <= 2047) {
    if (outIdx + 1 >= endIdx) break;
    heap[outIdx++] = 192 | u >> 6;
    heap[outIdx++] = 128 | u & 63;
   } else if (u <= 65535) {
    if (outIdx + 2 >= endIdx) break;
    heap[outIdx++] = 224 | u >> 12;
    heap[outIdx++] = 128 | u >> 6 & 63;
    heap[outIdx++] = 128 | u & 63;
   } else {
    if (outIdx + 3 >= endIdx) break;
    if (u >= 2097152) warnOnce("Invalid Unicode code point 0x" + u.toString(16) + " encountered when serializing a JS string to an UTF-8 string on the asm.js/wasm heap! (Valid unicode code points should be in range 0-0x1FFFFF).");
    heap[outIdx++] = 240 | u >> 18;
    heap[outIdx++] = 128 | u >> 12 & 63;
    heap[outIdx++] = 128 | u >> 6 & 63;
    heap[outIdx++] = 128 | u & 63;
   }
  }
  heap[outIdx] = 0;
  return outIdx - startIdx;
 }
 function stringToUTF8(str, outPtr, maxBytesToWrite) {
  assert(typeof maxBytesToWrite == "number", "stringToUTF8(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!");
  return stringToUTF8Array(str, GROWABLE_HEAP_U8(), outPtr, maxBytesToWrite);
 }
 function lengthBytesUTF8(str) {
  var len = 0;
  for (var i = 0; i < str.length; ++i) {
   var u = str.charCodeAt(i);
   if (u >= 55296 && u <= 57343) u = 65536 + ((u & 1023) << 10) | str.charCodeAt(++i) & 1023;
   if (u <= 127) ++len; else if (u <= 2047) len += 2; else if (u <= 65535) len += 3; else len += 4;
  }
  return len;
 }
 function AsciiToString(ptr) {
  var str = "";
  while (1) {
   var ch = GROWABLE_HEAP_U8()[ptr++ >> 0];
   if (!ch) return str;
   str += String.fromCharCode(ch);
  }
 }
 function stringToAscii(str, outPtr) {
  return writeAsciiToMemory(str, outPtr, false);
 }
 function UTF16ToString(ptr, maxBytesToRead) {
  assert(ptr % 2 == 0, "Pointer passed to UTF16ToString must be aligned to two bytes!");
  var i = 0;
  var str = "";
  while (1) {
   var codeUnit = GROWABLE_HEAP_I16()[ptr + i * 2 >> 1];
   if (codeUnit == 0 || i == maxBytesToRead / 2) return str;
   ++i;
   str += String.fromCharCode(codeUnit);
  }
 }
 function stringToUTF16(str, outPtr, maxBytesToWrite) {
  assert(outPtr % 2 == 0, "Pointer passed to stringToUTF16 must be aligned to two bytes!");
  assert(typeof maxBytesToWrite == "number", "stringToUTF16(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!");
  if (maxBytesToWrite === undefined) {
   maxBytesToWrite = 2147483647;
  }
  if (maxBytesToWrite < 2) return 0;
  maxBytesToWrite -= 2;
  var startPtr = outPtr;
  var numCharsToWrite = maxBytesToWrite < str.length * 2 ? maxBytesToWrite / 2 : str.length;
  for (var i = 0; i < numCharsToWrite; ++i) {
   var codeUnit = str.charCodeAt(i);
   GROWABLE_HEAP_I16()[outPtr >> 1] = codeUnit;
   outPtr += 2;
  }
  GROWABLE_HEAP_I16()[outPtr >> 1] = 0;
  return outPtr - startPtr;
 }
 function lengthBytesUTF16(str) {
  return str.length * 2;
 }
 function UTF32ToString(ptr, maxBytesToRead) {
  assert(ptr % 4 == 0, "Pointer passed to UTF32ToString must be aligned to four bytes!");
  var i = 0;
  var str = "";
  while (!(i >= maxBytesToRead / 4)) {
   var utf32 = GROWABLE_HEAP_I32()[ptr + i * 4 >> 2];
   if (utf32 == 0) break;
   ++i;
   if (utf32 >= 65536) {
    var ch = utf32 - 65536;
    str += String.fromCharCode(55296 | ch >> 10, 56320 | ch & 1023);
   } else {
    str += String.fromCharCode(utf32);
   }
  }
  return str;
 }
 function stringToUTF32(str, outPtr, maxBytesToWrite) {
  assert(outPtr % 4 == 0, "Pointer passed to stringToUTF32 must be aligned to four bytes!");
  assert(typeof maxBytesToWrite == "number", "stringToUTF32(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!");
  if (maxBytesToWrite === undefined) {
   maxBytesToWrite = 2147483647;
  }
  if (maxBytesToWrite < 4) return 0;
  var startPtr = outPtr;
  var endPtr = startPtr + maxBytesToWrite - 4;
  for (var i = 0; i < str.length; ++i) {
   var codeUnit = str.charCodeAt(i);
   if (codeUnit >= 55296 && codeUnit <= 57343) {
    var trailSurrogate = str.charCodeAt(++i);
    codeUnit = 65536 + ((codeUnit & 1023) << 10) | trailSurrogate & 1023;
   }
   GROWABLE_HEAP_I32()[outPtr >> 2] = codeUnit;
   outPtr += 4;
   if (outPtr + 4 > endPtr) break;
  }
  GROWABLE_HEAP_I32()[outPtr >> 2] = 0;
  return outPtr - startPtr;
 }
 function lengthBytesUTF32(str) {
  var len = 0;
  for (var i = 0; i < str.length; ++i) {
   var codeUnit = str.charCodeAt(i);
   if (codeUnit >= 55296 && codeUnit <= 57343) ++i;
   len += 4;
  }
  return len;
 }
 function allocateUTF8(str) {
  var size = lengthBytesUTF8(str) + 1;
  var ret = _malloc(size);
  if (ret) stringToUTF8Array(str, GROWABLE_HEAP_I8(), ret, size);
  return ret;
 }
 function allocateUTF8OnStack(str) {
  var size = lengthBytesUTF8(str) + 1;
  var ret = stackAlloc(size);
  stringToUTF8Array(str, GROWABLE_HEAP_I8(), ret, size);
  return ret;
 }
 function writeStringToMemory(string, buffer, dontAddNull) {
  warnOnce("writeStringToMemory is deprecated and should not be called! Use stringToUTF8() instead!");
  var lastChar, end;
  if (dontAddNull) {
   end = buffer + lengthBytesUTF8(string);
   lastChar = GROWABLE_HEAP_I8()[end];
  }
  stringToUTF8(string, buffer, Infinity);
  if (dontAddNull) GROWABLE_HEAP_I8()[end] = lastChar;
 }
 function writeArrayToMemory(array, buffer) {
  assert(array.length >= 0, "writeArrayToMemory array must have a length (should be an array or typed array)");
  GROWABLE_HEAP_I8().set(array, buffer);
 }
 function writeAsciiToMemory(str, buffer, dontAddNull) {
  for (var i = 0; i < str.length; ++i) {
   assert(str.charCodeAt(i) === str.charCodeAt(i) & 255);
   GROWABLE_HEAP_I8()[buffer++ >> 0] = str.charCodeAt(i);
  }
  if (!dontAddNull) GROWABLE_HEAP_I8()[buffer >> 0] = 0;
 }
 var PAGE_SIZE = 16384;
 var WASM_PAGE_SIZE = 65536;
 var ASMJS_PAGE_SIZE = 16777216;
 function alignUp(x, multiple) {
  if (x % multiple > 0) {
   x += multiple - x % multiple;
  }
  return x;
 }
 var HEAP, buffer, HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;
 function updateGlobalBufferAndViews(buf) {
  buffer = buf;
  Module["HEAP8"] = HEAP8 = new Int8Array(buf);
  Module["HEAP16"] = HEAP16 = new Int16Array(buf);
  Module["HEAP32"] = HEAP32 = new Int32Array(buf);
  Module["HEAPU8"] = HEAPU8 = new Uint8Array(buf);
  Module["HEAPU16"] = HEAPU16 = new Uint16Array(buf);
  Module["HEAPU32"] = HEAPU32 = new Uint32Array(buf);
  Module["HEAPF32"] = HEAPF32 = new Float32Array(buf);
  Module["HEAPF64"] = HEAPF64 = new Float64Array(buf);
 }
 var STATIC_BASE = 1024, STACK_BASE = 19459904, STACKTOP = STACK_BASE, STACK_MAX = 14217024, DYNAMIC_BASE = 19459904, DYNAMICTOP_PTR = 14216096;
 assert(STACK_BASE % 16 === 0, "stack must start aligned");
 assert(DYNAMIC_BASE % 16 === 0, "heap must start aligned");
 if (ENVIRONMENT_IS_PTHREAD) {
  STACK_MAX = STACKTOP = STACK_MAX = 2147483647;
 }
 var TOTAL_STACK = 5242880;
 if (Module["TOTAL_STACK"]) assert(TOTAL_STACK === Module["TOTAL_STACK"], "the stack size can no longer be determined at runtime");
 var INITIAL_INITIAL_MEMORY = Module["INITIAL_MEMORY"] || 268435456;
 if (!Object.getOwnPropertyDescriptor(Module, "INITIAL_MEMORY")) Object.defineProperty(Module, "INITIAL_MEMORY", {
  configurable: true,
  get: function() {
   abort("Module.INITIAL_MEMORY has been replaced with plain INITIAL_INITIAL_MEMORY (the initial value can be provided on Module, but after startup the value is only looked for on a local variable of that name)");
  }
 });
 assert(INITIAL_INITIAL_MEMORY >= TOTAL_STACK, "INITIAL_MEMORY should be larger than TOTAL_STACK, was " + INITIAL_INITIAL_MEMORY + "! (TOTAL_STACK=" + TOTAL_STACK + ")");
 assert(typeof Int32Array !== "undefined" && typeof Float64Array !== "undefined" && Int32Array.prototype.subarray !== undefined && Int32Array.prototype.set !== undefined, "JS engine does not provide full typed array support");
 if (ENVIRONMENT_IS_PTHREAD) {
  wasmMemory = Module["wasmMemory"];
  buffer = Module["buffer"];
 } else {
  if (Module["wasmMemory"]) {
   wasmMemory = Module["wasmMemory"];
  } else {
   wasmMemory = new WebAssembly.Memory({
    "initial": INITIAL_INITIAL_MEMORY / WASM_PAGE_SIZE,
    "maximum": 2147483648 / WASM_PAGE_SIZE,
    "shared": true
   });
   if (!(wasmMemory.buffer instanceof SharedArrayBuffer)) {
    err("requested a shared WebAssembly.Memory but the returned buffer is not a SharedArrayBuffer, indicating that while the browser has SharedArrayBuffer it does not have WebAssembly threads support - you may need to set a flag");
    if (ENVIRONMENT_IS_NODE) {
     console.log("(on node you may need: --experimental-wasm-threads --experimental-wasm-bulk-memory and also use a recent version)");
    }
    throw Error("bad memory");
   }
  }
 }
 if (wasmMemory) {
  buffer = wasmMemory.buffer;
 }
 INITIAL_INITIAL_MEMORY = buffer.byteLength;
 assert(INITIAL_INITIAL_MEMORY % WASM_PAGE_SIZE === 0);
 assert(65536 % WASM_PAGE_SIZE === 0);
 updateGlobalBufferAndViews(buffer);
 if (!ENVIRONMENT_IS_PTHREAD) {
  GROWABLE_HEAP_I32()[DYNAMICTOP_PTR >> 2] = DYNAMIC_BASE;
 }
 function writeStackCookie() {
  assert((STACK_MAX & 3) == 0);
  GROWABLE_HEAP_U32()[(STACK_MAX >> 2) + 1] = 34821223;
  GROWABLE_HEAP_U32()[(STACK_MAX >> 2) + 2] = 2310721022;
  GROWABLE_HEAP_I32()[0] = 1668509029;
 }
 function checkStackCookie() {
  var cookie1 = GROWABLE_HEAP_U32()[(STACK_MAX >> 2) + 1];
  var cookie2 = GROWABLE_HEAP_U32()[(STACK_MAX >> 2) + 2];
  if (cookie1 != 34821223 || cookie2 != 2310721022) {
   abort("Stack overflow! Stack cookie has been overwritten, expected hex dwords 0x89BACDFE and 0x2135467, but received 0x" + cookie2.toString(16) + " " + cookie1.toString(16));
  }
  if (GROWABLE_HEAP_I32()[0] !== 1668509029) abort("Runtime error: The application has corrupted its heap memory area (address zero)!");
 }
 (function() {
  var h16 = new Int16Array(1);
  var h8 = new Int8Array(h16.buffer);
  h16[0] = 25459;
  if (h8[0] !== 115 || h8[1] !== 99) throw "Runtime error: expected the system to be little-endian!";
 })();
 function abortFnPtrError(ptr, sig) {
  abort("Invalid function pointer " + ptr + " called with signature '" + sig + "'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this). Build with ASSERTIONS=2 for more info.");
 }
 function callRuntimeCallbacks(callbacks) {
  while (callbacks.length > 0) {
   var callback = callbacks.shift();
   if (typeof callback == "function") {
    callback(Module);
    continue;
   }
   var func = callback.func;
   if (typeof func === "number") {
    if (callback.arg === undefined) {
     Module["dynCall_v"](func);
    } else {
     Module["dynCall_vi"](func, callback.arg);
    }
   } else {
    func(callback.arg === undefined ? null : callback.arg);
   }
  }
 }
 var __ATPRERUN__ = [];
 var __ATINIT__ = [];
 var __ATMAIN__ = [];
 var __ATEXIT__ = [];
 var __ATPOSTRUN__ = [];
 var runtimeInitialized = false;
 var runtimeExited = false;
 if (ENVIRONMENT_IS_PTHREAD) runtimeInitialized = true;
 function preRun() {
  if (ENVIRONMENT_IS_PTHREAD) return;
  if (Module["preRun"]) {
   if (typeof Module["preRun"] == "function") Module["preRun"] = [ Module["preRun"] ];
   while (Module["preRun"].length) {
    addOnPreRun(Module["preRun"].shift());
   }
  }
  callRuntimeCallbacks(__ATPRERUN__);
 }
 function initRuntime() {
  checkStackCookie();
  assert(!runtimeInitialized);
  runtimeInitialized = true;
  if (!Module["noFSInit"] && !FS.init.initialized) FS.init();
  TTY.init();
  SOCKFS.root = FS.mount(SOCKFS, {}, null);
  callRuntimeCallbacks(__ATINIT__);
 }
 function preMain() {
  checkStackCookie();
  if (ENVIRONMENT_IS_PTHREAD) return;
  FS.ignorePermissions = false;
  callRuntimeCallbacks(__ATMAIN__);
 }
 function exitRuntime() {
  checkStackCookie();
  if (ENVIRONMENT_IS_PTHREAD) return;
  runtimeExited = true;
 }
 function postRun() {
  checkStackCookie();
  if (ENVIRONMENT_IS_PTHREAD) return;
  if (Module["postRun"]) {
   if (typeof Module["postRun"] == "function") Module["postRun"] = [ Module["postRun"] ];
   while (Module["postRun"].length) {
    addOnPostRun(Module["postRun"].shift());
   }
  }
  callRuntimeCallbacks(__ATPOSTRUN__);
 }
 function addOnPreRun(cb) {
  __ATPRERUN__.unshift(cb);
 }
 function addOnInit(cb) {
  __ATINIT__.unshift(cb);
 }
 function addOnPreMain(cb) {
  __ATMAIN__.unshift(cb);
 }
 function addOnExit(cb) {}
 function addOnPostRun(cb) {
  __ATPOSTRUN__.unshift(cb);
 }
 function unSign(value, bits, ignore) {
  if (value >= 0) {
   return value;
  }
  return bits <= 32 ? 2 * Math.abs(1 << bits - 1) + value : Math.pow(2, bits) + value;
 }
 function reSign(value, bits, ignore) {
  if (value <= 0) {
   return value;
  }
  var half = bits <= 32 ? Math.abs(1 << bits - 1) : Math.pow(2, bits - 1);
  if (value >= half && (bits <= 32 || value > half)) {
   value = -2 * half + value;
  }
  return value;
 }
 assert(Math.imul, "This browser does not support Math.imul(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill");
 assert(Math.fround, "This browser does not support Math.fround(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill");
 assert(Math.clz32, "This browser does not support Math.clz32(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill");
 assert(Math.trunc, "This browser does not support Math.trunc(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill");
 var Math_abs = Math.abs;
 var Math_cos = Math.cos;
 var Math_sin = Math.sin;
 var Math_tan = Math.tan;
 var Math_acos = Math.acos;
 var Math_asin = Math.asin;
 var Math_atan = Math.atan;
 var Math_atan2 = Math.atan2;
 var Math_exp = Math.exp;
 var Math_log = Math.log;
 var Math_sqrt = Math.sqrt;
 var Math_ceil = Math.ceil;
 var Math_floor = Math.floor;
 var Math_pow = Math.pow;
 var Math_imul = Math.imul;
 var Math_fround = Math.fround;
 var Math_round = Math.round;
 var Math_min = Math.min;
 var Math_max = Math.max;
 var Math_clz32 = Math.clz32;
 var Math_trunc = Math.trunc;
 var runDependencies = 0;
 var runDependencyWatcher = null;
 var dependenciesFulfilled = null;
 var runDependencyTracking = {};
 function getUniqueRunDependency(id) {
  var orig = id;
  while (1) {
   if (!runDependencyTracking[id]) return id;
   id = orig + Math.random();
  }
 }
 function addRunDependency(id) {
  assert(!ENVIRONMENT_IS_PTHREAD, "addRunDependency cannot be used in a pthread worker");
  runDependencies++;
  if (Module["monitorRunDependencies"]) {
   Module["monitorRunDependencies"](runDependencies);
  }
  if (id) {
   assert(!runDependencyTracking[id]);
   runDependencyTracking[id] = 1;
   if (runDependencyWatcher === null && typeof setInterval !== "undefined") {
    runDependencyWatcher = setInterval(function() {
     if (ABORT) {
      clearInterval(runDependencyWatcher);
      runDependencyWatcher = null;
      return;
     }
     var shown = false;
     for (var dep in runDependencyTracking) {
      if (!shown) {
       shown = true;
       err("still waiting on run dependencies:");
      }
      err("dependency: " + dep);
     }
     if (shown) {
      err("(end of list)");
     }
    }, 1e4);
   }
  } else {
   err("warning: run dependency added without ID");
  }
 }
 function removeRunDependency(id) {
  runDependencies--;
  if (Module["monitorRunDependencies"]) {
   Module["monitorRunDependencies"](runDependencies);
  }
  if (id) {
   assert(runDependencyTracking[id]);
   delete runDependencyTracking[id];
  } else {
   err("warning: run dependency removed without ID");
  }
  if (runDependencies == 0) {
   if (runDependencyWatcher !== null) {
    clearInterval(runDependencyWatcher);
    runDependencyWatcher = null;
   }
   if (dependenciesFulfilled) {
    var callback = dependenciesFulfilled;
    dependenciesFulfilled = null;
    callback();
   }
  }
 }
 Module["preloadedImages"] = {};
 Module["preloadedAudios"] = {};
 function abort(what) {
  if (Module["onAbort"]) {
   Module["onAbort"](what);
  }
  if (ENVIRONMENT_IS_PTHREAD) console.error("Pthread aborting at " + new Error().stack);
  what += "";
  out(what);
  err(what);
  ABORT = true;
  EXITSTATUS = 1;
  var output = "abort(" + what + ") at " + stackTrace();
  what = output;
  throw new WebAssembly.RuntimeError(what);
 }
 var memoryInitializer = null;
 function hasPrefix(str, prefix) {
  return String.prototype.startsWith ? str.startsWith(prefix) : str.indexOf(prefix) === 0;
 }
 var dataURIPrefix = "data:application/octet-stream;base64,";
 function isDataURI(filename) {
  return hasPrefix(filename, dataURIPrefix);
 }
 var fileURIPrefix = "file://";
 function isFileURI(filename) {
  return hasPrefix(filename, fileURIPrefix);
 }
 function createExportWrapper(name, fixedasm) {
  return function() {
   var displayName = name;
   var asm = fixedasm;
   if (!fixedasm) {
    asm = Module["asm"];
   }
   assert(runtimeInitialized, "native function `" + displayName + "` called before runtime initialization");
   assert(!runtimeExited, "native function `" + displayName + "` called after runtime exit (use NO_EXIT_RUNTIME to keep it alive after main() exits)");
   if (!asm[name]) {
    assert(asm[name], "exported native function `" + displayName + "` not found");
   }
   return asm[name].apply(null, arguments);
  };
 }
 var wasmBinaryFile = "ffmpeg.wasm";
 if (!isDataURI(wasmBinaryFile)) {
  wasmBinaryFile = locateFile(wasmBinaryFile);
 }
 function getBinary() {
  try {
   if (wasmBinary) {
    return new Uint8Array(wasmBinary);
   }
   if (readBinary) {
    return readBinary(wasmBinaryFile);
   } else {
    throw "both async and sync fetching of the wasm failed";
   }
  } catch (err) {
   abort(err);
  }
 }
 function getBinaryPromise() {
  if (!wasmBinary && (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) && typeof fetch === "function" && !isFileURI(wasmBinaryFile)) {
   return fetch(wasmBinaryFile, {
    credentials: "same-origin"
   }).then(function(response) {
    if (!response["ok"]) {
     throw "failed to load wasm binary file at '" + wasmBinaryFile + "'";
    }
    return response["arrayBuffer"]();
   }).catch(function() {
    return getBinary();
   });
  }
  return new Promise(function(resolve, reject) {
   resolve(getBinary());
  });
 }
 function createWasm() {
  var info = {
   "env": asmLibraryArg,
   "wasi_snapshot_preview1": asmLibraryArg
  };
  function receiveInstance(instance, module) {
   var exports = instance.exports;
   Module["asm"] = exports;
   wasmModule = module;
   if (!ENVIRONMENT_IS_PTHREAD) {
    removeRunDependency("wasm-instantiate");
   }
  }
  if (!ENVIRONMENT_IS_PTHREAD) {
   addRunDependency("wasm-instantiate");
  }
  var trueModule = Module;
  function receiveInstantiatedSource(output) {
   assert(Module === trueModule, "the Module object should not be replaced during async compilation - perhaps the order of HTML elements is wrong?");
   trueModule = null;
   receiveInstance(output["instance"], output["module"]);
  }
  function instantiateArrayBuffer(receiver) {
   return getBinaryPromise().then(function(binary) {
    return WebAssembly.instantiate(binary, info);
   }).then(receiver, function(reason) {
    err("failed to asynchronously prepare wasm: " + reason);
    abort(reason);
   });
  }
  function instantiateAsync() {
   if (!wasmBinary && typeof WebAssembly.instantiateStreaming === "function" && !isDataURI(wasmBinaryFile) && !isFileURI(wasmBinaryFile) && typeof fetch === "function") {
    fetch(wasmBinaryFile, {
     credentials: "same-origin"
    }).then(function(response) {
     var result = WebAssembly.instantiateStreaming(response, info);
     return result.then(receiveInstantiatedSource, function(reason) {
      err("wasm streaming compile failed: " + reason);
      err("falling back to ArrayBuffer instantiation");
      return instantiateArrayBuffer(receiveInstantiatedSource);
     });
    });
   } else {
    return instantiateArrayBuffer(receiveInstantiatedSource);
   }
  }
  if (Module["instantiateWasm"]) {
   try {
    var exports = Module["instantiateWasm"](info, receiveInstance);
    return exports;
   } catch (e) {
    err("Module.instantiateWasm callback failed with error: " + e);
    return false;
   }
  }
  instantiateAsync();
  return {};
 }
 var tempDouble;
 var tempI64;
 var ASM_CONSTS = {
  3704360: function() {
   throw "Canceled!";
  },
  3704585: function($0, $1) {
   setTimeout(function() {
    _do_emscripten_dispatch_to_thread($0, $1);
   }, 0);
  }
 };
 function _emscripten_asm_const_iii(code, sigPtr, argbuf) {
  var args = readAsmConstArgs(sigPtr, argbuf);
  return ASM_CONSTS[code].apply(null, args);
 }
 function initPthreadsJS() {
  PThread.initRuntime();
 }
 if (!ENVIRONMENT_IS_PTHREAD) __ATINIT__.push({
  func: function() {
   ___wasm_call_ctors();
  }
 });
 function abortStackOverflow(allocSize) {
  abort("Stack overflow! Attempted to allocate " + allocSize + " bytes on the stack, but stack has only " + (STACK_MAX - stackSave() + allocSize) + " bytes available!");
 }
 function demangle(func) {
  warnOnce("warning: build with  -s DEMANGLE_SUPPORT=1  to link in libcxxabi demangling");
  return func;
 }
 function demangleAll(text) {
  var regex = /\b_Z[\w\d_]+/g;
  return text.replace(regex, function(x) {
   var y = demangle(x);
   return x === y ? x : y + " [" + x + "]";
  });
 }
 var __pthread_ptr = 0;
 var __pthread_is_main_runtime_thread = 0;
 var __pthread_is_main_browser_thread = 0;
 function registerPthreadPtr(pthreadPtr, isMainBrowserThread, isMainRuntimeThread) {
  pthreadPtr = pthreadPtr | 0;
  isMainBrowserThread = isMainBrowserThread | 0;
  isMainRuntimeThread = isMainRuntimeThread | 0;
  __pthread_ptr = pthreadPtr;
  __pthread_is_main_browser_thread = isMainBrowserThread;
  __pthread_is_main_runtime_thread = isMainRuntimeThread;
 }
 Module["registerPthreadPtr"] = registerPthreadPtr;
 var ERRNO_CODES = {
  EPERM: 63,
  ENOENT: 44,
  ESRCH: 71,
  EINTR: 27,
  EIO: 29,
  ENXIO: 60,
  E2BIG: 1,
  ENOEXEC: 45,
  EBADF: 8,
  ECHILD: 12,
  EAGAIN: 6,
  EWOULDBLOCK: 6,
  ENOMEM: 48,
  EACCES: 2,
  EFAULT: 21,
  ENOTBLK: 105,
  EBUSY: 10,
  EEXIST: 20,
  EXDEV: 75,
  ENODEV: 43,
  ENOTDIR: 54,
  EISDIR: 31,
  EINVAL: 28,
  ENFILE: 41,
  EMFILE: 33,
  ENOTTY: 59,
  ETXTBSY: 74,
  EFBIG: 22,
  ENOSPC: 51,
  ESPIPE: 70,
  EROFS: 69,
  EMLINK: 34,
  EPIPE: 64,
  EDOM: 18,
  ERANGE: 68,
  ENOMSG: 49,
  EIDRM: 24,
  ECHRNG: 106,
  EL2NSYNC: 156,
  EL3HLT: 107,
  EL3RST: 108,
  ELNRNG: 109,
  EUNATCH: 110,
  ENOCSI: 111,
  EL2HLT: 112,
  EDEADLK: 16,
  ENOLCK: 46,
  EBADE: 113,
  EBADR: 114,
  EXFULL: 115,
  ENOANO: 104,
  EBADRQC: 103,
  EBADSLT: 102,
  EDEADLOCK: 16,
  EBFONT: 101,
  ENOSTR: 100,
  ENODATA: 116,
  ETIME: 117,
  ENOSR: 118,
  ENONET: 119,
  ENOPKG: 120,
  EREMOTE: 121,
  ENOLINK: 47,
  EADV: 122,
  ESRMNT: 123,
  ECOMM: 124,
  EPROTO: 65,
  EMULTIHOP: 36,
  EDOTDOT: 125,
  EBADMSG: 9,
  ENOTUNIQ: 126,
  EBADFD: 127,
  EREMCHG: 128,
  ELIBACC: 129,
  ELIBBAD: 130,
  ELIBSCN: 131,
  ELIBMAX: 132,
  ELIBEXEC: 133,
  ENOSYS: 52,
  ENOTEMPTY: 55,
  ENAMETOOLONG: 37,
  ELOOP: 32,
  EOPNOTSUPP: 138,
  EPFNOSUPPORT: 139,
  ECONNRESET: 15,
  ENOBUFS: 42,
  EAFNOSUPPORT: 5,
  EPROTOTYPE: 67,
  ENOTSOCK: 57,
  ENOPROTOOPT: 50,
  ESHUTDOWN: 140,
  ECONNREFUSED: 14,
  EADDRINUSE: 3,
  ECONNABORTED: 13,
  ENETUNREACH: 40,
  ENETDOWN: 38,
  ETIMEDOUT: 73,
  EHOSTDOWN: 142,
  EHOSTUNREACH: 23,
  EINPROGRESS: 26,
  EALREADY: 7,
  EDESTADDRREQ: 17,
  EMSGSIZE: 35,
  EPROTONOSUPPORT: 66,
  ESOCKTNOSUPPORT: 137,
  EADDRNOTAVAIL: 4,
  ENETRESET: 39,
  EISCONN: 30,
  ENOTCONN: 53,
  ETOOMANYREFS: 141,
  EUSERS: 136,
  EDQUOT: 19,
  ESTALE: 72,
  ENOTSUP: 138,
  ENOMEDIUM: 148,
  EILSEQ: 25,
  EOVERFLOW: 61,
  ECANCELED: 11,
  ENOTRECOVERABLE: 56,
  EOWNERDEAD: 62,
  ESTRPIPE: 135
 };
 var __main_thread_futex_wait_address = 14217008;
 function _emscripten_futex_wake(addr, count) {
  if (addr <= 0 || addr > GROWABLE_HEAP_I8().length || addr & 3 != 0 || count < 0) return -28;
  if (count == 0) return 0;
  if (count >= 2147483647) count = Infinity;
  var mainThreadWaitAddress = Atomics.load(GROWABLE_HEAP_I32(), __main_thread_futex_wait_address >> 2);
  var mainThreadWoken = 0;
  if (mainThreadWaitAddress == addr) {
   var loadedAddr = Atomics.compareExchange(GROWABLE_HEAP_I32(), __main_thread_futex_wait_address >> 2, mainThreadWaitAddress, 0);
   if (loadedAddr == mainThreadWaitAddress) {
    --count;
    mainThreadWoken = 1;
    if (count <= 0) return 1;
   }
  }
  var ret = Atomics.notify(GROWABLE_HEAP_I32(), addr >> 2, count);
  if (ret >= 0) return ret + mainThreadWoken;
  throw "Atomics.notify returned an unexpected value " + ret;
 }
 Module["_emscripten_futex_wake"] = _emscripten_futex_wake;
 function killThread(pthread_ptr) {
  if (ENVIRONMENT_IS_PTHREAD) throw "Internal Error! killThread() can only ever be called from main application thread!";
  if (!pthread_ptr) throw "Internal Error! Null pthread_ptr in killThread!";
  GROWABLE_HEAP_I32()[pthread_ptr + 12 >> 2] = 0;
  var pthread = PThread.pthreads[pthread_ptr];
  pthread.worker.terminate();
  PThread.freeThreadData(pthread);
  PThread.runningWorkers.splice(PThread.runningWorkers.indexOf(pthread.worker), 1);
  pthread.worker.pthread = undefined;
 }
 function cancelThread(pthread_ptr) {
  if (ENVIRONMENT_IS_PTHREAD) throw "Internal Error! cancelThread() can only ever be called from main application thread!";
  if (!pthread_ptr) throw "Internal Error! Null pthread_ptr in cancelThread!";
  var pthread = PThread.pthreads[pthread_ptr];
  pthread.worker.postMessage({
   "cmd": "cancel"
  });
 }
 function cleanupThread(pthread_ptr) {
  if (ENVIRONMENT_IS_PTHREAD) throw "Internal Error! cleanupThread() can only ever be called from main application thread!";
  if (!pthread_ptr) throw "Internal Error! Null pthread_ptr in cleanupThread!";
  GROWABLE_HEAP_I32()[pthread_ptr + 12 >> 2] = 0;
  var pthread = PThread.pthreads[pthread_ptr];
  if (pthread) {
   var worker = pthread.worker;
   PThread.returnWorkerToPool(worker);
  }
 }
 var PThread = {
  MAIN_THREAD_ID: 1,
  mainThreadInfo: {
   schedPolicy: 0,
   schedPrio: 0
  },
  unusedWorkers: [],
  runningWorkers: [],
  initRuntime: function() {
   registerPthreadPtr(PThread.mainThreadBlock, !ENVIRONMENT_IS_WORKER, 1);
   _emscripten_register_main_browser_thread_id(PThread.mainThreadBlock);
  },
  initMainThreadBlock: function() {
   assert(!ENVIRONMENT_IS_PTHREAD);
   PThread.mainThreadBlock = 14216256;
   for (var i = 0; i < 232 / 4; ++i) GROWABLE_HEAP_U32()[PThread.mainThreadBlock / 4 + i] = 0;
   GROWABLE_HEAP_I32()[PThread.mainThreadBlock + 12 >> 2] = PThread.mainThreadBlock;
   var headPtr = PThread.mainThreadBlock + 156;
   GROWABLE_HEAP_I32()[headPtr >> 2] = headPtr;
   var tlsMemory = 14216496;
   for (var i = 0; i < 128; ++i) GROWABLE_HEAP_U32()[tlsMemory / 4 + i] = 0;
   Atomics.store(GROWABLE_HEAP_U32(), PThread.mainThreadBlock + 104 >> 2, tlsMemory);
   Atomics.store(GROWABLE_HEAP_U32(), PThread.mainThreadBlock + 40 >> 2, PThread.mainThreadBlock);
   Atomics.store(GROWABLE_HEAP_U32(), PThread.mainThreadBlock + 44 >> 2, 42);
  },
  initWorker: function() {},
  pthreads: {},
  exitHandlers: null,
  setThreadStatus: function() {},
  runExitHandlers: function() {
   if (PThread.exitHandlers !== null) {
    while (PThread.exitHandlers.length > 0) {
     PThread.exitHandlers.pop()();
    }
    PThread.exitHandlers = null;
   }
   if (ENVIRONMENT_IS_PTHREAD && threadInfoStruct) ___pthread_tsd_run_dtors();
  },
  threadExit: function(exitCode) {
   var tb = _pthread_self();
   if (tb) {
    err("Pthread 0x" + tb.toString(16) + " exited.");
    Atomics.store(GROWABLE_HEAP_U32(), tb + 4 >> 2, exitCode);
    Atomics.store(GROWABLE_HEAP_U32(), tb + 0 >> 2, 1);
    Atomics.store(GROWABLE_HEAP_U32(), tb + 60 >> 2, 1);
    Atomics.store(GROWABLE_HEAP_U32(), tb + 64 >> 2, 0);
    PThread.runExitHandlers();
    _emscripten_futex_wake(tb + 0, 2147483647);
    registerPthreadPtr(0, 0, 0);
    threadInfoStruct = 0;
    if (ENVIRONMENT_IS_PTHREAD) {
     postMessage({
      "cmd": "exit"
     });
    }
   }
  },
  threadCancel: function() {
   PThread.runExitHandlers();
   Atomics.store(GROWABLE_HEAP_U32(), threadInfoStruct + 4 >> 2, -1);
   Atomics.store(GROWABLE_HEAP_U32(), threadInfoStruct + 0 >> 2, 1);
   _emscripten_futex_wake(threadInfoStruct + 0, 2147483647);
   threadInfoStruct = selfThreadId = 0;
   registerPthreadPtr(0, 0, 0);
   postMessage({
    "cmd": "cancelDone"
   });
  },
  terminateAllThreads: function() {
   for (var t in PThread.pthreads) {
    var pthread = PThread.pthreads[t];
    if (pthread && pthread.worker) {
     PThread.returnWorkerToPool(pthread.worker);
    }
   }
   PThread.pthreads = {};
   for (var i = 0; i < PThread.unusedWorkers.length; ++i) {
    var worker = PThread.unusedWorkers[i];
    assert(!worker.pthread);
    worker.terminate();
   }
   PThread.unusedWorkers = [];
   for (var i = 0; i < PThread.runningWorkers.length; ++i) {
    var worker = PThread.runningWorkers[i];
    var pthread = worker.pthread;
    assert(pthread, "This Worker should have a pthread it is executing");
    PThread.freeThreadData(pthread);
    worker.terminate();
   }
   PThread.runningWorkers = [];
  },
  freeThreadData: function(pthread) {
   if (!pthread) return;
   if (pthread.threadInfoStruct) {
    var tlsMemory = GROWABLE_HEAP_I32()[pthread.threadInfoStruct + 104 >> 2];
    GROWABLE_HEAP_I32()[pthread.threadInfoStruct + 104 >> 2] = 0;
    _free(tlsMemory);
    _free(pthread.threadInfoStruct);
   }
   pthread.threadInfoStruct = 0;
   if (pthread.allocatedOwnStack && pthread.stackBase) _free(pthread.stackBase);
   pthread.stackBase = 0;
   if (pthread.worker) pthread.worker.pthread = null;
  },
  returnWorkerToPool: function(worker) {
   delete PThread.pthreads[worker.pthread.thread];
   PThread.unusedWorkers.push(worker);
   PThread.runningWorkers.splice(PThread.runningWorkers.indexOf(worker), 1);
   PThread.freeThreadData(worker.pthread);
   worker.pthread = undefined;
  },
  receiveObjectTransfer: function(data) {},
  loadWasmModuleToWorker: function(worker, onFinishedLoading) {
   worker.onmessage = function(e) {
    var d = e["data"];
    var cmd = d["cmd"];
    if (worker.pthread) PThread.currentProxiedOperationCallerThread = worker.pthread.threadInfoStruct;
    if (d["targetThread"] && d["targetThread"] != _pthread_self()) {
     var thread = PThread.pthreads[d.targetThread];
     if (thread) {
      thread.worker.postMessage(e.data, d["transferList"]);
     } else {
      console.error('Internal error! Worker sent a message "' + cmd + '" to target pthread ' + d["targetThread"] + ", but that thread no longer exists!");
     }
     PThread.currentProxiedOperationCallerThread = undefined;
     return;
    }
    if (cmd === "processQueuedMainThreadWork") {
     _emscripten_main_thread_process_queued_calls();
    } else if (cmd === "spawnThread") {
     spawnThread(e.data);
    } else if (cmd === "cleanupThread") {
     cleanupThread(d["thread"]);
    } else if (cmd === "killThread") {
     killThread(d["thread"]);
    } else if (cmd === "cancelThread") {
     cancelThread(d["thread"]);
    } else if (cmd === "loaded") {
     worker.loaded = true;
     if (onFinishedLoading) onFinishedLoading(worker);
     if (worker.runPthread) {
      worker.runPthread();
      delete worker.runPthread;
     }
    } else if (cmd === "print") {
     out("Thread " + d["threadId"] + ": " + d["text"]);
    } else if (cmd === "printErr") {
     err("Thread " + d["threadId"] + ": " + d["text"]);
    } else if (cmd === "alert") {
     alert("Thread " + d["threadId"] + ": " + d["text"]);
    } else if (cmd === "exit") {
     var detached = worker.pthread && Atomics.load(GROWABLE_HEAP_U32(), worker.pthread.thread + 68 >> 2);
     if (detached) {
      PThread.returnWorkerToPool(worker);
     }
    } else if (cmd === "cancelDone") {
     PThread.returnWorkerToPool(worker);
    } else if (cmd === "objectTransfer") {
     PThread.receiveObjectTransfer(e.data);
    } else if (e.data.target === "setimmediate") {
     worker.postMessage(e.data);
    } else {
     err("worker sent an unknown command " + cmd);
    }
    PThread.currentProxiedOperationCallerThread = undefined;
   };
   worker.onerror = function(e) {
    err("pthread sent an error! " + e.filename + ":" + e.lineno + ": " + e.message);
   };
   if (ENVIRONMENT_IS_NODE) {
    worker.on("message", function(data) {
     worker.onmessage({
      data: data
     });
    });
    worker.on("error", function(data) {
     worker.onerror(data);
    });
    worker.on("exit", function(data) {
     console.log("worker exited - TODO: update the worker queue?");
    });
   }
   assert(wasmMemory instanceof WebAssembly.Memory, "WebAssembly memory should have been loaded by now!");
   assert(wasmModule instanceof WebAssembly.Module, "WebAssembly Module should have been loaded by now!");
   worker.postMessage({
    "cmd": "load",
    "urlOrBlob": Module["mainScriptUrlOrBlob"] || _scriptDir,
    "wasmMemory": wasmMemory,
    "wasmModule": wasmModule,
    "DYNAMIC_BASE": DYNAMIC_BASE,
    "DYNAMICTOP_PTR": DYNAMICTOP_PTR
   });
  },
  allocateUnusedWorker: function() {
   var pthreadMainJs = locateFile("ffmpeg.worker.js");
   PThread.unusedWorkers.push(new Worker(pthreadMainJs));
  },
  getNewWorker: function() {
   if (PThread.unusedWorkers.length == 0) {
    PThread.allocateUnusedWorker();
    PThread.loadWasmModuleToWorker(PThread.unusedWorkers[0]);
   }
   if (PThread.unusedWorkers.length > 0) return PThread.unusedWorkers.pop(); else return null;
  },
  busySpinWait: function(msecs) {
   var t = performance.now() + msecs;
   while (performance.now() < t) {
   }
  }
 };
 function establishStackSpace(stackTop, stackMax) {
  STACK_BASE = STACKTOP = stackTop;
  STACK_MAX = stackMax;
  ___set_stack_limit(STACK_MAX);
  stackRestore(stackTop);
  writeStackCookie();
 }
 Module["establishStackSpace"] = establishStackSpace;
 function getNoExitRuntime() {
  return noExitRuntime;
 }
 Module["getNoExitRuntime"] = getNoExitRuntime;
 function jsStackTrace() {
  var err = new Error();
  if (!err.stack) {
   try {
    throw new Error();
   } catch (e) {
    err = e;
   }
   if (!err.stack) {
    return "(no stack trace available)";
   }
  }
  return err.stack.toString();
 }
 function stackTrace() {
  var js = jsStackTrace();
  if (Module["extraStackTrace"]) js += "\n" + Module["extraStackTrace"]();
  return demangleAll(js);
 }
 function ___assert_fail(condition, filename, line, func) {
  abort("Assertion failed: " + UTF8ToString(condition) + ", at: " + [ filename ? UTF8ToString(filename) : "unknown filename", line, func ? UTF8ToString(func) : "unknown function" ]);
 }
 var _emscripten_get_now;
 if (ENVIRONMENT_IS_NODE) {
  _emscripten_get_now = function() {
   var t = process["hrtime"]();
   return t[0] * 1e3 + t[1] / 1e6;
  };
 } else if (ENVIRONMENT_IS_PTHREAD) {
  _emscripten_get_now = function() {
   return performance.now() - Module["__performance_now_clock_drift"];
  };
 } else if (typeof dateNow !== "undefined") {
  _emscripten_get_now = dateNow;
 } else _emscripten_get_now = function() {
  return performance.now();
 };
 var _emscripten_get_now_is_monotonic = true;
 function setErrNo(value) {
  GROWABLE_HEAP_I32()[___errno_location() >> 2] = value;
  return value;
 }
 function _clock_gettime(clk_id, tp) {
  var now;
  if (clk_id === 0) {
   now = Date.now();
  } else if ((clk_id === 1 || clk_id === 4) && _emscripten_get_now_is_monotonic) {
   now = _emscripten_get_now();
  } else {
   setErrNo(28);
   return -1;
  }
  GROWABLE_HEAP_I32()[tp >> 2] = now / 1e3 | 0;
  GROWABLE_HEAP_I32()[tp + 4 >> 2] = now % 1e3 * 1e3 * 1e3 | 0;
  return 0;
 }
 function ___clock_gettime(a0, a1) {
  return _clock_gettime(a0, a1);
 }
 function ___handle_stack_overflow() {
  abort("stack overflow");
 }
 var PATH = {
  splitPath: function(filename) {
   var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
   return splitPathRe.exec(filename).slice(1);
  },
  normalizeArray: function(parts, allowAboveRoot) {
   var up = 0;
   for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === ".") {
     parts.splice(i, 1);
    } else if (last === "..") {
     parts.splice(i, 1);
     up++;
    } else if (up) {
     parts.splice(i, 1);
     up--;
    }
   }
   if (allowAboveRoot) {
    for (;up; up--) {
     parts.unshift("..");
    }
   }
   return parts;
  },
  normalize: function(path) {
   var isAbsolute = path.charAt(0) === "/", trailingSlash = path.substr(-1) === "/";
   path = PATH.normalizeArray(path.split("/").filter(function(p) {
    return !!p;
   }), !isAbsolute).join("/");
   if (!path && !isAbsolute) {
    path = ".";
   }
   if (path && trailingSlash) {
    path += "/";
   }
   return (isAbsolute ? "/" : "") + path;
  },
  dirname: function(path) {
   var result = PATH.splitPath(path), root = result[0], dir = result[1];
   if (!root && !dir) {
    return ".";
   }
   if (dir) {
    dir = dir.substr(0, dir.length - 1);
   }
   return root + dir;
  },
  basename: function(path) {
   if (path === "/") return "/";
   var lastSlash = path.lastIndexOf("/");
   if (lastSlash === -1) return path;
   return path.substr(lastSlash + 1);
  },
  extname: function(path) {
   return PATH.splitPath(path)[3];
  },
  join: function() {
   var paths = Array.prototype.slice.call(arguments, 0);
   return PATH.normalize(paths.join("/"));
  },
  join2: function(l, r) {
   return PATH.normalize(l + "/" + r);
  }
 };
 var PATH_FS = {
  resolve: function() {
   var resolvedPath = "", resolvedAbsolute = false;
   for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = i >= 0 ? arguments[i] : FS.cwd();
    if (typeof path !== "string") {
     throw new TypeError("Arguments to path.resolve must be strings");
    } else if (!path) {
     return "";
    }
    resolvedPath = path + "/" + resolvedPath;
    resolvedAbsolute = path.charAt(0) === "/";
   }
   resolvedPath = PATH.normalizeArray(resolvedPath.split("/").filter(function(p) {
    return !!p;
   }), !resolvedAbsolute).join("/");
   return (resolvedAbsolute ? "/" : "") + resolvedPath || ".";
  },
  relative: function(from, to) {
   from = PATH_FS.resolve(from).substr(1);
   to = PATH_FS.resolve(to).substr(1);
   function trim(arr) {
    var start = 0;
    for (;start < arr.length; start++) {
     if (arr[start] !== "") break;
    }
    var end = arr.length - 1;
    for (;end >= 0; end--) {
     if (arr[end] !== "") break;
    }
    if (start > end) return [];
    return arr.slice(start, end - start + 1);
   }
   var fromParts = trim(from.split("/"));
   var toParts = trim(to.split("/"));
   var length = Math.min(fromParts.length, toParts.length);
   var samePartsLength = length;
   for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
     samePartsLength = i;
     break;
    }
   }
   var outputParts = [];
   for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push("..");
   }
   outputParts = outputParts.concat(toParts.slice(samePartsLength));
   return outputParts.join("/");
  }
 };
 var TTY = {
  ttys: [],
  init: function() {},
  shutdown: function() {},
  register: function(dev, ops) {
   TTY.ttys[dev] = {
    input: [],
    output: [],
    ops: ops
   };
   FS.registerDevice(dev, TTY.stream_ops);
  },
  stream_ops: {
   open: function(stream) {
    var tty = TTY.ttys[stream.node.rdev];
    if (!tty) {
     throw new FS.ErrnoError(43);
    }
    stream.tty = tty;
    stream.seekable = false;
   },
   close: function(stream) {
    stream.tty.ops.flush(stream.tty);
   },
   flush: function(stream) {
    stream.tty.ops.flush(stream.tty);
   },
   read: function(stream, buffer, offset, length, pos) {
    if (!stream.tty || !stream.tty.ops.get_char) {
     throw new FS.ErrnoError(60);
    }
    var bytesRead = 0;
    for (var i = 0; i < length; i++) {
     var result;
     try {
      result = stream.tty.ops.get_char(stream.tty);
     } catch (e) {
      throw new FS.ErrnoError(29);
     }
     if (result === undefined && bytesRead === 0) {
      throw new FS.ErrnoError(6);
     }
     if (result === null || result === undefined) break;
     bytesRead++;
     buffer[offset + i] = result;
    }
    if (bytesRead) {
     stream.node.timestamp = Date.now();
    }
    return bytesRead;
   },
   write: function(stream, buffer, offset, length, pos) {
    if (!stream.tty || !stream.tty.ops.put_char) {
     throw new FS.ErrnoError(60);
    }
    try {
     for (var i = 0; i < length; i++) {
      stream.tty.ops.put_char(stream.tty, buffer[offset + i]);
     }
    } catch (e) {
     throw new FS.ErrnoError(29);
    }
    if (length) {
     stream.node.timestamp = Date.now();
    }
    return i;
   }
  },
  default_tty_ops: {
   get_char: function(tty) {
    if (!tty.input.length) {
     var result = null;
     if (ENVIRONMENT_IS_NODE) {
      var BUFSIZE = 256;
      var buf = Buffer.alloc ? Buffer.alloc(BUFSIZE) : new Buffer(BUFSIZE);
      var bytesRead = 0;
      try {
       bytesRead = nodeFS.readSync(process.stdin.fd, buf, 0, BUFSIZE, null);
      } catch (e) {
       if (e.toString().indexOf("EOF") != -1) bytesRead = 0; else throw e;
      }
      if (bytesRead > 0) {
       result = buf.slice(0, bytesRead).toString("utf-8");
      } else {
       result = null;
      }
     } else if (typeof window != "undefined" && typeof window.prompt == "function") {
      result = window.prompt("Input: ");
      if (result !== null) {
       result += "\n";
      }
     } else if (typeof readline == "function") {
      result = readline();
      if (result !== null) {
       result += "\n";
      }
     }
     if (!result) {
      return null;
     }
     tty.input = intArrayFromString(result, true);
    }
    return tty.input.shift();
   },
   put_char: function(tty, val) {
    if (val === null || val === 10) {
     out(UTF8ArrayToString(tty.output, 0));
     tty.output = [];
    } else {
     if (val != 0) tty.output.push(val);
    }
   },
   flush: function(tty) {
    if (tty.output && tty.output.length > 0) {
     out(UTF8ArrayToString(tty.output, 0));
     tty.output = [];
    }
   }
  },
  default_tty1_ops: {
   put_char: function(tty, val) {
    if (val === null || val === 10 || val === 13) {
     self.postMessage({"type":"tty","value":UTF8ArrayToString(tty.output, 0)}) // 发送程序输出
     err(UTF8ArrayToString(tty.output, 0));
     tty.output = [];
    } else {
     if (val != 0) tty.output.push(val);
    }
   },
   flush: function(tty) {
    if (tty.output && tty.output.length > 0) {
     err(UTF8ArrayToString(tty.output, 0));
     tty.output = [];
    }
   }
  }
 };
 var MEMFS = {
  ops_table: null,
  mount: function(mount) {
   return MEMFS.createNode(null, "/", 16384 | 511, 0);
  },
  createNode: function(parent, name, mode, dev) {
   if (FS.isBlkdev(mode) || FS.isFIFO(mode)) {
    throw new FS.ErrnoError(63);
   }
   if (!MEMFS.ops_table) {
    MEMFS.ops_table = {
     dir: {
      node: {
       getattr: MEMFS.node_ops.getattr,
       setattr: MEMFS.node_ops.setattr,
       lookup: MEMFS.node_ops.lookup,
       mknod: MEMFS.node_ops.mknod,
       rename: MEMFS.node_ops.rename,
       unlink: MEMFS.node_ops.unlink,
       rmdir: MEMFS.node_ops.rmdir,
       readdir: MEMFS.node_ops.readdir,
       symlink: MEMFS.node_ops.symlink
      },
      stream: {
       llseek: MEMFS.stream_ops.llseek
      }
     },
     file: {
      node: {
       getattr: MEMFS.node_ops.getattr,
       setattr: MEMFS.node_ops.setattr
      },
      stream: {
       llseek: MEMFS.stream_ops.llseek,
       read: MEMFS.stream_ops.read,
       write: MEMFS.stream_ops.write,
       allocate: MEMFS.stream_ops.allocate,
       mmap: MEMFS.stream_ops.mmap,
       msync: MEMFS.stream_ops.msync
      }
     },
     link: {
      node: {
       getattr: MEMFS.node_ops.getattr,
       setattr: MEMFS.node_ops.setattr,
       readlink: MEMFS.node_ops.readlink
      },
      stream: {}
     },
     chrdev: {
      node: {
       getattr: MEMFS.node_ops.getattr,
       setattr: MEMFS.node_ops.setattr
      },
      stream: FS.chrdev_stream_ops
     }
    };
   }
   var node = FS.createNode(parent, name, mode, dev);
   if (FS.isDir(node.mode)) {
    node.node_ops = MEMFS.ops_table.dir.node;
    node.stream_ops = MEMFS.ops_table.dir.stream;
    node.contents = {};
   } else if (FS.isFile(node.mode)) {
    node.node_ops = MEMFS.ops_table.file.node;
    node.stream_ops = MEMFS.ops_table.file.stream;
    node.usedBytes = 0;
    node.contents = null;
   } else if (FS.isLink(node.mode)) {
    node.node_ops = MEMFS.ops_table.link.node;
    node.stream_ops = MEMFS.ops_table.link.stream;
   } else if (FS.isChrdev(node.mode)) {
    node.node_ops = MEMFS.ops_table.chrdev.node;
    node.stream_ops = MEMFS.ops_table.chrdev.stream;
   }
   node.timestamp = Date.now();
   if (parent) {
    parent.contents[name] = node;
   }
   return node;
  },
  getFileDataAsRegularArray: function(node) {
   if (node.contents && node.contents.subarray) {
    var arr = [];
    for (var i = 0; i < node.usedBytes; ++i) arr.push(node.contents[i]);
    return arr;
   }
   return node.contents;
  },
  getFileDataAsTypedArray: function(node) {
   if (!node.contents) return new Uint8Array(0);
   if (node.contents.subarray) return node.contents.subarray(0, node.usedBytes);
   return new Uint8Array(node.contents);
  },
  expandFileStorage: function(node, newCapacity) {
   var prevCapacity = node.contents ? node.contents.length : 0;
   if (prevCapacity >= newCapacity) return;
   var CAPACITY_DOUBLING_MAX = 1024 * 1024;
   newCapacity = Math.max(newCapacity, prevCapacity * (prevCapacity < CAPACITY_DOUBLING_MAX ? 2 : 1.125) >>> 0);
   if (prevCapacity != 0) newCapacity = Math.max(newCapacity, 256);
   var oldContents = node.contents;
   node.contents = new Uint8Array(newCapacity);
   if (node.usedBytes > 0) node.contents.set(oldContents.subarray(0, node.usedBytes), 0);
   return;
  },
  resizeFileStorage: function(node, newSize) {
   if (node.usedBytes == newSize) return;
   if (newSize == 0) {
    node.contents = null;
    node.usedBytes = 0;
    return;
   }
   if (!node.contents || node.contents.subarray) {
    var oldContents = node.contents;
    node.contents = new Uint8Array(newSize);
    if (oldContents) {
     node.contents.set(oldContents.subarray(0, Math.min(newSize, node.usedBytes)));
    }
    node.usedBytes = newSize;
    return;
   }
   if (!node.contents) node.contents = [];
   if (node.contents.length > newSize) node.contents.length = newSize; else while (node.contents.length < newSize) node.contents.push(0);
   node.usedBytes = newSize;
  },
  node_ops: {
   getattr: function(node) {
    var attr = {};
    attr.dev = FS.isChrdev(node.mode) ? node.id : 1;
    attr.ino = node.id;
    attr.mode = node.mode;
    attr.nlink = 1;
    attr.uid = 0;
    attr.gid = 0;
    attr.rdev = node.rdev;
    if (FS.isDir(node.mode)) {
     attr.size = 4096;
    } else if (FS.isFile(node.mode)) {
     attr.size = node.usedBytes;
    } else if (FS.isLink(node.mode)) {
     attr.size = node.link.length;
    } else {
     attr.size = 0;
    }
    attr.atime = new Date(node.timestamp);
    attr.mtime = new Date(node.timestamp);
    attr.ctime = new Date(node.timestamp);
    attr.blksize = 4096;
    attr.blocks = Math.ceil(attr.size / attr.blksize);
    return attr;
   },
   setattr: function(node, attr) {
    if (attr.mode !== undefined) {
     node.mode = attr.mode;
    }
    if (attr.timestamp !== undefined) {
     node.timestamp = attr.timestamp;
    }
    if (attr.size !== undefined) {
     MEMFS.resizeFileStorage(node, attr.size);
    }
   },
   lookup: function(parent, name) {
    throw FS.genericErrors[44];
   },
   mknod: function(parent, name, mode, dev) {
    return MEMFS.createNode(parent, name, mode, dev);
   },
   rename: function(old_node, new_dir, new_name) {
    if (FS.isDir(old_node.mode)) {
     var new_node;
     try {
      new_node = FS.lookupNode(new_dir, new_name);
     } catch (e) {}
     if (new_node) {
      for (var i in new_node.contents) {
       throw new FS.ErrnoError(55);
      }
     }
    }
    delete old_node.parent.contents[old_node.name];
    old_node.name = new_name;
    new_dir.contents[new_name] = old_node;
    old_node.parent = new_dir;
   },
   unlink: function(parent, name) {
    delete parent.contents[name];
   },
   rmdir: function(parent, name) {
    var node = FS.lookupNode(parent, name);
    for (var i in node.contents) {
     throw new FS.ErrnoError(55);
    }
    delete parent.contents[name];
   },
   readdir: function(node) {
    var entries = [ ".", ".." ];
    for (var key in node.contents) {
     if (!node.contents.hasOwnProperty(key)) {
      continue;
     }
     entries.push(key);
    }
    return entries;
   },
   symlink: function(parent, newname, oldpath) {
    var node = MEMFS.createNode(parent, newname, 511 | 40960, 0);
    node.link = oldpath;
    return node;
   },
   readlink: function(node) {
    if (!FS.isLink(node.mode)) {
     throw new FS.ErrnoError(28);
    }
    return node.link;
   }
  },
  stream_ops: {
   read: function(stream, buffer, offset, length, position) {
    var contents = stream.node.contents;
    if (position >= stream.node.usedBytes) return 0;
    var size = Math.min(stream.node.usedBytes - position, length);
    assert(size >= 0);
    if (size > 8 && contents.subarray) {
     buffer.set(contents.subarray(position, position + size), offset);
    } else {
     for (var i = 0; i < size; i++) buffer[offset + i] = contents[position + i];
    }
    return size;
   },
   write: function(stream, buffer, offset, length, position, canOwn) {
    assert(!(buffer instanceof ArrayBuffer));
    if (buffer.buffer === GROWABLE_HEAP_I8().buffer) {
     if (canOwn) {
      warnOnce("file packager has copied file data into memory, but in memory growth we are forced to copy it again (see --no-heap-copy)");
     }
     canOwn = false;
    }
    if (!length) return 0;
    var node = stream.node;
    node.timestamp = Date.now();
    if (buffer.subarray && (!node.contents || node.contents.subarray)) {
     if (canOwn) {
      assert(position === 0, "canOwn must imply no weird position inside the file");
      node.contents = buffer.subarray(offset, offset + length);
      node.usedBytes = length;
      return length;
     } else if (node.usedBytes === 0 && position === 0) {
      node.contents = buffer.slice(offset, offset + length);
      node.usedBytes = length;
      return length;
     } else if (position + length <= node.usedBytes) {
      node.contents.set(buffer.subarray(offset, offset + length), position);
      return length;
     }
    }
    MEMFS.expandFileStorage(node, position + length);
    if (node.contents.subarray && buffer.subarray) node.contents.set(buffer.subarray(offset, offset + length), position); else {
     for (var i = 0; i < length; i++) {
      node.contents[position + i] = buffer[offset + i];
     }
    }
    node.usedBytes = Math.max(node.usedBytes, position + length);
    return length;
   },
   llseek: function(stream, offset, whence) {
    var position = offset;
    if (whence === 1) {
     position += stream.position;
    } else if (whence === 2) {
     if (FS.isFile(stream.node.mode)) {
      position += stream.node.usedBytes;
     }
    }
    if (position < 0) {
     throw new FS.ErrnoError(28);
    }
    return position;
   },
   allocate: function(stream, offset, length) {
    MEMFS.expandFileStorage(stream.node, offset + length);
    stream.node.usedBytes = Math.max(stream.node.usedBytes, offset + length);
   },
   mmap: function(stream, address, length, position, prot, flags) {
    assert(address === 0);
    if (!FS.isFile(stream.node.mode)) {
     throw new FS.ErrnoError(43);
    }
    var ptr;
    var allocated;
    var contents = stream.node.contents;
    if (!(flags & 2) && contents.buffer === buffer) {
     allocated = false;
     ptr = contents.byteOffset;
    } else {
     if (position > 0 || position + length < contents.length) {
      if (contents.subarray) {
       contents = contents.subarray(position, position + length);
      } else {
       contents = Array.prototype.slice.call(contents, position, position + length);
      }
     }
     allocated = true;
     ptr = _malloc(length);
     if (!ptr) {
      throw new FS.ErrnoError(48);
     }
     GROWABLE_HEAP_I8().set(contents, ptr);
    }
    return {
     ptr: ptr,
     allocated: allocated
    };
   },
   msync: function(stream, buffer, offset, length, mmapFlags) {
    if (!FS.isFile(stream.node.mode)) {
     throw new FS.ErrnoError(43);
    }
    if (mmapFlags & 2) {
     return 0;
    }
    var bytesWritten = MEMFS.stream_ops.write(stream, buffer, 0, length, offset, false);
    return 0;
   }
  }
 };
 var WORKERFS = {
  DIR_MODE: 16895,
  FILE_MODE: 33279,
  reader: null,
  mount: function(mount) {
   assert(ENVIRONMENT_IS_WORKER);
   if (!WORKERFS.reader) WORKERFS.reader = new FileReaderSync();
   var root = WORKERFS.createNode(null, "/", WORKERFS.DIR_MODE, 0);
   var createdParents = {};
   function ensureParent(path) {
    var parts = path.split("/");
    var parent = root;
    for (var i = 0; i < parts.length - 1; i++) {
     var curr = parts.slice(0, i + 1).join("/");
     if (!createdParents[curr]) {
      createdParents[curr] = WORKERFS.createNode(parent, parts[i], WORKERFS.DIR_MODE, 0);
     }
     parent = createdParents[curr];
    }
    return parent;
   }
   function base(path) {
    var parts = path.split("/");
    return parts[parts.length - 1];
   }
   Array.prototype.forEach.call(mount.opts["files"] || [], function(file) {
    WORKERFS.createNode(ensureParent(file.name), base(file.name), WORKERFS.FILE_MODE, 0, file, file.lastModifiedDate);
   });
   (mount.opts["blobs"] || []).forEach(function(obj) {
    WORKERFS.createNode(ensureParent(obj["name"]), base(obj["name"]), WORKERFS.FILE_MODE, 0, obj["data"]);
   });
   (mount.opts["packages"] || []).forEach(function(pack) {
    pack["metadata"].files.forEach(function(file) {
     var name = file.filename.substr(1);
     WORKERFS.createNode(ensureParent(name), base(name), WORKERFS.FILE_MODE, 0, pack["blob"].slice(file.start, file.end));
    });
   });
   return root;
  },
  createNode: function(parent, name, mode, dev, contents, mtime) {
   var node = FS.createNode(parent, name, mode);
   node.mode = mode;
   node.node_ops = WORKERFS.node_ops;
   node.stream_ops = WORKERFS.stream_ops;
   node.timestamp = (mtime || new Date()).getTime();
   assert(WORKERFS.FILE_MODE !== WORKERFS.DIR_MODE);
   if (mode === WORKERFS.FILE_MODE) {
    node.size = contents.size;
    node.contents = contents;
   } else {
    node.size = 4096;
    node.contents = {};
   }
   if (parent) {
    parent.contents[name] = node;
   }
   return node;
  },
  node_ops: {
   getattr: function(node) {
    return {
     dev: 1,
     ino: node.id,
     mode: node.mode,
     nlink: 1,
     uid: 0,
     gid: 0,
     rdev: undefined,
     size: node.size,
     atime: new Date(node.timestamp),
     mtime: new Date(node.timestamp),
     ctime: new Date(node.timestamp),
     blksize: 4096,
     blocks: Math.ceil(node.size / 4096)
    };
   },
   setattr: function(node, attr) {
    if (attr.mode !== undefined) {
     node.mode = attr.mode;
    }
    if (attr.timestamp !== undefined) {
     node.timestamp = attr.timestamp;
    }
   },
   lookup: function(parent, name) {
    throw new FS.ErrnoError(44);
   },
   mknod: function(parent, name, mode, dev) {
    throw new FS.ErrnoError(63);
   },
   rename: function(oldNode, newDir, newName) {
    throw new FS.ErrnoError(63);
   },
   unlink: function(parent, name) {
    throw new FS.ErrnoError(63);
   },
   rmdir: function(parent, name) {
    throw new FS.ErrnoError(63);
   },
   readdir: function(node) {
    var entries = [ ".", ".." ];
    for (var key in node.contents) {
     if (!node.contents.hasOwnProperty(key)) {
      continue;
     }
     entries.push(key);
    }
    return entries;
   },
   symlink: function(parent, newName, oldPath) {
    throw new FS.ErrnoError(63);
   },
   readlink: function(node) {
    throw new FS.ErrnoError(63);
   }
  },
  stream_ops: {
   read: function(stream, buffer, offset, length, position) {
    if (position >= stream.node.size) return 0;
    var chunk = stream.node.contents.slice(position, position + length);
    var ab = WORKERFS.reader.readAsArrayBuffer(chunk);
    buffer.set(new Uint8Array(ab), offset);
    return chunk.size;
   },
   write: function(stream, buffer, offset, length, position) {
    throw new FS.ErrnoError(29);
   },
   llseek: function(stream, offset, whence) {
    var position = offset;
    if (whence === 1) {
     position += stream.position;
    } else if (whence === 2) {
     if (FS.isFile(stream.node.mode)) {
      position += stream.node.size;
     }
    }
    if (position < 0) {
     throw new FS.ErrnoError(28);
    }
    return position;
   }
  }
 };
 var ERRNO_MESSAGES = {
  0: "Success",
  1: "Arg list too long",
  2: "Permission denied",
  3: "Address already in use",
  4: "Address not available",
  5: "Address family not supported by protocol family",
  6: "No more processes",
  7: "Socket already connected",
  8: "Bad file number",
  9: "Trying to read unreadable message",
  10: "Mount device busy",
  11: "Operation canceled",
  12: "No children",
  13: "Connection aborted",
  14: "Connection refused",
  15: "Connection reset by peer",
  16: "File locking deadlock error",
  17: "Destination address required",
  18: "Math arg out of domain of func",
  19: "Quota exceeded",
  20: "File exists",
  21: "Bad address",
  22: "File too large",
  23: "Host is unreachable",
  24: "Identifier removed",
  25: "Illegal byte sequence",
  26: "Connection already in progress",
  27: "Interrupted system call",
  28: "Invalid argument",
  29: "I/O error",
  30: "Socket is already connected",
  31: "Is a directory",
  32: "Too many symbolic links",
  33: "Too many open files",
  34: "Too many links",
  35: "Message too long",
  36: "Multihop attempted",
  37: "File or path name too long",
  38: "Network interface is not configured",
  39: "Connection reset by network",
  40: "Network is unreachable",
  41: "Too many open files in system",
  42: "No buffer space available",
  43: "No such device",
  44: "No such file or directory",
  45: "Exec format error",
  46: "No record locks available",
  47: "The link has been severed",
  48: "Not enough core",
  49: "No message of desired type",
  50: "Protocol not available",
  51: "No space left on device",
  52: "Function not implemented",
  53: "Socket is not connected",
  54: "Not a directory",
  55: "Directory not empty",
  56: "State not recoverable",
  57: "Socket operation on non-socket",
  59: "Not a typewriter",
  60: "No such device or address",
  61: "Value too large for defined data type",
  62: "Previous owner died",
  63: "Not super-user",
  64: "Broken pipe",
  65: "Protocol error",
  66: "Unknown protocol",
  67: "Protocol wrong type for socket",
  68: "Math result not representable",
  69: "Read only file system",
  70: "Illegal seek",
  71: "No such process",
  72: "Stale file handle",
  73: "Connection timed out",
  74: "Text file busy",
  75: "Cross-device link",
  100: "Device not a stream",
  101: "Bad font file fmt",
  102: "Invalid slot",
  103: "Invalid request code",
  104: "No anode",
  105: "Block device required",
  106: "Channel number out of range",
  107: "Level 3 halted",
  108: "Level 3 reset",
  109: "Link number out of range",
  110: "Protocol driver not attached",
  111: "No CSI structure available",
  112: "Level 2 halted",
  113: "Invalid exchange",
  114: "Invalid request descriptor",
  115: "Exchange full",
  116: "No data (for no delay io)",
  117: "Timer expired",
  118: "Out of streams resources",
  119: "Machine is not on the network",
  120: "Package not installed",
  121: "The object is remote",
  122: "Advertise error",
  123: "Srmount error",
  124: "Communication error on send",
  125: "Cross mount point (not really error)",
  126: "Given log. name not unique",
  127: "f.d. invalid for this operation",
  128: "Remote address changed",
  129: "Can   access a needed shared lib",
  130: "Accessing a corrupted shared lib",
  131: ".lib section in a.out corrupted",
  132: "Attempting to link in too many libs",
  133: "Attempting to exec a shared library",
  135: "Streams pipe error",
  136: "Too many users",
  137: "Socket type not supported",
  138: "Not supported",
  139: "Protocol family not supported",
  140: "Can't send after socket shutdown",
  141: "Too many references",
  142: "Host is down",
  148: "No medium (in tape drive)",
  156: "Level 2 not synchronized"
 };
 var FS = {
  root: null,
  mounts: [],
  devices: {},
  streams: [],
  nextInode: 1,
  nameTable: null,
  currentPath: "/",
  initialized: false,
  ignorePermissions: true,
  trackingDelegate: {},
  tracking: {
   openFlags: {
    READ: 1,
    WRITE: 2
   }
  },
  ErrnoError: null,
  genericErrors: {},
  filesystems: null,
  syncFSRequests: 0,
  handleFSError: function(e) {
   if (!(e instanceof FS.ErrnoError)) throw e + " : " + stackTrace();
   return setErrNo(e.errno);
  },
  lookupPath: function(path, opts) {
   path = PATH_FS.resolve(FS.cwd(), path);
   opts = opts || {};
   if (!path) return {
    path: "",
    node: null
   };
   var defaults = {
    follow_mount: true,
    recurse_count: 0
   };
   for (var key in defaults) {
    if (opts[key] === undefined) {
     opts[key] = defaults[key];
    }
   }
   if (opts.recurse_count > 8) {
    throw new FS.ErrnoError(32);
   }
   var parts = PATH.normalizeArray(path.split("/").filter(function(p) {
    return !!p;
   }), false);
   var current = FS.root;
   var current_path = "/";
   for (var i = 0; i < parts.length; i++) {
    var islast = i === parts.length - 1;
    if (islast && opts.parent) {
     break;
    }
    current = FS.lookupNode(current, parts[i]);
    current_path = PATH.join2(current_path, parts[i]);
    if (FS.isMountpoint(current)) {
     if (!islast || islast && opts.follow_mount) {
      current = current.mounted.root;
     }
    }
    if (!islast || opts.follow) {
     var count = 0;
     while (FS.isLink(current.mode)) {
      var link = FS.readlink(current_path);
      current_path = PATH_FS.resolve(PATH.dirname(current_path), link);
      var lookup = FS.lookupPath(current_path, {
       recurse_count: opts.recurse_count
      });
      current = lookup.node;
      if (count++ > 40) {
       throw new FS.ErrnoError(32);
      }
     }
    }
   }
   return {
    path: current_path,
    node: current
   };
  },
  getPath: function(node) {
   var path;
   while (true) {
    if (FS.isRoot(node)) {
     var mount = node.mount.mountpoint;
     if (!path) return mount;
     return mount[mount.length - 1] !== "/" ? mount + "/" + path : mount + path;
    }
    path = path ? node.name + "/" + path : node.name;
    node = node.parent;
   }
  },
  hashName: function(parentid, name) {
   var hash = 0;
   for (var i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i) | 0;
   }
   return (parentid + hash >>> 0) % FS.nameTable.length;
  },
  hashAddNode: function(node) {
   var hash = FS.hashName(node.parent.id, node.name);
   node.name_next = FS.nameTable[hash];
   FS.nameTable[hash] = node;
  },
  hashRemoveNode: function(node) {
   var hash = FS.hashName(node.parent.id, node.name);
   if (FS.nameTable[hash] === node) {
    FS.nameTable[hash] = node.name_next;
   } else {
    var current = FS.nameTable[hash];
    while (current) {
     if (current.name_next === node) {
      current.name_next = node.name_next;
      break;
     }
     current = current.name_next;
    }
   }
  },
  lookupNode: function(parent, name) {
   var errCode = FS.mayLookup(parent);
   if (errCode) {
    throw new FS.ErrnoError(errCode, parent);
   }
   var hash = FS.hashName(parent.id, name);
   for (var node = FS.nameTable[hash]; node; node = node.name_next) {
    var nodeName = node.name;
    if (node.parent.id === parent.id && nodeName === name) {
     return node;
    }
   }
   return FS.lookup(parent, name);
  },
  createNode: function(parent, name, mode, rdev) {
   var node = new FS.FSNode(parent, name, mode, rdev);
   FS.hashAddNode(node);
   return node;
  },
  destroyNode: function(node) {
   FS.hashRemoveNode(node);
  },
  isRoot: function(node) {
   return node === node.parent;
  },
  isMountpoint: function(node) {
   return !!node.mounted;
  },
  isFile: function(mode) {
   return (mode & 61440) === 32768;
  },
  isDir: function(mode) {
   return (mode & 61440) === 16384;
  },
  isLink: function(mode) {
   return (mode & 61440) === 40960;
  },
  isChrdev: function(mode) {
   return (mode & 61440) === 8192;
  },
  isBlkdev: function(mode) {
   return (mode & 61440) === 24576;
  },
  isFIFO: function(mode) {
   return (mode & 61440) === 4096;
  },
  isSocket: function(mode) {
   return (mode & 49152) === 49152;
  },
  flagModes: {
   "r": 0,
   "rs": 1052672,
   "r+": 2,
   "w": 577,
   "wx": 705,
   "xw": 705,
   "w+": 578,
   "wx+": 706,
   "xw+": 706,
   "a": 1089,
   "ax": 1217,
   "xa": 1217,
   "a+": 1090,
   "ax+": 1218,
   "xa+": 1218
  },
  modeStringToFlags: function(str) {
   var flags = FS.flagModes[str];
   if (typeof flags === "undefined") {
    throw new Error("Unknown file open mode: " + str);
   }
   return flags;
  },
  flagsToPermissionString: function(flag) {
   var perms = [ "r", "w", "rw" ][flag & 3];
   if (flag & 512) {
    perms += "w";
   }
   return perms;
  },
  nodePermissions: function(node, perms) {
   if (FS.ignorePermissions) {
    return 0;
   }
   if (perms.indexOf("r") !== -1 && !(node.mode & 292)) {
    return 2;
   } else if (perms.indexOf("w") !== -1 && !(node.mode & 146)) {
    return 2;
   } else if (perms.indexOf("x") !== -1 && !(node.mode & 73)) {
    return 2;
   }
   return 0;
  },
  mayLookup: function(dir) {
   var errCode = FS.nodePermissions(dir, "x");
   if (errCode) return errCode;
   if (!dir.node_ops.lookup) return 2;
   return 0;
  },
  mayCreate: function(dir, name) {
   try {
    var node = FS.lookupNode(dir, name);
    return 20;
   } catch (e) {}
   return FS.nodePermissions(dir, "wx");
  },
  mayDelete: function(dir, name, isdir) {
   var node;
   try {
    node = FS.lookupNode(dir, name);
   } catch (e) {
    return e.errno;
   }
   var errCode = FS.nodePermissions(dir, "wx");
   if (errCode) {
    return errCode;
   }
   if (isdir) {
    if (!FS.isDir(node.mode)) {
     return 54;
    }
    if (FS.isRoot(node) || FS.getPath(node) === FS.cwd()) {
     return 10;
    }
   } else {
    if (FS.isDir(node.mode)) {
     return 31;
    }
   }
   return 0;
  },
  mayOpen: function(node, flags) {
   if (!node) {
    return 44;
   }
   if (FS.isLink(node.mode)) {
    return 32;
   } else if (FS.isDir(node.mode)) {
    if (FS.flagsToPermissionString(flags) !== "r" || flags & 512) {
     return 31;
    }
   }
   return FS.nodePermissions(node, FS.flagsToPermissionString(flags));
  },
  MAX_OPEN_FDS: 4096,
  nextfd: function(fd_start, fd_end) {
   fd_start = fd_start || 0;
   fd_end = fd_end || FS.MAX_OPEN_FDS;
   for (var fd = fd_start; fd <= fd_end; fd++) {
    if (!FS.streams[fd]) {
     return fd;
    }
   }
   throw new FS.ErrnoError(33);
  },
  getStream: function(fd) {
   return FS.streams[fd];
  },
  createStream: function(stream, fd_start, fd_end) {
   if (!FS.FSStream) {
    FS.FSStream = function() {};
    FS.FSStream.prototype = {
     object: {
      get: function() {
       return this.node;
      },
      set: function(val) {
       this.node = val;
      }
     },
     isRead: {
      get: function() {
       return (this.flags & 2097155) !== 1;
      }
     },
     isWrite: {
      get: function() {
       return (this.flags & 2097155) !== 0;
      }
     },
     isAppend: {
      get: function() {
       return this.flags & 1024;
      }
     }
    };
   }
   var newStream = new FS.FSStream();
   for (var p in stream) {
    newStream[p] = stream[p];
   }
   stream = newStream;
   var fd = FS.nextfd(fd_start, fd_end);
   stream.fd = fd;
   FS.streams[fd] = stream;
   return stream;
  },
  closeStream: function(fd) {
   FS.streams[fd] = null;
  },
  chrdev_stream_ops: {
   open: function(stream) {
    var device = FS.getDevice(stream.node.rdev);
    stream.stream_ops = device.stream_ops;
    if (stream.stream_ops.open) {
     stream.stream_ops.open(stream);
    }
   },
   llseek: function() {
    throw new FS.ErrnoError(70);
   }
  },
  major: function(dev) {
   return dev >> 8;
  },
  minor: function(dev) {
   return dev & 255;
  },
  makedev: function(ma, mi) {
   return ma << 8 | mi;
  },
  registerDevice: function(dev, ops) {
   FS.devices[dev] = {
    stream_ops: ops
   };
  },
  getDevice: function(dev) {
   return FS.devices[dev];
  },
  getMounts: function(mount) {
   var mounts = [];
   var check = [ mount ];
   while (check.length) {
    var m = check.pop();
    mounts.push(m);
    check.push.apply(check, m.mounts);
   }
   return mounts;
  },
  syncfs: function(populate, callback) {
   if (typeof populate === "function") {
    callback = populate;
    populate = false;
   }
   FS.syncFSRequests++;
   if (FS.syncFSRequests > 1) {
    err("warning: " + FS.syncFSRequests + " FS.syncfs operations in flight at once, probably just doing extra work");
   }
   var mounts = FS.getMounts(FS.root.mount);
   var completed = 0;
   function doCallback(errCode) {
    assert(FS.syncFSRequests > 0);
    FS.syncFSRequests--;
    return callback(errCode);
   }
   function done(errCode) {
    if (errCode) {
     if (!done.errored) {
      done.errored = true;
      return doCallback(errCode);
     }
     return;
    }
    if (++completed >= mounts.length) {
     doCallback(null);
    }
   }
   mounts.forEach(function(mount) {
    if (!mount.type.syncfs) {
     return done(null);
    }
    mount.type.syncfs(mount, populate, done);
   });
  },
  mount: function(type, opts, mountpoint) {
   if (typeof type === "string") {
    throw type;
   }
   var root = mountpoint === "/";
   var pseudo = !mountpoint;
   var node;
   if (root && FS.root) {
    throw new FS.ErrnoError(10);
   } else if (!root && !pseudo) {
    var lookup = FS.lookupPath(mountpoint, {
     follow_mount: false
    });
    mountpoint = lookup.path;
    node = lookup.node;
    if (FS.isMountpoint(node)) {
     throw new FS.ErrnoError(10);
    }
    if (!FS.isDir(node.mode)) {
     throw new FS.ErrnoError(54);
    }
   }
   var mount = {
    type: type,
    opts: opts,
    mountpoint: mountpoint,
    mounts: []
   };
   var mountRoot = type.mount(mount);
   mountRoot.mount = mount;
   mount.root = mountRoot;
   if (root) {
    FS.root = mountRoot;
   } else if (node) {
    node.mounted = mount;
    if (node.mount) {
     node.mount.mounts.push(mount);
    }
   }
   return mountRoot;
  },
  unmount: function(mountpoint) {
   var lookup = FS.lookupPath(mountpoint, {
    follow_mount: false
   });
   if (!FS.isMountpoint(lookup.node)) {
    throw new FS.ErrnoError(28);
   }
   var node = lookup.node;
   var mount = node.mounted;
   var mounts = FS.getMounts(mount);
   Object.keys(FS.nameTable).forEach(function(hash) {
    var current = FS.nameTable[hash];
    while (current) {
     var next = current.name_next;
     if (mounts.indexOf(current.mount) !== -1) {
      FS.destroyNode(current);
     }
     current = next;
    }
   });
   node.mounted = null;
   var idx = node.mount.mounts.indexOf(mount);
   assert(idx !== -1);
   node.mount.mounts.splice(idx, 1);
  },
  lookup: function(parent, name) {
   return parent.node_ops.lookup(parent, name);
  },
  mknod: function(path, mode, dev) {
   var lookup = FS.lookupPath(path, {
    parent: true
   });
   var parent = lookup.node;
   var name = PATH.basename(path);
   if (!name || name === "." || name === "..") {
    throw new FS.ErrnoError(28);
   }
   var errCode = FS.mayCreate(parent, name);
   if (errCode) {
    throw new FS.ErrnoError(errCode);
   }
   if (!parent.node_ops.mknod) {
    throw new FS.ErrnoError(63);
   }
   return parent.node_ops.mknod(parent, name, mode, dev);
  },
  create: function(path, mode) {
   mode = mode !== undefined ? mode : 438;
   mode &= 4095;
   mode |= 32768;
   return FS.mknod(path, mode, 0);
  },
  mkdir: function(path, mode) {
   mode = mode !== undefined ? mode : 511;
   mode &= 511 | 512;
   mode |= 16384;
   return FS.mknod(path, mode, 0);
  },
  mkdirTree: function(path, mode) {
   var dirs = path.split("/");
   var d = "";
   for (var i = 0; i < dirs.length; ++i) {
    if (!dirs[i]) continue;
    d += "/" + dirs[i];
    try {
     FS.mkdir(d, mode);
    } catch (e) {
     if (e.errno != 20) throw e;
    }
   }
  },
  mkdev: function(path, mode, dev) {
   if (typeof dev === "undefined") {
    dev = mode;
    mode = 438;
   }
   mode |= 8192;
   return FS.mknod(path, mode, dev);
  },
  symlink: function(oldpath, newpath) {
   if (!PATH_FS.resolve(oldpath)) {
    throw new FS.ErrnoError(44);
   }
   var lookup = FS.lookupPath(newpath, {
    parent: true
   });
   var parent = lookup.node;
   if (!parent) {
    throw new FS.ErrnoError(44);
   }
   var newname = PATH.basename(newpath);
   var errCode = FS.mayCreate(parent, newname);
   if (errCode) {
    throw new FS.ErrnoError(errCode);
   }
   if (!parent.node_ops.symlink) {
    throw new FS.ErrnoError(63);
   }
   return parent.node_ops.symlink(parent, newname, oldpath);
  },
  rename: function(old_path, new_path) {
   var old_dirname = PATH.dirname(old_path);
   var new_dirname = PATH.dirname(new_path);
   var old_name = PATH.basename(old_path);
   var new_name = PATH.basename(new_path);
   var lookup, old_dir, new_dir;
   try {
    lookup = FS.lookupPath(old_path, {
     parent: true
    });
    old_dir = lookup.node;
    lookup = FS.lookupPath(new_path, {
     parent: true
    });
    new_dir = lookup.node;
   } catch (e) {
    throw new FS.ErrnoError(10);
   }
   if (!old_dir || !new_dir) throw new FS.ErrnoError(44);
   if (old_dir.mount !== new_dir.mount) {
    throw new FS.ErrnoError(75);
   }
   var old_node = FS.lookupNode(old_dir, old_name);
   var relative = PATH_FS.relative(old_path, new_dirname);
   if (relative.charAt(0) !== ".") {
    throw new FS.ErrnoError(28);
   }
   relative = PATH_FS.relative(new_path, old_dirname);
   if (relative.charAt(0) !== ".") {
    throw new FS.ErrnoError(55);
   }
   var new_node;
   try {
    new_node = FS.lookupNode(new_dir, new_name);
   } catch (e) {}
   if (old_node === new_node) {
    return;
   }
   var isdir = FS.isDir(old_node.mode);
   var errCode = FS.mayDelete(old_dir, old_name, isdir);
   if (errCode) {
    throw new FS.ErrnoError(errCode);
   }
   errCode = new_node ? FS.mayDelete(new_dir, new_name, isdir) : FS.mayCreate(new_dir, new_name);
   if (errCode) {
    throw new FS.ErrnoError(errCode);
   }
   if (!old_dir.node_ops.rename) {
    throw new FS.ErrnoError(63);
   }
   if (FS.isMountpoint(old_node) || new_node && FS.isMountpoint(new_node)) {
    throw new FS.ErrnoError(10);
   }
   if (new_dir !== old_dir) {
    errCode = FS.nodePermissions(old_dir, "w");
    if (errCode) {
     throw new FS.ErrnoError(errCode);
    }
   }
   try {
    if (FS.trackingDelegate["willMovePath"]) {
     FS.trackingDelegate["willMovePath"](old_path, new_path);
    }
   } catch (e) {
    err("FS.trackingDelegate['willMovePath']('" + old_path + "', '" + new_path + "') threw an exception: " + e.message);
   }
   FS.hashRemoveNode(old_node);
   try {
    old_dir.node_ops.rename(old_node, new_dir, new_name);
   } catch (e) {
    throw e;
   } finally {
    FS.hashAddNode(old_node);
   }
   try {
    if (FS.trackingDelegate["onMovePath"]) FS.trackingDelegate["onMovePath"](old_path, new_path);
   } catch (e) {
    err("FS.trackingDelegate['onMovePath']('" + old_path + "', '" + new_path + "') threw an exception: " + e.message);
   }
  },
  rmdir: function(path) {
   var lookup = FS.lookupPath(path, {
    parent: true
   });
   var parent = lookup.node;
   var name = PATH.basename(path);
   var node = FS.lookupNode(parent, name);
   var errCode = FS.mayDelete(parent, name, true);
   if (errCode) {
    throw new FS.ErrnoError(errCode);
   }
   if (!parent.node_ops.rmdir) {
    throw new FS.ErrnoError(63);
   }
   if (FS.isMountpoint(node)) {
    throw new FS.ErrnoError(10);
   }
   try {
    if (FS.trackingDelegate["willDeletePath"]) {
     FS.trackingDelegate["willDeletePath"](path);
    }
   } catch (e) {
    err("FS.trackingDelegate['willDeletePath']('" + path + "') threw an exception: " + e.message);
   }
   parent.node_ops.rmdir(parent, name);
   FS.destroyNode(node);
   try {
    if (FS.trackingDelegate["onDeletePath"]) FS.trackingDelegate["onDeletePath"](path);
   } catch (e) {
    err("FS.trackingDelegate['onDeletePath']('" + path + "') threw an exception: " + e.message);
   }
  },
  readdir: function(path) {
   var lookup = FS.lookupPath(path, {
    follow: true
   });
   var node = lookup.node;
   if (!node.node_ops.readdir) {
    throw new FS.ErrnoError(54);
   }
   return node.node_ops.readdir(node);
  },
  unlink: function(path) {
   var lookup = FS.lookupPath(path, {
    parent: true
   });
   var parent = lookup.node;
   var name = PATH.basename(path);
   var node = FS.lookupNode(parent, name);
   var errCode = FS.mayDelete(parent, name, false);
   if (errCode) {
    throw new FS.ErrnoError(errCode);
   }
   if (!parent.node_ops.unlink) {
    throw new FS.ErrnoError(63);
   }
   if (FS.isMountpoint(node)) {
    throw new FS.ErrnoError(10);
   }
   try {
    if (FS.trackingDelegate["willDeletePath"]) {
     FS.trackingDelegate["willDeletePath"](path);
    }
   } catch (e) {
    err("FS.trackingDelegate['willDeletePath']('" + path + "') threw an exception: " + e.message);
   }
   parent.node_ops.unlink(parent, name);
   FS.destroyNode(node);
   try {
    if (FS.trackingDelegate["onDeletePath"]) FS.trackingDelegate["onDeletePath"](path);
   } catch (e) {
    err("FS.trackingDelegate['onDeletePath']('" + path + "') threw an exception: " + e.message);
   }
  },
  readlink: function(path) {
   var lookup = FS.lookupPath(path);
   var link = lookup.node;
   if (!link) {
    throw new FS.ErrnoError(44);
   }
   if (!link.node_ops.readlink) {
    throw new FS.ErrnoError(28);
   }
   return PATH_FS.resolve(FS.getPath(link.parent), link.node_ops.readlink(link));
  },
  stat: function(path, dontFollow) {
   var lookup = FS.lookupPath(path, {
    follow: !dontFollow
   });
   var node = lookup.node;
   if (!node) {
    throw new FS.ErrnoError(44);
   }
   if (!node.node_ops.getattr) {
    throw new FS.ErrnoError(63);
   }
   return node.node_ops.getattr(node);
  },
  lstat: function(path) {
   return FS.stat(path, true);
  },
  chmod: function(path, mode, dontFollow) {
   var node;
   if (typeof path === "string") {
    var lookup = FS.lookupPath(path, {
     follow: !dontFollow
    });
    node = lookup.node;
   } else {
    node = path;
   }
   if (!node.node_ops.setattr) {
    throw new FS.ErrnoError(63);
   }
   node.node_ops.setattr(node, {
    mode: mode & 4095 | node.mode & ~4095,
    timestamp: Date.now()
   });
  },
  lchmod: function(path, mode) {
   FS.chmod(path, mode, true);
  },
  fchmod: function(fd, mode) {
   var stream = FS.getStream(fd);
   if (!stream) {
    throw new FS.ErrnoError(8);
   }
   FS.chmod(stream.node, mode);
  },
  chown: function(path, uid, gid, dontFollow) {
   var node;
   if (typeof path === "string") {
    var lookup = FS.lookupPath(path, {
     follow: !dontFollow
    });
    node = lookup.node;
   } else {
    node = path;
   }
   if (!node.node_ops.setattr) {
    throw new FS.ErrnoError(63);
   }
   node.node_ops.setattr(node, {
    timestamp: Date.now()
   });
  },
  lchown: function(path, uid, gid) {
   FS.chown(path, uid, gid, true);
  },
  fchown: function(fd, uid, gid) {
   var stream = FS.getStream(fd);
   if (!stream) {
    throw new FS.ErrnoError(8);
   }
   FS.chown(stream.node, uid, gid);
  },
  truncate: function(path, len) {
   if (len < 0) {
    throw new FS.ErrnoError(28);
   }
   var node;
   if (typeof path === "string") {
    var lookup = FS.lookupPath(path, {
     follow: true
    });
    node = lookup.node;
   } else {
    node = path;
   }
   if (!node.node_ops.setattr) {
    throw new FS.ErrnoError(63);
   }
   if (FS.isDir(node.mode)) {
    throw new FS.ErrnoError(31);
   }
   if (!FS.isFile(node.mode)) {
    throw new FS.ErrnoError(28);
   }
   var errCode = FS.nodePermissions(node, "w");
   if (errCode) {
    throw new FS.ErrnoError(errCode);
   }
   node.node_ops.setattr(node, {
    size: len,
    timestamp: Date.now()
   });
  },
  ftruncate: function(fd, len) {
   var stream = FS.getStream(fd);
   if (!stream) {
    throw new FS.ErrnoError(8);
   }
   if ((stream.flags & 2097155) === 0) {
    throw new FS.ErrnoError(28);
   }
   FS.truncate(stream.node, len);
  },
  utime: function(path, atime, mtime) {
   var lookup = FS.lookupPath(path, {
    follow: true
   });
   var node = lookup.node;
   node.node_ops.setattr(node, {
    timestamp: Math.max(atime, mtime)
   });
  },
  open: function(path, flags, mode, fd_start, fd_end) {
   if (path === "") {
    throw new FS.ErrnoError(44);
   }
   flags = typeof flags === "string" ? FS.modeStringToFlags(flags) : flags;
   mode = typeof mode === "undefined" ? 438 : mode;
   if (flags & 64) {
    mode = mode & 4095 | 32768;
   } else {
    mode = 0;
   }
   var node;
   if (typeof path === "object") {
    node = path;
   } else {
    path = PATH.normalize(path);
    try {
     var lookup = FS.lookupPath(path, {
      follow: !(flags & 131072)
     });
     node = lookup.node;
    } catch (e) {}
   }
   var created = false;
   if (flags & 64) {
    if (node) {
     if (flags & 128) {
      throw new FS.ErrnoError(20);
     }
    } else {
     node = FS.mknod(path, mode, 0);
     created = true;
    }
   }
   if (!node) {
    throw new FS.ErrnoError(44);
   }
   if (FS.isChrdev(node.mode)) {
    flags &= ~512;
   }
   if (flags & 65536 && !FS.isDir(node.mode)) {
    throw new FS.ErrnoError(54);
   }
   if (!created) {
    var errCode = FS.mayOpen(node, flags);
    if (errCode) {
     throw new FS.ErrnoError(errCode);
    }
   }
   if (flags & 512) {
    FS.truncate(node, 0);
   }
   flags &= ~(128 | 512 | 131072);
   var stream = FS.createStream({
    node: node,
    path: FS.getPath(node),
    flags: flags,
    seekable: true,
    position: 0,
    stream_ops: node.stream_ops,
    ungotten: [],
    error: false
   }, fd_start, fd_end);
   if (stream.stream_ops.open) {
    stream.stream_ops.open(stream);
   }
   if (Module["logReadFiles"] && !(flags & 1)) {
    if (!FS.readFiles) FS.readFiles = {};
    if (!(path in FS.readFiles)) {
     FS.readFiles[path] = 1;
     err("FS.trackingDelegate error on read file: " + path);
    }
   }
   try {
    if (FS.trackingDelegate["onOpenFile"]) {
     var trackingFlags = 0;
     if ((flags & 2097155) !== 1) {
      trackingFlags |= FS.tracking.openFlags.READ;
     }
     if ((flags & 2097155) !== 0) {
      trackingFlags |= FS.tracking.openFlags.WRITE;
     }
     FS.trackingDelegate["onOpenFile"](path, trackingFlags);
    }
   } catch (e) {
    err("FS.trackingDelegate['onOpenFile']('" + path + "', flags) threw an exception: " + e.message);
   }
   return stream;
  },
  close: function(stream) {
   if (FS.isClosed(stream)) {
    throw new FS.ErrnoError(8);
   }
   if (stream.getdents) stream.getdents = null;
   try {
    if (stream.stream_ops.close) {
     stream.stream_ops.close(stream);
    }
   } catch (e) {
    throw e;
   } finally {
    FS.closeStream(stream.fd);
   }
   stream.fd = null;
  },
  isClosed: function(stream) {
   return stream.fd === null;
  },
  llseek: function(stream, offset, whence) {
   if (FS.isClosed(stream)) {
    throw new FS.ErrnoError(8);
   }
   if (!stream.seekable || !stream.stream_ops.llseek) {
    throw new FS.ErrnoError(70);
   }
   if (whence != 0 && whence != 1 && whence != 2) {
    throw new FS.ErrnoError(28);
   }
   stream.position = stream.stream_ops.llseek(stream, offset, whence);
   stream.ungotten = [];
   return stream.position;
  },
  read: function(stream, buffer, offset, length, position) {
   if (length < 0 || position < 0) {
    throw new FS.ErrnoError(28);
   }
   if (FS.isClosed(stream)) {
    throw new FS.ErrnoError(8);
   }
   if ((stream.flags & 2097155) === 1) {
    throw new FS.ErrnoError(8);
   }
   if (FS.isDir(stream.node.mode)) {
    throw new FS.ErrnoError(31);
   }
   if (!stream.stream_ops.read) {
    throw new FS.ErrnoError(28);
   }
   var seeking = typeof position !== "undefined";
   if (!seeking) {
    position = stream.position;
   } else if (!stream.seekable) {
    throw new FS.ErrnoError(70);
   }
   var bytesRead = stream.stream_ops.read(stream, buffer, offset, length, position);
   if (!seeking) stream.position += bytesRead;
   return bytesRead;
  },
  write: function(stream, buffer, offset, length, position, canOwn) {
   if (length < 0 || position < 0) {
    throw new FS.ErrnoError(28);
   }
   if (FS.isClosed(stream)) {
    throw new FS.ErrnoError(8);
   }
   if ((stream.flags & 2097155) === 0) {
    throw new FS.ErrnoError(8);
   }
   if (FS.isDir(stream.node.mode)) {
    throw new FS.ErrnoError(31);
   }
   if (!stream.stream_ops.write) {
    throw new FS.ErrnoError(28);
   }
   if (stream.seekable && stream.flags & 1024) {
    FS.llseek(stream, 0, 2);
   }
   var seeking = typeof position !== "undefined";
   if (!seeking) {
    position = stream.position;
   } else if (!stream.seekable) {
    throw new FS.ErrnoError(70);
   }
   var bytesWritten = stream.stream_ops.write(stream, buffer, offset, length, position, canOwn);
   if (!seeking) stream.position += bytesWritten;
   try {
    if (stream.path && FS.trackingDelegate["onWriteToFile"]) FS.trackingDelegate["onWriteToFile"](stream.path);
   } catch (e) {
    err("FS.trackingDelegate['onWriteToFile']('" + stream.path + "') threw an exception: " + e.message);
   }
   return bytesWritten;
  },
  allocate: function(stream, offset, length) {
   if (FS.isClosed(stream)) {
    throw new FS.ErrnoError(8);
   }
   if (offset < 0 || length <= 0) {
    throw new FS.ErrnoError(28);
   }
   if ((stream.flags & 2097155) === 0) {
    throw new FS.ErrnoError(8);
   }
   if (!FS.isFile(stream.node.mode) && !FS.isDir(stream.node.mode)) {
    throw new FS.ErrnoError(43);
   }
   if (!stream.stream_ops.allocate) {
    throw new FS.ErrnoError(138);
   }
   stream.stream_ops.allocate(stream, offset, length);
  },
  mmap: function(stream, address, length, position, prot, flags) {
   if ((prot & 2) !== 0 && (flags & 2) === 0 && (stream.flags & 2097155) !== 2) {
    throw new FS.ErrnoError(2);
   }
   if ((stream.flags & 2097155) === 1) {
    throw new FS.ErrnoError(2);
   }
   if (!stream.stream_ops.mmap) {
    throw new FS.ErrnoError(43);
   }
   return stream.stream_ops.mmap(stream, address, length, position, prot, flags);
  },
  msync: function(stream, buffer, offset, length, mmapFlags) {
   if (!stream || !stream.stream_ops.msync) {
    return 0;
   }
   return stream.stream_ops.msync(stream, buffer, offset, length, mmapFlags);
  },
  munmap: function(stream) {
   return 0;
  },
  ioctl: function(stream, cmd, arg) {
   if (!stream.stream_ops.ioctl) {
    throw new FS.ErrnoError(59);
   }
   return stream.stream_ops.ioctl(stream, cmd, arg);
  },
  readFile: function(path, opts) {
   opts = opts || {};
   opts.flags = opts.flags || "r";
   opts.encoding = opts.encoding || "binary";
   if (opts.encoding !== "utf8" && opts.encoding !== "binary") {
    throw new Error('Invalid encoding type "' + opts.encoding + '"');
   }
   var ret;
   var stream = FS.open(path, opts.flags);
   var stat = FS.stat(path);
   var length = stat.size;
   var buf = new Uint8Array(length);
   FS.read(stream, buf, 0, length, 0);
   if (opts.encoding === "utf8") {
    ret = UTF8ArrayToString(buf, 0);
   } else if (opts.encoding === "binary") {
    ret = buf;
   }
   FS.close(stream);
   return ret;
  },
  writeFile: function(path, data, opts) {
   opts = opts || {};
   opts.flags = opts.flags || "w";
   var stream = FS.open(path, opts.flags, opts.mode);
   if (typeof data === "string") {
    var buf = new Uint8Array(lengthBytesUTF8(data) + 1);
    var actualNumBytes = stringToUTF8Array(data, buf, 0, buf.length);
    FS.write(stream, buf, 0, actualNumBytes, undefined, opts.canOwn);
   } else if (ArrayBuffer.isView(data)) {
    FS.write(stream, data, 0, data.byteLength, undefined, opts.canOwn);
   } else {
    throw new Error("Unsupported data type");
   }
   FS.close(stream);
  },
  cwd: function() {
   return FS.currentPath;
  },
  chdir: function(path) {
   var lookup = FS.lookupPath(path, {
    follow: true
   });
   if (lookup.node === null) {
    throw new FS.ErrnoError(44);
   }
   if (!FS.isDir(lookup.node.mode)) {
    throw new FS.ErrnoError(54);
   }
   var errCode = FS.nodePermissions(lookup.node, "x");
   if (errCode) {
    throw new FS.ErrnoError(errCode);
   }
   FS.currentPath = lookup.path;
  },
  createDefaultDirectories: function() {
   FS.mkdir("/tmp");
   FS.mkdir("/home");
   FS.mkdir("/home/web_user");
  },
  createDefaultDevices: function() {
   FS.mkdir("/dev");
   FS.registerDevice(FS.makedev(1, 3), {
    read: function() {
     return 0;
    },
    write: function(stream, buffer, offset, length, pos) {
     return length;
    }
   });
   FS.mkdev("/dev/null", FS.makedev(1, 3));
   TTY.register(FS.makedev(5, 0), TTY.default_tty_ops);
   TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops);
   FS.mkdev("/dev/tty", FS.makedev(5, 0));
   FS.mkdev("/dev/tty1", FS.makedev(6, 0));
   var random_device;
   if (typeof crypto === "object" && typeof crypto["getRandomValues"] === "function") {
    var randomBuffer = new Uint8Array(1);
    random_device = function() {
     crypto.getRandomValues(randomBuffer);
     return randomBuffer[0];
    };
   } else if (ENVIRONMENT_IS_NODE) {
    try {
     var crypto_module = require("crypto");
     random_device = function() {
      return crypto_module["randomBytes"](1)[0];
     };
    } catch (e) {}
   } else {}
   if (!random_device) {
    random_device = function() {
     abort("no cryptographic support found for random_device. consider polyfilling it if you want to use something insecure like Math.random(), e.g. put this in a --pre-js: var crypto = { getRandomValues: function(array) { for (var i = 0; i < array.length; i++) array[i] = (Math.random()*256)|0 } };");
    };
   }
   FS.createDevice("/dev", "random", random_device);
   FS.createDevice("/dev", "urandom", random_device);
   FS.mkdir("/dev/shm");
   FS.mkdir("/dev/shm/tmp");
  },
  createSpecialDirectories: function() {
   FS.mkdir("/proc");
   FS.mkdir("/proc/self");
   FS.mkdir("/proc/self/fd");
   FS.mount({
    mount: function() {
     var node = FS.createNode("/proc/self", "fd", 16384 | 511, 73);
     node.node_ops = {
      lookup: function(parent, name) {
       var fd = +name;
       var stream = FS.getStream(fd);
       if (!stream) throw new FS.ErrnoError(8);
       var ret = {
        parent: null,
        mount: {
         mountpoint: "fake"
        },
        node_ops: {
         readlink: function() {
          return stream.path;
         }
        }
       };
       ret.parent = ret;
       return ret;
      }
     };
     return node;
    }
   }, {}, "/proc/self/fd");
  },
  createStandardStreams: function() {
   if (Module["stdin"]) {
    FS.createDevice("/dev", "stdin", Module["stdin"]);
   } else {
    FS.symlink("/dev/tty", "/dev/stdin");
   }
   if (Module["stdout"]) {
    FS.createDevice("/dev", "stdout", null, Module["stdout"]);
   } else {
    FS.symlink("/dev/tty", "/dev/stdout");
   }
   if (Module["stderr"]) {
    FS.createDevice("/dev", "stderr", null, Module["stderr"]);
   } else {
    FS.symlink("/dev/tty1", "/dev/stderr");
   }
   var stdin = FS.open("/dev/stdin", "r");
   var stdout = FS.open("/dev/stdout", "w");
   var stderr = FS.open("/dev/stderr", "w");
   assert(stdin.fd === 0, "invalid handle for stdin (" + stdin.fd + ")");
   assert(stdout.fd === 1, "invalid handle for stdout (" + stdout.fd + ")");
   assert(stderr.fd === 2, "invalid handle for stderr (" + stderr.fd + ")");
  },
  ensureErrnoError: function() {
   if (FS.ErrnoError) return;
   FS.ErrnoError = function ErrnoError(errno, node) {
    this.node = node;
    this.setErrno = function(errno) {
     this.errno = errno;
     for (var key in ERRNO_CODES) {
      if (ERRNO_CODES[key] === errno) {
       this.code = key;
       break;
      }
     }
    };
    this.setErrno(errno);
    this.message = ERRNO_MESSAGES[errno];
    if (this.stack) {
     Object.defineProperty(this, "stack", {
      value: new Error().stack,
      writable: true
     });
     this.stack = demangleAll(this.stack);
    }
   };
   FS.ErrnoError.prototype = new Error();
   FS.ErrnoError.prototype.constructor = FS.ErrnoError;
   [ 44 ].forEach(function(code) {
    FS.genericErrors[code] = new FS.ErrnoError(code);
    FS.genericErrors[code].stack = "<generic error, no stack>";
   });
  },
  staticInit: function() {
   FS.ensureErrnoError();
   FS.nameTable = new Array(4096);
   FS.mount(MEMFS, {}, "/");
   FS.createDefaultDirectories();
   FS.createDefaultDevices();
   FS.createSpecialDirectories();
   FS.filesystems = {
    "MEMFS": MEMFS,
    "WORKERFS": WORKERFS
   };
  },
  init: function(input, output, error) {
   assert(!FS.init.initialized, "FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)");
   FS.init.initialized = true;
   FS.ensureErrnoError();
   Module["stdin"] = input || Module["stdin"];
   Module["stdout"] = output || Module["stdout"];
   Module["stderr"] = error || Module["stderr"];
   FS.createStandardStreams();
  },
  quit: function() {
   FS.init.initialized = false;
   var fflush = Module["_fflush"];
   if (fflush) fflush(0);
   for (var i = 0; i < FS.streams.length; i++) {
    var stream = FS.streams[i];
    if (!stream) {
     continue;
    }
    FS.close(stream);
   }
  },
  getMode: function(canRead, canWrite) {
   var mode = 0;
   if (canRead) mode |= 292 | 73;
   if (canWrite) mode |= 146;
   return mode;
  },
  joinPath: function(parts, forceRelative) {
   var path = PATH.join.apply(null, parts);
   if (forceRelative && path[0] == "/") path = path.substr(1);
   return path;
  },
  absolutePath: function(relative, base) {
   return PATH_FS.resolve(base, relative);
  },
  standardizePath: function(path) {
   return PATH.normalize(path);
  },
  findObject: function(path, dontResolveLastLink) {
   var ret = FS.analyzePath(path, dontResolveLastLink);
   if (ret.exists) {
    return ret.object;
   } else {
    setErrNo(ret.error);
    return null;
   }
  },
  analyzePath: function(path, dontResolveLastLink) {
   try {
    var lookup = FS.lookupPath(path, {
     follow: !dontResolveLastLink
    });
    path = lookup.path;
   } catch (e) {}
   var ret = {
    isRoot: false,
    exists: false,
    error: 0,
    name: null,
    path: null,
    object: null,
    parentExists: false,
    parentPath: null,
    parentObject: null
   };
   try {
    var lookup = FS.lookupPath(path, {
     parent: true
    });
    ret.parentExists = true;
    ret.parentPath = lookup.path;
    ret.parentObject = lookup.node;
    ret.name = PATH.basename(path);
    lookup = FS.lookupPath(path, {
     follow: !dontResolveLastLink
    });
    ret.exists = true;
    ret.path = lookup.path;
    ret.object = lookup.node;
    ret.name = lookup.node.name;
    ret.isRoot = lookup.path === "/";
   } catch (e) {
    ret.error = e.errno;
   }
   return ret;
  },
  createFolder: function(parent, name, canRead, canWrite) {
   var path = PATH.join2(typeof parent === "string" ? parent : FS.getPath(parent), name);
   var mode = FS.getMode(canRead, canWrite);
   return FS.mkdir(path, mode);
  },
  createPath: function(parent, path, canRead, canWrite) {
   parent = typeof parent === "string" ? parent : FS.getPath(parent);
   var parts = path.split("/").reverse();
   while (parts.length) {
    var part = parts.pop();
    if (!part) continue;
    var current = PATH.join2(parent, part);
    try {
     FS.mkdir(current);
    } catch (e) {}
    parent = current;
   }
   return current;
  },
  createFile: function(parent, name, properties, canRead, canWrite) {
   var path = PATH.join2(typeof parent === "string" ? parent : FS.getPath(parent), name);
   var mode = FS.getMode(canRead, canWrite);
   return FS.create(path, mode);
  },
  createDataFile: function(parent, name, data, canRead, canWrite, canOwn) {
   var path = name ? PATH.join2(typeof parent === "string" ? parent : FS.getPath(parent), name) : parent;
   var mode = FS.getMode(canRead, canWrite);
   var node = FS.create(path, mode);
   if (data) {
    if (typeof data === "string") {
     var arr = new Array(data.length);
     for (var i = 0, len = data.length; i < len; ++i) arr[i] = data.charCodeAt(i);
     data = arr;
    }
    FS.chmod(node, mode | 146);
    var stream = FS.open(node, "w");
    FS.write(stream, data, 0, data.length, 0, canOwn);
    FS.close(stream);
    FS.chmod(node, mode);
   }
   return node;
  },
  createDevice: function(parent, name, input, output) {
   var path = PATH.join2(typeof parent === "string" ? parent : FS.getPath(parent), name);
   var mode = FS.getMode(!!input, !!output);
   if (!FS.createDevice.major) FS.createDevice.major = 64;
   var dev = FS.makedev(FS.createDevice.major++, 0);
   FS.registerDevice(dev, {
    open: function(stream) {
     stream.seekable = false;
    },
    close: function(stream) {
     if (output && output.buffer && output.buffer.length) {
      output(10);
     }
    },
    read: function(stream, buffer, offset, length, pos) {
     var bytesRead = 0;
     for (var i = 0; i < length; i++) {
      var result;
      try {
       result = input();
      } catch (e) {
       throw new FS.ErrnoError(29);
      }
      if (result === undefined && bytesRead === 0) {
       throw new FS.ErrnoError(6);
      }
      if (result === null || result === undefined) break;
      bytesRead++;
      buffer[offset + i] = result;
     }
     if (bytesRead) {
      stream.node.timestamp = Date.now();
     }
     return bytesRead;
    },
    write: function(stream, buffer, offset, length, pos) {
     for (var i = 0; i < length; i++) {
      try {
       output(buffer[offset + i]);
      } catch (e) {
       throw new FS.ErrnoError(29);
      }
     }
     if (length) {
      stream.node.timestamp = Date.now();
     }
     return i;
    }
   });
   return FS.mkdev(path, mode, dev);
  },
  createLink: function(parent, name, target, canRead, canWrite) {
   var path = PATH.join2(typeof parent === "string" ? parent : FS.getPath(parent), name);
   return FS.symlink(target, path);
  },
  forceLoadFile: function(obj) {
   if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true;
   var success = true;
   if (typeof XMLHttpRequest !== "undefined") {
    throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");
   } else if (read_) {
    try {
     obj.contents = intArrayFromString(read_(obj.url), true);
     obj.usedBytes = obj.contents.length;
    } catch (e) {
     success = false;
    }
   } else {
    throw new Error("Cannot load without read() or XMLHttpRequest.");
   }
   if (!success) setErrNo(29);
   return success;
  },
  createLazyFile: function(parent, name, url, canRead, canWrite) {
   function LazyUint8Array() {
    this.lengthKnown = false;
    this.chunks = [];
   }
   LazyUint8Array.prototype.get = function LazyUint8Array_get(idx) {
    if (idx > this.length - 1 || idx < 0) {
     return undefined;
    }
    var chunkOffset = idx % this.chunkSize;
    var chunkNum = idx / this.chunkSize | 0;
    return this.getter(chunkNum)[chunkOffset];
   };
   LazyUint8Array.prototype.setDataGetter = function LazyUint8Array_setDataGetter(getter) {
    this.getter = getter;
   };
   LazyUint8Array.prototype.cacheLength = function LazyUint8Array_cacheLength() {
    var xhr = new XMLHttpRequest();
    xhr.open("HEAD", url, false);
    xhr.send(null);
    if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
    var datalength = Number(xhr.getResponseHeader("Content-length"));
    var header;
    var hasByteServing = (header = xhr.getResponseHeader("Accept-Ranges")) && header === "bytes";
    var usesGzip = (header = xhr.getResponseHeader("Content-Encoding")) && header === "gzip";
    var chunkSize = 1024 * 1024;
    if (!hasByteServing) chunkSize = datalength;
    var doXHR = function(from, to) {
     if (from > to) throw new Error("invalid range (" + from + ", " + to + ") or no bytes requested!");
     if (to > datalength - 1) throw new Error("only " + datalength + " bytes available! programmer error!");
     var xhr = new XMLHttpRequest();
     xhr.open("GET", url, false);
     if (datalength !== chunkSize) xhr.setRequestHeader("Range", "bytes=" + from + "-" + to);
     if (typeof Uint8Array != "undefined") xhr.responseType = "arraybuffer";
     if (xhr.overrideMimeType) {
      xhr.overrideMimeType("text/plain; charset=x-user-defined");
     }
     xhr.send(null);
     if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
     if (xhr.response !== undefined) {
      return new Uint8Array(xhr.response || []);
     } else {
      return intArrayFromString(xhr.responseText || "", true);
     }
    };
    var lazyArray = this;
    lazyArray.setDataGetter(function(chunkNum) {
     var start = chunkNum * chunkSize;
     var end = (chunkNum + 1) * chunkSize - 1;
     end = Math.min(end, datalength - 1);
     if (typeof lazyArray.chunks[chunkNum] === "undefined") {
      lazyArray.chunks[chunkNum] = doXHR(start, end);
     }
     if (typeof lazyArray.chunks[chunkNum] === "undefined") throw new Error("doXHR failed!");
     return lazyArray.chunks[chunkNum];
    });
    if (usesGzip || !datalength) {
     chunkSize = datalength = 1;
     datalength = this.getter(0).length;
     chunkSize = datalength;
     out("LazyFiles on gzip forces download of the whole file when length is accessed");
    }
    this._length = datalength;
    this._chunkSize = chunkSize;
    this.lengthKnown = true;
   };
   if (typeof XMLHttpRequest !== "undefined") {
    if (!ENVIRONMENT_IS_WORKER) throw "Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc";
    var lazyArray = new LazyUint8Array();
    Object.defineProperties(lazyArray, {
     length: {
      get: function() {
       if (!this.lengthKnown) {
        this.cacheLength();
       }
       return this._length;
      }
     },
     chunkSize: {
      get: function() {
       if (!this.lengthKnown) {
        this.cacheLength();
       }
       return this._chunkSize;
      }
     }
    });
    var properties = {
     isDevice: false,
     contents: lazyArray
    };
   } else {
    var properties = {
     isDevice: false,
     url: url
    };
   }
   var node = FS.createFile(parent, name, properties, canRead, canWrite);
   if (properties.contents) {
    node.contents = properties.contents;
   } else if (properties.url) {
    node.contents = null;
    node.url = properties.url;
   }
   Object.defineProperties(node, {
    usedBytes: {
     get: function() {
      return this.contents.length;
     }
    }
   });
   var stream_ops = {};
   var keys = Object.keys(node.stream_ops);
   keys.forEach(function(key) {
    var fn = node.stream_ops[key];
    stream_ops[key] = function forceLoadLazyFile() {
     if (!FS.forceLoadFile(node)) {
      throw new FS.ErrnoError(29);
     }
     return fn.apply(null, arguments);
    };
   });
   stream_ops.read = function stream_ops_read(stream, buffer, offset, length, position) {
    if (!FS.forceLoadFile(node)) {
     throw new FS.ErrnoError(29);
    }
    var contents = stream.node.contents;
    if (position >= contents.length) return 0;
    var size = Math.min(contents.length - position, length);
    assert(size >= 0);
    if (contents.slice) {
     for (var i = 0; i < size; i++) {
      buffer[offset + i] = contents[position + i];
     }
    } else {
     for (var i = 0; i < size; i++) {
      buffer[offset + i] = contents.get(position + i);
     }
    }
    return size;
   };
   node.stream_ops = stream_ops;
   return node;
  },
  createPreloadedFile: function(parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile, canOwn, preFinish) {
   Browser.init();
   var fullname = name ? PATH_FS.resolve(PATH.join2(parent, name)) : parent;
   var dep = getUniqueRunDependency("cp " + fullname);
   function processData(byteArray) {
    function finish(byteArray) {
     if (preFinish) preFinish();
     if (!dontCreateFile) {
      FS.createDataFile(parent, name, byteArray, canRead, canWrite, canOwn);
     }
     if (onload) onload();
     removeRunDependency(dep);
    }
    var handled = false;
    Module["preloadPlugins"].forEach(function(plugin) {
     if (handled) return;
     if (plugin["canHandle"](fullname)) {
      plugin["handle"](byteArray, fullname, finish, function() {
       if (onerror) onerror();
       removeRunDependency(dep);
      });
      handled = true;
     }
    });
    if (!handled) finish(byteArray);
   }
   addRunDependency(dep);
   if (typeof url == "string") {
    Browser.asyncLoad(url, function(byteArray) {
     processData(byteArray);
    }, onerror);
   } else {
    processData(url);
   }
  },
  indexedDB: function() {
   return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
  },
  DB_NAME: function() {
   return "EM_FS_" + window.location.pathname;
  },
  DB_VERSION: 20,
  DB_STORE_NAME: "FILE_DATA",
  saveFilesToDB: function(paths, onload, onerror) {
   onload = onload || function() {};
   onerror = onerror || function() {};
   var indexedDB = FS.indexedDB();
   try {
    var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
   } catch (e) {
    return onerror(e);
   }
   openRequest.onupgradeneeded = function openRequest_onupgradeneeded() {
    out("creating db");
    var db = openRequest.result;
    db.createObjectStore(FS.DB_STORE_NAME);
   };
   openRequest.onsuccess = function openRequest_onsuccess() {
    var db = openRequest.result;
    var transaction = db.transaction([ FS.DB_STORE_NAME ], "readwrite");
    var files = transaction.objectStore(FS.DB_STORE_NAME);
    var ok = 0, fail = 0, total = paths.length;
    function finish() {
     if (fail == 0) onload(); else onerror();
    }
    paths.forEach(function(path) {
     var putRequest = files.put(FS.analyzePath(path).object.contents, path);
     putRequest.onsuccess = function putRequest_onsuccess() {
      ok++;
      if (ok + fail == total) finish();
     };
     putRequest.onerror = function putRequest_onerror() {
      fail++;
      if (ok + fail == total) finish();
     };
    });
    transaction.onerror = onerror;
   };
   openRequest.onerror = onerror;
  },
  loadFilesFromDB: function(paths, onload, onerror) {
   onload = onload || function() {};
   onerror = onerror || function() {};
   var indexedDB = FS.indexedDB();
   try {
    var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
   } catch (e) {
    return onerror(e);
   }
   openRequest.onupgradeneeded = onerror;
   openRequest.onsuccess = function openRequest_onsuccess() {
    var db = openRequest.result;
    try {
     var transaction = db.transaction([ FS.DB_STORE_NAME ], "readonly");
    } catch (e) {
     onerror(e);
     return;
    }
    var files = transaction.objectStore(FS.DB_STORE_NAME);
    var ok = 0, fail = 0, total = paths.length;
    function finish() {
     if (fail == 0) onload(); else onerror();
    }
    paths.forEach(function(path) {
     var getRequest = files.get(path);
     getRequest.onsuccess = function getRequest_onsuccess() {
      if (FS.analyzePath(path).exists) {
       FS.unlink(path);
      }
      FS.createDataFile(PATH.dirname(path), PATH.basename(path), getRequest.result, true, true, true);
      ok++;
      if (ok + fail == total) finish();
     };
     getRequest.onerror = function getRequest_onerror() {
      fail++;
      if (ok + fail == total) finish();
     };
    });
    transaction.onerror = onerror;
   };
   openRequest.onerror = onerror;
  }
 };
 var SYSCALLS = {
  mappings: {},
  DEFAULT_POLLMASK: 5,
  umask: 511,
  calculateAt: function(dirfd, path) {
   if (path[0] !== "/") {
    var dir;
    if (dirfd === -100) {
     dir = FS.cwd();
    } else {
     var dirstream = FS.getStream(dirfd);
     if (!dirstream) throw new FS.ErrnoError(8);
     dir = dirstream.path;
    }
    path = PATH.join2(dir, path);
   }
   return path;
  },
  doStat: function(func, path, buf) {
   try {
    var stat = func(path);
   } catch (e) {
    if (e && e.node && PATH.normalize(path) !== PATH.normalize(FS.getPath(e.node))) {
     return -54;
    }
    throw e;
   }
   GROWABLE_HEAP_I32()[buf >> 2] = stat.dev;
   GROWABLE_HEAP_I32()[buf + 4 >> 2] = 0;
   GROWABLE_HEAP_I32()[buf + 8 >> 2] = stat.ino;
   GROWABLE_HEAP_I32()[buf + 12 >> 2] = stat.mode;
   GROWABLE_HEAP_I32()[buf + 16 >> 2] = stat.nlink;
   GROWABLE_HEAP_I32()[buf + 20 >> 2] = stat.uid;
   GROWABLE_HEAP_I32()[buf + 24 >> 2] = stat.gid;
   GROWABLE_HEAP_I32()[buf + 28 >> 2] = stat.rdev;
   GROWABLE_HEAP_I32()[buf + 32 >> 2] = 0;
   tempI64 = [ stat.size >>> 0, (tempDouble = stat.size, +Math_abs(tempDouble) >= 1 ? tempDouble > 0 ? (Math_min(+Math_floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0 : ~~+Math_ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0) ],
   GROWABLE_HEAP_I32()[buf + 40 >> 2] = tempI64[0], GROWABLE_HEAP_I32()[buf + 44 >> 2] = tempI64[1];
   GROWABLE_HEAP_I32()[buf + 48 >> 2] = 4096;
   GROWABLE_HEAP_I32()[buf + 52 >> 2] = stat.blocks;
   GROWABLE_HEAP_I32()[buf + 56 >> 2] = stat.atime.getTime() / 1e3 | 0;
   GROWABLE_HEAP_I32()[buf + 60 >> 2] = 0;
   GROWABLE_HEAP_I32()[buf + 64 >> 2] = stat.mtime.getTime() / 1e3 | 0;
   GROWABLE_HEAP_I32()[buf + 68 >> 2] = 0;
   GROWABLE_HEAP_I32()[buf + 72 >> 2] = stat.ctime.getTime() / 1e3 | 0;
   GROWABLE_HEAP_I32()[buf + 76 >> 2] = 0;
   tempI64 = [ stat.ino >>> 0, (tempDouble = stat.ino, +Math_abs(tempDouble) >= 1 ? tempDouble > 0 ? (Math_min(+Math_floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0 : ~~+Math_ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0) ],
   GROWABLE_HEAP_I32()[buf + 80 >> 2] = tempI64[0], GROWABLE_HEAP_I32()[buf + 84 >> 2] = tempI64[1];
   return 0;
  },
  doMsync: function(addr, stream, len, flags, offset) {
   var buffer = GROWABLE_HEAP_U8().slice(addr, addr + len);
   FS.msync(stream, buffer, offset, len, flags);
  },
  doMkdir: function(path, mode) {
   path = PATH.normalize(path);
   if (path[path.length - 1] === "/") path = path.substr(0, path.length - 1);
   FS.mkdir(path, mode, 0);
   return 0;
  },
  doMknod: function(path, mode, dev) {
   switch (mode & 61440) {
   case 32768:
   case 8192:
   case 24576:
   case 4096:
   case 49152:
    break;

   default:
    return -28;
   }
   FS.mknod(path, mode, dev);
   return 0;
  },
  doReadlink: function(path, buf, bufsize) {
   if (bufsize <= 0) return -28;
   var ret = FS.readlink(path);
   var len = Math.min(bufsize, lengthBytesUTF8(ret));
   var endChar = GROWABLE_HEAP_I8()[buf + len];
   stringToUTF8(ret, buf, bufsize + 1);
   GROWABLE_HEAP_I8()[buf + len] = endChar;
   return len;
  },
  doAccess: function(path, amode) {
   if (amode & ~7) {
    return -28;
   }
   var node;
   var lookup = FS.lookupPath(path, {
    follow: true
   });
   node = lookup.node;
   if (!node) {
    return -44;
   }
   var perms = "";
   if (amode & 4) perms += "r";
   if (amode & 2) perms += "w";
   if (amode & 1) perms += "x";
   if (perms && FS.nodePermissions(node, perms)) {
    return -2;
   }
   return 0;
  },
  doDup: function(path, flags, suggestFD) {
   var suggest = FS.getStream(suggestFD);
   if (suggest) FS.close(suggest);
   return FS.open(path, flags, 0, suggestFD, suggestFD).fd;
  },
  doReadv: function(stream, iov, iovcnt, offset) {
   var ret = 0;
   for (var i = 0; i < iovcnt; i++) {
    var ptr = GROWABLE_HEAP_I32()[iov + i * 8 >> 2];
    var len = GROWABLE_HEAP_I32()[iov + (i * 8 + 4) >> 2];
    var curr = FS.read(stream, GROWABLE_HEAP_I8(), ptr, len, offset);
    if (curr < 0) return -1;
    ret += curr;
    if (curr < len) break;
   }
   return ret;
  },
  doWritev: function(stream, iov, iovcnt, offset) {
   var ret = 0;
   for (var i = 0; i < iovcnt; i++) {
    var ptr = GROWABLE_HEAP_I32()[iov + i * 8 >> 2];
    var len = GROWABLE_HEAP_I32()[iov + (i * 8 + 4) >> 2];
    var curr = FS.write(stream, GROWABLE_HEAP_I8(), ptr, len, offset);
    if (curr < 0) return -1;
    ret += curr;
   }
   return ret;
  },
  varargs: undefined,
  get: function() {
   assert(SYSCALLS.varargs != undefined);
   SYSCALLS.varargs += 4;
   var ret = GROWABLE_HEAP_I32()[SYSCALLS.varargs - 4 >> 2];
   return ret;
  },
  getStr: function(ptr) {
   var ret = UTF8ToString(ptr);
   return ret;
  },
  getStreamFromFD: function(fd) {
   var stream = FS.getStream(fd);
   if (!stream) throw new FS.ErrnoError(8);
   return stream;
  },
  get64: function(low, high) {
   if (low >= 0) assert(high === 0); else assert(high === -1);
   return low;
  }
 };
 function ___sys__newselect(nfds, readfds, writefds, exceptfds, timeout) {
  if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(1, 1, nfds, readfds, writefds, exceptfds, timeout);
  try {
   assert(nfds <= 64, "nfds must be less than or equal to 64");
   assert(!exceptfds, "exceptfds not supported");
   var total = 0;
   var srcReadLow = readfds ? GROWABLE_HEAP_I32()[readfds >> 2] : 0, srcReadHigh = readfds ? GROWABLE_HEAP_I32()[readfds + 4 >> 2] : 0;
   var srcWriteLow = writefds ? GROWABLE_HEAP_I32()[writefds >> 2] : 0, srcWriteHigh = writefds ? GROWABLE_HEAP_I32()[writefds + 4 >> 2] : 0;
   var srcExceptLow = exceptfds ? GROWABLE_HEAP_I32()[exceptfds >> 2] : 0, srcExceptHigh = exceptfds ? GROWABLE_HEAP_I32()[exceptfds + 4 >> 2] : 0;
   var dstReadLow = 0, dstReadHigh = 0;
   var dstWriteLow = 0, dstWriteHigh = 0;
   var dstExceptLow = 0, dstExceptHigh = 0;
   var allLow = (readfds ? GROWABLE_HEAP_I32()[readfds >> 2] : 0) | (writefds ? GROWABLE_HEAP_I32()[writefds >> 2] : 0) | (exceptfds ? GROWABLE_HEAP_I32()[exceptfds >> 2] : 0);
   var allHigh = (readfds ? GROWABLE_HEAP_I32()[readfds + 4 >> 2] : 0) | (writefds ? GROWABLE_HEAP_I32()[writefds + 4 >> 2] : 0) | (exceptfds ? GROWABLE_HEAP_I32()[exceptfds + 4 >> 2] : 0);
   var check = function(fd, low, high, val) {
    return fd < 32 ? low & val : high & val;
   };
   for (var fd = 0; fd < nfds; fd++) {
    var mask = 1 << fd % 32;
    if (!check(fd, allLow, allHigh, mask)) {
     continue;
    }
    var stream = FS.getStream(fd);
    if (!stream) throw new FS.ErrnoError(8);
    var flags = SYSCALLS.DEFAULT_POLLMASK;
    if (stream.stream_ops.poll) {
     flags = stream.stream_ops.poll(stream);
    }
    if (flags & 1 && check(fd, srcReadLow, srcReadHigh, mask)) {
     fd < 32 ? dstReadLow = dstReadLow | mask : dstReadHigh = dstReadHigh | mask;
     total++;
    }
    if (flags & 4 && check(fd, srcWriteLow, srcWriteHigh, mask)) {
     fd < 32 ? dstWriteLow = dstWriteLow | mask : dstWriteHigh = dstWriteHigh | mask;
     total++;
    }
    if (flags & 2 && check(fd, srcExceptLow, srcExceptHigh, mask)) {
     fd < 32 ? dstExceptLow = dstExceptLow | mask : dstExceptHigh = dstExceptHigh | mask;
     total++;
    }
   }
   if (readfds) {
    GROWABLE_HEAP_I32()[readfds >> 2] = dstReadLow;
    GROWABLE_HEAP_I32()[readfds + 4 >> 2] = dstReadHigh;
   }
   if (writefds) {
    GROWABLE_HEAP_I32()[writefds >> 2] = dstWriteLow;
    GROWABLE_HEAP_I32()[writefds + 4 >> 2] = dstWriteHigh;
   }
   if (exceptfds) {
    GROWABLE_HEAP_I32()[exceptfds >> 2] = dstExceptLow;
    GROWABLE_HEAP_I32()[exceptfds + 4 >> 2] = dstExceptHigh;
   }
   return total;
  } catch (e) {
   if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
   return -e.errno;
  }
 }
 function ___sys_access(path, amode) {
  if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(2, 1, path, amode);
  try {
   path = SYSCALLS.getStr(path);
   return SYSCALLS.doAccess(path, amode);
  } catch (e) {
   if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
   return -e.errno;
  }
 }
 function ___sys_fcntl64(fd, cmd, varargs) {
  if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(3, 1, fd, cmd, varargs);
  SYSCALLS.varargs = varargs;
  try {
   var stream = SYSCALLS.getStreamFromFD(fd);
   switch (cmd) {
   case 0:
    {
     var arg = SYSCALLS.get();
     if (arg < 0) {
      return -28;
     }
     var newStream;
     newStream = FS.open(stream.path, stream.flags, 0, arg);
     return newStream.fd;
    }

   case 1:
   case 2:
    return 0;

   case 3:
    return stream.flags;

   case 4:
    {
     var arg = SYSCALLS.get();
     stream.flags |= arg;
     return 0;
    }

   case 12:
    {
     var arg = SYSCALLS.get();
     var offset = 0;
     GROWABLE_HEAP_I16()[arg + offset >> 1] = 2;
     return 0;
    }

   case 13:
   case 14:
    return 0;

   case 16:
   case 8:
    return -28;

   case 9:
    setErrNo(28);
    return -1;

   default:
    {
     return -28;
    }
   }
  } catch (e) {
   if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
   return -e.errno;
  }
 }
 function ___sys_fstat64(fd, buf) {
  if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(4, 1, fd, buf);
  try {
   var stream = SYSCALLS.getStreamFromFD(fd);
   return SYSCALLS.doStat(FS.stat, stream.path, buf);
  } catch (e) {
   if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
   return -e.errno;
  }
 }
 function ___sys_getdents64(fd, dirp, count) {
  if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(5, 1, fd, dirp, count);
  try {
   var stream = SYSCALLS.getStreamFromFD(fd);
   if (!stream.getdents) {
    stream.getdents = FS.readdir(stream.path);
   }
   var struct_size = 280;
   var pos = 0;
   var off = FS.llseek(stream, 0, 1);
   var idx = Math.floor(off / struct_size);
   while (idx < stream.getdents.length && pos + struct_size <= count) {
    var id;
    var type;
    var name = stream.getdents[idx];
    if (name[0] === ".") {
     id = 1;
     type = 4;
    } else {
     var child = FS.lookupNode(stream.node, name);
     id = child.id;
     type = FS.isChrdev(child.mode) ? 2 : FS.isDir(child.mode) ? 4 : FS.isLink(child.mode) ? 10 : 8;
    }
    tempI64 = [ id >>> 0, (tempDouble = id, +Math_abs(tempDouble) >= 1 ? tempDouble > 0 ? (Math_min(+Math_floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0 : ~~+Math_ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0) ],
    GROWABLE_HEAP_I32()[dirp + pos >> 2] = tempI64[0], GROWABLE_HEAP_I32()[dirp + pos + 4 >> 2] = tempI64[1];
    tempI64 = [ (idx + 1) * struct_size >>> 0, (tempDouble = (idx + 1) * struct_size,
    +Math_abs(tempDouble) >= 1 ? tempDouble > 0 ? (Math_min(+Math_floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0 : ~~+Math_ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0) ],
    GROWABLE_HEAP_I32()[dirp + pos + 8 >> 2] = tempI64[0], GROWABLE_HEAP_I32()[dirp + pos + 12 >> 2] = tempI64[1];
    GROWABLE_HEAP_I16()[dirp + pos + 16 >> 1] = 280;
    GROWABLE_HEAP_I8()[dirp + pos + 18 >> 0] = type;
    stringToUTF8(name, dirp + pos + 19, 256);
    pos += struct_size;
    idx += 1;
   }
   FS.llseek(stream, idx * struct_size, 0);
   return pos;
  } catch (e) {
   if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
   return -e.errno;
  }
 }
 function ___sys_getrusage(who, usage) {
  if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(6, 1, who, usage);
  try {
   _memset(usage, 0, 136);
   GROWABLE_HEAP_I32()[usage >> 2] = 1;
   GROWABLE_HEAP_I32()[usage + 4 >> 2] = 2;
   GROWABLE_HEAP_I32()[usage + 8 >> 2] = 3;
   GROWABLE_HEAP_I32()[usage + 12 >> 2] = 4;
   return 0;
  } catch (e) {
   if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
   return -e.errno;
  }
 }
 function ___sys_ioctl(fd, op, varargs) {
  if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(7, 1, fd, op, varargs);
  SYSCALLS.varargs = varargs;
  try {
   var stream = SYSCALLS.getStreamFromFD(fd);
   switch (op) {
   case 21509:
   case 21505:
    {
     if (!stream.tty) return -59;
     return 0;
    }

   case 21510:
   case 21511:
   case 21512:
   case 21506:
   case 21507:
   case 21508:
    {
     if (!stream.tty) return -59;
     return 0;
    }

   case 21519:
    {
     if (!stream.tty) return -59;
     var argp = SYSCALLS.get();
     GROWABLE_HEAP_I32()[argp >> 2] = 0;
     return 0;
    }

   case 21520:
    {
     if (!stream.tty) return -59;
     return -28;
    }

   case 21531:
    {
     var argp = SYSCALLS.get();
     return FS.ioctl(stream, op, argp);
    }

   case 21523:
    {
     if (!stream.tty) return -59;
     return 0;
    }

   case 21524:
    {
     if (!stream.tty) return -59;
     return 0;
    }

   default:
    abort("bad ioctl syscall " + op);
   }
  } catch (e) {
   if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
   return -e.errno;
  }
 }
 function ___sys_lstat64(path, buf) {
  if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(8, 1, path, buf);
  try {
   path = SYSCALLS.getStr(path);
   return SYSCALLS.doStat(FS.lstat, path, buf);
  } catch (e) {
   if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
   return -e.errno;
  }
 }
 function ___sys_mkdir(path, mode) {
  if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(9, 1, path, mode);
  try {
   path = SYSCALLS.getStr(path);
   return SYSCALLS.doMkdir(path, mode);
  } catch (e) {
   if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
   return -e.errno;
  }
 }
 function syscallMmap2(addr, len, prot, flags, fd, off) {
  off <<= 12;
  var ptr;
  var allocated = false;
  if ((flags & 16) !== 0 && addr % 16384 !== 0) {
   return -28;
  }
  if ((flags & 32) !== 0) {
   ptr = _memalign(16384, len);
   if (!ptr) return -48;
   _memset(ptr, 0, len);
   allocated = true;
  } else {
   var info = FS.getStream(fd);
   if (!info) return -8;
   var res = FS.mmap(info, addr, len, off, prot, flags);
   ptr = res.ptr;
   allocated = res.allocated;
  }
  SYSCALLS.mappings[ptr] = {
   malloc: ptr,
   len: len,
   allocated: allocated,
   fd: fd,
   prot: prot,
   flags: flags,
   offset: off
  };
  return ptr;
 }
 function ___sys_mmap2(addr, len, prot, flags, fd, off) {
  if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(10, 1, addr, len, prot, flags, fd, off);
  try {
   return syscallMmap2(addr, len, prot, flags, fd, off);
  } catch (e) {
   if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
   return -e.errno;
  }
 }
 function syscallMunmap(addr, len) {
  if ((addr | 0) === -1 || len === 0) {
   return -28;
  }
  var info = SYSCALLS.mappings[addr];
  if (!info) return 0;
  if (len === info.len) {
   var stream = FS.getStream(info.fd);
   if (info.prot & 2) {
    SYSCALLS.doMsync(addr, stream, len, info.flags, info.offset);
   }
   FS.munmap(stream);
   SYSCALLS.mappings[addr] = null;
   if (info.allocated) {
    _free(info.malloc);
   }
  }
  return 0;
 }
 function ___sys_munmap(addr, len) {
  if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(11, 1, addr, len);
  try {
   return syscallMunmap(addr, len);
  } catch (e) {
   if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
   return -e.errno;
  }
 }
 function ___sys_open(path, flags, varargs) {
  if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(12, 1, path, flags, varargs);
  SYSCALLS.varargs = varargs;
  try {
   var pathname = SYSCALLS.getStr(path);
   var mode = SYSCALLS.get();
   var stream = FS.open(pathname, flags, mode);
   return stream.fd;
  } catch (e) {
   if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
   return -e.errno;
  }
 }
 function ___sys_poll(fds, nfds, timeout) {
  if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(13, 1, fds, nfds, timeout);
  try {
   var nonzero = 0;
   for (var i = 0; i < nfds; i++) {
    var pollfd = fds + 8 * i;
    var fd = GROWABLE_HEAP_I32()[pollfd >> 2];
    var events = GROWABLE_HEAP_I16()[pollfd + 4 >> 1];
    var mask = 32;
    var stream = FS.getStream(fd);
    if (stream) {
     mask = SYSCALLS.DEFAULT_POLLMASK;
     if (stream.stream_ops.poll) {
      mask = stream.stream_ops.poll(stream);
     }
    }
    mask &= events | 8 | 16;
    if (mask) nonzero++;
    GROWABLE_HEAP_I16()[pollfd + 6 >> 1] = mask;
   }
   return nonzero;
  } catch (e) {
   if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
   return -e.errno;
  }
 }
 function ___sys_prlimit64(pid, resource, new_limit, old_limit) {
  if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(14, 1, pid, resource, new_limit, old_limit);
  try {
   if (old_limit) {
    GROWABLE_HEAP_I32()[old_limit >> 2] = -1;
    GROWABLE_HEAP_I32()[old_limit + 4 >> 2] = -1;
    GROWABLE_HEAP_I32()[old_limit + 8 >> 2] = -1;
    GROWABLE_HEAP_I32()[old_limit + 12 >> 2] = -1;
   }
   return 0;
  } catch (e) {
   if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
   return -e.errno;
  }
 }
 function ___sys_read(fd, buf, count) {
  if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(15, 1, fd, buf, count);
  try {
   var stream = SYSCALLS.getStreamFromFD(fd);
   return FS.read(stream, GROWABLE_HEAP_I8(), buf, count);
  } catch (e) {
   if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
   return -e.errno;
  }
 }
 function ___sys_rename(old_path, new_path) {
  if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(16, 1, old_path, new_path);
  try {
   old_path = SYSCALLS.getStr(old_path);
   new_path = SYSCALLS.getStr(new_path);
   FS.rename(old_path, new_path);
   return 0;
  } catch (e) {
   if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
   return -e.errno;
  }
 }
 function ___sys_rmdir(path) {
  if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(17, 1, path);
  try {
   path = SYSCALLS.getStr(path);
   FS.rmdir(path);
   return 0;
  } catch (e) {
   if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
   return -e.errno;
  }
 }
 function ___sys_setrlimit(varargs) {
  return 0;
 }
 var SOCKFS = {
  mount: function(mount) {
   Module["websocket"] = Module["websocket"] && "object" === typeof Module["websocket"] ? Module["websocket"] : {};
   Module["websocket"]._callbacks = {};
   Module["websocket"]["on"] = function(event, callback) {
    if ("function" === typeof callback) {
     this._callbacks[event] = callback;
    }
    return this;
   };
   Module["websocket"].emit = function(event, param) {
    if ("function" === typeof this._callbacks[event]) {
     this._callbacks[event].call(this, param);
    }
   };
   return FS.createNode(null, "/", 16384 | 511, 0);
  },
  createSocket: function(family, type, protocol) {
   var streaming = type == 1;
   if (protocol) {
    assert(streaming == (protocol == 6));
   }
   var sock = {
    family: family,
    type: type,
    protocol: protocol,
    server: null,
    error: null,
    peers: {},
    pending: [],
    recv_queue: [],
    sock_ops: SOCKFS.websocket_sock_ops
   };
   var name = SOCKFS.nextname();
   var node = FS.createNode(SOCKFS.root, name, 49152, 0);
   node.sock = sock;
   var stream = FS.createStream({
    path: name,
    node: node,
    flags: FS.modeStringToFlags("r+"),
    seekable: false,
    stream_ops: SOCKFS.stream_ops
   });
   sock.stream = stream;
   return sock;
  },
  getSocket: function(fd) {
   var stream = FS.getStream(fd);
   if (!stream || !FS.isSocket(stream.node.mode)) {
    return null;
   }
   return stream.node.sock;
  },
  stream_ops: {
   poll: function(stream) {
    var sock = stream.node.sock;
    return sock.sock_ops.poll(sock);
   },
   ioctl: function(stream, request, varargs) {
    var sock = stream.node.sock;
    return sock.sock_ops.ioctl(sock, request, varargs);
   },
   read: function(stream, buffer, offset, length, position) {
    var sock = stream.node.sock;
    var msg = sock.sock_ops.recvmsg(sock, length);
    if (!msg) {
     return 0;
    }
    buffer.set(msg.buffer, offset);
    return msg.buffer.length;
   },
   write: function(stream, buffer, offset, length, position) {
    var sock = stream.node.sock;
    return sock.sock_ops.sendmsg(sock, buffer, offset, length);
   },
   close: function(stream) {
    var sock = stream.node.sock;
    sock.sock_ops.close(sock);
   }
  },
  nextname: function() {
   if (!SOCKFS.nextname.current) {
    SOCKFS.nextname.current = 0;
   }
   return "socket[" + SOCKFS.nextname.current++ + "]";
  },
  websocket_sock_ops: {
   createPeer: function(sock, addr, port) {
    var ws;
    if (typeof addr === "object") {
     ws = addr;
     addr = null;
     port = null;
    }
    if (ws) {
     if (ws._socket) {
      addr = ws._socket.remoteAddress;
      port = ws._socket.remotePort;
     } else {
      var result = /ws[s]?:\/\/([^:]+):(\d+)/.exec(ws.url);
      if (!result) {
       throw new Error("WebSocket URL must be in the format ws(s)://address:port");
      }
      addr = result[1];
      port = parseInt(result[2], 10);
     }
    } else {
     try {
      var runtimeConfig = Module["websocket"] && "object" === typeof Module["websocket"];
      var url = "ws:#".replace("#", "//");
      if (runtimeConfig) {
       if ("string" === typeof Module["websocket"]["url"]) {
        url = Module["websocket"]["url"];
       }
      }
      if (url === "ws://" || url === "wss://") {
       var parts = addr.split("/");
       url = url + parts[0] + ":" + port + "/" + parts.slice(1).join("/");
      }
      var subProtocols = "binary";
      if (runtimeConfig) {
       if ("string" === typeof Module["websocket"]["subprotocol"]) {
        subProtocols = Module["websocket"]["subprotocol"];
       }
      }
      var opts = undefined;
      if (subProtocols !== "null") {
       subProtocols = subProtocols.replace(/^ +| +$/g, "").split(/ *, */);
       opts = ENVIRONMENT_IS_NODE ? {
        "protocol": subProtocols.toString()
       } : subProtocols;
      }
      if (runtimeConfig && null === Module["websocket"]["subprotocol"]) {
       subProtocols = "null";
       opts = undefined;
      }
      var WebSocketConstructor;
      if (ENVIRONMENT_IS_NODE) {
       WebSocketConstructor = require("ws");
      } else {
       WebSocketConstructor = WebSocket;
      }
      ws = new WebSocketConstructor(url, opts);
      ws.binaryType = "arraybuffer";
     } catch (e) {
      throw new FS.ErrnoError(ERRNO_CODES.EHOSTUNREACH);
     }
    }
    var peer = {
     addr: addr,
     port: port,
     socket: ws,
     dgram_send_queue: []
    };
    SOCKFS.websocket_sock_ops.addPeer(sock, peer);
    SOCKFS.websocket_sock_ops.handlePeerEvents(sock, peer);
    if (sock.type === 2 && typeof sock.sport !== "undefined") {
     peer.dgram_send_queue.push(new Uint8Array([ 255, 255, 255, 255, "p".charCodeAt(0), "o".charCodeAt(0), "r".charCodeAt(0), "t".charCodeAt(0), (sock.sport & 65280) >> 8, sock.sport & 255 ]));
    }
    return peer;
   },
   getPeer: function(sock, addr, port) {
    return sock.peers[addr + ":" + port];
   },
   addPeer: function(sock, peer) {
    sock.peers[peer.addr + ":" + peer.port] = peer;
   },
   removePeer: function(sock, peer) {
    delete sock.peers[peer.addr + ":" + peer.port];
   },
   handlePeerEvents: function(sock, peer) {
    var first = true;
    var handleOpen = function() {
     Module["websocket"].emit("open", sock.stream.fd);
     try {
      var queued = peer.dgram_send_queue.shift();
      while (queued) {
       peer.socket.send(queued);
       queued = peer.dgram_send_queue.shift();
      }
     } catch (e) {
      peer.socket.close();
     }
    };
    function handleMessage(data) {
     if (typeof data === "string") {
      var encoder = new TextEncoder();
      data = encoder.encode(data);
     } else {
      assert(data.byteLength !== undefined);
      if (data.byteLength == 0) {
       return;
      } else {
       data = new Uint8Array(data);
      }
     }
     var wasfirst = first;
     first = false;
     if (wasfirst && data.length === 10 && data[0] === 255 && data[1] === 255 && data[2] === 255 && data[3] === 255 && data[4] === "p".charCodeAt(0) && data[5] === "o".charCodeAt(0) && data[6] === "r".charCodeAt(0) && data[7] === "t".charCodeAt(0)) {
      var newport = data[8] << 8 | data[9];
      SOCKFS.websocket_sock_ops.removePeer(sock, peer);
      peer.port = newport;
      SOCKFS.websocket_sock_ops.addPeer(sock, peer);
      return;
     }
     sock.recv_queue.push({
      addr: peer.addr,
      port: peer.port,
      data: data
     });
     Module["websocket"].emit("message", sock.stream.fd);
    }
    if (ENVIRONMENT_IS_NODE) {
     peer.socket.on("open", handleOpen);
     peer.socket.on("message", function(data, flags) {
      if (!flags.binary) {
       return;
      }
      handleMessage(new Uint8Array(data).buffer);
     });
     peer.socket.on("close", function() {
      Module["websocket"].emit("close", sock.stream.fd);
     });
     peer.socket.on("error", function(error) {
      sock.error = ERRNO_CODES.ECONNREFUSED;
      Module["websocket"].emit("error", [ sock.stream.fd, sock.error, "ECONNREFUSED: Connection refused" ]);
     });
    } else {
     peer.socket.onopen = handleOpen;
     peer.socket.onclose = function() {
      Module["websocket"].emit("close", sock.stream.fd);
     };
     peer.socket.onmessage = function peer_socket_onmessage(event) {
      handleMessage(event.data);
     };
     peer.socket.onerror = function(error) {
      sock.error = ERRNO_CODES.ECONNREFUSED;
      Module["websocket"].emit("error", [ sock.stream.fd, sock.error, "ECONNREFUSED: Connection refused" ]);
     };
    }
   },
   poll: function(sock) {
    if (sock.type === 1 && sock.server) {
     return sock.pending.length ? 64 | 1 : 0;
    }
    var mask = 0;
    var dest = sock.type === 1 ? SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport) : null;
    if (sock.recv_queue.length || !dest || dest && dest.socket.readyState === dest.socket.CLOSING || dest && dest.socket.readyState === dest.socket.CLOSED) {
     mask |= 64 | 1;
    }
    if (!dest || dest && dest.socket.readyState === dest.socket.OPEN) {
     mask |= 4;
    }
    if (dest && dest.socket.readyState === dest.socket.CLOSING || dest && dest.socket.readyState === dest.socket.CLOSED) {
     mask |= 16;
    }
    return mask;
   },
   ioctl: function(sock, request, arg) {
    switch (request) {
    case 21531:
     var bytes = 0;
     if (sock.recv_queue.length) {
      bytes = sock.recv_queue[0].data.length;
     }
     GROWABLE_HEAP_I32()[arg >> 2] = bytes;
     return 0;

    default:
     return ERRNO_CODES.EINVAL;
    }
   },
   close: function(sock) {
    if (sock.server) {
     try {
      sock.server.close();
     } catch (e) {}
     sock.server = null;
    }
    var peers = Object.keys(sock.peers);
    for (var i = 0; i < peers.length; i++) {
     var peer = sock.peers[peers[i]];
     try {
      peer.socket.close();
     } catch (e) {}
     SOCKFS.websocket_sock_ops.removePeer(sock, peer);
    }
    return 0;
   },
   bind: function(sock, addr, port) {
    if (typeof sock.saddr !== "undefined" || typeof sock.sport !== "undefined") {
     throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
    }
    sock.saddr = addr;
    sock.sport = port;
    if (sock.type === 2) {
     if (sock.server) {
      sock.server.close();
      sock.server = null;
     }
     try {
      sock.sock_ops.listen(sock, 0);
     } catch (e) {
      if (!(e instanceof FS.ErrnoError)) throw e;
      if (e.errno !== ERRNO_CODES.EOPNOTSUPP) throw e;
     }
    }
   },
   connect: function(sock, addr, port) {
    if (sock.server) {
     throw new FS.ErrnoError(ERRNO_CODES.EOPNOTSUPP);
    }
    if (typeof sock.daddr !== "undefined" && typeof sock.dport !== "undefined") {
     var dest = SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport);
     if (dest) {
      if (dest.socket.readyState === dest.socket.CONNECTING) {
       throw new FS.ErrnoError(ERRNO_CODES.EALREADY);
      } else {
       throw new FS.ErrnoError(ERRNO_CODES.EISCONN);
      }
     }
    }
    var peer = SOCKFS.websocket_sock_ops.createPeer(sock, addr, port);
    sock.daddr = peer.addr;
    sock.dport = peer.port;
    throw new FS.ErrnoError(ERRNO_CODES.EINPROGRESS);
   },
   listen: function(sock, backlog) {
    if (!ENVIRONMENT_IS_NODE) {
     throw new FS.ErrnoError(ERRNO_CODES.EOPNOTSUPP);
    }
    if (sock.server) {
     throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
    }
    var WebSocketServer = require("ws").Server;
    var host = sock.saddr;
    sock.server = new WebSocketServer({
     host: host,
     port: sock.sport
    });
    Module["websocket"].emit("listen", sock.stream.fd);
    sock.server.on("connection", function(ws) {
     if (sock.type === 1) {
      var newsock = SOCKFS.createSocket(sock.family, sock.type, sock.protocol);
      var peer = SOCKFS.websocket_sock_ops.createPeer(newsock, ws);
      newsock.daddr = peer.addr;
      newsock.dport = peer.port;
      sock.pending.push(newsock);
      Module["websocket"].emit("connection", newsock.stream.fd);
     } else {
      SOCKFS.websocket_sock_ops.createPeer(sock, ws);
      Module["websocket"].emit("connection", sock.stream.fd);
     }
    });
    sock.server.on("closed", function() {
     Module["websocket"].emit("close", sock.stream.fd);
     sock.server = null;
    });
    sock.server.on("error", function(error) {
     sock.error = ERRNO_CODES.EHOSTUNREACH;
     Module["websocket"].emit("error", [ sock.stream.fd, sock.error, "EHOSTUNREACH: Host is unreachable" ]);
    });
   },
   accept: function(listensock) {
    if (!listensock.server) {
     throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
    }
    var newsock = listensock.pending.shift();
    newsock.stream.flags = listensock.stream.flags;
    return newsock;
   },
   getname: function(sock, peer) {
    var addr, port;
    if (peer) {
     if (sock.daddr === undefined || sock.dport === undefined) {
      throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
     }
     addr = sock.daddr;
     port = sock.dport;
    } else {
     addr = sock.saddr || 0;
     port = sock.sport || 0;
    }
    return {
     addr: addr,
     port: port
    };
   },
   sendmsg: function(sock, buffer, offset, length, addr, port) {
    if (sock.type === 2) {
     if (addr === undefined || port === undefined) {
      addr = sock.daddr;
      port = sock.dport;
     }
     if (addr === undefined || port === undefined) {
      throw new FS.ErrnoError(ERRNO_CODES.EDESTADDRREQ);
     }
    } else {
     addr = sock.daddr;
     port = sock.dport;
    }
    var dest = SOCKFS.websocket_sock_ops.getPeer(sock, addr, port);
    if (sock.type === 1) {
     if (!dest || dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
      throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
     } else if (dest.socket.readyState === dest.socket.CONNECTING) {
      throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
     }
    }
    if (ArrayBuffer.isView(buffer)) {
     offset += buffer.byteOffset;
     buffer = buffer.buffer;
    }
    var data;
    if (buffer instanceof SharedArrayBuffer) {
     data = new Uint8Array(new Uint8Array(buffer.slice(offset, offset + length))).buffer;
    } else {
     data = buffer.slice(offset, offset + length);
    }
    if (sock.type === 2) {
     if (!dest || dest.socket.readyState !== dest.socket.OPEN) {
      if (!dest || dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
       dest = SOCKFS.websocket_sock_ops.createPeer(sock, addr, port);
      }
      dest.dgram_send_queue.push(data);
      return length;
     }
    }
    try {
     dest.socket.send(data);
     return length;
    } catch (e) {
     throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
    }
   },
   recvmsg: function(sock, length) {
    if (sock.type === 1 && sock.server) {
     throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
    }
    var queued = sock.recv_queue.shift();
    if (!queued) {
     if (sock.type === 1) {
      var dest = SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport);
      if (!dest) {
       throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
      } else if (dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
       return null;
      } else {
       throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
      }
     } else {
      throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
     }
    }
    var queuedLength = queued.data.byteLength || queued.data.length;
    var queuedOffset = queued.data.byteOffset || 0;
    var queuedBuffer = queued.data.buffer || queued.data;
    var bytesRead = Math.min(length, queuedLength);
    var res = {
     buffer: new Uint8Array(queuedBuffer, queuedOffset, bytesRead),
     addr: queued.addr,
     port: queued.port
    };
    if (sock.type === 1 && bytesRead < queuedLength) {
     var bytesRemaining = queuedLength - bytesRead;
     queued.data = new Uint8Array(queuedBuffer, queuedOffset + bytesRead, bytesRemaining);
     sock.recv_queue.unshift(queued);
    }
    return res;
   }
  }
 };
 function __inet_pton4_raw(str) {
  var b = str.split(".");
  for (var i = 0; i < 4; i++) {
   var tmp = Number(b[i]);
   if (isNaN(tmp)) return null;
   b[i] = tmp;
  }
  return (b[0] | b[1] << 8 | b[2] << 16 | b[3] << 24) >>> 0;
 }
 function jstoi_q(str) {
  return parseInt(str);
 }
 function __inet_pton6_raw(str) {
  var words;
  var w, offset, z, i;
  var valid6regx = /^((?=.*::)(?!.*::.+::)(::)?([\dA-F]{1,4}:(:|\b)|){5}|([\dA-F]{1,4}:){6})((([\dA-F]{1,4}((?!\3)::|:\b|$))|(?!\2\3)){2}|(((2[0-4]|1\d|[1-9])?\d|25[0-5])\.?\b){4})$/i;
  var parts = [];
  if (!valid6regx.test(str)) {
   return null;
  }
  if (str === "::") {
   return [ 0, 0, 0, 0, 0, 0, 0, 0 ];
  }
  if (str.indexOf("::") === 0) {
   str = str.replace("::", "Z:");
  } else {
   str = str.replace("::", ":Z:");
  }
  if (str.indexOf(".") > 0) {
   str = str.replace(new RegExp("[.]", "g"), ":");
   words = str.split(":");
   words[words.length - 4] = jstoi_q(words[words.length - 4]) + jstoi_q(words[words.length - 3]) * 256;
   words[words.length - 3] = jstoi_q(words[words.length - 2]) + jstoi_q(words[words.length - 1]) * 256;
   words = words.slice(0, words.length - 2);
  } else {
   words = str.split(":");
  }
  offset = 0;
  z = 0;
  for (w = 0; w < words.length; w++) {
   if (typeof words[w] === "string") {
    if (words[w] === "Z") {
     for (z = 0; z < 8 - words.length + 1; z++) {
      parts[w + z] = 0;
     }
     offset = z - 1;
    } else {
     parts[w + offset] = _htons(parseInt(words[w], 16));
    }
   } else {
    parts[w + offset] = words[w];
   }
  }
  return [ parts[1] << 16 | parts[0], parts[3] << 16 | parts[2], parts[5] << 16 | parts[4], parts[7] << 16 | parts[6] ];
 }
 var DNS = {
  address_map: {
   id: 1,
   addrs: {},
   names: {}
  },
  lookup_name: function(name) {
   var res = __inet_pton4_raw(name);
   if (res !== null) {
    return name;
   }
   res = __inet_pton6_raw(name);
   if (res !== null) {
    return name;
   }
   var addr;
   if (DNS.address_map.addrs[name]) {
    addr = DNS.address_map.addrs[name];
   } else {
    var id = DNS.address_map.id++;
    assert(id < 65535, "exceeded max address mappings of 65535");
    addr = "172.29." + (id & 255) + "." + (id & 65280);
    DNS.address_map.names[addr] = name;
    DNS.address_map.addrs[name] = addr;
   }
   return addr;
  },
  lookup_addr: function(addr) {
   if (DNS.address_map.names[addr]) {
    return DNS.address_map.names[addr];
   }
   return null;
  }
 };
 var Sockets = {
  BUFFER_SIZE: 10240,
  MAX_BUFFER_SIZE: 10485760,
  nextFd: 1,
  fds: {},
  nextport: 1,
  maxport: 65535,
  peer: null,
  connections: {},
  portmap: {},
  localAddr: 4261412874,
  addrPool: [ 33554442, 50331658, 67108874, 83886090, 100663306, 117440522, 134217738, 150994954, 167772170, 184549386, 201326602, 218103818, 234881034 ]
 };
 function __inet_ntop4_raw(addr) {
  return (addr & 255) + "." + (addr >> 8 & 255) + "." + (addr >> 16 & 255) + "." + (addr >> 24 & 255);
 }
 function __inet_ntop6_raw(ints) {
  var str = "";
  var word = 0;
  var longest = 0;
  var lastzero = 0;
  var zstart = 0;
  var len = 0;
  var i = 0;
  var parts = [ ints[0] & 65535, ints[0] >> 16, ints[1] & 65535, ints[1] >> 16, ints[2] & 65535, ints[2] >> 16, ints[3] & 65535, ints[3] >> 16 ];
  var hasipv4 = true;
  var v4part = "";
  for (i = 0; i < 5; i++) {
   if (parts[i] !== 0) {
    hasipv4 = false;
    break;
   }
  }
  if (hasipv4) {
   v4part = __inet_ntop4_raw(parts[6] | parts[7] << 16);
   if (parts[5] === -1) {
    str = "::ffff:";
    str += v4part;
    return str;
   }
   if (parts[5] === 0) {
    str = "::";
    if (v4part === "0.0.0.0") v4part = "";
    if (v4part === "0.0.0.1") v4part = "1";
    str += v4part;
    return str;
   }
  }
  for (word = 0; word < 8; word++) {
   if (parts[word] === 0) {
    if (word - lastzero > 1) {
     len = 0;
    }
    lastzero = word;
    len++;
   }
   if (len > longest) {
    longest = len;
    zstart = word - longest + 1;
   }
  }
  for (word = 0; word < 8; word++) {
   if (longest > 1) {
    if (parts[word] === 0 && word >= zstart && word < zstart + longest) {
     if (word === zstart) {
      str += ":";
      if (zstart === 0) str += ":";
     }
     continue;
    }
   }
   str += Number(_ntohs(parts[word] & 65535)).toString(16);
   str += word < 7 ? ":" : "";
  }
  return str;
 }
 function __read_sockaddr(sa, salen) {
  var family = GROWABLE_HEAP_I16()[sa >> 1];
  var port = _ntohs(GROWABLE_HEAP_U16()[sa + 2 >> 1]);
  var addr;
  switch (family) {
  case 2:
   if (salen !== 16) {
    return {
     errno: 28
    };
   }
   addr = GROWABLE_HEAP_I32()[sa + 4 >> 2];
   addr = __inet_ntop4_raw(addr);
   break;

  case 10:
   if (salen !== 28) {
    return {
     errno: 28
    };
   }
   addr = [ GROWABLE_HEAP_I32()[sa + 8 >> 2], GROWABLE_HEAP_I32()[sa + 12 >> 2], GROWABLE_HEAP_I32()[sa + 16 >> 2], GROWABLE_HEAP_I32()[sa + 20 >> 2] ];
   addr = __inet_ntop6_raw(addr);
   break;

  default:
   return {
    errno: 5
   };
  }
  return {
   family: family,
   addr: addr,
   port: port
  };
 }
 function __write_sockaddr(sa, family, addr, port) {
  switch (family) {
  case 2:
   addr = __inet_pton4_raw(addr);
   GROWABLE_HEAP_I16()[sa >> 1] = family;
   GROWABLE_HEAP_I32()[sa + 4 >> 2] = addr;
   GROWABLE_HEAP_I16()[sa + 2 >> 1] = _htons(port);
   break;

  case 10:
   addr = __inet_pton6_raw(addr);
   GROWABLE_HEAP_I32()[sa >> 2] = family;
   GROWABLE_HEAP_I32()[sa + 8 >> 2] = addr[0];
   GROWABLE_HEAP_I32()[sa + 12 >> 2] = addr[1];
   GROWABLE_HEAP_I32()[sa + 16 >> 2] = addr[2];
   GROWABLE_HEAP_I32()[sa + 20 >> 2] = addr[3];
   GROWABLE_HEAP_I16()[sa + 2 >> 1] = _htons(port);
   GROWABLE_HEAP_I32()[sa + 4 >> 2] = 0;
   GROWABLE_HEAP_I32()[sa + 24 >> 2] = 0;
   break;

  default:
   return {
    errno: 5
   };
  }
  return {};
 }
 function ___sys_socketcall(call, socketvararg) {
  if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(18, 1, call, socketvararg);
  try {
   SYSCALLS.varargs = socketvararg;
   var getSocketFromFD = function() {
    var socket = SOCKFS.getSocket(SYSCALLS.get());
    if (!socket) throw new FS.ErrnoError(8);
    return socket;
   };
   var getSocketAddress = function(allowNull) {
    var addrp = SYSCALLS.get(), addrlen = SYSCALLS.get();
    if (allowNull && addrp === 0) return null;
    var info = __read_sockaddr(addrp, addrlen);
    if (info.errno) throw new FS.ErrnoError(info.errno);
    info.addr = DNS.lookup_addr(info.addr) || info.addr;
    return info;
   };
   switch (call) {
   case 1:
    {
     var domain = SYSCALLS.get(), type = SYSCALLS.get(), protocol = SYSCALLS.get();
     var sock = SOCKFS.createSocket(domain, type, protocol);
     assert(sock.stream.fd < 64);
     return sock.stream.fd;
    }

   case 2:
    {
     var sock = getSocketFromFD(), info = getSocketAddress();
     sock.sock_ops.bind(sock, info.addr, info.port);
     return 0;
    }

   case 3:
    {
     var sock = getSocketFromFD(), info = getSocketAddress();
     sock.sock_ops.connect(sock, info.addr, info.port);
     return 0;
    }

   case 4:
    {
     var sock = getSocketFromFD(), backlog = SYSCALLS.get();
     sock.sock_ops.listen(sock, backlog);
     return 0;
    }

   case 5:
    {
     var sock = getSocketFromFD(), addr = SYSCALLS.get(), addrlen = SYSCALLS.get();
     var newsock = sock.sock_ops.accept(sock);
     if (addr) {
      var res = __write_sockaddr(addr, newsock.family, DNS.lookup_name(newsock.daddr), newsock.dport);
      assert(!res.errno);
     }
     return newsock.stream.fd;
    }

   case 6:
    {
     var sock = getSocketFromFD(), addr = SYSCALLS.get(), addrlen = SYSCALLS.get();
     var res = __write_sockaddr(addr, sock.family, DNS.lookup_name(sock.saddr || "0.0.0.0"), sock.sport);
     assert(!res.errno);
     return 0;
    }

   case 7:
    {
     var sock = getSocketFromFD(), addr = SYSCALLS.get(), addrlen = SYSCALLS.get();
     if (!sock.daddr) {
      return -53;
     }
     var res = __write_sockaddr(addr, sock.family, DNS.lookup_name(sock.daddr), sock.dport);
     assert(!res.errno);
     return 0;
    }

   case 11:
    {
     var sock = getSocketFromFD(), message = SYSCALLS.get(), length = SYSCALLS.get(), flags = SYSCALLS.get(), dest = getSocketAddress(true);
     if (!dest) {
      return FS.write(sock.stream, GROWABLE_HEAP_I8(), message, length);
     } else {
      return sock.sock_ops.sendmsg(sock, GROWABLE_HEAP_I8(), message, length, dest.addr, dest.port);
     }
    }

   case 12:
    {
     var sock = getSocketFromFD(), buf = SYSCALLS.get(), len = SYSCALLS.get(), flags = SYSCALLS.get(), addr = SYSCALLS.get(), addrlen = SYSCALLS.get();
     var msg = sock.sock_ops.recvmsg(sock, len);
     if (!msg) return 0;
     if (addr) {
      var res = __write_sockaddr(addr, sock.family, DNS.lookup_name(msg.addr), msg.port);
      assert(!res.errno);
     }
     GROWABLE_HEAP_U8().set(msg.buffer, buf);
     return msg.buffer.byteLength;
    }

   case 14:
    {
     return -50;
    }

   case 15:
    {
     var sock = getSocketFromFD(), level = SYSCALLS.get(), optname = SYSCALLS.get(), optval = SYSCALLS.get(), optlen = SYSCALLS.get();
     if (level === 1) {
      if (optname === 4) {
       GROWABLE_HEAP_I32()[optval >> 2] = sock.error;
       GROWABLE_HEAP_I32()[optlen >> 2] = 4;
       sock.error = null;
       return 0;
      }
     }
     return -50;
    }

   case 16:
    {
     var sock = getSocketFromFD(), message = SYSCALLS.get(), flags = SYSCALLS.get();
     var iov = GROWABLE_HEAP_I32()[message + 8 >> 2];
     var num = GROWABLE_HEAP_I32()[message + 12 >> 2];
     var addr, port;
     var name = GROWABLE_HEAP_I32()[message >> 2];
     var namelen = GROWABLE_HEAP_I32()[message + 4 >> 2];
     if (name) {
      var info = __read_sockaddr(name, namelen);
      if (info.errno) return -info.errno;
      port = info.port;
      addr = DNS.lookup_addr(info.addr) || info.addr;
     }
     var total = 0;
     for (var i = 0; i < num; i++) {
      total += GROWABLE_HEAP_I32()[iov + (8 * i + 4) >> 2];
     }
     var view = new Uint8Array(total);
     var offset = 0;
     for (var i = 0; i < num; i++) {
      var iovbase = GROWABLE_HEAP_I32()[iov + (8 * i + 0) >> 2];
      var iovlen = GROWABLE_HEAP_I32()[iov + (8 * i + 4) >> 2];
      for (var j = 0; j < iovlen; j++) {
       view[offset++] = GROWABLE_HEAP_I8()[iovbase + j >> 0];
      }
     }
     return sock.sock_ops.sendmsg(sock, view, 0, total, addr, port);
    }

   case 17:
    {
     var sock = getSocketFromFD(), message = SYSCALLS.get(), flags = SYSCALLS.get();
     var iov = GROWABLE_HEAP_I32()[message + 8 >> 2];
     var num = GROWABLE_HEAP_I32()[message + 12 >> 2];
     var total = 0;
     for (var i = 0; i < num; i++) {
      total += GROWABLE_HEAP_I32()[iov + (8 * i + 4) >> 2];
     }
     var msg = sock.sock_ops.recvmsg(sock, total);
     if (!msg) return 0;
     var name = GROWABLE_HEAP_I32()[message >> 2];
     if (name) {
      var res = __write_sockaddr(name, sock.family, DNS.lookup_name(msg.addr), msg.port);
      assert(!res.errno);
     }
     var bytesRead = 0;
     var bytesRemaining = msg.buffer.byteLength;
     for (var i = 0; bytesRemaining > 0 && i < num; i++) {
      var iovbase = GROWABLE_HEAP_I32()[iov + (8 * i + 0) >> 2];
      var iovlen = GROWABLE_HEAP_I32()[iov + (8 * i + 4) >> 2];
      if (!iovlen) {
       continue;
      }
      var length = Math.min(iovlen, bytesRemaining);
      var buf = msg.buffer.subarray(bytesRead, bytesRead + length);
      GROWABLE_HEAP_U8().set(buf, iovbase + bytesRead);
      bytesRead += length;
      bytesRemaining -= length;
     }
     return bytesRead;
    }

   default:
    {
     return -52;
    }
   }
  } catch (e) {
   if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
   return -e.errno;
  }
 }
 function ___sys_stat64(path, buf) {
  if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(19, 1, path, buf);
  try {
   path = SYSCALLS.getStr(path);
   return SYSCALLS.doStat(FS.stat, path, buf);
  } catch (e) {
   if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
   return -e.errno;
  }
 }
 function ___sys_uname(buf) {
  try {
   if (!buf) return -21;
   var layout = {
    "__size__": 390,
    "sysname": 0,
    "nodename": 65,
    "release": 130,
    "version": 195,
    "machine": 260,
    "domainname": 325
   };
   var copyString = function(element, value) {
    var offset = layout[element];
    writeAsciiToMemory(value, buf + offset);
   };
   copyString("sysname", "Emscripten");
   copyString("nodename", "emscripten");
   copyString("release", "1.0");
   copyString("version", "#1");
   copyString("machine", "x86-JS");
   return 0;
  } catch (e) {
   if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
   return -e.errno;
  }
 }
 function ___sys_unlink(path) {
  if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(20, 1, path);
  try {
   path = SYSCALLS.getStr(path);
   FS.unlink(path);
   return 0;
  } catch (e) {
   if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
   return -e.errno;
  }
 }
 function __emscripten_notify_thread_queue(targetThreadId, mainThreadId) {
  if (targetThreadId == mainThreadId) {
   postMessage({
    "cmd": "processQueuedMainThreadWork"
   });
  } else if (ENVIRONMENT_IS_PTHREAD) {
   postMessage({
    "targetThread": targetThreadId,
    "cmd": "processThreadQueue"
   });
  } else {
   var pthread = PThread.pthreads[targetThreadId];
   var worker = pthread && pthread.worker;
   if (!worker) {
    err("Cannot send message to thread with ID " + targetThreadId + ", unknown thread ID!");
    return;
   }
   worker.postMessage({
    "cmd": "processThreadQueue"
   });
  }
  return 1;
 }
 function _abort() {
  abort();
 }
 function _clock() {
  if (_clock.start === undefined) _clock.start = Date.now();
  return (Date.now() - _clock.start) * (1e6 / 1e3) | 0;
 }
 function _emscripten_conditional_set_current_thread_status_js(expectedStatus, newStatus) {}
 function _emscripten_conditional_set_current_thread_status(expectedStatus, newStatus) {
  expectedStatus = expectedStatus | 0;
  newStatus = newStatus | 0;
 }
 function _emscripten_futex_wait(addr, val, timeout) {
  if (addr <= 0 || addr > GROWABLE_HEAP_I8().length || addr & 3 != 0) return -28;
  if (ENVIRONMENT_IS_WORKER) {
   var ret = Atomics.wait(GROWABLE_HEAP_I32(), addr >> 2, val, timeout);
   if (ret === "timed-out") return -73;
   if (ret === "not-equal") return -6;
   if (ret === "ok") return 0;
   throw "Atomics.wait returned an unexpected value " + ret;
  } else {
   var loadedVal = Atomics.load(GROWABLE_HEAP_I32(), addr >> 2);
   if (val != loadedVal) return -6;
   var tNow = performance.now();
   var tEnd = tNow + timeout;
   Atomics.store(GROWABLE_HEAP_I32(), __main_thread_futex_wait_address >> 2, addr);
   var ourWaitAddress = addr;
   while (addr == ourWaitAddress) {
    tNow = performance.now();
    if (tNow > tEnd) {
     return -73;
    }
    _emscripten_main_thread_process_queued_calls();
    addr = Atomics.load(GROWABLE_HEAP_I32(), __main_thread_futex_wait_address >> 2);
   }
   return 0;
  }
 }
 function _emscripten_get_sbrk_ptr() {
  return 14216096;
 }
 function _emscripten_is_main_browser_thread() {
  return __pthread_is_main_browser_thread | 0;
 }
 function _emscripten_is_main_runtime_thread() {
  return __pthread_is_main_runtime_thread | 0;
 }
 function _emscripten_memcpy_big(dest, src, num) {
  GROWABLE_HEAP_U8().copyWithin(dest, src, src + num);
 }
 function _emscripten_proxy_to_main_thread_js(index, sync) {
  var numCallArgs = arguments.length - 2;
  if (numCallArgs > 20 - 1) throw "emscripten_proxy_to_main_thread_js: Too many arguments " + numCallArgs + " to proxied function idx=" + index + ", maximum supported is " + (20 - 1) + "!";
  var stack = stackSave();
  var args = stackAlloc(numCallArgs * 8);
  var b = args >> 3;
  for (var i = 0; i < numCallArgs; i++) {
   GROWABLE_HEAP_F64()[b + i] = arguments[2 + i];
  }
  var ret = _emscripten_run_in_main_runtime_thread_js(index, numCallArgs, args, sync);
  stackRestore(stack);
  return ret;
 }
 var _emscripten_receive_on_main_thread_js_callArgs = [];
 var __readAsmConstArgsArray = [];
 function readAsmConstArgs(sigPtr, buf) {
  assert(Array.isArray(__readAsmConstArgsArray));
  assert(buf % 4 == 0);
  __readAsmConstArgsArray.length = 0;
  var ch;
  buf >>= 2;
  while (ch = GROWABLE_HEAP_U8()[sigPtr++]) {
   assert(ch === 100 || ch === 102 || ch === 105);
   __readAsmConstArgsArray.push(ch < 105 ? GROWABLE_HEAP_F64()[++buf >> 1] : GROWABLE_HEAP_I32()[buf]);
   ++buf;
  }
  return __readAsmConstArgsArray;
 }
 function _emscripten_receive_on_main_thread_js(index, numCallArgs, args) {
  _emscripten_receive_on_main_thread_js_callArgs.length = numCallArgs;
  var b = args >> 3;
  for (var i = 0; i < numCallArgs; i++) {
   _emscripten_receive_on_main_thread_js_callArgs[i] = GROWABLE_HEAP_F64()[b + i];
  }
  var isEmAsmConst = index < 0;
  var func = !isEmAsmConst ? proxiedFunctionTable[index] : ASM_CONSTS[-index - 1];
  if (isEmAsmConst) {
   var sigPtr = _emscripten_receive_on_main_thread_js_callArgs[1];
   var varargPtr = _emscripten_receive_on_main_thread_js_callArgs[2];
   var constArgs = readAsmConstArgs(sigPtr, varargPtr);
   return func.apply(null, constArgs);
  }
  assert(func.length == numCallArgs, "Call args mismatch in emscripten_receive_on_main_thread_js");
  return func.apply(null, _emscripten_receive_on_main_thread_js_callArgs);
 }
 function _emscripten_get_heap_size() {
  return GROWABLE_HEAP_U8().length;
 }
 function emscripten_realloc_buffer(size) {
  try {
   wasmMemory.grow(size - buffer.byteLength + 65535 >>> 16);
   updateGlobalBufferAndViews(wasmMemory.buffer);
   return 1;
  } catch (e) {
   console.error("emscripten_realloc_buffer: Attempted to grow heap from " + buffer.byteLength + " bytes to " + size + " bytes, but got error: " + e);
  }
 }
 function _emscripten_resize_heap(requestedSize) {
  requestedSize = requestedSize >>> 0;
  var oldSize = _emscripten_get_heap_size();
  if (requestedSize <= oldSize) {
   return false;
  }
  var PAGE_MULTIPLE = 65536;
  var maxHeapSize = 2147483648;
  if (requestedSize > maxHeapSize) {
   err("Cannot enlarge memory, asked to go up to " + requestedSize + " bytes, but the limit is " + maxHeapSize + " bytes!");
   return false;
  }
  var minHeapSize = 16777216;
  for (var cutDown = 1; cutDown <= 4; cutDown *= 2) {
   var overGrownHeapSize = oldSize * (1 + .2 / cutDown);
   overGrownHeapSize = Math.min(overGrownHeapSize, requestedSize + 100663296);
   var newSize = Math.min(maxHeapSize, alignUp(Math.max(minHeapSize, requestedSize, overGrownHeapSize), PAGE_MULTIPLE));
   var replacement = emscripten_realloc_buffer(newSize);
   if (replacement) {
    return true;
   }
  }
  err("Failed to grow the heap from " + oldSize + " bytes to " + newSize + " bytes, not enough memory!");
  return false;
 }
 var JSEvents = {
  removeAllEventListeners: function() {
   for (var i = JSEvents.eventHandlers.length - 1; i >= 0; --i) {
    JSEvents._removeHandler(i);
   }
   JSEvents.eventHandlers = [];
   JSEvents.deferredCalls = [];
  },
  registerRemoveEventListeners: function() {
   if (!JSEvents.removeEventListenersRegistered) {
    __ATEXIT__.push(JSEvents.removeAllEventListeners);
    JSEvents.removeEventListenersRegistered = true;
   }
  },
  deferredCalls: [],
  deferCall: function(targetFunction, precedence, argsList) {
   function arraysHaveEqualContent(arrA, arrB) {
    if (arrA.length != arrB.length) return false;
    for (var i in arrA) {
     if (arrA[i] != arrB[i]) return false;
    }
    return true;
   }
   for (var i in JSEvents.deferredCalls) {
    var call = JSEvents.deferredCalls[i];
    if (call.targetFunction == targetFunction && arraysHaveEqualContent(call.argsList, argsList)) {
     return;
    }
   }
   JSEvents.deferredCalls.push({
    targetFunction: targetFunction,
    precedence: precedence,
    argsList: argsList
   });
   JSEvents.deferredCalls.sort(function(x, y) {
    return x.precedence < y.precedence;
   });
  },
  removeDeferredCalls: function(targetFunction) {
   for (var i = 0; i < JSEvents.deferredCalls.length; ++i) {
    if (JSEvents.deferredCalls[i].targetFunction == targetFunction) {
     JSEvents.deferredCalls.splice(i, 1);
     --i;
    }
   }
  },
  canPerformEventHandlerRequests: function() {
   return JSEvents.inEventHandler && JSEvents.currentEventHandler.allowsDeferredCalls;
  },
  runDeferredCalls: function() {
   if (!JSEvents.canPerformEventHandlerRequests()) {
    return;
   }
   for (var i = 0; i < JSEvents.deferredCalls.length; ++i) {
    var call = JSEvents.deferredCalls[i];
    JSEvents.deferredCalls.splice(i, 1);
    --i;
    call.targetFunction.apply(null, call.argsList);
   }
  },
  eventHandlers: [],
  removeAllHandlersOnTarget: function(target, eventTypeString) {
   for (var i = 0; i < JSEvents.eventHandlers.length; ++i) {
    if (JSEvents.eventHandlers[i].target == target && (!eventTypeString || eventTypeString == JSEvents.eventHandlers[i].eventTypeString)) {
     JSEvents._removeHandler(i--);
    }
   }
  },
  _removeHandler: function(i) {
   var h = JSEvents.eventHandlers[i];
   h.target.removeEventListener(h.eventTypeString, h.eventListenerFunc, h.useCapture);
   JSEvents.eventHandlers.splice(i, 1);
  },
  registerOrRemoveHandler: function(eventHandler) {
   var jsEventHandler = function jsEventHandler(event) {
    ++JSEvents.inEventHandler;
    JSEvents.currentEventHandler = eventHandler;
    JSEvents.runDeferredCalls();
    eventHandler.handlerFunc(event);
    JSEvents.runDeferredCalls();
    --JSEvents.inEventHandler;
   };
   if (eventHandler.callbackfunc) {
    eventHandler.eventListenerFunc = jsEventHandler;
    eventHandler.target.addEventListener(eventHandler.eventTypeString, jsEventHandler, eventHandler.useCapture);
    JSEvents.eventHandlers.push(eventHandler);
    JSEvents.registerRemoveEventListeners();
   } else {
    for (var i = 0; i < JSEvents.eventHandlers.length; ++i) {
     if (JSEvents.eventHandlers[i].target == eventHandler.target && JSEvents.eventHandlers[i].eventTypeString == eventHandler.eventTypeString) {
      JSEvents._removeHandler(i--);
     }
    }
   }
  },
  queueEventHandlerOnThread_iiii: function(targetThread, eventHandlerFunc, eventTypeId, eventData, userData) {
   var stackTop = stackSave();
   var varargs = stackAlloc(12);
   GROWABLE_HEAP_I32()[varargs >> 2] = eventTypeId;
   GROWABLE_HEAP_I32()[varargs + 4 >> 2] = eventData;
   GROWABLE_HEAP_I32()[varargs + 8 >> 2] = userData;
   __emscripten_call_on_thread(0, targetThread, 637534208, eventHandlerFunc, eventData, varargs);
   stackRestore(stackTop);
  },
  getTargetThreadForEventCallback: function(targetThread) {
   switch (targetThread) {
   case 1:
    return 0;

   case 2:
    return PThread.currentProxiedOperationCallerThread;

   default:
    return targetThread;
   }
  },
  getNodeNameForTarget: function(target) {
   if (!target) return "";
   if (target == window) return "#window";
   if (target == screen) return "#screen";
   return target && target.nodeName ? target.nodeName : "";
  },
  fullscreenEnabled: function() {
   return document.fullscreenEnabled || document.webkitFullscreenEnabled;
  }
 };
 function stringToNewUTF8(jsString) {
  var length = lengthBytesUTF8(jsString) + 1;
  var cString = _malloc(length);
  stringToUTF8(jsString, cString, length);
  return cString;
 }
 function _emscripten_set_offscreencanvas_size_on_target_thread_js(targetThread, targetCanvas, width, height) {
  var stackTop = stackSave();
  var varargs = stackAlloc(12);
  var targetCanvasPtr = 0;
  if (targetCanvas) {
   targetCanvasPtr = stringToNewUTF8(targetCanvas);
  }
  GROWABLE_HEAP_I32()[varargs >> 2] = targetCanvasPtr;
  GROWABLE_HEAP_I32()[varargs + 4 >> 2] = width;
  GROWABLE_HEAP_I32()[varargs + 8 >> 2] = height;
  __emscripten_call_on_thread(0, targetThread, 657457152, 0, targetCanvasPtr, varargs);
  stackRestore(stackTop);
 }
 function _emscripten_set_offscreencanvas_size_on_target_thread(targetThread, targetCanvas, width, height) {
  targetCanvas = targetCanvas ? UTF8ToString(targetCanvas) : "";
  _emscripten_set_offscreencanvas_size_on_target_thread_js(targetThread, targetCanvas, width, height);
 }
 function __maybeCStringToJsString(cString) {
  return cString > 2 ? UTF8ToString(cString) : cString;
 }
 var specialHTMLTargets = [ 0, typeof document !== "undefined" ? document : 0, typeof window !== "undefined" ? window : 0 ];
 function __findEventTarget(target) {
  target = __maybeCStringToJsString(target);
  var domElement = specialHTMLTargets[target] || (typeof document !== "undefined" ? document.querySelector(target) : undefined);
  return domElement;
 }
 function __findCanvasEventTarget(target) {
  return __findEventTarget(target);
 }
 function _emscripten_set_canvas_element_size_calling_thread(target, width, height) {
  var canvas = __findCanvasEventTarget(target);
  if (!canvas) return -4;
  if (canvas.canvasSharedPtr) {
   GROWABLE_HEAP_I32()[canvas.canvasSharedPtr >> 2] = width;
   GROWABLE_HEAP_I32()[canvas.canvasSharedPtr + 4 >> 2] = height;
  }
  if (canvas.offscreenCanvas || !canvas.controlTransferredOffscreen) {
   if (canvas.offscreenCanvas) canvas = canvas.offscreenCanvas;
   var autoResizeViewport = false;
   if (canvas.GLctxObject && canvas.GLctxObject.GLctx) {
    var prevViewport = canvas.GLctxObject.GLctx.getParameter(2978);
    autoResizeViewport = prevViewport[0] === 0 && prevViewport[1] === 0 && prevViewport[2] === canvas.width && prevViewport[3] === canvas.height;
   }
   canvas.width = width;
   canvas.height = height;
   if (autoResizeViewport) {
    canvas.GLctxObject.GLctx.viewport(0, 0, width, height);
   }
  } else if (canvas.canvasSharedPtr) {
   var targetThread = GROWABLE_HEAP_I32()[canvas.canvasSharedPtr + 8 >> 2];
   _emscripten_set_offscreencanvas_size_on_target_thread(targetThread, target, width, height);
   return 1;
  } else {
   return -4;
  }
  return 0;
 }
 function _emscripten_set_canvas_element_size_main_thread(target, width, height) {
  if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(21, 1, target, width, height);
  return _emscripten_set_canvas_element_size_calling_thread(target, width, height);
 }
 function _emscripten_set_canvas_element_size(target, width, height) {
  var canvas = __findCanvasEventTarget(target);
  if (canvas) {
   return _emscripten_set_canvas_element_size_calling_thread(target, width, height);
  } else {
   return _emscripten_set_canvas_element_size_main_thread(target, width, height);
  }
 }
 function _emscripten_set_current_thread_status_js(newStatus) {}
 function _emscripten_set_current_thread_status(newStatus) {
  newStatus = newStatus | 0;
 }
 function __webgl_enable_ANGLE_instanced_arrays(ctx) {
  var ext = ctx.getExtension("ANGLE_instanced_arrays");
  if (ext) {
   ctx["vertexAttribDivisor"] = function(index, divisor) {
    ext["vertexAttribDivisorANGLE"](index, divisor);
   };
   ctx["drawArraysInstanced"] = function(mode, first, count, primcount) {
    ext["drawArraysInstancedANGLE"](mode, first, count, primcount);
   };
   ctx["drawElementsInstanced"] = function(mode, count, type, indices, primcount) {
    ext["drawElementsInstancedANGLE"](mode, count, type, indices, primcount);
   };
   return 1;
  }
 }
 function __webgl_enable_OES_vertex_array_object(ctx) {
  var ext = ctx.getExtension("OES_vertex_array_object");
  if (ext) {
   ctx["createVertexArray"] = function() {
    return ext["createVertexArrayOES"]();
   };
   ctx["deleteVertexArray"] = function(vao) {
    ext["deleteVertexArrayOES"](vao);
   };
   ctx["bindVertexArray"] = function(vao) {
    ext["bindVertexArrayOES"](vao);
   };
   ctx["isVertexArray"] = function(vao) {
    return ext["isVertexArrayOES"](vao);
   };
   return 1;
  }
 }
 function __webgl_enable_WEBGL_draw_buffers(ctx) {
  var ext = ctx.getExtension("WEBGL_draw_buffers");
  if (ext) {
   ctx["drawBuffers"] = function(n, bufs) {
    ext["drawBuffersWEBGL"](n, bufs);
   };
   return 1;
  }
 }
 var GL = {
  counter: 1,
  buffers: [],
  programs: [],
  framebuffers: [],
  renderbuffers: [],
  textures: [],
  uniforms: [],
  shaders: [],
  vaos: [],
  contexts: {},
  offscreenCanvases: {},
  timerQueriesEXT: [],
  programInfos: {},
  stringCache: {},
  unpackAlignment: 4,
  recordError: function recordError(errorCode) {
   if (!GL.lastError) {
    GL.lastError = errorCode;
   }
  },
  getNewId: function(table) {
   var ret = GL.counter++;
   for (var i = table.length; i < ret; i++) {
    table[i] = null;
   }
   return ret;
  },
  getSource: function(shader, count, string, length) {
   var source = "";
   for (var i = 0; i < count; ++i) {
    var len = length ? GROWABLE_HEAP_I32()[length + i * 4 >> 2] : -1;
    source += UTF8ToString(GROWABLE_HEAP_I32()[string + i * 4 >> 2], len < 0 ? undefined : len);
   }
   return source;
  },
  createContext: function(canvas, webGLContextAttributes) {
   var ctx = canvas.getContext("webgl", webGLContextAttributes);
   if (!ctx) return 0;
   var handle = GL.registerContext(ctx, webGLContextAttributes);
   return handle;
  },
  registerContext: function(ctx, webGLContextAttributes) {
   var handle = _malloc(8);
   GROWABLE_HEAP_I32()[handle + 4 >> 2] = _pthread_self();
   var context = {
    handle: handle,
    attributes: webGLContextAttributes,
    version: webGLContextAttributes.majorVersion,
    GLctx: ctx
   };
   if (ctx.canvas) ctx.canvas.GLctxObject = context;
   GL.contexts[handle] = context;
   if (typeof webGLContextAttributes.enableExtensionsByDefault === "undefined" || webGLContextAttributes.enableExtensionsByDefault) {
    GL.initExtensions(context);
   }
   return handle;
  },
  makeContextCurrent: function(contextHandle) {
   GL.currentContext = GL.contexts[contextHandle];
   Module.ctx = GLctx = GL.currentContext && GL.currentContext.GLctx;
   return !(contextHandle && !GLctx);
  },
  getContext: function(contextHandle) {
   return GL.contexts[contextHandle];
  },
  deleteContext: function(contextHandle) {
   if (GL.currentContext === GL.contexts[contextHandle]) GL.currentContext = null;
   if (typeof JSEvents === "object") JSEvents.removeAllHandlersOnTarget(GL.contexts[contextHandle].GLctx.canvas);
   if (GL.contexts[contextHandle] && GL.contexts[contextHandle].GLctx.canvas) GL.contexts[contextHandle].GLctx.canvas.GLctxObject = undefined;
   _free(GL.contexts[contextHandle].handle);
   GL.contexts[contextHandle] = null;
  },
  initExtensions: function(context) {
   if (!context) context = GL.currentContext;
   if (context.initExtensionsDone) return;
   context.initExtensionsDone = true;
   var GLctx = context.GLctx;
   __webgl_enable_ANGLE_instanced_arrays(GLctx);
   __webgl_enable_OES_vertex_array_object(GLctx);
   __webgl_enable_WEBGL_draw_buffers(GLctx);
   GLctx.disjointTimerQueryExt = GLctx.getExtension("EXT_disjoint_timer_query");
   var automaticallyEnabledExtensions = [ "OES_texture_float", "OES_texture_half_float", "OES_standard_derivatives", "OES_vertex_array_object", "WEBGL_compressed_texture_s3tc", "WEBGL_depth_texture", "OES_element_index_uint", "EXT_texture_filter_anisotropic", "EXT_frag_depth", "WEBGL_draw_buffers", "ANGLE_instanced_arrays", "OES_texture_float_linear", "OES_texture_half_float_linear", "EXT_blend_minmax", "EXT_shader_texture_lod", "EXT_texture_norm16", "WEBGL_compressed_texture_pvrtc", "EXT_color_buffer_half_float", "WEBGL_color_buffer_float", "EXT_sRGB", "WEBGL_compressed_texture_etc1", "EXT_disjoint_timer_query", "WEBGL_compressed_texture_etc", "WEBGL_compressed_texture_astc", "EXT_color_buffer_float", "WEBGL_compressed_texture_s3tc_srgb", "EXT_disjoint_timer_query_webgl2", "WEBKIT_WEBGL_compressed_texture_pvrtc" ];
   function shouldEnableAutomatically(extension) {
    var ret = false;
    automaticallyEnabledExtensions.forEach(function(include) {
     if (extension.indexOf(include) != -1) {
      ret = true;
     }
    });
    return ret;
   }
   var exts = GLctx.getSupportedExtensions() || [];
   exts.forEach(function(ext) {
    if (automaticallyEnabledExtensions.indexOf(ext) != -1) {
     GLctx.getExtension(ext);
    }
   });
  },
  populateUniformTable: function(program) {
   var p = GL.programs[program];
   var ptable = GL.programInfos[program] = {
    uniforms: {},
    maxUniformLength: 0,
    maxAttributeLength: -1,
    maxUniformBlockNameLength: -1
   };
   var utable = ptable.uniforms;
   var numUniforms = GLctx.getProgramParameter(p, 35718);
   for (var i = 0; i < numUniforms; ++i) {
    var u = GLctx.getActiveUniform(p, i);
    var name = u.name;
    ptable.maxUniformLength = Math.max(ptable.maxUniformLength, name.length + 1);
    if (name.slice(-1) == "]") {
     name = name.slice(0, name.lastIndexOf("["));
    }
    var loc = GLctx.getUniformLocation(p, name);
    if (loc) {
     var id = GL.getNewId(GL.uniforms);
     utable[name] = [ u.size, id ];
     GL.uniforms[id] = loc;
     for (var j = 1; j < u.size; ++j) {
      var n = name + "[" + j + "]";
      loc = GLctx.getUniformLocation(p, n);
      id = GL.getNewId(GL.uniforms);
      GL.uniforms[id] = loc;
     }
    }
   }
  }
 };
 var __emscripten_webgl_power_preferences = [ "default", "low-power", "high-performance" ];
 function _emscripten_webgl_do_create_context(target, attributes) {
  assert(attributes);
  var contextAttributes = {};
  var a = attributes >> 2;
  contextAttributes["alpha"] = !!GROWABLE_HEAP_I32()[a + (0 >> 2)];
  contextAttributes["depth"] = !!GROWABLE_HEAP_I32()[a + (4 >> 2)];
  contextAttributes["stencil"] = !!GROWABLE_HEAP_I32()[a + (8 >> 2)];
  contextAttributes["antialias"] = !!GROWABLE_HEAP_I32()[a + (12 >> 2)];
  contextAttributes["premultipliedAlpha"] = !!GROWABLE_HEAP_I32()[a + (16 >> 2)];
  contextAttributes["preserveDrawingBuffer"] = !!GROWABLE_HEAP_I32()[a + (20 >> 2)];
  var powerPreference = GROWABLE_HEAP_I32()[a + (24 >> 2)];
  contextAttributes["powerPreference"] = __emscripten_webgl_power_preferences[powerPreference];
  contextAttributes["failIfMajorPerformanceCaveat"] = !!GROWABLE_HEAP_I32()[a + (28 >> 2)];
  contextAttributes.majorVersion = GROWABLE_HEAP_I32()[a + (32 >> 2)];
  contextAttributes.minorVersion = GROWABLE_HEAP_I32()[a + (36 >> 2)];
  contextAttributes.enableExtensionsByDefault = GROWABLE_HEAP_I32()[a + (40 >> 2)];
  contextAttributes.explicitSwapControl = GROWABLE_HEAP_I32()[a + (44 >> 2)];
  contextAttributes.proxyContextToMainThread = GROWABLE_HEAP_I32()[a + (48 >> 2)];
  contextAttributes.renderViaOffscreenBackBuffer = GROWABLE_HEAP_I32()[a + (52 >> 2)];
  var canvas = __findCanvasEventTarget(target);
  if (!canvas) {
   return -4;
  }
  if (contextAttributes.explicitSwapControl) {
   return -1;
  }
  var contextHandle = GL.createContext(canvas, contextAttributes);
  return contextHandle;
 }
 function _emscripten_webgl_create_context(a0, a1) {
  return _emscripten_webgl_do_create_context(a0, a1);
 }
 var ENV = {};
 function __getExecutableName() {
  return thisProgram || "./this.program";
 }
 function getEnvStrings() {
  if (!getEnvStrings.strings) {
   var env = {
    "USER": "web_user",
    "LOGNAME": "web_user",
    "PATH": "/",
    "PWD": "/",
    "HOME": "/home/web_user",
    "LANG": (typeof navigator === "object" && navigator.languages && navigator.languages[0] || "C").replace("-", "_") + ".UTF-8",
    "_": __getExecutableName()
   };
   for (var x in ENV) {
    env[x] = ENV[x];
   }
   var strings = [];
   for (var x in env) {
    strings.push(x + "=" + env[x]);
   }
   getEnvStrings.strings = strings;
  }
  return getEnvStrings.strings;
 }
 function _environ_get(__environ, environ_buf) {
  var bufSize = 0;
  getEnvStrings().forEach(function(string, i) {
   var ptr = environ_buf + bufSize;
   GROWABLE_HEAP_I32()[__environ + i * 4 >> 2] = ptr;
   writeAsciiToMemory(string, ptr);
   bufSize += string.length + 1;
  });
  return 0;
 }
 function _environ_sizes_get(penviron_count, penviron_buf_size) {
  var strings = getEnvStrings();
  GROWABLE_HEAP_I32()[penviron_count >> 2] = strings.length;
  var bufSize = 0;
  strings.forEach(function(string) {
   bufSize += string.length + 1;
  });
  GROWABLE_HEAP_I32()[penviron_buf_size >> 2] = bufSize;
  return 0;
 }
 function _exit(status) {
  exit(status);
 }
 function _fd_close(fd) {
  if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(22, 1, fd);
  try {
   var stream = SYSCALLS.getStreamFromFD(fd);
   FS.close(stream);
   return 0;
  } catch (e) {
   if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
   return e.errno;
  }
 }
 function _fd_fdstat_get(fd, pbuf) {
  if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(23, 1, fd, pbuf);
  try {
   var stream = SYSCALLS.getStreamFromFD(fd);
   var type = stream.tty ? 2 : FS.isDir(stream.mode) ? 3 : FS.isLink(stream.mode) ? 7 : 4;
   GROWABLE_HEAP_I8()[pbuf >> 0] = type;
   return 0;
  } catch (e) {
   if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
   return e.errno;
  }
 }
 function _fd_read(fd, iov, iovcnt, pnum) {
  if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(24, 1, fd, iov, iovcnt, pnum);
  try {
   var stream = SYSCALLS.getStreamFromFD(fd);
   var num = SYSCALLS.doReadv(stream, iov, iovcnt);
   GROWABLE_HEAP_I32()[pnum >> 2] = num;
   return 0;
  } catch (e) {
   if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
   return e.errno;
  }
 }
 function _fd_seek(fd, offset_low, offset_high, whence, newOffset) {
  if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(25, 1, fd, offset_low, offset_high, whence, newOffset);
  try {
   var stream = SYSCALLS.getStreamFromFD(fd);
   var HIGH_OFFSET = 4294967296;
   var offset = offset_high * HIGH_OFFSET + (offset_low >>> 0);
   var DOUBLE_LIMIT = 9007199254740992;
   if (offset <= -DOUBLE_LIMIT || offset >= DOUBLE_LIMIT) {
    return -61;
   }
   FS.llseek(stream, offset, whence);
   tempI64 = [ stream.position >>> 0, (tempDouble = stream.position, +Math_abs(tempDouble) >= 1 ? tempDouble > 0 ? (Math_min(+Math_floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0 : ~~+Math_ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0) ],
   GROWABLE_HEAP_I32()[newOffset >> 2] = tempI64[0], GROWABLE_HEAP_I32()[newOffset + 4 >> 2] = tempI64[1];
   if (stream.getdents && offset === 0 && whence === 0) stream.getdents = null;
   return 0;
  } catch (e) {
   if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
   return e.errno;
  }
 }
 function _fd_write(fd, iov, iovcnt, pnum) {
  if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(26, 1, fd, iov, iovcnt, pnum);
  try {
   var stream = SYSCALLS.getStreamFromFD(fd);
   var num = SYSCALLS.doWritev(stream, iov, iovcnt);
   GROWABLE_HEAP_I32()[pnum >> 2] = num;
   return 0;
  } catch (e) {
   if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
   return e.errno;
  }
 }
 var GAI_ERRNO_MESSAGES = {};
 function _gai_strerror(val) {
  var buflen = 256;
  if (!_gai_strerror.buffer) {
   _gai_strerror.buffer = _malloc(buflen);
   GAI_ERRNO_MESSAGES["0"] = "Success";
   GAI_ERRNO_MESSAGES["" + -1] = "Invalid value for 'ai_flags' field";
   GAI_ERRNO_MESSAGES["" + -2] = "NAME or SERVICE is unknown";
   GAI_ERRNO_MESSAGES["" + -3] = "Temporary failure in name resolution";
   GAI_ERRNO_MESSAGES["" + -4] = "Non-recoverable failure in name res";
   GAI_ERRNO_MESSAGES["" + -6] = "'ai_family' not supported";
   GAI_ERRNO_MESSAGES["" + -7] = "'ai_socktype' not supported";
   GAI_ERRNO_MESSAGES["" + -8] = "SERVICE not supported for 'ai_socktype'";
   GAI_ERRNO_MESSAGES["" + -10] = "Memory allocation failure";
   GAI_ERRNO_MESSAGES["" + -11] = "System error returned in 'errno'";
   GAI_ERRNO_MESSAGES["" + -12] = "Argument buffer overflow";
  }
  var msg = "Unknown error";
  if (val in GAI_ERRNO_MESSAGES) {
   if (GAI_ERRNO_MESSAGES[val].length > buflen - 1) {
    msg = "Message too long";
   } else {
    msg = GAI_ERRNO_MESSAGES[val];
   }
  }
  writeAsciiToMemory(msg, _gai_strerror.buffer);
  return _gai_strerror.buffer;
 }
 function _getaddrinfo(node, service, hint, out) {
  if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(27, 1, node, service, hint, out);
  var addrs = [];
  var canon = null;
  var addr = 0;
  var port = 0;
  var flags = 0;
  var family = 0;
  var type = 0;
  var proto = 0;
  var ai, last;
  function allocaddrinfo(family, type, proto, canon, addr, port) {
   var sa, salen, ai;
   var res;
   salen = family === 10 ? 28 : 16;
   addr = family === 10 ? __inet_ntop6_raw(addr) : __inet_ntop4_raw(addr);
   sa = _malloc(salen);
   res = __write_sockaddr(sa, family, addr, port);
   assert(!res.errno);
   ai = _malloc(32);
   GROWABLE_HEAP_I32()[ai + 4 >> 2] = family;
   GROWABLE_HEAP_I32()[ai + 8 >> 2] = type;
   GROWABLE_HEAP_I32()[ai + 12 >> 2] = proto;
   GROWABLE_HEAP_I32()[ai + 24 >> 2] = canon;
   GROWABLE_HEAP_I32()[ai + 20 >> 2] = sa;
   if (family === 10) {
    GROWABLE_HEAP_I32()[ai + 16 >> 2] = 28;
   } else {
    GROWABLE_HEAP_I32()[ai + 16 >> 2] = 16;
   }
   GROWABLE_HEAP_I32()[ai + 28 >> 2] = 0;
   return ai;
  }
  if (hint) {
   flags = GROWABLE_HEAP_I32()[hint >> 2];
   family = GROWABLE_HEAP_I32()[hint + 4 >> 2];
   type = GROWABLE_HEAP_I32()[hint + 8 >> 2];
   proto = GROWABLE_HEAP_I32()[hint + 12 >> 2];
  }
  if (type && !proto) {
   proto = type === 2 ? 17 : 6;
  }
  if (!type && proto) {
   type = proto === 17 ? 2 : 1;
  }
  if (proto === 0) {
   proto = 6;
  }
  if (type === 0) {
   type = 1;
  }
  if (!node && !service) {
   return -2;
  }
  if (flags & ~(1 | 2 | 4 | 1024 | 8 | 16 | 32)) {
   return -1;
  }
  if (hint !== 0 && GROWABLE_HEAP_I32()[hint >> 2] & 2 && !node) {
   return -1;
  }
  if (flags & 32) {
   return -2;
  }
  if (type !== 0 && type !== 1 && type !== 2) {
   return -7;
  }
  if (family !== 0 && family !== 2 && family !== 10) {
   return -6;
  }
  if (service) {
   service = UTF8ToString(service);
   port = parseInt(service, 10);
   if (isNaN(port)) {
    if (flags & 1024) {
     return -2;
    }
    return -8;
   }
  }
  if (!node) {
   if (family === 0) {
    family = 2;
   }
   if ((flags & 1) === 0) {
    if (family === 2) {
     addr = _htonl(2130706433);
    } else {
     addr = [ 0, 0, 0, 1 ];
    }
   }
   ai = allocaddrinfo(family, type, proto, null, addr, port);
   GROWABLE_HEAP_I32()[out >> 2] = ai;
   return 0;
  }
  node = UTF8ToString(node);
  addr = __inet_pton4_raw(node);
  if (addr !== null) {
   if (family === 0 || family === 2) {
    family = 2;
   } else if (family === 10 && flags & 8) {
    addr = [ 0, 0, _htonl(65535), addr ];
    family = 10;
   } else {
    return -2;
   }
  } else {
   addr = __inet_pton6_raw(node);
   if (addr !== null) {
    if (family === 0 || family === 10) {
     family = 10;
    } else {
     return -2;
    }
   }
  }
  if (addr != null) {
   ai = allocaddrinfo(family, type, proto, node, addr, port);
   GROWABLE_HEAP_I32()[out >> 2] = ai;
   return 0;
  }
  if (flags & 4) {
   return -2;
  }
  node = DNS.lookup_name(node);
  addr = __inet_pton4_raw(node);
  if (family === 0) {
   family = 2;
  } else if (family === 10) {
   addr = [ 0, 0, _htonl(65535), addr ];
  }
  ai = allocaddrinfo(family, type, proto, null, addr, port);
  GROWABLE_HEAP_I32()[out >> 2] = ai;
  return 0;
 }
 function _getnameinfo(sa, salen, node, nodelen, serv, servlen, flags) {
  var info = __read_sockaddr(sa, salen);
  if (info.errno) {
   return -6;
  }
  var port = info.port;
  var addr = info.addr;
  var overflowed = false;
  if (node && nodelen) {
   var lookup;
   if (flags & 1 || !(lookup = DNS.lookup_addr(addr))) {
    if (flags & 8) {
     return -2;
    }
   } else {
    addr = lookup;
   }
   var numBytesWrittenExclNull = stringToUTF8(addr, node, nodelen);
   if (numBytesWrittenExclNull + 1 >= nodelen) {
    overflowed = true;
   }
  }
  if (serv && servlen) {
   port = "" + port;
   var numBytesWrittenExclNull = stringToUTF8(port, serv, servlen);
   if (numBytesWrittenExclNull + 1 >= servlen) {
    overflowed = true;
   }
  }
  if (overflowed) {
   return -12;
  }
  return 0;
 }
 function _gettimeofday(ptr) {
  var now = Date.now();
  GROWABLE_HEAP_I32()[ptr >> 2] = now / 1e3 | 0;
  GROWABLE_HEAP_I32()[ptr + 4 >> 2] = now % 1e3 * 1e3 | 0;
  return 0;
 }
 var ___tm_current = 14216112;
 var ___tm_timezone = (stringToUTF8("GMT", 14216160, 4), 14216160);
 function _gmtime_r(time, tmPtr) {
  var date = new Date(GROWABLE_HEAP_I32()[time >> 2] * 1e3);
  GROWABLE_HEAP_I32()[tmPtr >> 2] = date.getUTCSeconds();
  GROWABLE_HEAP_I32()[tmPtr + 4 >> 2] = date.getUTCMinutes();
  GROWABLE_HEAP_I32()[tmPtr + 8 >> 2] = date.getUTCHours();
  GROWABLE_HEAP_I32()[tmPtr + 12 >> 2] = date.getUTCDate();
  GROWABLE_HEAP_I32()[tmPtr + 16 >> 2] = date.getUTCMonth();
  GROWABLE_HEAP_I32()[tmPtr + 20 >> 2] = date.getUTCFullYear() - 1900;
  GROWABLE_HEAP_I32()[tmPtr + 24 >> 2] = date.getUTCDay();
  GROWABLE_HEAP_I32()[tmPtr + 36 >> 2] = 0;
  GROWABLE_HEAP_I32()[tmPtr + 32 >> 2] = 0;
  var start = Date.UTC(date.getUTCFullYear(), 0, 1, 0, 0, 0, 0);
  var yday = (date.getTime() - start) / (1e3 * 60 * 60 * 24) | 0;
  GROWABLE_HEAP_I32()[tmPtr + 28 >> 2] = yday;
  GROWABLE_HEAP_I32()[tmPtr + 40 >> 2] = ___tm_timezone;
  return tmPtr;
 }
 function _gmtime(time) {
  return _gmtime_r(time, ___tm_current);
 }
 function _tzset() {
  if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(28, 1);
  if (_tzset.called) return;
  _tzset.called = true;
  GROWABLE_HEAP_I32()[__get_timezone() >> 2] = new Date().getTimezoneOffset() * 60;
  var currentYear = new Date().getFullYear();
  var winter = new Date(currentYear, 0, 1);
  var summer = new Date(currentYear, 6, 1);
  GROWABLE_HEAP_I32()[__get_daylight() >> 2] = Number(winter.getTimezoneOffset() != summer.getTimezoneOffset());
  function extractZone(date) {
   var match = date.toTimeString().match(/\(([A-Za-z ]+)\)$/);
   return match ? match[1] : "GMT";
  }
  var winterName = extractZone(winter);
  var summerName = extractZone(summer);
  var winterNamePtr = allocateUTF8(winterName);
  var summerNamePtr = allocateUTF8(summerName);
  if (summer.getTimezoneOffset() < winter.getTimezoneOffset()) {
   GROWABLE_HEAP_I32()[__get_tzname() >> 2] = winterNamePtr;
   GROWABLE_HEAP_I32()[__get_tzname() + 4 >> 2] = summerNamePtr;
  } else {
   GROWABLE_HEAP_I32()[__get_tzname() >> 2] = summerNamePtr;
   GROWABLE_HEAP_I32()[__get_tzname() + 4 >> 2] = winterNamePtr;
  }
 }
 function _localtime_r(time, tmPtr) {
  _tzset();
  var date = new Date(GROWABLE_HEAP_I32()[time >> 2] * 1e3);
  GROWABLE_HEAP_I32()[tmPtr >> 2] = date.getSeconds();
  GROWABLE_HEAP_I32()[tmPtr + 4 >> 2] = date.getMinutes();
  GROWABLE_HEAP_I32()[tmPtr + 8 >> 2] = date.getHours();
  GROWABLE_HEAP_I32()[tmPtr + 12 >> 2] = date.getDate();
  GROWABLE_HEAP_I32()[tmPtr + 16 >> 2] = date.getMonth();
  GROWABLE_HEAP_I32()[tmPtr + 20 >> 2] = date.getFullYear() - 1900;
  GROWABLE_HEAP_I32()[tmPtr + 24 >> 2] = date.getDay();
  var start = new Date(date.getFullYear(), 0, 1);
  var yday = (date.getTime() - start.getTime()) / (1e3 * 60 * 60 * 24) | 0;
  GROWABLE_HEAP_I32()[tmPtr + 28 >> 2] = yday;
  GROWABLE_HEAP_I32()[tmPtr + 36 >> 2] = -(date.getTimezoneOffset() * 60);
  var summerOffset = new Date(date.getFullYear(), 6, 1).getTimezoneOffset();
  var winterOffset = start.getTimezoneOffset();
  var dst = (summerOffset != winterOffset && date.getTimezoneOffset() == Math.min(winterOffset, summerOffset)) | 0;
  GROWABLE_HEAP_I32()[tmPtr + 32 >> 2] = dst;
  var zonePtr = GROWABLE_HEAP_I32()[__get_tzname() + (dst ? 4 : 0) >> 2];
  GROWABLE_HEAP_I32()[tmPtr + 40 >> 2] = zonePtr;
  return tmPtr;
 }
 function _localtime(time) {
  return _localtime_r(time, ___tm_current);
 }
 function _mktime(tmPtr) {
  _tzset();
  var date = new Date(GROWABLE_HEAP_I32()[tmPtr + 20 >> 2] + 1900, GROWABLE_HEAP_I32()[tmPtr + 16 >> 2], GROWABLE_HEAP_I32()[tmPtr + 12 >> 2], GROWABLE_HEAP_I32()[tmPtr + 8 >> 2], GROWABLE_HEAP_I32()[tmPtr + 4 >> 2], GROWABLE_HEAP_I32()[tmPtr >> 2], 0);
  var dst = GROWABLE_HEAP_I32()[tmPtr + 32 >> 2];
  var guessedOffset = date.getTimezoneOffset();
  var start = new Date(date.getFullYear(), 0, 1);
  var summerOffset = new Date(date.getFullYear(), 6, 1).getTimezoneOffset();
  var winterOffset = start.getTimezoneOffset();
  var dstOffset = Math.min(winterOffset, summerOffset);
  if (dst < 0) {
   GROWABLE_HEAP_I32()[tmPtr + 32 >> 2] = Number(summerOffset != winterOffset && dstOffset == guessedOffset);
  } else if (dst > 0 != (dstOffset == guessedOffset)) {
   var nonDstOffset = Math.max(winterOffset, summerOffset);
   var trueOffset = dst > 0 ? dstOffset : nonDstOffset;
   date.setTime(date.getTime() + (trueOffset - guessedOffset) * 6e4);
  }
  GROWABLE_HEAP_I32()[tmPtr + 24 >> 2] = date.getDay();
  var yday = (date.getTime() - start.getTime()) / (1e3 * 60 * 60 * 24) | 0;
  GROWABLE_HEAP_I32()[tmPtr + 28 >> 2] = yday;
  return date.getTime() / 1e3 | 0;
 }
 function _pthread_cleanup_push(routine, arg) {
  if (PThread.exitHandlers === null) {
   PThread.exitHandlers = [];
  }
  PThread.exitHandlers.push(function() {
   dynCall_vi(routine, arg);
  });
 }
 function spawnThread(threadParams) {
  if (ENVIRONMENT_IS_PTHREAD) throw "Internal Error! spawnThread() can only ever be called from main application thread!";
  var worker = PThread.getNewWorker();
  if (worker.pthread !== undefined) throw "Internal error!";
  if (!threadParams.pthread_ptr) throw "Internal error, no pthread ptr!";
  PThread.runningWorkers.push(worker);
  var tlsMemory = _malloc(128 * 4);
  for (var i = 0; i < 128; ++i) {
   GROWABLE_HEAP_I32()[tlsMemory + i * 4 >> 2] = 0;
  }
  var stackHigh = threadParams.stackBase + threadParams.stackSize;
  var pthread = PThread.pthreads[threadParams.pthread_ptr] = {
   worker: worker,
   stackBase: threadParams.stackBase,
   stackSize: threadParams.stackSize,
   allocatedOwnStack: threadParams.allocatedOwnStack,
   thread: threadParams.pthread_ptr,
   threadInfoStruct: threadParams.pthread_ptr
  };
  var tis = pthread.threadInfoStruct >> 2;
  Atomics.store(GROWABLE_HEAP_U32(), tis + (0 >> 2), 0);
  Atomics.store(GROWABLE_HEAP_U32(), tis + (4 >> 2), 0);
  Atomics.store(GROWABLE_HEAP_U32(), tis + (8 >> 2), 0);
  Atomics.store(GROWABLE_HEAP_U32(), tis + (68 >> 2), threadParams.detached);
  Atomics.store(GROWABLE_HEAP_U32(), tis + (104 >> 2), tlsMemory);
  Atomics.store(GROWABLE_HEAP_U32(), tis + (48 >> 2), 0);
  Atomics.store(GROWABLE_HEAP_U32(), tis + (40 >> 2), pthread.threadInfoStruct);
  Atomics.store(GROWABLE_HEAP_U32(), tis + (44 >> 2), 42);
  Atomics.store(GROWABLE_HEAP_U32(), tis + (108 >> 2), threadParams.stackSize);
  Atomics.store(GROWABLE_HEAP_U32(), tis + (84 >> 2), threadParams.stackSize);
  Atomics.store(GROWABLE_HEAP_U32(), tis + (80 >> 2), stackHigh);
  Atomics.store(GROWABLE_HEAP_U32(), tis + (108 + 8 >> 2), stackHigh);
  Atomics.store(GROWABLE_HEAP_U32(), tis + (108 + 12 >> 2), threadParams.detached);
  Atomics.store(GROWABLE_HEAP_U32(), tis + (108 + 20 >> 2), threadParams.schedPolicy);
  Atomics.store(GROWABLE_HEAP_U32(), tis + (108 + 24 >> 2), threadParams.schedPrio);
  var global_libc = _emscripten_get_global_libc();
  var global_locale = global_libc + 40;
  Atomics.store(GROWABLE_HEAP_U32(), tis + (176 >> 2), global_locale);
  worker.pthread = pthread;
  var msg = {
   "cmd": "run",
   "start_routine": threadParams.startRoutine,
   "arg": threadParams.arg,
   "threadInfoStruct": threadParams.pthread_ptr,
   "selfThreadId": threadParams.pthread_ptr,
   "parentThreadId": threadParams.parent_pthread_ptr,
   "stackBase": threadParams.stackBase,
   "stackSize": threadParams.stackSize
  };
  worker.runPthread = function() {
   msg.time = performance.now();
   worker.postMessage(msg, threadParams.transferList);
  };
  if (worker.loaded) {
   worker.runPthread();
   delete worker.runPthread;
  }
 }
 function _pthread_getschedparam(thread, policy, schedparam) {
  if (!policy && !schedparam) return ERRNO_CODES.EINVAL;
  if (!thread) {
   err("pthread_getschedparam called with a null thread pointer!");
   return ERRNO_CODES.ESRCH;
  }
  var self = GROWABLE_HEAP_I32()[thread + 12 >> 2];
  if (self !== thread) {
   err("pthread_getschedparam attempted on thread " + thread + ", which does not point to a valid thread, or does not exist anymore!");
   return ERRNO_CODES.ESRCH;
  }
  var schedPolicy = Atomics.load(GROWABLE_HEAP_U32(), thread + 108 + 20 >> 2);
  var schedPrio = Atomics.load(GROWABLE_HEAP_U32(), thread + 108 + 24 >> 2);
  if (policy) GROWABLE_HEAP_I32()[policy >> 2] = schedPolicy;
  if (schedparam) GROWABLE_HEAP_I32()[schedparam >> 2] = schedPrio;
  return 0;
 }
 function _pthread_self() {
  return __pthread_ptr | 0;
 }
 Module["_pthread_self"] = _pthread_self;
 function resetPrototype(constructor, attrs) {
  var object = Object.create(constructor.prototype);
  for (var key in attrs) {
   if (attrs.hasOwnProperty(key)) {
    object[key] = attrs[key];
   }
  }
  return object;
 }
 function _pthread_create(pthread_ptr, attr, start_routine, arg) {
  if (typeof SharedArrayBuffer === "undefined") {
   err("Current environment does not support SharedArrayBuffer, pthreads are not available!");
   return 6;
  }
  if (!pthread_ptr) {
   err("pthread_create called with a null thread pointer!");
   return 28;
  }
  var transferList = [];
  var error = 0;
  if (ENVIRONMENT_IS_PTHREAD && (transferList.length === 0 || error)) {
   return _emscripten_sync_run_in_main_thread_4(687865856, pthread_ptr, attr, start_routine, arg);
  }
  if (error) return error;
  var stackSize = 0;
  var stackBase = 0;
  var detached = 0;
  var schedPolicy = 0;
  var schedPrio = 0;
  if (attr) {
   stackSize = GROWABLE_HEAP_I32()[attr >> 2];
   stackSize += 81920;
   stackBase = GROWABLE_HEAP_I32()[attr + 8 >> 2];
   detached = GROWABLE_HEAP_I32()[attr + 12 >> 2] !== 0;
   var inheritSched = GROWABLE_HEAP_I32()[attr + 16 >> 2] === 0;
   if (inheritSched) {
    var prevSchedPolicy = GROWABLE_HEAP_I32()[attr + 20 >> 2];
    var prevSchedPrio = GROWABLE_HEAP_I32()[attr + 24 >> 2];
    var parentThreadPtr = PThread.currentProxiedOperationCallerThread ? PThread.currentProxiedOperationCallerThread : _pthread_self();
    _pthread_getschedparam(parentThreadPtr, attr + 20, attr + 24);
    schedPolicy = GROWABLE_HEAP_I32()[attr + 20 >> 2];
    schedPrio = GROWABLE_HEAP_I32()[attr + 24 >> 2];
    GROWABLE_HEAP_I32()[attr + 20 >> 2] = prevSchedPolicy;
    GROWABLE_HEAP_I32()[attr + 24 >> 2] = prevSchedPrio;
   } else {
    schedPolicy = GROWABLE_HEAP_I32()[attr + 20 >> 2];
    schedPrio = GROWABLE_HEAP_I32()[attr + 24 >> 2];
   }
  } else {
   stackSize = 2097152;
  }
  var allocatedOwnStack = stackBase == 0;
  if (allocatedOwnStack) {
   stackBase = _memalign(16, stackSize);
  } else {
   stackBase -= stackSize;
   assert(stackBase > 0);
  }
  var threadInfoStruct = _malloc(232);
  for (var i = 0; i < 232 >> 2; ++i) GROWABLE_HEAP_U32()[(threadInfoStruct >> 2) + i] = 0;
  GROWABLE_HEAP_I32()[pthread_ptr >> 2] = threadInfoStruct;
  GROWABLE_HEAP_I32()[threadInfoStruct + 12 >> 2] = threadInfoStruct;
  var headPtr = threadInfoStruct + 156;
  GROWABLE_HEAP_I32()[headPtr >> 2] = headPtr;
  var threadParams = {
   stackBase: stackBase,
   stackSize: stackSize,
   allocatedOwnStack: allocatedOwnStack,
   schedPolicy: schedPolicy,
   schedPrio: schedPrio,
   detached: detached,
   startRoutine: start_routine,
   pthread_ptr: threadInfoStruct,
   parent_pthread_ptr: _pthread_self(),
   arg: arg,
   transferList: transferList
  };
  if (ENVIRONMENT_IS_PTHREAD) {
   threadParams.cmd = "spawnThread";
   postMessage(threadParams, transferList);
  } else {
   spawnThread(threadParams);
  }
  return 0;
 }
 function _round(d) {
  d = +d;
  return d >= +0 ? +Math_floor(d + +.5) : +Math_ceil(d - +.5);
 }
 function _roundf(d) {
  d = +d;
  return d >= +0 ? +Math_floor(d + +.5) : +Math_ceil(d - +.5);
 }
 function _setTempRet0($i) {
  setTempRet0($i | 0);
 }
 var __sigalrm_handler = 0;
 function _signal(sig, func) {
  if (sig == 14) {
   __sigalrm_handler = func;
  } else {
   err("Calling stub instead of signal()");
  }
  return 0;
 }
 function __isLeapYear(year) {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
 }
 function __arraySum(array, index) {
  var sum = 0;
  for (var i = 0; i <= index; sum += array[i++]) {}
  return sum;
 }
 var __MONTH_DAYS_LEAP = [ 31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];
 var __MONTH_DAYS_REGULAR = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];
 function __addDays(date, days) {
  var newDate = new Date(date.getTime());
  while (days > 0) {
   var leap = __isLeapYear(newDate.getFullYear());
   var currentMonth = newDate.getMonth();
   var daysInCurrentMonth = (leap ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR)[currentMonth];
   if (days > daysInCurrentMonth - newDate.getDate()) {
    days -= daysInCurrentMonth - newDate.getDate() + 1;
    newDate.setDate(1);
    if (currentMonth < 11) {
     newDate.setMonth(currentMonth + 1);
    } else {
     newDate.setMonth(0);
     newDate.setFullYear(newDate.getFullYear() + 1);
    }
   } else {
    newDate.setDate(newDate.getDate() + days);
    return newDate;
   }
  }
  return newDate;
 }
 function _strftime(s, maxsize, format, tm) {
  var tm_zone = GROWABLE_HEAP_I32()[tm + 40 >> 2];
  var date = {
   tm_sec: GROWABLE_HEAP_I32()[tm >> 2],
   tm_min: GROWABLE_HEAP_I32()[tm + 4 >> 2],
   tm_hour: GROWABLE_HEAP_I32()[tm + 8 >> 2],
   tm_mday: GROWABLE_HEAP_I32()[tm + 12 >> 2],
   tm_mon: GROWABLE_HEAP_I32()[tm + 16 >> 2],
   tm_year: GROWABLE_HEAP_I32()[tm + 20 >> 2],
   tm_wday: GROWABLE_HEAP_I32()[tm + 24 >> 2],
   tm_yday: GROWABLE_HEAP_I32()[tm + 28 >> 2],
   tm_isdst: GROWABLE_HEAP_I32()[tm + 32 >> 2],
   tm_gmtoff: GROWABLE_HEAP_I32()[tm + 36 >> 2],
   tm_zone: tm_zone ? UTF8ToString(tm_zone) : ""
  };
  var pattern = UTF8ToString(format);
  var EXPANSION_RULES_1 = {
   "%c": "%a %b %d %H:%M:%S %Y",
   "%D": "%m/%d/%y",
   "%F": "%Y-%m-%d",
   "%h": "%b",
   "%r": "%I:%M:%S %p",
   "%R": "%H:%M",
   "%T": "%H:%M:%S",
   "%x": "%m/%d/%y",
   "%X": "%H:%M:%S",
   "%Ec": "%c",
   "%EC": "%C",
   "%Ex": "%m/%d/%y",
   "%EX": "%H:%M:%S",
   "%Ey": "%y",
   "%EY": "%Y",
   "%Od": "%d",
   "%Oe": "%e",
   "%OH": "%H",
   "%OI": "%I",
   "%Om": "%m",
   "%OM": "%M",
   "%OS": "%S",
   "%Ou": "%u",
   "%OU": "%U",
   "%OV": "%V",
   "%Ow": "%w",
   "%OW": "%W",
   "%Oy": "%y"
  };
  for (var rule in EXPANSION_RULES_1) {
   pattern = pattern.replace(new RegExp(rule, "g"), EXPANSION_RULES_1[rule]);
  }
  var WEEKDAYS = [ "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" ];
  var MONTHS = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];
  function leadingSomething(value, digits, character) {
   var str = typeof value === "number" ? value.toString() : value || "";
   while (str.length < digits) {
    str = character[0] + str;
   }
   return str;
  }
  function leadingNulls(value, digits) {
   return leadingSomething(value, digits, "0");
  }
  function compareByDay(date1, date2) {
   function sgn(value) {
    return value < 0 ? -1 : value > 0 ? 1 : 0;
   }
   var compare;
   if ((compare = sgn(date1.getFullYear() - date2.getFullYear())) === 0) {
    if ((compare = sgn(date1.getMonth() - date2.getMonth())) === 0) {
     compare = sgn(date1.getDate() - date2.getDate());
    }
   }
   return compare;
  }
  function getFirstWeekStartDate(janFourth) {
   switch (janFourth.getDay()) {
   case 0:
    return new Date(janFourth.getFullYear() - 1, 11, 29);

   case 1:
    return janFourth;

   case 2:
    return new Date(janFourth.getFullYear(), 0, 3);

   case 3:
    return new Date(janFourth.getFullYear(), 0, 2);

   case 4:
    return new Date(janFourth.getFullYear(), 0, 1);

   case 5:
    return new Date(janFourth.getFullYear() - 1, 11, 31);

   case 6:
    return new Date(janFourth.getFullYear() - 1, 11, 30);
   }
  }
  function getWeekBasedYear(date) {
   var thisDate = __addDays(new Date(date.tm_year + 1900, 0, 1), date.tm_yday);
   var janFourthThisYear = new Date(thisDate.getFullYear(), 0, 4);
   var janFourthNextYear = new Date(thisDate.getFullYear() + 1, 0, 4);
   var firstWeekStartThisYear = getFirstWeekStartDate(janFourthThisYear);
   var firstWeekStartNextYear = getFirstWeekStartDate(janFourthNextYear);
   if (compareByDay(firstWeekStartThisYear, thisDate) <= 0) {
    if (compareByDay(firstWeekStartNextYear, thisDate) <= 0) {
     return thisDate.getFullYear() + 1;
    } else {
     return thisDate.getFullYear();
    }
   } else {
    return thisDate.getFullYear() - 1;
   }
  }
  var EXPANSION_RULES_2 = {
   "%a": function(date) {
    return WEEKDAYS[date.tm_wday].substring(0, 3);
   },
   "%A": function(date) {
    return WEEKDAYS[date.tm_wday];
   },
   "%b": function(date) {
    return MONTHS[date.tm_mon].substring(0, 3);
   },
   "%B": function(date) {
    return MONTHS[date.tm_mon];
   },
   "%C": function(date) {
    var year = date.tm_year + 1900;
    return leadingNulls(year / 100 | 0, 2);
   },
   "%d": function(date) {
    return leadingNulls(date.tm_mday, 2);
   },
   "%e": function(date) {
    return leadingSomething(date.tm_mday, 2, " ");
   },
   "%g": function(date) {
    return getWeekBasedYear(date).toString().substring(2);
   },
   "%G": function(date) {
    return getWeekBasedYear(date);
   },
   "%H": function(date) {
    return leadingNulls(date.tm_hour, 2);
   },
   "%I": function(date) {
    var twelveHour = date.tm_hour;
    if (twelveHour == 0) twelveHour = 12; else if (twelveHour > 12) twelveHour -= 12;
    return leadingNulls(twelveHour, 2);
   },
   "%j": function(date) {
    return leadingNulls(date.tm_mday + __arraySum(__isLeapYear(date.tm_year + 1900) ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR, date.tm_mon - 1), 3);
   },
   "%m": function(date) {
    return leadingNulls(date.tm_mon + 1, 2);
   },
   "%M": function(date) {
    return leadingNulls(date.tm_min, 2);
   },
   "%n": function() {
    return "\n";
   },
   "%p": function(date) {
    if (date.tm_hour >= 0 && date.tm_hour < 12) {
     return "AM";
    } else {
     return "PM";
    }
   },
   "%S": function(date) {
    return leadingNulls(date.tm_sec, 2);
   },
   "%t": function() {
    return "\t";
   },
   "%u": function(date) {
    return date.tm_wday || 7;
   },
   "%U": function(date) {
    var janFirst = new Date(date.tm_year + 1900, 0, 1);
    var firstSunday = janFirst.getDay() === 0 ? janFirst : __addDays(janFirst, 7 - janFirst.getDay());
    var endDate = new Date(date.tm_year + 1900, date.tm_mon, date.tm_mday);
    if (compareByDay(firstSunday, endDate) < 0) {
     var februaryFirstUntilEndMonth = __arraySum(__isLeapYear(endDate.getFullYear()) ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR, endDate.getMonth() - 1) - 31;
     var firstSundayUntilEndJanuary = 31 - firstSunday.getDate();
     var days = firstSundayUntilEndJanuary + februaryFirstUntilEndMonth + endDate.getDate();
     return leadingNulls(Math.ceil(days / 7), 2);
    }
    return compareByDay(firstSunday, janFirst) === 0 ? "01" : "00";
   },
   "%V": function(date) {
    var janFourthThisYear = new Date(date.tm_year + 1900, 0, 4);
    var janFourthNextYear = new Date(date.tm_year + 1901, 0, 4);
    var firstWeekStartThisYear = getFirstWeekStartDate(janFourthThisYear);
    var firstWeekStartNextYear = getFirstWeekStartDate(janFourthNextYear);
    var endDate = __addDays(new Date(date.tm_year + 1900, 0, 1), date.tm_yday);
    if (compareByDay(endDate, firstWeekStartThisYear) < 0) {
     return "53";
    }
    if (compareByDay(firstWeekStartNextYear, endDate) <= 0) {
     return "01";
    }
    var daysDifference;
    if (firstWeekStartThisYear.getFullYear() < date.tm_year + 1900) {
     daysDifference = date.tm_yday + 32 - firstWeekStartThisYear.getDate();
    } else {
     daysDifference = date.tm_yday + 1 - firstWeekStartThisYear.getDate();
    }
    return leadingNulls(Math.ceil(daysDifference / 7), 2);
   },
   "%w": function(date) {
    return date.tm_wday;
   },
   "%W": function(date) {
    var janFirst = new Date(date.tm_year, 0, 1);
    var firstMonday = janFirst.getDay() === 1 ? janFirst : __addDays(janFirst, janFirst.getDay() === 0 ? 1 : 7 - janFirst.getDay() + 1);
    var endDate = new Date(date.tm_year + 1900, date.tm_mon, date.tm_mday);
    if (compareByDay(firstMonday, endDate) < 0) {
     var februaryFirstUntilEndMonth = __arraySum(__isLeapYear(endDate.getFullYear()) ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR, endDate.getMonth() - 1) - 31;
     var firstMondayUntilEndJanuary = 31 - firstMonday.getDate();
     var days = firstMondayUntilEndJanuary + februaryFirstUntilEndMonth + endDate.getDate();
     return leadingNulls(Math.ceil(days / 7), 2);
    }
    return compareByDay(firstMonday, janFirst) === 0 ? "01" : "00";
   },
   "%y": function(date) {
    return (date.tm_year + 1900).toString().substring(2);
   },
   "%Y": function(date) {
    return date.tm_year + 1900;
   },
   "%z": function(date) {
    var off = date.tm_gmtoff;
    var ahead = off >= 0;
    off = Math.abs(off) / 60;
    off = off / 60 * 100 + off % 60;
    return (ahead ? "+" : "-") + String("0000" + off).slice(-4);
   },
   "%Z": function(date) {
    return date.tm_zone;
   },
   "%%": function() {
    return "%";
   }
  };
  for (var rule in EXPANSION_RULES_2) {
   if (pattern.indexOf(rule) >= 0) {
    pattern = pattern.replace(new RegExp(rule, "g"), EXPANSION_RULES_2[rule](date));
   }
  }
  var bytes = intArrayFromString(pattern, false);
  if (bytes.length > maxsize) {
   return 0;
  }
  writeArrayToMemory(bytes, s);
  return bytes.length - 1;
 }
 function _time(ptr) {
  var ret = Date.now() / 1e3 | 0;
  if (ptr) {
   GROWABLE_HEAP_I32()[ptr >> 2] = ret;
  }
  return ret;
 }
 if (!ENVIRONMENT_IS_PTHREAD) PThread.initMainThreadBlock(); else PThread.initWorker();
 var FSNode = function(parent, name, mode, rdev) {
  if (!parent) {
   parent = this;
  }
  this.parent = parent;
  this.mount = parent.mount;
  this.mounted = null;
  this.id = FS.nextInode++;
  this.name = name;
  this.mode = mode;
  this.node_ops = {};
  this.stream_ops = {};
  this.rdev = rdev;
 };
 var readMode = 292 | 73;
 var writeMode = 146;
 Object.defineProperties(FSNode.prototype, {
  read: {
   get: function() {
    return (this.mode & readMode) === readMode;
   },
   set: function(val) {
    val ? this.mode |= readMode : this.mode &= ~readMode;
   }
  },
  write: {
   get: function() {
    return (this.mode & writeMode) === writeMode;
   },
   set: function(val) {
    val ? this.mode |= writeMode : this.mode &= ~writeMode;
   }
  },
  isFolder: {
   get: function() {
    return FS.isDir(this.mode);
   }
  },
  isDevice: {
   get: function() {
    return FS.isChrdev(this.mode);
   }
  }
 });
 FS.FSNode = FSNode;
 FS.staticInit();
 var GLctx;
 var proxiedFunctionTable = [ null, ___sys__newselect, ___sys_access, ___sys_fcntl64, ___sys_fstat64, ___sys_getdents64, ___sys_getrusage, ___sys_ioctl, ___sys_lstat64, ___sys_mkdir, ___sys_mmap2, ___sys_munmap, ___sys_open, ___sys_poll, ___sys_prlimit64, ___sys_read, ___sys_rename, ___sys_rmdir, ___sys_socketcall, ___sys_stat64, ___sys_unlink, _emscripten_set_canvas_element_size_main_thread, _fd_close, _fd_fdstat_get, _fd_read, _fd_seek, _fd_write, _getaddrinfo, _tzset ];
 var ASSERTIONS = true;
 function intArrayFromString(stringy, dontAddNull, length) {
  var len = length > 0 ? length : lengthBytesUTF8(stringy) + 1;
  var u8array = new Array(len);
  var numBytesWritten = stringToUTF8Array(stringy, u8array, 0, u8array.length);
  if (dontAddNull) u8array.length = numBytesWritten;
  return u8array;
 }
 function intArrayToString(array) {
  var ret = [];
  for (var i = 0; i < array.length; i++) {
   var chr = array[i];
   if (chr > 255) {
    if (ASSERTIONS) {
     assert(false, "Character code " + chr + " (" + String.fromCharCode(chr) + ")  at offset " + i + " not in 0x00-0xFF.");
    }
    chr &= 255;
   }
   ret.push(String.fromCharCode(chr));
  }
  return ret.join("");
 }
 var asmGlobalArg = {};
 var asmLibraryArg = {
  "__assert_fail": ___assert_fail,
  "__clock_gettime": ___clock_gettime,
  "__handle_stack_overflow": ___handle_stack_overflow,
  "__sys__newselect": ___sys__newselect,
  "__sys_access": ___sys_access,
  "__sys_fcntl64": ___sys_fcntl64,
  "__sys_fstat64": ___sys_fstat64,
  "__sys_getdents64": ___sys_getdents64,
  "__sys_getrusage": ___sys_getrusage,
  "__sys_ioctl": ___sys_ioctl,
  "__sys_lstat64": ___sys_lstat64,
  "__sys_mkdir": ___sys_mkdir,
  "__sys_mmap2": ___sys_mmap2,
  "__sys_munmap": ___sys_munmap,
  "__sys_open": ___sys_open,
  "__sys_poll": ___sys_poll,
  "__sys_prlimit64": ___sys_prlimit64,
  "__sys_read": ___sys_read,
  "__sys_rename": ___sys_rename,
  "__sys_rmdir": ___sys_rmdir,
  "__sys_setrlimit": ___sys_setrlimit,
  "__sys_socketcall": ___sys_socketcall,
  "__sys_stat64": ___sys_stat64,
  "__sys_uname": ___sys_uname,
  "__sys_unlink": ___sys_unlink,
  "_emscripten_notify_thread_queue": __emscripten_notify_thread_queue,
  "abort": _abort,
  "clock": _clock,
  "clock_gettime": _clock_gettime,
  "emscripten_asm_const_iii": _emscripten_asm_const_iii,
  "emscripten_conditional_set_current_thread_status": _emscripten_conditional_set_current_thread_status,
  "emscripten_futex_wait": _emscripten_futex_wait,
  "emscripten_futex_wake": _emscripten_futex_wake,
  "emscripten_get_now": _emscripten_get_now,
  "emscripten_get_sbrk_ptr": _emscripten_get_sbrk_ptr,
  "emscripten_is_main_browser_thread": _emscripten_is_main_browser_thread,
  "emscripten_is_main_runtime_thread": _emscripten_is_main_runtime_thread,
  "emscripten_memcpy_big": _emscripten_memcpy_big,
  "emscripten_receive_on_main_thread_js": _emscripten_receive_on_main_thread_js,
  "emscripten_resize_heap": _emscripten_resize_heap,
  "emscripten_set_canvas_element_size": _emscripten_set_canvas_element_size,
  "emscripten_set_current_thread_status": _emscripten_set_current_thread_status,
  "emscripten_webgl_create_context": _emscripten_webgl_create_context,
  "environ_get": _environ_get,
  "environ_sizes_get": _environ_sizes_get,
  "exit": _exit,
  "fd_close": _fd_close,
  "fd_fdstat_get": _fd_fdstat_get,
  "fd_read": _fd_read,
  "fd_seek": _fd_seek,
  "fd_write": _fd_write,
  "gai_strerror": _gai_strerror,
  "getaddrinfo": _getaddrinfo,
  "getnameinfo": _getnameinfo,
  "gettimeofday": _gettimeofday,
  "gmtime": _gmtime,
  "gmtime_r": _gmtime_r,
  "initPthreadsJS": initPthreadsJS,
  "localtime": _localtime,
  "localtime_r": _localtime_r,
  "memory": wasmMemory,
  "mktime": _mktime,
  "pthread_cleanup_push": _pthread_cleanup_push,
  "pthread_create": _pthread_create,
  "pthread_self": _pthread_self,
  "round": _round,
  "roundf": _roundf,
  "setTempRet0": _setTempRet0,
  "signal": _signal,
  "strftime": _strftime,
  "table": wasmTable,
  "time": _time
 };
 var asm = createWasm();
 var ___wasm_call_ctors = Module["___wasm_call_ctors"] = createExportWrapper("__wasm_call_ctors");
 var ___errno_location = Module["___errno_location"] = createExportWrapper("__errno_location");
 var _fflush = Module["_fflush"] = createExportWrapper("fflush");
 var _main = Module["_main"] = createExportWrapper("main");
 var _ntohs = Module["_ntohs"] = createExportWrapper("ntohs");
 var _htons = Module["_htons"] = createExportWrapper("htons");
 var _free = Module["_free"] = createExportWrapper("free");
 var _malloc = Module["_malloc"] = createExportWrapper("malloc");
 var _emscripten_get_global_libc = Module["_emscripten_get_global_libc"] = createExportWrapper("emscripten_get_global_libc");
 var ___em_js__initPthreadsJS = Module["___em_js__initPthreadsJS"] = createExportWrapper("__em_js__initPthreadsJS");
 var ___emscripten_pthread_data_constructor = Module["___emscripten_pthread_data_constructor"] = createExportWrapper("__emscripten_pthread_data_constructor");
 var _htonl = Module["_htonl"] = createExportWrapper("htonl");
 var _memset = Module["_memset"] = createExportWrapper("memset");
 var __get_tzname = Module["__get_tzname"] = createExportWrapper("_get_tzname");
 var __get_daylight = Module["__get_daylight"] = createExportWrapper("_get_daylight");
 var __get_timezone = Module["__get_timezone"] = createExportWrapper("_get_timezone");
 var stackSave = Module["stackSave"] = createExportWrapper("stackSave");
 var stackRestore = Module["stackRestore"] = createExportWrapper("stackRestore");
 var stackAlloc = Module["stackAlloc"] = createExportWrapper("stackAlloc");
 var _memalign = Module["_memalign"] = createExportWrapper("memalign");
 var ___pthread_tsd_run_dtors = Module["___pthread_tsd_run_dtors"] = createExportWrapper("__pthread_tsd_run_dtors");
 var _emscripten_main_thread_process_queued_calls = Module["_emscripten_main_thread_process_queued_calls"] = createExportWrapper("emscripten_main_thread_process_queued_calls");
 var _emscripten_current_thread_process_queued_calls = Module["_emscripten_current_thread_process_queued_calls"] = createExportWrapper("emscripten_current_thread_process_queued_calls");
 var _emscripten_register_main_browser_thread_id = Module["_emscripten_register_main_browser_thread_id"] = createExportWrapper("emscripten_register_main_browser_thread_id");
 var _emscripten_main_browser_thread_id = Module["_emscripten_main_browser_thread_id"] = createExportWrapper("emscripten_main_browser_thread_id");
 var _do_emscripten_dispatch_to_thread = Module["_do_emscripten_dispatch_to_thread"] = createExportWrapper("do_emscripten_dispatch_to_thread");
 var _emscripten_async_run_in_main_thread = Module["_emscripten_async_run_in_main_thread"] = createExportWrapper("emscripten_async_run_in_main_thread");
 var _emscripten_sync_run_in_main_thread = Module["_emscripten_sync_run_in_main_thread"] = createExportWrapper("emscripten_sync_run_in_main_thread");
 var _emscripten_sync_run_in_main_thread_0 = Module["_emscripten_sync_run_in_main_thread_0"] = createExportWrapper("emscripten_sync_run_in_main_thread_0");
 var _emscripten_sync_run_in_main_thread_1 = Module["_emscripten_sync_run_in_main_thread_1"] = createExportWrapper("emscripten_sync_run_in_main_thread_1");
 var _emscripten_sync_run_in_main_thread_2 = Module["_emscripten_sync_run_in_main_thread_2"] = createExportWrapper("emscripten_sync_run_in_main_thread_2");
 var _emscripten_sync_run_in_main_thread_xprintf_varargs = Module["_emscripten_sync_run_in_main_thread_xprintf_varargs"] = createExportWrapper("emscripten_sync_run_in_main_thread_xprintf_varargs");
 var _emscripten_sync_run_in_main_thread_3 = Module["_emscripten_sync_run_in_main_thread_3"] = createExportWrapper("emscripten_sync_run_in_main_thread_3");
 var _emscripten_sync_run_in_main_thread_4 = Module["_emscripten_sync_run_in_main_thread_4"] = createExportWrapper("emscripten_sync_run_in_main_thread_4");
 var _emscripten_sync_run_in_main_thread_5 = Module["_emscripten_sync_run_in_main_thread_5"] = createExportWrapper("emscripten_sync_run_in_main_thread_5");
 var _emscripten_sync_run_in_main_thread_6 = Module["_emscripten_sync_run_in_main_thread_6"] = createExportWrapper("emscripten_sync_run_in_main_thread_6");
 var _emscripten_sync_run_in_main_thread_7 = Module["_emscripten_sync_run_in_main_thread_7"] = createExportWrapper("emscripten_sync_run_in_main_thread_7");
 var _emscripten_run_in_main_runtime_thread_js = Module["_emscripten_run_in_main_runtime_thread_js"] = createExportWrapper("emscripten_run_in_main_runtime_thread_js");
 var __emscripten_call_on_thread = Module["__emscripten_call_on_thread"] = createExportWrapper("_emscripten_call_on_thread");
 var _emscripten_tls_init = Module["_emscripten_tls_init"] = createExportWrapper("emscripten_tls_init");
 var ___set_stack_limit = Module["___set_stack_limit"] = createExportWrapper("__set_stack_limit");
 var __growWasmMemory = Module["__growWasmMemory"] = createExportWrapper("__growWasmMemory");
 var dynCall_iii = Module["dynCall_iii"] = createExportWrapper("dynCall_iii");
 var dynCall_iiii = Module["dynCall_iiii"] = createExportWrapper("dynCall_iiii");
 var dynCall_ii = Module["dynCall_ii"] = createExportWrapper("dynCall_ii");
 var dynCall_viiii = Module["dynCall_viiii"] = createExportWrapper("dynCall_viiii");
 var dynCall_vi = Module["dynCall_vi"] = createExportWrapper("dynCall_vi");
 var dynCall_iiiiiii = Module["dynCall_iiiiiii"] = createExportWrapper("dynCall_iiiiiii");
 var dynCall_viiiif = Module["dynCall_viiiif"] = createExportWrapper("dynCall_viiiif");
 var dynCall_viiiiiii = Module["dynCall_viiiiiii"] = createExportWrapper("dynCall_viiiiiii");
 var dynCall_viiiiijji = Module["dynCall_viiiiijji"] = createExportWrapper("dynCall_viiiiijji");
 var dynCall_iiiii = Module["dynCall_iiiii"] = createExportWrapper("dynCall_iiiii");
 var dynCall_iiidiiiiii = Module["dynCall_iiidiiiiii"] = createExportWrapper("dynCall_iiidiiiiii");
 var dynCall_viiiii = Module["dynCall_viiiii"] = createExportWrapper("dynCall_viiiii");
 var dynCall_viiiiii = Module["dynCall_viiiiii"] = createExportWrapper("dynCall_viiiiii");
 var dynCall_did = Module["dynCall_did"] = createExportWrapper("dynCall_did");
 var dynCall_didd = Module["dynCall_didd"] = createExportWrapper("dynCall_didd");
 var dynCall_viiiiiiiidddddii = Module["dynCall_viiiiiiiidddddii"] = createExportWrapper("dynCall_viiiiiiiidddddii");
 var dynCall_fiii = Module["dynCall_fiii"] = createExportWrapper("dynCall_fiii");
 var dynCall_viiiji = Module["dynCall_viiiji"] = createExportWrapper("dynCall_viiiji");
 var dynCall_vid = Module["dynCall_vid"] = createExportWrapper("dynCall_vid");
 var dynCall_viffffffffffffffffi = Module["dynCall_viffffffffffffffffi"] = createExportWrapper("dynCall_viffffffffffffffffi");
 var dynCall_viffffffi = Module["dynCall_viffffffi"] = createExportWrapper("dynCall_viffffffi");
 var dynCall_viffffffffi = Module["dynCall_viffffffffi"] = createExportWrapper("dynCall_viffffffffi");
 var dynCall_vifffffffi = Module["dynCall_vifffffffi"] = createExportWrapper("dynCall_vifffffffi");
 var dynCall_viffffffffffffffi = Module["dynCall_viffffffffffffffi"] = createExportWrapper("dynCall_viffffffffffffffi");
 var dynCall_ddid = Module["dynCall_ddid"] = createExportWrapper("dynCall_ddid");
 var dynCall_viii = Module["dynCall_viii"] = createExportWrapper("dynCall_viii");
 var dynCall_viiiiif = Module["dynCall_viiiiif"] = createExportWrapper("dynCall_viiiiif");
 var dynCall_viiif = Module["dynCall_viiif"] = createExportWrapper("dynCall_viiif");
 var dynCall_iiiiii = Module["dynCall_iiiiii"] = createExportWrapper("dynCall_iiiiii");
 var dynCall_viiiiiiii = Module["dynCall_viiiiiiii"] = createExportWrapper("dynCall_viiiiiiii");
 var dynCall_viiiiiiiiiii = Module["dynCall_viiiiiiiiiii"] = createExportWrapper("dynCall_viiiiiiiiiii");
 var dynCall_viiiiiiiii = Module["dynCall_viiiiiiiii"] = createExportWrapper("dynCall_viiiiiiiii");
 var dynCall_diiiiii = Module["dynCall_diiiiii"] = createExportWrapper("dynCall_diiiiii");
 var dynCall_viiiiiiiiiiii = Module["dynCall_viiiiiiiiiiii"] = createExportWrapper("dynCall_viiiiiiiiiiii");
 var dynCall_viiiiiiiiiiiiiii = Module["dynCall_viiiiiiiiiiiiiii"] = createExportWrapper("dynCall_viiiiiiiiiiiiiii");
 var dynCall_viiffiiiiii = Module["dynCall_viiffiiiiii"] = createExportWrapper("dynCall_viiffiiiiii");
 var dynCall_vii = Module["dynCall_vii"] = createExportWrapper("dynCall_vii");
 var dynCall_iiiiiiiif = Module["dynCall_iiiiiiiif"] = createExportWrapper("dynCall_iiiiiiiif");
 var dynCall_fii = Module["dynCall_fii"] = createExportWrapper("dynCall_fii");
 var dynCall_iffiiiii = Module["dynCall_iffiiiii"] = createExportWrapper("dynCall_iffiiiii");
 var dynCall_iiiiiiiiiiii = Module["dynCall_iiiiiiiiiiii"] = createExportWrapper("dynCall_iiiiiiiiiiii");
 var dynCall_viiifi = Module["dynCall_viiifi"] = createExportWrapper("dynCall_viiifi");
 var dynCall_iiiiiiii = Module["dynCall_iiiiiiii"] = createExportWrapper("dynCall_iiiiiiii");
 var dynCall_viiiiff = Module["dynCall_viiiiff"] = createExportWrapper("dynCall_viiiiff");
 var dynCall_viiiiiiiiii = Module["dynCall_viiiiiiiiii"] = createExportWrapper("dynCall_viiiiiiiiii");
 var dynCall_jiiiii = Module["dynCall_jiiiii"] = createExportWrapper("dynCall_jiiiii");
 var dynCall_viiiiiiiiiiiiii = Module["dynCall_viiiiiiiiiiiiii"] = createExportWrapper("dynCall_viiiiiiiiiiiiii");
 var dynCall_jiii = Module["dynCall_jiii"] = createExportWrapper("dynCall_jiii");
 var dynCall_iiiiiiiiii = Module["dynCall_iiiiiiiiii"] = createExportWrapper("dynCall_iiiiiiiiii");
 var dynCall_iiiiiiiii = Module["dynCall_iiiiiiiii"] = createExportWrapper("dynCall_iiiiiiiii");
 var dynCall_diii = Module["dynCall_diii"] = createExportWrapper("dynCall_diii");
 var dynCall_diiiiiiiii = Module["dynCall_diiiiiiiii"] = createExportWrapper("dynCall_diiiiiiiii");
 var dynCall_vffiiii = Module["dynCall_vffiiii"] = createExportWrapper("dynCall_vffiiii");
 var dynCall_jiiiiii = Module["dynCall_jiiiiii"] = createExportWrapper("dynCall_jiiiiii");
 var dynCall_viiiffii = Module["dynCall_viiiffii"] = createExportWrapper("dynCall_viiiffii");
 var dynCall_viiiiffii = Module["dynCall_viiiiffii"] = createExportWrapper("dynCall_viiiiffii");
 var dynCall_viiiifiii = Module["dynCall_viiiifiii"] = createExportWrapper("dynCall_viiiifiii");
 var dynCall_iiiji = Module["dynCall_iiiji"] = createExportWrapper("dynCall_iiiji");
 var dynCall_iiijjji = Module["dynCall_iiijjji"] = createExportWrapper("dynCall_iiijjji");
 var dynCall_jiiij = Module["dynCall_jiiij"] = createExportWrapper("dynCall_jiiij");
 var dynCall_jiji = Module["dynCall_jiji"] = createExportWrapper("dynCall_jiji");
 var dynCall_iiiiij = Module["dynCall_iiiiij"] = createExportWrapper("dynCall_iiiiij");
 var dynCall_iiiiiij = Module["dynCall_iiiiiij"] = createExportWrapper("dynCall_iiiiiij");
 var dynCall_jiiji = Module["dynCall_jiiji"] = createExportWrapper("dynCall_jiiji");
 var dynCall_ijiii = Module["dynCall_ijiii"] = createExportWrapper("dynCall_ijiii");
 var dynCall_fiiiiiiiiffii = Module["dynCall_fiiiiiiiiffii"] = createExportWrapper("dynCall_fiiiiiiiiffii");
 var dynCall_viiiiiiifi = Module["dynCall_viiiiiiifi"] = createExportWrapper("dynCall_viiiiiiifi");
 var dynCall_viiiiiiff = Module["dynCall_viiiiiiff"] = createExportWrapper("dynCall_viiiiiiff");
 var dynCall_viiiiiifi = Module["dynCall_viiiiiifi"] = createExportWrapper("dynCall_viiiiiifi");
 var dynCall_viiiifii = Module["dynCall_viiiifii"] = createExportWrapper("dynCall_viiiifii");
 var dynCall_viiiffi = Module["dynCall_viiiffi"] = createExportWrapper("dynCall_viiiffi");
 var dynCall_viiiff = Module["dynCall_viiiff"] = createExportWrapper("dynCall_viiiff");
 var dynCall_viiiffiii = Module["dynCall_viiiffiii"] = createExportWrapper("dynCall_viiiffiii");
 var dynCall_viiiiiiiiiif = Module["dynCall_viiiiiiiiiif"] = createExportWrapper("dynCall_viiiiiiiiiif");
 var dynCall_v = Module["dynCall_v"] = createExportWrapper("dynCall_v");
 var dynCall_viifi = Module["dynCall_viifi"] = createExportWrapper("dynCall_viifi");
 var dynCall_viiiiifi = Module["dynCall_viiiiifi"] = createExportWrapper("dynCall_viiiiifi");
 var dynCall_fiiii = Module["dynCall_fiiii"] = createExportWrapper("dynCall_fiiii");
 var dynCall_iiiiiiiiiiiiiifii = Module["dynCall_iiiiiiiiiiiiiifii"] = createExportWrapper("dynCall_iiiiiiiiiiiiiifii");
 var dynCall_fiifi = Module["dynCall_fiifi"] = createExportWrapper("dynCall_fiifi");
 var dynCall_viiiiiiif = Module["dynCall_viiiiiiif"] = createExportWrapper("dynCall_viiiiiiif");
 var dynCall_viiijj = Module["dynCall_viiijj"] = createExportWrapper("dynCall_viiijj");
 var dynCall_iiiiiiidiiddii = Module["dynCall_iiiiiiidiiddii"] = createExportWrapper("dynCall_iiiiiiidiiddii");
 var dynCall_jij = Module["dynCall_jij"] = createExportWrapper("dynCall_jij");
 var dynCall_jii = Module["dynCall_jii"] = createExportWrapper("dynCall_jii");
 var dynCall_dd = Module["dynCall_dd"] = createExportWrapper("dynCall_dd");
 var dynCall_viidi = Module["dynCall_viidi"] = createExportWrapper("dynCall_viidi");
 var dynCall_iidiiii = Module["dynCall_iidiiii"] = createExportWrapper("dynCall_iidiiii");
 Module["_ff_h264_cabac_tables"] = 1565541;
 if (!Object.getOwnPropertyDescriptor(Module, "intArrayFromString")) Module["intArrayFromString"] = function() {
  abort("'intArrayFromString' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "intArrayToString")) Module["intArrayToString"] = function() {
  abort("'intArrayToString' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "ccall")) Module["ccall"] = function() {
  abort("'ccall' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "cwrap")) Module["cwrap"] = function() {
  abort("'cwrap' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "setValue")) Module["setValue"] = function() {
  abort("'setValue' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "getValue")) Module["getValue"] = function() {
  abort("'getValue' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "allocate")) Module["allocate"] = function() {
  abort("'allocate' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "getMemory")) Module["getMemory"] = function() {
  abort("'getMemory' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "UTF8ArrayToString")) Module["UTF8ArrayToString"] = function() {
  abort("'UTF8ArrayToString' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "UTF8ToString")) Module["UTF8ToString"] = function() {
  abort("'UTF8ToString' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "stringToUTF8Array")) Module["stringToUTF8Array"] = function() {
  abort("'stringToUTF8Array' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "stringToUTF8")) Module["stringToUTF8"] = function() {
  abort("'stringToUTF8' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "lengthBytesUTF8")) Module["lengthBytesUTF8"] = function() {
  abort("'lengthBytesUTF8' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "stackTrace")) Module["stackTrace"] = function() {
  abort("'stackTrace' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "addOnPreRun")) Module["addOnPreRun"] = function() {
  abort("'addOnPreRun' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "addOnInit")) Module["addOnInit"] = function() {
  abort("'addOnInit' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "addOnPreMain")) Module["addOnPreMain"] = function() {
  abort("'addOnPreMain' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "addOnExit")) Module["addOnExit"] = function() {
  abort("'addOnExit' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "addOnPostRun")) Module["addOnPostRun"] = function() {
  abort("'addOnPostRun' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "writeStringToMemory")) Module["writeStringToMemory"] = function() {
  abort("'writeStringToMemory' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "writeArrayToMemory")) Module["writeArrayToMemory"] = function() {
  abort("'writeArrayToMemory' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "writeAsciiToMemory")) Module["writeAsciiToMemory"] = function() {
  abort("'writeAsciiToMemory' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "addRunDependency")) Module["addRunDependency"] = function() {
  abort("'addRunDependency' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "removeRunDependency")) Module["removeRunDependency"] = function() {
  abort("'removeRunDependency' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "FS_createFolder")) Module["FS_createFolder"] = function() {
  abort("'FS_createFolder' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "FS_createPath")) Module["FS_createPath"] = function() {
  abort("'FS_createPath' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "FS_createDataFile")) Module["FS_createDataFile"] = function() {
  abort("'FS_createDataFile' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "FS_createPreloadedFile")) Module["FS_createPreloadedFile"] = function() {
  abort("'FS_createPreloadedFile' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "FS_createLazyFile")) Module["FS_createLazyFile"] = function() {
  abort("'FS_createLazyFile' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "FS_createLink")) Module["FS_createLink"] = function() {
  abort("'FS_createLink' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "FS_createDevice")) Module["FS_createDevice"] = function() {
  abort("'FS_createDevice' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "FS_unlink")) Module["FS_unlink"] = function() {
  abort("'FS_unlink' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "dynamicAlloc")) Module["dynamicAlloc"] = function() {
  abort("'dynamicAlloc' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "loadDynamicLibrary")) Module["loadDynamicLibrary"] = function() {
  abort("'loadDynamicLibrary' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "loadWebAssemblyModule")) Module["loadWebAssemblyModule"] = function() {
  abort("'loadWebAssemblyModule' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "getLEB")) Module["getLEB"] = function() {
  abort("'getLEB' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "getFunctionTables")) Module["getFunctionTables"] = function() {
  abort("'getFunctionTables' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "alignFunctionTables")) Module["alignFunctionTables"] = function() {
  abort("'alignFunctionTables' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "registerFunctions")) Module["registerFunctions"] = function() {
  abort("'registerFunctions' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "addFunction")) Module["addFunction"] = function() {
  abort("'addFunction' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "removeFunction")) Module["removeFunction"] = function() {
  abort("'removeFunction' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "getFuncWrapper")) Module["getFuncWrapper"] = function() {
  abort("'getFuncWrapper' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "prettyPrint")) Module["prettyPrint"] = function() {
  abort("'prettyPrint' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "makeBigInt")) Module["makeBigInt"] = function() {
  abort("'makeBigInt' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "dynCall")) Module["dynCall"] = function() {
  abort("'dynCall' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "getCompilerSetting")) Module["getCompilerSetting"] = function() {
  abort("'getCompilerSetting' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "print")) Module["print"] = function() {
  abort("'print' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "printErr")) Module["printErr"] = function() {
  abort("'printErr' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "getTempRet0")) Module["getTempRet0"] = function() {
  abort("'getTempRet0' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "setTempRet0")) Module["setTempRet0"] = function() {
  abort("'setTempRet0' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "callMain")) Module["callMain"] = function() {
  abort("'callMain' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "abort")) Module["abort"] = function() {
  abort("'abort' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "stringToNewUTF8")) Module["stringToNewUTF8"] = function() {
  abort("'stringToNewUTF8' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "emscripten_realloc_buffer")) Module["emscripten_realloc_buffer"] = function() {
  abort("'emscripten_realloc_buffer' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "ENV")) Module["ENV"] = function() {
  abort("'ENV' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "ERRNO_CODES")) Module["ERRNO_CODES"] = function() {
  abort("'ERRNO_CODES' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "ERRNO_MESSAGES")) Module["ERRNO_MESSAGES"] = function() {
  abort("'ERRNO_MESSAGES' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "setErrNo")) Module["setErrNo"] = function() {
  abort("'setErrNo' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "DNS")) Module["DNS"] = function() {
  abort("'DNS' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "GAI_ERRNO_MESSAGES")) Module["GAI_ERRNO_MESSAGES"] = function() {
  abort("'GAI_ERRNO_MESSAGES' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "Protocols")) Module["Protocols"] = function() {
  abort("'Protocols' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "Sockets")) Module["Sockets"] = function() {
  abort("'Sockets' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "UNWIND_CACHE")) Module["UNWIND_CACHE"] = function() {
  abort("'UNWIND_CACHE' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "readAsmConstArgs")) Module["readAsmConstArgs"] = function() {
  abort("'readAsmConstArgs' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "jstoi_q")) Module["jstoi_q"] = function() {
  abort("'jstoi_q' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "jstoi_s")) Module["jstoi_s"] = function() {
  abort("'jstoi_s' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "abortStackOverflow")) Module["abortStackOverflow"] = function() {
  abort("'abortStackOverflow' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "reallyNegative")) Module["reallyNegative"] = function() {
  abort("'reallyNegative' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "formatString")) Module["formatString"] = function() {
  abort("'formatString' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "PATH")) Module["PATH"] = function() {
  abort("'PATH' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "PATH_FS")) Module["PATH_FS"] = function() {
  abort("'PATH_FS' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "SYSCALLS")) Module["SYSCALLS"] = function() {
  abort("'SYSCALLS' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "syscallMmap2")) Module["syscallMmap2"] = function() {
  abort("'syscallMmap2' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "syscallMunmap")) Module["syscallMunmap"] = function() {
  abort("'syscallMunmap' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "JSEvents")) Module["JSEvents"] = function() {
  abort("'JSEvents' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "specialHTMLTargets")) Module["specialHTMLTargets"] = function() {
  abort("'specialHTMLTargets' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "demangle")) Module["demangle"] = function() {
  abort("'demangle' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "demangleAll")) Module["demangleAll"] = function() {
  abort("'demangleAll' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "jsStackTrace")) Module["jsStackTrace"] = function() {
  abort("'jsStackTrace' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "stackTrace")) Module["stackTrace"] = function() {
  abort("'stackTrace' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "getEnvStrings")) Module["getEnvStrings"] = function() {
  abort("'getEnvStrings' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "checkWasiClock")) Module["checkWasiClock"] = function() {
  abort("'checkWasiClock' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "writeI53ToI64")) Module["writeI53ToI64"] = function() {
  abort("'writeI53ToI64' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "writeI53ToI64Clamped")) Module["writeI53ToI64Clamped"] = function() {
  abort("'writeI53ToI64Clamped' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "writeI53ToI64Signaling")) Module["writeI53ToI64Signaling"] = function() {
  abort("'writeI53ToI64Signaling' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "writeI53ToU64Clamped")) Module["writeI53ToU64Clamped"] = function() {
  abort("'writeI53ToU64Clamped' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "writeI53ToU64Signaling")) Module["writeI53ToU64Signaling"] = function() {
  abort("'writeI53ToU64Signaling' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "readI53FromI64")) Module["readI53FromI64"] = function() {
  abort("'readI53FromI64' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "readI53FromU64")) Module["readI53FromU64"] = function() {
  abort("'readI53FromU64' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "convertI32PairToI53")) Module["convertI32PairToI53"] = function() {
  abort("'convertI32PairToI53' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "convertU32PairToI53")) Module["convertU32PairToI53"] = function() {
  abort("'convertU32PairToI53' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "Browser")) Module["Browser"] = function() {
  abort("'Browser' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "GL")) Module["GL"] = function() {
  abort("'GL' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "emscriptenWebGLGet")) Module["emscriptenWebGLGet"] = function() {
  abort("'emscriptenWebGLGet' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "emscriptenWebGLGetTexPixelData")) Module["emscriptenWebGLGetTexPixelData"] = function() {
  abort("'emscriptenWebGLGetTexPixelData' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "emscriptenWebGLGetUniform")) Module["emscriptenWebGLGetUniform"] = function() {
  abort("'emscriptenWebGLGetUniform' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "emscriptenWebGLGetVertexAttrib")) Module["emscriptenWebGLGetVertexAttrib"] = function() {
  abort("'emscriptenWebGLGetVertexAttrib' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "FS")) Module["FS"] = function() {
  abort("'FS' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "MEMFS")) Module["MEMFS"] = function() {
  abort("'MEMFS' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "TTY")) Module["TTY"] = function() {
  abort("'TTY' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "PIPEFS")) Module["PIPEFS"] = function() {
  abort("'PIPEFS' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "SOCKFS")) Module["SOCKFS"] = function() {
  abort("'SOCKFS' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "AL")) Module["AL"] = function() {
  abort("'AL' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "SDL_unicode")) Module["SDL_unicode"] = function() {
  abort("'SDL_unicode' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "SDL_ttfContext")) Module["SDL_ttfContext"] = function() {
  abort("'SDL_ttfContext' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "SDL_audio")) Module["SDL_audio"] = function() {
  abort("'SDL_audio' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "SDL")) Module["SDL"] = function() {
  abort("'SDL' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "SDL_gfx")) Module["SDL_gfx"] = function() {
  abort("'SDL_gfx' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "GLUT")) Module["GLUT"] = function() {
  abort("'GLUT' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "EGL")) Module["EGL"] = function() {
  abort("'EGL' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "GLFW_Window")) Module["GLFW_Window"] = function() {
  abort("'GLFW_Window' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "GLFW")) Module["GLFW"] = function() {
  abort("'GLFW' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "GLEW")) Module["GLEW"] = function() {
  abort("'GLEW' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "IDBStore")) Module["IDBStore"] = function() {
  abort("'IDBStore' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "runAndAbortIfError")) Module["runAndAbortIfError"] = function() {
  abort("'runAndAbortIfError' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 Module["PThread"] = PThread;
 if (!Object.getOwnPropertyDescriptor(Module, "killThread")) Module["killThread"] = function() {
  abort("'killThread' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "cleanupThread")) Module["cleanupThread"] = function() {
  abort("'cleanupThread' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "cancelThread")) Module["cancelThread"] = function() {
  abort("'cancelThread' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "spawnThread")) Module["spawnThread"] = function() {
  abort("'spawnThread' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "registerPthreadPtr")) Module["registerPthreadPtr"] = function() {
  abort("'registerPthreadPtr' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "establishStackSpace")) Module["establishStackSpace"] = function() {
  abort("'establishStackSpace' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "getNoExitRuntime")) Module["getNoExitRuntime"] = function() {
  abort("'getNoExitRuntime' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "resetPrototype")) Module["resetPrototype"] = function() {
  abort("'resetPrototype' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "WORKERFS")) Module["WORKERFS"] = function() {
  abort("'WORKERFS' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "warnOnce")) Module["warnOnce"] = function() {
  abort("'warnOnce' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "stackSave")) Module["stackSave"] = function() {
  abort("'stackSave' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "stackRestore")) Module["stackRestore"] = function() {
  abort("'stackRestore' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "stackAlloc")) Module["stackAlloc"] = function() {
  abort("'stackAlloc' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "AsciiToString")) Module["AsciiToString"] = function() {
  abort("'AsciiToString' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "stringToAscii")) Module["stringToAscii"] = function() {
  abort("'stringToAscii' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "UTF16ToString")) Module["UTF16ToString"] = function() {
  abort("'UTF16ToString' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "stringToUTF16")) Module["stringToUTF16"] = function() {
  abort("'stringToUTF16' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "lengthBytesUTF16")) Module["lengthBytesUTF16"] = function() {
  abort("'lengthBytesUTF16' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "UTF32ToString")) Module["UTF32ToString"] = function() {
  abort("'UTF32ToString' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "stringToUTF32")) Module["stringToUTF32"] = function() {
  abort("'stringToUTF32' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "lengthBytesUTF32")) Module["lengthBytesUTF32"] = function() {
  abort("'lengthBytesUTF32' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "allocateUTF8")) Module["allocateUTF8"] = function() {
  abort("'allocateUTF8' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 if (!Object.getOwnPropertyDescriptor(Module, "allocateUTF8OnStack")) Module["allocateUTF8OnStack"] = function() {
  abort("'allocateUTF8OnStack' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
 };
 Module["writeStackCookie"] = writeStackCookie;
 Module["checkStackCookie"] = checkStackCookie;
 Module["PThread"] = PThread;
 Module["_pthread_self"] = _pthread_self;
 Module["wasmMemory"] = wasmMemory;
 Module["ExitStatus"] = ExitStatus;
 if (!Object.getOwnPropertyDescriptor(Module, "ALLOC_NORMAL")) Object.defineProperty(Module, "ALLOC_NORMAL", {
  configurable: true,
  get: function() {
   abort("'ALLOC_NORMAL' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
  }
 });
 if (!Object.getOwnPropertyDescriptor(Module, "ALLOC_STACK")) Object.defineProperty(Module, "ALLOC_STACK", {
  configurable: true,
  get: function() {
   abort("'ALLOC_STACK' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
  }
 });
 if (!Object.getOwnPropertyDescriptor(Module, "ALLOC_DYNAMIC")) Object.defineProperty(Module, "ALLOC_DYNAMIC", {
  configurable: true,
  get: function() {
   abort("'ALLOC_DYNAMIC' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
  }
 });
 if (!Object.getOwnPropertyDescriptor(Module, "ALLOC_NONE")) Object.defineProperty(Module, "ALLOC_NONE", {
  configurable: true,
  get: function() {
   abort("'ALLOC_NONE' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
  }
 });
 var calledRun;
 function ExitStatus(status) {
  this.name = "ExitStatus";
  this.message = "Program terminated with exit(" + status + ")";
  this.status = status;
 }
 var calledMain = false;
 dependenciesFulfilled = function runCaller() {
  if (!calledRun) run();
  if (!calledRun) dependenciesFulfilled = runCaller;
 };
 function callMain(args) {
  assert(runDependencies == 0, 'cannot call main when async dependencies remain! (listen on Module["onRuntimeInitialized"])');
  assert(__ATPRERUN__.length == 0, "cannot call main when preRun functions remain to be called");
  var entryFunction = Module["_main"];
  args = args || [];
  var argc = args.length + 1;
  var argv = stackAlloc((argc + 1) * 4);
  GROWABLE_HEAP_I32()[argv >> 2] = allocateUTF8OnStack(thisProgram);
  for (var i = 1; i < argc; i++) {
   GROWABLE_HEAP_I32()[(argv >> 2) + i] = allocateUTF8OnStack(args[i - 1]);
  }
  GROWABLE_HEAP_I32()[(argv >> 2) + argc] = 0;
  try {
   Module["___set_stack_limit"](STACK_MAX);
   var ret = entryFunction(argc, argv);
   exit(ret, true);
  } catch (e) {
   if (e instanceof ExitStatus) {
    return;
   } else if (e == "unwind") {
    noExitRuntime = true;
    return;
   } else {
    var toLog = e;
    if (e && typeof e === "object" && e.stack) {
     toLog = [ e, e.stack ];
    }
    err("exception thrown: " + toLog);
    quit_(1, e);
   }
  } finally {
   calledMain = true;
  }
 }
 function run(args) {
  args = args || arguments_;
  if (runDependencies > 0) {
   return;
  }
  writeStackCookie();
  preRun();
  if (runDependencies > 0) return;
  function doRun() {
   if (calledRun) return;
   calledRun = true;
   Module["calledRun"] = true;
   if (ABORT) return;
   initRuntime();
   preMain();
   if (Module["onRuntimeInitialized"]) Module["onRuntimeInitialized"]();
   if (shouldRunNow) callMain(args);
   postRun();
  }
  if (Module["setStatus"]) {
   Module["setStatus"]("Running...");
   setTimeout(function() {
    setTimeout(function() {
     Module["setStatus"]("");
    }, 1);
    doRun();
   }, 1);
  } else {
   doRun();
  }
  checkStackCookie();
 }
 Module["run"] = run;
 function checkUnflushedContent() {
  var print = out;
  var printErr = err;
  var has = false;
  out = err = function(x) {
   has = true;
  };
  try {
   var flush = Module["_fflush"];
   if (flush) flush(0);
   [ "stdout", "stderr" ].forEach(function(name) {
    var info = FS.analyzePath("/dev/" + name);
    if (!info) return;
    var stream = info.object;
    var rdev = stream.rdev;
    var tty = TTY.ttys[rdev];
    if (tty && tty.output && tty.output.length) {
     has = true;
    }
   });
  } catch (e) {}
  out = print;
  err = printErr;
  if (has) {
   warnOnce("stdio streams had content in them that was not flushed. you should set EXIT_RUNTIME to 1 (see the FAQ), or make sure to emit a newline when you printf etc.");
  }
 }
 function exit(status, implicit) {
  checkUnflushedContent();
  if (implicit && noExitRuntime && status === 0) {
   return;
  }
  if (noExitRuntime) {
   if (!implicit) {
    var msg = "program exited (with status: " + status + "), but EXIT_RUNTIME is not set, so halting execution but not exiting the runtime or preventing further async execution (build with EXIT_RUNTIME=1, if you want a true shutdown)";
    err(msg);
   }
  } else {
   PThread.terminateAllThreads();
   ABORT = true;
   EXITSTATUS = status;
   exitRuntime();
   if (Module["onExit"]) Module["onExit"](status);
  }
  quit_(status, new ExitStatus(status));
 }
 if (Module["preInit"]) {
  if (typeof Module["preInit"] == "function") Module["preInit"] = [ Module["preInit"] ];
  while (Module["preInit"].length > 0) {
   Module["preInit"].pop()();
  }
 }
 var shouldRunNow = true;
 if (Module["noInitialRun"]) shouldRunNow = false;
 if (!ENVIRONMENT_IS_PTHREAD) noExitRuntime = true;
 if (!ENVIRONMENT_IS_PTHREAD) {
  run();
 } else {}
 return Module["return"];
}

if (typeof exports !== "undefined") {
 ffmpeg_run.call(this);
}
