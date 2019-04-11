var Module
"undefined"==typeof Module&&(Module=eval("(function() { try { return Module || {} } catch(e) { return {} } })()")),Module.expectedDataFileDownloads||(Module.expectedDataFileDownloads=0,Module.finishedDataFileDownloads=0),Module.expectedDataFileDownloads++,function(){var e=function(e){function o(e,o,a,t){var n=new XMLHttpRequest
n.open("GET",e,!0),n.responseType="arraybuffer",n.onprogress=function(a){var t=e,d=o
if(a.total&&(d=a.total),a.loaded){n.addedTotal?Module.dataFileDownloads[t].loaded=a.loaded:(n.addedTotal=!0,Module.dataFileDownloads||(Module.dataFileDownloads={}),Module.dataFileDownloads[t]={loaded:a.loaded,total:d})
var l=0,r=0,i=0
for(var u in Module.dataFileDownloads){var s=Module.dataFileDownloads[u]
l+=s.total,r+=s.loaded,i++}l=Math.ceil(l*Module.expectedDataFileDownloads/i),Module.setStatus&&Module.setStatus("Downloading data... ("+r+"/"+l+")")}else Module.dataFileDownloads||Module.setStatus&&Module.setStatus("Downloading data...")},n.onerror=function(o){throw new Error("NetworkError for: "+e)},n.onload=function(e){if(!(200==n.status||304==n.status||206==n.status||0==n.status&&n.response))throw new Error(n.statusText+" : "+n.responseURL)
var o=n.response
a(o)},n.send(null)}function a(e){console.error("package error:",e)}function t(){function o(e,o){if(!e)throw o+(new Error).stack}function a(e,o,a,t){this.start=e,this.end=o,this.crunched=a,this.audio=t}function t(t){Module.finishedDataFileDownloads++,o(t,"Loading data file failed."),o(t instanceof ArrayBuffer,"bad input to processPackageData")
var n=new Uint8Array(t)
Module.SPLIT_MEMORY&&Module.printErr("warning: you should run the file packager with --no-heap-copy when SPLIT_MEMORY is used, otherwise copying into the heap may fail due to the splitting")
var d=Module.getMemory(n.length)
Module.HEAPU8.set(n,d),a.prototype.byteArray=Module.HEAPU8.subarray(d,d+n.length)
var l=e.files
for(i=0;i<l.length;++i)a.prototype.requests[l[i].filename].onload()
Module.removeRunDependency("datafile_resources/StarterResources.data")}Module.FS_createPath("/","Engine",!0,!0),Module.FS_createPath("/Engine","Build",!0,!0),Module.FS_createPath("/","StarterResources",!0,!0),Module.FS_createPath("/StarterResources","Content",!0,!0),Module.FS_createPath("/StarterResources/Content","Paks",!0,!0),a.prototype={requests:{},open:function(e,o){this.name=o,this.requests[o]=this,Module.addRunDependency("fp "+this.name)},send:function(){},onload:function(){var e=this.byteArray.subarray(this.start,this.end)
this.finish(e)},finish:function(e){var o=this
Module.FS_createDataFile(this.name,null,e,!0,!0,!0),Module.removeRunDependency("fp "+o.name),this.requests[this.name]=null}}
var n=e.files
for(i=0;i<n.length;++i)new a(n[i].start,n[i].end,n[i].crunched,n[i].audio).open("GET",n[i].filename)
Module.addRunDependency("datafile_resources/StarterResources.data"),Module.preloadResults||(Module.preloadResults={}),Module.preloadResults[d]={fromCache:!1},s?(t(s),s=null):c=t}var n
if("object"==typeof window)n=window.encodeURIComponent(window.location.pathname.toString().substring(0,window.location.pathname.toString().lastIndexOf("/"))+"/")
else{if("undefined"==typeof location)throw"using preloaded data can only be done on a web page or in a web worker"
n=encodeURIComponent(location.pathname.toString().substring(0,location.pathname.toString().lastIndexOf("/"))+"/")}var d="resources/StarterResources.data",l="resources/StarterResources.data"
"function"!=typeof Module.locateFilePackage||Module.locateFile||(Module.locateFile=Module.locateFilePackage,Module.printErr("warning: you defined Module.locateFilePackage, that has been renamed to Module.locateFile (using your locateFilePackage for now)"))
var r="function"==typeof Module.locateFile?Module.locateFile(l):(Module.filePackagePrefixURL||"")+l,u=e.remote_package_size,s=(e.package_uuid,null),c=null
o(r,u,function(e){c?(c(e),c=null):s=e},a),Module.calledRun?t():(Module.preRun||(Module.preRun=[]),Module.preRun.push(t))}
e({files:[{audio:0,start:0,crunched:0,end:52,filename:"/UE4CommandLine.txt"},{audio:0,start:52,crunched:0,end:156,filename:"/Manifest_NonUFSFiles_HTML5.txt"},{audio:0,start:156,crunched:0,end:315,filename:"/Engine/Build/Build.version"},{audio:0,start:315,crunched:0,end:26513120,filename:"/StarterResources/Content/Paks/StarterResources-HTML5.pak"}],remote_package_size:26513120,package_uuid:"aae2f96d-0c45-4d97-8096-a14c9b20babf"})}()
